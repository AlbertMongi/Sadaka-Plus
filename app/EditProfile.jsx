// EditProfileScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from "./apiConfig";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");
const ORANGE = "#FF8C00";
const GOLD = "#E18731";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Toast State (Same as all screens)
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  // Bottom Sheet
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  const sheetAnim = useRef(new Animated.Value(height)).current;

  const showToast = (key, type = "error", params = {}) => {
    setToast({
      visible: true,
      message: t(key, params),
      type,
    });
    setTimeout(() => setToast({ visible: false, message: "", type: "error" }), 3500);
  };

  // Network Detection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) showToast("common.no_internet_connection", "error");
    });
    return () => unsubscribe();
  }, []);

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

  const fetchProfile = async () => {
    if (!isConnected) {
      showToast("common.no_internet_connection", "error");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showToast("common.session_expired", "error");
        router.replace("/login");
        return;
      }

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        setFirstName(d.firstName || "");
        setMiddleName(d.middleName || "");
        setLastName(d.lastName || "");
        setEmail(d.email || "");
        setPhoneNo(d.phoneNo || "");
      } else {
        throw new Error(json.message || "Failed to load profile");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      showToast("profile.errors.load_failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isConnected]);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNo.trim()) {
      showToast("profile.errors.required_fields", "error");
      return;
    }

    if (!isConnected) {
      showToast("common.no_internet_connection", "error");
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No token");

      const body = {
        firstName: firstName.trim(),
        middleName: middleName.trim() || null,
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNo: phoneNo.trim(),
      };

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        setUpdatedData(body);
        openSheet();
      } else {
        throw new Error(json.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("profile.errors.update_failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Toast */}
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{t("profile.edit_title")}</Text>
          <View style={{ width: 36 }} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ORANGE} />
                <Text style={styles.loadingText}>{t("profile.loading")}</Text>
              </View>
            ) : (
              <>
                {/* Name Row */}
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>{t("profile.first_name_required")}</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder={t("profile.first_name_placeholder")}
                      placeholderTextColor="#999"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>{t("profile.last_name_required")}</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder={t("profile.last_name_placeholder")}
                      placeholderTextColor="#999"
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Middle Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("profile.middle_name_optional")}</Text>
                  <TextInput
                    style={styles.input}
                    value={middleName}
                    onChangeText={setMiddleName}
                    placeholder={t("profile.middle_name_placeholder")}
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("profile.email_required")}</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t("profile.email_placeholder")}
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Phone - Uncomment if you want to allow editing */}
                {/* <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("profile.phone_required")}</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNo}
                    onChangeText={setPhoneNo}
                    placeholder={t("profile.phone_placeholder")}
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View> */}

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>{t("profile.save_changes")}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Success Bottom Sheet */}
        <Modal visible={showSuccessSheet} transparent animationType="none">
          <TouchableWithoutFeedback onPress={closeSheet}>
            <View style={styles.modalOverlay}>
              <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>

                <Ionicons name="checkmark-circle" size={80} color={GOLD} style={{ alignSelf: "center", marginVertical: 20 }} />

                <Text style={styles.sheetTitle}>{t("profile.updated_success")}</Text>
                <Text style={styles.sheetSubtitle}>{t("profile.changes_saved")}</Text>

                {updatedData && (
                  <View style={styles.updatedInfo}>
                    <Text style={styles.infoText}>
                      {[
                        updatedData.firstName,
                        updatedData.middleName,
                        updatedData.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>
                    <Text style={styles.infoText}>{updatedData.email}</Text>
                    {updatedData.phoneNo && (
                      <Text style={styles.infoText}>{updatedData.phoneNo}</Text>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => {
                    closeSheet();
                    router.back();
                  }}
                >
                  <Text style={styles.doneBtnText}>{t("common.done.title")}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
// CONSISTENT STYLES - 100% Match with your app
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  topBar: {
    height: Platform.OS === "android" ? 90 : 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "android" ? 30 : 0,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#000", fontFamily: "GothamBold" },

  scrollContent: { padding: 12, paddingBottom: 40 },

  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  halfInput: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    fontFamily: "GothamBold",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: "GothamMedium",
  },

  saveBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "GothamBold" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666", fontFamily: "GothamMedium" },

  // Toast
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
  toastSuccess: { backgroundColor: "#4CAF50" },
  toastError: { backgroundColor: "#FF3B30" },
  toastText: { color: "#fff", fontSize: 15, fontWeight: "600", fontFamily: "GothamBold" },

  // Bottom Sheet
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
    maxHeight: "70%",
  },
  dragHandleContainer: { alignItems: "center", paddingVertical: 8 },
  dragHandle: { width: 40, height: 5, backgroundColor: "#ddd", borderRadius: 3 },
  sheetTitle: { fontSize: 22, fontFamily: "GothamBold", color: "#333", textAlign: "center", marginBottom: 8 },
  sheetSubtitle: { fontSize: 16, color: "#555", textAlign: "center", fontFamily: "GothamMedium", marginBottom: 20 },
  updatedInfo: { alignItems: "center", marginVertical: 16 },
  infoText: { fontSize: 16, color: "#333", marginVertical: 4, fontFamily: "GothamMedium" },
  doneBtn: { backgroundColor: GOLD, borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "GothamBold" },
});