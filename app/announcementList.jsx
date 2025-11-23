/******************************************************************************************
 *  AnnouncementsScreen – Modern list of announcements posted by the user
 *  → Title, Description, Date, Time, Likes, Shares
 *  → FAB: /addAnnouncement
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GOLD = '#E18731';
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const announcementsData = [
  {
    id: '1',
    title: 'Special Prayer Meeting',
    description:
      'Join us this Friday for a powerful time of intercession and worship. All are welcome!',
    date: 'Nov 8, 2025',
    time: '7:00 PM',
    likes: 112,
    shares: 29,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '2',
    title: 'Church Picnic Cancelled',
    description:
      'Due to heavy rain forecast, the annual picnic has been postponed. New date will be announced soon.',
    date: 'Nov 9, 2025',
    time: 'All Day',
    likes: 45,
    shares: 67,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '3',
    title: 'New Bible Study Series',
    description:
      'Starting next week: "Walking in Faith" – a 6-week study on Hebrews. Sign up at the welcome desk!',
    date: 'Nov 11, 2025',
    time: '6:30 PM',
    likes: 189,
    shares: 54,
    imageUrl: FALLBACK_IMG,
  },
  {
    id: '4',
    title: 'Thanksgiving Food Drive',
    description:
      'Help us collect non-perishable items for families in need. Drop-off bins in the foyer until Nov 20.',
    date: 'Ongoing',
    time: 'All Day',
    likes: 203,
    shares: 78,
    imageUrl: FALLBACK_IMG,
  },
];

export default function AnnouncementsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const shimmer = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    announcementsData.reduce((acc, e) => ({ ...acc, [e.id]: new Animated.Value(1) }), {})
  ).current;

  /* -------------------------------------------------- loading -------------------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, [shimmer]);

  /* -------------------------------------------------- press animation -------------------------------------------------- */
  const pressIn = (id) =>
    Animated.spring(scaleAnims[id], { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = (id) =>
    Animated.spring(scaleAnims[id], { toValue: 1, useNativeDriver: true }).start();

  /* -------------------------------------------------- skeleton -------------------------------------------------- */
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
            { opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.8, 0.4] }) },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonDesc,
            { opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.8, 0.4] }) },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonMeta,
            { opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.8, 0.4] }) },
          ]}
        />
        <View style={styles.skeletonStats}>
          <Animated.View style={[styles.skeletonStat, { opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.8, 0.4] }) }]} />
          <Animated.View style={[styles.skeletonStat, { opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.8, 0.4] }) }]} />
        </View>
      </View>
    </View>
  );

  /* -------------------------------------------------- real card -------------------------------------------------- */
  const AnnouncementCard = ({ item }) => (
    <Animated.View
      key={item.id}
      style={[styles.card, { transform: [{ scale: scaleAnims[item.id] }] }]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPressIn={() => pressIn(item.id)}
        onPressOut={() => pressOut(item.id)}
      >
        {/* Hero Image */}
        <Image source={{ uri: item.imageUrl }} style={styles.heroImg} resizeMode="cover" />

        {/* Content */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={15} color={GOLD} />
              <Text style={styles.metaText}>{item.date}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={15} color={GOLD} />
              <Text style={styles.metaText}>{item.time}</Text>
            </View>
          </View>

          {/* Likes & Shares */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="heart" size={18} color="#FF6B6B" />
              {item.likes > 0 && <Text style={styles.statText}>{item.likes}</Text>}
            </View>
            <View style={styles.stat}>
              <Ionicons name="share-social" size={18} color="#4ECDC4" />
              {item.shares > 0 && <Text style={styles.statText}>{item.shares}</Text>}
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
        <Text style={styles.headerTitle}>My Announcements</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {isLoading
          ? Array(4)
              .fill()
              .map((_, i) => <SkeletonCard key={`sk-${i}`} idx={i} />)
          : announcementsData.map((ann) => <AnnouncementCard key={ann.id} item={ann} />)}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/addAnnouncement')}
        accessibilityLabel="Add new announcement"
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
    height: 56,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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

  metaContainer: {
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'GothamMedium',
    color: '#666',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  skeletonMeta: {
    height: 18,
    width: '60%',
    marginBottom: 8,
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