// // app/profile.jsx
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';
// import { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Animated,
//   Dimensions,
//   Image,
//   Modal,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { BASE_URL } from './apiConfig';
// import { fetchBase64Image } from './fetchBase64Image';

// // SAFELY import NetworkStatusProvider — fallback if missing
// let useNetwork = () => ({ isConnected: true });
// try {
//   const imported = require('../../components/NetworkStatusProvider');
//   if (imported && imported.useNetwork) useNetwork = imported.useNetwork;
// } catch {
//   console.warn('NetworkStatusProvider not found — using always-online fallback');
// }

// const { height } = Dimensions.get('window');
// const GOLD = '#E18731';
// const FALLBACK_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const router = useRouter();

//   const networkData = useNetwork();
//   const isConnected = networkData?.isConnected ?? true;

//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);

//   const [user, setUser] = useState({
//     firstName: '',
//     lastName: '',
//     phoneNo: '',
//     email: '',
//     accountVerified: false,
//     profileImage: FALLBACK_IMAGE,
//     profile_photo_filename: null,
//   });

//   // Toast
//   const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
//   const showToast = (message, type = 'error') => {
//     setToast({ visible: true, message, type });
//     setTimeout(() => setToast({ visible: false, message: '', type: 'error' }), 3800);
//   };

//   // Offline Bottom Sheet
//   const offlineSheetAnim = useRef(new Animated.Value(height)).current;
//   const [showOfflineSheet, setShowOfflineSheet] = useState(false);

//   const openOfflineSheet = () => {
//     if (showOfflineSheet) return;
//     setShowOfflineSheet(true);
//     Animated.timing(offlineSheetAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
//   };

//   const closeOfflineSheet = () => {
//     Animated.timing(offlineSheetAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() =>
//       setShowOfflineSheet(false),
//     );
//   };

//   // Success Sheet (profile picture)
//   const [showSuccessSheet, setShowSuccessSheet] = useState(false);
//   const [uploadedImageUrl, setUploadedImageUrl] = useState('');
//   const sheetAnim = useRef(new Animated.Value(height)).current;

//   const openSheet = () => {
//     setShowSuccessSheet(true);
//     Animated.timing(sheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
//   };

//   const closeSheet = () => {
//     Animated.timing(sheetAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => {
//       setShowSuccessSheet(false);
//       setUploadedImageUrl('');
//     });
//   };

//   // Delete Confirmation Sheet
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const deleteSheetAnim = useRef(new Animated.Value(height)).current;

//   const openDeleteSheet = () => {
//     setShowDeleteConfirm(true);
//     Animated.timing(deleteSheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
//   };

//   const closeDeleteSheet = () => {
//     Animated.timing(deleteSheetAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() =>
//       setShowDeleteConfirm(false),
//     );
//   };

//   useEffect(() => {
//     if (!isConnected) openOfflineSheet();
//     else closeOfflineSheet();
//   }, [isConnected]);

//   const fetchProfile = async () => {
//     if (!isConnected) {
//       showToast('No internet connection', 'error');
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) {
//         router.replace('/login');
//         return;
//       }

//       const res = await fetch(`${BASE_URL}/users/profile`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const json = await res.json();

//       if (json.success && json.data) {
//         const d = json.data;
//         const imageUri = d.profile_photo
//           ? (await fetchBase64Image(d.profile_photo)) || FALLBACK_IMAGE
//           : FALLBACK_IMAGE;

//         setUser({
//           firstName: d.firstName || '',
//           lastName: d.lastName || '',
//           phoneNo: d.phoneNo || '',
//           email: d.email || '',
//           accountVerified: !!d.accountVerified,
//           profile_photo_filename: d.profile_photo || null,
//           profileImage: imageUri,
//         });

//         if (imageUri !== FALLBACK_IMAGE) {
//           await AsyncStorage.setItem('ProfileImage', imageUri);
//         }
//       } else {
//         throw new Error(json.message || 'Failed to load profile');
//       }
//     } catch (err) {
//       console.error('Profile fetch error:', err);
//       showToast('Failed to load profile', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const uploadProfilePicture = async (localUri) => {
//     if (!isConnected || !localUri) return;

//     try {
//       setUploading(true);
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) return;

//       const formData = new FormData();
//       const fileName = localUri.split('/').pop() || `profile_${Date.now()}.jpg`;
//       const fileType = fileName.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
//       const uri = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;

//       formData.append('image', { uri, name: fileName, type: fileType });

//       const res = await fetch(`${BASE_URL}/users/profile/picture`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//         },
//         body: formData,
//       });

//       const json = await res.json();

//       if (json.success && json.data?.profile_photo) {
//         const filename = json.data.profile_photo;
//         const imageUri = (await fetchBase64Image(filename)) || FALLBACK_IMAGE;

//         setUser((prev) => ({
//           ...prev,
//           profileImage: imageUri,
//           profile_photo_filename: filename,
//         }));
//         await AsyncStorage.setItem('ProfileImage', imageUri);
//         setUploadedImageUrl(imageUri);
//         showToast('Profile picture updated!', 'success');
//         openSheet();
//         setTimeout(closeSheet, 3400);
//       } else {
//         throw new Error(json.message || 'Upload failed');
//       }
//     } catch (err) {
//       console.error('Upload failed:', err);
//       showToast('Failed to upload image', 'error');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDeleteAccount = async () => {
//     if (!isConnected) {
//       showToast('No internet connection', 'error');
//       closeDeleteSheet();
//       return;
//     }

//     try {
//       setLoading(true);
//       closeDeleteSheet();

//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) {
//         router.replace('/login');
//         return;
//       }

//       const res = await fetch(`${BASE_URL}/users/account/delete`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const json = await res.json();

//       if (json.success) {
//         showToast('Account deleted successfully', 'success');

//         // Clear storage
//         await AsyncStorage.multiRemove(['userToken', 'ProfileImage']);

//         // Let user see success message
//         await new Promise((resolve) => setTimeout(resolve, 1600));

//         // Redirect using Expo Router (this fixes the navigator error)
//         router.replace('/login');
//       } else {
//         throw new Error(json.message || 'Account deletion failed');
//       }
//     } catch (err) {
//       console.error('Delete account error:', err);
//       showToast(err.message || 'Failed to delete account', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pickImage = async () => {
//     try {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== 'granted') {
//         showToast('Gallery access denied', 'error');
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.7,
//       });

//       if (!result.canceled && result.assets?.[0]?.uri) {
//         const uri = result.assets[0].uri;
//         setUser((prev) => ({ ...prev, profileImage: uri }));
//         await AsyncStorage.setItem('ProfileImage', uri);
//         await uploadProfilePicture(uri);
//       }
//     } catch (err) {
//       showToast('Failed to pick image', 'error');
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, [isConnected]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const img = await AsyncStorage.getItem('ProfileImage');
//         if (img) setUser((prev) => ({ ...prev, profileImage: img }));
//       } catch {}
//     })();
//   }, []);

//   const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'User';

//   const ContactInfo = () => {
//     const hasPhone = !!user.phoneNo;
//     const hasEmail = !!user.email;
//     if (!hasPhone && !hasEmail) return null;

//     return (
//       <View style={styles.contactRow}>
//         {hasPhone && (
//           <View style={styles.contactItem}>
//             <Ionicons name="call-outline" size={14} color="#666" />
//             <Text style={styles.contactText}>{user.phoneNo}</Text>
//           </View>
//         )}
//         {hasEmail && (
//           <View style={[styles.contactItem, hasPhone && styles.contactItemWithSeparator]}>
//             <Ionicons name="mail-outline" size={14} color="#666" />
//             <Text style={styles.contactText}>{user.email}</Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* Toast */}
//       {toast.visible && (
//         <View style={styles.toastContainer}>
//           <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
//             <Ionicons
//               name={toast.type === 'success' ? 'checkmark-circle' : 'close-circle'}
//               size={22}
//               color="#fff"
//             />
//             <Text style={styles.toastText}>{toast.message}</Text>
//           </View>
//         </View>
//       )}

//       {/* Offline sheet */}
//       <Modal transparent visible={showOfflineSheet} onRequestClose={closeOfflineSheet}>
//         <TouchableWithoutFeedback onPress={closeOfflineSheet}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback>
//               <Animated.View style={[styles.offlineSheet, { transform: [{ translateY: offlineSheetAnim }] }]}>
//                 <View style={styles.sheetHandle} />
//                 <Ionicons name="wifi-off" size={70} color="#999" />
//                 <Text style={styles.offlineTitle}>No Internet Connection</Text>
//                 <Text style={styles.offlineSubtitle}>
//                   Your profile will load automatically when you're back online.
//                 </Text>
//                 <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
//                   <Text style={styles.retryText}>Retry Now</Text>
//                 </TouchableOpacity>
//               </Animated.View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="chevron-back" size={24} color="#000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Profile</Text>
//           <View style={{ width: 24 }} />
//         </View>

//         {loading ? (
//           <View style={styles.loading}>
//             <ActivityIndicator size="large" color={GOLD} />
//             <Text style={styles.loadingText}>Loading profile...</Text>
//           </View>
//         ) : (
//           <>
//             <View style={styles.profileHeader}>
//               <View style={styles.imageWrapper}>
//                 <Image source={{ uri: user.profileImage }} style={styles.avatar} defaultSource={{ uri: FALLBACK_IMAGE }} />
//                 <TouchableOpacity style={styles.editBtn} onPress={pickImage} disabled={uploading}>
//                   {uploading ? <ActivityIndicator size={14} color="#fff" /> : <Ionicons name="pencil" size={16} color="#fff" />}
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.name}>{fullName}</Text>
//               <ContactInfo />
//               {user.accountVerified && (
//                 <View style={styles.verifiedBadge}>
//                   <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
//                   <Text style={styles.verifiedText}>Verified Account</Text>
//                 </View>
//               )}
//             </View>

//             <View style={styles.group}>
//               <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
//                 <View style={styles.iconWrapper}>
//                   <Ionicons name="person-outline" size={22} color={GOLD} />
//                 </View>
//                 <Text style={styles.menuText}>Edit Profile Information</Text>
//                 <Ionicons name="chevron-forward" size={20} color="#666" />
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePasswordScreen')}>
//                 <View style={styles.iconWrapper}>
//                   <Ionicons name="key-outline" size={22} color={GOLD} />
//                 </View>
//                 <Text style={styles.menuText}>Change Password</Text>
//                 <Ionicons name="chevron-forward" size={20} color="#666" />
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangeCommunityScreen')}>
//                 <View style={styles.iconWrapper}>
//                   <Ionicons name="swap-horizontal-outline" size={22} color={GOLD} />
//                 </View>
//                 <Text style={styles.menuText}>Change Community</Text>
//                 <Ionicons name="chevron-forward" size={20} color="#666" />
//               </TouchableOpacity>
//             </View>

//             <View style={[styles.group, { marginTop: 32 }]}>
//               <TouchableOpacity style={[styles.menuItem, { justifyContent: 'center' }]} onPress={openDeleteSheet}>
//                 <Text
//                   style={{
//                     color: '#ff3b30',
//                     fontSize: 16,
//                     fontFamily: 'GothamBold',
//                     textAlign: 'center',
//                   }}
//                 >
//                   Delete Account
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </ScrollView>

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>powered by EvMak © 2026</Text>
//       </View>

//       {/* Success sheet – profile picture */}
//       <Modal transparent visible={showSuccessSheet} onRequestClose={closeSheet}>
//         <TouchableWithoutFeedback onPress={closeSheet}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback>
//               <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
//                 <View style={styles.sheetHandle} />
//                 {uploadedImageUrl && (
//                   <View style={styles.updatedData}>
//                     <Image source={{ uri: uploadedImageUrl }} style={styles.previewImage} resizeMode="cover" />
//                   </View>
//                 )}
//                 <TouchableOpacity style={styles.doneBtn} onPress={closeSheet}>
//                   <Text style={styles.doneText}>Done</Text>
//                 </TouchableOpacity>
//               </Animated.View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>

//       {/* Delete confirmation sheet */}
//       <Modal transparent visible={showDeleteConfirm} onRequestClose={closeDeleteSheet} animationType="fade">
//         <TouchableWithoutFeedback onPress={closeDeleteSheet}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback>
//               <Animated.View
//                 style={[
//                   styles.sheet,
//                   {
//                     transform: [{ translateY: deleteSheetAnim }],
//                     paddingBottom: Platform.OS === 'ios' ? 50 : 40,
//                   },
//                 ]}
//               >
//                 <View style={styles.sheetHandle} />

//                 <View style={styles.deleteIconContainer}>
//                   <Ionicons name="alert-circle" size={64} color="#ff3b30" />
//                 </View>

//                 <Text style={styles.deleteTitle}>Delete Account?</Text>

//                 <Text style={styles.deleteWarningText}>
//                   This action is permanent and cannot be undone. All your data, posts, comments, and account information will be permanently deleted.
//                 </Text>

//                 <View style={styles.buttonContainer}>
//                   <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
//                     <Text style={styles.confirmDeleteText}>Yes, Delete My Account</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity style={styles.cancelButton} onPress={closeDeleteSheet} activeOpacity={0.7}>
//                     <Text style={styles.cancelText}>Cancel</Text>
//                   </TouchableOpacity>
//                 </View>
//               </Animated.View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // ────────────────────────────────────────────────
// // Styles (unchanged from your original)
// // ────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#fff' },
//   scrollContent: { padding: 16, paddingBottom: 100 },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: Platform.OS === 'android' ? 20 : 0,
//     paddingHorizontal: 4,
//   },
//   headerTitle: { fontSize: 20, fontFamily: 'GothamBold', color: '#222' },
//   loading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
//   loadingText: { marginTop: 12, fontSize: 16, color: '#666', fontFamily: 'GothamMedium' },

//   profileHeader: {
//     alignItems: 'center',
//     paddingVertical: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//     marginBottom: 16,
//   },
//   imageWrapper: { position: 'relative', marginBottom: 12 },
//   avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: GOLD },
//   editBtn: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: GOLD,
//     borderRadius: 20,
//     padding: 6,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   name: { fontSize: 20, fontFamily: 'GothamBold', color: '#222', marginBottom: 6 },
//   contactRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 4 },
//   contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   contactItemWithSeparator: { paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: '#ddd' },
//   contactText: { fontSize: 14, color: '#666', fontFamily: 'GothamMedium' },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     marginTop: 10,
//   },
//   verifiedText: { marginLeft: 4, color: '#4CAF50', fontSize: 13, fontFamily: 'GothamMedium' },
//   group: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   iconWrapper: { width: 36, alignItems: 'center' },
//   menuText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#222', fontFamily: 'GothamMedium' },

//   toastContainer: {
//     position: 'absolute',
//     top: 60,
//     left: 20,
//     right: 20,
//     zIndex: 9999,
//     alignItems: 'center',
//   },
//   toast: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderRadius: 10,
//     gap: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.12,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   toastSuccess: { backgroundColor: '#4CAF50' },
//   toastError: { backgroundColor: '#FF3B30' },
//   toastText: { color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'GothamBold' },

//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   offlineSheet: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingTop: 20,
//     paddingHorizontal: 24,
//     paddingBottom: 40,
//     alignItems: 'center',
//   },
//   sheet: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingTop: 16,
//     paddingHorizontal: 24,
//     paddingBottom: 32,
//   },
//   sheetHandle: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
//   offlineTitle: { fontSize: 20, fontFamily: 'GothamBold', color: '#222', marginTop: 16 },
//   offlineSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 20 },
//   retryBtn: { marginTop: 24, backgroundColor: GOLD, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30 },
//   retryText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },

//   updatedData: { marginBottom: 24, alignItems: 'center' },
//   previewImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: GOLD, marginVertical: 16 },
//   doneBtn: { backgroundColor: GOLD, paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
//   doneText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },

//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//   },
//   footerText: { fontSize: 13, color: '#999', fontFamily: 'GothamMedium' },

//   deleteIconContainer: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
//   deleteTitle: {
//     fontSize: 24,
//     fontFamily: 'GothamBold',
//     color: '#222',
//     textAlign: 'center',
//     marginBottom: 12,
//     letterSpacing: -0.2,
//   },
//   deleteWarningText: {
//     fontSize: 15,
//     lineHeight: 23,
//     color: '#555',
//     textAlign: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 36,
//   },
//   buttonContainer: { width: '100%', gap: 14, marginTop: 8 },
//   confirmDeleteButton: {
//     backgroundColor: '#ff3b30',
//     paddingVertical: 16,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   confirmDeleteText: {
//     color: '#fff',
//     fontSize: 16,
//     fontFamily: 'GothamBold',
//     letterSpacing: -0.1,
//   },
//   cancelButton: {
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f8f8f8',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   cancelText: { color: '#333', fontSize: 16, fontFamily: 'GothamMedium' },
// });

// export default ProfileScreen;
// app/profile.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BASE_URL } from './apiConfig';
import { fetchBase64Image } from './fetchBase64Image';

// Network fallback
let useNetwork = () => ({ isConnected: true });
try {
  const imported = require('../../components/NetworkStatusProvider');
  if (imported && imported.useNetwork) useNetwork = imported.useNetwork;
} catch {}

const { height } = Dimensions.get('window');
const GOLD = '#E18731';
const DANGER_RED = '#ff3b30';
const FALLBACK_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const network = useNetwork();
  const isConnected = network?.isConnected ?? true;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phoneNo: '',
    email: '',
    accountVerified: false,
    profileImage: FALLBACK_IMAGE,
    profile_photo_filename: null,
  });

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const showToast = (msg, type = 'error') => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'error' }), 3800);
  };

  // Delete account bottom sheet
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const deleteAnim = useRef(new Animated.Value(height)).current;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openDeleteSheet = () => {
    setShowDeleteSheet(true);
    setPassword('');
    Animated.timing(deleteAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  };

  const closeDeleteSheet = () => {
    Animated.timing(deleteAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => {
      setShowDeleteSheet(false);
      setPassword('');
    });
  };

  // Offline sheet
  const offlineAnim = useRef(new Animated.Value(height)).current;
  const [showOffline, setShowOffline] = useState(false);

  const openOffline = () => {
    if (showOffline) return;
    setShowOffline(true);
    Animated.timing(offlineAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };

  const closeOffline = () => {
    Animated.timing(offlineAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() => setShowOffline(false));
  };

  useEffect(() => {
    !isConnected ? openOffline() : closeOffline();
  }, [isConnected]);

  const fetchProfile = async () => {
    if (!isConnected) {
      showToast('No internet connection', 'error');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return router.replace('/login');

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        const imgUri = d.profile_photo
          ? (await fetchBase64Image(d.profile_photo)) || FALLBACK_IMAGE
          : FALLBACK_IMAGE;

        setUser({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          phoneNo: d.phoneNo || '',
          email: d.email || '',
          accountVerified: !!d.accountVerified,
          profile_photo_filename: d.profile_photo || null,
          profileImage: imgUri,
        });

        if (imgUri !== FALLBACK_IMAGE) await AsyncStorage.setItem('ProfileImage', imgUri);
      } else {
        throw new Error(json.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (localUri) => {
    if (!isConnected || !localUri) return;

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showToast('Session expired. Please login again.', 'error');
        return;
      }

      const formData = new FormData();
      const fileName = localUri.split('/').pop() || `profile_${Date.now()}.jpg`;
      const fileType = fileName.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
      const uri = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;

      formData.append('image', { uri, name: fileName, type: fileType });

      const res = await fetch(`${BASE_URL}/users/profile/picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.data?.profile_photo) {
        const filename = json.data.profile_photo;
        const newImageUri = await fetchBase64Image(filename) || FALLBACK_IMAGE;

        setUser(prev => ({
          ...prev,
          profileImage: newImageUri,
          profile_photo_filename: filename,
        }));

        await AsyncStorage.setItem('ProfileImage', newImageUri);

        showToast('Profile picture updated successfully!', 'success');
      } else {
        throw new Error(json.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Failed to update profile picture', 'error');
      // Revert to previous cached image if exists
      const cached = await AsyncStorage.getItem('ProfileImage');
      if (cached) setUser(prev => ({ ...prev, profileImage: cached }));
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Gallery access denied. Please enable in settings.', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        // Show local preview immediately
        setUser(prev => ({ ...prev, profileImage: uri }));
        // Then upload
        await uploadProfilePicture(uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      showToast('Failed to pick image', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      showToast('Please enter your password', 'error');
      return;
    }

    if (!isConnected) {
      showToast('No internet connection', 'error');
      return;
    }

    try {
      setDeleting(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return router.replace('/login');

      const res = await fetch(`${BASE_URL}/users/account/delete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();

      if (json.success) {
        showToast('Account deleted successfully', 'success');

        await AsyncStorage.multiRemove(['userToken', 'ProfileImage']);

        await new Promise(r => setTimeout(r, 1400));

        router.replace('/login');
      } else {
        showToast(json.message || 'Incorrect password or deletion failed', 'error');
      }
    } catch (err) {
      showToast('Failed to delete account. Try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [isConnected]);

  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem('ProfileImage');
      if (cached) setUser(p => ({ ...p, profileImage: cached }));
    })();
  }, []);

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'User';

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            <Ionicons name={toast.type === 'success' ? 'checkmark-circle' : 'close-circle'} size={22} color="#fff" />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* Offline sheet */}
      <Modal transparent visible={showOffline} onRequestClose={closeOffline}>
        <TouchableWithoutFeedback onPress={closeOffline}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.offlineSheet, { transform: [{ translateY: offlineAnim }] }]}>
                <View style={styles.sheetHandle} />
                <Ionicons name="wifi-off" size={70} color="#999" />
                <Text style={styles.offlineTitle}>No Internet Connection</Text>
                <Text style={styles.offlineSubtitle}>
                  Your profile will load automatically when you're back online.
                </Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
                  <Text style={styles.retryText}>Retry Now</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatar}
                  defaultSource={{ uri: FALLBACK_IMAGE }}
                />
                <TouchableOpacity style={styles.editButton} onPress={pickImage} disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator size={14} color="#fff" />
                  ) : (
                    <Ionicons name="pencil" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.nameText}>{fullName}</Text>

              {user.accountVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Verified Account</Text>
                </View>
              )}
            </View>

            <View style={styles.menuGroup}>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
                <Ionicons name="person-outline" size={22} color={GOLD} style={styles.menuIcon} />
                <Text style={styles.menuText}>Edit Profile Information</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-password')}>
                <Ionicons name="key-outline" size={22} color={GOLD} style={styles.menuIcon} />
                <Text style={styles.menuText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-community')}>
                <Ionicons name="swap-horizontal-outline" size={22} color={GOLD} style={styles.menuIcon} />
                <Text style={styles.menuText}>Change Community</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.menuGroup, { marginTop: 32 }]}>
              <TouchableOpacity style={styles.deleteTrigger} onPress={openDeleteSheet}>
                <Text style={styles.deleteTriggerText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>powered by EvMak © 2026</Text>
      </View>

      {/* ─── Delete Account Bottom Sheet ──────────────────────────────────────── */}
      <Modal transparent visible={showDeleteSheet} animationType="fade" onRequestClose={closeDeleteSheet}>
        <TouchableWithoutFeedback onPress={closeDeleteSheet}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, justifyContent: 'flex-end' }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
            >
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: deleteAnim }] }]}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                  >
                    <View style={styles.sheetHandle} />

                    <View style={styles.warningHeader}>
                      <Ionicons name="alert-circle-sharp" size={64} color={DANGER_RED} />
                      <Text style={styles.deleteTitle}>Delete Account</Text>
                    </View>

                    <Text style={styles.warningIntro}>
                      All your data will be permanently deleted including:
                    </Text>

                    <View style={styles.bulletList}>
                      <Text style={styles.bulletItem}>• Profile & personal information</Text>
                      <Text style={styles.bulletItem}>• Transaction history</Text>
                     
                      <Text style={styles.bulletItem}>• All your followed communities</Text>
                     
                    </View>

                    <Text style={styles.inputLabel}>
                      Enter your password to confirm <Text style={{ color: DANGER_RED }}>*</Text>
                    </Text>

                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#777" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.cancelButton} onPress={closeDeleteSheet}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.continueButton, deleting && styles.continueDisabled]}
                        onPress={handleDeleteAccount}
                        disabled={deleting || !password.trim()}
                      >
                        {deleting ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.continueButtonText}>Continue</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </Animated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16, paddingBottom: 140 },

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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  toastSuccess: { backgroundColor: '#4CAF50' },
  toastError: { backgroundColor: DANGER_RED },
  toastText: { color: '#fff', fontSize: 15, fontFamily: 'GothamMedium' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 20 : 16,
    paddingHorizontal: 4,
  },
  headerTitle: { fontSize: 20, fontFamily: 'GothamBold', color: '#222' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666', fontFamily: 'GothamMedium' },

  profileHeader: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 16 },
  imageWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: GOLD },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: GOLD,
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nameText: { fontSize: 20, fontFamily: 'GothamBold', color: '#222', marginBottom: 6 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  verifiedText: { marginLeft: 4, color: '#4CAF50', fontSize: 13, fontFamily: 'GothamMedium' },

  menuGroup: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuIcon: { marginRight: 16 },
  menuText: { flex: 1, fontSize: 15, color: '#222', fontFamily: 'GothamMedium' },

  deleteTrigger: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff5f5',
  },
  deleteTriggerText: { color: DANGER_RED, fontSize: 16, fontFamily: 'GothamBold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: height * 0.88,
  },
  sheetHandle: { width: 42, height: 5, backgroundColor: '#ddd', borderRadius: 3, alignSelf: 'center', marginBottom: 16 },

  warningHeader: { alignItems: 'center', marginTop: 12, marginBottom: 20 },
  deleteTitle: { fontSize: 26, fontFamily: 'GothamBold', color: DANGER_RED, marginTop: 12 },

  warningIntro: { fontSize: 15.5, color: '#333', textAlign: 'center', marginBottom: 20, lineHeight: 22 },

  bulletList: { marginBottom: 28 },
  bulletItem: { fontSize: 15, color: '#444', lineHeight: 24, paddingLeft: 8, marginBottom: 6 },

  inputLabel: { fontSize: 15, color: '#333', marginBottom: 10, fontFamily: 'GothamMedium' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 28,
  },
  passwordInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16 },
  eyeButton: { paddingHorizontal: 16 },

  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, color: '#555', fontFamily: 'GothamBold' },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: DANGER_RED,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueDisabled: { opacity: 0.6 },
  continueButtonText: { color: '#fff', fontSize: 16, fontFamily: 'GothamBold' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  footerText: { fontSize: 13, color: '#999', fontFamily: 'GothamMedium' },
});

export default ProfileScreen;