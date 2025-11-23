import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const GOLD = '#FFA500';
const FALLBACK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';

const CommunityProfileScreen = () => {
  const navigation = useNavigation();
  const [churchUpdate, setChurchUpdate] = useState(true);
  const [liveStream, setLiveStream] = useState(true);

  const [communityInfo, setCommunityInfo] = useState({
    name: 'Kijiji Community',
    location: 'Dar es Salaam, Tanzania',
    contact: '255 754 710 700',
    email: 'kijiji@community.org',
    profileImage: FALLBACK_IMAGE,
  });

  useEffect(() => {
    const fetchCommunityInfo = async () => {
      try {
        const name = (await AsyncStorage.getItem('CommunityName')) || 'My Community';
        const location = (await AsyncStorage.getItem('CommunityLocation')) || 'Unknown';
        const contact = (await AsyncStorage.getItem('CommunityContact')) || '';
        const email = (await AsyncStorage.getItem('CommunityEmail')) || 'community@gmail.com';
        const image = (await AsyncStorage.getItem('CommunityImage')) || FALLBACK_IMAGE;

        setCommunityInfo({ name, location, contact, email, profileImage: image });
      } catch (error) {
        console.error('Failed to fetch community info:', error);
      }
    };

    fetchCommunityInfo();
  }, []);

  // 📸 Pick community image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'We need access to your gallery to let you choose a community image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;

      setCommunityInfo((prev) => ({
        ...prev,
        profileImage: selectedImage,
      }));

      await AsyncStorage.setItem('CommunityImage', selectedImage);
    }
  };

  // 🧾 Logout logic
  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: 'login' }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Community Profile</Text>

          {/* Placeholder for symmetry */}
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <View>
            <Image
              source={{ uri: communityInfo.profileImage }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Ionicons name="pencil" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.nameText}>{communityInfo.name}</Text>
          <Text style={styles.contactText}>{communityInfo.location}</Text>
          <Text style={styles.contactText}>
            {communityInfo.email} | {communityInfo.contact}
          </Text>
        </View>

        {/* Community Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Community Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditCommunityProfile')}
          >
            <Text style={styles.settingText}>Edit Community Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('MembersList')}
          >
            <Text style={styles.settingText}>View Members</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('UpcomingEvents')}
          >
            <Text style={styles.settingText}>Upcoming Events</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          {/* Toggles */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Receive Updates</Text>
            <Switch
              trackColor={{ false: '#ccc', true: GOLD }}
              thumbColor="#fff"
              onValueChange={() => setChurchUpdate(!churchUpdate)}
              value={churchUpdate}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Enable Live Stream Alerts</Text>
            <Switch
              trackColor={{ false: '#ccc', true: GOLD }}
              thumbColor="#fff"
              onValueChange={() => setLiveStream(!liveStream)}
              value={liveStream}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'GothamBold',
    color: '#000',
  },

  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  nameText: {
    fontSize: 18,
    fontFamily: 'GothamBold',
    color: '#000',
    marginTop: 12,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'GothamMedium',
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },

  settingsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'GothamMedium',
    color: '#999',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#111',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'GothamBold',
    color: '#fff',
  },
});

export default CommunityProfileScreen;
