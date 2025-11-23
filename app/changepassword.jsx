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
} from 'react-native';
import { BASE_URL } from './apiConfig';

const API_BASE_URL = BASE_URL;
const GOLD = '#FF8C00';
const BORDER_COLOR = '#000';

export default function ChangePasswordScreen() {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleChangePassword = async () => {
    if (otp.length !== 6) {
      setNotificationMessage('Please enter the 6-digit OTP.');
      return;
    }
    if (password.length < 8) {
      setNotificationMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setNotificationMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setNotificationMessage('');

    try {
      // Construct URL with OTP as token
      const url = `${BASE_URL}/auth/reset-password?token=${otp}`;

      // Send newPassword and confirmPassword in the request body
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password, confirmPassword: confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotificationMessage('Password changed successfully.');
        router.replace('main/index1');
      } else {
        setNotificationMessage(data?.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setNotificationMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.innerWrapper}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>Enter OTP and your new password</Text>

            {/* OTP Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="New Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <Animated.View style={{ width: '80%', opacity: buttonOpacity }}>
              <TouchableOpacity
                disabled={loading}
                style={[styles.sendButton, { backgroundColor: otp && password && confirmPassword ? GOLD : '#e0c8a3' }]}
                onPressIn={() => animateButton(0.7)}
                onPressOut={() => animateButton(1)}
                onPress={handleChangePassword}
              >
                <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Change Password'}</Text>
                {!loading && <Ionicons name="checkmark-done-outline" size={18} color="#fff" style={{ marginLeft: 6 }} />}
              </TouchableOpacity>
            </Animated.View>

            {notificationMessage !== '' && <Text style={styles.notificationText}>{notificationMessage}</Text>}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    backgroundColor: '#f2f2f2',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
    height: 50,
    backgroundColor: '#f2f2f2',
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
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
    marginTop: 10,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});