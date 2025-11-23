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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ORANGE = '#FF6B00';

export default function AddScriptureScreen() {
  const router = useRouter();
  const [scriptureName, setScriptureName] = useState('');
  const [scriptureWords, setScriptureWords] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(null); // Fixed: Removed type
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setBackgroundImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!scriptureName.trim() || !scriptureWords.trim()) {
      Alert.alert('Error', 'Please fill in both scripture name and words.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Scripture added successfully!');
      setScriptureName('');
      setScriptureWords('');
      setBackgroundImage(null);
      router.back();
    }, 1500);
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
        <Text style={styles.title}>Add Announcement</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Add New Announcement</Text>
            <Text style={styles.cardSubtitle}>
              Fill in the details below to create a new scripture card.
            </Text>

            {/* Scripture Name */}
            <Text style={styles.label}>Scripture Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John 3:16"
              placeholderTextColor="#999"
              value={scriptureName}
              onChangeText={setScriptureName}
            />

            {/* Scripture Words */}
            <Text style={styles.label}>Words of the Scripture *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Type the full scripture text here..."
              placeholderTextColor="#999"
              value={scriptureWords}
              onChangeText={setScriptureWords}
              multiline
              textAlignVertical="top"
            />

            {/* Background Image */}
            <Text style={styles.label}>Background Picture</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {backgroundImage ? (
                <Image source={{ uri: backgroundImage }} style={styles.imagePreview} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="image-outline" size={32} color="#aaa" />
                  <Text style={styles.placeholderText}>Tap to upload image</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? 'Saving...' : 'Save Scripture'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
    fontFamily: 'GothamBold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'GothamMedium',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'GothamBold',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontFamily: 'GothamMedium',
  },
  messageInput: {
    height: 140,
    paddingTop: 12,
  },
  imagePicker: {
    marginTop: 8,
    height: 180,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'GothamMedium',
  },
  submitButton: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'GothamBold',
  },
});