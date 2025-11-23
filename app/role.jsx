import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const ORANGE = '#FF8C00';

export default function ChooseRoleScreen() {
  const router = useRouter();

  const saveRole = async (role) => {
    try {
      await AsyncStorage.setItem('userRole', role);
      console.log('Role saved:', role);
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handlePersonPress = async () => {
    await saveRole('ROLE_USER');
    router.push('/register');
  };

  const handleChurchPress = async () => {
    await saveRole('ROLE_COMMUNITY_ADMIN');
    router.push('/ChurchRegister');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Role</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Sadaka App Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Role Selection Card */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Who are you?</Text>
          <Text style={styles.cardSubtitle}>
            Select your role to continue registration
          </Text>

          {/* User Role */}
          <TouchableOpacity style={styles.roleButton} onPress={handlePersonPress}>
            <View style={styles.iconCircle}>
              <FontAwesome name="user-plus" size={32} color="#FFF" />
            </View>
            <Text style={styles.roleLabel}>User</Text>
            <Text style={styles.roleDesc}>Individual member</Text>
          </TouchableOpacity>

          {/* Church Role */}
          <TouchableOpacity style={styles.roleButton} onPress={handleChurchPress}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="church-outline" size={36} color="#FFF" />
            </View>
            <Text style={styles.roleLabel}>Church</Text>
            <Text style={styles.roleDesc}>Community admin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: Platform.OS === 'android' ? 99 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 20 : -5,
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    width: 110,
    height: 110,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: ORANGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'GothamBold',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'GothamMedium',
  },
  roleButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'GothamBold',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'GothamMedium',
  },
});