import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('themeMode');
      if (saved) setThemeMode(saved);
    };
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const currentTheme =
    themeMode === 'system' ? systemTheme || 'light' : themeMode;

  const changeTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
