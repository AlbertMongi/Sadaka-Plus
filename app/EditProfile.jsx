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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from './apiConfig';

const { height } = Dimensions.get("window");
const GOLD = "#FF8C00";

const EditProfileScreen = () => {
  const navigation = useNavigation();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);

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

  // Fetch current profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(false);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token');

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        setFirstName(d.firstName || '');
        setMiddleName(d.middleName || '');
        setLastName(d.lastName || '');
        setEmail(d.email || '');
        setPhoneNo(d.phoneNo || '');
      } else {
        throw new Error(json.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error(err);
      setError(true);
      Alert.alert('Error', err.message || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save Profile
  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNo.trim()) {
      Alert.alert('Required', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token');

      const body = {
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNo: phoneNo.trim(),
      };

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        setUpdatedData(body);
        openSheet();
      } else {
        throw new Error(json.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={GOLD} />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : error ? (
            <View style={styles.error}>
              <Ionicons name="alert-circle-outline" size={48} color="#CC0000" />
              <Text style={styles.errorText}>Failed to load profile</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* First & Last Name */}
              <View style={styles.row}>
                <View style={styles.halfInputWrapper}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#aaa"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.halfInputWrapper}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#aaa"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Middle Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Middle Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Middle Name"
                  placeholderTextColor="#aaa"
                  value={middleName}
                  onChangeText={setMiddleName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 255712345678"
                  placeholderTextColor="#aaa"
                  keyboardType="phone-pad"
                  value={phoneNo}
                  onChangeText={setPhoneNo}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Success Bottom Sheet */}
      <Modal transparent visible={showSuccessSheet} onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}
              >
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Profile Updated!</Text>

                {updatedData && (
                  <View style={styles.updatedData}>
                    <Text style={styles.dataLabel}>Full Name:</Text>
                    <Text style={styles.dataValue}>
                      {[updatedData.firstName, updatedData.middleName, updatedData.lastName]
                        .filter(Boolean)
                        .join(' ')
                        .trim()}
                    </Text>

                    <Text style={styles.dataLabel}>Email:</Text>
                    <Text style={styles.dataValue}>{updatedData.email}</Text>

                    <Text style={styles.dataLabel}>Phone:</Text>
                    <Text style={styles.dataValue}>{updatedData.phoneNo}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => {
                    closeSheet();
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",    
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: { padding: 6 },
  headerTitle: {
    fontSize: 18,
    fontFamily: "GothamBold",
    color: "#000",
  },

  loading: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666", fontFamily: "GothamMedium" },

  error: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  errorText: { marginTop: 12, fontSize: 16, color: "#CC0000", fontFamily: "GothamMedium", textAlign: "center" },
  retryBtn: { marginTop: 16, backgroundColor: GOLD, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#fff", fontFamily: "GothamBold" },

  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  halfInputWrapper: { flex: 0.48 },
  inputWrapper: { marginBottom: 16 },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "GothamMedium",
    color: "#222",
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "GothamRegular",
    borderWidth: 1,
    borderColor: "#eee",
  },

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
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: height * 0.7,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontFamily: "GothamBold",
    color: "#222",
    textAlign: "center",
    marginBottom: 20,
  },
  updatedData: { marginBottom: 24 },
  dataLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "GothamMedium",
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    color: "#222",
    fontFamily: "GothamMedium",
    marginBottom: 12,
  },
  doneBtn: {
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

export default EditProfileScreen;