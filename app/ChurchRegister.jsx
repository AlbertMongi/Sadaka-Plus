// app/auth/RegistrationScreen.jsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
} from "react-native";
import { BASE_URL } from "./apiConfig";

const GOLD = "#FF8C00";

const RegistrationScreen = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    denomination: "",
    region: "",
    district: "",
    registrationNumber: "",
    street: "",
    phoneNo: "",
    email: "",
    description: "", // ← ADDED
    password: "",
    confirmPassword: "",
  });

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("userRole");
        if (storedRole) setRole(storedRole);
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    fetchRole();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleRegister = async () => {
    // ── VALIDATION ─────────────────────────────────────
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      alert("Please enter a valid email");
      return;
    }
    if (!form.phoneNo.match(/^\d{10}$/)) {
      alert("Phone number must be 10 digits");
      return;
    }

    const payload = {
      name: form.name.trim(),
      region: form.region.trim(),
      denomination: form.denomination.trim(),
      registrationNumber: form.registrationNumber.trim(),
      district: form.district.trim(),
      street: form.street.trim(),
      phoneNo: form.phoneNo.trim(),
      email: form.email.trim().toLowerCase(),
      description: form.description.trim(),
      role: role || "church",
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/church/self-on-board`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // ← JSON, NOT FormData
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please verify your email.");
        router.replace("/otp3"); // or push
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Register Your Organization</Text>

          {/* Organization Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Organization Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => handleChange("name", t)}
              placeholder="Enter Organization Name"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Denomination */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Denomination *</Text>
            <TextInput
              style={styles.input}
              value={form.denomination}
              onChangeText={(t) => handleChange("denomination", t)}
              placeholder="Enter Denomination"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Region & District */}
          <View style={styles.row}>
            <View style={[styles.inputWrapper, styles.halfInput]}>
              <Text style={styles.label}>Region *</Text>
              <TextInput
                style={styles.input}
                value={form.region}
                onChangeText={(t) => handleChange("region", t)}
                placeholder="Region"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={[styles.inputWrapper, styles.halfInput]}>
              <Text style={styles.label}>District *</Text>
              <TextInput
                style={styles.input}
                value={form.district}
                onChangeText={(t) => handleChange("district", t)}
                placeholder="District"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          {/* Registration Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Registration Number *</Text>
            <TextInput
              style={styles.input}
              value={form.registrationNumber}
              onChangeText={(t) => handleChange("registrationNumber", t)}
              placeholder="Enter Registration Number"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Street */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Street *</Text>
            <TextInput
              style={styles.input}
              value={form.street}
              onChangeText={(t) => handleChange("street", t)}
              placeholder="Enter Street"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={form.phoneNo}
              onChangeText={(t) => handleChange("phoneNo", t)}
              placeholder="e.g. 0501234567"
              keyboardType="phone-pad"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(t) => handleChange("email", t)}
              placeholder="Enter Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Description */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              value={form.description}
              onChangeText={(t) => handleChange("description", t)}
              placeholder="Briefly describe your organization"
              multiline
              numberOfLines={4}
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: "transparent" }]}
                value={form.password}
                onChangeText={(t) => handleChange("password", t)}
                placeholder="Min 8 characters"
                secureTextEntry={!showPassword}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: "transparent" }]}
                value={form.confirmPassword}
                onChangeText={(t) => handleChange("confirmPassword", t)}
                placeholder="Re-enter password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.footerLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    fontSize: 14,
    color: "#aaa",
  },
  footerLink: {
    fontSize: 14,
    color: GOLD,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: 7.5,
  },
});

export default RegistrationScreen;