import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, Text } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: '#6B4F4F',
        tabBarStyle: styles.bottomNav,
        tabBarItemStyle: styles.navItem,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 0 }, // hides default label
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let label;
          let IconComponent = Ionicons;

          if (route.name === 'index1') {
            iconName = 'home-outline';
            label = 'Home';
          } else if (route.name === 'bible') {
            IconComponent = MaterialCommunityIcons;
            iconName = 'calendar';
            label = 'Bible';
          } else if (route.name === 'contribution') {
            IconComponent = MaterialCommunityIcons;
            iconName = 'hand-heart-outline';
            label = 'Contribution';
          } else if (route.name === 'community') {
            IconComponent = MaterialCommunityIcons;
            iconName = 'account-group-outline';
            label = 'Community';
          }

          return (
            <View style={{ alignItems: 'center' }}>
              <IconComponent
                name={iconName}
                size={22}
                color={focused ? '#FFA500' : color}
                style={focused ? styles.activeIcon : null}
              />
              <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      {['getstarted', 'login', 'register'].map((screen) => (
        <Tabs.Screen
          key={screen}
          name={screen}
          options={{
            tabBarStyle: { display: 'none' },
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      ))}

      <Tabs.Screen name="index1" />
      <Tabs.Screen name="bible" />
      <Tabs.Screen name="contribution" />
      <Tabs.Screen name="community" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#FFF3D4',
    height: 62,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  activeIcon: {
    marginBottom: 2, // lifts the active icon slightly upward
  },
  activeLabel: {
    fontSize: 11,
    color: '#FFA500',
    marginTop: 2,
    fontWeight: '600',
  },
  inactiveLabel: {
    fontSize: 10,
    color: '#6B4F4F',
    marginTop: 2,
  },
});
