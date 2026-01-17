
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const iconMap = {
//   index1: { lib: MaterialCommunityIcons, name: 'home' },
//   bible: { lib: Ionicons, name: 'calendar' },
//   contribution: { lib: MaterialCommunityIcons, name: 'hand-heart-outline' },
//   community: { lib: MaterialCommunityIcons, name: 'account-group-outline' },
//   profile: { lib: MaterialCommunityIcons, name: 'profile-outline' },
//   more: { lib: Ionicons, name: 'menu' },
// };

// export default function CustomTabBar({ state, descriptors, navigation }) {
//   const primaryColor = '#E18731';
//   const greyColor = '#737373';

//   return (
//     <View style={styles.tabbar}>
//       {state.routes.map((route, index) => {
//         if (['_sitemap', '+not-found'].includes(route.name)) return null;

//         const { options } = descriptors[route.key];
//         const label =
//           options.tabBarLabel ?? options.title ?? route.name;

//         const isFocused = state.index === index;

//         const onPress = () => {
//           const event = navigation.emit({
//             type: 'tabPress',
//             target: route.key,
//             canPreventDefault: true,
//           });

//           if (!isFocused && !event.defaultPrevented) {
//             navigation.navigate(route.name);
//           }
//         };

//         const onLongPress = () => {
//           navigation.emit({
//             type: 'tabLongPress',
//             target: route.key,
//           });
//         };

//         const { lib: IconLib, name: iconName } = iconMap[route.name] || {};

//         return (
//           <TouchableOpacity
//             key={route.key}
//             onPress={onPress}
//             onLongPress={onLongPress}
//             style={styles.tabbarItem}
//             accessibilityRole="button"
//             accessibilityState={isFocused ? { selected: true } : {}}
//             accessibilityLabel={options.tabBarAccessibilityLabel}
//             testID={options.tabBarTestID}
//           >
//             {IconLib && (
//               <IconLib
//                 name={iconName}
//                 size={22}
//                 color={isFocused ? primaryColor : greyColor}
//               />
//             )}
//             <Text
//               style={{
//                 color: isFocused ? primaryColor : greyColor,
//                 fontSize: 11,
//                 marginTop: 2,
//                 fontFamily: isFocused ? 'GothamBold' : 'GothamRegular', // <- Use Gotham
//               }}
//             >
//               {label}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }
// // const styles = StyleSheet.create({
// //   tabbar: {
// //     position: 'absolute',
// //     bottom: Platform.OS === 'ios' ? -10 : 30,
// //     left: 20,
// //     right: 20,
// //     flexDirection: 'row',
// //     backgroundColor: 'rgba(253, 244, 231, 0.9)', // transparent background
// //     borderRadius: 25,
// //     paddingVertical: 15,
// //     paddingHorizontal: 10,
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     shadowColor: 'black',
// //     shadowOffset: { width: 0, height: 10 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 10,
// //     elevation: 10,
// //   },
// //   tabbarItem: {
// //     flex: 1,
// //     alignItems: 'center',
// //   },
// // });
// const styles = StyleSheet.create({
//   tabbar: {
//     position: 'absolute',
//     bottom: Platform.OS === 'ios' ? -10 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     backgroundColor: 'rgba(253, 244, 231, 0.9)', // transparent background
//     borderRadius: 25,
//     paddingVertical: 15,
//     paddingHorizontal: 10,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: 'black',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   tabbarItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
// });




import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const iconMap = {
  index1: { lib: MaterialCommunityIcons, name: 'home' },
bible: { lib: MaterialCommunityIcons, name: 'calendar' },
  contribution: { lib: MaterialCommunityIcons, name: 'hand-heart-outline' },
  community: { lib: MaterialCommunityIcons, name: 'radio-tower' },
  //  community: { lib: MaterialCommunityIcons, name: 'radio-tower' },
  more: { lib: Ionicons, name: 'menu' },
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  const primaryColor = '#E18731';
  const greyColor = '#737373';

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel ?? options.title ?? route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const { lib: IconLib, name: iconName } = iconMap[route.name] || {};

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
          >
            {IconLib && (
              <IconLib
                name={iconName}
                size={22}
                color={isFocused ? primaryColor : greyColor}
              />
            )}
            <Text
              style={{
                color: isFocused ? primaryColor : greyColor,
                fontSize: 11,
                marginTop: 2,
                fontFamily: isFocused ? 'GothamBold' : 'GothamRegular', // <- Use Gotham
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
// const styles = StyleSheet.create({
//   tabbar: {
//     position: 'absolute',
//     bottom: Platform.OS === 'ios' ? -10 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     backgroundColor: 'rgba(253, 244, 231, 0.9)', // transparent background
//     borderRadius: 25,
//     paddingVertical: 15,
//     paddingHorizontal: 10,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: 'black',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   tabbarItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
// });
const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? -10 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(253, 244, 231, 0.9)', // transparent background
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
  },
});