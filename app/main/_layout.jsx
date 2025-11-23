

// import { Tabs } from 'expo-router';
// import CustomTabBar from '../../components/CustomTabBar';

// export default function Layout() {
//   return (
//     <Tabs
//       tabBar={(props) => <CustomTabBar {...props} />}
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       {['getstarted', 'login', 'register'].map((screen) => (
//         <Tabs.Screen
//           key={screen}
//           name={screen}
//           options={{ tabBarStyle: { display: 'none' } }}
//         />
//       ))}

//       <Tabs.Screen name="index1" options={{ title: 'Home' }} />
//       <Tabs.Screen name="bible" options={{ title: 'Daily Verse' }} />
//       <Tabs.Screen name="contribution" options={{ title: 'Give' }} />
//       <Tabs.Screen name="community" options={{ title: 'Live' }} />
//       <Tabs.Screen name="more" options={{ title: 'More' }} />
//     </Tabs>
//   );
// }

import { NetworkStatusProvider } from '../../components/NetworkStatusProvider';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function Layout() {
  return (
    <NetworkStatusProvider>
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'none'   // 👈 Prevents fade-error crash
      }}
    >
      {['getstarted', 'login', 'register'].map((screen) => (
        <Tabs.Screen
          key={screen}
          name={screen}
          options={{ 
            tabBarStyle: { display: 'none' },
            animation: 'none'   // 👈 Disable screen animation
          }}
        />
      ))}

      <Tabs.Screen name="index1" options={{ title: 'Home', animation: 'none' }} />
      <Tabs.Screen name="bible" options={{ title: 'Daily Verse', animation: 'none' }} />
      <Tabs.Screen name="contribution" options={{ title: 'Give', animation: 'none' }} />
      <Tabs.Screen name="community" options={{ title: 'Live', animation: 'none' }} />
      <Tabs.Screen name="more" options={{ title: 'More', animation: 'none' }} />
    </Tabs>
    </NetworkStatusProvider>
  );
}
