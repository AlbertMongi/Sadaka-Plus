import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
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
  View
} from 'react-native';
import { BASE_URL } from '../apiConfig';
import { fetchBase64Image } from '../fetchBase64Image';

const { width, height } = Dimensions.get('window');
const GOLD = '#E18731';
const FALLBACK_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';

const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon} size={48} color={GOLD} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

// Skeleton Components (unchanged)
const ScriptureSkeleton = () => (
  <View style={styles.scriptureContainer}>
    <View style={styles.smallImageContainer}>
      <View style={[styles.smallImageItem, { backgroundColor: '#eee' }]} />
    </View>
    <View style={styles.wordCard}>
      <View style={[styles.wordImage, { backgroundColor: '#eee' }]} />
      <View style={[styles.wordOverlay, { backgroundColor: 'transparent' }]} />
      <View style={styles.wordContent} />
    </View>
  </View>
);

const SermonSkeleton = () => (
  <View style={{ paddingHorizontal: 2 }}>
    {[...Array(3)].map((_, i) => (
      <View key={i} style={styles.eventCardVertical}>
        <View style={[styles.eventImageVertical, { backgroundColor: '#eee' }]} />
        <View style={styles.eventInfoVertical}>
          <View style={{ height: 16, width: '70%', backgroundColor: '#eee', marginBottom: 8 }} />
          <View style={{ height: 14, width: '50%', backgroundColor: '#eee' }} />
        </View>
      </View>
    ))}
  </View>
);

const HomeScreen = () => {
  const router = useRouter();
  const isFocused = useIsFocused();

  const [language] = useState('en');
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [scriptures, setScriptures] = useState([]);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const [sermons, setSermons] = useState([]);

  const [transactions, setTransactions] = useState([]);

  const [firstName, setFirstName] = useState('');
  const [greeting, setGreeting] = useState('HELLO');
  const [profileImage, setProfileImage] = useState(FALLBACK_IMAGE);

  const [likes, setLikes] = useState({});
  const [likedStatus, setLikedStatus] = useState({});
  const [shares, setShares] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scriptureAnims = useRef([]);
  const historyAnimsRef = useRef(new Map());
  const historyAnims = historyAnimsRef.current;

  const thumbnailFlatListRef = useRef(null);

  const [dataLoading, setDataLoading] = useState(true);
  const contentAnim = useRef(new Animated.Value(0)).current;
  const skeletonAnim = useRef(new Animated.Value(1)).current;
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (dataLoading) {
      setShowSkeleton(true);
      contentAnim.setValue(0);
      skeletonAnim.setValue(1);
    } else {
      Animated.parallel([
        Animated.timing(contentAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(skeletonAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]).start(() => setShowSkeleton(false));
    }
  }, [dataLoading]);

  const labels = {
    en: {
      scripture: 'Verse of the Day',
      sermons: 'Sermons',
    },
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        setFirstName(d.firstName || '');

        if (d.profile_photo) {
          const imgUri = await fetchBase64Image(d.profile_photo);
          const finalUri = imgUri || FALLBACK_IMAGE;
          setProfileImage(finalUri);
          await AsyncStorage.setItem('ProfileImage', finalUri);
        } else {
          setProfileImage(FALLBACK_IMAGE);
        }
      }
    } catch (err) {
      console.error('fetchUserProfile error:', err);
    }
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    const greetingText =
      hour < 12
        ? `GOOD MORNING${firstName ? ', ' + firstName.toUpperCase() : ''}!`
        : hour < 17
        ? `GOOD AFTERNOON${firstName ? ', ' + firstName.toUpperCase() : ''}!`
        : `GOOD EVENING${firstName ? ', ' + firstName.toUpperCase() : ''}!`;
    setGreeting(greetingText);
  }, [firstName]);

  const fetchTransactions = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/contributions/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(item => {
          const d = new Date(item.createdAt || Date.now());
          return {
            id: item.id,
            amount: item.amount,
            purpose: item.purpose || 'Contribution',
            dateTime: `${d.toDateString()} ${d.toLocaleTimeString()}`,
            communityName: item.community?.name || item.community || '',
          };
        });
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('fetchTransactions error:', err);
      setTransactions([]);
    }
  }, []);

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

  // ────────────────────────────────────────────────
  //  MOST IMPORTANT CHANGE: only fetch data if we have community
  // ────────────────────────────────────────────────
  const fetchCommunityContent = async (communityId) => {
    if (!communityId) {
      setScriptures([]);
      setSermons([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [scriptRes, sermonRes] = await Promise.all([
        fetch(`${BASE_URL}/scriptures/user/${communityId}`, { headers }),
        fetch(`${BASE_URL}/sermons/user/${communityId}`, { headers }),
      ]);

      const scriptJson = await scriptRes.json();
      const sermonJson = await sermonRes.json();

      if (scriptJson.success && Array.isArray(scriptJson.data)) {
        const data = await Promise.all(scriptJson.data.map(async (s) => {
          const imageUrl = s.photo ? await fetchBase64Image(s.photo) : FALLBACK_IMAGE;
          return {
            id: s.id.toString(),
            verse_reference: s.name || '',
            verse_text: s.description || '',
            imageUrl: imageUrl || FALLBACK_IMAGE,
            likes: s.likes || 0,
            liked: s.liked || false,
            shares: s.shares || 0,
          };
        }));
        setScriptures(data);
        setCurrentScriptureIndex(0);

        const likesObj = {}, likedObj = {}, sharesObj = {};
        data.forEach(s => {
          likesObj[s.id] = s.likes;
          likedObj[s.id] = s.liked;
          sharesObj[s.id] = s.shares;
        });
        setLikes(likesObj);
        setLikedStatus(likedObj);
        setShares(sharesObj);

        scriptureAnims.current = data.map(() => ({ fade: new Animated.Value(0), scale: new Animated.Value(0.9) }));
      }

      if (sermonJson.success && Array.isArray(sermonJson.data)) {
        const data = await Promise.all(sermonJson.data.map(async (s) => {
          const imageUrl = s.photo ? await fetchBase64Image(s.photo) : FALLBACK_IMAGE;
          return {
            id: s.id.toString(),
            title: s.name || '',
            description: s.description || '',
            imageUrl: imageUrl || FALLBACK_IMAGE,
          };
        }));
        setSermons(data);
      }
    } catch (err) {
      console.log('Fetch community content error:', err);
      setScriptures([]);
      setSermons([]);
      scriptureAnims.current = [];
    } finally {
      setDataLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setDataLoading(true);

    await fetchJoinedCommunities();

    // Profile & transactions can load in background
    fetchUserProfile();
    fetchTransactions();

    // Only fetch scripture/sermon if we have a community
    if (selectedCommunityId) {
      await fetchCommunityContent(selectedCommunityId);
    } else {
      setDataLoading(false);
    }

    setRefreshing(false);
  }, [selectedCommunityId]);
// Initial data load – runs only once when component mounts
useEffect(() => {
  const loadInitialData = async () => {
    setDataLoading(true);

    await fetchJoinedCommunities();
    await fetchUserProfile();
    await fetchTransactions();

    // scripture + sermon content will be loaded by the next useEffect
  };

  loadInitialData();
}, []); // ← empty array = only on first mount
  // Initial load
  // useEffect(() => {
  //   if (isFocused) {
  //     onRefresh();
  //   }
  // }, [isFocused, onRefresh]);

  // When selected community changes → load its content
  useEffect(() => {
    if (!loadingCommunities) {
      fetchCommunityContent(selectedCommunityId);
    }
  }, [selectedCommunityId, loadingCommunities]);

  // Greeting & animations (unchanged logic)
  useEffect(() => {
    if (!loadingCommunities && !dataLoading && scriptures.length > 0) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      scriptureAnims.current.forEach(anim => {
        Animated.parallel([
          Animated.timing(anim.fade, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [dataLoading, scriptures, loadingCommunities]);

  useEffect(() => {
    const visibleTxs = transactions.slice(0, 5);
    visibleTxs.forEach(tx => {
      if (!historyAnims.has(tx.id)) {
        historyAnims.set(tx.id, {
          fade: new Animated.Value(0),
          slide: new Animated.Value(30),
        });
      }

      const anim = historyAnims.get(tx.id);
      if (anim) {
        Animated.parallel([
          Animated.timing(anim.fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim.slide, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    });
  }, [transactions]);

  const goToPrevious = () => {
    const newIndex = currentScriptureIndex > 0 ? currentScriptureIndex - 1 : scriptures.length - 1;
    setCurrentScriptureIndex(newIndex);
    thumbnailFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  const goToNext = () => {
    const newIndex = currentScriptureIndex < scriptures.length - 1 ? currentScriptureIndex + 1 : 0;
    setCurrentScriptureIndex(newIndex);
    thumbnailFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

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
      // rollback
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

  const hasNoCommunity = !loadingCommunities && joinedCommunities.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View style={{ opacity: contentAnim, flex: 1 }}>
        <View style={styles.fixedHeader}>
          <View style={styles.navBar}>
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileContainer}>
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                  defaultSource={{ uri: FALLBACK_IMAGE }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Text style={styles.tabActive}>What would you like to do today?</Text>
            </View>
            <View style={styles.icons}>
              <TouchableOpacity onPress={() => router.push('/notification')} style={styles.iconTouchable}>
                <Ionicons name="notifications-outline" size={20} color={GOLD} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.greetingRow}>
            <Ionicons name="sunny-outline" size={16} color="#888" />
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />}
        >
          {hasNoCommunity ? (
            <View>
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
            </View>
          ) : (
            <>
              {/* VERSE OF THE DAY */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle1}>{labels[language].scripture}</Text>

                {dataLoading ? (
                  <ScriptureSkeleton />
                ) : scriptures.length > 0 ? (
                  <View style={styles.scriptureContainer}>
                    <View style={styles.smallImageContainer}>
                      <FlatList
                        ref={thumbnailFlatListRef}
                        data={scriptures}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                          const index = Math.round(e.nativeEvent.contentOffset.x / 60);
                          if (index !== currentScriptureIndex) {
                            setCurrentScriptureIndex(index);
                          }
                        }}
                        renderItem={({ item, index }) => (
                          <Animated.View
                            style={{
                              opacity: scriptureAnims.current[index]?.fade || 1,
                              transform: [{ scale: scriptureAnims.current[index]?.scale || 1 }],
                            }}
                          >
                            <View style={styles.smallImageItem}>
                              <Image source={{ uri: item.imageUrl }} style={styles.smallImage} resizeMode="cover" />
                              <View style={styles.smallOverlay} />
                              <View style={styles.smallTextContainer}>
                                <Text style={styles.smallReferenceTextSingleLine}>
                                  {item.verse_reference}
                                </Text>
                              </View>
                            </View>
                          </Animated.View>
                        )}
                        keyExtractor={item => item.id}
                        getItemLayout={(data, index) => ({ length: 60, offset: 60 * index, index })}
                      />
                    </View>

                    <View style={styles.wordCard}>
                      <Image
                        source={{ uri: scriptures[currentScriptureIndex]?.imageUrl || FALLBACK_IMAGE }}
                        style={styles.wordImage}
                        resizeMode="cover"
                      />
                      <View style={styles.wordOverlay} />
                      <View style={styles.wordContent}>
                        <Text style={styles.verseText}>{scriptures[currentScriptureIndex]?.verse_text}</Text>
                        <Text style={styles.verseReference}>{scriptures[currentScriptureIndex]?.verse_reference}</Text>
                      </View>

                      <View style={styles.actionButtons}>
                        {scriptures.length > 1 && (
                          <>
                            <TouchableOpacity onPress={goToPrevious} style={styles.navButton}>
                              <Ionicons name="chevron-back-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goToNext} style={styles.navButton}>
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
                            <Text style={styles.likeCount}>
                              {likes[scriptures[currentScriptureIndex]?.id] || 0}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleShare} style={styles.socialButton}>
                            <Ionicons name="share-outline" size={26} color={GOLD} />
                            <Text style={styles.likeCount}>
                              {shares[scriptures[currentScriptureIndex]?.id] || 0}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (
                  <EmptyState
                    icon="book-outline"
                    title="No scripture yet"
                    subtitle="This community hasn't shared any verses."
                  />
                )}
              </View>

              {/* SERMONS - unchanged */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{labels[language].sermons}</Text>
                {dataLoading ? (
                  <SermonSkeleton />
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
                  <EmptyState
                    icon="mic-off-outline"
                    title="No sermons yet"
                    subtitle="This community hasn't uploaded any sermons."
                  />
                )}
              </View>

              {/* Bible Quiz & Transactions - unchanged */}
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

              <View style={[styles.section, { paddingBottom: 20 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14 }}>
                  <Text style={styles.sectionTitle}>Recent Transactions</Text>
                  <TouchableOpacity onPress={() => router.push('/history')}>
                    <Text style={{ color: GOLD, fontSize: 13, fontFamily: 'GothamMedium' }}>
                      View More →
                    </Text>
                  </TouchableOpacity>
                </View>

                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => {
                    const anim = historyAnims.get(tx.id);
                    return (
                      <Animated.View
                        key={tx.id}
                        style={{
                          opacity: anim?.fade || 1,
                          transform: [{ translateY: anim?.slide || 0 }],
                        }}
                      >
                        <TouchableOpacity style={styles.historyRow}>
                          <Ionicons name="repeat-outline" size={20} color="#333" />
                          <View style={styles.historyContent}>
                            <Text style={styles.historyAmount}>
                              TZS {tx.amount.toLocaleString()}
                            </Text>
                            {tx.communityName ? (
                              <Text style={styles.historyCommunity}>{tx.communityName}</Text>
                            ) : null}
                          </View>
                          <Ionicons name="chevron-forward-outline" size={20} color="#333" />
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })
                ) : (
                  <Text style={{ textAlign: 'center', color: '#888', padding: 20 }}>No transactions yet</Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>

      {/* Skeleton overlay - unchanged */}
      <Animated.View
        pointerEvents={showSkeleton ? 'auto' : 'none'}
        style={{
          ...StyleSheet.absoluteFillObject,
          zIndex: 20,
          backgroundColor: '#fff',
          opacity: skeletonAnim,
        }}
      >
        <View style={styles.fixedHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#eee' }} />
              <View style={{ marginLeft: 8 }}>
                <View style={{ height: 14, width: 220, backgroundColor: '#eee', borderRadius: 6 }} />
              </View>
            </View>
            <View style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: '#eee' }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#eee' }} />
            <View style={{ marginLeft: 8, height: 12, width: 120, backgroundColor: '#eee', borderRadius: 6 }} />
          </View>
        </View>

        <ScrollView
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle1}>{labels[language].scripture}</Text>
            <ScriptureSkeleton />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels[language].sermons}</Text>
            <SermonSkeleton />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bible Quiz</Text>
            <View style={{ marginHorizontal: 16, marginTop: 12 }}>
              <View style={{ height: 115, borderRadius: 12, backgroundColor: '#fff' }}>
                <View style={{ height: 14, width: '40%', backgroundColor: '#eee', margin: 20, borderRadius: 6 }} />
              </View>
            </View>
          </View>

          <View style={[styles.section, { paddingBottom: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14 }}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <View style={{ height: 14, width: 70, backgroundColor: '#eee', borderRadius: 6 }} />
            </View>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={{ marginHorizontal: 16, marginTop: 12 }}>
                <View style={{ height: 60, borderRadius: 8, backgroundColor: '#eee' }} />
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  section: { marginBottom: 12, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 15, color: '#222', paddingHorizontal: 10, paddingVertical: 6, fontFamily: 'GothamBold' },
  sectionTitle1: { fontSize: 15, color: '#222', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6, fontFamily: 'GothamBold' },

  fixedHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 1,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 4,
  },

  // Shared padding for both real and skeleton ScrollView
  scrollContentContainer: {
    paddingTop: Platform.OS === 'android' ? 115 : 85, // matches header height + padding
    paddingBottom: 100,
  },

  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabs: { flexDirection: 'row', alignItems: 'center' },
  tabActive: { fontSize: 14, color: '#000000', fontFamily: 'GothamRegular', marginLeft: 8 },
  icons: { flexDirection: 'row', alignItems: 'center' },
  iconTouchable: { padding: 4, borderRadius: 6 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  greetingText: { fontSize: 12, color: GOLD, marginLeft: 6, fontFamily: 'GothamBold' },
  profileContainer: { marginRight: 8 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1.5, borderColor: GOLD },

  scriptureContainer: { flexDirection: 'row', marginHorizontal: 10 },
  smallImageContainer: { width: 60, height: 260, borderRadius: 10, overflow: 'hidden', marginRight: 12 },
  smallImageItem: { width: 60, height: 260, position: 'relative' },
  smallImage: { width: '100%', height: '100%' },
  smallOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  smallTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  smallReferenceTextSingleLine: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'GothamBold',
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    width: 240,
    numberOfLines: 1,
  },

  wordCard: { flex: 1, height: 260, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  wordImage: { width: '100%', height: '100%', position: 'absolute' },
  wordOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 },
  wordContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  verseText: { color: '#fff', fontSize: 14, lineHeight: 22, textAlign: 'center', fontFamily: 'GothamMedium' },
  verseReference: { color: '#fff', fontSize: 12, marginTop: 8, textAlign: 'center', fontFamily: 'GothamBold' },
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

  quizCard: { backgroundColor: '#fff', borderRadius: 22, padding: 20, marginHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', elevation: 10, shadowOpacity: 0.09, shadowRadius: 14, borderColor: '#f0f0f0', height: 115 },
  quizIconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFF8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: GOLD, borderStyle: 'dashed' },
  quizTitle: { fontFamily: 'GothamBold', fontSize: 18, color: '#222' },
  startBtn: { backgroundColor: GOLD, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
  startText: { color: '#fff', fontFamily: 'GothamBold', fontSize: 16 },

  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 15, marginHorizontal: 16, marginBottom: 8, shadowOpacity: 0.15, shadowRadius: 4.65, elevation: 4 },
  historyContent: { marginLeft: 10, flex: 1 },
  historyAmount: { fontSize: 14, color: GOLD, fontFamily: 'GothamBold' },
  historyCommunity: { fontSize: 13, color: '#222', fontFamily: 'GothamBold', marginTop: 4 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, paddingHorizontal: 30 },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '600', color: GOLD, fontFamily: 'GothamBold' },
  emptySubtitle: { marginTop: 6, fontSize: 12, color: '#555', textAlign: 'center', fontFamily: 'GothamRegular' },

  joinBtn: { backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  joinBtnText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },
});

export default HomeScreen;