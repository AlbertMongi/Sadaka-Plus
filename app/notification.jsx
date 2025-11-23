import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from './apiConfig';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const GOLD = '#E18731'; // Match MorePage

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/notifications/user/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const hasUnread = notifications.some((n) => !n.readAt);

  // === OPEN SHEET ===
  const openSheet = (item) => {
    setSelected(item);
    setSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // === CLOSE SHEET ===
  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSheetVisible(false);
      setSelected(null);
    });
  };

  // === PAN RESPONDER (DRAG TO CLOSE) ===
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          sheetAnim.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(sheetAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => openSheet(item)}
      style={[
        styles.notificationCard,
        !item.readAt && styles.unreadNotification,
      ]}
    >
      <View style={styles.notificationHeader}>
        <Text
          style={[
            styles.notificationTitle,
            !item.readAt && { color: '#FF8C00' },
          ]}
        >
          {item.title || 'Untitled'}
        </Text>
        {!item.readAt && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.notificationMessage} numberOfLines={2}>
        {item.message || 'No message'}
      </Text>
      <Text style={styles.notificationDate}>
        {new Date(item.createdAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('main/index1');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {hasUnread && <View style={styles.headerDot} />}
        </View>

        <View style={{ width: 20 }} />
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 50 }} />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#FF8C00" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>
            Once you receive notifications, they’ll appear here.
          </Text>
        </View>
      )}

      {/* === CUSTOM BOTTOM SHEET (like MorePage) === */}
      <Modal transparent visible={sheetVisible} onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={sheetStyles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  sheetStyles.sheetContainer,
                  { transform: [{ translateY: sheetAnim }] },
                ]}
                {...panResponder.panHandlers}
              >
                <View style={sheetStyles.sheetHandle} />
                <Text style={sheetStyles.sheetTitle}>
                  {selected?.title || 'Notification'}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={sheetStyles.message}>
                    {selected?.message || 'No message'}
                  </Text>
                  <Text style={sheetStyles.date}>
                    {selected?.createdAt
                      ? new Date(selected.createdAt).toLocaleString(undefined, {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })
                      : ''}
                  </Text>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

/* === ORIGINAL STYLES === */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerDot: {
    marginLeft: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  unreadNotification: {
    borderColor: '#FF8C00',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF8C00',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#444',
    marginBottom: 6,
  },
  notificationDate: {
    fontSize: 10,
    color: '#888',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  emptySubText: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

/* === BOTTOM SHEET STYLES (MATCH MorePage) === */
const sheetStyles = StyleSheet.create({
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
    maxHeight: SCREEN_HEIGHT * 0.85,
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
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'GothamBold',
  },
  message: {
    fontSize: 14.5,
    color: '#444',
    lineHeight: 23,
    marginBottom: 12,
    fontFamily: 'GothamMedium',
  },
  date: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    fontFamily: 'GothamMedium',
  },
});