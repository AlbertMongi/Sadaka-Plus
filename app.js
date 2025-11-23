import { NetworkStatusProvider } from '../components/NetworkStatusProvider';
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import BibleScreen from "./screens/BibleScreen";
import ChatScreen from "./screens/ChatScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import Page from "./screens/Page"; // Profile page

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BottomTabs() {
  return (
    <NetworkStatusProvider>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === "Bible") {
            return (
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Chat") {
            return <Ionicons name="chatbubble-outline" size={size} color={color} />;
          } else if (route.name === "Notifications") {
            return (
              <Ionicons
                name="notifications-outline"
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Profile") {
            return <Ionicons name="person" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#6B4F4F",
        tabBarInactiveTintColor: "#A89F9F",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bible" component={BibleScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={Page} />
    </Tab.Navigator>
    </NetworkStatusProvider>
  );
}

export default function App() {
  return (
       <NetworkStatusProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tabs go inside stack */}
        <Stack.Screen name="Main" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
    </NetworkStatusProvider>
  );
}
