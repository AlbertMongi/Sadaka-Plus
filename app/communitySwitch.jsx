import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOLD = '#FFA500';

export default function CommunitySwitch() {
  const router = useRouter();

  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const savedCommunities = await AsyncStorage.getItem('joinedCommunities');
        const savedSelectedCommunityId = await AsyncStorage.getItem('selectedCommunityId');

        if (savedCommunities) {
          setJoinedCommunities(JSON.parse(savedCommunities));
        }

        if (savedSelectedCommunityId) {
          setSelectedCommunityId(parseInt(savedSelectedCommunityId, 10));
        }
      } catch (e) {
        console.error('Error loading communities', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const onSelectCommunity = async (communityId) => {
    setSelectedCommunityId(communityId);
    await AsyncStorage.setItem('selectedCommunityId', communityId.toString());
    // Redirect to index1 page after selection
    router.replace('/index1');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  if (!joinedCommunities.length) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 16 }}>No communities found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Switch Community</Text>
      <FlatList
        data={joinedCommunities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedCommunityId;
          return (
            <TouchableOpacity
              style={[styles.communityItem, isSelected && styles.selectedCommunityItem]}
              onPress={() => onSelectCommunity(item.id)}
            >
              <Text style={[styles.communityText, isSelected && styles.selectedCommunityText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: GOLD,
  },
  communityItem: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 12,
  },
  selectedCommunityItem: {
    backgroundColor: GOLD,
  },
  communityText: {
    fontSize: 16,
    color: GOLD,
  },
  selectedCommunityText: {
    color: 'white',
    fontWeight: '700',
  },
});
