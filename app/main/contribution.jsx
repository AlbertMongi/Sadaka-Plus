// app/main/contribution.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { BASE_URL } from '../apiConfig';

const { height } = Dimensions.get('window');
const GOLD = '#E18731';

const mobileNetworks = [
  { name: 'HaloPesa', logo: 'https://portal.powertec.com.au/sites/default/files/styles/scale_square/public/2024-01/Viettel_Tanzania_Halotel_logo.png.webp?itok=1EgsL4zb' },
  { name: 'TigoPesa', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbiP_Qnuwr0BRypVtoHN3fFKwwxdd89_sqQw&s' },
  { name: 'Mpesa', logo: 'https://download.logo.wine/logo/Vodacom/Vodacom-Logo.wine.png' },
  { name: 'AirtelMoney', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdtdumPWtXlSSZ_nEnxNzl2JLce4N7aPh-Jg&s' },
];

export default function GiveScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [offering, setOffering] = useState('');
  const [frequency, setFrequency] = useState('One time');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState(''); // communityId
  const [mobileNumber, setMobileNumber] = useState('');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Mobile money');
  const [selectedNetwork, setSelectedNetwork] = useState(mobileNetworks[0].name);
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(''); // We'll load this
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);

  const sheetAnim = useRef(new Animated.Value(height)).current;
  const successAnim = useRef(new Animated.Value(height)).current;

  // Load token + user email on mount
  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (!t) {
        router.replace('/login');
        return;
      }

      setToken(t);

      if (userData) {
        const parsed = JSON.parse(userData);
        setUserEmail(parsed.email || '');
      }
    })();
  }, [router]);

  // Fetch joined communities
  const fetchCommunities = async () => {
    if (!token) return;
    try {
      setCommunitiesLoading(true);
      const res = await fetch(`${BASE_URL}/communities/joined`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setJoinedCommunities(res.ok && Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      // console.error(e);
    } finally {
      setCommunitiesLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCommunities();
  }, [token]);

  // Fetch offerings
  const fetchOfferings = async (id) => {
    if (!id || !token) {
      setOfferings([]);
      return;
    }
    setOfferingsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/offers/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const list = res.ok && json.success && Array.isArray(json.data)
        ? json.data.map(i => ({ id: String(i.id), name: i.name || 'General Offering' }))
        : [];
      setOfferings(list);
    } catch (e) {
      // console.error(e);
    } finally {
      setOfferingsLoading(false);
    }
  };

  useEffect(() => {
    if (location) fetchOfferings(location);
    else {
      setOfferings([]);
      setOffering('');
    }
  }, [location]);

  const handleAmountChange = (v) => {
    const num = v.replace(/[^0-9]/g, '');
    setAmount(num ? Number(num).toLocaleString() : '');
  };

  const showNotification = (type, msg) => {
    setNotification({ visible: true, type, message: msg });
    setTimeout(() => setNotification({ visible: false, type: '', message: '' }), 4000);
  };

  const openSheet = () => {
    setShowPaymentSheet(true);
    Animated.timing(sheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => {
      setShowPaymentSheet(false);
      setPaymentMethod('Mobile money');
      setSelectedNetwork(mobileNetworks[0].name);
    });
  };

  const openSuccess = () => {
    setShowSuccessSheet(true);
    Animated.timing(successAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  };

  const closeSuccess = () => {
    Animated.timing(successAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => setShowSuccessSheet(false));
  };

  const openPaymentLink = async (url) => {
    if (!url || typeof url !== 'string') {
      showNotification('error', 'Invalid payment link');
      return;
    }
    const cleanUrl = url.trim();

    try {
      if (Platform.OS === 'web') {
        const win = window.open(cleanUrl, '_blank', 'noopener,noreferrer');
        if (!win) window.location.href = cleanUrl;
      } else {
        const supported = await Linking.canOpenURL(cleanUrl);
        if (supported) await Linking.openURL(cleanUrl);
        else await WebBrowser.openBrowserAsync(cleanUrl);
      }
    } catch (err) {
      showNotification('error', 'Could not open payment page');
    }
  };

  // MAIN FUNCTION – CARD PAYMENT USES EXACT BODY YOU REQUESTED
  const sendContribution = async () => {
    if (!location || !amount || !offering || !mobileNumber) {
      showNotification('error', 'Please fill all required fields');
      return;
    }

    const rawAmount = Number(amount.replace(/,/g, ''));
    if (rawAmount < 100) {
      showNotification('error', 'Minimum amount is 100 TZS');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'Card payment') {
        // Exact payload as requested
        const cardPayload = {
          amount: rawAmount,
          payTo: location,                    // community ID or name
          transactionDetails: offering,
          email: userEmail || `${mobileNumber}@tithe.app`, // fallback
          communityId: location,              // REQUIRED
          address: "Dar es Salaam, Tanzania", // you can enhance later
        };

        console.log('Sending Card Payload →', cardPayload); // Debug

        const res = await fetch(`${BASE_URL}/payments/card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cardPayload),
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.data?.paymentUrl) {
          throw new Error(data.message || 'Card payment failed');
        }

        closeSheet();
        showNotification('success', 'Redirecting to payment...');
        setTimeout(() => openPaymentLink(data.data.paymentUrl), 800);
      } 
      else {
        // Mobile Money
        const res = await fetch(`${BASE_URL}/contributions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            offerType: offering,
            amount: rawAmount,
            purpose: frequency,
            phoneNo: mobileNumber.trim(),
            communityId: location,
            paymentMethod: selectedNetwork,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Contribution failed');
        }

        showNotification('success', 'Sent successfully!');
        closeSheet();
        openSuccess();
        setAmount('');
        setOffering('');
        setMobileNumber('');
        setLocation('');
        setFrequency('One time');
      }
    } catch (err) {
      console.error('Error:', err);
      showNotification('error', err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Dropdown Component
  const ModernDropdown = ({ label, items = [], value, onSelect, placeholder, disabled = false, loading = false }) => {
    const [open, setOpen] = useState(false);
    const selectedItem = items.find(i => i.id === value);
    const displayText = loading ? 'Loading...' : selectedItem?.name || placeholder;

    return (
      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.customDropdown, (disabled || loading) && styles.disabledDropdown]}
          onPress={() => !disabled && !loading && setOpen(!open)}
          disabled={disabled || loading}
        >
          <Text style={[styles.dropdownText, !value && !loading && styles.placeholderText]}>
            {displayText}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={GOLD} />
        </TouchableOpacity>

        {open && items.length > 0 && (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const isDisabled = !communitiesLoading && joinedCommunities.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={communitiesLoading} onRefresh={fetchCommunities} colors={[GOLD]} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Give</Text>
            <TouchableOpacity onPress={() => navigation.navigate('history')}>
              <Ionicons name="receipt-outline" size={24} color={GOLD} />
            </TouchableOpacity>
          </View>

          {notification.visible && (
            <View style={[styles.toast, notification.type === 'success' ? styles.toastSuccess : styles.toastError]}>
              <Text style={styles.toastText}>{notification.message}</Text>
            </View>
          )}

          {isDisabled ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={70} color={GOLD} />
              <Text style={styles.emptyText}>Join a community first to give</Text>
            </View>
          ) : (
            <>
              <ModernDropdown label="Give to" items={joinedCommunities} value={location} onSelect={setLocation} placeholder="Select community" disabled={communitiesLoading} />
              <ModernDropdown label="What's your offering?" items={offerings} value={offering} onSelect={setOffering} placeholder="Select offering" disabled={!location} loading={offeringsLoading} />

              <Text style={styles.label}>Frequency</Text>
              <View style={styles.freqRow}>
                {['One time', 'Weekly', 'Monthly'].map(f => (
                  <TouchableOpacity key={f} style={[styles.freqBtn, frequency === f && styles.freqActive]} onPress={() => setFrequency(f)}>
                    <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountBox}>
                <Text style={styles.currency}>TZS</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#aaa"
                />
              </View>

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="0712345678"
                keyboardType="phone-pad"
                maxLength={10}
              />

              <TouchableOpacity style={styles.continueBtn} onPress={openSheet}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Payment Sheet */}
      <Modal visible={showPaymentSheet} transparent animationType="none">
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>Confirm Contribution</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>TZS {amount || '0'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phone</Text>
                <Text style={styles.summaryValue}>{mobileNumber}</Text>
              </View>

              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.methodRow}>
                {['Mobile money', 'Card payment'].map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.methodBtn, paymentMethod === m && styles.methodActive]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text style={[styles.methodText, paymentMethod === m && styles.methodTextActive]}>
                      {m === 'Mobile money' ? 'Mobile Money' : 'Card'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {paymentMethod === 'Mobile money' && (
                <View style={styles.networkRow}>
                  {mobileNetworks.map(n => (
                    <TouchableOpacity
                      key={n.name}
                      style={[styles.netBtn, selectedNetwork === n.name && styles.netActive]}
                      onPress={() => setSelectedNetwork(n.name)}
                    >
                      <Image source={{ uri: n.logo }} style={styles.netLogo} resizeMode="contain" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.sendBtn} onPress={sendContribution} disabled={loading}>
                <Text style={styles.sendText}>{loading ? 'Processing...' : 'Send Contribution'}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Success Sheet */}
      <Modal visible={showSuccessSheet} transparent>
        <TouchableWithoutFeedback onPress={closeSuccess}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.successSheet, { transform: [{ translateY: successAnim }] }]}>
              <View style={styles.handle} />
              <Ionicons name="checkmark-circle" size={80} color={GOLD} />
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successMsg}>Your offering was sent successfully</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={closeSuccess}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// Styles unchanged — beautiful as always
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 18, paddingTop: 15, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  dropdownWrapper: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 8 },
  customDropdown: { height: 40, borderWidth: 1, borderColor: GOLD, borderRadius: 6, backgroundColor: '#fff', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  disabledDropdown: { opacity: 0.5 },
  dropdownText: { fontSize: 14, color: '#333', fontWeight: '600' },
  placeholderText: { color: '#999', fontWeight: 'normal' },
  dropdownMenu: { marginTop: 4, borderWidth: 1, borderColor: GOLD, borderRadius: 6, backgroundColor: '#fff', maxHeight: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemText: { fontSize: 14, color: '#333' },
  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  freqBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF4E5', borderRadius: 20 },
  freqActive: { backgroundColor: GOLD },
  freqText: { fontSize: 12, color: '#666' },
  freqTextActive: { color: '#fff', fontWeight: 'bold' },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: GOLD, borderRadius: 6, height: 70, paddingHorizontal: 12, backgroundColor: '#fff', marginTop: 8, justifyContent: 'center' },
  currency: { fontSize: 12, color: '#666', marginBottom: 6 },
  amountInput: { fontSize: 30, fontWeight: '500', color: '#000', textAlign: 'center', flex: 1 },
  input: { height: 40, borderWidth: 1, borderColor: GOLD, borderRadius: 6, paddingHorizontal: 12, fontSize: 14, backgroundColor: '#fff', marginTop: 8 },
  continueBtn: { backgroundColor: GOLD, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  continueText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toast: { padding: 12, borderRadius: 10, marginVertical: 10, alignItems: 'center' },
  toastSuccess: { backgroundColor: '#d4edda', borderColor: '#c3e6cb', borderWidth: 1 },
  toastError: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', borderWidth: 1 },
  toastText: { fontSize: 14, fontWeight: '600', color: '#333' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 19, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#222' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  methodRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  methodBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: '#f8f8f8', alignItems: 'center' },
  methodActive: { backgroundColor: GOLD },
  methodText: { fontSize: 15, fontWeight: '600', color: '#555' },
  methodTextActive: { color: '#fff' },
  networkRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  netBtn: { padding: 8 },
  netActive: { borderWidth: 3, borderColor: GOLD, borderRadius: 14 },
  netLogo: { width: 54, height: 54, borderRadius: 12 },
  sendBtn: { backgroundColor: GOLD, padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  sendText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, alignItems: 'center' },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: GOLD, marginVertical: 12 },
  successMsg: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 30 },
  doneBtn: { backgroundColor: GOLD, paddingHorizontal: 50, paddingVertical: 16, borderRadius: 30 },
  doneText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 20, fontSize: 16, color: '#888', textAlign: 'center' },
});