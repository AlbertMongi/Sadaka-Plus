// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Dimensions,
//   FlatList,
//   Modal,
//   Platform,
//   Pressable,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { BASE_URL } from './apiConfig';

// const GOLD = '#FF8C00';
// const SCREEN_HEIGHT = Dimensions.get('window').height;

// export default function TransactionHistory() {
//   const router = useRouter();
//   const [transactions, setTransactions] = useState([]);
//   const [filteredTransactions, setFilteredTransactions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTxn, setSelectedTxn] = useState(null);
//   const [totalBalance, setTotalBalance] = useState(0);
//   const navigation = useNavigation();
//   const modalSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         setLoading(true);
//         const token = await AsyncStorage.getItem('userToken');
//         if (!token) {
//           Alert.alert('Error', 'No token found.');
//           setLoading(false);
//           return;
//         }

//         const response = await fetch(`${BASE_URL}/contributions/user`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const json = await response.json();

//         if (json.success && Array.isArray(json.data)) {
//           const mapped = json.data.map(item => {
//             const dateObj = new Date(item.createdAt || Date.now());
//             return {
//               id: item.id,
//               userName: item?.user?.fullName || '',
//               amount: item.amount,
//               status: item.status || 'Pending',
//               dateTime: `${dateObj.toDateString()} ${dateObj.toLocaleTimeString()}`,
//                 purpose: item.purpose || 'No purpose given',
//                 communityName: item.community?.name || item.community || '',
//             };
//           });

//           const total = mapped.reduce((sum, txn) => sum + txn.amount, 0);
//           setTransactions(mapped);
//           setFilteredTransactions(mapped);
//           setTotalBalance(total);
//         } else {
//           Alert.alert('Error', json.message || 'Failed to load transactions.');
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Could not fetch data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, []);

//   useEffect(() => {
//     const filtered = transactions.filter(txn => {
//       const query = searchTerm.toLowerCase();
//       return (
//         txn.userName.toLowerCase().includes(query) ||
//         txn.status.toLowerCase().includes(query) ||
//         txn.purpose.toLowerCase().includes(query) ||
//         (txn.communityName || '').toLowerCase().includes(query)
//       );
//     });

//     setFilteredTransactions(filtered);
//   }, [searchTerm, transactions]);

//   useEffect(() => {
//     if (selectedTxn) {
//       Animated.timing(modalSlideAnim, {
//         toValue: 0,
//         duration: 400,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       Animated.timing(modalSlideAnim, {
//         toValue: SCREEN_HEIGHT,
//         duration: 400,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [selectedTxn]);

//   const renderItem = ({ item }) => (
//     <TouchableOpacity style={styles.transactionItem} onPress={() => setSelectedTxn(item)}>
//       <View style={styles.transactionInfo}>
//         <Text style={styles.nameText}>Transfered to {item.userName}{item.communityName ? ` — ${item.communityName}` : ''}</Text>
//         <Text style={styles.dateText}>{item.dateTime}</Text>
//       </View>
//       <View style={styles.amountStatusContainer}>
//         <Text style={styles.amountText}>+ TZS {item.amount.toLocaleString()}</Text>
//         <View style={styles.statusBadge}>
//           <Text style={styles.statusText}>{item.status}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const closeModal = () => {
//     setSelectedTxn(null);
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.headerContainer}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.push('/main/more')}
//           accessibilityLabel="Go back"
//         >
//           <Ionicons name="chevron-back" size={24} color="#000" />
//         </TouchableOpacity>
//           <Text style={styles.headerTitle}>Offering Transactions</Text>
//           <View style={{ width: 24 }} />
//         </View>

//         {/* Total Balance */}
//         <View style={styles.balanceCard}>
//           <View>
//             <Text style={styles.balanceLabel}>Total Offerings:</Text>
//             <Text style={styles.balanceAmount}>TZS {totalBalance.toLocaleString()}</Text>
//           </View>
//           <View style={styles.accountNumberContainer}>
//             {/* <Text style={styles.accountNumberText}>9048753241</Text> */}
//           </View>
//         </View>

//         {/* Search */}
//         <View style={styles.searchContainer}>
//           <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
//           <TextInput
//             placeholder="Search by name, status, or purpose"
//             placeholderTextColor="#999"
//             value={searchTerm}
//             onChangeText={setSearchTerm}
//             style={styles.searchInput}
//           />
//         </View>

//         {/* Transactions */}
//         {loading ? (
//           <ActivityIndicator size="large" color={GOLD} style={{ marginTop: 20 }} />
//         ) : (
//           <FlatList
//             data={filteredTransactions}
//             keyExtractor={item => item.id}
//             renderItem={renderItem}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 20 }}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No transactions found.</Text>
//             }
//           />
//         )}

//         {/* Bottom Sheet Modal */}
//         <Modal transparent visible={!!selectedTxn} animationType="none">
//           <Pressable style={styles.modalOverlay} onPress={closeModal}>
//             <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalSlideAnim }] }]}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Transaction Details</Text>
//                 <TouchableOpacity onPress={closeModal}>
//                   <Ionicons name="close" size={24} color={GOLD} />
//                 </TouchableOpacity>
//               </View>

//               {selectedTxn && (
//                 <>
//                   <View style={styles.detailBox}>
//                     <Text style={styles.modalLabel}>Name</Text>
//                     <Text style={styles.modalText}>{selectedTxn.userName}</Text>
//                   </View>

//                   <View style={styles.detailBox}>
//                     <Text style={styles.modalLabel}>Amount</Text>
//                     <Text style={[styles.modalText, { color: '#0a8a00' }]}>
//                       + TZS {selectedTxn.amount.toLocaleString()}
//                     </Text>
//                   </View>

//                   <View style={styles.detailBox}>
//                     <Text style={styles.modalLabel}>Status</Text>
//                     <Text style={styles.modalText}>{selectedTxn.status}</Text>
//                   </View>

//                   <View style={styles.detailBox}>
//                     <Text style={styles.modalLabel}>Date</Text>
//                     <Text style={styles.modalText}>{selectedTxn.dateTime}</Text>
//                   </View>

//                   <View style={styles.detailBox}>
//                     <Text style={styles.modalLabel}>Purpose</Text>
//                     <Text style={styles.modalText}>{selectedTxn.purpose}</Text>
//                   </View>
//                   {selectedTxn.communityName ? (
//                     <View style={styles.detailBox}>
//                       <Text style={styles.modalLabel}>Community</Text>
//                       <Text style={styles.modalText}>{selectedTxn.communityName}</Text>
//                     </View>
//                   ) : null}
//                 </>
//               )}
//             </Animated.View>
//           </Pressable>
//         </Modal>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === 'ios' ? 20 : 40,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000',
//   },
//   balanceCard: {
//     backgroundColor: '#001233',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   balanceLabel: {
//     color: '#fff',
//     fontSize: 14,
//     opacity: 0.8,
//   },
//   balanceAmount: {
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   accountNumberContainer: {
//     backgroundColor: '#eee',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   accountNumberText: {
//     fontSize: 12,
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FAFAFA',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderWidth: 1,
//     borderColor: GOLD,
//     marginBottom: 16,
//   },
//   searchIcon: {
//     marginRight: 6,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 13,
//     color: '#000',
//   },
//   transactionItem: {
//     backgroundColor: '#f8f8f8',
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   transactionInfo: {
//     flex: 1,
//     marginRight: 8,
//   },
//   nameText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#222',
//     marginBottom: 4,
//   },
//   dateText: {
//     fontSize: 12,
//     color: '#555',
//   },
//   amountStatusContainer: {
//     alignItems: 'flex-end',
//   },
//   amountText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#0a8a00',
//     marginBottom: 4,
//   },
//   statusBadge: {
//     backgroundColor: '#d4f8d4',
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#0a8a00',
//     fontWeight: '600',
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: '#999',
//     fontSize: 14,
//     marginTop: 40,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     minHeight: SCREEN_HEIGHT * 0.45,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: GOLD,
//   },
//   detailBox: {
//     marginBottom: 12,
//     backgroundColor: '#FAFAFA',
//     padding: 12,
//     borderRadius: 10,
//     borderLeftWidth: 3,
//     borderLeftColor: GOLD,
//   },
//   modalLabel: {
//     fontWeight: '600',
//     fontSize: 14,
//     marginBottom: 4,
//     color: '#333',
//   },
//   modalText: {
//     fontSize: 14,
//     color: '#555',
//   },
// });
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BASE_URL } from './apiConfig';

const GOLD = '#E18731';
const SCREEN_HEIGHT = Dimensions.get('window').height;

const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon} size={52} color={GOLD} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

export default function TransactionHistory() {
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const modalSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 4000);
  };

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showToast('No authentication token found. Please log in.', 'error');
        setTimeout(() => router.replace('/login'), 1800);
        return;
      }

      const response = await fetch(`${BASE_URL}/contributions/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
          const errJson = await response.json();
          errorMsg = errJson.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const json = await response.json();

      if (!json?.success) {
        throw new Error(json?.message || 'Failed to load contribution history');
      }

      const rawData = Array.isArray(json.data) ? json.data : [];

      const mapped = rawData
        .filter(item => item && typeof item === 'object')
        .map((item, index) => {
          const dateRaw = item.createdAt;
          const date = dateRaw ? new Date(dateRaw) : new Date();
          const safeDate = isNaN(date.getTime()) ? new Date() : date;

          return {
            id: item.id ?? `temp-${index}-${Date.now()}`,
            amount: Number(item.amount) || 0,
            purpose: item.purpose ?? item.transactionDetails ?? 'Contribution',
            dateTime: safeDate.toLocaleString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            communityName: item.community?.name ?? item.community ?? item.payTo ?? '—',
            status: item.status ?? 'Pending',
          };
        });

      const total = mapped.reduce((sum, tx) => sum + tx.amount, 0);

      setTransactions(mapped);
      setFilteredTransactions(mapped);
      setTotalBalance(total);

      if (mapped.length === 0) {
        showToast('No contributions found', 'info');
      } else {
        showToast(`Loaded ${mapped.length} contribution${mapped.length === 1 ? '' : 's'}`, 'success');
      }

    } catch (err) {
      console.error('[Contributions fetch error]', err);
      const msg = err.message.includes('Network') || err.message.includes('fetch')
        ? 'Network error — please check your connection'
        : err.message || 'Could not load contribution history';
      showToast(msg, 'error');
      setFetchError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContributions();
  }, [fetchContributions]);

  // Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const query = searchTerm.toLowerCase();
    setFilteredTransactions(
      transactions.filter(tx =>
        tx.purpose.toLowerCase().includes(query) ||
        tx.communityName.toLowerCase().includes(query) ||
        tx.status.toLowerCase().includes(query) ||
        tx.dateTime.toLowerCase().includes(query)
      )
    );
  }, [searchTerm, transactions]);

  // Modal animation
  useEffect(() => {
    Animated.timing(modalSlideAnim, {
      toValue: selectedTxn ? 0 : SCREEN_HEIGHT,
      duration: 340,
      useNativeDriver: true,
    }).start();
  }, [selectedTxn]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyRow}
      onPress={() => setSelectedTxn(item)}
      activeOpacity={0.8}
    >
      <Ionicons name="repeat-outline" size={22} color="#444" />
      <View style={styles.historyContent}>
        <Text style={styles.historyAmount}>TZS {item.amount.toLocaleString()}</Text>
        <Text style={styles.historyPurpose} numberOfLines={1}>
          {item.purpose}
        </Text>
        {item.communityName !== '—' && (
          <Text style={styles.historyCommunity}>{item.communityName}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#777" />
    </TouchableOpacity>
  );

  const closeModal = () => setSelectedTxn(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contribution History</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Total */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Contributed</Text>
          <Text style={styles.balanceAmount}>TZS {totalBalance.toLocaleString()}</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search contributions..."
            placeholderTextColor="#aaa"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.centerText}>Loading contributions...</Text>
          </View>
        ) : fetchError ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchContributions}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon="wallet-outline"
                title="No contributions yet"
                subtitle="Your contribution history will appear here once you give."
              />
            }
          />
        )}

        {/* Toast */}
        {toast.visible && (
          <View style={styles.toastContainer}>
            <View style={[
              styles.toastBase,
              toast.type === 'success' && styles.toastSuccess,
              toast.type === 'error' && styles.toastError,
            ]}>
              <Ionicons
                name={
                  toast.type === 'success' ? 'checkmark-circle' :
                  toast.type === 'error' ? 'close-circle' : 'information-circle'
                }
                size={22}
                color="#fff"
              />
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>
          </View>
        )}

        {/* Detail Modal */}
        <Modal transparent visible={!!selectedTxn} animationType="none">
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <Animated.View
              style={[styles.modalContent, { transform: [{ translateY: modalSlideAnim }] }]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Contribution Details</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color={GOLD} />
                </TouchableOpacity>
              </View>

              {selectedTxn && (
                <View style={{ gap: 16 }}>
                  <DetailRow label="Purpose" value={selectedTxn.purpose} />
                  <DetailRow label="Amount" value={`TZS ${selectedTxn.amount.toLocaleString()}`} isHighlight />
                  <DetailRow label="Status" value={selectedTxn.status} />
                  <DetailRow label="Date" value={selectedTxn.dateTime} />
                  <DetailRow label="Community" value={selectedTxn.communityName} />
                </View>
              )}
            </Animated.View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value, isHighlight = false }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[
      styles.detailValue,
      isHighlight && { color: '#27ae60', fontWeight: '700' }
    ]}>
      {value || '—'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },

  balanceCard: {
    backgroundColor: '#001233',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: { color: '#aaa', fontSize: 14 },
  balanceAmount: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 6 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  listContent: { paddingBottom: 40 },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  historyContent: { flex: 1, marginLeft: 12 },
  historyAmount: { fontSize: 16, color: GOLD, fontWeight: '700' },
  historyPurpose: { fontSize: 14, color: '#444', marginTop: 3 },
  historyCommunity: { fontSize: 13, color: '#666', marginTop: 3 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  centerText: { marginTop: 16, fontSize: 16, color: '#666' },
  errorText: { marginTop: 16, fontSize: 16, color: '#e74c3c', textAlign: 'center' },
  retryButton: {
    marginTop: 24,
    backgroundColor: GOLD,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '700', color: GOLD },
  emptySubtitle: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: GOLD },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
  detailValue: { fontSize: 15, color: '#222', textAlign: 'right', flex: 1 },

  // ─── Toast ────────────────────────────────────────
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastSuccess: { backgroundColor: '#27ae60' },
  toastError: { backgroundColor: '#c0392b' },
  toastText: { color: '#fff', fontSize: 15, fontWeight: '600', flexShrink: 1 },
});