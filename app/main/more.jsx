// app/more/MorePage.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import { BASE_URL } from '../apiConfig';

const { height } = Dimensions.get('window');
const GOLD = '#E18731';

const MorePage = () => {
  const router = useRouter();

  // Bottom Sheet States
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedTheme, setSelectedTheme] = useState('light');

  // Animations
  const privacyAnim = useRef(new Animated.Value(height)).current;
  const langAnim = useRef(new Animated.Value(height)).current;
  const themeAnim = useRef(new Animated.Value(height)).current;
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

  // Pan Responder for Draggable Sheet
  const createPanResponder = (anim) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) anim.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          closeSheet(anim, () => {});
        } else {
          Animated.spring(anim, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }).panHandlers;

  const menuGroups = [
    [
      { title: 'Contribution History', icon: 'document-text-outline', screen: '../history' },
      { title: 'Nearby Communities', icon: 'location-outline', screen: '../NearbyCommunity' },
      { title: 'My Communities', icon: 'people-outline', screen: '../CommunityScreen' },
    ],
    [
     { title: 'Security', icon: 'lock-closed-outline', screen: '../security' },
      { title: 'Campaigns', icon: 'megaphone-outline', screen: '../campaigns' },
      // { title: 'Saved', icon: 'bookmark-outline', screen: '../saved' },
          { title: 'Help Centre', icon: 'help-circle-outline', screen: '../HelpCentre' },
    ],
    [
      { title: 'Payment Method', icon: 'card-outline', screen: '../paymentMethod' },
    
  
          
      { title: 'Privacy & Policy', icon: 'shield-checkmark-outline', onPress: () => openSheet(privacyAnim, setPrivacyVisible) },
    ],
    [
      // { title: 'Change Language', icon: 'globe-outline', onPress: () => openSheet(langAnim, setLanguageVisible) },
      // { title: 'Themes', icon: 'color-palette-outline', onPress: () => openSheet(themeAnim, setThemeVisible) },
  
    ],
  ];

  const fetchWithToken = async (url, options = {}) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) await res.json();
    } catch (error) {}
  };

  const loadData = useCallback(async () => {
    await fetchWithToken(`${BASE_URL}/communities/joined`);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleLogout = () => {
    openSheet(logoutAnim, setLogoutVisible);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    closeSheet(logoutAnim, setLogoutVisible);
    router.replace('/login');
  };

  // Reusable Bottom Sheet
  const BottomSheet = ({ visible, onClose, anim, title, children, panHandlers }) => (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.sheetContainer, { transform: [{ translateY: anim }] }]}
              {...(panHandlers || {})}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>{title}</Text>
              <View style={styles.sheetContent}>{children}</View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <Text style={styles.headerText}>More</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {menuGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.groupContainer}>
            {group.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === group.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => {
                  if (item.onPress) item.onPress();
                  else if (item.screen) router.push(item.screen);
                }}
                disabled={!item.screen && !item.onPress}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon} size={22} color={GOLD} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <View style={styles.chevronWrapper}>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* PRIVACY & POLICY */}
      <BottomSheet
        visible={privacyVisible}
        onClose={() => closeSheet(privacyAnim, setPrivacyVisible)}
        anim={privacyAnim}
        title="Privacy & Policy"
        panHandlers={createPanResponder(privacyAnim).panHandlers}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.policyText}>
            <Text style={styles.bold}>1. Data Collection</Text>{'\n'}
            We collect minimal data to provide Bible study, community, and contribution features. This includes your name, email, and contribution history.{'\n\n'}
            <Text style={styles.bold}>2. Use of Information</Text>{'\n'}
            Your data is used solely to improve your experience and facilitate secure contributions. We never sell your data.{'\n\n'}
            <Text style={styles.bold}>3. Contributions</Text>{'\n'}
             All donations go directly to church projects. Transactions are encrypted and secure via M-Pesa, Tigo Pesa, or card.{'\n\n'}
             All donations go directly to church projects. Transactions are encrypted and secure via M-Pesa, Tigo Pesa, or card.{'\n\n'}
            <Text style={styles.bold}>4. Community Safety</Text>{'\n'}
            We moderate communities to ensure respectful and faith-based discussions.{'\n\n'}
            <Text style={styles.bold}>5. Contact</Text>{'\n'}
            For privacy concerns, contact support@faithapp.co.tz
          </Text>
        </ScrollView>
      </BottomSheet>

      {/* LANGUAGE */}
      <BottomSheet
        visible={languageVisible}
        onClose={() => closeSheet(langAnim, setLanguageVisible)}
        anim={langAnim}
        title="Change Language"
        panHandlers={createPanResponder(langAnim).panHandlers}
      >
        {[
          { code: 'en', name: 'English Language' },
          { code: 'sw', name: 'Kiswahili Language' },
        ].map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.optionItem}
            onPress={() => {
              setSelectedLang(lang.code);
              closeSheet(langAnim, setLanguageVisible);
            }}
          >
            <Text style={styles.optionText}>{lang.name}</Text>
            {selectedLang === lang.code && <Ionicons name="checkmark" size={24} color={GOLD} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* THEMES */}
      <BottomSheet
        visible={themeVisible}
        onClose={() => closeSheet(themeAnim, setThemeVisible)}
        anim={themeAnim}
        title="Choose Theme"
        panHandlers={createPanResponder(themeAnim).panHandlers}
      >
        {['Light theme', 'Dark theme', 'System theme'].map((theme) => (
          <TouchableOpacity
            key={theme}
            style={styles.optionItem}
            onPress={() => {
              setSelectedTheme(theme.toLowerCase());
              closeSheet(themeAnim, setThemeVisible);
            }}
          >
            <Text style={styles.optionText}>{theme}</Text>
            {selectedTheme === theme.toLowerCase() && <Ionicons name="checkmark" size={24} color={GOLD} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* LOGOUT CONFIRMATION */}
      <BottomSheet
        visible={logoutVisible}
        onClose={() => closeSheet(logoutAnim, setLogoutVisible)}
        anim={logoutAnim}
        title="Log Out?"
        panHandlers={createPanResponder(logoutAnim).panHandlers}
      >
        <Text style={styles.logoutConfirmText}>
          Are you sure you want to log out of your account?
        </Text>

        <View style={styles.logoutBtnGroup}>
          <TouchableOpacity
            style={[styles.logoutActionBtn, styles.cancelBtn]}
            onPress={() => closeSheet(logoutAnim, setLogoutVisible)}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutActionBtn, styles.confirmBtn]}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  fixedHeader: {
    // height: Platform.OS === 'android' ? -5 : 50,
    paddingVertical: Platform.OS === 'android' ? 30 : -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'GothamBold',
    textAlign: 'left',
  },
  scrollContent: { padding:  Platform.OS === 'android' ? 9 : 10 },
 
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  lastMenuItem: { borderBottomWidth: 0 },
  iconWrapper: { width: 36, alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 12 },
  menuTitle: { fontSize: 15, color: '#222', fontFamily: 'GothamMedium' },
  chevronWrapper: { width: 36, alignItems: 'center' },
  logoutSection: { marginTop: 20 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'GothamBold',
  },

  // BOTTOM SHEET
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontFamily: 'GothamBold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetContent: {
    paddingBottom: 10,
  },
  policyText: {
    fontSize: 14.5,
    color: '#444',
    lineHeight: 23,
    fontFamily: 'GothamMedium',
  },
  bold: { fontFamily: 'GothamBold', color: '#000' },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  optionText: {
    fontSize: 16.5,
    color: '#222',
    fontFamily: 'GothamMedium',
  },

  // LOGOUT CONFIRMATION
  logoutConfirmText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'GothamMedium',
  },
  logoutBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoutActionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
  },
  confirmBtn: {
    backgroundColor: GOLD,
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'GothamBold',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'GothamBold',
  },
});

export default MorePage;