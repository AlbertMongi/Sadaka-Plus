
// app/main/index1.jsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  PanResponder,
  Keyboard,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../apiConfig';
import { fetchBase64Image } from '../fetchBase64Image';
import { useNetwork } from '../../components/NetworkStatusProvider';

const { width, height } = Dimensions.get('window');
const GOLD = '#E18731';
const FALLBACK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';

const mobileNetworks = [
  { name: 'HaloPesa', logo: 'https://portal.powertec.com.au/sites/default/files/styles/scale_square/public/2024-01/Viettel_Tanzania_Halotel_logo.png.webp?itok=1EgsL4zb' },
  { name: 'TigoPesa', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbiP_Qnuwr0BRypVtoHN3fFKwwxdd89_sqQw&s' },
  { name: 'Mpesa', logo: 'https://download.logo.wine/logo/Vodacom/Vodacom-Logo.wine.png' },
  { name: 'AirtelMoney', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdtdumPWtXlSSZ_nEnxNzl2JLce4N7aPh-Jg&s' },
];

/* =============================================================
   SKELETON LOADERS
============================================================= */
const SkeletonPulse = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return <Animated.View style={[{ opacity }, style, { backgroundColor: '#E1E9EE' }]} />;
};

/* (BalanceSkeleton, QuickActionsSkeleton, CardSkeleton, FullPageSkeleton – unchanged) */
const BalanceSkeleton = () => (
  <View style={styles.balanceCard}>
    <SkeletonPulse style={{ width: 60, height: 14, marginBottom: 10 }} />
    <SkeletonPulse style={{ width: 180, height: 32, marginVertical: 10 }} />
    <SkeletonPulse style={{ width: 100, height: 12, marginBottom: 15 }} />
    <View style={styles.actionRow}>
      {[1, 2, 3].map((_, i) => (
        <SkeletonPulse key={i} style={[styles.actionBtn, { marginHorizontal: 5 }]} />
      ))}
    </View>
  </View>
);
const QuickActionsSkeleton = () => (
  <View style={styles.quickActionsContainer}>
    {[1, 2, 3].map((_, i) => (
      <SkeletonPulse key={i} style={[styles.quickActionButton, { marginBottom: 8 }]} />
    ))}
  </View>
);
const CardSkeleton = () => (
  <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
    {[1, 2].map((_, i) => (
      <View key={i} style={styles.eventCardVertical}>
        <SkeletonPulse style={[styles.eventImageVertical, { marginRight: 12 }]} />
        <View style={styles.eventInfoVertical}>
          <SkeletonPulse style={{ width: '80%', height: 16, marginBottom: 6 }} />
          <SkeletonPulse style={{ width: '60%', height: 14, marginBottom: 4 }} />
          <SkeletonPulse style={{ width: '70%', height: 12 }} />
        </View>
      </View>
    ))}
  </View>
);
const FullPageSkeleton = () => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={[
      styles.scrollContent,
      { paddingBottom: Platform.OS === 'android' ? 80 : 20 },
    ]}
  >
    <View style={styles.section}><BalanceSkeleton /></View>
    <View style={styles.section}>
      <SkeletonPulse style={{ width: 120, height: 16, marginHorizontal: 16, marginBottom: 6 }} />
      <QuickActionsSkeleton />
    </View>
    <View style={styles.section}>
      <SkeletonPulse style={{ width: 140, height: 16, marginHorizontal: 16, marginBottom: 6 }} />
      <CardSkeleton />
    </View>
    <View style={styles.section}>
      <SkeletonPulse style={{ width: 140, height: 16, marginHorizontal: 16, marginBottom: 6 }} />
      <CardSkeleton />
    </View>
    <View style={[styles.section, { paddingBottom: 20 }]}>
      <SkeletonPulse style={{ width: 140, height: 16, marginHorizontal: 16, marginBottom: 6 }} />
      <CardSkeleton />
    </View>
  </ScrollView>
);

/* =============================================================
   EMPTY STATE
============================================================= */
const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon} size={48} color={GOLD} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

/* =============================================================
   HELPERS
============================================================= */
const formatDate = (dateString) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${hour12}:${minutes} ${ampm}`;
  return { day, month, time };
};

/* =============================================================
   MAIN COMPONENT
============================================================= */
export default function WalletScreen() {
  // const { isConnected } = useNetwork();

  // if (!isConnected) {
  //   // You can show a fallback UI if you want
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
  //       <Ionicons name="wifi-off" size={80} color="#ccc" />
  //       <Text style={{ fontSize: 18, marginTop: 20, color: '#666' }}>No Internet Connection</Text>
  //       <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>
  //         Please check your network and try again
  //       </Text>
  //     </View>
  //   );
  // }
  const router = useRouter();

  /* ---------- STATE ---------- */
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('HELLO');
  const [firstName, setFirstName] = useState('');
  const [balance, setBalance] = useState('0');
  const [walletId, setWalletId] = useState(null);
  const [profileImage, setProfileImage] = useState(FALLBACK_IMAGE);
  const [communityId, setCommunityId] = useState(null);

  const [churchActivities, setChurchActivities] = useState({
    announcement: null,
    campaigns: [],
  });

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Mobile money');
  const [amount, setAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(mobileNetworks[0].name);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [notification, setNotification] = useState({ visible: false, type: '', message: '' });

  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);

/* ---------- ANIMATIONS ---------- */
const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(50)).current;
const balanceAnim = useRef(new Animated.Value(1)).current;

// Large pool – we will only use the first N items
const cardAnims = useRef(
  Array.from({ length: 30 }, () => ({ fade: new Animated.Value(0), slide: new Animated.Value(30) }))
).current;
const eventAnims = useRef(
  Array.from({ length: 12 }, () => ({ fade: new Animated.Value(0), slide: new Animated.Value(30) }))
).current;
const historyAnims = useRef(new Map()).current;   // ← This fixes the crash forever

  /* ---------- BOTTOM SHEET ---------- */
  const sheetAnim = useRef(new Animated.Value(height)).current;
  const openSheet = () => Animated.timing(sheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.timing(sheetAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => setShowWalletModal(false));
  };
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => g.dy > 0 && sheetAnim.setValue(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150 || g.vy > 0.5) closeSheet();
        else Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  /* ---------- FETCH USER PROFILE ---------- */
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        const name = (d.firstName || '').toUpperCase();
        setFirstName(name);
        await AsyncStorage.setItem('FirstName', d.firstName || '');

        // ---- PROFILE IMAGE ----
        if (d.profile_photo) {
          const imgUri = await fetchBase64Image(d.profile_photo);
          const finalUri = imgUri || FALLBACK_IMAGE;
          setProfileImage(finalUri);
          await AsyncStorage.setItem('ProfileImage', finalUri);
        } else {
          setProfileImage(FALLBACK_IMAGE);
          await AsyncStorage.removeItem('ProfileImage');
        }

        // ---- COMMUNITY ID (critical) ----
        const cid = d.community?.id;
        if (cid) setCommunityId(cid);
      }
    } catch (err) {
      console.error('fetchUserProfile error:', err);
    }
  }, []);

  /* ---------- FETCH ANNOUNCEMENTS (latest) ---------- */
  const fetchAnnouncements = useCallback(async () => {
    if (!communityId) return null;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(
        `${BASE_URL}/updates/category/ANNOUNCEMENT/${communityId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data[0];
      }
      return null;
    } catch (err) {
      console.warn('fetchAnnouncements error:', err);
      return null;
    }
  }, [communityId]);

  /* ---------- FETCH ALL CAMPAIGNS ---------- */
  const fetchCampaigns = useCallback(async () => {
    if (!communityId) return [];
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(
        `${BASE_URL}/updates/category/CAMPAIGN/${communityId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.warn('fetchCampaigns error:', err);
      return [];
    }
  }, [communityId]);

  /* ---------- FETCH WALLET ---------- */
  const fetchWallet = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch('http://sadaka-plus-api.ludovick.site/api/wallet/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success && json.data) {
        setBalance(json.data.balance.toLocaleString());
        setWalletId(json.data.id);
      } else {
        setBalance('0');
      }
    } catch (err) {
      console.error('fetchWallet error:', err);
      setBalance('0');
    }
  }, []);

  /* ---------- FETCH EVENTS ---------- */
  const fetchEvents = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const communityId = await AsyncStorage.getItem('selectedCommunityId');
      const url = communityId
        ? `${BASE_URL}/events/user/${communityId}`
        : `${BASE_URL}/events/user/`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const enriched = json.data.map(e => {
          const { day, month, time } = formatDate(e.eventDate);
          const location = `${e.street}, ${e.district}, ${e.region}`;
          return {
            id: e.id,
            title: e.name,
            description: e.description,
            location,
            day,
            month,
            time,
            image: e.imageUrl || FALLBACK_IMAGE,
          };
        });
        setEvents(enriched);
      }
    } catch (err) {
      console.error('fetchEvents error:', err);
    }
  }, []);

  /* ---------- FETCH TRANSACTIONS ---------- */
  const fetchTransactions = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/contributions/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(item => {
          const d = new Date(item.createdAt || Date.now());
          return {
            id: item.id,
            userName: item?.user?.fullName || 'Anonymous',
            amount: item.amount,
            status: item.status || 'Pending',
            dateTime: `${d.toDateString()} ${d.toLocaleTimeString()}`,
            purpose: item.purpose || 'No purpose given',
          };
        });
        setTransactions(mapped);
      }
    } catch (err) {
      console.error('fetchTransactions error:', err);
    }
  }, []);

  /* ---------- INITIAL LOAD (profile + wallet + events + txns) ---------- */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchWallet(),
        fetchEvents(),
        fetchTransactions(),
      ]);
      // communityId will be set inside fetchUserProfile → next effect will pick it up
      setLoading(false);
    };
    init();
  }, [fetchUserProfile, fetchWallet, fetchEvents, fetchTransactions]);

  /* ---------- CHURCH ACTIVITIES (announcements + campaigns) ---------- */
  useEffect(() => {
    if (!communityId) {
      setChurchActivities({ announcement: null, campaigns: [] });
      return;
    }

    const loadChurch = async () => {
      const [ann, camps] = await Promise.all([fetchAnnouncements(), fetchCampaigns()]);
      setChurchActivities({ announcement: ann, campaigns: camps });
    };
    loadChurch();
  }, [communityId, fetchAnnouncements, fetchCampaigns]);

  /* ---------- REFRESH ---------- */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);

    // reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    cardAnims.forEach(a => { a.fade.setValue(0); a.slide.setValue(30); });
    eventAnims.forEach(a => { a.fade.setValue(0); a.slide.setValue(30); });
    historyAnims.forEach(a => { a.fade.setValue(0); a.slide.setValue(30); });

    Promise.all([
      fetchUserProfile(),
      fetchWallet(),
      fetchEvents(),
      fetchTransactions(),
    ]).finally(() => {
      setRefreshing(false);
      setLoading(false);
      animateSections();
    });
  }, [
    fetchUserProfile,
    fetchWallet,
    fetchEvents,
    fetchTransactions,
  ]);

  /* ---------- GREETING ---------- */
  useEffect(() => {
    const hour = new Date().getHours();
    const greetingText =
      hour < 12
        ? `GOOD MORNING${firstName ? ', ' + firstName : ''}!`
        : hour < 17
        ? `GOOD AFTERNOON${firstName ? ', ' + firstName : ''}!`
        : `GOOD EVENING${firstName ? ', ' + firstName : ''}!`;
    setGreeting(greetingText);
  }, [firstName]);

  /* ---------- TOGGLE BALANCE ---------- */
  const toggleBalance = () => {
    Animated.timing(balanceAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setShowBalance(p => !p);
      Animated.timing(balanceAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  /* ---------- MODAL HELPERS ---------- */
  const openWalletModal = (action) => {
    if (['Add Fund', 'Withdraw', 'Transfer'].includes(action)) {
      setSelectedAction(action);
      setShowWalletModal(true);
      resetModalForm();
      openSheet();
    }
  };
  const resetModalForm = () => {
    setAmount('');
    setMobileNumber('');
    setSelectedNetwork(mobileNetworks[0].name);
    setPaymentMethod('Mobile money');
  };
  const closeModal = () => {
    Keyboard.dismiss();
    closeSheet();
  };

  const formatAmount = (val) => val.replace(/,/g, '').replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const handleAmountChange = (val) => setAmount(formatAmount(val));
  const handlePhoneChange = (val) => setMobileNumber(val);

  const showNotification = (type, msg) => {
    setNotification({ visible: true, type, message: msg });
    setTimeout(() => setNotification({ visible: false, type: '', message: '' }), 3000);
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'Card payment') {
      setLoadingSubmit(true);
      setTimeout(async () => {
        setLoadingSubmit(false);
        closeModal();
        showNotification('success', 'Redirecting to secure card payment...');
        await WebBrowser.openBrowserAsync('https://your-payment-gateway.com');
      }, 1500);
    } else {
      await submitWalletAction();
    }
  };

  const submitWalletAction = async () => {
    if (!amount || parseInt(amount.replace(/,/g, ''), 10) <= 0) {
      showNotification('error', 'Please enter a valid amount');
      return;
    }
    if (!walletId) {
      showNotification('error', 'Wallet not found');
      return;
    }

    setLoadingSubmit(true);
    const token = await AsyncStorage.getItem('userToken');
    const endpointMap = {
      'Add Fund': `/wallet/${walletId}/addfund`,
      'Withdraw': `/wallet/${walletId}/withdraw`,
      'Transfer': `/wallet/${walletId}/transfer`,
    };
    const endpoint = endpointMap[selectedAction];

    try {
      const res = await fetch(`http://sadaka-plus-api.ludovick.site/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseInt(amount.replace(/,/g, ''), 10),
          ...(paymentMethod === 'Mobile money' && { phoneNumber: mobileNumber }),
        }),
      });

      const json = await res.json();

      if (json.success) {
        showNotification('success', `${selectedAction} successful!`);
        await fetchWallet();
        closeModal();
      } else {
        showNotification('error', json.message || 'Transaction failed');
      }
    } catch (err) {
      showNotification('error', 'Network error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  /* ---------- NAVIGATION ---------- */
  const handleRedirect = (dest) => {
    if (['Add Fund', 'Withdraw', 'Transfer'].includes(dest)) {
      openWalletModal(dest);
      return;
    }

    const routes = {
      Profile: '/profile',
      'Sunday Service': '/churchActivity',
      Offering: '/main/contribution',
      'Pay Tithe': '/main/contribution',
      Donation: '/main/contribution',
      Notifications: '/notification',
    };

    if (routes[dest]) router.push(routes[dest]);
  };

  const goToEventDetail = (eventId) => {
    router.push({ pathname: '/EventDetailScreen', params: { id: eventId } });
  };

  /* ---------- TRANSACTION SHEET ---------- */
  const txnSheetAnim = useRef(new Animated.Value(height)).current;
  const openTxnSheet = () => Animated.timing(txnSheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  const closeTxnSheet = () => {
    Animated.timing(txnSheetAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => setSelectedTxn(null));
  };
  const txnPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => g.dy > 0 && txnSheetAnim.setValue(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150 || g.vy > 0.5) closeTxnSheet();
        else Animated.spring(txnSheetAnim, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  /* ---------- ANIMATE SECTIONS ---------- */
  const animateSections = () => {
    const anims = [
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ];

    // ---- Church cards (announcement + campaigns) ----
    const allCards = churchActivities.announcement
      ? [churchActivities.announcement, ...churchActivities.campaigns]
      : churchActivities.campaigns;

    allCards.forEach((_, i) => {
      if (cardAnims[i]) {
        anims.push(
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.parallel([
              Animated.timing(cardAnims[i].fade, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.timing(cardAnims[i].slide, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
          ])
        );
      }
    });

    // ---- Events ----
    events.forEach((_, i) => {
      if (eventAnims[i]) {
        anims.push(
          Animated.sequence([
            Animated.delay(i * 120),
            Animated.parallel([
              Animated.timing(eventAnims[i].fade, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.timing(eventAnims[i].slide, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
          ])
        );
      }
    });

    // ---- History ----
// ---- Recent Transactions (only first 5) ----
transactions.slice(0, 5).forEach((tx, i) => {
  const anim = historyAnims.get(tx.id) || { fade: new Animated.Value(0), slide: new Animated.Value(30) };
  anims.push(
    Animated.sequence([
      Animated.delay(i * 80),
      Animated.parallel([
        Animated.timing(anim.fade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim.slide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ])
  );
});

    Animated.parallel(anims).start();
  };

  // run animation after loading finishes
  useEffect(() => {
    if (!loading) animateSections();
  }, [loading, churchActivities, events, transactions]);

  /* ---------- RENDER ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.navBar}>
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => handleRedirect('Profile')} style={styles.profileContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.avatar}
                defaultSource={{ uri: FALLBACK_IMAGE }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text style={styles.tabActive}>What would you like to do today?</Text>
          </View>
          <View style={styles.icons}>
            <TouchableOpacity onPress={() => handleRedirect('Notifications')} style={styles.iconTouchable}>
              <Ionicons name="notifications-outline" size={20} color={GOLD} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.greetingRow}>
          <Ionicons name="sunny-outline" size={16} color="#888" />
          <Text style={styles.greetingText}>{greeting}</Text>
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <FullPageSkeleton />
      ) : (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Platform.OS === 'android' ? 80 : 20 },
            ]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} tintColor={GOLD} />}
          >
            {/* Balance */}
            <View style={styles.section}>
              <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.currency}>TZS</Text>
                  <TouchableOpacity onPress={toggleBalance}>
                    <Ionicons name={showBalance ? 'eye-off-outline' : 'eye-outline'} size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Animated.Text style={[styles.balance, { opacity: balanceAnim }]}>
                  {showBalance ? balance : '**********'}
                </Animated.Text>
                <Text style={styles.balanceText}>Balance</Text>
                <View style={styles.actionRow}>
                  {[
                    { icon: 'add', label: 'Add Fund' },
                    { icon: 'card-outline', label: 'Withdraw' },
                    { icon: 'send-outline', label: 'Transfer' },
                  ].map((a, i) => (
                    <TouchableOpacity key={i} style={styles.actionBtn} onPress={() => openWalletModal(a.label)}>
                      <Ionicons name={a.icon} size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsContainer}>
                {[
                  { icon: <MaterialCommunityIcons name="hand-heart-outline" size={24} color="#000" />, label: 'Offering' },
                  { icon: <Ionicons name="card-outline" size={24} color="#000" />, label: 'Pay Tithe' },
                  { icon: <Ionicons name="gift-outline" size={24} color="#000" />, label: 'Donation' },
                ].map((a, i) => (
                  <TouchableOpacity key={i} style={styles.quickActionButton} onPress={() => handleRedirect(a.label)}>
                    {a.icon}
                    <Text style={styles.quickActionText}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Church Activities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Church Activities</Text>

              {/* Empty state */}
              {(!churchActivities.announcement && churchActivities.campaigns.length === 0) ? (
                <EmptyState
                  icon="calendar-outline"
                  title="No church activities"
                  subtitle="Stay tuned for announcements and campaigns from your community."
                />
              ) : (
                <>
                  {/* Latest Announcement */}
                  {churchActivities.announcement && (
                    <Animated.View style={{ opacity: cardAnims[0].fade, transform: [{ translateY: cardAnims[0].slide }] }}>
                      <TouchableOpacity style={styles.eventCardVertical} onPress={() => handleRedirect('Sunday Service')}>
                        <Image
                          source={{ uri: churchActivities.announcement.imageUrl || FALLBACK_IMAGE }}
                          style={styles.eventImageVertical}
                          resizeMode="cover"
                        />
                        <View style={styles.eventInfoVertical}>
                          <Text style={styles.eventName}>{churchActivities.announcement.title}</Text>
                          <Text style={styles.eventTime}>
                            {new Date(churchActivities.announcement.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                          <TouchableOpacity style={styles.calendarBtn} onPress={() => handleRedirect('Sunday Service')}>
                            <Text style={styles.calendarText}>View activity</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  )}

                  {/* All Campaigns */}
                  {churchActivities.campaigns.map((camp, idx) => {
                    const animIdx = churchActivities.announcement ? idx + 1 : idx;
                    return (
                      <Animated.View
                        key={camp.id}
                        style={{ opacity: cardAnims[animIdx].fade, transform: [{ translateY: cardAnims[animIdx].slide }] }}
                      >
                        <TouchableOpacity
                          style={[styles.eventCardVertical, styles.announcementCard]}
                          onPress={() => handleRedirect('main/contribution')}
                        >
                          <Image
                            source={{ uri: camp.imageUrl || FALLBACK_IMAGE }}
                            style={styles.eventImageVertical}
                            resizeMode="cover"
                          />
                          <View style={styles.eventInfoVertical}>
                            <Text style={styles.eventName}>{camp.title}</Text>
                            <Text style={styles.eventTime}>Campaign – TZS 0 of 1 Billion raised</Text>
                            <TouchableOpacity style={styles.calendarBtn} onPress={() => handleRedirect('main/contribution')}>
                              <Text style={styles.calendarText}>Contribute</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </>
              )}
            </View>

            {/* Upcoming Events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              {events.length === 0 ? (
                <EmptyState
                  icon="calendar-outline"
                  title="No upcoming events"
                  subtitle="Join a community to discover fellowships, worship nights, and special services near you."
                />
              ) : (
                events.map((ev, i) => (
                  <Animated.View
                    key={ev.id}
                    style={{ opacity: eventAnims[i].fade, transform: [{ translateY: eventAnims[i].slide }] }}
                  >
                    <TouchableOpacity style={styles.eventCardVertical} onPress={() => goToEventDetail(ev.id)}>
                      <View style={{ position: 'relative' }}>
                        <Image source={{ uri: ev.image }} style={styles.eventImageVertical} resizeMode="cover" />
                        <View style={styles.dateOverlay}>
                          <Text style={styles.dateOverlayText}>{ev.day} {ev.month}</Text>
                        </View>
                      </View>
                      <View style={styles.eventInfoVertical}>
                        <Text style={styles.eventName}>{ev.title}</Text>
                        <Text style={styles.eventTime}>{ev.time}</Text>
                        <Text style={styles.eventLocation}>{ev.location}</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </View>

            {/* Offerings History */}
                                      {/* Recent Transactions – Shows exactly 5 */}
            <View style={[styles.section, { paddingBottom: 20 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14 }}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => router.push('/history')}>
                  <Text style={{ color: GOLD, fontSize: 13, fontFamily: 'GothamMedium' }}>
                    View More →
                  </Text>
                </TouchableOpacity>
              </View>

              {transactions.length === 0 ? (
                <EmptyState
                  icon="wallet-outline"
                  title="No transactions yet"
                  subtitle="Your contributions will appear here once made."
                />
              ) : (
                transactions
                  .slice(0, 5)
                  .map((tx) => {
                    // Create animation only once per transaction
                    if (!historyAnims.has(tx.id)) {
                      historyAnims.set(tx.id, {
                        fade: new Animated.Value(0),
                        slide: new Animated.Value(30),
                      });
                    }
                    const anim = historyAnims.get(tx.id);

                    return (
                      <Animated.View
                        key={tx.id}
                        style={{
                          opacity: anim.fade,
                          transform: [{ translateY: anim.slide }],
                        }}
                      >
                        <TouchableOpacity
                          style={styles.historyRow}
                          onPress={() => {
                            setSelectedTxn(tx);
                            openTxnSheet();
                          }}
                        >
                          <Ionicons name="repeat-outline" size={20} color="#333" />
                          <View style={styles.historyContent}>
                            <Text style={styles.historyAmount}>
                              TZS {tx.amount.toLocaleString()}
                            </Text>
                            <Text style={styles.historyType}>{tx.purpose}</Text>
                          </View>
                          <Ionicons name="chevron-forward-outline" size={20} color="#333" />
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })
              )}
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Notification */}
      {notification.visible && (
        <View style={[styles.notificationContainer, notification.type === 'success' ? styles.notificationSuccess : styles.notificationError]}>
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      )}

      {/* Wallet Modal (unchanged) */}
      <Modal visible={showWalletModal} transparent onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={sheetStyles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[sheetStyles.sheetContainer, { transform: [{ translateY: sheetAnim }] }]} {...panResponder.panHandlers}>
                <View style={sheetStyles.sheetHandle} />
                <Text style={sheetStyles.sheetTitle}>{selectedAction}</Text>

                <Text style={sheetStyles.label}>Amount (TZS)</Text>
                <View style={sheetStyles.amountBox}>
                  <Text style={sheetStyles.currency}>TZS</Text>
                  <TextInput
                    style={sheetStyles.amountInput}
                    value={amount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    placeholderTextColor="#999"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                <Text style={sheetStyles.label}>Payment Method</Text>
                <View style={sheetStyles.paymentMethodRow}>
                  {['Mobile money', 'Card payment'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[sheetStyles.methodBtn, paymentMethod === m && sheetStyles.methodBtnActive]}
                      onPress={() => setPaymentMethod(m)}
                    >
                      <Text style={[sheetStyles.methodText, paymentMethod === m && sheetStyles.methodTextActive]}>
                        {m === 'Mobile money' ? 'Mobile Money' : 'Card'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {paymentMethod === 'Mobile money' && (
                  <>
                    <Text style={sheetStyles.label}>Mobile Network</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={sheetStyles.networkScroll}>
                      {mobileNetworks.map((n) => (
                        <TouchableOpacity
                          key={n.name}
                          style={[sheetStyles.networkBtn, selectedNetwork === n.name && sheetStyles.networkBtnActive]}
                          onPress={() => setSelectedNetwork(n.name)}
                        >
                          <Image source={{ uri: n.logo }} style={sheetStyles.networkLogo} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <Text style={sheetStyles.label}>Phone Number</Text>
                    <TextInput
                      style={sheetStyles.textInput}
                      value={mobileNumber}
                      onChangeText={handlePhoneChange}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      placeholderTextColor="#999"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </>
                )}

                <TouchableOpacity
                  style={[sheetStyles.submitBtn, loadingSubmit && sheetStyles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={loadingSubmit}
                >
                  <Text style={sheetStyles.submitText}>
                    {loadingSubmit ? 'Processing...' : `Confirm ${selectedAction}`}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Transaction Detail (unchanged) */}
      <Modal visible={!!selectedTxn} transparent onRequestClose={closeTxnSheet}>
        <TouchableWithoutFeedback onPress={closeTxnSheet}>
          <View style={sheetStyles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[sheetStyles.sheetContainer, { transform: [{ translateY: txnSheetAnim }] }]} {...txnPan.panHandlers}>
                <View style={sheetStyles.sheetHandle} />
                <Text style={sheetStyles.sheetTitle}>Transaction Details</Text>

                {selectedTxn && (
                  <>
                    <View style={sheetStyles.detailBox}><Text style={sheetStyles.modalLabel}>Name</Text><Text style={sheetStyles.modalText}>{selectedTxn.userName}</Text></View>
                    <View style={sheetStyles.detailBox}><Text style={sheetStyles.modalLabel}>Amount</Text><Text style={[sheetStyles.modalText, { color: '#0a8a00' }]}>+ TZS {selectedTxn.amount.toLocaleString()}</Text></View>
                    <View style={sheetStyles.detailBox}><Text style={sheetStyles.modalLabel}>Status</Text><Text style={sheetStyles.modalText}>{selectedTxn.status}</Text></View>
                    <View style={sheetStyles.detailBox}><Text style={sheetStyles.modalLabel}>Date</Text><Text style={sheetStyles.modalText}>{selectedTxn.dateTime}</Text></View>
                    <View style={sheetStyles.detailBox}><Text style={sheetStyles.modalLabel}>Purpose</Text><Text style={sheetStyles.modalText}>{selectedTxn.purpose}</Text></View>
                  </>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

/* =============================================================
   STYLES (unchanged – only the ones you already had)
============================================================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  fixedHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 25 : -10,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabs: { flexDirection: 'row', alignItems: 'center' },
  tabActive: { fontSize: 14, color: '#000000', fontFamily: 'GothamRegular', marginLeft: 8 },
  icons: { flexDirection: 'row', alignItems: 'center' },
  iconTouchable: { padding: 4, borderRadius: 6 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  greetingText: { fontSize: 12, color: GOLD, marginLeft: 6, fontFamily: 'GothamBold' },
  profileContainer: { marginRight: 8 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1.5, borderColor: GOLD, resizeMode: 'cover' },

  scrollContent: {
    backgroundColor: '#fff',
    minHeight: height + 100,
    paddingTop: Platform.OS === 'android' ? 105 : 78,
  },
  section: { marginBottom: 18, backgroundColor: '#fff' },
  sectionTitle: {
    fontSize: 15,
    color: '#222',
    paddingHorizontal: 14,
    fontFamily: 'GothamBold',
    paddingBottom: 6,
  },
  balanceCard: {
    backgroundColor: "#E18731",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 16,
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currency: { color: '#fff', fontSize: 14, fontFamily: 'GothamBold' },
  balance: { color: '#fff', fontSize: 28, fontFamily: 'GothamBold', textAlign: 'center', marginVertical: 10 },
  balanceText: { color: '#fff', fontSize: 14, fontFamily: 'GothamRegular', textAlign: 'center', marginBottom: 15 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, alignItems: 'center', marginHorizontal: 5, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' },
  actionBtnText: { color: '#fff', fontSize: 12, marginTop: 5, fontFamily: 'GothamMedium' },
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 6 },
  quickActionButton: { width: '30%', backgroundColor: '#fff', borderWidth: 1, borderColor: GOLD, borderRadius: 8, padding: 6, alignItems: 'center', marginBottom: 8 },
  quickActionText: { fontSize: 12, color: '#222', textAlign: 'center', fontFamily: 'GothamRegular', marginTop: 4 },
  eventCardVertical: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 8, marginHorizontal: 16, marginBottom: 8 },
  announcementCard: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#EEE' },
  eventImageVertical: { width: 110, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  eventInfoVertical: { flex: 1, paddingHorizontal: 12, paddingVertical: 5, justifyContent: 'center' },
  eventName: { fontSize: 13, color: '#222', fontFamily: 'GothamBold' },
  eventTime: { fontSize: 12, color: GOLD, marginTop: 2, fontFamily: 'GothamRegular' },
  eventLocation: { fontSize: 11, color: '#666', marginTop: 2, fontFamily: 'GothamRegular' },
  calendarBtn: { marginTop: 5, backgroundColor: GOLD, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10, alignSelf: 'flex-start' },
  calendarText: { color: '#fff', fontSize: 12, fontFamily: 'GothamRegular' },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 15, marginHorizontal: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 4.65, elevation: 4 },
  historyContent: { marginLeft: 10, flex: 1 },
  historyAmount: { fontSize: 14, color: GOLD, fontFamily: 'GothamBold' },
  historyType: { fontSize: 14, color: '#333', fontFamily: 'GothamRegular', padding: 5 },
  dateOverlay: { position: 'absolute', bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderBottomLeftRadius: 8, borderTopRightRadius: 8 },
  dateOverlayText: { color: '#fff', fontSize: 10, fontFamily: 'GothamRegular' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, paddingHorizontal: 30 },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '600', color: '#E18731', fontFamily: 'GothamBold' },
  emptySubtitle: { marginTop: 6, fontSize: 12, color: '#555', textAlign: 'center', fontFamily: 'GothamRegular' },

  notificationContainer: { position: 'absolute', top: 90, left: 16, right: 16, padding: 12, borderRadius: 8, zIndex: 1000, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  notificationSuccess: { backgroundColor: '#E6FFE6', borderColor: GOLD, borderWidth: 1 },
  notificationError: { backgroundColor: '#FFE6E6', borderColor: '#E18731', borderWidth: 1 },
  notificationText: { fontSize: 14, color: '#333', fontFamily: 'GothamRegular', flex: 1 },
});

const sheetStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 32, maxHeight: height * 0.85, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 20 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 19, fontFamily: 'GothamBold', color: '#222', textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 14, fontFamily: 'GothamMedium', color: '#333', marginBottom: 6, marginTop: 8 },
  amountBox: { borderWidth: 1, borderColor: GOLD, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12, alignItems: 'center', backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center' },
  amountInput: { fontSize: 20, color: '#000', fontFamily: 'GothamMedium', textAlign: 'center', flex: 1 },
  paymentMethodRow: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  methodBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FFEFD5', alignItems: 'center' },
  methodBtnActive: { backgroundColor: GOLD },
  methodText: { fontSize: 13, color: '#333', fontFamily: 'GothamMedium' },
  methodTextActive: { color: '#fff', fontFamily: 'GothamBold' },
  networkScroll: { marginBottom: 8 },
  networkBtn: { padding: 8, borderWidth: 1, borderColor: '#fff', borderRadius: 10, marginRight: 10 },
  networkBtnActive: { borderColor: GOLD },
  networkLogo: { width: 44, height: 44, borderRadius: 8 },
  textInput: { borderWidth: 1, borderColor: GOLD, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: 'GothamRegular', backgroundColor: '#fff', marginBottom: 8 },
  submitBtn: { backgroundColor: GOLD, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: Platform.OS === 'android' ? 30 : 10 },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },
  detailBox: { marginBottom: 12, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: GOLD },
  modalLabel: { fontWeight: '600', fontSize: 14, marginBottom: 4, color: '#333' },
  modalText: { fontSize: 14, color: '#555' },
});