

// import { NetworkStatusProvider } from '../../components/NetworkStatusProvider';
// import { Tabs } from 'expo-router';
// import CustomTabBar from '../../components/CustomTabBar';

// export default function Layout() {
//   return (
//     <NetworkStatusProvider>
//     <Tabs
//       tabBar={(props) => <CustomTabBar {...props} />}
//       screenOptions={{
//         headerShown: false,
//         animation: 'none'   // 👈 Prevents fade-error crash
//       }}
//     >
//       {['getstarted', 'login', 'register'].map((screen) => (
//         <Tabs.Screen
//           key={screen}
//           name={screen}
//           options={{ 
//             tabBarStyle: { display: 'none' },
//             animation: 'none'   // 👈 Disable screen animation
//           }}
//         />
//       ))}

//       <Tabs.Screen name="index1" options={{ title: 'Home', animation: 'none' }} />
//       <Tabs.Screen name="bible" options={{ title: 'Events', animation: 'none' }} />
//       <Tabs.Screen name="contribution" options={{ title: 'Give', animation: 'none' }} />
//       <Tabs.Screen name="community" options={{ title: 'Live', animation: 'none' }} />
//       <Tabs.Screen name="more" options={{ title: 'More', animation: 'none' }} />
//     </Tabs>
//     </NetworkStatusProvider>
//   );
// }



import { NetworkStatusProvider } from '../../components/NetworkStatusProvider';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';
import { useTranslation } from 'react-i18next';
// ────────────────────────────────────────────────
// Add this line (because i18n.js is in the root)
import '../../i18n';     // ← correct path when i18n.js is in project root
// ────────────────────────────────────────────────

export default function Layout() {
  const { t, i18n } = useTranslation();
  return (
    <NetworkStatusProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'none'
        }}
      >
        {['getstarted', 'login', 'register'].map((screen) => (
          <Tabs.Screen
            key={screen}
            name={screen}
            options={{ 
              tabBarStyle: { display: 'none' },
              animation: 'none'
            }}
          />
        ))}

        <Tabs.Screen name="index1" options={{ title: t('Home'), animation: 'none' }} />
        <Tabs.Screen name="bible"   options={{ title: t('Events'), animation: 'none' }} />
        <Tabs.Screen name="contribution" options={{ title: t('Give'), animation: 'none' }} />
        <Tabs.Screen name="community" options={{ title: t('Live'), animation: 'none' }} />
        <Tabs.Screen name="more" options={{ title: t( 'More'), animation: 'none' }} />
      </Tabs>
    </NetworkStatusProvider>
  );
}