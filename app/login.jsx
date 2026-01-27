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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./apiConfig";

const ORANGE = "#FF9F00";

export default function LoginScreen() {
  const router = useRouter();

  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "error",
  });

  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3500);
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

      if (res.ok && data.success) {
        // ✅ SAVE PHONE NUMBER FOR OTP SCREEN
        await AsyncStorage.setItem("userPhoneNo", phoneNo);

        showToast("Login successful!", "success");

        // ✅ ALWAYS GO TO OTP SCREEN (NO ADMIN ROUTING)
        setTimeout(() => {
          router.push({
            pathname: "/otp2",
            params: { phoneNo },
          });
        }, 800);
      } else {
        showToast(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      showToast("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    showToast("Fingerprint login coming soon!", "success");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.title}>Login</Text>
        <View style={{ width: 36 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Log in to continue to your account.
            </Text>

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              value={phoneNo}
              onChangeText={setPhoneNo}
              keyboardType="phone-pad"
            />

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

            <TouchableOpacity
              style={styles.forgotWrapper}
              onPress={() => router.push("/ForgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

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

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/role")}>
                <Text style={styles.footerLink}> Sign Up</Text>
              </TouchableOpacity>
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
    height: Platform.OS === "android" ? 90 : 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "android" ? 30 : 50,
  },
  title: { fontSize: 18, fontWeight: "700" },
  scrollContent: { padding: 12, paddingBottom: 32 },
  cardContent: { padding: 18 },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eyeButton: { paddingHorizontal: 10 },
  forgotWrapper: { marginTop: 6, alignItems: "flex-end" },
  forgotText: { color: ORANGE },
  submitButton: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#666" },
  footerLink: { color: ORANGE, fontWeight: "600" },

  toastContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  toastSuccess: { backgroundColor: "#4CAF50" },
  toastError: { backgroundColor: "#FF3B30" },
  toastText: { color: "#fff", fontWeight: "600" },
});
