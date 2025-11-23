// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Modal,
//   Pressable,
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from './apiConfig';

// const GOLD = '#FF8C00';
// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// export default function TransactionHistory() {
//   const [transactions, setTransactions] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTxn, setSelectedTxn] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigation = useNavigation();
//   const headerFadeAnim = useRef(new Animated.Value(0)).current;
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
//               userId: item.userId,
//               communityId: item.communityId,
//               amount: item.amount,
//               purpose: item.purpose || 'No purpose given',
//               status: item.status || 'Pending',
//               date: String(dateObj.getDate()).padStart(2, '0'),
//               month: dateObj.toLocaleString('default', { month: 'short' }),
//               title: 'Contribution',
//               type: 'Credit',
//               anim: new Animated.Value(0),
//             };
//           });
//           setTransactions(mapped);

//           mapped.forEach((item, index) => {
//             Animated.timing(item.anim, {
//               toValue: 1,
//               duration: 300,
//               delay: index * 100,
//               useNativeDriver: true,
//             }).start();
//           });
//         } else {
//           Alert.alert('Error', json.message || 'Failed to load transactions.');
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Could not fetch data. Please check your connection.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactions();

//     Animated.timing(headerFadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   useEffect(() => {
//     if (selectedTxn) {
//       Animated.timing(modalSlideAnim, {
//         toValue: 0,
//         duration: 400,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       modalSlideAnim.setValue(SCREEN_HEIGHT);
//     }
//   }, [selectedTxn]);

//   const filteredTransactions = transactions.filter(txn =>
//     `${txn.title} ${txn.purpose}`.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const closeModal = () => {
//     Animated.timing(modalSlideAnim, {
//       toValue: SCREEN_HEIGHT,
//       duration: 400,
//       useNativeDriver: true,
//     }).start(() => setSelectedTxn(null));
//   };

//   const renderItem = ({ item }) => (
//     <Animated.View style={[styles.card, { opacity: item.anim, transform: [{ scale: item.anim }] }]}>
//       <TouchableOpacity style={styles.touchableCard} onPress={() => setSelectedTxn(item)}>
//         <View style={styles.dateBadge}>
//           <Text style={styles.dateText}>{item.date}</Text>
//           <Text style={styles.monthText}>{item.month}</Text>
//         </View>
//         <View style={styles.info}>
//           <Text style={styles.title}>{item.title}</Text>
//           <Text style={styles.description}>{item.purpose}</Text>
//           <Text style={styles.type}>{item.type}</Text>
//           <Text style={styles.status}>Status: {item.status}</Text>
//         </View>
//         <View style={styles.amountContainer}>
//           <Text
//             style={[
//               styles.amount,
//               { color: item.amount >= 0 ? '#0a8a00' : '#d32f2f' },
//             ]}
//           >
//             {item.amount >= 0 ? '+' : '-'}Tz{Math.abs(item.amount)}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );

//   return (
//     <SafeAreaView style={styles.safeContainer}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // VOW behaviour
//         style={{ flex: 1 }}
//       >
//         <View style={styles.container}>
//           {/* Animated Header */}
//           <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
//             <TouchableOpacity onPress={() => navigation.navigate('main', { screen: 'contribution' })}>
//               <Ionicons name="arrow-back" size={24} color={GOLD} />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>Transaction History</Text>
//             <View style={{ width: 24 }} />
//           </Animated.View>

//           {/* Search */}
//           <View style={styles.searchContainer}>
//             <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
//             <TextInput
//               placeholder="Search transactions"
//               placeholderTextColor="#999"
//               value={searchTerm}
//               onChangeText={setSearchTerm}
//               style={styles.searchInput}
//             />
//           </View>

//           {/* Loader */}
//           {loading ? (
//             <ActivityIndicator size="large" color={GOLD} style={{ marginTop: 20 }} />
//           ) : (
//             <FlatList
//               data={filteredTransactions}
//               keyExtractor={item => item.id}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingBottom: 40 }}
//               ListEmptyComponent={<Text style={styles.noResults}>No transactions found.</Text>}
//               renderItem={renderItem}
//             />
//           )}

//           {/* Modal */}
//           <Modal
//             visible={!!selectedTxn}
//             animationType="none"
//             transparent
//             onRequestClose={closeModal}
//           >
//             <Pressable style={styles.modalOverlay} onPress={closeModal}>
//               <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalSlideAnim }] }]}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>Transaction Details</Text>
//                   <TouchableOpacity onPress={closeModal}>
//                     <Ionicons name="close" size={24} color={GOLD} />
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.detailBox}>
//                   <Text style={styles.modalLabel}>Purpose</Text>
//                   <Text style={styles.modalText}>{selectedTxn?.purpose}</Text>
//                 </View>

//                 <View style={styles.detailBox}>
//                   <Text style={styles.modalLabel}>Status</Text>
//                   <Text style={styles.modalText}>{selectedTxn?.status}</Text>
//                 </View>

//                 <View style={styles.detailBox}>
//                   <Text style={styles.modalLabel}>Amount</Text>
//                   <Text
//                     style={[
//                       styles.modalText,
//                       { color: selectedTxn?.amount >= 0 ? '#0a8a00' : '#d32f2f' },
//                     ]}
//                   >
//                     {selectedTxn?.amount >= 0 ? '+' : '-'}Tz{Math.abs(selectedTxn?.amount)}
//                   </Text>
//                 </View>

//                 <View style={styles.detailBox}>
//                   <Text style={styles.modalLabel}>Date</Text>
//                   <Text style={styles.modalText}>
//                     {selectedTxn?.date} {selectedTxn?.month}
//                   </Text>
//                 </View>
//               </Animated.View>
//             </Pressable>
//           </Modal>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === 'ios' ? -40 : 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000',
//     fontFamily: 'Gotham-Bold',
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
//     fontFamily: 'Gotham-Regular',
//   },
//   noResults: {
//     textAlign: 'center',
//     marginTop: 24,
//     color: '#999',
//     fontSize: 13,
//     fontFamily: 'Gotham-Medium',
//   },
//   card: {
//     marginBottom: 12,
//   },
//   touchableCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     alignItems: 'center',
//     // shadowColor: '#000',
//     // shadowOffset: { width: 0, height: 1 },
//     // shadowOpacity: 0.12,
//     // shadowRadius: 6,
//     // elevation: 3,
//   },
//   dateBadge: {
//     backgroundColor: GOLD,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//     width: 60,
//   },
//   dateText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 18,
//     fontFamily: 'Gotham-Bold',
//   },
//   monthText: {
//     color: '#fff',
//     fontSize: 12,
//     marginTop: 2,
//     fontFamily: 'Gotham-Medium',
//   },
//   info: {
//     flex: 1,
//   },
//   title: {
//     fontWeight: '600',
//     fontSize: 16,
//     color: '#000',
//     marginBottom: 4,
//     fontFamily: 'Gotham-Medium',
//   },
//   description: {
//     fontSize: 13,
//     color: '#555',
//     marginBottom: 4,
//     fontFamily: 'Gotham-Regular',
//   },
//   type: {
//     fontSize: 11,
//     color: '#666',
//     fontStyle: 'italic',
//     fontFamily: 'Gotham-Medium',
//   },
//   status: {
//     fontSize: 11,
//     color: GOLD,
//     fontWeight: '600',
//     marginTop: 2,
//     fontFamily: 'Gotham-Bold',
//   },
//   amountContainer: {
//     minWidth: 70,
//     alignItems: 'flex-end',
//   },
//   amount: {
//     fontWeight: '700',
//     fontSize: 16,
//     fontFamily: 'Gotham-Bold',
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
//     elevation: 5,
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
//     fontFamily: 'Gotham-Bold',
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
//     fontFamily: 'Gotham-Medium',
//   },
//   modalText: {
//     fontSize: 14,
//     color: '#555',
//     fontFamily: 'Gotham-Regular',
//   },
// });


import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './apiConfig';

const GOLD = '#FF8C00';
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const navigation = useNavigation();
  const modalSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'No token found.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/contributions/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map(item => {
            const dateObj = new Date(item.createdAt || Date.now());
            return {
              id: item.id,
              userName: item?.user?.fullName || 'Anonymous',
              amount: item.amount,
              status: item.status || 'Pending',
              dateTime: `${dateObj.toDateString()} ${dateObj.toLocaleTimeString()}`,
              purpose: item.purpose || 'No purpose given',
            };
          });

          const total = mapped.reduce((sum, txn) => sum + txn.amount, 0);
          setTransactions(mapped);
          setFilteredTransactions(mapped);
          setTotalBalance(total);
        } else {
          Alert.alert('Error', json.message || 'Failed to load transactions.');
        }
      } catch (error) {
        Alert.alert('Error', 'Could not fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(txn => {
      const query = searchTerm.toLowerCase();
      return (
        txn.userName.toLowerCase().includes(query) ||
        txn.status.toLowerCase().includes(query) ||
        txn.purpose.toLowerCase().includes(query)
      );
    });

    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  useEffect(() => {
    if (selectedTxn) {
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalSlideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedTxn]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.transactionItem} onPress={() => setSelectedTxn(item)}>
      <View style={styles.transactionInfo}>
        <Text style={styles.nameText}>Transfer to {item.userName}</Text>
        <Text style={styles.dateText}>{item.dateTime}</Text>
      </View>
      <View style={styles.amountStatusContainer}>
        <Text style={styles.amountText}>+ TZS {item.amount.toLocaleString()}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const closeModal = () => {
    setSelectedTxn(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Offering Transactions</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Total Balance */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Total Offerings:</Text>
            <Text style={styles.balanceAmount}>TZS {totalBalance.toLocaleString()}</Text>
          </View>
          <View style={styles.accountNumberContainer}>
            <Text style={styles.accountNumberText}>9048753241</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name, status, or purpose"
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {/* Transactions */}
        {loading ? (
          <ActivityIndicator size="large" color={GOLD} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No transactions found.</Text>
            }
          />
        )}

        {/* Bottom Sheet Modal */}
        <Modal transparent visible={!!selectedTxn} animationType="none">
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalSlideAnim }] }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transaction Details</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={GOLD} />
                </TouchableOpacity>
              </View>

              {selectedTxn && (
                <>
                  <View style={styles.detailBox}>
                    <Text style={styles.modalLabel}>Name</Text>
                    <Text style={styles.modalText}>{selectedTxn.userName}</Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.modalLabel}>Amount</Text>
                    <Text style={[styles.modalText, { color: '#0a8a00' }]}>
                      + TZS {selectedTxn.amount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <Text style={styles.modalText}>{selectedTxn.status}</Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.modalLabel}>Date</Text>
                    <Text style={styles.modalText}>{selectedTxn.dateTime}</Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.modalLabel}>Purpose</Text>
                    <Text style={styles.modalText}>{selectedTxn.purpose}</Text>
                  </View>
                </>
              )}
            </Animated.View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  balanceCard: {
    backgroundColor: '#001233',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  accountNumberContainer: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  accountNumberText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#000',
  },
  transactionItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#555',
  },
  amountStatusContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a8a00',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#d4f8d4',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#0a8a00',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: SCREEN_HEIGHT * 0.45,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: GOLD,
  },
  detailBox: {
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  modalLabel: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    color: '#555',
  },
});