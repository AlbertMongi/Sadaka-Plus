import React, { useState, useEffect } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from "./apiConfig";

const ORANGE = "#FF8C00";

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Toast helper
  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  const validatePhoneNumber = (phone) => /^\+?\d{10,15}$/.test(phone);

  const handleLogin = async () => {
    if (!phoneNo || !password) {
      showToast("Please enter both phone number and password.");
      return;
    }

    if (!validatePhoneNumber(phoneNo)) {
      showToast("Please enter a valid phone number.");
      return;
    }

    if (!isConnected) {
      showToast("No internet connection.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Login successful!", "success");
        setTimeout(() => router.push("otp2"), 800);
      } else {
        showToast(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      showToast("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // FINGERPRINT BUTTON — NOW SHOWS GREEN "COMING SOON" TOAST
  const handleFingerprintPress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Show beautiful green "Coming Soon" toast
    showToast("Fingerprint login coming soon!", "success");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Toast */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
            <Ionicons
              name={toast.type === "success" ? "checkmark-circle" : "close-circle"}
              size={22}
              color="#fff"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Login</Text>
        <View style={{ width: 36 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>
                Log in to continue to your account.
              </Text>

              {/* Phone Number */}
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                value={phoneNo}
                onChangeText={setPhoneNo}
                keyboardType="phone-pad"
              />

              {/* Password */}
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: "transparent" }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotWrapper}
                onPress={() => router.push("/ForgotPassword")}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Fingerprint Button */}
              <View style={styles.biometricContainer}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    style={styles.fingerprintButton}
                    onPress={handleFingerprintPress}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="finger-print-outline" size={46} color={ORANGE} />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/role")}>
                  <Text style={styles.footerLink}> Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    height: Platform.OS === 'android' ? 90 : 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: "#fff",
  },
  backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  scrollContent: { padding: 12, paddingBottom: 32, backgroundColor: "#fff" },

  // card: {
  //   borderRadius: 14,
  //   overflow: "hidden",
  //   elevation: 3,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.12,
  //   shadowRadius: 4,
  //   backgroundColor: "#fff",
  // },
  cardContent: { padding: 18 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
    fontFamily: "GothamBold",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontFamily: "GothamMedium",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
    fontFamily: "GothamBold",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: "GothamMedium",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eyeButton: { paddingHorizontal: 10 },
  forgotWrapper: { marginTop: 6, alignItems: "flex-end" },
  forgotText: { color: ORANGE, fontSize: 14, fontWeight: "500" },
  biometricContainer: { alignItems: "center", marginVertical: 20 },
  fingerprintButton: {
    backgroundColor: "#FFF3E9",
    padding: 14,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#FFE0C2",
  },
  submitButton: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "GothamBold",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { fontSize: 14, color: "#666" },
  footerLink: { fontSize: 14, color: ORANGE, fontWeight: "600" },

  // Toast Styles
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  toastSuccess: { 
    backgroundColor: "#4CAF50"   // GREEN for "Coming Soon" & success
  },
  toastError: { 
    backgroundColor: "#FF3B30"   // Red for errors
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "GothamBold",
  },
});