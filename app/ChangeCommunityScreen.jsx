// app/main/ChangeCommunityScreen.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
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
import { BASE_URL } from "./apiConfig";

const ORANGE = "#FF6B00";
const GOLD = "#E18731";
const FALLBACK_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s";
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Reusable fetch with token + retry
const fetchWithToken = async (url, options = {}, retries = MAX_RETRIES) => {
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
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
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

  // Bottom Sheet State
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [selectedCommunityName, setSelectedCommunityName] = useState("");
  const sheetAnim = useRef(new Animated.Value(600)).current;

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
    onPanResponderMove: (_, g) => g.dy > 0 && sheetAnim.setValue(g.dy),
    onPanResponderRelease: (_, g) =>
      g.dy > 150 || g.vy > 0.5
        ? closeSheet()
        : Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true }).start(),
  }).panHandlers;

  const fetchJoinedCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken(`${BASE_URL}/communities/joined`);
      if (res?.success && Array.isArray(res.data)) {
        const formatted = res.data.map((c) => ({
          id: c.id.toString(),
          name: c.name || "Unnamed",
          description: c.description || "No description",
          logo: c.logo && c.logo.startsWith("http") ? c.logo : FALLBACK_IMAGE,
        }));
        setCommunities(formatted);

        const stored = await AsyncStorage.getItem("selectedCommunityId");
        if (stored && formatted.some((c) => c.id === stored)) {
          setSelectedId(stored);
        }
      } else {
        setCommunities([]);
      }
    } catch (err) {
      console.error("Error:", err);
      Alert.alert("Error", "Failed to load communities.");
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      Alert.alert("Error", "Could not save selection.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Community</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              <Text style={styles.emptyText}>
                You haven’t joined any communities yet.
              </Text>
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
                      <Image
                        source={{ uri: community.logo }}
                        style={styles.communityLogo}
                        resizeMode="cover"
                        // defaultSource={require("../../assets/icon.png")} // optional fallback
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.communityName}>{community.name}</Text>
                      <Text style={styles.communityDesc} numberOfLines={1}>
                        {community.description}
                      </Text>
                    </View>
                    {selectedId === community.id && (
                      <Ionicons name="checkmark-circle" size={24} color={ORANGE} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Success Bottom Sheet (Same as Wallet) */}
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

              <Ionicons
                name="checkmark-circle"
                size={60}
                color={GOLD}
                style={{ alignSelf: "center", marginVertical: 16 }}
              />

              <Text style={styles.successTitle}>Community Changed!</Text>
              <Text style={styles.successMessage}>
                You are now in
              </Text>
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

// Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    height: Platform.OS === 'android' ? 78 : -89,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 25 : 10,
    backgroundColor: "#fff",
    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  scrollContent: {
    padding: 9,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },
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
  loadingContainer: { alignItems: "center", marginVertical: 40 },
  loadingText: { marginTop: 10, color: "#555", fontSize: 14 },
  emptyText: {
    textAlign: "center",
    color: "#777",
    fontSize: 15,
    marginTop: 40,
  },
  communityButton: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },
  selectedCommunity: {
    borderColor: ORANGE,
    backgroundColor: "#FFF3E9",
  },
  communityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    backgroundColor: "#FFF1E0",
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  communityLogo: {
    width: "100%",
    height: "100%",
  },
  communityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    fontFamily: "GothamBold",
  },
  communityDesc: {
    fontSize: 13,
    color: "#666",
    fontFamily: "GothamMedium",
  },

  // Bottom Sheet (Same as Wallet)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
    maxHeight: "60%",
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: "GothamBold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    fontFamily: "GothamRegular",
  },
  successCommunity: {
    fontSize: 18,
    color: GOLD,
    textAlign: "center",
    fontFamily: "GothamBold",
    marginTop: 6,
    marginBottom: 24,
  },
  successBtn: {
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  successBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "GothamBold",
  },
});