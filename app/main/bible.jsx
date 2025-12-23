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

