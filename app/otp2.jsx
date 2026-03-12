// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useLocalSearchParams } from 'expo-router';
// import { useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   Keyboard,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   SafeAreaView,
//   Dimensions,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from './apiConfig';
// import { useTranslation } from 'react-i18next';

// const OTP_LENGTH = 6;
// const GOLD = '#FF8C00';

// export default function OTPVerification() {
//   const { t } = useTranslation();
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const screenWidth = Dimensions.get('window').width;

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [resendTimer, setResendTimer] = useState(0);
//   const [phoneNo, setPhoneNo] = useState('');
//   const [buttonOpacity] = useState(new Animated.Value(1));

//   const inputs = useRef([]);

//   // Load phone number
//   useEffect(() => {
//     const loadPhone = async () => {
//       if (params?.phoneNo) {
//         setPhoneNo(params.phoneNo);
//         await AsyncStorage.setItem('userPhoneNo', params.phoneNo);
//         return;
//       }

//       const storedPhone = await AsyncStorage.getItem('userPhoneNo');
//       if (storedPhone) {
//         setPhoneNo(storedPhone);
//       }
//     };

//     loadPhone();
//   }, [params?.phoneNo]);

//   // Resend timer countdown
//   useEffect(() => {
//     if (resendTimer === 0) return;
//     const timer = setInterval(() => {
//       setResendTimer((prev) => prev - 1);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [resendTimer]);

//   const handleChangeText = (text, index) => {
//     if (!/^\d?$/.test(text)) return;

//     const newOtp = [...otp];
//     newOtp[index] = text;
//     setOtp(newOtp);

//     if (text && index < OTP_LENGTH - 1) {
//       inputs.current[index + 1]?.focus();
//     }
//   };

//   const animateButton = (toValue) => {
//     Animated.timing(buttonOpacity, {
//       toValue,
//       duration: 100,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleVerify = async () => {
//     const enteredOtp = otp.join('');

//     if (enteredOtp.length !== OTP_LENGTH) {
//       setErrorMessage(t('otp.errors.enter_all_digits'));
//       return;
//     }

//     setLoading(true);
//     setErrorMessage('');

//     try {
//       const res = await fetch(
//         `${BASE_URL}/auth/user/verify?token=${enteredOtp}`,
//         { method: 'POST' }
//       );

//       const data = await res.json();

//       if (res.ok && data.success) {
//         await AsyncStorage.setItem('userToken', data.data.token);

//         if (phoneNo) {
//           await AsyncStorage.setItem('userPhoneNo', phoneNo);
//         }

//         router.replace('/main/index1');
//       } else {
//         setErrorMessage(data.message || t('otp.errors.invalid_otp'));
//       }
//     } catch (err) {
//       console.error('Verification error:', err);
//       setErrorMessage(t('common.network_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (!phoneNo || loading || resendTimer > 0) return;

//     setLoading(true);
//     setErrorMessage('');

//     try {
//       const res = await fetch(`${BASE_URL}/auth/resend`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phoneNo }),
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setResendTimer(60);
//         setErrorMessage(t('otp.success.resent'));
//       } else {
//         setErrorMessage(data.message || t('otp.errors.resend_failed'));
//       }
//     } catch {
//       setErrorMessage(t('common.network_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container} onTouchStart={Keyboard.dismiss}>
//       <View style={styles.innerWrapper}>
//         <Text style={styles.title}>{t('otp.title')}</Text>
//         <Text style={styles.subtitle}>
//           {t('otp.subtitle', { phone: phoneNo || t('otp.your_phone') })}
//         </Text>

//         <View style={styles.otpContainer}>
//           {otp.map((digit, idx) => (
//             <TextInput
//               key={idx}
//               ref={(el) => (inputs.current[idx] = el)}
//               style={styles.otpInput}
//               keyboardType="number-pad"
//               maxLength={1}
//               value={digit}
//               onChangeText={(text) => handleChangeText(text, idx)}
//               autoFocus={idx === 0}
//             />
//           ))}
//         </View>

//         <Animated.View style={{ width: '70%', opacity: buttonOpacity }}>
//           <TouchableOpacity
//             disabled={loading || otp.some((d) => !d)}
//             style={styles.verifyButton}
//             onPressIn={() => animateButton(0.7)}
//             onPressOut={() => animateButton(1)}
//             onPress={handleVerify}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? t('otp.verifying') : t('otp.verify_button')}
//             </Text>
//             {!loading && (
//               <Ionicons
//                 name="checkmark-done-outline"
//                 size={18}
//                 color="#fff"
//                 style={{ marginLeft: 6 }}
//               />
//             )}
//           </TouchableOpacity>
//         </Animated.View>

//         {!!errorMessage && (
//           <Text style={styles.errorText}>{errorMessage}</Text>
//         )}

//         <TouchableOpacity
//           disabled={resendTimer > 0 || loading}
//           onPress={handleResend}
//         >
//           <Text style={styles.resendText}>
//             {resendTimer > 0
//               ? t('otp.resend_timer', { seconds: resendTimer })
//               : t('otp.resend_button')}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     paddingHorizontal: '6%',
//   },
//   innerWrapper: { alignItems: 'center' },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: GOLD,
//     marginBottom: 6,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     paddingHorizontal: 12,
//     marginBottom: 30,
//   },
//   otpInput: {
//     width: Dimensions.get('window').width * 0.11,
//     height: Dimensions.get('window').width * 0.13,
//     borderWidth: 1,
//     borderColor: GOLD,
//     borderRadius: 8,
//     fontSize: 22,
//     textAlign: 'center',
//   },
//   verifyButton: {
//     backgroundColor: GOLD,
//     paddingVertical: 10,
//     borderRadius: 10,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   resendText: {
//     marginTop: 16,
//     color: GOLD,
//     fontSize: 14,
//     textDecorationLine: 'underline',
//   },
//   errorText: {
//     color: '#ff3b30',
//     marginTop: 10,
//     fontSize: 13,
//     textAlign: 'center',
//   },
// });



import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from './apiConfig';
import { useTranslation } from 'react-i18next';

const OTP_LENGTH = 6;
const GOLD = '#FF8C00';

export default function OTPVerification() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const screenWidth = Dimensions.get('window').width;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneNo, setPhoneNo] = useState('');
  const [buttonOpacity] = useState(new Animated.Value(1));

  const inputs = useRef([]);

  // Load phone number
  useEffect(() => {
    const loadPhone = async () => {
      if (params?.phoneNo) {
        setPhoneNo(params.phoneNo);
        await AsyncStorage.setItem('userPhoneNo', params.phoneNo);
        return;
      }

      const storedPhone = await AsyncStorage.getItem('userPhoneNo');
      if (storedPhone) {
        setPhoneNo(storedPhone);
      }
    };

    loadPhone();
  }, [params?.phoneNo]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer === 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChangeText = (text, index) => {
    if (!/^\d?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const animateButton = (toValue) => {
    Animated.timing(buttonOpacity, {
      toValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== OTP_LENGTH) {
      setErrorMessage(t('otp.errors.enter_all_digits'));
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(
        `${BASE_URL}/auth/user/verify?token=${enteredOtp}`,
        { method: 'POST' }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        // Save token
        await AsyncStorage.setItem('userToken', data.data.token);

        // ────────────────────────────────────────────────
        // NEW: Save userId (try common response shapes)
        // ────────────────────────────────────────────────
        let userId;

        if (data.data?.userId) {
          userId = data.data.userId;
        } else if (data.data?.user?.id) {
          userId = data.data.user.id;
        } else if (data.data?.id) {
          userId = data.data.id; // sometimes the whole object is the user
        }

        if (userId) {
          // Prefer SecureStore for sensitive data like IDs
          await SecureStore.setItemAsync('userId', userId);
          console.log('[OTP] Saved userId to SecureStore:', userId);
        } else {
          console.warn('[OTP] No userId found in verify response:', JSON.stringify(data));
        }

        if (phoneNo) {
          await AsyncStorage.setItem('userPhoneNo', phoneNo);
        }

        router.replace('/main/index1');
      } else {
        setErrorMessage(data.message || t('otp.errors.invalid_otp'));
      }
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMessage(t('common.network_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNo || loading || resendTimer > 0) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${BASE_URL}/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResendTimer(60);
        setErrorMessage(t('otp.success.resent'));
      } else {
        setErrorMessage(data.message || t('otp.errors.resend_failed'));
      }
    } catch {
      setErrorMessage(t('common.network_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} onTouchStart={Keyboard.dismiss}>
      <View style={styles.innerWrapper}>
        <Text style={styles.title}>{t('otp.title')}</Text>
        <Text style={styles.subtitle}>
          {t('otp.subtitle', { phone: phoneNo || t('otp.your_phone') })}
        </Text>

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
            />
          ))}
        </View>

        <Animated.View style={{ width: '70%', opacity: buttonOpacity }}>
          <TouchableOpacity
            disabled={loading || otp.some((d) => !d)}
            style={styles.verifyButton}
            onPressIn={() => animateButton(0.7)}
            onPressOut={() => animateButton(1)}
            onPress={handleVerify}
          >
            <Text style={styles.buttonText}>
              {loading ? t('otp.verifying') : t('otp.verify_button')}
            </Text>
            {!loading && (
              <Ionicons
                name="checkmark-done-outline"
                size={18}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        {!!errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <TouchableOpacity
          disabled={resendTimer > 0 || loading}
          onPress={handleResend}
        >
          <Text style={styles.resendText}>
            {resendTimer > 0
              ? t('otp.resend_timer', { seconds: resendTimer })
              : t('otp.resend_button')}
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
    justifyContent: 'center',
    paddingHorizontal: '6%',
  },
  innerWrapper: { alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GOLD,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 30,
  },
  otpInput: {
    width: Dimensions.get('window').width * 0.11,
    height: Dimensions.get('window').width * 0.13,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  resendText: {
    marginTop: 16,
    color: GOLD,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 10,
    fontSize: 13,
    textAlign: 'center',
  },
});