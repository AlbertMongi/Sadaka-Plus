import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
  SafeAreaView,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { BASE_URL } from './apiConfig';

const GOLD = '#FFA500';
const FALLBACK_IMAGE = 'https://m.media-amazon.com/images/I/816Etq5qEwL._AC_SL1500_.jpg';
const { width } = Dimensions.get('window');

const SkeletonLoader = ({ style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f5f5f5'],
  });

  return <Animated.View style={[style, { backgroundColor }]} />;
};

const PopularCommunitiesSkeleton = () => (
  <FlatList
    data={[1, 2, 3, 4]}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={[styles.popularList, { backgroundColor: '#fff' }]}
    keyExtractor={(item, index) => index.toString()}
    renderItem={() => (
      <View style={styles.popularItem}>
        <SkeletonLoader style={styles.circularImage} />
        <SkeletonLoader style={{ width: 80, height: 12, marginTop: 6, borderRadius: 4 }} />
      </View>
    )}
  />
);

const CommunitiesSkeleton = () => (
  <View style={{ paddingHorizontal: 14, paddingTop: 8, marginTop: 18, backgroundColor: '#fff' }}>
    {[1, 2, 3].map((_, index) => (
      <View key={index} style={[styles.communityItem, { backgroundColor: '#fff' }]}>
        <SkeletonLoader style={styles.communityImage} />
        <View style={styles.communityDetails}>
          <SkeletonLoader style={{ width: '80%', height: 14, marginBottom: 6, borderRadius: 4 }} />
          <SkeletonLoader style={{ width: '60%', height: 12, marginBottom: 4, borderRadius: 4 }} />
          <SkeletonLoader style={{ width: '40%', height: 12, borderRadius: 4 }} />
        </View>
      </View>
    ))}
  </View>
);

export default function Community() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Animation states
  const popularAnims = useRef([]);
  const communityAnims = useRef([]);

  const getHost = () => BASE_URL;

  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          if (response.status === 401) {
            setError('Session expired. Please login again.');
            router.replace('/login');
            return null;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error(`Fetch attempt ${i + 1} failed:`, err);
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
        } else {
          setError('Please log in to view communities.');
          router.replace('/login');
        }
      } catch (e) {
        setError('Failed to initialize session. Please try again.');
        console.error('Token load error:', e);
      }
    };
    loadToken();
  }, [router]);

  const fetchCommunities = useCallback(async () => {
    if (!token) return;

    setRefreshing(true);
    setError(null);

    // Clear caches to ensure fresh data
    await AsyncStorage.removeItem('all_communities');
    await AsyncStorage.removeItem('my_communities');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Fetch all communities
    setLoadingAll(true);
    setLoadingPopular(true);
    try {
      const allResult = await fetchWithRetry(`${getHost()}/communities/user`, { headers });
      if (!allResult) return;
      const allData = Array.isArray(allResult.data) ? allResult.data : [];
      await AsyncStorage.setItem('all_communities', JSON.stringify(allData)); // Cache new data

      const formattedAll = allData.map((c) => ({
        id: c.id.toString(),
        name: c.name || 'Unnamed Community',
        description: c.description || 'No description available',
        image: c.logo || FALLBACK_IMAGE,
        memberCount: c.members !== undefined ? c.members : c.memberCount || 0,
      }));

      setAllCommunities(formattedAll);
      setPopularCommunities(formattedAll);

      popularAnims.current = formattedAll.map(() => ({
        fade: new Animated.Value(0),
        slide: new Animated.Value(30),
      }));
      if (activeTab === 'all') {
        communityAnims.current = formattedAll.map(() => ({
          fade: new Animated.Value(0),
          slide: new Animated.Value(30),
        }));
      }
    } catch (err) {
      console.error('Error fetching all communities:', err);
      setError('Failed to load communities. Check your internet connection and try again.');
      setAllCommunities([]);
      setPopularCommunities([]);
      popularAnims.current = [];
    } finally {
      setLoadingAll(false);
      setLoadingPopular(false);
    }

    // Fetch joined communities
    setLoadingMy(true);
    try {
      const myResult = await fetchWithRetry(`${getHost()}/communities/joined`, { headers });
      if (!myResult) return;
      const myData = Array.isArray(myResult.data) ? myResult.data : [];
      await AsyncStorage.setItem('my_communities', JSON.stringify(myData)); // Cache new data

      const formattedMy = myData.map((c) => ({
        id: c.id.toString(),
        name: c.name || 'Unnamed Community',
        description: c.description || 'No description available',
        image: c.logo || FALLBACK_IMAGE,
        memberCount: c.members !== undefined ? c.members : c.memberCount || 0,
      }));

      setMyCommunities(formattedMy);
      if (activeTab === 'my') {
        communityAnims.current = formattedMy.map(() => ({
          fade: new Animated.Value(0),
          slide: new Animated.Value(30),
        }));
      }
    } catch (err) {
      console.error('Error fetching joined communities:', err);
      setError('Failed to load your communities. Check your internet connection and try again.');
      setMyCommunities([]);
      communityAnims.current = [];
    } finally {
      setLoadingMy(false);
      setRefreshing(false);
    }

    animateSections();
  }, [token, activeTab, router]);

  // Trigger fetchCommunities on screen focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchCommunities();
      }
    }, [token, fetchCommunities])
  );

  const animateSections = () => {
    const animations = [];

    popularAnims.current.forEach((anim, index) => {
      animations.push(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.parallel([
            Animated.timing(anim.fade, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim.slide, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    communityAnims.current.forEach((anim, index) => {
      animations.push(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.parallel([
            Animated.timing(anim.fade, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim.slide, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    Animated.parallel(animations).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  const retryFetch = () => {
    setError(null);
    fetchCommunities();
  };

  const filteredMy = myCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredAll = allCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    communityAnims.current = (tab === 'my' ? filteredMy : filteredAll).map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }));
    animateSections();
  };

  const renderCommunityItem = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: communityAnims.current[index]?.fade || 1,
        transform: [{ translateY: communityAnims.current[index]?.slide || 0 }],
      }}
    >
      <TouchableOpacity
        style={styles.communityItem}
        activeOpacity={0.7}
        onPress={() =>
          router.push({ pathname: '/CommunityDetail', params: { communityId: item.id } })
        }
      >
        <Image
          source={{ uri: item.image }}
          style={styles.communityImage}
          resizeMode="cover"
          defaultSource={{ uri: FALLBACK_IMAGE }}
        />
        <View style={styles.communityDetails}>
          <Text style={styles.communityTitle}>{item.name}</Text>
          <Text
            style={styles.communityDescription}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
          <Text style={styles.memberCount}>
            {item.memberCount} {item.memberCount === 1 ? 'Member' : 'Members'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!token && !error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={[styles.container, styles.center, { backgroundColor: '#fff' }]}>
          <CommunitiesSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.container, { backgroundColor: '#fff' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#fff' }]}>
         <TouchableOpacity
                   style={styles.backButton}
                   onPress={() => router.push('/main/more')}
                 >
                   <Ionicons name="chevron-back" size={24} color="#000" />
                 </TouchableOpacity>
          <Text style={styles.headerTitle}>Communities</Text>
          <TouchableOpacity onPress={() => router.push('/notification')}>
            {/* <Ionicons name="notifications-outline" size={24} color="#000" /> */}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: '#FAFAFA' }]}>
          <Ionicons name="search-outline" size={16} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search communities..."
            placeholderTextColor="#888"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#888" style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={retryFetch} color={GOLD} />
          </View>
        )}

        <FlatList
          data={activeTab === 'my' ? filteredMy : filteredAll}
          keyExtractor={(item) => item.id}
          renderItem={renderCommunityItem}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8, backgroundColor: '#fff' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[GOLD]}
              tintColor={GOLD}
            />
          }
          ListEmptyComponent={
            (loadingAll && activeTab === 'all') || (loadingMy && activeTab === 'my') ? (
              <CommunitiesSkeleton />
            ) : searchText.length > 0 ? (
              <Text style={styles.noCommunitiesText}>No searched community</Text>
            ) : (
              <Text style={styles.noCommunitiesText}>
                {activeTab === 'my'
                  ? 'You have not joined any communities.'
                  : 'No communities found.'}
              </Text>
            )
          }
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>Popular Communities</Text>
              {loadingPopular ? (
                <PopularCommunitiesSkeleton />
              ) : popularCommunities.length > 0 ? (
                <FlatList
                  data={popularCommunities}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.popularList, { backgroundColor: '#fff' }]}
                  renderItem={({ item, index }) => (
                    <Animated.View
                      style={{
                        opacity: popularAnims.current[index]?.fade || 1,
                        transform: [{ translateY: popularAnims.current[index]?.slide || 0 }],
                      }}
                    >
                      <TouchableOpacity
                        style={styles.popularItem}
                        activeOpacity={0.7}
                        onPress={() =>
                          router.push({ pathname: '/CommunityDetail', params: { communityId: item.id } })
                        }
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={styles.circularImage}
                          resizeMode="cover"
                          defaultSource={{ uri: FALLBACK_IMAGE }}
                        />
                        <Text style={styles.popularText} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                />
              ) : (
                <Text style={styles.noCommunitiesText}>No popular communities found.</Text>
              )}

              {/* Tabs */}
              <View style={styles.tabs}>
                <TouchableOpacity onPress={() => handleTabPress('my')}>
                  <Text
                    style={[styles.tabText, activeTab === 'my' ? styles.activeTab : styles.inactiveTab]}
                  >
                    My Communities
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress('all')}>
                  <Text
                    style={[styles.tabText, activeTab === 'all' ? styles.activeTab : styles.inactiveTab]}
                  >
                    All Communities
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: { 
    fontSize: 18,
    color: '#000', 
    fontFamily: 'GothamBold' 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 14,
    height: 36,
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    height: 34,
    fontSize: 15,
    fontFamily: 'GothamRegular',
    color: '#000',
  },
  clearIcon: {
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
    fontFamily: 'GothamBold',
  },
  popularList: { 
    paddingBottom: 14,
    backgroundColor: '#fff',
  },
  popularItem: { 
    marginRight: 14, 
    alignItems: 'center', 
    padding: 6,
    width: 100,
  },
  circularImage: {
    width: 60,
    height: 60,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: GOLD,
  },
  popularText: { 
    fontSize: 12,
    textAlign: 'center', 
    color: '#000', 
    marginTop: 6,
    fontFamily: 'GothamMedium',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tabText: {
    fontSize: 14,
    marginHorizontal: 18,
    fontFamily: 'GothamMedium',
  },
  activeTab: {
    color: GOLD,
    borderBottomWidth: 2,
    borderColor: GOLD,
    paddingBottom: 5,
    fontFamily: 'GothamBold',
  },
  inactiveTab: {
    color: '#000',
    paddingBottom: 5,
    fontFamily: 'GothamMedium',
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    marginRight: 14,
    backgroundColor: '#fff',
  },
  communityImage: {
    width: 56,
    height: 56,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: GOLD,
    marginRight: 14,
  },
  communityDetails: { 
    flex: 1 
  },
  communityTitle: { 
    fontSize: 14,
    color: '#000', 
    fontFamily: 'GothamMedium' 
  },
  communityDescription: { 
    fontSize: 13,
    color: '#555', 
    marginTop: 3, 
    fontFamily: 'GothamRegular' 
  },
  memberCount: {
    fontSize: 12,
    color: GOLD,
    marginTop: 3,
    fontFamily: 'GothamRegular',
  },
  noCommunitiesText: { 
    textAlign: 'center', 
    color: '#888', 
    marginTop: 18,
    fontSize: 13,
    fontFamily: 'GothamRegular',
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: { 
    textAlign: 'center', 
    color: 'red', 
    marginBottom: 8,
    fontSize: 13,
    fontFamily: 'GothamRegular',
  },
});
