// app/main/community.jsx   (or LiveTeachings.jsx)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
  RefreshControl as RNRefreshControl,
  TextInput, // ← Added for search
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';

import { BASE_URL } from '../apiConfig';

const { width } = Dimensions.get('window');
const ORANGE = "#FF8C00";
const GOLD = "#E18731";

// Toast Component
const Toast = ({ visible, message, type = "error" }) => {
  if (!visible) return null;
  return (
    <View style={styles.toastContainer}>
      <View style={[styles.toast, type === "success" ? styles.toastSuccess : styles.toastError]}>
        <Ionicons
          name={type === "success" ? "checkmark-circle" : "close-circle"}
          size={22}
          color="#fff"
        />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
};

export default function LiveTeachings() {
  const router = useRouter();

  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]); // ← For search results
  const [searchQuery, setSearchQuery] = useState(''); // ← Search input
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  // Network Detection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) showToast("No internet connection.", "error");
    });
    return () => unsubscribe();
  }, []);

  const fetchWithToken = async (url, options = {}, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          showToast("Please log in to continue.", "error");
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
          await AsyncStorage.multiRemove(["userToken", "selectedCommunityId"]);
          showToast("Session expired. Logging you out...", "error");
          router.replace("/login");
          return null;
        }
        if (!res.ok) throw new Error("Network error");
        return await res.json();
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^"&?/ ]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchVideos = useCallback(async () => {
    if (!isConnected) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const communityId = await AsyncStorage.getItem("selectedCommunityId");
      if (!communityId) {
        showToast("No community selected.", "error");
        setVideos([]);
        setFilteredVideos([]);
        return;
      }

      const data = await fetchWithToken(`${BASE_URL}/live/community/${communityId}`);

      if (data?.success && Array.isArray(data.data)) {
        const formatted = data.data.map(item => ({
          id: item.id.toString(),
          title: item.title || "Live Teaching",
          viewers: item.viewers || 0,
          thumbnail: item.thumbnailUrl || `https://img.youtube.com/vi/${getYoutubeId(item.hlsPlaybackUrl || '')}/maxresdefault.jpg`,
          videoUrl: item.hlsPlaybackUrl || "",
          isLive: item.status === "LIVE",
          startedAt: item.startedAt,
        }));
        setVideos(formatted);
        setFilteredVideos(formatted); // Initial full list
      } else {
        setVideos([]);
        setFilteredVideos([]);
      }
    } catch (err) {
      showToast("Failed to load teachings.", "error");
      setVideos([]);
      setFilteredVideos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isConnected]);

  useFocusEffect(
    useCallback(() => {
      fetchVideos();
    }, [fetchVideos])
  );

  // Search filter effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  const onRefresh = () => {
    setSearchQuery(''); // Clear search on refresh
    fetchVideos();
  };

  const openVideoPlayer = async (video) => {
    Haptics.selectionAsync();

    try {
      await fetchWithToken(`${BASE_URL}/live/${video.id}`, { method: "POST" });
      fetchVideos(); // Refresh viewer count
    } catch (_) {}

    setCurrentVideo(video);
    setPlayerVisible(true);
    await ScreenOrientation.unlockAsync();
    StatusBar.setHidden(true, 'fade');
  };

  const closePlayer = async () => {
    setPlayerVisible(false);
    setCurrentVideo(null);
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    StatusBar.setHidden(false, 'fade');
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity 
      style={styles.videoCard} 
      onPress={() => openVideoPlayer(item)} 
      activeOpacity={0.92}
    >
      <View style={styles.thumbContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={72} color="rgba(255,255,255,0.95)" />
        </View>
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        {item.startedAt && (
          <Text style={styles.dateText}>
            {new Date(item.startedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </Text>
        )}
        <Text style={item.isLive ? styles.liveViewers : styles.viewCount}>
          {item.isLive 
            ? `${item.viewers.toLocaleString()} watching now`
            : `${item.viewers.toLocaleString()} views`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live & Teachings</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teachings..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredVideos}
        keyExtractor={item => item.id}
        renderItem={renderVideo}
        refreshControl={
          <RNRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ORANGE]}
            tintColor={ORANGE}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={ORANGE} />
              <Text style={styles.loadingText}>Loading teachings...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="tv-outline" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No results found" : "No Teachings Yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? `Try searching for something else.`
                  : "Live sessions and recorded teachings will appear here."
                }
              </Text>
            </View>
          )
        }
      />

      {/* Fullscreen Player */}
      {playerVisible && currentVideo && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.playerContainer}>
            <YoutubePlayer
              height={width * 0.5625}
              width={width * 0.95}
              videoId={getYoutubeId(currentVideo.videoUrl)}
              play={true}
              initialPlayerParams={{
                controls: true,
                rel: false,
                modestbranding: 1,
              }}
              forceAndroidAutoplay={true}
            />

            {currentVideo.isLive && (
              <View style={styles.playerViewers}>
                <View style={styles.liveDot} />
                <Text style={styles.playerViewersText}>
                  {currentVideo.viewers.toLocaleString()} watching
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={closePlayer}>
              <View style={styles.closeCircle}>
                <Ionicons name="close" size={30} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "GothamBold",
    color: "#222",
  },

  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },

  listContent: { paddingHorizontal: 12, paddingBottom: 32 },

  // Updated video card with oval/rounded corners
  videoCard: {
    backgroundColor: "#fff",
    borderRadius: 20, // ← Oval corners
    overflow: "hidden",
    marginBottom: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  thumbContainer: { 
    height: 220, 
    position: "relative",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  thumb: { width: "100%", height: "100%" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveText: { color: "#fff", fontSize: 12, fontFamily: "GothamBold" },

  videoInfo: { 
    padding: 16,
    paddingTop: 14,
  },
  videoTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#000", 
    fontFamily: "GothamBold", 
    lineHeight: 22 
  },
  dateText: { 
    fontSize: 13, 
    color: ORANGE, 
    marginTop: 4, 
    fontFamily: "GothamMedium" 
  },
  liveViewers: { 
    fontSize: 14, 
    color: GOLD, 
    marginTop: 6, 
    fontFamily: "GothamBold" 
  },
  viewCount: { 
    fontSize: 13, 
    color: "#666", 
    marginTop: 6, 
    fontFamily: "GothamMedium" 
  },

  loadingContainer: { alignItems: "center", paddingVertical: 100 },
  loadingText: { marginTop: 16, color: "#666", fontSize: 15, fontFamily: "GothamMedium" },

  emptyContainer: { alignItems: "center", paddingVertical: 120, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#333", marginTop: 20, fontFamily: "GothamBold" },
  emptySubtitle: { fontSize: 15, color: "#888", textAlign: "center", marginTop: 10, lineHeight: 22, fontFamily: "GothamMedium" },

  playerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  playerViewers: {
    position: "absolute",
    top: 60,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    marginRight: 8,
  },
  playerViewersText: { color: "#fff", fontSize: 14, fontFamily: "GothamBold" },

  closeBtn: { position: "absolute", top: 50, right: 20 },
  closeCircle: {
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

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