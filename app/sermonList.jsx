/******************************************************************************************
 *  SermonsScreen – Modern list of sermons posted by the user
 *  → Title, Description, Likes, Shares
 *  → FAB: /addSermon
 *  → Includes Search + Filter
 ******************************************************************************************/
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const GOLD = '#E18731';
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const sermonsData = [
  {
    id: '1',
    title: 'The Power of Faith',
    description:
      'Explore how unwavering faith can move mountains and transform lives. A message of hope and courage.',
    likes: 124,
    shares: 38,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '2',
    title: 'Walking in Love',
    description:
      'Love is the foundation of our faith. Learn practical ways to love others as Christ loved us.',
    likes: 89,
    shares: 22,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '3',
    title: 'Overcoming Fear',
    description:
      'God has not given us a spirit of fear. Discover biblical tools to conquer anxiety and fear.',
    likes: 201,
    shares: 67,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '4',
    title: 'The Prodigal Son',
    description:
      'A timeless parable of grace, forgiveness, and the Father’s unconditional love.',
    likes: 156,
    shares: 41,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '5',
    title: 'Walking in Love',
    description:
      'Love is the foundation of our faith. Learn practical ways to love others as Christ loved us.',
    likes: 89,
    shares: 22,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '6',
    title: 'Overcoming Fear',
    description:
      'God has not given us a spirit of fear. Discover biblical tools to conquer anxiety and fear.',
    likes: 201,
    shares: 67,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '7',
    title: 'The Prodigal Son',
    description:
      'A timeless parable of grace, forgiveness, and the Father’s unconditional love.',
    likes: 156,
    shares: 41,
    imageUrl: FALLBACK_IMG,
  },
];

export default function SermonsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const shimmer = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    sermonsData.reduce((acc, e) => ({ ...acc, [e.id]: new Animated.Value(1) }), {})
  ).current;

  // Loading simulation
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // Shimmer animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, [shimmer]);

  const pressIn = (id) =>
    Animated.spring(scaleAnims[id], { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = (id) =>
    Animated.spring(scaleAnims[id], { toValue: 1, useNativeDriver: true }).start();

  // Filter + Search
  const filteredSermons = sermonsData
    .filter(
      (s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((s) => {
      if (filter === 'liked') return s.likes > 100;
      if (filter === 'shared') return s.shares > 30;
      return true;
    });

  /* -------------------------------------------------- Skeleton -------------------------------------------------- */
  const SkeletonCard = ({ idx }) => (
    <View key={`sk-${idx}`} style={styles.card}>
      <Animated.View
        style={[
          styles.skeletonImg,
          {
            opacity: shimmer.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.4, 0.8, 0.4],
            }),
          },
        ]}
      />
      <View style={styles.info}>
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonTitle,
            {
              opacity: shimmer.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.4, 0.8, 0.4],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonDesc,
            {
              opacity: shimmer.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.4, 0.8, 0.4],
              }),
            },
          ]}
        />
        <View style={styles.skeletonStats}>
          <Animated.View style={[styles.skeletonStat]} />
          <Animated.View style={[styles.skeletonStat]} />
        </View>
      </View>
    </View>
  );

  /* -------------------------------------------------- Real Card -------------------------------------------------- */
  const SermonCard = ({ item }) => (
    <Animated.View
      key={item.id}
      style={[styles.card, { transform: [{ scale: scaleAnims[item.id] }] }]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPressIn={() => pressIn(item.id)}
        onPressOut={() => pressOut(item.id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.heroImg} resizeMode="cover" />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="heart" size={18} color="#FF6B6B" />
              <Text style={styles.statText}>{item.likes}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="share-social" size={18} color="#4ECDC4" />
              <Text style={styles.statText}>{item.shares}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Sermons</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sermons..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {['all', 'liked', 'shared'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all'
                ? 'All'
                : f === 'liked'
                ? 'Most Liked'
                : 'Most Shared'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sermon List */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading
          ? Array(3)
              .fill()
              .map((_, i) => <SkeletonCard key={`sk-${i}`} idx={i} />)
          : filteredSermons.map((sermon) => <SermonCard key={sermon.id} item={sermon} />)}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/addSermon')}
        accessibilityLabel="Add new sermon"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* -------------------------------------------------- STYLES -------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 20,
    backgroundColor: '#fff',
    borderBottomColor: '#EEE',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'GothamBold',
    color: '#222',
  },

  /* Search */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
    fontFamily: 'GothamMedium',
  },

  /* Filter Row */
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  filterText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'GothamMedium',
  },
  filterTextActive: {
    color: '#fff',
    fontFamily: 'GothamBold',
  },

  /* Scroll */
  scroll: {
    padding: 16,
    paddingBottom: 100,
  },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroImg: {
    width: '100%',
    height: 180,
  },
  info: {
    padding: 18,
  },
  title: {
    fontSize: 19,
    fontFamily: 'GothamBold',
    color: '#222',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'GothamMedium',
    color: '#555',
    lineHeight: 20,
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 28,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'GothamMedium',
    color: '#333',
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  /* Skeleton */
  skeletonImg: {
    width: '100%',
    height: 180,
    backgroundColor: '#E1E9EE',
  },
  skeletonLine: {
    backgroundColor: '#E1E9EE',
    borderRadius: 6,
  },
  skeletonTitle: {
    height: 24,
    width: '80%',
    marginBottom: 12,
  },
  skeletonDesc: {
    height: 48,
    width: '95%',
    marginBottom: 14,
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 8,
  },
  skeletonStat: {
    width: 50,
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
});
