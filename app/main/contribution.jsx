// // app/main/contribution.jsx
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import * as Linking from 'expo-linking';
// import { useRouter } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
// import { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Animated,
//   Dimensions,
//   Image,
//   KeyboardAvoidingView,
//   Modal,
//   PanResponder,
//   Platform,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { BASE_URL } from '../apiConfig';

// const { height } = Dimensions.get('window');
// const GOLD = '#E18731';

// const mobileNetworks = [
//   { name: 'HaloPesa', logo: 'https://portal.powertec.com.au/sites/default/files/styles/scale_square/public/2024-01/Viettel_Tanzania_Halotel_logo.png.webp?itok=1EgsL4zb' },
//   { name: 'TigoPesa', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbiP_Qnuwr0BRypVtoHN3fFKwwxdd89_sqQw&s' },
//   { name: 'AirtelMoney', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdtdumPWtXlSSZ_nEnxNzl2JLce4N7aPh-Jg&s' },
// ];

// export default function GiveScreen() {
//   const navigation = useNavigation();
//   const router = useRouter();

//   const [offering, setOffering] = useState('');
//   const [frequency, setFrequency] = useState('One time');
//   const [amount, setAmount] = useState('');
//   const [location, setLocation] = useState('');
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [showPaymentSheet, setShowPaymentSheet] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('Mobile money');
//   const [selectedNetwork, setSelectedNetwork] = useState(mobileNetworks[0].name);
//   const [currency, setCurrency] = useState('TZS');
//   const [countryCode, setCountryCode] = useState('TZ');
//   const [postalCode, setPostalCode] = useState('');
//   const [address, setAddress] = useState('');
//   const [token, setToken] = useState(null);
//   const [userEmail, setUserEmail] = useState('');
//   const [joinedCommunities, setJoinedCommunities] = useState([]);
//   const [offerings, setOfferings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [communitiesLoading, setCommunitiesLoading] = useState(true);
//   const [offeringsLoading, setOfferingsLoading] = useState(false);
//   const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
//   const [showSuccessSheet, setShowSuccessSheet] = useState(false);

//   const sheetAnim = useRef(new Animated.Value(height)).current;
//   const successAnim = useRef(new Animated.Value(height)).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => false,
//       onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5 && Math.abs(gs.dx) < 10,
//       onPanResponderMove: (_, gs) => {
//         if (gs.dy > 0) sheetAnim.setValue(gs.dy);
//       },
//       onPanResponderRelease: (_, gs) => {
//         const shouldClose = gs.dy > height * 0.25 || gs.vy > 0.8;
//         if (shouldClose) {
//           Animated.timing(sheetAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(() => {
//             setShowPaymentSheet(false);
//             setPaymentMethod('Mobile money');
//             setSelectedNetwork(mobileNetworks[0].name);
//             sheetAnim.setValue(height);
//           });
//         } else {
//           Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
//         }
//       },
//     })
//   ).current;

//   useEffect(() => {
//     (async () => {
//       const t = await AsyncStorage.getItem('userToken');
//       const userData = await AsyncStorage.getItem('userData');
//       if (!t) {
//         router.replace('/login');
//         return;
//       }
//       setToken(t);
//       if (userData) {
//         const parsed = JSON.parse(userData);
//         setUserEmail(parsed.email || '');
//       }
//     })();
//   }, [router]);

//   const fetchCommunities = async () => {
//     if (!token) return;
//     try {
//       setCommunitiesLoading(true);
//       const res = await fetch(`${BASE_URL}/communities/joined`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const json = await res.json();
//       setJoinedCommunities(res.ok && Array.isArray(json.data) ? json.data : []);
//     } catch (e) {
//       console.error('Communities error:', e);
//     } finally {
//       setCommunitiesLoading(false);
//     }
//   };

//   useEffect(() => { if (token) fetchCommunities(); }, [token]);

//   const fetchOfferings = async (id) => {
//     if (!id || !token) {
//       setOfferings([]);
//       return;
//     }
//     setOfferingsLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/offers/community/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const json = await res.json();
//       const list = res.ok && json.success && Array.isArray(json.data)
//         ? json.data.map(i => ({ id: String(i.id), name: i.name || 'General Offering' }))
//         : [];
//       setOfferings(list);
//     } catch (e) {
//       console.error('Offerings error:', e);
//     } finally {
//       setOfferingsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (location) fetchOfferings(location);
//     else {
//       setOfferings([]);
//       setOffering('');
//     }
//   }, [location]);

//   const handleAmountChange = (v) => {
//     const num = v.replace(/[^0-9]/g, '');
//     setAmount(num ? Number(num).toLocaleString() : '');
//   };

//   const showNotification = (type, msg) => {
//     setNotification({ visible: true, type, message: msg });
//     setTimeout(() => setNotification({ visible: false, type: '', message: '' }), 6000);
//   };

//   const openSheet = () => {
//     setShowPaymentSheet(true);
//     Animated.timing(sheetAnim, {
//       toValue: 0,
//       duration: 350,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeSheet = () => {
//     Animated.timing(sheetAnim, {
//       toValue: height,
//       duration: 300,
//       useNativeDriver: true,
//     }).start(() => {
//       setShowPaymentSheet(false);
//       setPaymentMethod('Mobile money');
//       setSelectedNetwork(mobileNetworks[0].name);
//     });
//   };

//   const openSuccess = () => {
//     setShowSuccessSheet(true);
//     Animated.timing(successAnim, {
//       toValue: 0,
//       duration: 350,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeSuccess = () => {
//     Animated.timing(successAnim, {
//       toValue: height,
//       duration: 300,
//       useNativeDriver: true,
//     }).start(() => {
//       setShowSuccessSheet(false);
//     });
//   };

//   // Dynamic sheet height: show full content for Mobile money (no scrolling needed), expanded for Card
//   const sheetHeight = paymentMethod === 'Mobile money' ? Math.min(height * 0.6, 520) : height * 0.92;

//   const openPaymentLink = async (url) => {
//     if (!url || typeof url !== 'string') return showNotification('error', 'Invalid payment link');
//     try {
//       if (Platform.OS === 'web') {
//         window.open(url.trim(), '_blank');
//       } else {
//         const supported = await Linking.canOpenURL(url);
//         if (supported) await Linking.openURL(url);
//         else await WebBrowser.openBrowserAsync(url);
//       }
//     } catch (err) {
//       showNotification('error', 'Could not open payment page');
//     }
//   };

//   const sendContribution = async () => {
//     if (!location || !amount || !offering || !mobileNumber) {
//       showNotification('error', 'Please fill all required fields');
//       return;
//     }

//     const rawAmount = Number(amount.replace(/,/g, ''));
//     if (rawAmount < 100) {
//       showNotification('error', 'Minimum amount is 100 TZS');
//       return;
//     }

//     setLoading(true);

//     let responseText = '';
//     let jsonData = {};

//     try {
//       if (paymentMethod === 'Card payment') {
//         const cardPayload = {
//           amount: rawAmount,
//           payTo: location,
//           transactionDetails: offering,
//           email: userEmail || `${mobileNumber}@tithe.app`,
//           communityId: location,
//           currency,
//           countryCode,
//           postalCode,
//           address: address || "Dar es Salaam, Tanzania",
//         };

//         const res = await fetch(`${BASE_URL}/payments/card`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(cardPayload),
//         });

//         const data = await res.json();
//         if (!res.ok || !data.success || !data.data?.paymentUrl) {
//           showNotification('error', data.message || 'Card payment failed');
//           setLoading(false);
//           return;
//         }

//         closeSheet();
//         showNotification('success', 'Redirecting to payment...');
//         setTimeout(() => openPaymentLink(data.data.paymentUrl), 800);
//         setLoading(false);
//         return;
//       }

//       const res = await fetch(`${BASE_URL}/contributions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           offerType: offering,
//           amount: rawAmount,
//           purpose: frequency,
//           phoneNo: mobileNumber.trim(),
//           communityId: location,
//           paymentMethod: selectedNetwork,
//           payTo: location,
//           transactionDetails: offering,
//           email: userEmail || `${mobileNumber}@tithe.app`,
//           currency,
//           countryCode,
//           postalCode,
//           address,
//         }),
//       });
// let msg = 'An unexpected error occurred.';

// try {
//   const raw = responseText; // responseText = await res.text()
//   const parsed = JSON.parse(raw);

//   if (
//     parsed &&
//     typeof parsed.response_desc === 'string' &&
//     parsed.response_desc.trim() !== ''
//   ) {
//     msg = parsed.response_desc;
//   }
// } catch (e) {
//   // Parsing failed — DO NOT expose raw response
// }

// showNotification('error', msg);
    

//       try {
//         jsonData = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         jsonData = {};
//       }

//     } catch (networkError) {
//       showNotification('error', 'Network error. Please check your connection.');
//       setLoading(false);
//       return;
//     }

//     const isSuccess = jsonData.response_code === "0" || String(jsonData.response_code) === "0";
//     const isNotEnoughFunds = jsonData.response_code === "9009" || jsonData.response_desc === "SENDER_NOT_ENOUGH_FUND";

//     if (isSuccess) {
//       showNotification('success', 'Payment request sent! Please approve on your phone.');
//       closeSheet();
//       openSuccess();
//       setAmount('');
//       setOffering('');
//       setMobileNumber('');
//       setLocation('');
//       setFrequency('One time');
//     } else if (isNotEnoughFunds) {
//       showNotification('error', 'Insufficient balance. Please top up and try again.');
//       closeSheet();
//     } else {
//      let msg = 'An unexpected error occurred, please try again later.';

// if (typeof jsonData?.response_desc === 'string' && jsonData.response_desc.trim()) {
//   msg = jsonData.response_desc;
// } else if (typeof jsonData?.message === 'string' && jsonData.message.trim()) {
//   msg = jsonData.message;
// }

//       showNotification('error', msg);
//       closeSheet();
//     }

//     setLoading(false);
//   };

//   const ModernDropdown = ({ label, items = [], value, onSelect, placeholder, disabled = false, loading = false }) => {
//     const [open, setOpen] = useState(false);
//     const selectedItem = items.find(i => i.id === value);
//     const displayText = loading ? 'Loading...' : selectedItem?.name || placeholder;

//     return (
//       <View style={styles.dropdownWrapper}>
//         <Text style={styles.label}>{label}</Text>
//         <TouchableOpacity
//           style={[styles.customDropdown, (disabled || loading) && styles.disabledDropdown]}
//           onPress={() => !disabled && !loading && setOpen(!open)}
//           disabled={disabled || loading}
//         >
//           <Text style={[styles.dropdownText, !value && !loading && styles.placeholderText]}>
//             {displayText}
//           </Text>
//           <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={GOLD} />
//         </TouchableOpacity>

//         {open && items.length > 0 && (
//           <View style={styles.dropdownMenu}>
//             <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
//               {items.map(item => (
//                 <TouchableOpacity
//                   key={item.id}
//                   style={styles.dropdownItem}
//                   onPress={() => {
//                     onSelect(item.id);
//                     setOpen(false);
//                   }}
//                 >
//                   <Text style={styles.dropdownItemText}>{item.name}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const isDisabled = !communitiesLoading && joinedCommunities.length === 0;

//   return (
//     <View style={styles.container}>
//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           refreshControl={<RefreshControl refreshing={communitiesLoading} onRefresh={fetchCommunities} colors={[GOLD]} />}
//         >
//           <View style={styles.header}>
//             <Text style={styles.title}>Give</Text>
//             <TouchableOpacity onPress={() => navigation.navigate('history')}>
//               <Ionicons name="receipt-outline" size={24} color={GOLD} />
//             </TouchableOpacity>
//           </View>

//           {notification.visible && (
//             <View style={[styles.toast, notification.type === 'success' ? styles.toastSuccess : styles.toastError]}>
//               <Text style={styles.toastText}>{notification.message}</Text>
//             </View>
//           )}

//           {isDisabled ? (
//             <View style={styles.emptyState}>
//               <Ionicons name="heart-outline" size={70} color={GOLD} />
//               <Text style={styles.emptyText}>Join a community first to give</Text>
//             </View>
//           ) : (
//             <>
//               <ModernDropdown label="Give to" items={joinedCommunities} value={location} onSelect={setLocation} placeholder="Select community" disabled={communitiesLoading} />
//               <ModernDropdown label="What's your offering?" items={offerings} value={offering} onSelect={setOffering} placeholder="Select offering" disabled={!location} loading={offeringsLoading} />

//               <Text style={styles.label}>Frequency</Text>
//               <View style={styles.freqRow}>
//                 {['One time', 'Weekly', 'Monthly'].map(f => (
//                   <TouchableOpacity key={f} style={[styles.freqBtn, frequency === f && styles.freqActive]} onPress={() => setFrequency(f)}>
//                     <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>{f}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <Text style={styles.label}>Amount</Text>
//               <View style={styles.amountBox}>
//                 <Text style={styles.currency}>TZS</Text>
//                 <TextInput
//                   style={styles.amountInput}
//                   value={amount}
//                   onChangeText={handleAmountChange}
//                   keyboardType="numeric"
//                   placeholder="0"
//                 />
//               </View>

//               <Text style={styles.label}>Phone Number</Text>
//               <TextInput
//                 style={styles.input}
//                 value={mobileNumber}
//                 onChangeText={setMobileNumber}
//                 placeholder="0712345678"
//                 keyboardType="phone-pad"
//                 maxLength={15}
//               />

//               <TouchableOpacity style={styles.continueBtn} onPress={openSheet}>
//                 <Text style={styles.continueText}>Continue</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* PERFECT BOTTOM SHEET - NO WHITE SPACE BELOW */}
//       <Modal visible={showPaymentSheet} transparent animationType="none">
//         {/* Dark overlay - tap outside to close */}
//         <TouchableWithoutFeedback onPress={closeSheet}>
//           <View style={styles.modalOverlay} />
//         </TouchableWithoutFeedback>

//         {/* Animated sheet - sticks to bottom with no gap */}
//         <Animated.View {...panResponder.panHandlers} style={[styles.sheet, { transform: [{ translateY: sheetAnim }], height: sheetHeight }]}>
//           <View style={styles.handle} />

//           <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//           >
//             <ScrollView
//               contentContainerStyle={styles.sheetContent}
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//             >
//               <Text style={styles.sheetTitle}>Confirm Contribution</Text>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Amount</Text>
//                 <Text style={styles.summaryValue}>TZS {amount}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Phone</Text>
//                 <Text style={styles.summaryValue}>{mobileNumber}</Text>
//               </View>

//               <Text style={styles.label}>Payment Method</Text>
//               <View style={styles.methodRow}>
//                 {['Mobile money', 'Card payment'].map(m => (
//                   <TouchableOpacity
//                     key={m}
//                     style={[styles.methodBtn, paymentMethod === m && styles.methodActive]}
//                     onPress={() => setPaymentMethod(m)}
//                   >
//                     <Text style={[styles.methodText, paymentMethod === m && styles.methodTextActive]}>
//                       {m === 'Mobile money' ? 'Mobile Money' : 'Card'}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//      <Text style={styles.label}>Choose mobile network</Text>
//               {paymentMethod === 'Mobile money' && (
//                 <View style={styles.networkRow}>
//                   {mobileNetworks.map(n => (
//                     <TouchableOpacity
//                       key={n.name}
//                       style={[styles.netBtn, selectedNetwork === n.name && styles.netActive]}
//                       onPress={() => setSelectedNetwork(n.name)}
//                     >
//                       <Image source={{ uri: n.logo }} style={styles.netLogo} />
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               )}

//               {paymentMethod === 'Card payment' && (
//                 <>
//                   <Text style={styles.label}>Email</Text>
//                   <TextInput
//                     style={styles.input}
//                     value={userEmail}
//                     onChangeText={setUserEmail}
//                     placeholder="you@example.com"
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                   />

//                   <Text style={styles.label}>Currency</Text>
//                   <View style={styles.currencyRow}>
//                     {['TZS', 'USD'].map(c => (
//                       <TouchableOpacity
//                         key={c}
//                         style={[styles.freqBtn, currency === c && styles.freqActive]}
//                         onPress={() => setCurrency(c)}
//                       >
//                         <Text style={[styles.freqText, currency === c && styles.freqTextActive]}>{c}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>

//                  <Text style={styles.label}>Country Code</Text>
// <TextInput
//   style={styles.input}
//   value={countryCode}
//   onChangeText={setCountryCode}
//   placeholder="Country code"
//   keyboardType="default"          // ← changed to normal text keyboard
//   autoCapitalize="characters"     // optional: makes it uppercase (good for +US, +UK...)
//   maxLength={5}                   // optional: most country codes are 2–4 chars (+1, +44, +380...)
// />

//                   <Text style={styles.label}>Postal Code</Text>
//                   <TextInput
//                     style={styles.input}
//                     value={postalCode}
//                     onChangeText={setPostalCode}
//                     placeholder="Postal code"
//                   />

//                   <Text style={styles.label}>Address</Text>
//                   <TextInput
//                     style={[styles.input, styles.multilineInput]}
//                     value={address}
//                     onChangeText={setAddress}
//                     placeholder="Street, City"
//                     multiline
//                     textAlignVertical="top"
//                   />
//                 </>
//               )}
// <TouchableOpacity
//   style={[styles.sendBtn, loading && { opacity: 0.6 }]}
//   onPress={sendContribution}
//   disabled={loading}
// >
//   {loading ? (
//     <ActivityIndicator size="small" color="#fff" />
//   ) : (
//     <Text style={styles.sendText}>Send Contribution</Text>
//   )}
// </TouchableOpacity>
//             </ScrollView>
//           </KeyboardAvoidingView>
//         </Animated.View>
//       </Modal>

//       {/* Success Sheet */}
//       <Modal visible={showSuccessSheet} transparent>
//         <TouchableWithoutFeedback onPress={closeSuccess}>
//           <View style={styles.modalOverlay}>
//             <Animated.View style={[styles.successSheet, { transform: [{ translateY: successAnim }] }]}>
//               <View style={styles.handle} />
//               <Ionicons name="checkmark-circle" size={80} color={GOLD} />
//               <Text style={styles.successTitle}>Thank You!</Text>
//               <Text style={styles.successMsg}>
//                 Payment request sent successfully!{'\n'}Please approve the prompt on your phone.
//               </Text>
//               <TouchableOpacity style={styles.doneBtn} onPress={closeSuccess}>
//                 <Text style={styles.doneText}>Done</Text>
//               </TouchableOpacity>
//             </Animated.View>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   scrollContent: { paddingHorizontal: 18, paddingTop: Platform.OS === 'android' ? 27 : 9, paddingBottom: 80 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
//   title: { fontSize: 20, fontWeight: 'bold', color: '#222' },
//   dropdownWrapper: { marginBottom: 12 },
//   label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 9 },
//   customDropdown: { height: 40, borderWidth: 1, borderColor: GOLD, borderRadius: 6, backgroundColor: '#fff', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   disabledDropdown: { opacity: 0.5 },
//   dropdownText: { fontSize: 14, color: '#333', fontWeight: '600' },
//   placeholderText: { color: '#999', fontWeight: 'normal' },
//   dropdownMenu: { marginTop: 4, borderWidth: 1, borderColor: GOLD, borderRadius: 6, backgroundColor: '#fff', maxHeight: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
//   dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
//   dropdownItemText: { fontSize: 14, color: '#333' },
//   freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
//   freqBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF4E5', borderRadius: 20 },
//   freqActive: { backgroundColor: GOLD },
//   freqText: { fontSize: 12, color: '#666' },
//   freqTextActive: { color: '#fff', fontWeight: 'bold' },
//   amountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: GOLD, borderRadius: 6, height: 70, paddingHorizontal: 12, backgroundColor: '#fff', marginTop: 8, justifyContent: 'center' },
//   currency: { fontSize: 12, color: '#666', marginBottom: 6 },
//   amountInput: { fontSize: 30, fontWeight: '500', color: '#000', textAlign: 'center', flex: 1 },
//   input: { height: 40, borderWidth: 1, borderColor: GOLD, borderRadius: 6, paddingHorizontal: 12, fontSize: 14, backgroundColor: '#fff', marginTop: 8 },
//   continueBtn: { backgroundColor: GOLD, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
//   continueText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   toast: { padding: 14, borderRadius: 10, marginVertical: 10, alignItems: 'center', marginHorizontal: 20 },
//   toastSuccess: { backgroundColor: '#d4edda', borderColor: '#c3e6cb', borderWidth: 1 },
//   toastError: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', borderWidth: 1 },
//   toastText: { fontSize: 14, fontWeight: '600', color: '#333' },
//   emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
//   emptyText: { marginTop: 20, fontSize: 16, color: '#888', textAlign: 'center' },

//   // Fixed Bottom Sheet - No white space below
//   modalOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//   },
//   sheet: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -5 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 30,
    
//   },
//   sendBtn: {
//   height: 48,
//   borderRadius: 8,
//   justifyContent: 'center',
//   alignItems: 'center',
//   backgroundColor: '#000',
// },

//   handle: {
//     width: 40,
//     height: 5,
//     backgroundColor: '#ccc',
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   sheetContent: {
//     paddingHorizontal: 24,
//     paddingBottom: 100, // Enough space for keyboard + button
//   },
//   sheetTitle: { fontSize: 19, fontWeight: 'bold', textAlign: 'center', marginVertical: 12, color: '#222' },
//   summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
//   summaryLabel: { fontSize: 14, color: '#666' },
//   summaryValue: { fontSize: 15, fontWeight: 'bold', color: '#222' },
//   methodRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
//   methodBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: '#f8f8f8', alignItems: 'center' },
//   methodActive: { backgroundColor: GOLD },
//   methodText: { fontSize: 15, fontWeight: '600', color: '#555' },
//   methodTextActive: { color: '#fff' },
//   networkRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
//   netBtn: { padding: 8 },
//   netActive: { borderWidth: 3, borderColor: GOLD, borderRadius: 14 },
//   netLogo: { width: 54, height: 54, borderRadius: 12 },
//   currencyRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 16 },
//   multilineInput: { height: 80, textAlignVertical: 'top' },
//   sendBtn: {
//     backgroundColor: GOLD,
//     padding: 18,
//     borderRadius: 14,
//     alignItems: 'center',
//     marginTop: 30,
//     marginBottom: 20,
//   },
//   sendText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

//   successSheet: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 32,
//     alignItems: 'center',
//   },
//   successTitle: { fontSize: 26, fontWeight: 'bold', color: GOLD, marginVertical: 12 },
//   successMsg: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
//   doneBtn: { backgroundColor: GOLD, paddingHorizontal: 50, paddingVertical: 16, borderRadius: 30 },
//   doneText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
// });
// app/main/contribution.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from 'react-native';
import { BASE_URL } from '../apiConfig';

const { height } = Dimensions.get('window');
const GOLD = '#E18731';

const mobileNetworks = [
  { name: 'HaloPesa', logo: 'https://portal.powertec.com.au/sites/default/files/styles/scale_square/public/2024-01/Viettel_Tanzania_Halotel_logo.png.webp?itok=1EgsL4zb' },
  { name: 'TigoPesa', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbiP_Qnuwr0BRypVtoHN3fFKwwxdd89_sqQw&s' },
  { name: 'AirtelMoney', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdtdumPWtXlSSZ_nEnxNzl2JLce4N7aPh-Jg&s' },
];

export default function GiveScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [offering, setOffering] = useState('');
  const [frequency, setFrequency] = useState('One time');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Mobile money');
  const [selectedNetwork, setSelectedNetwork] = useState(mobileNetworks[0].name);
  const [currency, setCurrency] = useState('TZS');
  const [countryCode, setCountryCode] = useState('TZ');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);

  // Beautiful toast state (same as LoginScreen)
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const sheetAnim = useRef(new Animated.Value(height)).current;
  const successAnim = useRef(new Animated.Value(height)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5 && Math.abs(gs.dx) < 10,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) sheetAnim.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        const shouldClose = gs.dy > height * 0.25 || gs.vy > 0.8;
        if (shouldClose) {
          Animated.timing(sheetAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(() => {
            setShowPaymentSheet(false);
            setPaymentMethod('Mobile money');
            setSelectedNetwork(mobileNetworks[0].name);
          });
        } else {
          Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

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
      console.error('Communities error:', e);
    } finally {
      setCommunitiesLoading(false);
    }
  };

  useEffect(() => { if (token) fetchCommunities(); }, [token]);

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
      console.error('Offerings error:', e);
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

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "error" }), 3500);
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
    Animated.timing(successAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => {
      setShowSuccessSheet(false);
    });
  };

  const sheetHeight = paymentMethod === 'Mobile money' ? Math.min(height * 0.6, 520) : height * 0.92;

  const openPaymentLink = async (url) => {
    if (!url || typeof url !== 'string') return showToast('Invalid payment link');
    try {
      if (Platform.OS === 'web') {
        window.open(url.trim(), '_blank');
      } else {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else await WebBrowser.openBrowserAsync(url);
      }
    } catch (err) {
      showToast('Could not open payment page');
    }
  };

  const sendContribution = async () => {
    if (!location || !amount || !offering || !mobileNumber) {
      showToast('Please fill all required fields');
      return;
    }

    const rawAmount = Number(amount.replace(/,/g, ''));
    if (rawAmount < 100) {
      showToast('Minimum amount is 100 TZS');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'Card payment') {
        const cardPayload = {
          amount: rawAmount,
          payTo: location,
          transactionDetails: offering,
          email: userEmail || `${mobileNumber}@tithe.app`,
          communityId: location,
          currency,
          countryCode,
          postalCode,
          address: address || "Dar es Salaam, Tanzania",
        };

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
          showToast(data.message || 'Card payment failed');
          setLoading(false);
          return;
        }

        closeSheet();
        showToast('Redirecting to payment...', 'success');
        setTimeout(() => openPaymentLink(data.data.paymentUrl), 800);
        setLoading(false);
        return;
      }

      // MOBILE MONEY PAYMENT - HANDLES BOTH API RESPONSE FORMATS
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
          payTo: location,
          transactionDetails: offering,
          email: userEmail || `${mobileNumber}@tithe.app`,
          currency,
          countryCode,
          postalCode,
          address,
        }),
      });

      let apiResponse = {};

      try {
        apiResponse = await res.json();
      } catch (parseError) {
        showToast('Invalid response from server');
        setLoading(false);
        return;
      }

      console.log('Full API Response:', apiResponse);

      let message = '';
      let isSuccess = false;

      // NEW FORMAT: { success: true, message: "...", data: {...} }
      if (apiResponse.success === true) {
        isSuccess = true;
        message = apiResponse.message || 'Contribution given successfully';
      }
      // OLD FORMAT: message contains wrapped JSON string
      else if (apiResponse.message && typeof apiResponse.message === 'string') {
        try {
          const innerMatch = apiResponse.message.match(/\{.*\}/);
          if (innerMatch) {
            const gateway = JSON.parse(innerMatch[0]);
            const code = gateway.response_code || gateway.responseCode;
            message = (gateway.response_desc || gateway.responseDesc || 'No description provided').trim();
            isSuccess = code === '0' || code === 0;
          } else {
            message = apiResponse.message.trim();
          }
        } catch (e) {
          message = apiResponse.message.trim();
        }
      }
      // Fallback
      else {
        message = 'An unexpected error occurred.';
      }

      if (isSuccess) {
        showToast(message, 'success');
        closeSheet();
        openSuccess();
        setAmount('');
        setOffering('');
        setMobileNumber('');
        setLocation('');
        setFrequency('One time');
      } else {
        showToast(message);
        closeSheet();
      }

    } catch (networkError) {
      console.error('Network error:', networkError);
      showToast('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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
    <View style={styles.container}>
      {/* Beautiful Toast */}
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={communitiesLoading} onRefresh={fetchCommunities} colors={[GOLD]} />}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Contribution</Text>
            <TouchableOpacity onPress={() => navigation.navigate('history')}>
              <Ionicons name="receipt-outline" size={24} color={GOLD} />
            </TouchableOpacity>
          </View>

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
                />
              </View>

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="0712345678"
                keyboardType="phone-pad"
                maxLength={15}
              />

              <TouchableOpacity style={styles.continueBtn} onPress={openSheet}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showPaymentSheet} transparent animationType="none">
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View {...panResponder.panHandlers} style={[styles.sheet, { transform: [{ translateY: sheetAnim }], height: sheetHeight }]}>
          <View style={styles.handle} />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.sheetTitle}>Confirm Contribution</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>TZS {amount}</Text>
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

              <Text style={styles.label}>Choose mobile network</Text>
              {paymentMethod === 'Mobile money' && (
                <View style={styles.networkRow}>
                  {mobileNetworks.map(n => (
                    <TouchableOpacity
                      key={n.name}
                      style={[styles.netBtn, selectedNetwork === n.name && styles.netActive]}
                      onPress={() => setSelectedNetwork(n.name)}
                    >
                      <Image source={{ uri: n.logo }} style={styles.netLogo} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {paymentMethod === 'Card payment' && (
                <>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={userEmail}
                    onChangeText={setUserEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.label}>Currency</Text>
                  <View style={styles.currencyRow}>
                    {['TZS', 'USD'].map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.freqBtn, currency === c && styles.freqActive]}
                        onPress={() => setCurrency(c)}
                      >
                        <Text style={[styles.freqText, currency === c && styles.freqTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Country Code</Text>
                  <TextInput
                    style={styles.input}
                    value={countryCode}
                    onChangeText={setCountryCode}
                    placeholder="Country code"
                    keyboardType="default"
                    autoCapitalize="characters"
                    maxLength={5}
                  />

                  <Text style={styles.label}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="Postal code"
                  />

                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Street, City"
                    multiline
                    textAlignVertical="top"
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.sendBtn, loading && { opacity: 0.6 }]}
                onPress={sendContribution}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendText}>Send Contribution</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      <Modal visible={showSuccessSheet} transparent>
        <TouchableWithoutFeedback onPress={closeSuccess}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.successSheet, { transform: [{ translateY: successAnim }] }]}>
              <View style={styles.handle} />
              <Ionicons name="checkmark-circle" size={80} color={GOLD} />
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successMsg}>
                Payment request sent successfully!{'\n'}Please approve the prompt on your phone.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={closeSuccess}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 18, paddingTop: Platform.OS === 'android' ? 27 : 9, paddingBottom: 80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  dropdownWrapper: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 9 },
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
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 20, fontSize: 16, color: '#888', textAlign: 'center' },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 30,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sheetTitle: { fontSize: 19, fontWeight: 'bold', textAlign: 'center', marginVertical: 12, color: '#222' },
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
  currencyRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 16 },
  multilineInput: { height: 80, textAlignVertical: 'top' },
  sendBtn: {
    backgroundColor: GOLD,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  sendText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  successSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: GOLD, marginVertical: 12 },
  successMsg: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  doneBtn: { backgroundColor: GOLD, paddingHorizontal: 50, paddingVertical: 16, borderRadius: 30 },
  doneText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Toast styles (same as LoginScreen)
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
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});