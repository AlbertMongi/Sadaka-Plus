
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Fetch with token
  const fetchWithToken = async (url, options = {}) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token');

      const headers = { Authorization: `Bearer ${token}` };
      if (options.body) headers['Content-Type'] = 'application/json';

      const res = await fetch(url, { ...options, headers });
      return await res.json();
    } catch (e) {
      console.error('Fetch error:', e);
      return null;
    }
  };

  // Load sermon + initial like data
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadSermon = async () => {
      const data = await fetchWithToken(`${BASE_URL}/sermons/${id}`);

      if (data?.success && data.data) {
        const { name, description, photo, likes, liked } = data.data;

        setPlan({
          title: name ?? 'Untitled Sermon',
          description: description ?? '',
          // image: photo || FALLBACK_IMAGE,
              image: 
              FALLBACK_IMAGE,
        });

        // Set from API
        setIsLiked(!!liked);
        setLikeCount(Number(likes) || 0);
      } else {
        setPlan(null);
      }
      setLoading(false);
    };

    loadSermon();
  }, [id]);

  // Handle Like / Unlike – **IMMEDIATE UI UPDATE**
  const handleLike = async () => {
    if (!plan) return;

    const wasLiked = isLiked;
    const prevCount = likeCount;

    // **IMMEDIATE UI UPDATE**
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetchWithToken(`${BASE_URL}/likes/sermon/${id}`, {
        method: 'POST',
        body: JSON.stringify({ sermon_id: id }),
      });

      // If API fails → rollback
      if (!res?.success) {
        setIsLiked(wasLiked);
        setLikeCount(prevCount);
        return;
      }

      // Use server values if provided
      const serverLiked = res.data?.liked !== undefined ? !!res.data.liked : wasLiked;
      const serverCount = res.data?.count !== undefined ? Number(res.data.count) || 0 : prevCount;

      setIsLiked(serverLiked);
      setLikeCount(serverCount);
    } catch {
      // Network error → rollback
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
    }
  };

  // Share
  const handleShare = async () => {
    if (!plan) return;
    try {
      await Share.share({
        message: `${plan.title}\n\n${plan.description}`,
        title: plan.title,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  // Not found
  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Sermon not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main UI
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
<TouchableOpacity
  style={styles.backButton}
  onPress={() => router.push('/main/bible')}
>
  <Ionicons name="chevron-back" size={24} color="#000" />
</TouchableOpacity>


        <Text style={styles.mainTitle} numberOfLines={1}>
          {plan.title}
        </Text>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="arrow-up" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: plan.image }} style={styles.heroImage} resizeMode="cover" />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Save for later</Text>
          </TouchableOpacity> */}

          <View style={styles.actionButtons}>
            {/* LIKE BUTTON – IMMEDIATE UPDATE */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? GOLD : ORANGE}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: isLiked ? GOLD : ORANGE },
                ]}
              >
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

        {/* Description */}
        <Text style={styles.description}>{plan.description}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red', fontFamily: 'GothamMedium' },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
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
  startButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'GothamBold' },
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
});