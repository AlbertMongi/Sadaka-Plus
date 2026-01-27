import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BASE_URL } from '../apiConfig';

const { height } = Dimensions.get('window');
const GOLD = '#E18731';

const MorePage = () => {
  const router = useRouter();

  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const privacyAnim = useRef(new Animated.Value(height)).current;
  const logoutAnim = useRef(new Animated.Value(height)).current;

  const openSheet = (anim, setVisible) => {
    setVisible(true);
    Animated.timing(anim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = (anim, setVisible) => {
    Animated.timing(anim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const createPanResponder = (anim) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) anim.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 0.6) {
          closeSheet(anim, () => {});
        } else {
          Animated.spring(anim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }).panHandlers;

  const menuItems = [
    { title: 'All Communities', icon: 'people-outline', screen: '../CommunityScreen' },
    { title: 'Change community', icon: 'people-outline', screen: '../ChangeCommunityScreen' },
     { title: 'Campaigns', icon: 'megaphone-outline', screen: '../campaigns' },
    { title: 'Contribution History', icon: 'document-text-outline', screen: '../history2' },
    // { title: 'Nearby Communities', icon: 'location-outline', screen: '../NearbyCommunity' },
    
   
    { title: 'Feebback', icon: 'help-circle-outline', screen: '../HelpCentre' },
    {
      title: 'Privacy & Policy',
      icon: 'shield-checkmark-outline',
      onPress: () => openSheet(privacyAnim, setPrivacyVisible),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchWithToken = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) return;
          await fetch(`${BASE_URL}/communities/joined`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch {}
      };
      fetchWithToken();
    }, [])
  );

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    closeSheet(logoutAnim, setLogoutVisible);
    router.replace('/login');
  };

  const BottomSheet = ({ visible, anim, title, children, onClose }) => (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.sheet, { transform: [{ translateY: anim }] }]}
              {...createPanResponder(anim)}
            >
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>{title}</Text>
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>More</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* MENU */}
        <View style={styles.card}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastItem,
              ]}
              onPress={() =>
                item.screen ? router.push(item.screen) : item.onPress()
              }
            >
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={20} color={GOLD} />
              </View>

              <Text style={styles.menuText}>{item.title}</Text>

              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => openSheet(logoutAnim, setLogoutVisible)}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* PRIVACY */}
      <BottomSheet
        visible={privacyVisible}
        anim={privacyAnim}
        title="Privacy & Policy"
        onClose={() => closeSheet(privacyAnim, setPrivacyVisible)}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.policyText}>
            <Text style={styles.bold}>1. Data Collection</Text>{'\n'}
            We collect minimal data to provide community and contribution features.
            {'\n\n'}
            <Text style={styles.bold}>2. Use of Information</Text>{'\n'}
            Your data is used only to improve your experience.{'\n\n'}
            <Text style={styles.bold}>3. Security</Text>{'\n'}
            All transactions are encrypted and secure.{'\n\n'}
            <Text style={styles.bold}>4. Contact</Text>{'\n'}
            support@evmak.co.tz
          </Text>
        </ScrollView>
      </BottomSheet>

      {/* LOGOUT CONFIRM */}
      <BottomSheet
        visible={logoutVisible}
        anim={logoutAnim}
        title="Log Out?"
        onClose={() => closeSheet(logoutAnim, setLogoutVisible)}
      >
        <Text style={styles.confirmText}>
          Are you sure you want to log out?
        </Text>

        <View style={styles.confirmRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => closeSheet(logoutAnim, setLogoutVisible)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.confirmBtn]}
            onPress={confirmLogout}
          >
            <Text style={styles.confirmBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'android' ? 30 : 16,
    backgroundColor: '#FFFFFF',
  },

  headerText: {
    fontSize: 22,
    fontFamily: 'GothamBold',
    color: '#111',
    textAlign: 'left',
  },

  content: {
    padding: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    marginBottom: 24,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  menuText: {
    flex: 1,
    fontSize: 15.5,
    fontFamily: 'GothamMedium',
    color: '#222',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 18,
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'GothamBold',
    marginLeft: 8,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: height * 0.85,
  },

  handle: {
    width: 42,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },

  sheetTitle: {
    fontSize: 18,
    fontFamily: 'GothamBold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111',
  },

  policyText: {
    fontSize: 14.5,
    lineHeight: 22,
    fontFamily: 'GothamMedium',
    color: '#444',
  },

  bold: {
    fontFamily: 'GothamBold',
    color: '#000',
  },

  confirmText: {
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
  },

  confirmRow: {
    flexDirection: 'row',
    gap: 12,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },

  cancelBtn: {
    backgroundColor: '#F1F1F1',
  },

  confirmBtn: {
    backgroundColor: GOLD,
  },

  cancelText: {
    fontFamily: 'GothamBold',
    color: '#666',
    fontSize: 16,
  },

  confirmBtnText: {
    fontFamily: 'GothamBold',
    color: '#fff',
    fontSize: 16,
  },
});

export default MorePage;
