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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ORANGE = '#FF6B00';

export default function AddEventScreen() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [eventWords, setEventWords] = useState('');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [region, setRegion] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    if (
      !eventName.trim() ||
      !eventWords.trim() ||
      !district.trim() ||
      !street.trim() ||
      !region.trim() ||
      !eventDate.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Event added successfully!');
      setEventName('');
      setEventWords('');
      setDistrict('');
      setStreet('');
      setRegion('');
      setEventDate('');
      setBackgroundImage(null);
      router.back();
    }, 1500);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setEventDate(formattedDate);
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
        <Text style={styles.title}>Add Event</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Add New Event</Text>
            <Text style={styles.cardSubtitle}>
              Fill in the details below to create a new event for your community.
            </Text>

            {/* Event Name */}
            <Text style={styles.label}>Event Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Youth Revival Night"
              placeholderTextColor="#999"
              value={eventName}
              onChangeText={setEventName}
            />

            {/* Words of Event */}
            <Text style={styles.label}>Words of Event *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Type the full event description here..."
              placeholderTextColor="#999"
              value={eventWords}
              onChangeText={setEventWords}
              multiline
              textAlignVertical="top"
            />

            {/* District */}
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter district"
              placeholderTextColor="#999"
              value={district}
              onChangeText={setDistrict}
            />

            {/* Street */}
            <Text style={styles.label}>Street *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter street"
              placeholderTextColor="#999"
              value={street}
              onChangeText={setStreet}
            />

            {/* Region */}
            <Text style={styles.label}>Region *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter region"
              placeholderTextColor="#999"
              value={region}
              onChangeText={setRegion}
            />

            {/* Event Date (Cute Calendar Picker) */}
            <Text style={styles.label}>Event Date *</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[
                  styles.datePickerText,
                  !eventDate && { color: '#999' },
                ]}
              >
                {eventDate || 'Select event date'}
              </Text>
              <Ionicons name="calendar-outline" size={22} color="#888" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={eventDate ? new Date(eventDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                onChange={handleDateChange}
                themeVariant="light"
              />
            )}

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
                {loading ? 'Saving...' : 'Save Event'}
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
    fontFamily: 'GothamBold',
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
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    fontFamily: 'GothamMedium',
    color: '#000',
  },
  messageInput: {
    height: 140,
    paddingTop: 12,
  },
  datePickerButton: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#000',
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
