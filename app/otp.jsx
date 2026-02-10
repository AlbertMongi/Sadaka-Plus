import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from './apiConfig';

const { width } = Dimensions.get('window');

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || '{BASE_URL}';

export default function OTPVerification() {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const inputs = useRef([]);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [buttonOpacity] = useState(new Animated.Value(1));
  const [phoneNo, setPhoneNo] = useState(null);

  const { token } = useLocalSearchParams();

  useEffect(() => {
    const getPhoneNo = async () => {
      try {
        const storedPhoneNo = await AsyncStorage.getItem('userPhoneNo');
        console.log('Retrieved phone number:', storedPhoneNo);
        if (storedPhoneNo) setPhoneNo(storedPhoneNo);
        // else setErrorMessage('Phone number not found. Please log in again.');
      } catch (error) {
        console.error('Failed to retrieve phone number:', error);
        setErrorMessage('Failed to retrieve phone number.');
      }
    };
    getPhoneNo();
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChangeText = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < OTP_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      } else if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }

      if (newOtp.every((digit) => digit !== '')) {
        handleVerify(newOtp.join(''));
      }
    }
  };

  const animateButton = (toValue) => {
    Animated.timing(buttonOpacity, {
      toValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleVerify = async (manualOtp) => {
    const entered = manualOtp || otp.join('');
    if (entered.length !== OTP_LENGTH) {
      setErrorMessage('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    console.log('Verifying OTP:', entered);

    try {
      const res = await fetch(`${BASE_URL}/auth/user/verify?token=${entered}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();
      console.log('API Response Status:', res.status);
      console.log('API Response Data:', json);

      if (res.ok && json.success) {
        // The token is inside json.data.token according to your API response
        const userToken = json.data.token;
        console.log('Storing token and navigating...');
        await AsyncStorage.setItem('userToken', userToken);
        console.log('Token stored successfully:', userToken);
        router.replace('/main/index1');
      } else {
        setErrorMessage(json.message || 'Verification failed. Please try again.');
        console.log('Verification failed:', json.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;

    if (!phoneNo) {
      setErrorMessage('Phone number missing.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${BASE_URL}/api/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo }),
      });

      const data = await res.json();
      console.log('Resend OTP Response Status:', res.status);
      console.log('Resend OTP Response Data:', data);

      if (res.ok && data.success) {
        setErrorMessage('OTP resent successfully.');
        setResendTimer(60);
      } else {
        setErrorMessage(data.message || 'Failed to resend OTP.');
        console.log('Resend OTP failed:', data.message);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} onTouchStart={Keyboard.dismiss}>
      <View style={styles.innerWrapper}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Please enter the 6-digit code sent to your phone</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => (inputs.current[idx] = el)}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChangeText(text, idx)}
              autoFocus={idx === 0}
              textContentType="oneTimeCode"
              importantForAutofill="yes"
            />
          ))}
        </View>

        <Animated.View style={{ width: '60%', opacity: buttonOpacity }}>
          <TouchableOpacity
            disabled={!otp.every(Boolean) || loading}
            style={[
              styles.verifyButton,
              { backgroundColor: otp.every(Boolean) ? '#FF8C00' : '#e0c8a3' },
            ]}
            onPressIn={() => animateButton(0.7)}
            onPressOut={() => animateButton(1)}
            onPress={() => handleVerify()}
          >
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
            {!loading && (
              <Ionicons name="checkmark-done-outline" size={18} color="#fff" style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}

        <TouchableOpacity disabled={resendTimer > 0 || loading} onPress={handleResend}>
          <Text
            style={[
              styles.resendText,
              (resendTimer > 0 || loading) && {
                color: '#aaa',
                textDecorationLine: 'none',
              },
            ]}
          >
            {loading && !resendTimer
              ? 'Resending...'
              : resendTimer > 0
              ? `Resend OTP in `
              : 'Resend OTP'}
            {resendTimer > 0 && <Text style={styles.timerText}>{resendTimer}s</Text>}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: '5%',
    justifyContent: 'center',
  },
  innerWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: width * 0.11,
    height: width * 0.13,
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 8,
    fontSize: 22,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  resendText: {
    color: '#FF8C00',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center',
  },
  timerText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF8C00',
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});