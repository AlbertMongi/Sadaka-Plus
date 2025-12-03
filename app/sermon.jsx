// app/sermon.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from './apiConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORANGE = '#FF6B00';
const GOLD = '#E18731';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
const IMAGE_HORIZONTAL_PADDING = 16;

export default function PlanInfoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });
  const showToast = (msg, type = "error") => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "error" }), 3000);
  };

  // Network
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) showToast("No internet connection.");
    });
    return () => unsubscribe();
  }, []);

  const fetchWithToken = async (url, options = {}) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showToast("Session expired.");
        router.replace("/login");
        return null;
      }

      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (res.status === 401) {
        await AsyncStorage.removeItem("userToken");
        showToast("Session expired.");
        router.replace("/login");
        return null;
      }

      return await res.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadSermon = async () => {
      setLoading(true);
      const data = await fetchWithToken(`${BASE_URL}/sermons/${id}`);

      if (data?.success && data.data) {
        const { name, description, photo, likes, liked } = data.data;

        setPlan({
          title: name || 'Untitled Sermon',
          description: description || '',
          image: photo && photo.startsWith("http") ? photo : FALLBACK_IMAGE,
        });

        setIsLiked(!!liked);           // true or false
        setLikeCount(Number(likes) || 0);
      } else {
        setPlan(null);
      }
      setLoading(false);
    };

    loadSermon();
  }, [id]);

  // LIKE / UNLIKE – NOW VISUALLY PERFECT
  const handleLike = async () => {
    if (!plan || !isConnected) {
      showToast("No internet connection.");
      return;
    }

    const wasLiked = isLiked;

    // Optimistic update
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);

    const res = await fetchWithToken(`${BASE_URL}/likes/sermon/${id}`, {
      method: 'POST',
      body: JSON.stringify({ sermon_id: id }),
    });

    // If failed → rollback
    if (!res?.success) {
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount + 1 : likeCount - 1);
      showToast("Failed to like sermon.");
    }
    // Success → already updated optimistically, no need to do anything
  };

  const handleShare = async () => {
    if (!plan) return;
    try {
      await Share.share({
        message: `${plan.title}\n\n${plan.description}`,
        title: plan.title,
      });
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Sermon not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Toast */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
            <Ionicons name={toast.type === "success" ? "checkmark-circle" : "close-circle"} size={22} color="#fff" />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* Top Bar */}
      <View style={[styles.topBar, { height: Platform.OS === 'android' ? 90 : 56, paddingTop: Platform.OS === 'android' ? 30 : 0 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.mainTitle} numberOfLines={1}>
          {plan.title}
        </Text>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="arrow-up" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: plan.image }} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.actionButtons}>
            {/* LIKE BUTTON – NOW VISUALLY FIXED */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}   // THIS WAS THE BUG!
                size={20}
                color={isLiked ? GOLD : ORANGE}
              />
              <Text style={[styles.actionText, { color: isLiked ? GOLD : ORANGE }]}>
                {likeCount}
              </Text>
            </TouchableOpacity>

            {/* SHARE */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={ORANGE} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.description}>{plan.description}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* YOUR ORIGINAL STYLES – 100% UNCHANGED */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red', fontFamily: 'GothamMedium' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  mainTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    fontFamily: 'GothamBold',
  },
  shareButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 100 },
  imageContainer: {
    width: SCREEN_WIDTH - 2 * IMAGE_HORIZONTAL_PADDING,
    height: 240,
    marginHorizontal: IMAGE_HORIZONTAL_PADDING,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  buttonContainer: { paddingHorizontal: 16, marginBottom: 24 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  actionText: { fontSize: 14, marginLeft: 8, fontWeight: '600', fontFamily: 'GothamBold' },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
    paddingHorizontal: 16,
    fontFamily: 'GothamMedium',
  },
  // Toast styles (same as all screens)
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
});