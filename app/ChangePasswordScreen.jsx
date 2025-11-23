// app/main/ChangePasswordScreen.jsx
import React, { useState, useRef } from "react";
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
  Alert,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./apiConfig";

const { height } = Dimensions.get("window");
const GOLD = "#E18731";

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);

  // Bottom Sheet Animation
  const sheetAnim = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setShowSuccessSheet(true);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowSuccessSheet(false));
  };

  const handleSubmit = async () => {
    // === Validation ===
    if (!currentPassword.trim()) {
      Alert.alert("Required", "Please enter your current password");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("Required", "Please enter a new password");
      return;
    }
   
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in again.");
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
        openSheet();
        // Optionally clear fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorMsg = json.message || "Failed to change password";
        Alert.alert("Error", errorMsg);
      }
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

      {/* Success Bottom Sheet */}
      <Modal transparent visible={showSuccessSheet} onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.sheet,
                  { transform: [{ translateY: sheetAnim }] },
                ]}
              >
                <View style={styles.dragHandle} />
                <Ionicons
                  name="checkmark-circle"
                  size={60}
                  color={GOLD}
                  style={styles.successIcon}
                />
                <Text style={styles.successTitle}>Password Changed!</Text>
                <Text style={styles.successMessage}>
                  Your password has been updated successfully.
                </Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => {
                    closeSheet();
                    router.back();
                  }}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// Styles – Gotham fonts + consistent design
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: { padding: 6 },
  title: {
    fontSize: 18,
    fontFamily: "GothamBold",
    color: "#000",
  },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
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
    marginTop: 20,
    elevation: 2,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "GothamBold",
  },

  // Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.5,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  successIcon: { alignSelf: "center", marginVertical: 16 },
  successTitle: {
    fontSize: 19,
    fontFamily: "GothamBold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    fontFamily: "GothamRegular",
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "GothamBold",
  },
});