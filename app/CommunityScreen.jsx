// app/main/Community.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from './apiConfig';

const ORANGE = "#FF8C00";
const GOLD = "#E18731";
const FALLBACK_IMAGE = "https://m.media-amazon.com/images/I/816Etq5qEwL._AC_SL1500_.jpg";

export default function Community() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  const [isConnected, setIsConnected] = useState(true);

  // Toast State (Same as all other screens)
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  // Network Detection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) {
        showToast("No internet connection.", "error");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch with token + retry
  const fetchWithToken = async (url, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const token = await AsyncStorage.getItem("userToken");

        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, { headers });

        if (res.status === 401) {
          // Do not force navigation or prompt login from this screen.
          // Let the caller handle missing/unauthorized data gracefully.
          return null;
        }

        if (!res.ok) throw new Error("Network error");
        return await res.json();
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  };

  const fetchCommunities = useCallback(async () => {
    if (!isConnected) {
      setLoadingPopular(false);
      setLoadingAll(false);
      setLoadingMy(false);
      return;
    }

    setRefreshing(true);

    try {
      // Fetch All Communities
      setLoadingAll(true);
      setLoadingPopular(true);
      const allRes = await fetchWithToken(`${BASE_URL}/communities/user`);
      if (allRes?.success && Array.isArray(allRes.data)) {
        const formatted = allRes.data.map(c => ({
          id: c.id.toString(),
          name: c.name || "Unnamed Community",
          description: c.description || "No description",
          image: c.logo?.startsWith("http") ? c.logo : FALLBACK_IMAGE,
          memberCount: c.members || c.memberCount || 0,
        }));
        setAllCommunities(formatted);
        setPopularCommunities(formatted.slice(0, 10)); // Top 10 popular
      } else {
        setAllCommunities([]);
        setPopularCommunities([]);
      }
    } catch (err) {
      showToast("Failed to load communities.", "error");
      setAllCommunities([]);
      setPopularCommunities([]);
    } finally {
      setLoadingAll(false);
      setLoadingPopular(false);
    }

    // Fetch My Communities
    try {
      setLoadingMy(true);
      const myRes = await fetchWithToken(`${BASE_URL}/communities/joined`);
      if (myRes?.success && Array.isArray(myRes.data)) {
        const formatted = myRes.data.map(c => ({
          id: c.id.toString(),
          name: c.name || "Unnamed Community",
          description: c.description || "No description",
          image: c.logo?.startsWith("http") ? c.logo : FALLBACK_IMAGE,
          memberCount: c.members || c.memberCount || 0,
        }));
        setMyCommunities(formatted);
      } else {
        setMyCommunities([]);
      }
    } catch (err) {
      showToast("Failed to load your communities.", "error");
      setMyCommunities([]);
    } finally {
      setLoadingMy(false);
      setRefreshing(false);
    }
  }, [isConnected]);

  useFocusEffect(
    useCallback(() => {
      fetchCommunities();
    }, [fetchCommunities])
  );

  const onRefresh = () => fetchCommunities();

  const filteredMy = myCommunities.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredAll = allCommunities.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderCommunity = ({ item }) => (
    <TouchableOpacity
      style={styles.communityCard}
      onPress={() => router.push({ pathname: "/CommunityDetail", params: { communityId: item.id } })}
    >
      <Image source={{ uri: item.image }} style={styles.communityImage} resizeMode="cover" />
      <View style={styles.communityInfo}>
        <Text style={styles.communityName}>{item.name}</Text>
        <Text style={styles.communityDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.memberCount}>{item.memberCount.toLocaleString()} Members</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPopular = ({ item }) => (
    <TouchableOpacity
      style={styles.popularItem}
      onPress={() => router.push({ pathname: "/CommunityDetail", params: { communityId: item.id } })}
    >
      <Image source={{ uri: item.image }} style={styles.popularImage} resizeMode="cover" />
      <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const currentData = activeTab === 'my' ? filteredMy : filteredAll;
  const isLoading = (activeTab === 'my' && loadingMy) || (activeTab === 'all' && loadingAll);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Toast */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
            <Ionicons
              name={toast.type === "success" ? "checkmark-circle" : "close-circle"}
              size={22}
              color="#fff"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main/more')}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Communities</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={renderCommunity}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ORANGE]} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Popular Communities */}
            <Text style={styles.sectionTitle}>Popular Communities</Text>
            {loadingPopular ? (
              <View style={styles.skeletonRow}>
                {[1, 2, 3, 4].map(i => (
                  <View key={i} style={styles.skeletonPopular} />
                ))}
              </View>
            ) : popularCommunities.length > 0 ? (
              <FlatList
                horizontal
                data={popularCommunities}
                keyExtractor={item => item.id}
                renderItem={renderPopular}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularList}
              />
            ) : (
              <Text style={styles.emptyText}>No popular communities found.</Text>
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => setActiveTab('my')}>
                <Text style={[styles.tab, activeTab === 'my' && styles.activeTab]}>My Communities</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('all')}>
                <Text style={[styles.tab, activeTab === 'all' && styles.activeTab]}>All Communities</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={ORANGE} />
              <Text style={styles.loadingText}>Loading communities...</Text>
            </View>
          ) : searchText.length > 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Results</Text>
              <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {activeTab === 'my' ? "No Joined Communities" : "No Communities Available"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'my'
                  ? "You haven't joined any community yet."
                  : "There are no communities to show right now."}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

// CONSISTENT STYLES - Matches Login & ChangeCommunityScreen
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  topBar: {
    height: Platform.OS === 'android' ? 90 : 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 0 : -1,
    // backgroundColor: "#fff",
    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#000", fontFamily: "GothamBold" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 14,
    // borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, fontFamily: "GothamMedium" },

  listContent: { paddingHorizontal: 12, paddingBottom: 32 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginHorizontal: 12,
    marginTop: 20,
    marginBottom: 12,
    fontFamily: "GothamBold",
  },

  popularList: { paddingLeft: 12 },
  popularItem: { alignItems: "center", marginRight: 16, width: 80 },
  popularImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  popularName: { marginTop: 8, fontSize: 13, textAlign: "center", fontFamily: "GothamMedium" },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    paddingBottom: 8,
    // borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tab: { fontSize: 16, paddingHorizontal: 24, paddingBottom: 8, fontFamily: "GothamMedium" },
  activeTab: { color: ORANGE, fontFamily: "GothamBold", borderBottomWidth: 2, borderColor: ORANGE },

  communityCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communityImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  communityInfo: { flex: 1, marginLeft: 14, justifyContent: "center" },
  communityName: { fontSize: 16, fontWeight: "600", color: "#000", fontFamily: "GothamBold" },
  communityDesc: { fontSize: 13, color: "#666", marginTop: 4, fontFamily: "GothamMedium" },
  memberCount: { fontSize: 13, color: ORANGE, marginTop: 6, fontFamily: "GothamMedium" },

  // States
  loadingContainer: { alignItems: "center", paddingVertical: 80 },
  loadingText: { marginTop: 16, color: "#666", fontSize: 15, fontFamily: "GothamMedium" },

  emptyContainer: { alignItems: "center", paddingVertical: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#333", marginTop: 20, fontFamily: "GothamBold" },
  emptySubtitle: { fontSize: 15, color: "#888", textAlign: "center", marginTop: 10, lineHeight: 22, fontFamily: "GothamMedium" },

  skeletonRow: { flexDirection: "row", paddingLeft: 12, paddingVertical: 10 },
  skeletonPopular: {
    width: 80,
    height: 100,
    backgroundColor: "#eee",
    borderRadius: 12,
    marginRight: 16,
  },

  // Toast (Same as all screens)
  toastContainer: { position: "absolute", top: 60, left: 20, right: 20, zIndex: 9999, alignItems: "center" },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  toastSuccess: { backgroundColor: "#4CAF50" },
  toastError: { backgroundColor: "#FF3B30" },
  toastText: { color: "#fff", fontSize: 15, fontWeight: "600", fontFamily: "GothamBold" },
});