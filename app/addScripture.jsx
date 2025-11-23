import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './apiConfig'; // Make sure this file exists

const ORANGE = '#FF6B00';
const GOLD = '#E18731';

// Reusable secure fetch with token + retry (same as HomeScreen)
const fetchWithToken = async (url, options = {}, retries = 2) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No authentication token');

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      if (res.status === 401 && retries > 0) {
        await AsyncStorage.removeItem('userToken');
        throw new Error('Session expired');
      }
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithToken(url, options, retries - 1);
    }
    throw error;
  }
};

export default function AddScriptureScreen() {
  const router = useRouter();
  const [scriptureName, setScriptureName] = useState('');
  const [scriptureWords, setScriptureWords] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setBackgroundImage(result.assets[0]);
    }
  };

  const uploadImageAndGetUrl = async (imageAsset) => {
    if (!imageAsset?.uri) return null;

    const formData = new FormData();
    formData.append('file', {
      uri: imageAsset.uri,
      type: imageAsset.mimeType || 'image/jpeg',
      name: imageAsset.fileName || 'scripture_image.jpg',
    });

    const uploadRes = await fetchWithToken(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (uploadRes?.success && uploadRes.data?.url) {
      return uploadRes.data.url;
    }
    throw new Error('Image upload failed');
  };

  const handleSubmit = async () => {
    if (!scriptureName.trim() || !scriptureWords.trim()) {
      Alert.alert('Missing Fields', 'Please enter both the reference and the scripture text.');
      return;
    }

    setLoading(true);

    try {
      // Get selected community
      const communityId = await AsyncStorage.getItem('selectedCommunityId');
      if (!communityId) {
        Alert.alert('Error', 'No community selected. Please select a church first.');
        return;
      }

      let photoUrl = null;
      if (backgroundImage) {
        photoUrl = await uploadImageAndGetUrl(backgroundImage);
      }

      const payload = {
        name: scriptureName.trim(),
        description: scriptureWords.trim(),
        photo: photoUrl || '',
        communityId,
      };

      const response = await fetchWithToken(`${BASE_URL}/scriptures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response?.success) {
        // Clear HomeScreen cache so new scripture appears immediately
        await AsyncStorage.removeItem(`home_scriptures_${communityId}`);

        Alert.alert('Success', 'Scripture added successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);

        // Reset form
        setScriptureName('');
        setScriptureWords('');
        setBackgroundImage(null);
      } else {
        throw new Error(response?.message || 'Failed to save scripture');
      }
    } catch (err) {
      console.error('Add Scripture Error:', err);
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Scripture</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Add New Scripture</Text>
            <Text style={styles.cardSubtitle}>
              Fill in the details below to create a new scripture card.
            </Text>

            {/* Scripture Name */}
            <Text style={styles.label}>Scripture Reference *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John 3:16"
              placeholderTextColor="#999"
              value={scriptureName}
              onChangeText={setScriptureName}
              editable={!loading}
            />

            {/* Scripture Text */}
            <Text style={styles.label}>Scripture Text *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Type the full scripture text here..."
              placeholderTextColor="#999"
              value={scriptureWords}
              onChangeText={setScriptureWords}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />

            {/* Background Image */}
            <Text style={styles.label}>Background Picture (Optional)</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={loading}>
              {backgroundImage ? (
                <Image source={{ uri: backgroundImage.uri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="image-outline" size={32} color="#aaa" />
                  <Text style={styles.placeholderText}>Tap to upload image</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Save Scripture</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'GothamBold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: { padding: 20 },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    fontFamily: 'GothamBold',
  },
  cardSubtitle: {
    fontSize: 14.5,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'GothamMedium',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'GothamBold',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontFamily: 'GothamMedium',
  },
  messageInput: {
    height: 150,
    paddingTop: 14,
  },
  imagePicker: {
    marginTop: 10,
    height: 200,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 15,
    fontFamily: 'GothamMedium',
  },
  submitButton: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'GothamBold',
  },
});