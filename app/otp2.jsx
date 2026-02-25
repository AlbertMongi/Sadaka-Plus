// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   Keyboard,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { BASE_URL } from './apiConfig';
// const { width } = Dimensions.get("window");

// // const BASE_URL =
// //   Constants.expoConfig?.extra?.apiBaseUrl || "";

// export default function OTPVerification() {
//   const OTP_LENGTH = 6;
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [resendTimer, setResendTimer] = useState(0);
//   const [phoneNo, setPhoneNo] = useState("");
//   const [buttonOpacity] = useState(new Animated.Value(1));

//   const inputs = useRef([]);

//   /**
//    * ✅ LOAD PHONE NUMBER (NO ERRORS)
//    */
//   useEffect(() => {
//     const loadPhone = async () => {
//       if (params?.phoneNo) {
//         setPhoneNo(params.phoneNo);
//         await AsyncStorage.setItem("userPhoneNo", params.phoneNo);
//         return;
//       }

//       const storedPhone = await AsyncStorage.getItem("userPhoneNo");
//       if (storedPhone) {
//         setPhoneNo(storedPhone);
//       }
//     };

//     loadPhone();
//   }, []);

//   /**
//    * ⏱ RESEND TIMER
//    */
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

//   /**
//    * ✅ VERIFY OTP
//    */
//   const handleVerify = async () => {
//     const enteredOtp = otp.join("");

//     if (enteredOtp.length !== OTP_LENGTH) {
//       setErrorMessage("Please enter all 6 digits.");
//       return;
//     }

//     setLoading(true);
//     setErrorMessage("");

//     try {
//       const res = await fetch(
//         `${BASE_URL}/auth/user/verify?token=${enteredOtp}`,
//         { method: "POST" }
//       );

//       const data = await res.json();

//       if (res.ok && data.success) {
//         await AsyncStorage.setItem("userToken", data.data.token);
//         router.replace("/main/index1"); // ✅ USER UI ONLY
//       } else {
//         setErrorMessage(data.message || "Invalid OTP.");
//       }
//     } catch {
//       setErrorMessage("Network error. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * ✅ RESEND OTP (PHONE NUMBER ONLY)
//    */
//   const handleResend = async () => {
//     if (!phoneNo || loading || resendTimer > 0) return;

//     setLoading(true);
//     setErrorMessage("");

//     try {
//       const res = await fetch(`${BASE_URL}/auth/resend`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phoneNo }),
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setResendTimer(60);
//         setErrorMessage("OTP resent successfully.");
//       } else {
//         setErrorMessage(data.message || "Failed to resend OTP.");
//       }
//     } catch {
//       setErrorMessage("Network error. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container} onTouchStart={Keyboard.dismiss}>
//       <View style={styles.innerWrapper}>
//         <Text style={styles.title}>Enter OTP</Text>
//         <Text style={styles.subtitle}>
//           Code sent to {phoneNo || "your phone"}
//         </Text>

//         {/* ✅ OTP BOXES – PERFECT SPACING */}
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

//         <Animated.View style={{ width: "70%", opacity: buttonOpacity }}>
//           <TouchableOpacity
//             disabled={loading || otp.some((d) => !d)}
//             style={styles.verifyButton}
//             onPressIn={() => animateButton(0.7)}
//             onPressOut={() => animateButton(1)}
//             onPress={handleVerify}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? "Verifying..." : "Verify OTP"}
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
//               ? `Resend OTP in ${resendTimer}s`
//               : "Resend OTP"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* 🔧 STYLES – OTP BOXES WILL NOT TOUCH EDGES */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     paddingHorizontal: "6%",
//   },
//   innerWrapper: { alignItems: "center" },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#FF8C00",
//     marginBottom: 6,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 30,
//     textAlign: "center",
//   },
//   otpContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     paddingHorizontal: 12,
//     marginBottom: 30,
//   },
//   otpInput: {
//     width: width * 0.11,
//     height: width * 0.13,
//     borderWidth: 1,
//     borderColor: "#FF8C00",
//     borderRadius: 8,
//     fontSize: 22,
//     textAlign: "center",
//   },
//   verifyButton: {
//     backgroundColor: "#FF8C00",
//     paddingVertical: 10,
//     borderRadius: 10,
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   resendText: {
//     marginTop: 16,
//     color: "#FF8C00",
//     fontSize: 14,
//     textDecorationLine: "underline",
//   },
//   errorText: {
//     color: "#FF8C00",
//     marginTop: 10,
//     fontSize: 13,
//     textAlign: "center",
//   },
// });



import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from './apiConfig';

const { width } = Dimensions.get("window");

export default function OTPVerification() {
  const OTP_LENGTH = 6;
  const router = useRouter();
  const params = useLocalSearchParams();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneNo, setPhoneNo] = useState("");
  const [buttonOpacity] = useState(new Animated.Value(1));

  const inputs = useRef([]);

  // Load phone number
  useEffect(() => {
    const loadPhone = async () => {
      if (params?.phoneNo) {
        setPhoneNo(params.phoneNo);
        await AsyncStorage.setItem("userPhoneNo", params.phoneNo);
        return;
      }

      const storedPhone = await AsyncStorage.getItem("userPhoneNo");
      if (storedPhone) {
        setPhoneNo(storedPhone);
      }
    };

    loadPhone();
  }, []);

  // Resend timer
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

  // Verify OTP – only save what's necessary (token)
  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== OTP_LENGTH) {
      setErrorMessage("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `${BASE_URL}/auth/user/verify?token=${enteredOtp}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        // Only save the token – minimal & matches your original working version
        await AsyncStorage.setItem("userToken", data.data.token);

        // Optional: also save phone number if not already saved
        if (phoneNo) {
          await AsyncStorage.setItem("userPhoneNo", phoneNo);
        }

        router.replace("/main/index1");
      } else {
        setErrorMessage(data.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMessage("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!phoneNo || loading || resendTimer > 0) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResendTimer(60);
        setErrorMessage("OTP resent successfully.");
      } else {
        setErrorMessage(data.message || "Failed to resend OTP.");
      }
    } catch {
      setErrorMessage("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} onTouchStart={Keyboard.dismiss}>
      <View style={styles.innerWrapper}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Code sent to {phoneNo || "your phone"}
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

        <Animated.View style={{ width: "70%", opacity: buttonOpacity }}>
          <TouchableOpacity
            disabled={loading || otp.some((d) => !d)}
            style={styles.verifyButton}
            onPressIn={() => animateButton(0.7)}
            onPressOut={() => animateButton(1)}
            onPress={handleVerify}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify OTP"}
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
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: "6%",
  },
  innerWrapper: { alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF8C00",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 12,
    marginBottom: 30,
  },
  otpInput: {
    width: width * 0.11,
    height: width * 0.13,
    borderWidth: 1,
    borderColor: "#FF8C00",
    borderRadius: 8,
    fontSize: 22,
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: "#FF8C00",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  resendText: {
    marginTop: 16,
    color: "#FF8C00",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#FF8C00",
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
});