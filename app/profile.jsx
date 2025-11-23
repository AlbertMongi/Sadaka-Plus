// app/profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from './apiConfig';
import { fetchBase64Image } from './fetchBase64Image';

// SAFELY import NetworkStatusProvider — will NOT crash if missing
let useNetwork = () => ({ isConnected: true }); // Default: assume online
try {
  const imported = require('../../components/NetworkStatusProvider');
  if (imported && imported.useNetwork) {
    useNetwork = imported.useNetwork;
  }
} catch (err) {
  console.warn('NetworkStatusProvider not found. Using fallback (always online).');
}

const { height } = Dimensions.get('window');
const GOLD = '#E18731';
const FALLBACK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  // Safely get network status — NEVER undefined
  const networkData = useNetwork();
  const isConnected = networkData?.isConnected ?? true;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phoneNo: '',
    email: '',
    accountVerified: false,
    profileImage: FALLBACK_IMAGE,
    profile_photo_filename: null,
  });

  // Toast (same as LoginScreen)
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });
  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  // Offline Bottom Sheet
  const offlineSheetAnim = useRef(new Animated.Value(height)).current;
  const [showOfflineSheet, setShowOfflineSheet] = useState(false);

  const openOfflineSheet = () => {
    if (showOfflineSheet) return;
    setShowOfflineSheet(true);
    Animated.timing(offlineSheetAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeOfflineSheet = () => {
    Animated.timing(offlineSheetAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowOfflineSheet(false));
  };

  // Watch network changes — now 100% reliable
  useEffect(() => {
    if (!isConnected) {
      openOfflineSheet();
    } else {
      closeOfflineSheet();
    }
  }, [isConnected]);

  // Success Sheet (profile picture update)
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const sheetAnim = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setShowSuccessSheet(true);
    Animated.timing(sheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => {
      setShowSuccessSheet(false);
    });
  };

  // FETCH PROFILE
  const fetchProfile = async () => {
    if (!isConnected) {
      showToast("No internet connection", "error");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showToast("Session expired. Please log in again.", "error");
        navigation.replace('Login');
        return;
      }

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;

        setUser({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          phoneNo: d.phoneNo || '',
          email: d.email || '',
          accountVerified: !!d.accountVerified,
          profile_photo_filename: d.profile_photo || null,
          profileImage: FALLBACK_IMAGE,
        });

        if (d.profile_photo) {
          const imageUri = await fetchBase64Image(d.profile_photo);
          setUser(prev => ({ ...prev, profileImage: imageUri }));
          await AsyncStorage.setItem('ProfileImage', imageUri);
        }
      } else {
        throw new Error(json.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      showToast(err.message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // UPLOAD PROFILE PICTURE
  const uploadProfilePicture = async (localUri) => {
    if (!isConnected) {
      showToast("No internet connection", "error");
      return;
    }

    if (!localUri) {
      showToast("No image selected.", "error");
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showToast("Authentication missing. Please log in.", "error");
        return;
      }

      const formData = new FormData();
      const fileName = localUri.split('/').pop() || `profile_${Date.now()}.jpg`;
      const fileType = fileName.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
      const uri = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;

      formData.append('image', { uri, name: fileName, type: fileType });

      const response = await fetch(`${BASE_URL}/users/profile/picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const json = await response.json();

      if (json.success && json.data?.profile_photo) {
        const filename = json.data.profile_photo;
        const imageUri = await fetchBase64Image(filename);

        setUser(prev => ({
          ...prev,
          profileImage: imageUri,
          profile_photo_filename: filename,
        }));
        await AsyncStorage.setItem('ProfileImage', imageUri);
        setUploadedImageUrl(imageUri);
        showToast("Profile picture updated successfully!", "success");
        openSheet();
        setTimeout(closeSheet, 3000);
      } else {
        throw new Error(json.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast(err.message || "Failed to upload image", "error");
      const saved = await AsyncStorage.getItem('ProfileImage');
      if (saved) setUser(prev => ({ ...prev, profileImage: saved }));
    } finally {
      setUploading(false);
    }
  };

  // IMAGE PICKER
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast("Gallery access denied. Please enable in settings.", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setUser(prev => ({ ...prev, profileImage: uri }));
        await AsyncStorage.setItem('ProfileImage', uri);
        await uploadProfilePicture(uri);
      }
    } catch (err) {
      showToast("Failed to pick image", "error");
    }
  };

  // Load profile when connected
  useEffect(() => {
    fetchProfile();
  }, [isConnected]);

  // Load cached image
  useEffect(() => {
    (async () => {
      try {
        const img = await AsyncStorage.getItem('ProfileImage');
        if (img) {
          setUser(prev => ({ ...prev, profileImage: img }));
        }
      } catch (err) {
        console.warn('Failed to load cached image');
      }
    })();
  }, []);

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'User';

  const ContactInfo = () => {
    const hasPhone = !!user.phoneNo;
    const hasEmail = !!user.email;
    if (!hasPhone && !hasEmail) return null;

    return (
      <View style={styles.contactRow}>
        {hasPhone && (
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.contactText}>{user.phoneNo}</Text>
          </View>
        )}
        {hasEmail && (
          <View style={[styles.contactItem, hasPhone && styles.contactItemWithSeparator]}>
            <Ionicons name="mail-outline" size={14} color="#666" />
            <Text style={styles.contactText}>{user.email}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

      {/* OFFLINE BOTTOM SHEET — ALWAYS WORKS */}
      <Modal transparent visible={showOfflineSheet} onRequestClose={closeOfflineSheet}>
        <TouchableWithoutFeedback onPress={closeOfflineSheet}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.offlineSheet, { transform: [{ translateY: offlineSheetAnim }] }]}>
                <View style={styles.sheetHandle} />
                <Ionicons name="wifi-off" size={70} color="#999" />
                <Text style={styles.offlineTitle}>No Internet Connection</Text>
                <Text style={styles.offlineSubtitle}>
                  Your profile will load automatically when you're back online.
                </Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
                  <Text style={styles.retryText}>Retry Now</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatar}
                  defaultSource={{ uri: FALLBACK_IMAGE }}
                />
                <TouchableOpacity style={styles.editBtn} onPress={pickImage} disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator size={14} color="#fff" />
                  ) : (
                    <Ionicons name="pencil" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.name}>{fullName}</Text>
              <ContactInfo />
              {user.accountVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Verified Account</Text>
                </View>
              )}
            </View>

            <View style={styles.group}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="person-outline" size={22} color={GOLD} />
                </View>
                <Text style={styles.menuText}>Edit Profile Information</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePasswordScreen')}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="key-outline" size={22} color={GOLD} />
                </View>
                <Text style={styles.menuText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('NearbyCommunity')}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="location-outline" size={22} color={GOLD} />
                </View>
                <Text style={styles.menuText}>Nearby Communities</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangeCommunityScreen')}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="swap-horizontal-outline" size={22} color={GOLD} />
                </View>
                <Text style={styles.menuText}>Change Community</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('paymentMethod')}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="card-outline" size={22} color={GOLD} />
                </View>
                <Text style={styles.menuText}>Payment Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Success Sheet */}
      <Modal transparent visible={showSuccessSheet} onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Profile Picture Updated!</Text>
                {uploadedImageUrl && (
                  <View style={styles.updatedData}>
                    <Image source={{ uri: uploadedImageUrl }} style={styles.previewImage} resizeMode="cover" />
                  </View>
                )}
                <TouchableOpacity style={styles.doneBtn} onPress={closeSheet}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 20 : -25,
    paddingHorizontal: 4,
  },
  headerTitle: { fontSize: 20, fontFamily: 'GothamBold', color: '#222' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666', fontFamily: 'GothamMedium' },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 16,
  },
  imageWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: GOLD },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: GOLD,
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  name: { fontSize: 20, fontFamily: 'GothamBold', color: '#222', marginBottom: 6 },
  contactRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactItemWithSeparator: { paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: '#ddd' },
  contactText: { fontSize: 14, color: '#666', fontFamily: 'GothamMedium' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  verifiedText: { marginLeft: 4, color: '#4CAF50', fontSize: 13, fontFamily: 'GothamMedium' },
  group: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  iconWrapper: { width: 36, alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#222', fontFamily: 'GothamMedium' },

  // Toast
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
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

  // Offline Sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  offlineSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  offlineTitle: { fontSize: 20, fontFamily: 'GothamBold', color: '#222', marginTop: 16 },
  offlineSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 20 },
  retryBtn: { marginTop: 24, backgroundColor: GOLD, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30 },
  retryText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },

  // Success Sheet
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: height * 0.7,
  },
  updatedData: { marginBottom: 24, alignItems: 'center' },
  previewImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: GOLD, marginVertical: 16 },
  doneBtn: { backgroundColor: GOLD, paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  doneText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },
});

export default ProfileScreen;