import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const BASE_URL = 'https://sadaka-plus-api.ludovick.site';
const ORANGE = '#E18731';
const GOLD = '#E18731'; // For success icon

const PAYMENT_METHODS = [
  {
    id: '97499d34-b1ca-4c79-9a07-2e9707255325',
    title: 'Mobile Network',
    description: 'Yas, Vodacom, Airtel, Halotel',
    icon: 'phone-portrait-outline',
    color: '#00A859',
  },
  {
    id: 'e2015d60-983d-461f-8ff3-86348cc8cf79',
    title: 'Credit/Debit card',
    description: 'Visa, MasterCard, American Express',
    icon: 'card-outline',
    color: '#4A90E2',
  },
];

export default function PaymentMethodScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);

  // Bottom Sheet Animation
  const sheetAnim = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setShowSuccessSheet(true);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSuccessSheet(false);
      router.back();
    });
  };

  const saveDefaultMethod = async () => {
    if (!selectedMethod) {
      alert('Please choose a payment method.');
      return;
    }

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        alert('Please log in again.');
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/payments/method/default/${selectedMethod}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const json = await response.json();

      if (json.success || json.code === 200) {
        openSheet(); // Show success sheet instead of alert
      } else {
        throw new Error(json.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert(err.message || 'Could not save method');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Method</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Payment Method</Text>
          <Text style={styles.headerSubtitle}>
            Select how you'd like to make your contribution
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsContainer}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: method.color + '20' },
                  ]}
                >
                  <Ionicons name={method.icon} size={28} color={method.color} />
                </View>
                <View style={styles.methodText}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodDesc}>{method.description}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.radio,
                  selectedMethod === method.id && styles.radioSelected,
                ]}
              >
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!selectedMethod || saving) && styles.disabledButton,
          ]}
          onPress={saveDefaultMethod}
          disabled={!selectedMethod || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save Method</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* === SUCCESS BOTTOM SHEET === */}
      <Modal transparent visible={showSuccessSheet} onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.sheet,
                  { transform: [{ translateY: sheetAnim }] },
                ]}
              >
                <View style={styles.dragHandle} />
                <Ionicons
                  name="checkmark-circle"
                  size={60}
                  color={GOLD}
                  style={styles.successIcon}
                />
                <Text style={styles.successTitle}>Payment Method Saved!</Text>
                <Text style={styles.successMessage}>
                  Your default payment method has been updated successfully.
                </Text>
                <TouchableOpacity style={styles.doneButton} onPress={closeSheet}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#000', fontFamily: 'GothamBold' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000', fontFamily: 'GothamBold' },
  headerSubtitle: { fontSize: 15, color: '#666', lineHeight: 22, fontFamily: 'GothamMedium' },
  methodsContainer: { marginBottom: 32 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 80,
  },
  selectedCard: { borderColor: ORANGE, borderWidth: 2, backgroundColor: '#FFF8F0' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  methodText: { flex: 1 },
  methodTitle: { fontSize: 17, fontWeight: '600', color: '#111', fontFamily: 'GothamBold' },
  methodDesc: { fontSize: 13, color: '#666', marginTop: 2, fontFamily: 'GothamMedium' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: ORANGE },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: ORANGE },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 3,
    minHeight: 56,
  },
  disabledButton: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', marginRight: 8, fontFamily: 'GothamBold' },

  // === Bottom Sheet Styles (Same as ChangePasswordScreen) ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.5,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  successIcon: { alignSelf: 'center', marginVertical: 16 },
  successTitle: {
    fontSize: 19,
    fontFamily: 'GothamBold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'GothamRegular',
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'GothamBold',
  },
});