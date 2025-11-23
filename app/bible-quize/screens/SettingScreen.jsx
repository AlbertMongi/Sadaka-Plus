import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import NavigationBar from '../components/NavigationBar';
import { fetchCurrentUser } from "../services/userService";
import { styles } from '../styles/SettingScreen.styles';

const SettingScreen = () => {
  const navigation = useNavigation();

  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await fetchCurrentUser();
      setUser(data);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // TODO: Clear token & redirect to login
          console.log("User logged out");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar navigation={navigation} points={20} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info */}
        {user && (
          <View style={styles.userCard}>
            <Icon name="person-circle-outline" size={60} color="#E17731" />
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.userStats}>
              {user.quizes} quizzes • {user.score} pts
            </Text>
          </View>
        )}

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? "#E17731" : "#f4f3f4"}
            />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingScreen;
