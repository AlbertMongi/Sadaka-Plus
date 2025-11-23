import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { BASE_URL } from './apiConfig';

const API_BASE_URL = BASE_URL;
const GOLD = '#FF8C00';

export default function ForgotPasswordScreen() {
  const [phoneNo, setPhoneNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [buttonOpacity] = useState(new Animated.Value(1));
  const router = useRouter();

  const animateButton = (toValue) => {
    Animated.timing(buttonOpacity, {
      toValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSend = async () => {
    if (!phoneNo) {
      setNotificationMessage('Please enter your phone number.');
      return;
    }

    setLoading(true);
    setNotificationMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotificationMessage('Code sent successfully.');
        router.push('/changepassword');
      } else {
        setNotificationMessage(data?.message || 'Failed to send code.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setNotificationMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'android' ? StatusBar.currentHeight : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerWrapper}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your phone number to reset your password
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={phoneNo}
                onChangeText={setPhoneNo}
              />

              <Animated.View style={{ width: '80%', opacity: buttonOpacity }}>
                <TouchableOpacity
                  disabled={loading}
                  style={[
                    styles.sendButton,
                    { backgroundColor: phoneNo ? GOLD : '#e0c8a3' },
                  ]}
                  onPressIn={() => animateButton(0.7)}
                  onPressOut={() => animateButton(1)}
                  onPress={handleSend}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send'}
                  </Text>
                  {!loading && (
                    <Ionicons
                      name="send-outline"
                      size={18}
                      color="#fff"
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>

              {notificationMessage !== '' && (
                <Text style={styles.notificationText}>{notificationMessage}</Text>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  innerWrapper: {
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: GOLD,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationText: {
    color: GOLD,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});