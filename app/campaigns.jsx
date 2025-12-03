// app/main/campaigns.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from './apiConfig';

const { width, height } = Dimensions.get('window');
const GOLD = '#FF9F0D';
const FALLBACK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

/* ──────────────────────────────────────────────────────────────
   SKELETON PULSE
────────────────────────────────────────────────────────────── */
const SkeletonPulse = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { opacity },
        style,
        { backgroundColor: '#E1E9EE', borderRadius: 4 },
      ]}
    />
  );
};

/* ──────────────────────────────────────────────────────────────
   SKELETONS
────────────────────────────────────────────────────────────── */
const CampaignSkeleton = () => (
  <View style={styles.skeletonCard}>
    <SkeletonPulse style={styles.skeletonImage} />
    <View style={styles.skeletonOverlay}>
      <View style={styles.skeletonHeader}>
        <SkeletonPulse style={{ width: 90, height: 14 }} />
        <SkeletonPulse style={{ width: 70, height: 12 }} />
      </View>
      <SkeletonPulse style={{ width: '85%', height: 18, marginTop: 16 }} />
      <SkeletonPulse style={{ width: '95%', height: 14, marginTop: 12 }} />
      <SkeletonPulse style={{ width: '90%', height: 14, marginTop: 8 }} />
      <SkeletonPulse style={{ width: '70%', height: 14, marginTop: 8 }} />
      <View style={styles.skeletonActions}>
        <SkeletonPulse style={{ width: 60, height: 32, borderRadius: 20 }} />
        <View style={{ width: 12 }} />
        <SkeletonPulse style={{ width: 60, height: 32, borderRadius: 20 }} />
      </View>
    </View>
  </View>
);

const FullPageSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.backButton} />
        <SkeletonPulse style={{ width: 120, height: 20, borderRadius: 4 }} />
        <View style={{ width: 36 }} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
      >
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={{ marginBottom: 18 }}>
            <CampaignSkeleton />
          </View>
        ))}
      </ScrollView>
    </View>
  </SafeAreaView>
);

/* ──────────────────────────────────────────────────────────────
   UTILITIES
────────────────────────────────────────────────────────────── */
const formatDate = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const isValidImageUrl = (url) =>
  url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));

/* ──────────────────────────────────────────────────────────────
   EMPTY STATES
────────────────────────────────────────────────────────────── */
const NoCommunityState = ({ router }) => (
  <View style={styles.noCommunityContainer}>
    <Ionicons name="people-outline" size={70} color={GOLD} />
    <Text style={styles.noCommunityTitle}>No Community Selected</Text>
    <Text style={styles.noCommunitySubtitle}>
      Join your church community to view campaigns and updates.
    </Text>

    <TouchableOpacity style={styles.joinBtn} onPress={() => router.push('/CommunityScreen')}>
      <Text style={styles.joinBtnText}>Find Community</Text>
    </TouchableOpacity>
  </View>
);

/* ──────────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────────── */
export default function CampaignsScreen() {
  const router = useRouter();
  const scrollRef = useRef(null);

  /* COMMUNITY STATE */
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  /* UI & DATA */
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likes, setLikes] = useState({});
  const [likedStatus, setLikedStatus] = useState({});
  const [shares, setShares] = useState({});

  /* ANIMATIONS */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([]);

  /* ─────────────────────────────────────────
       FETCH WITH TOKEN + RETRY
  ───────────────────────────────────────── */
  const fetchWithToken = async (url, options = {}, retries = MAX_RETRIES) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token');

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!res.ok) {
        if (res.status === 401 && retries > 0) {
          await AsyncStorage.removeItem('userToken');
          router.replace('/login');
          return null;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
        return fetchWithToken(url, options, retries - 1);
      }
      return null;
    }
  };

  /* ─────────────────────────────────────────
       FETCH JOINED COMMUNITIES
  ───────────────────────────────────────── */
  const fetchJoinedCommunities = async () => {
    setLoadingCommunities(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error();

      const res = await fetch(`${BASE_URL}/communities/joined`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (json.success && json.data?.length > 0) {
        const communities = json.data.map((c) => ({
          id: c.id.toString(),
          name: c.name || 'Unnamed',
          image: c.logo || FALLBACK_IMAGE,
        }));

        setJoinedCommunities(communities);

        const stored = await AsyncStorage.getItem('selectedCommunityId');
        const id =
          stored && communities.some((c) => c.id === stored)
            ? stored
            : communities[0].id;

        setSelectedCommunityId(id);
        await AsyncStorage.setItem('selectedCommunityId', id);
      } else {
        setJoinedCommunities([]);
        setSelectedCommunityId(null);
      }
    } catch {
      setJoinedCommunities([]);
      setSelectedCommunityId(null);
    } finally {
      setLoadingCommunities(false);
    }
  };

  /* ─────────────────────────────────────────
       FETCH CAMPAIGNS
  ───────────────────────────────────────── */
  const fetchCampaigns = async () => {
    if (!selectedCommunityId) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const res = await fetchWithToken(
      `${BASE_URL}/updates/category/CAMPAIGN/${selectedCommunityId}`
    );

    if (res?.success && Array.isArray(res.data)) {
      const formatted = res.data.map((item) => ({
        id: item.id.toString(),
        title: item.title || 'No Title',
        content: item.content || 'No content available.',
        category: item.category || 'CAMPAIGN',
        scheduledAt: item.scheduledAt || new Date().toISOString(),
        likes: item.likes || 0,
        liked: item.liked || false,
        shares: item.shares || 0,
        imageUrl: isValidImageUrl(item.photo) ? item.photo : FALLBACK_IMAGE,
      }));

      setCampaigns(formatted);
      initializeAnims(formatted);
      initializeInteractions(formatted);
    } else {
      setCampaigns([]);
      cardAnims.current = [];
    }

    setLoading(false);
    animateEntrance();
  };

  /* ── Anim init */
  const initializeAnims = (data) => {
    cardAnims.current = data.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }));
  };

  const initializeInteractions = (data) => {
    const likeMap = {};
    const likedMap = {};
    const shareMap = {};

    data.forEach((c) => {
      likeMap[c.id] = c.likes;
      likedMap[c.id] = c.liked;
      shareMap[c.id] = c.shares;
    });

    setLikes(likeMap);
    setLikedStatus(likedMap);
    setShares(shareMap);
  };

  const animateEntrance = () => {
    const animations = [
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ];

    cardAnims.current.forEach((anim, i) => {
      animations.push(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.parallel([
            Animated.timing(anim.fade, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(anim.slide, { toValue: 0, duration: 500, useNativeDriver: true }),
          ]),
        ])
      );
    });

    Animated.parallel(animations).start();
  };

  /* ─────────────────────────────────────────
       EFFECTS
  ───────────────────────────────────────── */
  useEffect(() => {
    fetchJoinedCommunities();
  }, []);

  useEffect(() => {
    if (!loadingCommunities) {
      fetchCampaigns();
    }
  }, [selectedCommunityId, loadingCommunities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJoinedCommunities();
    if (selectedCommunityId) await fetchCampaigns();
    setRefreshing(false);
  }, [selectedCommunityId]);

  /* ─────────────────────────────────────────
       LIKE / SHARE
  ───────────────────────────────────────── */
  const handleLike = async (id) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;

    const isLiked = likedStatus[id] || false;
    const prevLikes = likes[id] || 0;

    setLikes((p) => ({ ...p, [id]: isLiked ? prevLikes - 1 : prevLikes + 1 }));
    setLikedStatus((p) => ({ ...p, [id]: !isLiked }));

    try {
      await fetchWithToken(`${BASE_URL}/likes/campaign/${id}`, { method: 'POST' });
    } catch {
      setLikes((p) => ({ ...p, [id]: prevLikes }));
      setLikedStatus((p) => ({ ...p, [id]: isLiked }));
    }
  };

  const handleShare = async (campaign) => {
    try {
      await Share.share({
        message: `${campaign.title}\n\n${campaign.content}\n\nShared via Sadaka App`,
      });

      setShares((p) => ({
        ...p,
        [campaign.id]: (p[campaign.id] || 0) + 1,
      }));

      await fetchWithToken(`${BASE_URL}/shares/campaign/${campaign.id}`, {
        method: 'POST',
      });
    } catch {}
  };

  /* ─────────────────────────────────────────
       CARD COMPONENT
  ───────────────────────────────────────── */
  const CampaignCard = ({ item, index }) => {
    const anim = cardAnims.current[index] || { fade: 1, slide: 0 };

    return (
      <Animated.View
        style={{
          opacity: anim.fade,
          transform: [{ translateY: anim.slide }],
          marginBottom: 18,
        }}
      >
        <View style={styles.card}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.date}>{formatDate(item.scheduledAt)}</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content}>{item.content}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  likedStatus[item.id] && styles.likedButton,
                ]}
                onPress={() => handleLike(item.id)}
              >
                <Ionicons
                  name={likedStatus[item.id] ? 'heart' : 'heart-outline'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.countText}>{likes[item.id] || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleShare(item)}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.countText}>{shares[item.id] || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  /* ─────────────────────────────────────────
       RENDER LOGIC
  ───────────────────────────────────────── */
  if (loadingCommunities || (loading && selectedCommunityId)) {
    return <FullPageSkeleton />;
  }

  if (!selectedCommunityId || joinedCommunities.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('main/more')}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Campaigns</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[GOLD]}
              />
            }
          >
            <NoCommunityState router={router} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('main/more')}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Campaigns</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[GOLD]}
            />
          }
        >
          {loading ? (
            <>
              {[1, 2, 3].map((_, i) => (
                <View key={i} style={{ marginBottom: 18 }}>
                  <CampaignSkeleton />
                </View>
              ))}
            </>
          ) : campaigns.length === 0 ? (
            <EmptyState />
          ) : (
            campaigns.map((item, index) => (
              <CampaignCard key={item.id} item={item} index={index} />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────────────────────
   STYLES
────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'GothamBold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 80 : 20,
  },

  /* Skeleton styles */
  skeletonCard: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  skeletonImage: { width: '100%', height: '100%', position: 'absolute' },
  skeletonOverlay: { flex: 1, padding: 16, justifyContent: 'space-between' },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonActions: { flexDirection: 'row', marginTop: 12 },

  /* Card styles */
  card: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backgroundImage: { width: '100%', height: '100%', position: 'absolute' },
  overlay: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'space-between',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'GothamBold',
  },
  date: { color: '#fff', fontSize: 12, fontFamily: 'GothamRegular' },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'GothamBold',
  },
  content: { color: '#fff', fontSize: 14, lineHeight: 20, fontFamily: 'GothamMedium' },
  actionButtons: { flexDirection: 'row', marginTop: 12 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  likedButton: { backgroundColor: '#E18731' },
  countText: { color: '#fff', fontSize: 12, marginLeft: 6, fontFamily: 'GothamMedium' },

  /* Empty states */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.6,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: GOLD,
    fontFamily: 'GothamBold',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'GothamRegular',
  },

  /* No community */
  noCommunityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noCommunityTitle: {
    fontSize: 20,
    fontFamily: 'GothamBold',
    marginTop: 20,
    textAlign: 'center',
  },
  noCommunitySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  joinBtn: { backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  joinBtnText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },
});
