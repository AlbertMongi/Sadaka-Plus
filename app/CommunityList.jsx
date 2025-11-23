// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   SafeAreaView,
//   TouchableOpacity,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';

// const ORANGE = '#DD863C';

// const communitiesData = [
//   {
//     id: '1',
//     name: 'Man of Victory',
//     image: 'https://i.imgur.com/WvX12hX.png',
//     groups: [
//       { id: 'g1', name: 'Group 1', description: 'Group one description' },
//       { id: 'g2', name: 'Group 2', description: 'Group two description' },
//       { id: 'g3', name: 'Group 3', description: 'Group three description' },
//     ],
//   },
//   {
//     id: '2',
//     name: 'Cornerstone',
//     image: 'https://i.imgur.com/aPY4xXT.png',
//     groups: [
//       { id: 'g4', name: 'Group 1', description: 'Group one description' },
//       { id: 'g5', name: 'Group 2', description: 'Group two description' },
//       { id: 'g6', name: 'Group 3', description: 'Group three description' },
//     ],
//   },
//   {
//     id: '3',
//     name: 'Charismatic',
//     image: 'https://i.imgur.com/FKgciN1.png',
//     groups: [
//       { id: 'g7', name: 'Group 1', description: 'Group one description' },
//       { id: 'g8', name: 'Group 2', description: 'Group two description' },
//       { id: 'g9', name: 'Group 3', description: 'Group three description' },
//     ],
//   },
// ];

// export default function CommunitiesList() {
//   const router = useRouter();

//   const renderGroup = ({ item }) => (
//     <View style={styles.groupRow}>
//       <View style={styles.groupIcon}>
//         <Ionicons name="people-outline" size={20} color={ORANGE} />
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.groupName}>{item.name}</Text>
//         <Text style={styles.groupDescription}>{item.description}</Text>
//       </View>
//     </View>
//   );

//   const renderCommunity = ({ item }) => (
//     <View style={styles.communityContainer}>
//       <Image source={{ uri: item.image }} style={styles.communityImage} />
//       <Text style={styles.communityName}>{item.name}</Text>
//       <FlatList
//         data={item.groups}
//         keyExtractor={(group) => group.id}
//         renderItem={renderGroup}
//         scrollEnabled={false}
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color={ORANGE} />
//         </TouchableOpacity>
//         <Text style={styles.title}>Your Communities</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <FlatList
//         data={communitiesData}
//         keyExtractor={(item) => item.id}
//         renderItem={renderCommunity}
//         contentContainerStyle={{ paddingBottom: 40 }}
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: Platform.OS === 'android' ? 40 : 60,
//     paddingHorizontal: 20,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   backButton: {
//     padding: 4,
//   },
//   title: {
//     fontWeight: '700',
//     fontSize: 18,
//     color: '#222',
//     textAlign: 'center',
//     flex: 1,
//   },
//   communityContainer: {
//     marginBottom: 24,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     shadowColor: '#aaa',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#f2f2f2',
//   },
//   communityImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     alignSelf: 'center',
//     borderWidth: 2,
//     borderColor: ORANGE,
//     marginBottom: 10,
//   },
//   communityName: {
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//     color: '#222',
//     marginBottom: 10,
//   },
//   groupRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#f1f1f1',
//   },
//   groupIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     borderWidth: 1.3,
//     borderColor: ORANGE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     backgroundColor: '#fff',
//   },
//   groupName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   groupDescription: {
//     fontSize: 12,
//     color: '#777',
//   },
// });


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useMembership } from './MembershipContext'; // adjust path
import { useRouter } from 'expo-router';

const GOLD = '#FFA500';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=64&q=80';
const { width } = Dimensions.get('window');

export default function Community() {
  const router = useRouter();
  const { memberships, updateMembership } = useMembership();

  const [allCommunities, setAllCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const getHost = () => 'http://192.168.100.24:8000';

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${getHost()}/api/communities`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.data)) {
          setAllCommunities(json.data.map(c => ({
            id: c.id.toString(),
            name: c.name,
            description: c.description || 'No description available',
            image: c.logo ? `${getHost()}/${c.logo}` : FALLBACK_IMAGE,
          })));
        } else {
          Alert.alert('Error', 'Failed to load communities');
        }
      } catch (e) {
        Alert.alert('Error', 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoinLeave = async (communityId, isMember) => {
    const endpoint = isMember ? 'leave' : 'join';

    try {
      const res = await fetch(`${getHost()}/api/communities/${communityId}/${endpoint}`, {
        method: 'POST',
      });
      if (res.ok) {
        updateMembership(communityId, !isMember);
        Alert.alert('Success', isMember ? 'Left community' : 'Joined community');
      } else {
        Alert.alert('Error', `Failed to ${endpoint} community`);
      }
    } catch {
      Alert.alert('Error', `Failed to ${endpoint} community`);
    }
  };

  const renderItem = ({ item }) => {
    const isMember = memberships[item.id] ?? false;

    return (
      <View style={styles.communityItem}>
        <Image source={{ uri: item.image }} style={styles.communityImage} />
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.communityTitle}>{item.name}</Text>
          <Text style={styles.communityDescription}>{item.description}</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, isMember ? styles.leaveButton : styles.joinButton]}
          onPress={() => {
            if (isMember) {
              Alert.alert(
                'Confirm',
                'Are you sure you want to leave this community?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Leave', onPress: () => handleJoinLeave(item.id, isMember) },
                ]
              );
            } else {
              handleJoinLeave(item.id, isMember);
            }
          }}
        >
          <Text style={styles.actionText}>{isMember ? 'Leave' : 'Join'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  return (
    <FlatList
      data={allCommunities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  communityTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  communityDescription: {
    color: '#555',
    fontSize: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  joinButton: {
    backgroundColor: GOLD,
  },
  leaveButton: {
    backgroundColor: '#d9534f',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});
