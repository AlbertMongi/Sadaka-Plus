// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';
// import {
//   Animated,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { BASE_URL } from './apiConfig'; // ✅ Adjust path as needed

// // const API_BASE_URL = `${BASE_URL}`;

// export default function Login() {
//   const router = useRouter();

//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [buttonOpacity] = useState(new Animated.Value(1));
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleLogin = async () => {
//     setErrorMessage('');

//     if (!phoneNumber) {
//       setErrorMessage('Please enter phone number.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(`${BASE_URL}/user/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phoneNo: phoneNumber }),
//       });

//       const data = await response.json();
//       console.log('API response:', data); // ✅ Helpful for debugging

//       if (response.ok) {
//         // ✅ Store phone number only, since token isn't returned here
//         await AsyncStorage.setItem('userPhoneNo', phoneNumber);

//         // Alert.alert('Success', 'OTP sent to your phone!');
//         router.push('/otp');
//       } else {
//         setErrorMessage(data.message || 'Login failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Login error:', error); // ✅ Debug log
//       setErrorMessage('Network error. Please try again later.'+error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onPressIn = () => {
//     Animated.timing(buttonOpacity, {
//       toValue: 0.7,
//       duration: 100,
//       useNativeDriver: true,
//     }).start();
//   };

//   const onPressOut = () => {
//     Animated.timing(buttonOpacity, {
//       toValue: 1,
//       duration: 100,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Welcome Back</Text>
//         <Text style={styles.subtitle}>Please log in to continue</Text>
//       </View>

//       <View style={styles.form}>
//         {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

//         <TextInput
//           placeholder="Phone Number"
//           placeholderTextColor="#FFA54F"
//           style={styles.input}
//           value={phoneNumber}
//           onChangeText={setPhoneNumber}
//           keyboardType="phone-pad"
//           editable={!loading}
//         />

//         <Animated.View style={{ width: '80%', opacity: buttonOpacity }}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={[
//               styles.button,
//               { backgroundColor: phoneNumber ? '#FF8C00' : '#e0c8a3' },
//             ]}
//             disabled={!phoneNumber || loading}
//             onPress={handleLogin}
//             onPressIn={onPressIn}
//             onPressOut={onPressOut}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? 'Logging in...' : 'Login'}
//             </Text>
//             {!loading && (
//               <Ionicons
//                 name="log-in-outline"
//                 size={18}
//                 color="#fff"
//                 style={{ marginLeft: 6 }}
//               />
//             )}
//           </TouchableOpacity>
//         </Animated.View>

//         <TouchableOpacity onPress={() => router.push('register')}>
//           <Text style={styles.registerLink}>
//             Don't have an account?{' '}
//             <Text style={{ color: '#FF8C00' }}>Register</Text>
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
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     marginBottom: 30,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FF8C00',
//   },
//   subtitle: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 6,
//   },
//   form: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   input: {
//     width: '80%',
//     height: 42,
//     borderWidth: 1,
//     borderColor: '#FF8C00',
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 12,
//   },
//   button: {
//     flexDirection: 'row',
//     width: '100%',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   registerLink: {
//     color: '#FF8C00',
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   errorText: {
//     color: '#FF8C00',
//     marginBottom: 10,
//     fontSize: 13,
//     fontWeight: '500',
//     textAlign: 'center',
//     paddingHorizontal: 10,
//   },
// });



import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from './apiConfig';

const GOLD = "#FF8C00";
const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async () => {
    if (!phoneNo || !password) {
      setErrorMessage("Please enter both phone number and password");
      return;
    }

    if (!validatePhoneNumber(phoneNo)) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    if (!isConnected) {
      setErrorMessage("No internet connection. Please check your network.");
      return;
    }

    const payload = { phoneNo, password };
    setLoading(true);
    setErrorMessage("");

    const attemptFetch = async (retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(`${BASE_URL}/auth/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            timeout: 10000, // 10s timeout
          });

          const data = await response.json();

          if (response.ok) {
            setLoading(false);
            alert("Login successful!");
            router.push("otp2");
            return true;
          } else {
            setErrorMessage(data.message || "Login failed. Please try again.");
            return false;
          }
        } catch (error) {
          if (i === retries - 1) {
            setErrorMessage("Network error. Please try again later."+error);
            return false;
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    await attemptFetch();
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Login</Text>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Phone Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNo}
              onChangeText={setPhoneNo}
              placeholder="Enter your phone number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#aaa"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.forgotWrapper}
            //   onPress={() => router.push("/ForgotPassword")}
             onPress={() => router.push("/CommunityHome")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.footerLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={GOLD} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: width * 0.035,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: width * 0.035,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  forgotWrapper: {
    marginTop: 5,
    alignItems: "flex-end",
  },
  forgotText: {
    color: GOLD,
    fontSize: width * 0.035,
    fontWeight: "500",
  },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: width * 0.04,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: width * 0.035,
    color: "#555",
  },
  footerLink: {
    fontSize: width * 0.035,
    color: GOLD,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: width * 0.035,
    textAlign: "center",
    marginBottom: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;