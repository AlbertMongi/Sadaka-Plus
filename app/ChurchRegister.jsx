import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "./apiConfig";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const GOLD = "#E18731";

export default function ChurchRegistrationScreen() {
  const { t } = useTranslation();
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
  const showToast = (key, type = "error", params = {}) => {
    setToast({
      visible: true,
      message: t(key, params),
      type,
    });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "error" });
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
          showToast("church_registration.errors.organization_name_required");
          return false;
        }
        if (!form.denomination.trim()) {
          showToast("church_registration.errors.denomination_required");
          return false;
        }
        break;
      case 2:
        if (!form.region.trim()) {
          showToast("church_registration.errors.region_required");
          return false;
        }
        if (!form.district.trim()) {
          showToast("church_registration.errors.district_required");
          return false;
        }
        if (!form.street.trim()) {
          showToast("church_registration.errors.street_required");
          return false;
        }
        break;
      case 3:
        if (!form.registrationNumber.trim()) {
          showToast("church_registration.errors.registration_number_required");
          return false;
        }
        if (!form.phoneNo.trim()) {
          showToast("church_registration.errors.phone_required");
          return false;
        }
        if (!form.email.trim()) {
          showToast("church_registration.errors.email_required");
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
          showToast("church_registration.errors.invalid_email");
          return false;
        }
        break;
      case 4:
        if (!form.description.trim()) {
          showToast("church_registration.errors.description_required");
          return false;
        }
        break;
      case 5:
        if (form.password.length < 8) {
          showToast("church_registration.errors.password_min_length", { min: 8 });
          return false;
        }
        if (form.password !== form.confirmPassword) {
          showToast("church_registration.errors.passwords_do_not_match");
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
      const payload = {
        name: form.name,
        region: form.region,
        denomination: form.denomination,
        registrationNumber: form.registrationNumber,
        district: form.district,
        street: form.street,
        phoneNo: form.phoneNo,
        email: form.email,
        description: form.description,
        role: "ROLE_COMMUNITY_ADMIN",
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      const res = await fetch(`${BASE_URL}/auth/church/self-on-board`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("church_registration.success.registered", "success");
        setTimeout(openSheet, 600);
      } else {
        showToast("church_registration.errors.registration_failed");
      }
    } catch {
      showToast("common.network_error");
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

  const stepTitles = [
    t("church_registration.step1_title"),
    t("church_registration.step2_title"),
    t("church_registration.step3_title"),
    t("church_registration.step4_title"),
    t("church_registration.step5_title"),
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
        <Text style={styles.topTitle}>{t("church_registration.title")}</Text>
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
              {t("church_registration.step_of", { current: step, total: TOTAL_STEPS })}
            </Text>

            <Animated.View
              style={{ width: "100%", transform: [{ translateX }] }}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={icons[step - 1]} size={42} color={GOLD} />
              </View>

              <Text style={styles.title}>{stepTitles[step - 1]}</Text>

              {step === 1 && (
                <>
                  <Input
                    placeholder={t("church_registration.organization_name")}
                    onChangeText={(v) => handleChange("name", v)}
                    value={form.name}
                  />
                  <Input
                    placeholder={t("church_registration.denomination")}
                    onChangeText={(v) => handleChange("denomination", v)}
                    value={form.denomination}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <Input
                    placeholder={t("church_registration.region")}
                    onChangeText={(v) => handleChange("region", v)}
                    value={form.region}
                  />
                  <Input
                    placeholder={t("church_registration.district")}
                    onChangeText={(v) => handleChange("district", v)}
                    value={form.district}
                  />
                  <Input
                    placeholder={t("church_registration.street")}
                    onChangeText={(v) => handleChange("street", v)}
                    value={form.street}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <Input
                    placeholder={t("church_registration.registration_number")}
                    onChangeText={(v) => handleChange("registrationNumber", v)}
                    value={form.registrationNumber}
                  />
                  <Input
                    placeholder={t("church_registration.phone_number")}
                    keyboardType="phone-pad"
                    onChangeText={(v) => handleChange("phoneNo", v)}
                    value={form.phoneNo}
                  />
                  <Input
                    placeholder={t("church_registration.email")}
                    keyboardType="email-address"
                    onChangeText={(v) => handleChange("email", v)}
                    value={form.email}
                  />
                </>
              )}

              {step === 4 && (
                <Input
                  placeholder={t("church_registration.description")}
                  multiline
                  style={{ height: 90, textAlignVertical: "top" }}
                  onChangeText={(v) => handleChange("description", v)}
                  value={form.description}
                />
              )}

              {step === 5 && (
                <>
                  <PasswordInput
                    placeholder={t("church_registration.password")}
                    show={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                    onChangeText={(v) => handleChange("password", v)}
                    value={form.password}
                  />
                  <PasswordInput
                    placeholder={t("church_registration.confirm_password")}
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
                    {step === TOTAL_STEPS
                      ? t("church_registration.create_account")
                      : t("common.next")}
                  </Text>
                )}
              </TouchableOpacity>

              {step > 1 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBackStep}>
                  <Text style={styles.backText}>{t("common.back")}</Text>
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
            <Text style={styles.sheetTitle}>{t("church_registration.thank_you")}</Text>
            <Text style={styles.sheetText}>
              {t("church_registration.kyc_contact_message")}
            </Text>

            <TouchableOpacity
              style={styles.nextButton1}
              activeOpacity={0.8}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.nextButtonText1}>{t("common.login")}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Custom Input Components ---------- */
const Input = ({ style, ...props }) => (
  <TextInput
    style={[styles.input, style]}
    placeholderTextColor="#999"
    {...props}
  />
);

const PasswordInput = ({ show, toggle, ...props }) => (
  <View style={styles.passwordContainer}>
    <TextInput
      secureTextEntry={!show}
      style={styles.passwordInput}
      placeholderTextColor="#999"
      {...props}
    />
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
  
  nextButton1: {
  backgroundColor: GOLD,   // nice blue
  paddingVertical: 14,
  borderRadius: 12,
  width: "80%",          // 🔥 increase width
  alignSelf: "center",   // center the button
  justifyContent: "center",
  marginTop: 20,
  // shadowColor: "#000",
  shadowOffset: { width: 3, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 6, // Android shadow
},

nextButtonText1: {
  color: "#FFFFFF",
  fontSize: 15,
  alignSelf: "center",
  fontWeight: "700",
  letterSpacing: 0.5,
},

});
