// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   Dimensions,
//   FlatList,
//   Image,
//   Platform,
//   RefreshControl,
//   SafeAreaView,
//   ScrollView,
//   Share,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
// } from 'react-native';
// import { BASE_URL } from '../apiConfig';
// import { fetchBase64Image } from '../fetchBase64Image';

// const { width, height } = Dimensions.get('window');
// const GOLD = '#E18731';
// const FALLBACK_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';

// const EmptyState = ({ icon, title, subtitle }) => (
//   <View style={styles.emptyContainer}>
//     <Ionicons name={icon} size={48} color={GOLD} />
//     <Text style={styles.emptyTitle}>{title}</Text>
//     <Text style={styles.emptySubtitle}>{subtitle}</Text>
//   </View>
// );

// const HomeScreen = () => {
//   const router = useRouter();

//   const [language] = useState('en');
//   const [loadingCommunities, setLoadingCommunities] = useState(true);
//   const [joinedCommunities, setJoinedCommunities] = useState([]);
//   const [selectedCommunityId, setSelectedCommunityId] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [scriptures, setScriptures] = useState([]);
//   const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
//   const [sermons, setSermons] = useState([]);

//   const [transactions, setTransactions] = useState([]);

//   const [firstName, setFirstName] = useState('');
//   const [greeting, setGreeting] = useState('HELLO');
//   const [profileImage, setProfileImage] = useState(FALLBACK_IMAGE);

//   const [likes, setLikes] = useState({});
//   const [likedStatus, setLikedStatus] = useState({});
//   const [shares, setShares] = useState({});

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scriptureAnims = useRef([]);
//   const historyAnims = useRef(new Map()).current;

//   const labels = {
//     en: {
//       scripture: 'Verse of the Day',
//       sermons: 'Sermons',
//       noScripture: 'No verse available',
//       noSermons: 'No sermons available',
//       noSermonsSub: 'Connect with your church community to access reflections.',
//     },
//   };

//   const fetchUserProfile = useCallback(async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) return;

//       const res = await fetch(`${BASE_URL}/users/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const json = await res.json();

//       if (json.success && json.data) {
//         const d = json.data;
//         setFirstName(d.firstName || '');

//         if (d.profile_photo) {
//           const imgUri = await fetchBase64Image(d.profile_photo);
//           const finalUri = imgUri || FALLBACK_IMAGE;
//           setProfileImage(finalUri);
//           await AsyncStorage.setItem('ProfileImage', finalUri);
//         } else {
//           setProfileImage(FALLBACK_IMAGE);
//           await AsyncStorage.removeItem('ProfileImage');
//         }
//       }
//     } catch (err) {
//       console.error('fetchUserProfile error:', err);
//     }
//   }, []);

//   useEffect(() => {
//     const hour = new Date().getHours();
//     const greetingText =
//       hour < 12
//         ? `GOOD MORNING${firstName ? ', ' + firstName.toUpperCase() : ''}!`
//         : hour < 17
//         ? `GOOD AFTERNOON${firstName ? ', ' + firstName.toUpperCase() : ''}!`
//         : `GOOD EVENING${firstName ? ', ' + firstName.toUpperCase() : ''}!`;
//     setGreeting(greetingText);
//   }, [firstName]);

//   const fetchTransactions = useCallback(async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) return;

//       const res = await fetch(`${BASE_URL}/contributions/user`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const json = await res.json();

//       if (json.success && Array.isArray(json.data)) {
//         const mapped = json.data.map(item => {
//           const d = new Date(item.createdAt || Date.now());
//           return {
//             id: item.id,
//             amount: item.amount,
//             purpose: item.purpose || 'Contribution',
//             dateTime: `${d.toDateString()} ${d.toLocaleTimeString()}`,
//           };
//         });
//         setTransactions(mapped);
//       } else {
//         setTransactions([]);
//       }
//     } catch (err) {
//       console.error('fetchTransactions error:', err);
//       setTransactions([]);
//     }
//   }, []);

//   const fetchJoinedCommunities = async () => {
//     setLoadingCommunities(true);
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) throw new Error();

//       const res = await fetch(`${BASE_URL}/communities/joined`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const json = await res.json();

//       if (json.success && json.data?.length > 0) {
//         const communities = json.data.map(c => ({
//           id: c.id.toString(),
//           name: c.name || 'Unnamed',
//           image: c.logo || FALLBACK_IMAGE,
//         }));
//         setJoinedCommunities(communities);
//         const stored = await AsyncStorage.getItem('selectedCommunityId');
//         const id = stored && communities.some(c => c.id === stored) ? stored : communities[0].id;
//         setSelectedCommunityId(id);
//         await AsyncStorage.setItem('selectedCommunityId', id);
//       } else {
//         setJoinedCommunities([]);
//         setSelectedCommunityId(null);
//       }
//     } catch {
//       setJoinedCommunities([]);
//       setSelectedCommunityId(null);
//     } finally {
//       setLoadingCommunities(false);
//     }
//   };

//   const fetchData = async () => {
//     if (!selectedCommunityId) {
//       setScriptures([]);
//       setSermons([]);
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const headers = { Authorization: `Bearer ${token}` };

//       const [scriptRes, sermonRes] = await Promise.all([
//         fetch(`${BASE_URL}/scriptures/user/${selectedCommunityId}`, { headers }),
//         fetch(`${BASE_URL}/sermons/user/${selectedCommunityId}`, { headers }),
//       ]);

//       const scriptJson = await scriptRes.json();
//       const sermonJson = await sermonRes.json();

//       if (scriptJson.success && Array.isArray(scriptJson.data)) {
//         const data = await Promise.all(scriptJson.data.map(async (s) => {
//           const imageUrl = s.photo ? await fetchBase64Image(s.photo) : FALLBACK_IMAGE;
//           return {
//             id: s.id.toString(),
//             verse_reference: s.name || '',
//             verse_text: s.description || '',
//             imageUrl: imageUrl || FALLBACK_IMAGE,
//             likes: s.likes || 0,
//             liked: s.liked || false,
//             shares: s.shares || 0,
//           };
//         }));
//         setScriptures(data);

//         const likesObj = {}, likedObj = {}, sharesObj = {};
//         data.forEach(s => {
//           likesObj[s.id] = s.likes;
//           likedObj[s.id] = s.liked;
//           sharesObj[s.id] = s.shares;
//         });
//         setLikes(likesObj);
//         setLikedStatus(likedObj);
//         setShares(sharesObj);

//         scriptureAnims.current = data.map(() => ({ fade: new Animated.Value(0), scale: new Animated.Value(0.9) }));
//       } else {
//         setScriptures([]);
//       }

//       if (sermonJson.success && Array.isArray(sermonJson.data)) {
//         const data = await Promise.all(sermonJson.data.map(async (s) => {
//           const imageUrl = s.photo ? await fetchBase64Image(s.photo) : FALLBACK_IMAGE;
//           return {
//             id: s.id.toString(),
//             title: s.name || '',
//             description: s.description || '',
//             imageUrl: imageUrl || FALLBACK_IMAGE,
//           };
//         }));
//         setSermons(data);
//       } else {
//         setSermons([]);
//       }
//     } catch (err) {
//       console.log('Fetch error:', err);
//       setScriptures([]);
//       setSermons([]);
//     }
//   };

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await Promise.all([
//       fetchJoinedCommunities(),
//       fetchUserProfile(),
//       fetchTransactions(),
//     ]);
//     if (selectedCommunityId) await fetchData();
//     setRefreshing(false);
//   }, [selectedCommunityId]);

//   useEffect(() => {
//     fetchJoinedCommunities();
//     fetchUserProfile();
//     fetchTransactions();
//   }, []);

//   useEffect(() => {
//     if (!loadingCommunities) fetchData();
//   }, [selectedCommunityId, loadingCommunities]);

//   useEffect(() => {
//     if (!loadingCommunities) {
//       Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
//       scriptureAnims.current.forEach(anim => {
//         Animated.parallel([
//           Animated.timing(anim.fade, { toValue: 1, duration: 600, useNativeDriver: true }),
//           Animated.timing(anim.scale, { toValue: 1, duration: 600, useNativeDriver: true }),
//         ]).start();
//       });
//     }
//   }, [loadingCommunities, scriptures]);

//   const handleLike = async () => {
//     const current = scriptures[currentScriptureIndex];
//     if (!current?.id) return;

//     const wasLiked = likedStatus[current.id] || false;
//     const prevLikes = likes[current.id] || 0;

//     setLikes(prev => ({ ...prev, [current.id]: wasLiked ? prevLikes - 1 : prevLikes + 1 }));
//     setLikedStatus(prev => ({ ...prev, [current.id]: !wasLiked }));

//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       await fetch(`${BASE_URL}/likes/scripture/${current.id}`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//     } catch {
//       setLikes(prev => ({ ...prev, [current.id]: prevLikes }));
//       setLikedStatus(prev => ({ ...prev, [current.id]: wasLiked }));
//     }
//   };

//   const handleShare = async () => {
//     const current = scriptures[currentScriptureIndex];
//     if (!current) return;

//     try {
//       await Share.share({
//         message: `${current.verse_text}\n\n${current.verse_reference}\nShared via Sadaka App`,
//       });

//       setShares(prev => ({ ...prev, [current.id]: (prev[current.id] || 0) + 1 }));

//       const token = await AsyncStorage.getItem('userToken');
//       await fetch(`${BASE_URL}/shares/scripture/${current.id}`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//     } catch (err) {
//       console.log('Share failed', err);
//     }
//   };

//   // Show simple ActivityIndicator + "Loading..." while fetching communities (just like ProfileScreen)
//   if (loadingCommunities) {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color={GOLD} />
//         <Text style={{ marginTop: 16, fontSize: 16, color: '#666', fontFamily: 'GothamMedium' }}>
//           Loading...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   if (joinedCommunities.length === 0) {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
//         <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
//           <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />}>
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>{labels[language].scripture}</Text>
//               <EmptyState icon="book-outline" title="No verse available" subtitle="Join a community to see daily verses" />
//             </View>
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>{labels[language].sermons}</Text>
//               <EmptyState icon="mic-off-outline" title="No sermons" subtitle="Join your church to access sermons" />
//             </View>
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Bible Quiz</Text>
//               <View style={styles.quizCard}>
//                 <View style={styles.quizIconCircle}>
//                   <MaterialCommunityIcons name="brain" size={42} color={GOLD} />
//                 </View>
//                 <View style={{ flex: 1, marginLeft: 16 }}>
//                   <Text style={styles.quizTitle}>Bible Quiz of the Day</Text>
//                 </View>
//                 <TouchableOpacity style={styles.startBtn} onPress={() => router.push('bible-quize/screens/WelcomeScreen')}>
//                   <Text style={styles.startText}>Start</Text>
//                   <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <View style={{ alignItems: 'center', padding: 40 }}>
//               <Ionicons name="people-outline" size={70} color={GOLD} />
//               <Text style={{ fontSize: 20, fontFamily: 'GothamBold', marginTop: 20, textAlign: 'center' }}>
//                 You Haven't Joined a Community
//               </Text>
//               <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginVertical: 16 }}>
//                 Join your church to see daily verses and sermons.
//               </Text>
//               <TouchableOpacity style={styles.joinBtn} onPress={() => router.push('/CommunityScreen')}>
//                 <Text style={styles.joinBtnText}>Find Community</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </Animated.View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
//       <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
//         {/* FIXED HEADER */}
//         <View style={styles.fixedHeader}>
//           <View style={styles.navBar}>
//             <View style={styles.tabs}>
//               <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileContainer}>
//                 <Image
//                   source={{ uri: profileImage }}
//                   style={styles.avatar}
//                   defaultSource={{ uri: FALLBACK_IMAGE }}
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//               <Text style={styles.tabActive}>What would you like to do today?</Text>
//             </View>
//             <View style={styles.icons}>
//               <TouchableOpacity onPress={() => router.push('/notification')} style={styles.iconTouchable}>
//                 <Ionicons name="notifications-outline" size={20} color={GOLD} />
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View style={styles.greetingRow}>
//             <Ionicons name="sunny-outline" size={16} color="#888" />
//             <Text style={styles.greetingText}>{greeting}</Text>
//           </View>
//         </View>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 105 : 78, paddingBottom: 100 }}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />}
//         >
//           {/* VERSE OF THE DAY */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle1}>{labels[language].scripture}</Text>
//             {scriptures.length > 0 ? (
//               <View style={styles.scriptureContainer}>
//                 <View style={styles.smallImageContainer}>
//                   <FlatList
//                     data={scriptures}
//                     horizontal
//                     pagingEnabled
//                     showsHorizontalScrollIndicator={false}
//                     onMomentumScrollEnd={(e) => {
//                       const index = Math.round(e.nativeEvent.contentOffset.x / 60);
//                       setCurrentScriptureIndex(index);
//                     }}
//                     renderItem={({ item, index }) => (
//                       <Animated.View style={{
//                         opacity: scriptureAnims.current[index]?.fade || 1,
//                         transform: [{ scale: scriptureAnims.current[index]?.scale || 1 }]
//                       }}>
//                         <View style={styles.smallImageItem}>
//                           <Image source={{ uri: item.imageUrl }} style={styles.smallImage} resizeMode="cover" />
//                         </View>
//                       </Animated.View>
//                     )}
//                     keyExtractor={item => item.id}
//                   />
//                 </View>

//                 <View style={styles.wordCard}>
//                   <Image
//                     source={{ uri: scriptures[currentScriptureIndex]?.imageUrl || FALLBACK_IMAGE }}
//                     style={styles.wordImage}
//                     resizeMode="cover"
//                   />
//                   <View style={styles.wordOverlay} />
//                   <View style={styles.wordContent}>
//                     <Text style={styles.verseText}>{scriptures[currentScriptureIndex]?.verse_text}</Text>
//                     <Text style={styles.verseReference}>{scriptures[currentScriptureIndex]?.verse_reference}</Text>
//                   </View>

//                   <View style={styles.actionButtons}>
//                     {scriptures.length > 1 && (
//                       <>
//                         <TouchableOpacity onPress={() => setCurrentScriptureIndex(i => i > 0 ? i - 1 : scriptures.length - 1)} style={styles.navButton}>
//                           <Ionicons name="chevron-back-outline" size={24} color="#fff" />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => setCurrentScriptureIndex(i => i < scriptures.length - 1 ? i + 1 : 0)} style={styles.navButton}>
//                           <Ionicons name="chevron-forward-outline" size={24} color="#fff" />
//                         </TouchableOpacity>
//                       </>
//                     )}
//                     <View style={styles.socialButtons}>
//                       <TouchableOpacity onPress={handleLike} style={styles.socialButton}>
//                         <Ionicons
//                           name={likedStatus[scriptures[currentScriptureIndex]?.id] ? 'heart' : 'heart-outline'}
//                           size={26}
//                           color={likedStatus[scriptures[currentScriptureIndex]?.id] ? GOLD : '#fff'}
//                         />
//                         <Text style={styles.likeCount}>{likes[scriptures[currentScriptureIndex]?.id] || 0}</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity onPress={handleShare} style={styles.socialButton}>
//                         <Ionicons name="share-outline" size={26} color={GOLD} />
//                         <Text style={styles.likeCount}>{shares[scriptures[currentScriptureIndex]?.id] || 0}</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             ) : (
//               <Text style={{ textAlign: 'center', color: '#888', padding: 20 }}>No verse available</Text>
//             )}
//           </View>

//           {/* SERMONS */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>{labels[language].sermons}</Text>
//             {sermons.length > 0 ? (
//               <View style={{ paddingHorizontal: 2 }}>
//                 {sermons.map((sermon) => (
//                   <TouchableOpacity
//                     key={sermon.id}
//                     style={styles.eventCardVertical}
//                     onPress={() => router.push({ pathname: '/sermon', params: { id: sermon.id } })}
//                   >
//                     <Image source={{ uri: sermon.imageUrl || FALLBACK_IMAGE }} style={styles.eventImageVertical} resizeMode="cover" />
//                     <View style={styles.eventInfoVertical}>
//                       <Text style={styles.eventName} numberOfLines={2}>{sermon.title}</Text>
//                       <Text style={styles.eventTime}>
//                         {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                       </Text>
//                       <Text style={styles.eventLocation} numberOfLines={2}>
//                         {sermon.description || "Tap to listen to this powerful message of faith and hope."}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             ) : (
//               <Text style={{ textAlign: 'center', color: '#888', padding: 20 }}>No sermons available</Text>
//             )}
//           </View>

//           {/* BIBLE QUIZ */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Bible Quiz</Text>
//             <View style={styles.quizCard}>
//               <View style={styles.quizIconCircle}>
//                 <MaterialCommunityIcons name="brain" size={42} color={GOLD} />
//               </View>
//               <View style={{ flex: 1, marginLeft: 16 }}>
//                 <Text style={styles.quizTitle}>Bible Quiz of the Day</Text>
//               </View>
//               <TouchableOpacity style={styles.startBtn} onPress={() => router.push('bible-quize/screens/WelcomeScreen')}>
//                 <Text style={styles.startText}>Start</Text>
//                 <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* RECENT TRANSACTIONS */}
//           <View style={[styles.section, { paddingBottom: 20 }]}>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14 }}>
//               <Text style={styles.sectionTitle}>Recent Transactions</Text>
//               <TouchableOpacity onPress={() => router.push('/history')}>
//                 <Text style={{ color: GOLD, fontSize: 13, fontFamily: 'GothamMedium' }}>
//                   View More →
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {transactions.length > 0 ? (
//               transactions
//                 .slice(0, 5)
//                 .map((tx) => {
//                   if (!historyAnims.has(tx.id)) {
//                     historyAnims.set(tx.id, {
//                       fade: new Animated.Value(0),
//                       slide: new Animated.Value(30),
//                     });
//                   }
//                   const anim = historyAnims.get(tx.id);

//                   useEffect(() => {
//                     Animated.parallel([
//                       Animated.timing(anim.fade, { toValue: 1, duration: 400, useNativeDriver: true }),
//                       Animated.timing(anim.slide, { toValue: 0, duration: 400, useNativeDriver: true }),
//                     ]).start();
//                   }, []);

//                   return (
//                     <Animated.View
//                       key={tx.id}
//                       style={{
//                         opacity: anim.fade,
//                         transform: [{ translateY: anim.slide }],
//                       }}
//                     >
//                       <TouchableOpacity style={styles.historyRow}>
//                         <Ionicons name="repeat-outline" size={20} color="#333" />
//                         <View style={styles.historyContent}>
//                           <Text style={styles.historyAmount}>
//                             TZS {tx.amount.toLocaleString()}
//                           </Text>
//                           <Text style={styles.historyType}>{tx.purpose}</Text>
//                         </View>
//                         <Ionicons name="chevron-forward-outline" size={20} color="#333" />
//                       </TouchableOpacity>
//                     </Animated.View>
//                   );
//                 })
//             ) : (
//               <Text style={{ textAlign: 'center', color: '#888', padding: 20 }}>No transactions yet</Text>
//             )}
//           </View>
//         </ScrollView>
//       </Animated.View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   section: { marginBottom: 12, backgroundColor: '#fff' },
//   sectionTitle: { fontSize: 15, color: '#222', paddingHorizontal: 10, paddingVertical: 6, fontFamily: 'GothamBold' },
//   sectionTitle1: { fontSize: 15, color: '#222', paddingHorizontal: 10, paddingVertical: Platform.OS === 'android' ? 5 : 6, fontFamily: 'GothamBold' },

//   fixedHeader: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingVertical: Platform.OS === 'android' ? 25 : -10,
//     paddingBottom: 8,
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//   },
//   navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   tabs: { flexDirection: 'row', alignItems: 'center' },
//   tabActive: { fontSize: 14, color: '#000000', fontFamily: 'GothamRegular', marginLeft: 8 },
//   icons: { flexDirection: 'row', alignItems: 'center' },
//   iconTouchable: { padding: 4, borderRadius: 6 },
//   greetingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
//   greetingText: { fontSize: 12, color: GOLD, marginLeft: 6, fontFamily: 'GothamBold' },
//   profileContainer: { marginRight: 8 },
//   avatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1.5, borderColor: GOLD, resizeMode: 'cover' },

//   scriptureContainer: { flexDirection: 'row', marginHorizontal: 10 },
//   smallImageContainer: { width: 60, height: 260, borderRadius: 10, overflow: 'hidden', marginRight: 12 },
//   smallImageItem: { width: 60, height: 260 },
//   smallImage: { width: '100%', height: '100%' },
//   wordCard: { flex: 1, height: 260, borderRadius: 12, overflow: 'hidden', position: 'relative' },
//   wordImage: { width: '100%', height: '100%', position: 'absolute' },
//   wordOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 },
//   wordContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   verseText: { color: '#fff', fontSize: 14, lineHeight: 20, textAlign: 'center', fontFamily: 'GothamMedium' },
//   verseReference: { color: '#fff', fontSize: 12, marginTop: 6, textAlign: 'center', fontFamily: 'GothamBold' },

//   actionButtons: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   navButton: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 6 },
//   socialButtons: { flexDirection: 'row', gap: 16 },
//   socialButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
//   likeCount: { color: '#fff', marginLeft: 6, fontSize: 13, fontFamily: 'GothamBold' },

//   eventCardVertical: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
//   eventImageVertical: { width: 110, height: 90, borderRadius: 12, backgroundColor: '#eee' },
//   eventInfoVertical: { flex: 1, paddingLeft: 16, justifyContent: 'center' },
//   eventName: { fontSize: 12.5, color: '#222', fontFamily: 'GothamBold', lineHeight: 21 },
//   eventTime: { fontSize: 13, color: GOLD, marginTop: 4, fontFamily: 'GothamMedium' },
//   eventLocation: { fontSize: 13, color: '#666', marginTop: 6, fontFamily: 'GothamRegular', lineHeight: 18 },

//   quizCard: { backgroundColor: '#fff', borderRadius: 22, padding: 20, marginHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', elevation: 10,  shadowOpacity: 0.09, shadowRadius: 14,  borderColor: '#f0f0f0', height: 115 },
//   quizIconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFF8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: GOLD, borderStyle: 'dashed' },
//   quizTitle: { fontFamily: 'GothamBold', fontSize: 18, color: '#222' },
//   startBtn: { backgroundColor: GOLD, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
//   startText: { color: '#fff', fontFamily: 'GothamBold', fontSize: 16 },

//   historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 15, marginHorizontal: 16, marginBottom: 8, shadowOpacity: 0.15, shadowRadius: 4.65, elevation: 4 },
//   historyContent: { marginLeft: 10, flex: 1 },
//   historyAmount: { fontSize: 14, color: GOLD, fontFamily: 'GothamBold' },
//   historyType: { fontSize: 14, color: '#333', fontFamily: 'GothamRegular', padding: 5 },

//   emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, paddingHorizontal: 30 },
//   emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '600', color: GOLD, fontFamily: 'GothamBold' },
//   emptySubtitle: { marginTop: 6, fontSize: 12, color: '#555', textAlign: 'center', fontFamily: 'GothamRegular' },
//   joinBtn: { backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
//   joinBtnText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },
// });

// export default HomeScreen;


import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../apiConfig';

const GOLD = '#E18731';

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${hour12.toString()}:${minutes} ${ampm}`;
  return { day, month, time };
}

export default function EventsScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('my');
  const [allEvents, setAllEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const eventAnims = useRef([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const fetchAllEvents = async (savedToken) => {
    try {
      if (!savedToken) {
        throw new Error('No token found');
      }
      const storedCommunityId = await AsyncStorage.getItem('selectedCommunityId');
      // Construct URL without communityId if it is null or undefined
      const url = storedCommunityId
        ? `${BASE_URL}/events/user/${storedCommunityId}`
        : `${BASE_URL}/events/user/`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        const enriched = json.data.map((evt) => {
          const { day, month, time } = formatDate(evt.eventDate);
          const locationText = `${evt.street}, ${evt.district}, ${evt.region}`;
          return {
            id: evt.id,
            title: evt.name,
            description: evt.description,
            location: locationText,
            day,
            month,
            time,
            image:
              evt.imageUrl ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s',
          };
        });
        setAllEvents(enriched);
        return enriched;
      } else {
        console.error('Invalid API response for all events:', json);
        
        setError('No events yet. Join a community to discover fellowships, worship nights, and special services near you.');
        return [];
      }
    } catch (err) {
      console.error('Fetch all events error:', err);
      setError('Failed to fetch all events');
      return [];
    }
  };

  const fetchMyEvents = async (savedToken) => {
    try {
      if (!savedToken) {
        throw new Error('No token found');
      }
      const storedCommunityId = await AsyncStorage.getItem('selectedCommunityId');
      // Construct URL without communityId if it is null or undefined
      const url = storedCommunityId
        ? `${BASE_URL}/events/confirmed/${storedCommunityId}`
        : `${BASE_URL}/events/confirmed/`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        const enriched = json.data.map((evt) => {
          const { day, month, time } = formatDate(evt.eventDate);
          const locationText = `${evt.street}, ${evt.district}, ${evt.region}`;
          return {
            id: evt.id,
            title: evt.name,
            description: evt.description,
            location: locationText,
            day,
            month,
            time,
            image:
              evt.imageUrl ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s',
          };
        });
        setMyEvents(enriched);
        return enriched;
      } else {
        console.error('Invalid API response for my events:', json);
        setError('Invalid response from server');
        return [];
      }
    } catch (err) {
      console.error('Fetch my events error:', err);
      setError('Failed to fetch my events');
      return [];
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      setToken(savedToken);
      if (!savedToken) {
        throw new Error('No token found');
      }

      const [allEventsData, myEventsData] = await Promise.all([
        fetchAllEvents(savedToken),
        fetchMyEvents(savedToken),
      ]);
      eventAnims.current = [...allEventsData, ...myEventsData].map(() => ({
        fade: new Animated.Value(0),
        slide: new Animated.Value(30),
        vowButton: new Animated.Value(1),
      }));
      animateEvents();
    } catch (err) {
      console.error('Fetch events error:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateEvents = () => {
    const animations = eventAnims.current.map((anim, index) =>
      Animated.sequence([
        Animated.delay(index * 300),
        Animated.parallel([
          Animated.timing(anim.fade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.slide, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    Animated.parallel(animations).start();
  };

  const filteredMyEvents = myEvents.filter((evt) =>
    `${evt.title} ${evt.description} ${evt.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const filteredAllEvents = allEvents.filter((evt) =>
    `${evt.title} ${evt.description} ${evt.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    eventAnims.current.forEach((anim) => {
      anim.fade.setValue(0);
      anim.slide.setValue(30);
    });
    animateEvents();
  };

  const handleMakeVow = async (event, index) => {
    Animated.sequence([
      Animated.timing(eventAnims.current[index].vowButton, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(eventAnims.current[index].vowButton, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const vow = {
      event_title: event.title,
      event_date: `${event.day} ${event.month} ${event.time}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const existingVows = await AsyncStorage.getItem('userEventVows');
      const vows = existingVows ? JSON.parse(existingVows) : [];
      vows.push(vow);
      await AsyncStorage.setItem('userEventVows', JSON.stringify(vows));
      Alert.alert(
        'Vow Saved',
        `Your vow for "${event.title}" has been saved.`
      );
    } catch (error) {
      console.error('Error saving vow:', error);
      Alert.alert('Error', 'Failed to save vow.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderEventCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: eventAnims.current[index]?.fade || 0,
        transform: [{ translateY: eventAnims.current[index]?.slide || 30 }],
      }}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('EventDetailScreen', { id: item.id })}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{item.day}</Text>
            <Text style={styles.dateMonth}>{item.month}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.dateInline}>{item.time}</Text>
          <Text style={styles.location} numberOfLines={2}>
            {item.location}
          </Text>
          {/* <Animated.View style={{ transform: [{ scale: eventAnims.current[index]?.vowButton || 1 }] }}>
            <TouchableOpacity
              style={styles.vowButton}
              onPress={() => handleMakeVow(item, index)}
            >
              <Text style={styles.vowButtonText}>Make a Vow</Text>
            </TouchableOpacity>
          </Animated.View> */}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSkeletonCard = () => (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <View style={[styles.image, { backgroundColor: '#e5e7eb' }]} />
        <View style={styles.dateBadge}>
          <View style={{ width: 20, height: 14, backgroundColor: '#e5e7eb', borderRadius: 2 }} />
          <View style={{ width: 30, height: 10, backgroundColor: '#e5e7eb', borderRadius: 2, marginTop: 2 }} />
        </View>
      </View>
      <View style={styles.info}>
        <View style={{ width: '60%', height: 14, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 4 }} />
        <View style={{ width: '40%', height: 12, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 2 }} />
        <View style={{ width: '80%', height: 11, backgroundColor: '#e5e7eb', borderRadius: 4 }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <TouchableOpacity>
              </TouchableOpacity>
              <Text style={styles.headerText}>Events</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('notification')}
                style={styles.iconButton}
              >
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Search */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
              <TextInput
                placeholder="Search for an event"
                placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.searchInput}
                clearButtonMode="while-editing"
              />
            </View>
          </Animated.View>

          {/* Tabs */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => handleTabPress('my')}>
                <Text
                  style={[styles.tabText, activeTab === 'my' ? styles.activeTab : styles.inactiveTab]}
                >
                  My Events
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTabPress('all')}>
                <Text
                  style={[styles.tabText, activeTab === 'all' ? styles.activeTab : styles.inactiveTab]}
                >
                  All Events
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Event List */}
          <View style={{ flex: 1 }}>
            {loading ? (
              <FlatList
                data={[1, 2, 3]} // Render 3 skeleton cards
                keyExtractor={(item) => `skeleton-${item}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                renderItem={renderSkeletonCard}
              />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
              
            ) : (
              <View style={{ flex: 1 }}>
                {activeTab === 'my' ? (
                  <FlatList
                    data={filteredMyEvents}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                    ListEmptyComponent={<Text style={styles.noResults}>No events yet. Join a community to discover fellowships, worship nights, and special services near you.</Text>}
                    renderItem={renderEventCard}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={GOLD}
                        colors={[GOLD]}
                      />
                    }
                  />
                ) : (
                  <FlatList
                    data={filteredAllEvents}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                    ListEmptyComponent={<Text style={styles.noResults}>No events yet. Join a community to discover fellowships, worship nights, and special services near you.</Text>}
                    renderItem={renderEventCard}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={GOLD}
                        colors={[GOLD]}
                      />
                    }
                  />
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? -100 : 30 },
header: {
  flexDirection: 'row',
  alignItems: 'flex-start',     // align items to the left
  justifyContent: 'flex-start', // move content to the left
  marginBottom: 16,
},

headerText: { 
  fontSize: 18, 
  color: '#222',
  textAlign: 'left',            // text alignment
  fontFamily: 'GothamBold',
},

  iconButton: { padding: 6 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { 
    flex: 1, 
    fontSize: 14, 
    color: '#222', 
    paddingVertical: 0, 
    fontFamily: 'GothamRegular',
  },
  tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tabText: { 
    fontSize: 14, 
    marginHorizontal: 16, 
    fontFamily: 'GothamMedium',
  },
  activeTab: { color: GOLD, borderBottomWidth: 2, borderColor: GOLD, paddingBottom: 4 },
  inactiveTab: { color: '#888', paddingBottom: 4 },
  noResults: { 
    textAlign: 'center', 
    marginTop: 28, 
    color: '#999', 
    fontSize: 13, 
    fontFamily: 'GothamRegular',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 110,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#000000cc',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  dateDay: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'GothamBold',
  },
  dateMonth: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 0,
    fontFamily: 'GothamBold',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#1c1414',
    marginBottom: 4,
    fontFamily: 'GothamMedium',
  },
  dateInline: {
    color: GOLD,
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'GothamBold',
  },
  location: {
    fontSize: 11,
    color: '#777',
    fontFamily: 'GothamRegular',
  },
  vowButton: {
    marginTop: 6,
    backgroundColor: GOLD,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  vowButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'GothamBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3333',
    marginBottom: 16,
    fontFamily: 'GothamRegular',
  },
  retryButton: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'GothamBold',
  },
});

