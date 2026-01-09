// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Dimensions,
//   Image,
//   SafeAreaView,
//   Share,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   ScrollView,
//   Modal,
//   Animated,
//   Easing,
// } from 'react-native';
// import { BASE_URL } from './apiConfig';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// const ORANGE = '#FF6B00';
// const GOLD = '#FF9F0D';
// const FALLBACK_IMAGE =
//   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';
// const IMAGE_HORIZONTAL_PADDING = 16;

// // ──────────────────────────────────────────────────────────────
// // SUCCESS BOTTOM SHEET (unchanged)
// // ──────────────────────────────────────────────────────────────
// const SuccessBottomSheet = ({ visible, message, onClose }) => {
//   const translateY = useRef(new Animated.Value(300)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.timing(translateY, {
//         toValue: 0,
//         duration: 400,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: true,
//       }).start();

//       const timer = setTimeout(() => {
//         closeSheet();
//       }, 2000);
//       return () => clearTimeout(timer);
//     } else {
//       translateY.setValue(300);
//     }
//   }, [visible]);

//   const closeSheet = () => {
//     Animated.timing(translateY, {
//       toValue: 300,
//       duration: 300,
//       useNativeDriver: true,
//     }).start(() => {
//       onClose();
//     });
//   };

//   return (
//     <Modal transparent visible={visible} animationType="none" onRequestClose={closeSheet}>
//       <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeSheet}>
//         <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
//           <View style={styles.sheetContent}>
//             <View style={styles.successIconContainer}>
//               <Ionicons name="checkmark-circle" size={48} color={GOLD} />
//             </View>
//             <Text style={styles.sheetTitle}>Success!</Text>
//             <Text style={styles.sheetMessage}>{message}</Text>
//           </View>
//         </Animated.View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // CONFIRMATION BOTTOM SHEET (NEW)
// // ──────────────────────────────────────────────────────────────
// const ConfirmBottomSheet = ({ visible, onConfirm, onCancel, isAttending }) => {
//   const translateY = useRef(new Animated.Value(300)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.timing(translateY, {
//         toValue: 0,
//         duration: 350,
//         easing: Easing.out(Easing.quad),
//         useNativeDriver: true,
//       }).start();
//     } else {
//       translateY.setValue(300);
//     }
//   }, [visible]);

//   const close = () => {
//     Animated.timing(translateY, {
//       toValue: 300,
//       duration: 250,
//       useNativeDriver: true,
//     }).start(onCancel);
//   };

//   return (
//     <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
//       <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={close}>
//         <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
//           <View style={styles.confirmContent}>
//             <Ionicons
//               name={isAttending ? 'checkmark-circle-outline' : 'close-circle-outline'}
//               size={56}
//               color={isAttending ? ORANGE : '#999'}
//             />
//             <Text style={styles.confirmTitle}>
//               {isAttending ? 'Confirm Attendance' : 'Cancel Attendance'}
//             </Text>
//             <Text style={styles.confirmMessage}>
//               Are you sure you want to {isAttending ? 'attend' : 'cancel your attendance for'} this event?
//             </Text>

//             <View style={styles.confirmButtons}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={close}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.confirmBtn, { backgroundColor: isAttending ? ORANGE : '#ff4444' }]}
//                 onPress={onConfirm}
//               >
//                 <Text style={styles.confirmBtnText}>
//                   {isAttending ? 'Yes, Attend' : 'Yes, Cancel'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Animated.View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// export default function EventDetailScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const [eventData, setEventData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Bottom sheets state
//   const [successSheetVisible, setSuccessSheetVisible] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');

//   const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);
//   const [pendingAttendanceAction, setPendingAttendanceAction] = useState(null); // true = attend, false = cancel

//   const eventId = route?.params?.id;

//   // ... (fetchEventDetails useEffect stays exactly the same)

//   useEffect(() => {
//     if (!eventId || typeof eventId !== 'string') {
//       setError('No valid event ID provided.');
//       setLoading(false);
//       navigation.navigate('main', { screen: 'events' });
//       return;
//     }

//     const fetchEventDetails = async (retries = 3, delay = 1000) => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         if (!token) return;

//         for (let attempt = 1; attempt <= retries; attempt++) {
//           try {
//             const response = await fetch(`${BASE_URL}/events/${eventId}`, {
//               method: 'GET',
//               headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//               },
//             });

//             const json = await response.json();

//             if (json.code === 200 && json.success && json.data) {
//               setEventData({
//                 ...json.data,
//                 imageUrl: json.data.imageUrl || FALLBACK_IMAGE,
//               });
//               return;
//             }
//           } catch (err) {
//             if (attempt === retries) throw err;
//             await new Promise((resolve) => setTimeout(resolve, delay));
//           }
//         }
//       } catch (err) {
//         setError(err.message || 'Failed to load event.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEventDetails();
//   }, [eventId, navigation]);

//   // ── OPEN CONFIRMATION SHEET ─────────────────────
//   const openConfirmSheet = (willAttend) => {
//     setPendingAttendanceAction(willAttend);
//     setConfirmSheetVisible(true);
//   };

//   // ── ACTUAL ATTENDANCE API CALL (after confirmation) ─────────────────────
//   const performAttendanceAction = async () => {
//     if (!eventId || isProcessing || pendingAttendanceAction === null) return;

//     setIsProcessing(true);
//     setConfirmSheetVisible(false);

//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) {
//         navigation.navigate('GetStarted');
//         return;
//       }

//       const response = await fetch(`${BASE_URL}/events/notify/${eventId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const json = await response.json();

//       if (json.success && json.data && typeof json.data.attended === 'boolean') {
//         const willAttend = json.data.attended;

//         setEventData((prev) => ({
//           ...prev,
//           attended: willAttend,
//         }));

//         setSuccessMessage(
//           willAttend
//             ? 'You have confirmed your attendance!'
//             : 'Attendance cancelled.'
//         );
//         setSuccessSheetVisible(true);
//       }
//     } catch (err) {
//       if (err.message.includes('Unauthorized')) {
//         navigation.navigate('GetStarted');
//       }
//     } finally {
//       setIsProcessing(false);
//       setPendingAttendanceAction(null);
//     }
//   };

//   const handleShare = async () => {
//     if (!eventData) return;

//     try {
//       await Share.share({
//         message: `Join me at ${eventData.name}! ${eventData.description} on ${new Date(eventData.eventDate).toLocaleDateString()}. Location: ${eventData.street}, ${eventData.district}, ${eventData.region}.`,
//         title: eventData.name,
//       });
//     } catch (error) {
//       console.error('Share failed:', error);
//     }
//   };

//   // ── RENDER ─────────────────────────────────────
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={ORANGE} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !eventData) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.loadingContainer}>
//           <Text style={styles.errorText}>{error || 'Event not found.'}</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* TOP BAR */}
//       <View style={styles.topBar}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.navigate('main', { screen: 'events' })}
//         >
//           <Ionicons name="chevron-back" size={24} color="#000" />
//         </TouchableOpacity>

//         <Text style={styles.mainTitle}>{eventData.name}</Text>

//         <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
//           <Ionicons name="arrow-up" size={22} color="#000" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//         {/* HERO IMAGE */}
//         <View style={styles.imageContainer}>
//           <Image source={{ uri: eventData.imageUrl }} style={styles.heroImage} resizeMode="cover" />
//           <View style={styles.imageOverlay} />
//         </View>

//         {/* LOCATION & DATE */}
//         <View style={styles.detailRow}>
//           <Ionicons name="location-outline" size={16} color={ORANGE} />
//           <Text style={styles.detailText}>
//             {`${eventData.street}, ${eventData.district}, ${eventData.region}`}
//           </Text>
//         </View>
//         <View style={styles.detailRow}>
//           <Ionicons name="calendar-outline" size={16} color={ORANGE} />
//           <Text style={styles.detailText}>
//             {new Date(eventData.eventDate).toLocaleDateString(undefined, {
//               weekday: 'long',
//               year: 'numeric',
//               month: 'long',
//               day: 'numeric',
//             })}
//           </Text>
//         </View>

//         {/* ACTION BUTTONS */}
//         <View style={styles.buttonContainer}>
//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={[styles.actionBtn, isProcessing && styles.disabledBtn]}
//               onPress={() => openConfirmSheet(!eventData.attended)} // toggle intent
//               disabled={isProcessing}
//             >
//               <Ionicons
//                 name={eventData.attended ? 'close-circle-outline' : 'checkmark-circle-outline'}
//                 size={20}
//                 color={ORANGE}
//               />
//               <Text style={styles.actionText}>
//                 {eventData.attended ? 'Cancel' : 'Attend'}
//               </Text>
//               {isProcessing && (
//                 <ActivityIndicator size="small" color={ORANGE} style={{ marginLeft: 8 }} />
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
//               <Ionicons name="share-social-outline" size={20} color={ORANGE} />
//               <Text style={styles.actionText}>Share</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* DESCRIPTION */}
//         <Text style={styles.description}>
//           {eventData.description || 'No description provided.'}
//         </Text>
//       </ScrollView>

//       {/* SUCCESS BOTTOM SHEET */}
//       <SuccessBottomSheet
//         visible={successSheetVisible}
//         message={successMessage}
//         onClose={() => setSuccessSheetVisible(false)}
//       />

//       {/* CONFIRMATION BOTTOM SHEET */}
//       <ConfirmBottomSheet
//         visible={confirmSheetVisible}
//         isAttending={pendingAttendanceAction === true}
//         onConfirm={performAttendanceAction}
//         onCancel={() => {
//           setConfirmSheetVisible(false);
//           setPendingAttendanceAction(null);
//         }}
//       />
//     </SafeAreaView>
//   );
// }

// // ──────────────────────────────────────────────────────────────
// // STYLES (added styles for confirmation sheet)
// // ──────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#fff' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorText: { fontSize: 16, color: 'red', fontFamily: 'GothamMedium' },
//   topBar: {
//     height: 56,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     borderBottomColor: '#eee',
//   },
//   backButton: { width: 36, height: 36, justifyContent: 'center' },
//   mainTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111',
//     fontFamily: 'GothamBold',
//     flex: 1,
//     textAlign: 'center',
//     marginRight: 36,
//   },
//   shareButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
//   scrollContent: { paddingBottom: 100 },
//   imageContainer: {
//     position: 'relative',
//     width: SCREEN_WIDTH - 2 * IMAGE_HORIZONTAL_PADDING,
//     height: 240,
//     marginHorizontal: IMAGE_HORIZONTAL_PADDING,
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   heroImage: { width: '100%', height: '100%' },
//   imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16 },
//   detailRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
//   detailText: { fontSize: 14, color: '#666', marginLeft: 8, fontFamily: 'GothamMedium' },
//   buttonContainer: { paddingHorizontal: 16, marginBottom: 24 },
//   actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
//   actionBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f5f5f5',
//     paddingVertical: 14,
//     borderRadius: 20,
//     marginHorizontal: 6,
//   },
//   disabledBtn: { opacity: 0.7 },
//   actionText: { fontSize: 14, marginLeft: 8, fontWeight: '600', fontFamily: 'GothamBold', color: ORANGE },
//   description: { fontSize: 15, color: '#333', lineHeight: 23, paddingHorizontal: 16, fontFamily: 'GothamMedium' },

//   // Bottom sheet common
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   bottomSheet: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingHorizontal: 24,
//     paddingTop: 24,
//     paddingBottom: 40,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 10,
//   },

//   // Success sheet
//   sheetContent: { alignItems: 'center' },
//   successIconContainer: { marginBottom: 16 },
//   sheetTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8, fontFamily: 'GothamBold' },
//   sheetMessage: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, fontFamily: 'GothamMedium' },

//   // Confirmation sheet
//   confirmContent: { alignItems: 'center' },
//   confirmTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginTop: 16, marginBottom: 8 },
//   confirmMessage: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
//   confirmButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
//   cancelBtn: {
//     flex: 1,
//     paddingVertical: 14,
//     marginRight: 12,
//     backgroundColor: '#eee',
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#555' },
//   confirmBtn: {
//     flex: 1,
//     paddingVertical: 14,
//     marginLeft: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   confirmBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
// });


import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { BASE_URL } from './apiConfig';
import { fetchBase64Image } from './fetchBase64Image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORANGE = '#FF6B00';
const GOLD = '#FF9F0D';
const FALLBACK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';
const IMAGE_HORIZONTAL_PADDING = 16;

// ──────────────────────────────────────────────────────────────
// SUCCESS BOTTOM SHEET
// ──────────────────────────────────────────────────────────────
const SuccessBottomSheet = ({ visible, message, onClose }) => {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => closeSheet(), 2200);
      return () => clearTimeout(timer);
    } else {
      translateY.setValue(300);
    }
  }, [visible]);

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={closeSheet}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeSheet}>
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={48} color={GOLD} />
            </View>
            <Text style={styles.sheetTitle}>Success!</Text>
            <Text style={styles.sheetMessage}>{message}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ──────────────────────────────────────────────────────────────
// CONFIRMATION BOTTOM SHEET
// ──────────────────────────────────────────────────────────────
const ConfirmBottomSheet = ({ visible, onConfirm, onCancel, isAttending }) => {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(300);
    }
  }, [visible]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(onCancel);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={close}>
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
          <View style={styles.confirmContent}>
            <Ionicons
              name={isAttending ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={56}
              color={isAttending ? ORANGE : '#999'}
            />
            <Text style={styles.confirmTitle}>
              {isAttending ? 'Confirm Attendance' : 'Cancel Attendance'}
            </Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to {isAttending ? 'attend' : 'cancel your attendance for'} this event?
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: isAttending ? ORANGE : '#ff4444' }]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmBtnText}>
                  {isAttending ? 'Yes, Attend' : 'Yes, Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
export default function EventDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [successSheetVisible, setSuccessSheetVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);
  const [pendingAttendanceAction, setPendingAttendanceAction] = useState(null);

  const eventId = route?.params?.id;

  useEffect(() => {
    if (!eventId || typeof eventId !== 'string') {
      setError('No valid event ID provided.');
      setLoading(false);
      navigation.navigate('main', { screen: 'events' });
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          navigation.navigate('GetStarted');
          return;
        }

        const response = await fetch(`${BASE_URL}/events/${eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (json.code === 200 && json.success && json.data) {
          let processedImage = FALLBACK_IMAGE;

          const rawImage = json.data.imageUrl || json.data.image || json.data.photo;
          if (rawImage) {
            processedImage = (await fetchBase64Image(rawImage)) || FALLBACK_IMAGE;
          }

          setEventData({
            ...json.data,
            displayImage: processedImage,
          });
        } else {
          throw new Error('Invalid response');
        }
      } catch (err) {
        console.log('Fetch event error:', err);
        setError(err.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, navigation]);

  const openConfirmSheet = (willAttend) => {
    setPendingAttendanceAction(willAttend);
    setConfirmSheetVisible(true);
  };

  const performAttendanceAction = async () => {
    if (!eventId || isProcessing || pendingAttendanceAction === null) return;

    setIsProcessing(true);
    setConfirmSheetVisible(false);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('GetStarted');
        return;
      }

      const response = await fetch(`${BASE_URL}/events/notify/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (json.success && json.data && typeof json.data.attended === 'boolean') {
        const willAttend = json.data.attended;

        setEventData((prev) => ({
          ...prev,
          attended: willAttend,
        }));

        setSuccessMessage(
          willAttend ? 'You have confirmed your attendance!' : 'Attendance cancelled.'
        );
        setSuccessSheetVisible(true);
      }
    } catch (err) {
      if (err.message?.includes('Unauthorized')) {
        navigation.navigate('GetStarted');
      }
    } finally {
      setIsProcessing(false);
      setPendingAttendanceAction(null);
    }
  };

  const handleShare = async () => {
    if (!eventData) return;

    try {
      const eventDate = new Date(eventData.eventDate);

      const formattedDate = eventDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const formattedTime = eventDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const location = [eventData.street, eventData.district, eventData.region]
        .filter(Boolean)
        .join(', ') || 'Location TBA';

      // Shortened description (first part only)
      const shortDesc = eventData.description
        ? eventData.description.substring(0, 140) + (eventData.description.length > 140 ? '...' : '')
        : 'No description provided';

      const message = 
        `${eventData.name || 'Event'}\n\n` +
        `📅 ${formattedDate} • ${formattedTime}\n` +
        `📍 ${location}\n\n` +
        `${shortDesc}`;

      const shareOptions = {
        message: message,
        title: eventData.name || 'Event',
      };

      // Try to share the image (best effort)
      if (eventData.displayImage && eventData.displayImage !== FALLBACK_IMAGE) {
        shareOptions.url = eventData.displayImage;
      }

      await Share.share(shareOptions, {
        dialogTitle: `Share ${eventData.name || 'this event'}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !eventData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error || 'Event not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('main', { screen: 'bible' })}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.mainTitle} numberOfLines={1}>
          {eventData.name}
        </Text>
{/* 
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={22} color="#000" />
        </TouchableOpacity> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: eventData.displayImage }}
            style={styles.heroImage}
            resizeMode="cover"
            defaultSource={{ uri: FALLBACK_IMAGE }}
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* LOCATION & DATE */}
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={ORANGE} />
          <Text style={styles.detailText}>
            {eventData.street}, {eventData.district}, {eventData.region}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={ORANGE} />
          <Text style={styles.detailText}>
            {new Date(eventData.eventDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, isProcessing && styles.disabledBtn]}
              onPress={() => openConfirmSheet(!eventData.attended)}
              disabled={isProcessing}
            >
              <Ionicons
                name={eventData.attended ? 'close-circle-outline' : 'checkmark-circle-outline'}
                size={20}
                color={ORANGE}
              />
              <Text style={styles.actionText}>
                {eventData.attended ? 'Cancel' : 'Attend'}
              </Text>
              {isProcessing && (
                <ActivityIndicator size="small" color={ORANGE} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={ORANGE} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.description}>
          {eventData.description || 'No description provided.'}
        </Text>
      </ScrollView>

      <SuccessBottomSheet
        visible={successSheetVisible}
        message={successMessage}
        onClose={() => setSuccessSheetVisible(false)}
      />

      <ConfirmBottomSheet
        visible={confirmSheetVisible}
        isAttending={pendingAttendanceAction === true}
        onConfirm={performAttendanceAction}
        onCancel={() => {
          setConfirmSheetVisible(false);
          setPendingAttendanceAction(null);
        }}
      />
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', padding: 20 },

  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
  },
  shareButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingBottom: 80 },

  imageContainer: {
    width: SCREEN_WIDTH - 2 * IMAGE_HORIZONTAL_PADDING,
    height: 240,
    marginHorizontal: IMAGE_HORIZONTAL_PADDING,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  heroImage: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },

  buttonContainer: {
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5eb',
    paddingVertical: 14,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: ORANGE + '40',
  },
  disabledBtn: { opacity: 0.6 },
  actionText: {
    fontSize: 14,
    color: ORANGE,
    fontWeight: '600',
    marginLeft: 8,
  },

  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 40,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  sheetContent: { alignItems: 'center' },
  successIconContainer: { marginBottom: 16 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8 },
  sheetMessage: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },

  confirmContent: { alignItems: 'center' },
  confirmTitle: { fontSize: 21, fontWeight: '700', color: '#111', marginTop: 16, marginBottom: 8 },
  confirmMessage: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  confirmButtons: { flexDirection: 'row', width: '100%', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#444' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});