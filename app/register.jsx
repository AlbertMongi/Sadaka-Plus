import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from './apiConfig';

const { width } = Dimensions.get('window');
const GOLD = '#E18731';

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const translateX = useRef(new Animated.Value(0)).current;

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const role = 'ROLE_USER';

  /* 🔔 TOAST STATE */
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'error', // 'success' | 'error'
  });

  /* 🔔 TOAST HELPER */
  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type });
    }, 3500);
  };

  const animateStep = (direction, nextStep) => {
    translateX.setValue(direction === 'right' ? width : -width);
    setStep(nextStep);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        showToast('Please enter first and last name');
        return;
      }
      if (phone.trim().length < 9) {
        showToast('Enter a valid phone number');
        return;
      }
      animateStep('right', 2);
      return;
    }

    if (step === 2) {
      if (password.length < 6) {
        showToast('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match');
        return;
      }
      handleSignUp();
    }
  };

  const handleBackStep = () => animateStep('left', 1);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          phoneNo: phone,
          email: email || null,
          role,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Account created! Verify your phone number', 'success');

        // Changed behaviour → go to OTP screen instead of main
        setTimeout(() => {
          router.replace('/otp');           // ← or '/verify-otp' or whatever your OTP route is
          // You can also pass phone number if your OTP screen expects it:
          // router.replace({ pathname: '/otp', params: { phone } });
        }, 1200);
      } else {
        showToast(data?.message || 'Registration failed');
      }
    } catch {
      showToast('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const icons = ['person-outline', 'lock-closed-outline'];
  const titles = ['Please enter your details', 'Secure your account'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 🔔 TOAST */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View
            style={[
              styles.toast,
              toast.type === 'success' ? styles.toastSuccess : styles.toastError,
            ]}
          >
            <Ionicons
              name={toast.type === 'success' ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color="#fff"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <Animated.View
            style={{
              width: '100%',
              transform: [{ translateX }],
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={icons[step - 1]} size={42} color={GOLD} />
            </View>

            <Text style={styles.title}>{titles[step - 1]}</Text>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Middle Name (optional)"
                  value={middleName}
                  onChangeText={setMiddleName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email (optional)"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>
                {loading
                  ? 'Creating Account...'
                  : step === 2
                  ? 'Create Account'
                  : 'Next'}
              </Text>
            </TouchableOpacity>

            {step === 2 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBackStep}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={{ color: GOLD, fontWeight: 'bold' }}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: Platform.OS === 'android' ? 99 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 20 : -5,
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  scrollContent: { flexGrow: 1, justifyContent: 'top' },
  inner: { paddingHorizontal: 28 },

  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFF8E1',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },

  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  passwordInput: { flex: 1, height: 52 },

  nextButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  nextButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  backButton: { marginTop: 10, alignItems: 'center' },
  backText: { color: '#888' },

  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { color: '#666' },

  /* 🔔 TOAST */
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    elevation: 3,
  },
  toastSuccess: { backgroundColor: '#4CAF50' },
  toastError: { backgroundColor: '#FF3B30' },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
