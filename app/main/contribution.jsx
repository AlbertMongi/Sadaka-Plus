import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { BASE_URL } from '../apiConfig';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');
const GOLD = '#E18731';

export default function GiveScreen() {
  const navigation = useNavigation();
  const router = useRouter();
 const { t, i18n } = useTranslation();
  const [offering, setOffering] = useState('');
  const [frequency, setFrequency] = useState('One time');
  const [amount, setAmount] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  // Load token + userId — but DON'T redirect if missing
  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('userToken');
        let uid = await SecureStore.getItemAsync('userId');
        if (!uid) {
          uid = await AsyncStorage.getItem('userId');
        }

        // Just set the values — no redirect
        setToken(t);
        setUserId(uid);
      } catch (err) {
        console.warn('Failed to load auth data:', err);
        // No router.replace('/login') anymore
      }
    })();
  }, []);

  const fetchCommunities = async () => {
    if (!token) {
      // Optional: show message instead of blocking
      showToast(t('login_required_communities'), 'error');
      setCommunitiesLoading(false);
      return;
    }

    try {
      setCommunitiesLoading(true);
      const res = await fetch(`${BASE_URL}/communities/joined`, {
        headers: { Authorization: `Bearer ${token}` },
      });

       if (!res.ok) {
      if (res.status === 401) {
        showToast(t('session_expired_login_again'), 'error');
      } else {
        throw new Error(t('failed_fetch_communities'));
      }
    }

      const json = await res.json();
      setJoinedCommunities(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error('Communities fetch error:', err);
       showToast(t('could_not_load_communities'), 'error');
    } finally {
      setCommunitiesLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCommunities();
    else setCommunitiesLoading(false); // prevent infinite loading
  }, [token]);

  const fetchOfferings = async (id) => {
    if (!id || !token) {
      setOfferings([]);
      return;
    }
    try {
      setOfferingsLoading(true);
      const res = await fetch(`${BASE_URL}/offers/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch offerings');
      const json = await res.json();
      const list = Array.isArray(json.data)
        ? json.data.map((i) => ({ id: String(i.id), name: i.name || 'General Offering' }))
        : [];
      setOfferings(list);
    } catch (err) {
      console.error('Offerings fetch error:', err);
    } finally {
      setOfferingsLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) fetchOfferings(communityId);
    else {
      setOfferings([]);
      setOffering('');
    }
  }, [communityId]);

  const handleAmountChange = (value) => {
    const num = value.replace(/[^0-9]/g, '');
    setAmount(num ? Number(num).toLocaleString('en-US') : '');
  };

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'error' }), 4500);
  };

  const proceedToWeb = async () => {
   if (!communityId) return showToast(t('select_community_required'));
  if (!offering) return showToast(t('select_offering_required'));
  if (!amount) return showToast(t('enter_amount_required'));

    // Only warn — don't block if userId is missing
    if (!userId) {
       showToast(t('user_id_missing_warning'), 'error');
    }


    const rawAmount = Number(amount.replace(/,/g, ''));
    if (isNaN(rawAmount) || rawAmount < 100) {
       return showToast(t('minimum_amount_required'));
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        userId: userId || '',  // send empty string if missing
        amount: rawAmount.toString(),
        communityId,
        offering,
        frequency,
        phoneNumber: phoneNumber.trim() || '',
      });

      const webUrl = `https://sadakaplus.co.tz/serve?${params.toString()}`;
      // const webUrl = `https://your-domain.com/serve?${params.toString()}`;

      const canOpen = await Linking.canOpenURL(webUrl);
     if (canOpen) {
  await Linking.openURL(webUrl);
  showToast(t('opening_payment_page'), 'success');
} else {
  showToast(t('cannot_open_browser'), 'error');
}
      setTimeout(() => {
        setAmount('');
        setOffering('');
        setPhoneNumber('');
        setCommunityId('');
        setFrequency('One time');
      }, 1200);
    } catch (err) {
      console.error('Redirect failed:', err);
      showToast('Failed to open payment page', 'error');
    } finally {
      setLoading(false);
    }
  };

  const ModernDropdown = ({ label, items = [], value, onSelect, placeholder, disabled = false, loading = false }) => {
    const [open, setOpen] = useState(false);
    const selected = items.find((i) => i.id === value);
    const text = loading ? 'Loading...' : selected?.name || placeholder;

    return (
      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.customDropdown, (disabled || loading) && styles.disabledDropdown]}
          onPress={() => !disabled && !loading && setOpen(!open)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
            {text}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={GOLD} />
        </TouchableOpacity>

        {open && items.length > 0 && (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
              {items.map((item) => (
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

  const isFormDisabled = communitiesLoading || joinedCommunities.length === 0;

  return (
    <View style={styles.container}>
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            <Ionicons
              name={toast.type === 'success' ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color="#fff"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={communitiesLoading}
              onRefresh={fetchCommunities}
              colors={[GOLD]}
              tintColor={GOLD}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('give')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('history')}>
              <Ionicons name="receipt-outline" size={24} color={GOLD} />
            </TouchableOpacity>
          </View>

          {isFormDisabled ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={70} color={GOLD} />
             <Text style={styles.emptyText}>
  {token
    ? t('join_community_to_give')
    : t('login_to_view_join_communities')}
</Text>
            </View>
          ) : (
            <>
              <ModernDropdown
                label={t('select_community')}
      items={joinedCommunities}
      value={communityId}
      onSelect={setCommunityId}
      placeholder={t('select_community')}
      disabled={communitiesLoading}
      loading={communitiesLoading}
              />

              <ModernDropdown
                 label={t('whats_your_offering')}
      items={offerings}
      value={offering}
      onSelect={setOffering}
      placeholder={t('select_offering')}
                disabled={!communityId || offeringsLoading}
                loading={offeringsLoading}
              />

           <Text style={styles.label}>{t('frequency')}</Text>
<View style={styles.freqRow}>
  {['one_time', 'weekly', 'monthly'].map((key) => (
    <TouchableOpacity
      key={key}
      style={[styles.freqBtn, frequency === key && styles.freqActive]}
      onPress={() => setFrequency(key)}
    >
      <Text style={[styles.freqText, frequency === key && styles.freqTextActive]}>
        {t(key)}
      </Text>
    </TouchableOpacity>
  ))}
              </View>

                <Text style={styles.label}>{t('amount_tzs')}</Text>
    <View style={styles.amountBox}>
      <TextInput
        style={styles.amountInput}
        value={amount}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
        placeholder="0"
        maxLength={12}
      />
    </View>

              <TouchableOpacity
                style={[styles.continueBtn, loading && styles.btnDisabled]}
                onPress={proceedToWeb}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.continueText}> {t('continue_to_payment')}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 27 : 9,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111' },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  dropdownWrapper: { marginBottom: 16 },
  customDropdown: {
    height: 48,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledDropdown: { opacity: 0.5, backgroundColor: '#f9f9f9' },
  dropdownText: { fontSize: 16, color: '#222', fontWeight: '500' },
  placeholderText: { color: '#aaa' },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 10,
    backgroundColor: '#fff',
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownItemText: { fontSize: 15, color: '#333' },

  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  freqBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFF8F0',
    borderRadius: 30,
  },
  freqActive: { backgroundColor: GOLD },
  freqText: { fontSize: 14, color: '#555' },
  freqTextActive: { color: '#fff', fontWeight: '700' },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 12,
    height: 72,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },

  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    marginTop: 6,
  },

  continueBtn: {
    backgroundColor: GOLD,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  btnDisabled: { opacity: 0.6 },
  continueText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  emptyText: {
    marginTop: 24,
    fontSize: 17,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
  },

  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  toastSuccess: { backgroundColor: '#4CAF50' },
  toastError: { backgroundColor: '#F44336' },
  toastText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});