import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GOLD = '#E18731';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const scripturesData = [
  {
    id: '1',
    verse:
      'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    reference: 'Jeremiah 29:11',
    likes: 124,
    shares: 38,
    imageUrl: FALLBACK_IMAGE,
  },
  {
    id: '2',
    verse:
      'Trust in the Lord with all your heart and lean not on your own understanding.',
    reference: 'Proverbs 3:5',
    likes: 89,
    shares: 22,
    imageUrl: FALLBACK_IMAGE,
  },
  {
    id: '3',
    verse: 'I can do all things through Christ who strengthens me.',
    reference: 'Philippians 4:13',
    likes: 201,
    shares: 67,
    imageUrl: FALLBACK_IMAGE,
  },
  {
    id: '4',
    verse: 'The Lord is my shepherd; I shall not want.',
    reference: 'Psalm 23:1',
    likes: 156,
    shares: 41,
    imageUrl: FALLBACK_IMAGE,
  },
];

export default function ScripturesScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | liked | shared

  const cardAnims = useRef(
    scripturesData.map(() => ({
      fade: new Animated.Value(0),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Shimmer animation loop
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  // Animate cards after loading
  useEffect(() => {
    if (!isLoading) {
      const animations = cardAnims.map((anim, index) =>
        Animated.stagger(100, [
          Animated.delay(index * 100),
          Animated.parallel([
            Animated.timing(anim.fade, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(anim.scale, {
              toValue: 1,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      Animated.parallel(animations).start();
    }
  }, [isLoading]);

  // Filter logic
  const filteredData = scripturesData
    .filter(
      (item) =>
        item.verse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((item) => {
      if (filter === 'liked') return item.likes > 100;
      if (filter === 'shared') return item.shares > 30;
      return true;
    });

  // Skeleton loader
  const renderSkeleton = (index) => (
    <View key={`skeleton-${index}`} style={styles.scriptureContainer}>
      <View style={styles.smallImageContainer}>
        <Animated.View
          style={[
            styles.skeleton,
            {
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.7, 0.3],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.wordCard}>
        <Animated.View
          style={[
            styles.skeleton,
            {
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.7, 0.3],
              }),
            },
          ]}
        />
      </View>
    </View>
  );

  // Render each scripture card
  const renderCard = ({ item, index }) => {
    const anim = cardAnims[index];
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.scriptureContainer,
          { opacity: anim.fade, transform: [{ scale: anim.scale }] },
        ]}
      >
        {/* Left vertical image */}
        <View style={styles.smallImageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.smallImage} />
          <View style={styles.smallImageOverlay}>
            <Text style={styles.smallVerseText}>{item.reference.toUpperCase()}</Text>
          </View>
        </View>

        {/* Right horizontal card */}
        <View style={styles.wordCard}>
          <Image source={{ uri: item.imageUrl }} style={styles.wordImage} />
          <View style={styles.wordOverlay} />
          <View style={styles.wordContent}>
            <Text style={styles.verseText}>{item.verse}</Text>
            <Text style={styles.verseReference}>— {item.reference}</Text>

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
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* === HEADER === */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Scriptures</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* === SEARCH BAR === */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scriptures..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* === FILTER BUTTONS === */}
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

      {/* === CONTENT === */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          Array(2)
            .fill()
            .map((_, i) => renderSkeleton(i))
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* === FLOATING BUTTON === */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/addScripture')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#EEE',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'GothamBold',
  },
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  scriptureContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  smallImageContainer: {
    width: 60,
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  smallImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallVerseText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }, { rotate: '-90deg' }],
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    width: 230,
    height: 50,
    includeFontPadding: false,
    textTransform: 'uppercase',
    fontFamily: 'GothamBold',
  },
  wordCard: {
    flex: 1,
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  wordImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  wordOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  wordContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  verseText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'GothamMedium',
  },
  verseReference: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'GothamBold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'GothamMedium',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  skeleton: {
    flex: 1,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
  },
});
