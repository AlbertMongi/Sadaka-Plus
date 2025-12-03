// app/main/ChangeCommunityScreen.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  PanResponder,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from "./apiConfig";

const ORANGE = "#FF8C00";
const GOLD = "#E18731";
const FALLBACK_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s";

// Reusable fetch with token + retry
const fetchWithToken = async (url, options = {}, retries = 2) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("No token");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      if (res.status === 401 && retries > 0) {
        await AsyncStorage.removeItem("userToken");
        throw new Error("Token expired");
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "API error");
    return data;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return fetchWithToken(url, options, retries - 1);
    }
    throw err;
  }
};

export default function ChangeCommunityScreen() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Toast State (Same as LoginScreen)
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  // Bottom Sheet
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [selectedCommunityName, setSelectedCommunityName] = useState("");
  const sheetAnim = useRef(new Animated.Value(600)).current;

  // Toast Helper
  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  // Check Network
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
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
      toValue: 600,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowSuccessSheet(false));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => gesture.dy > 0 && sheetAnim.setValue(gesture.dy),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 150 || gesture.vy > 0.5) {
        closeSheet();
      } else {
        Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  }).panHandlers;

  const fetchJoinedCommunities = useCallback(async () => {
    if (!isConnected) {
      setLoading(false);
      showToast("No internet connection.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithToken(`${BASE_URL}/communities/joined`);
      if (res?.success && Array.isArray(res.data)) {
        const formatted = res.data.map((c) => ({
          id: c.id.toString(),
          name: c.name || "Unnamed Community",
          description: c.description || "No description available",
          logo: c.logo && c.logo.startsWith("http") ? c.logo : FALLBACK_IMAGE,
        }));
        setCommunities(formatted);

        const stored = await AsyncStorage.getItem("selectedCommunityId");
        if (stored && formatted.some((c) => c.id === stored)) {
          setSelectedId(stored);
        }
      } else {
        setCommunities([]);
        showToast("No communities found.", "error");
      }
    } catch (err) {
      console.error("Fetch communities error:", err);
      setCommunities([]);
      showToast("Failed to load communities.", "error");
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    fetchJoinedCommunities();
  }, [fetchJoinedCommunities]);

  const handleSelect = async (community) => {
    try {
      await AsyncStorage.setItem("selectedCommunityId", community.id);
      setSelectedId(community.id);
      setSelectedCommunityName(community.name);
      openSheet();
    } catch (e) {
      showToast("Failed to save selection.", "error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Custom Toast - Same as LoginScreen */}
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

      {/* Top Bar - Fixed & Consistent */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Community</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card - Same Style as Login */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Your Joined Communities</Text>
            <Text style={styles.cardSubtitle}>
              Select a community to switch into.
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ORANGE} />
                <Text style={styles.loadingText}>Loading communities...</Text>
              </View>
            ) : communities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Communities Yet</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't joined any community. Explore and join one!
                </Text>
              </View>
            ) : (
              communities.map((community) => (
                <TouchableOpacity
                  key={community.id}
                  style={[
                    styles.communityButton,
                    selectedId === community.id && styles.selectedCommunity,
                  ]}
                  onPress={() => handleSelect(community)}
                >
                  <View style={styles.communityRow}>
                    <View style={styles.iconCircle}>
                      <Image source={{ uri: community.logo }} style={styles.communityLogo} resizeMode="cover" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.communityName}>{community.name}</Text>
                      <Text style={styles.communityDesc} numberOfLines={1}>
                        {community.description}
                      </Text>
                    </View>
                    {selectedId === community.id && (
                      <Ionicons name="checkmark-circle" size={28} color={ORANGE} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Success Bottom Sheet */}
      <Modal visible={showSuccessSheet} transparent animationType="none">
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[styles.modalContainer, { transform: [{ translateY: sheetAnim }] }]}
              {...panResponder}
            >
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>

              <Ionicons name="checkmark-circle" size={70} color={GOLD} style={{ alignSelf: "center", marginVertical: 20 }} />
              <Text style={styles.successTitle}>Community Changed!</Text>
              <Text style={styles.successMessage}>You are now in</Text>
              <Text style={styles.successCommunity}>{selectedCommunityName}</Text>

              <TouchableOpacity
                style={styles.successBtn}
                onPress={() => {
                  closeSheet();
                  router.back();
                }}
              >
                <Text style={styles.successBtnText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// CONSISTENT STYLES - 100% Match with LoginScreen
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    height: Platform.OS === 'android' ? 90 : 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
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
    lineHeight: 20,
    fontFamily: "GothamMedium",
  },

  loadingContainer: { alignItems: "center", marginVertical: 50 },
  loadingText: { marginTop: 12, color: "#555", fontSize: 15, fontFamily: "GothamMedium" },

  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginTop: 16, fontFamily: "GothamBold" },
  emptySubtitle: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 8, paddingHorizontal: 20, fontFamily: "GothamMedium" },

  communityButton: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },
  selectedCommunity: {
    borderColor: ORANGE,
    backgroundColor: "#FFF3E9",
    borderWidth: 2,
  },
  communityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconCircle: {
    width: 56,
    height: 56,
    backgroundColor: "#FFF1E0",
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  communityLogo: { width: "100%", height: "100%" },
  communityName: { fontSize: 16, fontWeight: "600", color: "#000", fontFamily: "GothamBold" },
  communityDesc: { fontSize: 13, color: "#666", marginTop: 4, fontFamily: "GothamMedium" },

  // Toast (Exact same as LoginScreen)
  toastContainer: { position: "absolute", top: 60, left: 20, right: 20, zIndex: 9999, alignItems: "center" },
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
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
    maxHeight: "70%",
  },
  dragHandleContainer: { alignItems: "center", paddingVertical: 8 },
  dragHandle: { width: 40, height: 5, backgroundColor: "#ddd", borderRadius: 3 },
  successTitle: { fontSize: 22, fontFamily: "GothamBold", color: "#333", textAlign: "center", marginBottom: 8 },
  successMessage: { fontSize: 15, color: "#555", textAlign: "center", fontFamily: "GothamMedium" },
  successCommunity: { fontSize: 20, color: GOLD, textAlign: "center", fontFamily: "GothamBold", marginVertical: 12 },
  successBtn: { backgroundColor: GOLD, borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  successBtnText: { color: "#fff", fontSize: 16, fontFamily: "GothamBold" },
});