import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const GOLD = '#E18731';
const ORANGE = '#FF6B00';

export default function SecurityScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  const handleChangePassword = () => {
    navigation.navigate('ChangePasswordScreen');
  };

  const handleViewLoginHistory = () => {
    // Alert.alert('Login History', 'Showing recent logins...');
    // router.push('../loginHistory');
  };

  const handleManageDevices = () => {
    // Alert.alert('Manage Devices', 'Listing connected devices...');
    // router.push('../manageDevices');
  };

  const toggle2FA = (value) => {
    setIs2FAEnabled(value);
    // Alert.alert('2FA', value ? 'Enabled' : 'Disabled');
  };

  const toggleBiometric = (value) => {
    setIsBiometricEnabled(value);
    // Alert.alert('Biometric Login', value ? 'Enabled' : 'Disabled');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
         onPress={() => router.push('main/more')}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Account Security</Text>
            <Text style={styles.cardSubtitle}>
              Manage your security settings to keep your account safe.
            </Text>

            {/* Change Password */}
            <TouchableOpacity style={styles.optionItem} onPress={handleChangePassword}>
              <View style={styles.optionLeft}>
                <Ionicons name="key-outline" size={24} color={GOLD} />
                <Text style={styles.optionTitle}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            

            {/* Biometric Toggle */}
            <View style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons name="finger-print-outline" size={24} color={GOLD} />
                <Text style={styles.optionTitle}>Biometric Login</Text>
              </View>
              <Switch
                trackColor={{ false: '#ddd', true: ORANGE }}
                thumbColor={isBiometricEnabled ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#ddd"
                onValueChange={toggleBiometric}
                value={isBiometricEnabled}
              />
            </View>

            {/* Login History */}
            <TouchableOpacity style={styles.optionItem} onPress={handleViewLoginHistory}>
              <View style={styles.optionLeft}>
                <Ionicons name="time-outline" size={24} color={GOLD} />
                <Text style={styles.optionTitle}>Login History</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* Manage Devices */}
            {/* <TouchableOpacity style={styles.optionItem} onPress={handleManageDevices}>
              <View style={styles.optionLeft}>
                <Ionicons name="laptop-outline" size={24} color={GOLD} />
                <Text style={styles.optionTitle}>Manage Devices</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: Platform.OS === 'android' ? 100 : 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 20 : 5,
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
    backgroundColor: '#fff',
    paddingVertical: Platform.OS === 'android' ? -89 : 15,
  },
 
  cardContent: {
    padding: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
    fontFamily: 'GothamBold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'GothamMedium',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginLeft: 16,
    fontFamily: 'GothamMedium',
  },
});