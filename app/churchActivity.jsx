// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
//   Dimensions,
//   Share,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const ORANGE = '#FF6B00';
// const FALLBACK_IMAGE =
//   'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
// const IMAGE_HORIZONTAL_PADDING = 16;

// // Hard-coded Church Activity
// const CHURCH_ACTIVITY = {
//   title: 'Sunday Worship & Fellowship',
//   description:
//     'Join us for a powerful time of worship, prayer, and the Word of God. This Sunday, we continue our series on *Walking in Faith*. Bring your family and friends!\n\n' +
//     '• Praise & Worship\n' +
//     '• Children’s Church (Ages 4–12)\n' +
//     '• Holy Communion\n' +
//     '• Fellowship Tea after service',
//   image:
//     'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
// };

// export default function ChurchActivityScreen() {
//   const router = useRouter();
//   const [isLiked, setIsLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(124);

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
//   };

//   const handleShare = async () => {
//     try {
//       await Share.share({
//         message: `${CHURCH_ACTIVITY.title}\n\n${CHURCH_ACTIVITY.description}`,
//         title: CHURCH_ACTIVITY.title,
//       });
//     } catch (error) {
//       // Silent
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* Top Bar */}
//       <View style={styles.topBar}>
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Ionicons name="chevron-back" size={24} color="#000" />
//         </TouchableOpacity>

//         <Text style={styles.mainTitle} numberOfLines={1}>
//           {CHURCH_ACTIVITY.title}
//         </Text>

//         <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
//           <Ionicons name="arrow-up" size={20} color="#000" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* Hero Image */}
//         <View style={styles.imageContainer}>
//           <Image
//             source={{ uri: CHURCH_ACTIVITY.image }}
//             defaultSource={{ uri: FALLBACK_IMAGE }}
//             style={styles.heroImage}
//             resizeMode="cover"
//           />
//           <View style={styles.imageOverlay} />
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity style={styles.startButton}>
//             <Text style={styles.startButtonText}>Set reminder</Text>
//           </TouchableOpacity>

//           <View style={styles.actionButtons}>
//             <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
//               <Ionicons
//                 name={isLiked ? 'heart' : 'heart-outline'}
//                 size={20}
//                 color={isLiked ? 'red' : ORANGE}
//               />
//               <Text style={[styles.actionText, { color: isLiked ? 'red' : ORANGE }]}>
//                 {likeCount}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
//               <Ionicons name="share-social-outline" size={20} color={ORANGE} />
//               <Text style={styles.actionText}>367</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Description */}
//         <Text style={styles.description}>{CHURCH_ACTIVITY.description}</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // Exact original styles – only improved spacing & visibility
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   topBar: {
//     height: 56,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     borderBottomColor: '#eee',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 4,
//   },
//   mainTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111',
//     marginHorizontal: 12,
//     fontFamily: 'GothamBold',
//   },
//   shareButton: {
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   scrollContent: {
//     paddingBottom: 100,
//   },
//   imageContainer: {
//     position: 'relative',
//     width: SCREEN_WIDTH - 2 * IMAGE_HORIZONTAL_PADDING,
//     height: 240,
//     marginHorizontal: IMAGE_HORIZONTAL_PADDING,
//     marginTop: 16,
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//   },
//   heroImage: {
//     width: '100%',
//     height: '100%',
//   },
//   imageOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     borderRadius: 16,
//   },
//   buttonContainer: {
//     paddingHorizontal: 16,
//     marginBottom: 24,
//   },
//   startButton: {
//     backgroundColor: '#000',
//     paddingVertical: 16,
//     borderRadius: 28,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   startButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//     fontFamily: 'GothamBold',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f5f5f5',
//     paddingVertical: 14,
//     borderRadius: 20,
//     marginHorizontal: 6,
//   },
//   actionText: {
//     fontSize: 14,
//     marginLeft: 8,
//     fontWeight: '600',
//     fontFamily: 'GothamBold',
//   },
//   description: {
//     fontSize: 15,
//     color: '#333',
//     lineHeight: 23,
//     paddingHorizontal: 16,
//     fontFamily: 'GothamMedium',
//   },
// });




import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Share,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './apiConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORANGE = '#FF6B00';
const GOLD = '#E18731';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
const IMAGE_HORIZONTAL_PADDING = 16;

// Enhanced fetch with retry
const fetchWithToken = async (url, options = {}, retries = 2) => {
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
        throw new Error('Token expired');
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'API error');
    return data;
  } catch (error) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return fetchWithToken(url, options, retries - 1);
    }
    throw error;
  }
};

export default function ChurchActivityScreen() {
  const router = useRouter();
  const scrollRef = useRef(null);

  // State
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [shares, setShares] = useState(0);

  // Load community ID
  useEffect(() => {
    const loadCommunity = async () => {
      try {
        const id = await AsyncStorage.getItem('selectedCommunityId');
        setSelectedCommunityId(id);
      } catch (error) {}
    };
    loadCommunity();
  }, []);

  // Cache key
  const getCacheKey = () => `church_update_${selectedCommunityId}`;

  // Load cached
  const loadCached = async () => {
    if (!selectedCommunityId) return false;
    try {
      const cached = await AsyncStorage.getItem(getCacheKey());
      if (cached) {
        const parsed = JSON.parse(cached);
        setUpdate(parsed);
        setLikes(parsed.likes || 0);
        setLiked(parsed.liked || false);
        setShares(parsed.shares || 0);
        return true;
      }
    } catch (error) {}
    return false;
  };

  // Cache data
  const cacheData = async (data) => {
    try {
      await AsyncStorage.setItem(getCacheKey(), JSON.stringify(data));
    } catch (error) {}
  };

  // Fetch update
  const fetchUpdate = async (force = false) => {
    if (!selectedCommunityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    if (!force) {
      const cached = await loadCached();
      if (cached) {
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetchWithToken(`${BASE_URL}/updates/community/${selectedCommunityId}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const item = res.data[0];
        const formatted = {
          id: item.id,
          title: item.title || 'Church Update',
          content: item.content || 'No details available.',
          imageUrl: FALLBACK_IMAGE,
          likes: item.likes || 0,
          liked: item.liked || false,
          shares: item.shares || 0,
        };
        setUpdate(formatted);
        setLikes(formatted.likes);
        setLiked(formatted.liked);
        setShares(formatted.shares);
        await cacheData(formatted);
      } else {
        setUpdate(null);
      }
    } catch (error) {
      setUpdate(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (selectedCommunityId) fetchUpdate();
  }, [selectedCommunityId]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await AsyncStorage.removeItem(getCacheKey());
    await fetchUpdate(true);
    setRefreshing(false);
  }, [selectedCommunityId]);

  // Handle Like
  const handleLike = async () => {
    if (!update?.id) return;

    const wasLiked = liked;
    const prevLikes = likes;

    setLiked(!wasLiked);
    setLikes(wasLiked ? prevLikes - 1 : prevLikes + 1);

    try {
      await fetchWithToken(`${BASE_URL}/likes/update/${update.id}`, { method: 'POST' });
    } catch (error) {
      setLiked(wasLiked);
      setLikes(prevLikes);
    }
  };

  // Handle Share
  const handleShare = async () => {
    if (!update) return;

    try {
      await Share.share({
        message: `${update.title}\n\n${update.content}`,
        title: update.title,
      });

      setShares((prev) => prev + 1);
      await fetchWithToken(`${BASE_URL}/shares/update/${update.id}`, { method: 'POST' });
    } catch (error) {}
  };

  // Show loading briefly (no skeleton)
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Church Updates</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No updates → centered message
  if (!update) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Church Updates</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No updates</Text>
            <Text style={styles.emptySubtitle}>Check back later for announcements.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.mainTitle} numberOfLines={1}>
          {update.title}
        </Text>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="arrow-up" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />
        }
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: update.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.imageOverlay} />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Set reminder</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? 'red' : ORANGE}
              />
              <Text style={[styles.actionText, { color: liked ? 'red' : ORANGE }]}>
                {likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={ORANGE} />
              <Text style={styles.actionText}>{shares}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{update.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  mainTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginHorizontal: 12,
    fontFamily: 'GothamBold',
  },
  shareButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 100 : 80,
  },
  imageContainer: {
    position: 'relative',
    width: SCREEN_WIDTH - 2 * IMAGE_HORIZONTAL_PADDING,
    height: 240,
    marginHorizontal: IMAGE_HORIZONTAL_PADDING,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'GothamBold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
  actionText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
    fontFamily: 'GothamBold',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
    paddingHorizontal: 16,
    fontFamily: 'GothamMedium',
  },
  // Empty state
  emptyScroll: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: SCREEN_WIDTH,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    fontFamily: 'GothamBold',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'GothamRegular',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'GothamMedium',
  },
});