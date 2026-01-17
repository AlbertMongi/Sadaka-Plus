import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './apiConfig';

const { height } = Dimensions.get('window');
const ORANGE = '#FF6B00';
const GREEN = '#FF6B00';

export default function HelpCentreScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);

  // Bottom Sheet Animation
  const sheetAnim = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setShowSuccessSheet(true);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: height,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setShowSuccessSheet(false));
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      // Alert.alert('Error', 'Please fill in both subject and message.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        // Alert.alert('Error', 'You are not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: subject.trim(),
          message: message.trim(),
        }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setSubject('');
        setMessage('');
        openSheet(); // SHOW BOTTOM SHEET
        setTimeout(closeSheet, 3000); // Auto-close after 3 sec
      } else {
        const errMsg = json.message || 'Failed to send feedback.';
        // Alert.alert('Error', errMsg);
      }
    } catch (error) {
      console.error('Feedback error:', error);
      // Alert.alert('Error', 'Network error. Please check your connection.');
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
          onPress={() => router.push('/main/more')}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Feedback</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Send Feedback</Text>
            <Text style={styles.cardSubtitle}>
              We’d love to hear your thoughts, suggestions, or issues.
            </Text>

            {/* Subject */}
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the subject of your feedback..."
              placeholderTextColor="#999"
              value={subject}
              onChangeText={setSubject}
              editable={!loading}
            />

            {/* Message */}
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Describe your feedback in detail..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading ? styles.submitButtonDisabled : { backgroundColor: ORANGE },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Send Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* SUCCESS BOTTOM SHEET – SAME AS EditProfileScreen */}
      <Modal transparent visible={showSuccessSheet} onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}
              >
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Thank You!</Text>
                <Text style={styles.sheetSubtitle}>
                  Your feedback has been sent successfully.
                </Text>

                <TouchableOpacity style={styles.doneBtn} onPress={closeSheet}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

/* ------------------- Styles ------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: Platform.OS === 'android' ? 99 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 20 : -5,
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
    paddingTop: Platform.OS === 'android' ? -90 : -5,
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
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: ORANGE,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'GothamBold',
  },

  // Bottom Sheet – EXACTLY like EditProfileScreen
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: height * 0.7,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontFamily: 'GothamBold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'GothamMedium',
  },
  doneBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'GothamBold',
  },
});