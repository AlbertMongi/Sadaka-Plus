import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
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
import { BASE_URL } from '../apiConfig';

const { width, height } = Dimensions.get('window');
const GOLD = '#E18731';
const FALLBACK_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';

// ──────────────────────────────────────────────────────────────
// Skeleton Components (unchanged + new ones added below)
// ──────────────────────────────────────────────────────────────
const SkeletonPulse = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[{ opacity }, style, { backgroundColor: '#E1E9EE' }]} />;
};

const ScriptureSkeleton = () => (
  <View style={styles.scriptureContainer}>
    <SkeletonPulse style={{ width: 60, height: 260, borderRadius: 10, marginRight: 12 }} />
    <View style={styles.wordCard}>
      <SkeletonPulse style={{ width: '100%', height: '100%', borderRadius: 10 }} />
    </View>
  </View>
);

// New: Sermon item skeleton
const SermonItemSkeleton = () => (
  <View style={styles.eventCardVertical}>
    <SkeletonPulse style={{ width: 110, height: 90, borderRadius: 12 }} />
    <View style={{ flex: 1, paddingLeft: 16, justifyContent: 'center' }}>
      <SkeletonPulse style={{ width: '80%', height: 16, borderRadius: 8, marginBottom: 8 }} />
      <SkeletonPulse style={{ width: '60%', height: 14, borderRadius: 8, marginBottom: 8 }} />
      <SkeletonPulse style={{ width: '90%', height: 32, borderRadius: 8 }} />
    </View>
  </View>
);

// New: Sermons list skeleton (2 items)
const SermonsSkeleton = () => (
  <View style={{ paddingHorizontal: 16 }}>
    <SermonItemSkeleton />
    <SermonItemSkeleton />
  </View>
);

// New: Bible Quiz skeleton
const QuizSkeleton = () => (
  <View style={styles.quizCard}>
    <SkeletonPulse style={{ width: 76, height: 76, borderRadius: 38 }} />
    <View style={{ flex: 1, marginLeft: 16 }}>
      <SkeletonPulse style={{ width: '70%', height: 20, borderRadius: 8 }} />
    </View>
    <SkeletonPulse style={{ width: 100, height: 48, borderRadius: 30 }} />
  </View>
);

const FullPageSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <ScrollView contentContainerStyle={{ paddingTop: 50, paddingHorizontal: 16 }}>
      <SkeletonPulse style={{ width: 180, height: 24, borderRadius: 8, marginBottom: 16 }} />
      <ScriptureSkeleton />
      <View style={{ marginTop: 32 }}>
        <SkeletonPulse style={{ width: 120, height: 20, borderRadius: 8, marginBottom: 16 }} />
        <SermonsSkeleton />
      </View>
      <View style={{ marginTop: 32 }}>
        <SkeletonPulse style={{ width: 100, height: 20, borderRadius: 8, marginBottom: 16 }} />
        <QuizSkeleton />
      </View>
    </ScrollView>
  </SafeAreaView>
);

const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon} size={48} color={GOLD} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

const HomeScreen = () => {
  const router = useRouter();
  const scrollRef = useRef(null);

  const [language] = useState('en');
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [scriptures, setScriptures] = useState([]);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const [sermons, setSermons] = useState([]);
  const [loadingScripture, setLoadingScripture] = useState(false);
  const [loadingSermons, setLoadingSermons] = useState(false);

  // LIKE & SHARE STATE
  const [likes, setLikes] = useState({});
  const [likedStatus, setLikedStatus] = useState({});
  const [shares, setShares] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scriptureAnims = useRef([]);

  const labels = {
    en: {
      scripture: 'Verse of the Day',
      sermons: 'Sermons',
      noScripture: 'No verse available',
      noSermons: 'No sermons available',
      noSermonsSub: 'Connect with your church community to access reflections.',
    },
  };

  // ... (all your existing fetch functions remain unchanged)

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
        const communities = json.data.map(c => ({
          id: c.id.toString(),
          name: c.name || 'Unnamed',
          image: c.logo || FALLBACK_IMAGE,
        }));
        setJoinedCommunities(communities);
        const stored = await AsyncStorage.getItem('selectedCommunityId');
        const id = stored && communities.some(c => c.id === stored) ? stored : communities[0].id;
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

  const fetchData = async () => {
    if (!selectedCommunityId) {
      setScriptures([]);
      setSermons([]);
      setLoadingScripture(false);
      setLoadingSermons(false);
      return;
    }

    setLoadingScripture(true);
    setLoadingSermons(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [scriptRes, sermonRes] = await Promise.all([
        fetch(`${BASE_URL}/scriptures/user/${selectedCommunityId}`, { headers }),
        fetch(`${BASE_URL}/sermons/user/${selectedCommunityId}`, { headers }),
      ]);

      const scriptJson = await scriptRes.json();
      const sermonJson = await sermonRes.json();

      // SCRIPTURES WITH LIKES & SHARES
      if (scriptJson.success && Array.isArray(scriptJson.data)) {
        const data = scriptJson.data.map(s => ({
          id: s.id.toString(),
          verse_reference: s.name || '',
          verse_text: s.description || '',
          imageUrl: s.photo?.startsWith('http') ? s.photo : FALLBACK_IMAGE,
          likes: s.likes || 0,
          liked: s.liked || false,
          shares: s.shares || 0,
        }));
        setScriptures(data);

        const likesObj = {}, likedObj = {}, sharesObj = {};
        data.forEach(s => {
          likesObj[s.id] = s.likes;
          likedObj[s.id] = s.liked;
          sharesObj[s.id] = s.shares;
        });
        setLikes(likesObj);
        setLikedStatus(likedObj);
        setShares(sharesObj);

        scriptureAnims.current = data.map(() => ({ fade: new Animated.Value(0), scale: new Animated.Value(0.8) }));
      } else {
        setScriptures([]);
      }

      // SERMONS
      if (sermonJson.success && Array.isArray(sermonJson.data)) {
        const data = sermonJson.data.map(s => ({
          id: s.id.toString(),
          title: s.name || '',
          description: s.description || '',
          imageUrl: s.photo?.startsWith('http') ? s.photo : FALLBACK_IMAGE,
        }));
        setSermons(data);
      } else {
        setSermons([]);
      }
    } catch (err) {
      console.log('Fetch error:', err);
      setScriptures([]);
      setSermons([]);
    } finally {
      setLoadingScripture(false);
      setLoadingSermons(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJoinedCommunities();
    if (selectedCommunityId) await fetchData();
    setRefreshing(false);
  }, [selectedCommunityId]);

  useEffect(() => {
    fetchJoinedCommunities();
  }, []);

  useEffect(() => {
    if (!loadingCommunities) fetchData();
  }, [selectedCommunityId, loadingCommunities]);

  useEffect(() => {
    if (!loadingCommunities && !loadingScripture && !loadingSermons) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      scriptureAnims.current.forEach(anim => {
        Animated.parallel([
          Animated.timing(anim.fade, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [loadingCommunities, loadingScripture, loadingSermons]);

  // LIKE / UNLIKE & SHARE (unchanged)
  const handleLike = async () => {
    const current = scriptures[currentScriptureIndex];
    if (!current?.id) return;

    const wasLiked = likedStatus[current.id] || false;
    const prevLikes = likes[current.id] || 0;

    setLikes(prev => ({ ...prev, [current.id]: wasLiked ? prevLikes - 1 : prevLikes + 1 }));
    setLikedStatus(prev => ({ ...prev, [current.id]: !wasLiked }));

    try {
      const token = await AsyncStorage.getItem('userToken');
      await fetch(`${BASE_URL}/likes/scripture/${current.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setLikes(prev => ({ ...prev, [current.id]: prevLikes }));
      setLikedStatus(prev => ({ ...prev, [current.id]: wasLiked }));
    }
  };

  const handleShare = async () => {
    const current = scriptures[currentScriptureIndex];
    if (!current) return;

    try {
      await Share.share({
        message: `${current.verse_text}\n\n${current.verse_reference}\nShared via Sadaka App`,
      });

      setShares(prev => ({ ...prev, [current.id]: (prev[current.id] || 0) + 1 }));

      const token = await AsyncStorage.getItem('userToken');
      await fetch(`${BASE_URL}/shares/scripture/${current.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log('Share failed', err);
    }
  };

  // ──────────────────────────────
  // Full-page skeleton while loading communities
  // ──────────────────────────────
  if (loadingCommunities || refreshing) return <FullPageSkeleton />;

  // ──────────────────────────────
  // No community joined
  // ──────────────────────────────
  if (joinedCommunities.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />}>
            {/* Same empty UI you already had */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels[language].scripture}</Text>
              <EmptyState icon="book-outline" title="No verse available" subtitle="Join a community to see daily verses" />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels[language].sermons}</Text>
              <EmptyState icon="mic-off-outline" title="No sermons" subtitle="Join your church to access sermons" />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bible Quiz</Text>
              <View style={styles.quizCard}>
                <View style={styles.quizIconCircle}>
                  <MaterialCommunityIcons name="brain" size={42} color={GOLD} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.quizTitle}>Bible Quiz of the Day</Text>
                </View>
                <TouchableOpacity style={styles.startBtn} onPress={() => router.push('bible-quize/screens/WelcomeScreen')}>
                  <Text style={styles.startText}>Start</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="people-outline" size={70} color={GOLD} />
              <Text style={{ fontSize: 20, fontFamily: 'GothamBold', marginTop: 20, textAlign: 'center' }}>
                You Haven't Joined a Community
              </Text>
              <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginVertical: 16 }}>
                Join your church to see daily verses and sermons.
              </Text>
              <TouchableOpacity style={styles.joinBtn} onPress={() => router.push('/CommunityScreen')}>
                <Text style={styles.joinBtnText}>Find Community</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────
  // Main screen with data
  // ──────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />}
        >
          {/* VERSE OF THE DAY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle1}>{labels[language].scripture}</Text>
            {loadingScripture ? (
              <ScriptureSkeleton />
            ) : scriptures.length > 0 ? (
              /* existing verse UI unchanged */
              <View style={styles.scriptureContainer}>
                <View style={styles.smallImageContainer}>
                  <FlatList
                    data={scriptures}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.x / 60);
                      setCurrentScriptureIndex(index);
                    }}
                    renderItem={({ item, index }) => (
                      <Animated.View style={{
                        opacity: scriptureAnims.current[index]?.fade || 0,
                        transform: [{ scale: scriptureAnims.current[index]?.scale || 0.8 }]
                      }}>
                        <View style={styles.smallImageItem}>
                          <Image source={{ uri: item.imageUrl }} style={styles.smallImage} resizeMode="cover" />
                          <View style={styles.smallImageOverlay}>
                            <Text style={styles.smallVerseText}>{item.verse_reference.toUpperCase()}</Text>
                          </View>
                        </View>
                      </Animated.View>
                    )}
                  />
                </View>

                <View style={styles.wordCard}>
                  <Image source={{ uri: scriptures[currentScriptureIndex]?.imageUrl || FALLBACK_IMAGE }} style={styles.wordImage} resizeMode="cover" />
                  <View style={styles.wordOverlay} />
                  <View style={styles.wordContent}>
                    <Text style={styles.verseText}>{scriptures[currentScriptureIndex]?.verse_text}</Text>
                    <Text style={styles.verseReference}>{scriptures[currentScriptureIndex]?.verse_reference}</Text>
                  </View>

                  <View style={styles.actionButtons}>
                    {scriptures.length > 1 && (
                      <>
                        <TouchableOpacity onPress={() => setCurrentScriptureIndex(i => i > 0 ? i - 1 : scriptures.length - 1)} style={styles.navButton}>
                          <Ionicons name="chevron-back-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCurrentScriptureIndex(i => i < scriptures.length - 1 ? i + 1 : 0)} style={styles.navButton}>
                          <Ionicons name="chevron-forward-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                      </>
                    )}
                    <View style={styles.socialButtons}>
                      <TouchableOpacity onPress={handleLike} style={styles.socialButton}>
                        <Ionicons
                          name={likedStatus[scriptures[currentScriptureIndex]?.id] ? 'heart' : 'heart-outline'}
                          size={26}
                          color={likedStatus[scriptures[currentScriptureIndex]?.id] ? GOLD : '#fff'}
                        />
                        <Text style={styles.likeCount}>{likes[scriptures[currentScriptureIndex]?.id] || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleShare} style={styles.socialButton}>
                        <Ionicons name="share-outline" size={26} color={GOLD} />
                        <Text style={styles.likeCount}>{shares[scriptures[currentScriptureIndex]?.id] || 0}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <EmptyState icon="book-outline" title={labels[language].noScripture} subtitle={labels[language].noScriptureSub || ''} />
            )}
          </View>

          {/* SERMONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels[language].sermons}</Text>
            {loadingSermons ? (
              <SermonsSkeleton />
            ) : sermons.length > 0 ? (
              <View style={{ paddingHorizontal: 2 }}>
                {sermons.map((sermon) => (
                  <TouchableOpacity
                    key={sermon.id}
                    style={styles.eventCardVertical}
                    onPress={() => router.push({ pathname: '/sermon', params: { id: sermon.id } })}
                  >
                    <Image source={{ uri: sermon.imageUrl || FALLBACK_IMAGE }} style={styles.eventImageVertical} resizeMode="cover" />
                    <View style={styles.eventInfoVertical}>
                      <Text style={styles.eventName} numberOfLines={2}>{sermon.title}</Text>
                      <Text style={styles.eventTime}>
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={styles.eventLocation} numberOfLines={2}>
                        {sermon.description || "Tap to listen to this powerful message of faith and hope."}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState icon="mic-off-outline" title={labels[language].noSermons} subtitle={labels[language].noSermonsSub} />
            )}
          </View>

          {/* BIBLE QUIZ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bible Quiz</Text>
            {loadingSermons || loadingScripture ? (  // You can tie it to any loading state you prefer
              <QuizSkeleton />
            ) : (
              <View style={styles.quizCard}>
                <View style={styles.quizIconCircle}>
                  <MaterialCommunityIcons name="brain" size={42} color={GOLD} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.quizTitle}>Bible Quiz of the Day</Text>
                </View>
                <TouchableOpacity style={styles.startBtn} onPress={() => router.push('bible-quize/screens/WelcomeScreen')}>
                  <Text style={styles.startText}>Start</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// ──────────────────────────────
// Styles (unchanged)
// ──────────────────────────────
const styles = StyleSheet.create({
  section: { marginBottom: 12, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 15, color: '#222', paddingHorizontal: 10, paddingVertical: 6, fontFamily: 'GothamBold' },
   sectionTitle1: { fontSize: 15, color: '#222', paddingHorizontal: 10, paddingVertical: Platform.OS === 'android' ? 20 : 6, fontFamily: 'GothamBold' },

  scriptureContainer: { flexDirection: 'row', marginHorizontal: 10, alignItems: 'center', paddingVertical: 6 },
  smallImageContainer: { width: 60, height: 260, borderRadius: 10, overflow: 'hidden', marginRight: 8 },
  smallImageItem: { width: 60, height: 260, position: 'relative' },
  smallImage: { width: '100%', height: '100%', position: 'absolute' },
  smallImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  smallVerseText: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -100 }, { translateY: -25 }, { rotate: '-90deg' }], color: '#fff', fontSize: 18, fontWeight: '900', width: 230, fontFamily: 'GothamBold', textTransform: 'uppercase' },
  wordCard: { flex: 1, height: 260, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  wordImage: { width: '100%', height: '100%', borderRadius: 12, position: 'absolute' },
  wordOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 },
  wordContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  verseText: { color: '#fff', fontSize: 14, lineHeight: 20, textAlign: 'center', fontFamily: 'GothamMedium' },
  verseReference: { color: '#fff', fontSize: 12, marginTop: 6, textAlign: 'center', fontFamily: 'GothamBold' },

  actionButtons: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navButton: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 6 },
  socialButtons: { flexDirection: 'row', gap: 16 },
  socialButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  likeCount: { color: '#fff', marginLeft: 6, fontSize: 13, fontFamily: 'GothamBold' },

  eventCardVertical: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
  eventImageVertical: { width: 110, height: 90, borderRadius: 12, backgroundColor: '#eee' },
  eventInfoVertical: { flex: 1, paddingLeft: 16, justifyContent: 'center' },
  eventName: { fontSize: 12.5, color: '#222', fontFamily: 'GothamBold', lineHeight: 21 },
  eventTime: { fontSize: 13, color: GOLD, marginTop: 4, fontFamily: 'GothamMedium' },
  eventLocation: { fontSize: 13, color: '#666', marginTop: 6, fontFamily: 'GothamRegular', lineHeight: 18 },

  quizCard: { backgroundColor: '#fff', borderRadius: 22, padding: 20, marginHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.09, shadowRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', height: 115 },
  quizIconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFF8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: GOLD, borderStyle: 'dashed' },
  quizTitle: { fontFamily: 'GothamBold', fontSize: 18, color: '#222' },
  startBtn: { backgroundColor: GOLD, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
  startText: { color: '#fff', fontFamily: 'GothamBold', fontSize: 16 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '600', color: GOLD, fontFamily: 'GothamBold' },
  emptySubtitle: { marginTop: 6, fontSize: 12, color: '#555', textAlign: 'center', fontFamily: 'GothamRegular' },
  joinBtn: { backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  joinBtnText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },
});

export default HomeScreen;