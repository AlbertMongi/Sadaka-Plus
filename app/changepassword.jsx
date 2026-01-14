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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from "./apiConfig";

const PRIMARY = "#FF9F00";
const PRIMARY_DARK = "#E88A00";
const TEXT_DARK = "#1A1A1A";
const TEXT_GRAY = "#606060";
const BG = "#FFFFFF";
const INPUT_BG = "#FAFAFA";
const BORDER = "#E0E0E0";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Toast control
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "error", // "error" | "success" | "info"
  });

  const toastOpacity = new Animated.Value(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });

    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.trim().replace(/\s+/g, "");
    return /^\+?\d{9,15}$/.test(cleaned);
  };

  const handleLogin = async () => {
    // ── Client-side validation ── all shown via toast only
    if (!phoneNo.trim() || !password.trim()) {
      showToast("Phone number and password are required", "error");
      return;
    }

    if (!validatePhoneNumber(phoneNo)) {
      showToast("Please enter a valid phone number (9–15 digits)", "error");
      return;
    }

    if (!isConnected) {
      showToast("No internet connection. Please check your network", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo: phoneNo.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Login successful!", "success");
        setTimeout(() => router.push("otp2"), 1100);
      } else {
        // Server message or fallback — always via toast
        showToast(data.message || "Login failed. Please check your credentials", "error");
      }
    } catch (err) {
      showToast("Network error — please try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Toast (only place where messages appear) ── */}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toastWrapper,
            {
              opacity: toastOpacity,
              backgroundColor:
                toast.type === "success"
                  ? "#4CAF50"
                  : toast.type === "info"
                  ? "#2196F3"
                  : "#EF5350",
            },
          ]}
        >
          <Ionicons
            name={
              toast.type === "success"
                ? "checkmark-circle"
                : toast.type === "info"
                ? "information-circle"
                : "alert-circle"
            }
            size={22}
            color="#fff"
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formWrapper}>
            <Text style={styles.screenTitle}>Welcome Back</Text>
            <Text style={styles.screenSubtitle}>Sign in to continue</Text>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +255712345678"
                placeholderTextColor="#AAA"
                value={phoneNo}
                onChangeText={setPhoneNo}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="telephoneNumber"
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { borderWidth: 0 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#AAA"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => router.push("/ForgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/role")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: height > 800 ? 80 : 60,
    paddingBottom: 40,
  },
  formWrapper: {
    flex: 1,
    maxWidth: 460,
    alignSelf: "center",
    width: "100%",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: TEXT_GRAY,
    marginBottom: 48,
  },
  field: {
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  input: {
    height: 56,
    backgroundColor: INPUT_BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: TEXT_DARK,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 36,
  },
  forgotText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "600",
  },
  loginButton: {
    height: 58,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "#FFB74D",
    shadowOpacity: 0.14,
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  signupText: {
    color: TEXT_GRAY,
    fontSize: 15,
  },
  signupLink: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "600",
  },
  // Toast ── the ONLY place messages are shown
  toastWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 38,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
});