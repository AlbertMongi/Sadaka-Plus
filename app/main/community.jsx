// app/main/community.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  RefreshControl,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';

import { BASE_URL } from '../apiConfig';

const { width, height } = Dimensions.get('window');
const GOLD = '#E18731';

// Pulse Skeleton Component (same as WalletScreen)
const SkeletonPulse = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return <Animated.View style={[{ opacity }, style, { backgroundColor: '#E1E9EE' }]} />;
};

// Full Page Skeleton for Live Teachings
const FullPageSkeleton = () => (
  <View style={styles.skeletonContainer}>
    {[...Array(5)].map((_, i) => (
      <View key={i} style={styles.skeletonCard}>
        <SkeletonPulse style={styles.skeletonThumb} />
        <View style={styles.skeletonContent}>
          <SkeletonPulse style={{ width: '85%', height: 20, borderRadius: 10, marginBottom: 10 }} />
          <SkeletonPulse style={{ width: '60%', height: 16, borderRadius: 8 }} />
        </View>
      </View>
    ))}
  </View>
);

export default function LiveTeachingsScreen() {
  const router = useRouter();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [communityId, setCommunityId] = useState(null);
  const [token, setToken] = useState(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  const viewCountedRef = useRef(new Set());
  const livePulse = useRef(new Animated.Value(1)).current;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardAnims = useRef(videos.map(() => ({ fade: new Animated.Value(0), slide: new Animated.Value(30) }))).current;

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const loadUserData = useCallback(async () => {
    try {
      const [savedToken, savedCommunityId] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('selectedCommunityId'),
      ]);

      if (!savedToken) {
        router.replace('/login');
        return;
      }

      setToken(savedToken);
      setCommunityId(savedCommunityId || null);

      if (!savedCommunityId) {
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const json = await res.json();
        if (json.success && json.data?.community?.id) {
          const cid = json.data.community.id.toString();
          setCommunityId(cid);
          await AsyncStorage.setItem('selectedCommunityId', cid);
        }
      }
    } catch (err) {
      console.error('loadUserData error:', err);
    }
  }, [router]);

  const fetchVideos = useCallback(async () => {
    if (!communityId || !token) return;

    try {
      const res = await fetch(`${BASE_URL}/live/community/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        await AsyncStorage.multiRemove(['userToken', 'selectedCommunityId']);
        router.replace('/login');
        return;
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const formatted = json.data.map((item) => ({
          id: item.id.toString(),
          title: item.title || 'Live Teaching',
          viewers: item.viewers || 0,
          thumbnail:
            item.thumbnailUrl ||
            item.thumbnail ||
            `https://img.youtube.com/vi/${getYoutubeId(item.hlsPlaybackUrl || '')}/maxresdefault.jpg`,
          videoUrl: item.hlsPlaybackUrl || '',
          isLive: item.status === 'LIVE',
          startedAt: item.startedAt,
        }));
        setVideos(formatted);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('fetchVideos error:', err);
      setVideos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [communityId, token, router]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (communityId && token) fetchVideos();
  }, [communityId, token, fetchVideos]);

  // Live pulse animation
  useEffect(() => {
    const hasLive = videos.some((v) => v.isLive);
    if (hasLive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(livePulse, { toValue: 1.6, duration: 1200, useNativeDriver: true }),
          Animated.timing(livePulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      livePulse.setValue(1);
    }
  }, [videos]);

  // Animation trigger
  useEffect(() => {
    if (!loading && !refreshing) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
        ...videos.slice(0, 10).map((_, i) =>
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.parallel([
              Animated.timing(cardAnims[i]?.fade || new Animated.Value(0), { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.spring(cardAnims[i]?.slide || new Animated.Value(30), { toValue: 0, friction: 9, useNativeDriver: true }),
            ]),
          ])
        ),
      ]).start();
    }
  }, [loading, refreshing, videos.length]);

  const onRefresh = () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    fetchVideos();
  };

  const openVideoPlayer = async (video) => {
    Haptics.selectionAsync();

    if (!viewCountedRef.current.has(video.id)) {
      viewCountedRef.current.add(video.id);
      try {
        await fetch(`${BASE_URL}/live/${video.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        fetchVideos();
      } catch (e) {}
    }

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

  const renderVideoCard = ({ item, index }) => {
    const anim = cardAnims[index] || { fade: new Animated.Value(1), slide: new Animated.Value(0) };

    return (
      <Animated.View
        style={{
          opacity: anim.fade,
          transform: [{ translateY: anim.slide }],
          marginBottom: 20,
        }}
      >
        <TouchableOpacity style={styles.videoCard} activeOpacity={0.92} onPress={() => openVideoPlayer(item)}>
          <View style={styles.thumbContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.playOverlay}>
              <Ionicons name="play-circle" size={72} color="rgba(255,255,255,0.95)" />
            </View>

            {item.isLive && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE NOW</Text>
                <Animated.View style={[styles.pulseRing, { transform: [{ scale: livePulse }] }]} />
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            {item.startedAt && (
              <Text style={styles.dateText}>
                {new Date(item.startedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            )}
            <Text style={item.isLive ? styles.liveFooterText : styles.viewsText}>
              {item.isLive ? `LIVE • ${item.viewers.toLocaleString()} watching` : `${item.viewers.toLocaleString()} views`}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live & Teachings</Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <FullPageSkeleton />
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <FlatList
            data={videos}
            renderItem={renderVideoCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={videos.length === 0 ? styles.emptyContainerStyle : styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} tintColor={GOLD} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="tv-outline" size={60} color={GOLD} />
                <Text style={styles.emptyTitle}>No Teachings Yet</Text>
                <Text style={styles.emptySubtitle}>Live sessions and teachings will appear here when available.</Text>
              </View>
            }
          />
        </Animated.View>
      )}

      {/* Fullscreen YouTube Player */}
      {playerVisible && currentVideo && (
        <View style={StyleSheet.absoluteFillObject}>
          <StatusBar hidden />
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <View style={styles.playerWrapper}>
              <YoutubePlayer
                height={height}
                width={width}
                videoId={getYoutubeId(currentVideo.videoUrl)}
                play={true}
                initialPlayerParams={{
                  controls: true,
                  rel: false,
                  modestbranding: 1,
                  iv_load_policy: 3,
                }}
                webViewStyle={{ opacity: 0.99 }}
                forceAndroidAutoplay={true}
              />
            </View>

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
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 15,
    paddingBottom: 16,
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'GothamBold',
    color: '#222',
  },
  list: { padding: 16, paddingTop: 8 },
  emptyContainerStyle: { flex: 1, justifyContent: 'center' },

  // Skeleton
  skeletonContainer: { padding: 16 },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  skeletonThumb: { height: 220, borderRadius: 20 },
  skeletonContent: { padding: 16 },

  // Video Card
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  thumbContainer: { height: 220, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  liveBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: GOLD,
    opacity: 0.35,
  },
  liveText: { color: '#fff', fontSize: 13, fontFamily: 'GothamBold', marginRight: 6 },

  content: { padding: 18 },
  title: {
    fontSize: 18,
    fontFamily: 'GothamBold',
    color: '#111',
    lineHeight: 24,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 13.5,
    color: GOLD,
    fontFamily: 'GothamMedium',
    marginBottom: 6,
  },
  liveFooterText: {
    fontSize: 15,
    color: GOLD,
    fontFamily: 'GothamBold',
  },
  viewsText: {
    fontSize: 14.5,
    color: '#666',
    fontFamily: 'GothamMedium',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 20,
    fontFamily: 'GothamBold',
    color: GOLD,
  },
  emptySubtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'GothamRegular',
  },

  // Player
  playerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    zIndex: 100,
  },
  closeCircle: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});