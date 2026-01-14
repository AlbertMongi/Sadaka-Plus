// app/main/ChangePasswordScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./apiConfig";

const GOLD = "#E18731";
const ORANGE = "#FF9F00"; // using same accent as login for consistency

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast state — exactly like in LoginScreen
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!currentPassword.trim()) {
      showToast("Please enter your current password");
      return;
    }
    if (!newPassword.trim()) {
      showToast("Please enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match");
      return;
    }

    // Optional: you can add more rules here (length, complexity...)
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showToast("Session expired. Please log in again.");
        router.replace("/login"); // or wherever your login is
        return;
      }

      const response = await fetch(`${BASE_URL}/users/profile/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        showToast("Password changed successfully!", "success");
        // Clear fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Go back after short delay so user sees the toast
        setTimeout(() => router.back(), 1200);
      } else {
        // Use whatever message backend sends — very important!
        const errorMsg = json.message || "Failed to change password";
        showToast(errorMsg);
      }
    } catch (error) {
      console.error("Change password error:", error);
      showToast("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Toast — same as LoginScreen */}
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.title}>Change Password</Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent(!showCurrent)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showCurrent ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(!showNew)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showNew ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backButton: { padding: 6 },
  title: {
    fontSize: 18,
    fontFamily: "GothamBold",
    color: "#000",
  },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    color: "#222",
    marginBottom: 6,
    fontFamily: "GothamMedium",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "GothamRegular",
  },
  eyeIcon: { padding: 12 },

  button: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 28,
    elevation: 2,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "GothamBold",
  },

  // ────────────────────────────────────────────────
  // Toast — copied from your LoginScreen (colors adjusted)
  // ────────────────────────────────────────────────
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
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toastSuccess: {
    backgroundColor: "#4CAF50", // green
  },
  toastError: {
    backgroundColor: "#FF3B30", // red (same as login)
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "GothamBold",
  },
});