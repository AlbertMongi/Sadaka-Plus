import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Animated,
} from "react-native";

const { width, height } = Dimensions.get("window");
const GOLD = "#E18731";
const FALLBACK_IMAGE =
  "https://st2.depositphotos.com/4431055/11855/i/450/depositphotos_118551182-stock-photo-holy-bible-book.jpg";
const CARD_SIZE = (width - 64) / 2;

const DashboardScreen = () => {
  const router = useRouter();
  const [greeting, setGreeting] = useState("HELLO");
  const [showBalance, setShowBalance] = useState(false);

  // Animation refs
  const balanceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("GOOD MORNING");
    else if (hour < 17) setGreeting("GOOD AFTERNOON");
    else setGreeting("GOOD EVENING");
  }, []);

  const toggleBalance = () => {
    Animated.timing(balanceAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowBalance((prev) => !prev);
      Animated.timing(balanceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleRedirect = (destination) => {
    switch (destination) {
      case "Profile":
        router.push("/profile");
        break;
      case "Notifications":
        router.push("notification");
        break;
      case "Add Fund":
      case "Withdraw":
      case "Transfer":
        // Placeholder — connect to actual screens
        console.log("Navigate to:", destination);
        break;
      default:
        router.push(destination);
    }
  };

  const topItems = [
    { title: "Scriptures", color: "#EAB308", screen: "/scriptureList" },
    { title: "Sermons", color: "#3B82F6", screen: "/sermonList" },
    { title: "Events", color: "#22C55E", screen: "/eventList" },
    { title: "Announcements", color: "#EF4444", screen: "/announcementList" },
  ];

  const actions = [
    {
      title: "Create Scripture",
      subtitle: "Create a new scripture for your community",
      icon: "add-circle-outline",
      color: "#FFA500",
      screen: "/addScripture",
    },
    {
      title: "Create Sermon",
      subtitle: "Upload or write a sermon for your community",
      icon: "book-outline",
      color: "#FFA500",
      screen: "/addSermon",
    },
    {
      title: "Create Events",
      subtitle: "Create a new event for your community",
      icon: "calendar-outline",
      color: "#FFA500",
      screen: "/addEvent",
    },
    {
      title: "Create Announcements",
      subtitle: "Post an announcement  for your community",
      icon: "notifications-outline",
      color: "#FFA500",
      screen: "/addAnnouncement",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* === FIXED HEADER === */}
      <View style={styles.fixedHeader}>
        <View style={styles.navBar}>
          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => handleRedirect("communityProfile")}
              style={styles.profileContainer}
            >
              <Image
                source={{ uri: FALLBACK_IMAGE }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text style={styles.tabActive}>What would you like to do today?</Text>
          </View>
          <View style={styles.icons}>
            <TouchableOpacity
              onPress={() => handleRedirect("Notifications")}
              style={styles.iconTouchable}
            >
              {/* <Ionicons name="notifications-outline" size={20} color={GOLD} /> */}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.greetingRow}>
          <Ionicons name="sunny-outline" size={16} color="#888" />
          <Text style={styles.greetingText}>{greeting}</Text>
        </View>
      </View>

      {/* === SCROLLABLE CONTENT === */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "android" ? 80 : 20 },
        ]}
      >
        {/* === BALANCE CARD (Same as WalletScreen) === */}
        <View style={styles.section}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.currency}>TZS</Text>
              <TouchableOpacity onPress={toggleBalance}>
                <Ionicons
                  name={showBalance ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            <Animated.Text style={[styles.balance, { opacity: balanceAnim }]}>
              {showBalance ? "80,000.00" : "**********"}
            </Animated.Text>
            <Text style={styles.balanceText}>Balance</Text>
            <View style={styles.actionRow}>
              {[
                { icon: "add", label: "Add Fund" },
                { icon: "card-outline", label: "Withdraw" },
                { icon: "send-outline", label: "Transfer" },
              ].map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionBtn}
                  onPress={() => handleRedirect(action.label)}
                >
                  <Ionicons name={action.icon} size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* === TOP GRID === */}
        <View style={styles.grid}>
          {topItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(item.screen)}
            >
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: item.color + "15",
                    borderColor: item.color,
                  },
                ]}
              >
                <Text style={[styles.number, { color: item.color }]}>98</Text>
              </View>
              <Text style={styles.label}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* === ACTIONS === */}
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => router.push(action.screen)}
            >
              <Ionicons
                name={action.icon}
                size={22}
                color={action.color}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  // === HEADER (Same as WalletScreen) ===
  fixedHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabActive: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "GothamRegular",
    marginLeft: 8,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconTouchable: {
    padding: 4,
    borderRadius: 6,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  greetingText: {
    fontSize: 12,
    color: GOLD,
    marginLeft: 6,
    fontFamily: "GothamBold",
  },
  profileContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 39,
    height: 39,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GOLD,
  },

  // === SCROLL CONTENT ===
  scrollContent: {
    backgroundColor: "#fff",
    minHeight: height + 100,
    paddingTop: 72,
  },
  section: {
    marginBottom: 18,
    backgroundColor: "#fff",
  },

  // === BALANCE CARD (Copied from WalletScreen) ===
  balanceCard: {
    backgroundColor: GOLD,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currency: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "GothamBold",
  },
  balance: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "GothamBold",
    textAlign: "center",
    marginVertical: 10,
  },
  balanceText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "GothamRegular",
    textAlign: "center",
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    fontFamily: "GothamMedium",
  },

  // === GRID & CARDS ===
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  number: {
    fontSize: 20,
    color: "#111827",
    fontFamily: "GothamBold",
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontFamily: "GothamMedium",
  },

  // === ACTIONS ===
  actionsContainer: {
    marginTop: -10,
    paddingHorizontal: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    // borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionTitle: {
    color: "#111827",
    fontSize: 15,
    fontFamily: "GothamBold",
  },
  actionSubtitle: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 9,
    fontFamily: "GothamMedium",
  },
});