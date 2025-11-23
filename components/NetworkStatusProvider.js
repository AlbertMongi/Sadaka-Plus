// components/NetworkStatusProvider.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const NetworkContext = createContext();

export const useNetwork = () => useContext(NetworkContext);

export const NetworkStatusProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setShowSheet(true);
    Animated.timing(slideAnim, {
      toValue: height - 200, // sheet height slide position
      duration: 350,
      useNativeDriver: false,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 350,
      useNativeDriver: false,
    }).start(() => setShowSheet(false));
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable;

      if (!connected && isConnected) {
        setIsConnected(false);
        openSheet();
      } else if (connected && !isConnected) {
        setIsConnected(true);
        closeSheet();
      }
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, [isConnected]);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}

      {showSheet && (
        <Animated.View style={[styles.bottomSheet, { top: slideAnim }]}>
          {/* ⚠️ Alama ya Mshangao (warning triangle) */}
          <Ionicons
            name="warning-outline"
            size={46}
            color="#FFCC00"
            style={{ marginBottom: 12 }}
          />

          <Text style={styles.sheetTitle}>No Internet Connection</Text>
          <Text style={styles.sheetSubtitle}>
            Please check your connection and try again.
          </Text>
        </Animated.View>
      )}
    </NetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#222', // dark bottom sheet for visibility
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 25,
    zIndex: 99999,
  },

  sheetTitle: {
    fontSize: 18,
    fontFamily: 'GothamBold',
    color: '#fff',
    marginBottom: 5,
  },

  sheetSubtitle: {
    fontSize: 14,
    fontFamily: 'GothamRegular',
    color: '#ccc',
    textAlign: 'center',
    opacity: 0.9,
  },
});
