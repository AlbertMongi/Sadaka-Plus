import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { fetchCurrentUser } from "../services/userService";

const NavigationBar = ({ navigations, points }) => {
  const router = useRouter();
  const navigation = useNavigation();
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

  const handleLeaderboard = () => {
    router.push("/bible-quize/screens/LeaderboardScreen");
  };

  const handleSettings = () => {
    router.push("/bible-quize/screens/SettingScreen");
  };

  return (
    <>
      {/* Force status bar to be white with dark icons */}
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Fixed Top Bar — Starts at the VERY top of the screen */}
      <View style={styles.fixedTopBar}>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>

          {/* Right Side: Points + Icons */}
          <View style={styles.rightSide}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>
                {user?.score ?? 0} pts
              </Text>
            </View>

            {/* <TouchableOpacity onPress={handleSettings} style={styles.icon}>
              <Icon name="settings-outline" size={26} color="#333" />
            </TouchableOpacity> */}

            <TouchableOpacity onPress={handleLeaderboard} style={styles.icon}>
              <Icon name="trophy-outline" size={26} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default NavigationBar;

const styles = StyleSheet.create({
  fixedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: "#fff",
    // Android: add status bar height
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 25) : 0,
    // iOS: we want it under the notch but visible → content starts after notch
    paddingBottom: 12,
    borderBottomColor: "#eee",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    // paddingVertical: 12,
    // This pushes content below the notch on iOS (44px standard)
    marginTop: Platform.OS === "ios" ? 10 : 10,
  },
  backButton: {
    padding: 6,
    // backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  pointsBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: "center",
  },
  pointsText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E67E22",
  },
  icon: {
    padding: 6,
  },
});