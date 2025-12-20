// // app/auth/RegistrationScreen.jsx
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from "react-native";
// import { BASE_URL } from "./apiConfig";

// const GOLD = "#FF8C00";

// const RegistrationScreen = () => {
//   const router = useRouter();

//   const [form, setForm] = useState({
//     name: "",
//     denomination: "",
//     region: "",
//     district: "",
//     registrationNumber: "",
//     street: "",
//     phoneNo: "",
//     email: "",
//     description: "", // ← ADDED
//     password: "",
//     confirmPassword: "",
//   });

//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   useEffect(() => {
//     const fetchRole = async () => {
//       try {
//         const storedRole = await AsyncStorage.getItem("userRole");
//         if (storedRole) setRole(storedRole);
//       } catch (err) {
//         console.error("Error fetching role:", err);
//       }
//     };
//     fetchRole();
//   }, []);

//   const handleChange = (field, value) => {
//     setForm({ ...form, [field]: value });
//   };

//   const handleRegister = async () => {
//     // ── VALIDATION ─────────────────────────────────────
//     if (form.password !== form.confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }
//     if (form.password.length < 8) {
//       alert("Password must be at least 8 characters");
//       return;
//     }
//     if (!form.email.includes("@") || !form.email.includes(".")) {
//       alert("Please enter a valid email");
//       return;
//     }
//     if (!form.phoneNo.match(/^\d{10}$/)) {
//       alert("Phone number must be 10 digits");
//       return;
//     }

//     const payload = {
//       name: form.name.trim(),
//       region: form.region.trim(),
//       denomination: form.denomination.trim(),
//       registrationNumber: form.registrationNumber.trim(),
//       district: form.district.trim(),
//       street: form.street.trim(),
//       phoneNo: form.phoneNo.trim(),
//       email: form.email.trim().toLowerCase(),
//       description: form.description.trim(),
//       role: role || "church",
//       password: form.password,
//       confirmPassword: form.confirmPassword,
//     };

//     setLoading(true);

//     try {
//       const response = await fetch(`${BASE_URL}/auth/church/self-on-board`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload), // ← JSON, NOT FormData
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert("Registration successful! Please verify your email.");
//         router.replace("/otp3"); // or push
//       } else {
//         alert(data.message || "Registration failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Registration error:", error);
//       alert("Network error. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <ScrollView
//           contentContainerStyle={[
//             styles.container,
//             {
//               paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//             },
//           ]}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Text style={styles.title}>Register Your Organization</Text>

//           {/* Organization Name */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Organization Name *</Text>
//             <TextInput
//               style={styles.input}
//               value={form.name}
//               onChangeText={(t) => handleChange("name", t)}
//               placeholder="Enter Organization Name"
//               placeholderTextColor="#aaa"
//             />
//           </View>

//           {/* Denomination */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Denomination *</Text>
//             <TextInput
//               style={styles.input}
//               value={form.denomination}
//               onChangeText={(t) => handleChange("denomination", t)}
//               placeholder="Enter Denomination"
//               placeholderTextColor="#aaa"
//             />
//           </View>

//           {/* Region & District */}
//           <View style={styles.row}>
//             <View style={[styles.inputWrapper, styles.halfInput]}>
//               <Text style={styles.label}>Region *</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.region}
//                 onChangeText={(t) => handleChange("region", t)}
//                 placeholder="Region"
//                 placeholderTextColor="#aaa"
//               />
//             </View>
//             <View style={[styles.inputWrapper, styles.halfInput]}>
//               <Text style={styles.label}>District *</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.district}
//                 onChangeText={(t) => handleChange("district", t)}
//                 placeholder="District"
//                 placeholderTextColor="#aaa"
//               />
//             </View>
//           </View>

//           {/* Registration Number */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Registration Number *</Text>
//             <TextInput
//               style={styles.input}
//               value={form.registrationNumber}
//               onChangeText={(t) => handleChange("registrationNumber", t)}
//               placeholder="Enter Registration Number"
//               placeholderTextColor="#aaa"
//             />
//           </View>

//           {/* Street */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Street *</Text>
//             <TextInput
//               style={styles.input}
//               value={form.street}
//               onChangeText={(t) => handleChange("street", t)}
//               placeholder="Enter Street"
//               placeholderTextColor="#aaa"
//             />
//           </View>

//           {/* Phone Number */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Phone Number *</Text>
//             <TextInput
//               style={styles.input}
//               value={form.phoneNo}
//               onChangeText={(t) => handleChange("phoneNo", t)}
//               placeholder="e.g. 0501234567"
//               keyboardType="phone-pad"
//               placeholderTextColor="#aaa"
//             />
//           </View>

//           {/* Email */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Email *</Text>
//             <TextInput
//               style={styles.input}
//               value={form.email}
//               onChangeText={(t) => handleChange("email", t)}
//               placeholder="Enter Email"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               placeholderTextColor="#aaa"
//             />
//           </View>

//           {/* Description */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Description *</Text>
//             <TextInput
//               style={[styles.input, { height: 80, textAlignVertical: "top" }]}
//               value={form.description}
//               onChangeText={(t) => handleChange("description", t)}
//               placeholder="Briefly describe your organization"
//               multiline
//               numberOfLines={4}
//               placeholderTextColor="#aaa"
//             />
//           </View>

//           {/* Password */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Password *</Text>
//             <View style={styles.passwordContainer}>
//               <TextInput
//                 style={[styles.input, { flex: 1, backgroundColor: "transparent" }]}
//                 value={form.password}
//                 onChangeText={(t) => handleChange("password", t)}
//                 placeholder="Min 8 characters"
//                 secureTextEntry={!showPassword}
//                 placeholderTextColor="#aaa"
//               />
//               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                 <Ionicons
//                   name={showPassword ? "eye-off" : "eye"}
//                   size={20}
//                   color="#aaa"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Confirm Password */}
//           <View style={styles.inputWrapper}>
//             <Text style={styles.label}>Confirm Password *</Text>
//             <View style={styles.passwordContainer}>
//               <TextInput
//                 style={[styles.input, { flex: 1, backgroundColor: "transparent" }]}
//                 value={form.confirmPassword}
//                 onChangeText={(t) => handleChange("confirmPassword", t)}
//                 placeholder="Re-enter password"
//                 secureTextEntry={!showConfirmPassword}
//                 placeholderTextColor="#aaa"
//               />
//               <TouchableOpacity
//                 onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//               >
//                 <Ionicons
//                   name={showConfirmPassword ? "eye-off" : "eye"}
//                   size={20}
//                   color="#aaa"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Submit */}
//           <TouchableOpacity
//             style={[styles.button, loading && styles.buttonDisabled]}
//             onPress={handleRegister}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Create Account</Text>
//             )}
//           </TouchableOpacity>

//           {/* Login Link */}
//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Already have an account?</Text>
//             <TouchableOpacity onPress={() => router.push("/login")}>
//               <Text style={styles.footerLink}> Login</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#fff",
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 20,
//     color: "#000",
//   },
//   inputWrapper: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: "600",
//     color: "#333",
//   },
//   input: {
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//   },
//   passwordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//   },
//   button: {
//     backgroundColor: GOLD,
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonDisabled: {
//     opacity: 0.7,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 25,
//   },
//   footerText: {
//     fontSize: 14,
//     color: "#aaa",
//   },
//   footerLink: {
//     fontSize: 14,
//     color: GOLD,
//     fontWeight: "600",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   halfInput: {
//     flex: 1,
//     marginRight: 7.5,
//   },
// });

// export default RegistrationScreen;

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import { BASE_URL } from "./apiConfig";

const { width, height } = Dimensions.get("window");
const GOLD = "#E18731";

export default function ChurchRegistrationScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(height)).current;

  const TOTAL_STEPS = 5;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [role, setRole] = useState("church");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* 🔔 TOAST STATE */
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "error",
  });

  const [form, setForm] = useState({
    name: "",
    denomination: "",
    region: "",
    district: "",
    street: "",
    registrationNumber: "",
    phoneNo: "",
    email: "",
    description: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    AsyncStorage.getItem("userRole").then((r) => r && setRole(r));
  }, []);

  /* 🔔 TOAST HELPER */
  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type });
    }, 3500);
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const animateStep = (direction, nextStep) => {
    translateX.setValue(direction === "right" ? width : -width);
    setStep(nextStep);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Validation per step
  const validateStep = () => {
    switch (step) {
      case 1:
        if (!form.name.trim()) {
          showToast("Organization Name is required");
          return false;
        }
        if (!form.denomination.trim()) {
          showToast("Denomination is required");
          return false;
        }
        break;
      case 2:
        if (!form.region.trim()) {
          showToast("Region is required");
          return false;
        }
        if (!form.district.trim()) {
          showToast("District is required");
          return false;
        }
        if (!form.street.trim()) {
          showToast("Street is required");
          return false;
        }
        break;
      case 3:
        if (!form.registrationNumber.trim()) {
          showToast("Registration Number is required");
          return false;
        }
        if (!form.phoneNo.trim()) {
          showToast("Phone Number is required");
          return false;
        }
        if (!form.email.trim()) {
          showToast("Email is required");
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
          showToast("Email format is invalid");
          return false;
        }
        break;
      case 4:
        if (!form.description.trim()) {
          showToast("Description is required");
          return false;
        }
        break;
      case 5:
        if (form.password.length < 8) {
          showToast("Password must be at least 8 characters");
          return false;
        }
        if (form.password !== form.confirmPassword) {
          showToast("Passwords do not match");
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === TOTAL_STEPS) return handleRegister();
    animateStep("right", step + 1);
  };

  const handleBackStep = () => animateStep("left", step - 1);

  // Back arrow pressed behavior
  const handleBackPress = () => {
    if (step === 1) {
      router.back();
    } else {
      handleBackStep();
    }
  };

  const handleChange = (key, value) =>
    setForm({ ...form, [key]: value });

  const openSheet = () => {
    setShowSheet(true);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/church/self-on-board`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      if (res.ok) {
        showToast("Registration successful!", "success");
        setTimeout(openSheet, 600);
      } else {
        showToast("Registration failed");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const icons = [
    "business-outline",
    "location-outline",
    "call-outline",
    "document-text-outline",
    "lock-closed-outline",
  ];

  const titles = [
    "Organization Info",
    "Location Details",
    "Contact Information",
    "Description",
    "Secure Account",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔔 TOAST */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View
            style={[
              styles.toast,
              toast.type === "success"
                ? styles.toastSuccess
                : styles.toastError,
            ]}
          >
            <Ionicons
              name={
                toast.type === "success"
                  ? "checkmark-circle"
                  : "close-circle"
              }
              size={22}
              color="#fff"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* 🔙 TOP BAR WITH CHEVRON */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Register Church</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Step {step} of {TOTAL_STEPS}
            </Text>

            <Animated.View
              style={{ width: "100%", transform: [{ translateX }] }}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={icons[step - 1]} size={42} color={GOLD} />
              </View>

              <Text style={styles.title}>{titles[step - 1]}</Text>

              {step === 1 && (
                <>
                  <Input
                    placeholder="Organization Name"
                    onChangeText={(v) => handleChange("name", v)}
                    value={form.name}
                  />
                  <Input
                    placeholder="Denomination"
                    onChangeText={(v) => handleChange("denomination", v)}
                    value={form.denomination}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <Input
                    placeholder="Region"
                    onChangeText={(v) => handleChange("region", v)}
                    value={form.region}
                  />
                  <Input
                    placeholder="District"
                    onChangeText={(v) => handleChange("district", v)}
                    value={form.district}
                  />
                  <Input
                    placeholder="Street"
                    onChangeText={(v) => handleChange("street", v)}
                    value={form.street}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <Input
                    placeholder="Registration Number"
                    onChangeText={(v) => handleChange("registrationNumber", v)}
                    value={form.registrationNumber}
                  />
                  <Input
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    onChangeText={(v) => handleChange("phoneNo", v)}
                    value={form.phoneNo}
                  />
                  <Input
                    placeholder="Email"
                    keyboardType="email-address"
                    onChangeText={(v) => handleChange("email", v)}
                    value={form.email}
                  />
                </>
              )}

              {step === 4 && (
                <Input
                  placeholder="Brief description"
                  multiline
                  style={{ height: 90, textAlignVertical: "top" }}
                  onChangeText={(v) => handleChange("description", v)}
                  value={form.description}
                />
              )}

              {step === 5 && (
                <>
                  <PasswordInput
                    placeholder="Password"
                    show={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                    onChangeText={(v) => handleChange("password", v)}
                    value={form.password}
                  />
                  <PasswordInput
                    placeholder="Confirm Password"
                    show={showConfirm}
                    toggle={() => setShowConfirm(!showConfirm)}
                    onChangeText={(v) => handleChange("confirmPassword", v)}
                    value={form.confirmPassword}
                  />
                </>
              )}

              <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextButtonText}>
                    {step === TOTAL_STEPS ? "Create Account" : "Next"}
                  </Text>
                )}
              </TouchableOpacity>

              {step > 1 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBackStep}>
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* THANK YOU SHEET */}
      <Modal transparent visible={showSheet}>
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}
          >
            <Ionicons name="checkmark-circle" size={70} color={GOLD} />
            <Text style={styles.sheetTitle}>Thank You!</Text>
            <Text style={styles.sheetText}>
              Thank you for registering. We will contact you soon.
            </Text>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.nextButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Inputs ---------- */
const Input = ({ style, ...props }) => (
  <TextInput style={[styles.input, style]} {...props} />
);

const PasswordInput = ({ show, toggle, ...props }) => (
  <View style={styles.passwordContainer}>
    <TextInput secureTextEntry={!show} style={styles.passwordInput} {...props} />
    <TouchableOpacity onPress={toggle}>
      <Ionicons
        name={show ? "eye-off-outline" : "eye-outline"}
        size={22}
        color="#888"
      />
    </TouchableOpacity>
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  inner: { paddingHorizontal: 28 },

  topBar: {
    height: Platform.OS === "android" ? 90 : 56,
    paddingTop: Platform.OS === "android" ? 30 : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    // borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topTitle: { fontSize: 18, fontWeight: "700", color: "#000" },

  progressContainer: {
    height: 5,
    backgroundColor: "#eee",
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBar: { height: "100%", backgroundColor: GOLD },
  progressText: { textAlign: "center", color: "#888", marginBottom: 20 },

  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFF8E1",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 14 },

  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    marginTop: 6,
  },
  nextButtonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },

  backButton: { marginTop: 10, alignItems: "center" },
  backText: { color: "#888" },

  /* TOAST */
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    elevation: 3,
  },
  toastSuccess: { backgroundColor: "#4CAF50" },
  toastError: { backgroundColor: "#FF3B30" },
  toastText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  sheetTitle: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  sheetText: { textAlign: "center", color: "#666", marginVertical: 10 },
});
