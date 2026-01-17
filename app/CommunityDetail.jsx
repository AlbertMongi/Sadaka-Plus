import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './apiConfig';
import { fetchBase64Image } from './fetchBase64Image';  // ← added

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORANGE = '#FF6B00';
const FALLBACK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';
const IMAGE_HORIZONTAL_PADDING = 16;

export default function CommunityDetail() {
  const { communityId } = useLocalSearchParams();
  const router = useRouter();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [sheetMessage, setSheetMessage] = useState('');

  // Bottom Sheet Animations (unchanged)
  const successSheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const confirmSheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const openSheet = (anim) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = (anim, setVisible) => {
    Animated.timing(anim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!communityId) return;
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace('/login');
          return;
        }
        const res = await fetch(`${BASE_URL}/communities/${communityId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          let displayImage = FALLBACK_IMAGE;

          // Process logo / image with fetchBase64Image
          const rawImage = json.data.logo || json.data.image || json.data.photo;
          if (rawImage) {
            try {
              const processed = await fetchBase64Image(rawImage);
              if (processed) {
                displayImage = processed;
              }
            } catch (imgErr) {
              console.warn('Community logo processing failed:', imgErr);
            }
          }

          setCommunity({
            ...json.data,
            isMember: json.data.joined,
            displayImage,  // ← processed image
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunity();
  }, [communityId]);

  const joinCommunity = async () => {
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCommunity(prev => ({ ...prev, isMember: true }));
        setSheetMessage('You are now following this community!');
        setShowSuccessSheet(true);
        openSheet(successSheetAnim);
        setTimeout(() => closeSheet(successSheetAnim, setShowSuccessSheet), 3000);
      }
    } catch (err) {
      // Silent
    } finally {
      setActionLoading(false);
    }
  };

  const leaveCommunity = async () => {
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/communities/${communityId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCommunity(prev => ({ ...prev, isMember: false }));
        setSheetMessage('You have unfollowed this community.');
        setShowSuccessSheet(true);
        openSheet(successSheetAnim);
        setTimeout(() => closeSheet(successSheetAnim, setShowSuccessSheet), 3000);
      }
    } catch (err) {
      // Silent
    } finally {
      setActionLoading(false);
      setShowConfirmSheet(false);
    }
  };

  const handleMembershipToggle = () => {
    if (community?.isMember) {
      setShowConfirmSheet(true);
      openSheet(confirmSheetAnim);
    } else {
      joinCommunity();
    }
  };

  const handleShare = async () => {
    try {
      // Use processed displayImage if available
      const shareImage = community?.displayImage !== FALLBACK_IMAGE 
        ? community.displayImage 
        : (community.logo?.startsWith('http') ? community.logo : `${BASE_URL}/${community.logo}`);

      await Share.share({
        message: `${community.name}\n\n${community.description || 'Join this amazing community!'}`,
        url: shareImage,
        title: community.name,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  if (!community) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Community not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/CommunityScreen')}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>{community.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. HERO IMAGE – now using processed displayImage */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: community.displayImage }}
            style={styles.heroImage}
            resizeMode="cover"
            defaultSource={{ uri: FALLBACK_IMAGE }}
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* 2. DESCRIPTION */}
        <Text style={styles.description}>
          {community.description || 'No description provided.'}
        </Text>

        {/* 3. LOCATION & CONTACT INFO - PLAIN TEXT */}
        <View style={styles.infoContainer}>
          {community.region && (
            <View style={styles.infoRow}>
              <Entypo name="location" size={16} color={ORANGE} />
              <Text style={styles.infoText}>{community.region}, {community.district}, {community.street}</Text>
            </View>
          )}
          {community.phoneNo && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={ORANGE} />
              <Text style={styles.infoText}>{community.phoneNo}</Text>
            </View>
          )}
          {community.email && (
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={16} color={ORANGE} />
              <Text style={styles.infoText}>{community.email}</Text>
            </View>
          )}
        </View>

        {/* 4. ACTION BUTTONS */}
        <View style={styles.buttonContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleMembershipToggle}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size={18} color={ORANGE} />
              ) : (
                <>
                  <Ionicons
                    name={community.isMember ? 'close-circle-outline' : 'checkmark-circle-outline'}
                    size={20}
                    color={ORANGE}
                  />
                  <Text style={styles.actionText}>
                    {community.isMember ? 'Unfollow' : 'Follow'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={ORANGE} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* SUCCESS BOTTOM SHEET */}
      <Modal transparent visible={showSuccessSheet} onRequestClose={() => closeSheet(successSheetAnim, setShowSuccessSheet)}>
        <TouchableWithoutFeedback onPress={() => closeSheet(successSheetAnim, setShowSuccessSheet)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.sheet, { transform: [{ translateY: successSheetAnim }] }]}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Success!</Text>
                <Text style={styles.sheetSubtitle}>{sheetMessage}</Text>
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => closeSheet(successSheetAnim, setShowSuccessSheet)}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* CONFIRM UNFOLLOW BOTTOM SHEET */}
      <Modal transparent visible={showConfirmSheet} onRequestClose={() => closeSheet(confirmSheetAnim, setShowConfirmSheet)}>
        <TouchableWithoutFeedback onPress={() => closeSheet(confirmSheetAnim, setShowConfirmSheet)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.sheet, { transform: [{ translateY: confirmSheetAnim }] }]}>
                <View style={styles.sheetHandle} />
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="exit-outline" size={58} color="#d9534f" />
                </View>
                <Text style={styles.sheetTitle}>Leave Community?</Text>
                <Text style={styles.sheetSubtitle}>
                  Are you sure you want to unfollow {community.name}?
                </Text>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={[styles.confirmBtn, styles.cancelBtn]}
                    onPress={() => closeSheet(confirmSheetAnim, setShowConfirmSheet)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, styles.leaveBtn]}
                    onPress={leaveCommunity}
                  >
                    <Text style={styles.leaveText}>Leave</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    fontFamily: 'GothamMedium',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'GothamBold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    width: SCREEN_WIDTH - 2 * IMAGE_HORIZONTAL_PADDING,
    height: 240,
    marginHorizontal: IMAGE_HORIZONTAL_PADDING,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontFamily: 'GothamMedium',
  },

  infoContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    fontFamily: 'GothamMedium',
    lineHeight: 22,
  },

  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
    fontFamily: 'GothamBold',
    color: ORANGE,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontFamily: 'GothamBold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'GothamMedium',
  },
  doneBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'GothamBold',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  leaveBtn: {
    backgroundColor: '#d9534f',
  },
  cancelText: {
    color: '#666',
    fontSize: 15,
    fontFamily: 'GothamBold',
  },
  leaveText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'GothamBold',
  },
});