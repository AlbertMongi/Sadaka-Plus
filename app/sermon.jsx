import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from './apiConfig';
import { fetchBase64Image } from './fetchBase64Image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORANGE = '#FF6B00';
const GOLD = '#E18731';
const FALLBACK_IMAGE =
  'https://st2.depositphotos.com/4431055/11855/i/450/depositphotos_118551182-stock-photo-holy-bible-book.jpg';
const IMAGE_HORIZONTAL_PADDING = 16;

// ────────────────────────────────────────────────
// Image caching (like Community.jsx)
// ────────────────────────────────────────────────
const imageCache = new Map();
const CACHE_PREFIX = 'sermon_';

async function getCachedImage(remoteUri) {
  if (!remoteUri || remoteUri === FALLBACK_IMAGE) return FALLBACK_IMAGE;

  if (imageCache.has(remoteUri)) {
    return imageCache.get(remoteUri);
  }

  const filename = CACHE_PREFIX + btoa(remoteUri).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;

  try {
    const { exists } = await FileSystem.getInfoAsync(fileUri);
    if (exists) {
      const localUri = `file://${fileUri}`;
      imageCache.set(remoteUri, localUri);
      return localUri;
    }
  } catch (e) {
    console.warn('Sermon file cache check failed', e);
  }

  try {
    const base64Data = await fetchBase64Image(remoteUri);
    if (!base64Data) throw new Error('No base64 data returned');

    const pureBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    await FileSystem.writeAsStringAsync(fileUri, pureBase64, { encoding: FileSystem.EncodingType.Base64 });

    const localUri = `file://${fileUri}`;
    imageCache.set(remoteUri, localUri);
    return localUri;
  } catch (err) {
    console.warn('Sermon image fetch/cache failed:', err);
    return FALLBACK_IMAGE;
  }
}

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

  const loadSermon = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await fetchWithToken(`${BASE_URL}/sermons/${id}`);

    if (data?.success && data.data) {
      const { name, description, photo, likes, liked } = data.data;

      const sermonImage = await getCachedImage(photo);

      setPlan({
        title: name || 'Untitled Sermon',
        description: description || '',
        image: sermonImage,
      });

      setIsLiked(!!liked);
      setLikeCount(Number(likes) || 0);
    } else {
      setPlan(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadSermon();
  }, [loadSermon]);

  const handleLike = async () => {
    if (!plan || !isConnected) {
      showToast("No internet connection.");
      return;
    }

    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);

    const res = await fetchWithToken(`${BASE_URL}/likes/sermon/${id}`, {
      method: 'POST',
      body: JSON.stringify({ sermon_id: id }),
    });

    if (!res?.success) {
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount + 1 : likeCount - 1);
      showToast("Failed to like sermon.");
    }
  };

  const handleShare = async () => {
    if (!plan) return;

    try {
      const shareMessage =
        `${plan.title}\n\n` +
        `${plan.description.trim() || "A powerful sermon worth listening to."}\n\n` +
        `Sadaka Plus`;

      await Share.share({ message: shareMessage, title: plan.title });
    } catch (err) {
      console.log('Share failed:', err);
      showToast("Couldn't share sermon.");
    }
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
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
            <Ionicons name={toast.type === "success" ? "checkmark-circle" : "close-circle"} size={22} color="#fff" />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      <View style={[styles.topBar, { height: Platform.OS === 'android' ? 90 : 56, paddingTop: Platform.OS === 'android' ? 30 : 0 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.mainTitle} numberOfLines={1}>{plan.title}</Text>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="arrow-up" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: plan.image || FALLBACK_IMAGE }}
            style={styles.heroImage}
            resizeMode="cover"
            defaultSource={{ uri: FALLBACK_IMAGE }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? GOLD : ORANGE} />
              <Text style={[styles.actionText, { color: isLiked ? GOLD : ORANGE }]}>{likeCount}</Text>
            </TouchableOpacity>

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
    borderBottomColor: '#eee',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  mainTitle: { flex: 1, marginLeft: 8, fontSize: 20, fontWeight: '700', color: '#111', fontFamily: 'GothamBold' },
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
  description: { fontSize: 15, color: '#333', lineHeight: 23, paddingHorizontal: 16, fontFamily: 'GothamMedium' },
  toastContainer: { position: "absolute", top: 60, left: 20, right: 20, zIndex: 9999, alignItems: "center" },
  toast: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10, gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3 },
  toastSuccess: { backgroundColor: "#4CAF50" },
  toastError: { backgroundColor: "#FF3B30" },
  toastText: { color: "#fff", fontSize: 15, fontWeight: "600", fontFamily: "GothamBold" },
});
