// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import { useCallback, useRef, useState } from 'react';
// import {
//   Animated,
//   Dimensions,
//   Modal,
//   PanResponder,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { useTranslation } from 'react-i18next';

// import { BASE_URL } from '../apiConfig';

// const { height } = Dimensions.get('window');
// const GOLD = '#E18731';

// const MorePage = () => {
//   const { t, i18n } = useTranslation();
//   const router = useRouter();

//   const [privacyVisible, setPrivacyVisible] = useState(false);
//   const [logoutVisible, setLogoutVisible] = useState(false);

//   const privacyAnim = useRef(new Animated.Value(height)).current;
//   const logoutAnim = useRef(new Animated.Value(height)).current;

//   const openSheet = (anim, setVisible) => {
//     setVisible(true);
//     Animated.timing(anim, {
//       toValue: 0,
//       duration: 350,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeSheet = (anim, setVisible) => {
//     Animated.timing(anim, {
//       toValue: height,
//       duration: 300,
//       useNativeDriver: true,
//     }).start(() => setVisible(false));
//   };

//   const createPanResponder = (anim) =>
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (_, gesture) => {
//         if (gesture.dy > 0) anim.setValue(gesture.dy);
//       },
//       onPanResponderRelease: (_, gesture) => {
//         if (gesture.dy > 120 || gesture.vy > 0.6) {
//           closeSheet(anim, () => {});
//         } else {
//           Animated.spring(anim, {
//             toValue: 0,
//             useNativeDriver: true,
//           }).start();
//         }
//       },
//     }).panHandlers;

//   const toggleLanguage = async () => {
//     const newLang = i18n.language === 'sw' ? 'en' : 'sw';
//     await i18n.changeLanguage(newLang);
//     // AsyncStorage is already handled by i18next detection config
//   };

//   const menuItems = [
//     { key: 'allCommunities', icon: 'people-outline', screen: '../CommunityScreen' },
//     { key: 'changeCommunity', icon: 'people-outline', screen: '../ChangeCommunityScreen' },
//     { key: 'campaigns', icon: 'megaphone-outline', screen: '../campaigns' },
//     { key: 'contributionHistory', icon: 'document-text-outline', screen: '../history2' },
//     { key: 'feebback', icon: 'help-circle-outline', screen: '../HelpCentre' },
//     // {
//     //   key: 'privacyPolicy',
//     //   icon: 'shield-checkmark-outline',
//     //   onPress: () => openSheet(privacyAnim, setPrivacyVisible),
//     // },
//   ];

//   useFocusEffect(
//     useCallback(() => {
//       const fetchWithToken = async () => {
//         try {
//           const token = await AsyncStorage.getItem('userToken');
//           if (!token) return;
//           await fetch(`${BASE_URL}/communities/joined`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           });
//         } catch {}
//       };
//       fetchWithToken();
//     }, [])
//   );

//   const confirmLogout = async () => {
//     await AsyncStorage.removeItem('userToken');
//     closeSheet(logoutAnim, setLogoutVisible);
//     router.replace('/login');
//   };

//   const BottomSheet = ({ visible, anim, title, children, onClose }) => (
//     <Modal transparent visible={visible} animationType="none">
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.overlay}>
//           <TouchableWithoutFeedback>
//             <Animated.View
//               style={[styles.sheet, { transform: [{ translateY: anim }] }]}
//               {...createPanResponder(anim)}
//             >
//               <View style={styles.handle} />
//               <Text style={styles.sheetTitle}>{title}</Text>
//               {children}
//             </Animated.View>
//           </TouchableWithoutFeedback>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>{t('more')}</Text>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.content}
//       >
//         <View style={styles.card}>
//           {menuItems.map((item, index) => (
//             <TouchableOpacity
//               key={item.key}
//               style={[
//                 styles.menuItem,
//                 index === menuItems.length - 1 && styles.lastItem,
//               ]}
//               onPress={() =>
//                 item.screen ? router.push(item.screen) : item.onPress?.()
//               }
//             >
//               <View style={styles.iconBox}>
//                 <Ionicons name={item.icon} size={20} color={GOLD} />
//               </View>
//               <Text style={styles.menuText}>{t(item.key)}</Text>
//               <Ionicons name="chevron-forward" size={18} color="#999" />
//             </TouchableOpacity>
//           ))}

//           {/* CHANGE LANGUAGE ROW */}
//           <TouchableOpacity style={styles.menuItem} onPress={toggleLanguage}>
//             <View style={styles.iconBox}>
//               <Ionicons name="globe-outline" size={20} color={GOLD} />
//             </View>
//             <Text style={styles.menuText}>{t('changeLanguage')}</Text>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Text style={{ color: '#666', fontSize: 13, marginRight: 4 }}>
//                 {t('current')}
//               </Text>
//               <Text style={{ color: GOLD, fontWeight: '600', fontSize: 14 }}>
//                 {i18n.language === 'sw' ? t('swahili') : t('english')}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={() => openSheet(logoutAnim, setLogoutVisible)}
//         >
//           <Ionicons name="log-out-outline" size={20} color="#fff" />
//           <Text style={styles.logoutText}>{t('logOut')}</Text>
//         </TouchableOpacity>

//         <View style={{ height: 40 }} />
//       </ScrollView>

//       {/* PRIVACY SHEET */}
//       <BottomSheet
//         visible={privacyVisible}
//         anim={privacyAnim}
//         title={t('privacyPolicy')}
//         onClose={() => closeSheet(privacyAnim, setPrivacyVisible)}
//       >
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <Text style={styles.policyText}>
//             {/* ← In real app you should have translated privacy text too */}
//             <Text style={styles.bold}>1. Data Collection{'\n'}</Text>
//             We collect minimal data...{'\n\n'}
//             <Text style={styles.bold}>2. Use of Information{'\n'}</Text>
//             Your data is used only...{'\n\n'}
//             support@evmak.co.tz
//           </Text>
//         </ScrollView>
//       </BottomSheet>

//       {/* LOGOUT CONFIRM */}
//       <BottomSheet
//         visible={logoutVisible}
//         anim={logoutAnim}
//         title={t('logoutQuestion')}
//         onClose={() => closeSheet(logoutAnim, setLogoutVisible)}
//       >
//         <Text style={styles.confirmText}>{t('logoutConfirm')}</Text>

//         <View style={styles.confirmRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, styles.cancelBtn]}
//             onPress={() => closeSheet(logoutAnim, setLogoutVisible)}
//           >
//             <Text style={styles.cancelText}>{t('cancel')}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, styles.confirmBtn]}
//             onPress={confirmLogout}
//           >
//             <Text style={styles.confirmBtnText}>{t('logOut')}</Text>
//           </TouchableOpacity>
//         </View>
//       </BottomSheet>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: Platform.OS === 'android' ? 30 : 16,
//     backgroundColor: '#FFFFFF',
//   },
//   headerText: {
//     fontSize: 22,
//     fontFamily: 'GothamBold',
//     color: '#111',
//   },
//   content: { padding: 10 },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     paddingVertical: 6,
//     marginBottom: 24,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 18,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   lastItem: { borderBottomWidth: 0 },
//   iconBox: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     backgroundColor: '#FFF4EC',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//   },
//   menuText: {
//     flex: 1,
//     fontSize: 15.5,
//     fontFamily: 'GothamMedium',
//     color: '#222',
//   },
//   logoutBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: GOLD,
//     paddingVertical: 16,
//     borderRadius: 18,
//   },
//   logoutText: {
//     color: '#fff',
//     fontSize: 16,
//     fontFamily: 'GothamBold',
//     marginLeft: 8,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//     justifyContent: 'flex-end',
//   },
//   sheet: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 26,
//     borderTopRightRadius: 26,
//     padding: 20,
//     maxHeight: height * 0.85,
//   },
//   handle: {
//     width: 42,
//     height: 5,
//     backgroundColor: '#DDD',
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginBottom: 14,
//   },
//   sheetTitle: {
//     fontSize: 18,
//     fontFamily: 'GothamBold',
//     textAlign: 'center',
//     marginBottom: 16,
//     color: '#111',
//   },
//   policyText: {
//     fontSize: 14.5,
//     lineHeight: 22,
//     fontFamily: 'GothamMedium',
//     color: '#444',
//   },
//   bold: { fontFamily: 'GothamBold', color: '#000' },
//   confirmText: {
//     fontSize: 16,
//     fontFamily: 'GothamMedium',
//     color: '#444',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   confirmRow: { flexDirection: 'row', gap: 12 },
//   actionBtn: {
//     flex: 1,
//     paddingVertical: 16,
//     borderRadius: 999,
//     alignItems: 'center',
//   },
//   cancelBtn: { backgroundColor: '#F1F1F1' },
//   confirmBtn: { backgroundColor: GOLD },
//   cancelText: {
//     fontFamily: 'GothamBold',
//     color: '#666',
//     fontSize: 16,
//   },
//   confirmBtnText: {
//     fontFamily: 'GothamBold',
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// export default MorePage;

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
import { useTranslation } from 'react-i18next';

import { BASE_URL } from '../apiConfig';

const { height } = Dimensions.get('window');
const GOLD = '#E18731';

const MorePage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);

  const privacyAnim = useRef(new Animated.Value(height)).current;
  const logoutAnim = useRef(new Animated.Value(height)).current;
  const languageAnim = useRef(new Animated.Value(height)).current;

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

  // Language change logic
  const openLanguageSheet = () => {
    openSheet(languageAnim, setLanguageSheetVisible);
  };

  const closeLanguageSheet = () => {
    closeSheet(languageAnim, setLanguageSheetVisible);
  };

  const changeLanguage = async (langCode) => {
    if (langCode !== i18n.language) {
      await i18n.changeLanguage(langCode);
      // If your i18next config doesn't auto-persist, uncomment:
      // await AsyncStorage.setItem('preferredLanguage', langCode);
    }
    closeLanguageSheet();
  };

  const menuItems = [
    { key: 'allCommunities', icon: 'people-outline', screen: '../CommunityScreen' },
    { key: 'changeCommunity', icon: 'people-outline', screen: '../ChangeCommunityScreen' },
    { key: 'campaigns', icon: 'megaphone-outline', screen: '../campaigns' },
    { key: 'contributionHistory', icon: 'document-text-outline', screen: '../history2' },
    { key: 'feebback', icon: 'help-circle-outline', screen: '../HelpCentre' },
    { key: 'changeLanguage', icon: 'globe-outline', onPress: openLanguageSheet },
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
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('more')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastItem,
              ]}
              onPress={() =>
                item.screen ? router.push(item.screen) : item.onPress?.()
              }
            >
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={20} color={GOLD} />
              </View>
              <Text style={styles.menuText}>{t(item.key)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => openSheet(logoutAnim, setLogoutVisible)}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* LANGUAGE SELECTION BOTTOM SHEET */}
      <BottomSheet
        visible={languageSheetVisible}
        anim={languageAnim}
        title={t('selectLanguage')}
        onClose={closeLanguageSheet}
      >
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              i18n.language === 'en' && styles.languageOptionSelected,
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={styles.languageText}>English</Text>
            {i18n.language === 'en' && (
              <Ionicons name="checkmark" size={24} color={GOLD} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              i18n.language === 'sw' && styles.languageOptionSelected,
            ]}
            onPress={() => changeLanguage('sw')}
          >
            <Text style={styles.languageText}>Kiswahili</Text>
            {i18n.language === 'sw' && (
              <Ionicons name="checkmark" size={24} color={GOLD} />
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* LOGOUT CONFIRM */}
      <BottomSheet
        visible={logoutVisible}
        anim={logoutAnim}
        title={t('logoutQuestion')}
        onClose={() => closeSheet(logoutAnim, setLogoutVisible)}
      >
        <Text style={styles.confirmText}>{t('logoutConfirm')}</Text>

        <View style={styles.confirmRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => closeSheet(logoutAnim, setLogoutVisible)}
          >
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.confirmBtn]}
            onPress={confirmLogout}
          >
            <Text style={styles.confirmBtnText}>{t('logOut')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'android' ? 30 : 16,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 22,
    fontFamily: 'GothamBold',
    color: '#111',
  },
  content: { padding: 10 },
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
  lastItem: { borderBottomWidth: 0 },
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
  languageContainer: {
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  languageOptionSelected: {
    backgroundColor: '#FFF4EC',
  },
  languageText: {
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#222',
  },
  confirmText: {
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#F1F1F1' },
  confirmBtn: { backgroundColor: GOLD },
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