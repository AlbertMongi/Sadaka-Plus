import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';

// Polyfill for setImmediate to fix swiper error
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback) => setTimeout(callback, 0);
}

const images = [
  require('../assets/images/onboarding1.jpg'),
  require('../assets/images/onboarding2.jpg'),
  require('../assets/images/onboarding3.jpg'),
];

const fallbackImage = require('../assets/images/onboarding1.jpg');

const { height: screenHeight, width: screenWidth } = Dimensions.get('screen');

const translations = {
  en: {
    next: 'Next',
    getStarted: 'Get Started',
    skip: 'Skip',
    language: 'SW',
    slide1: { heading: 'Welcome to Sadaka Plus', subText: 'Welcome to our application to get you started.'},
    slide2: { heading: 'Easily Manage Donations', subText: 'Track your offerings, tithes and donations in one place.' },
    slide3: { heading: 'Stay Updated With Church News', subText: 'Get real-time updates, event reminders and more' },
  },
  sw: {
    next: 'Inayofuata',
    getStarted: 'Anza',
    skip: 'Ruka',
    language: 'EN',
    slide1: { heading: 'Jiunge na Ibada ya Moja kwa Moja', subText: 'Hudhuria ibada na matukio muhimu mubashara.' },
    slide2: { heading: 'Simamia Michango kwa Urahisi', subText: 'Fuatilia sadaka, zaka na michango yako katika sehemu moja.' },
    slide3: { heading: 'Pata Taarifa za Kanisa', subText: 'Pokea taarifa kwa wakati, ukumbusho wa matukio na zaidi.' },
  },
};

const atob = global.atob
  ? global.atob
  : (input) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = input.replace(/=+$/, '');
      let output = '';
      if (str.length % 4 === 1) throw new Error("'atob' failed");
      for (let bc = 0, bs = 0, buffer, idx = 0; (buffer = str.charAt(idx++)); ) {
        buffer = chars.indexOf(buffer);
        bs = bc % 4 ? bs * 64 + buffer : buffer;
        bc++;
        if (bc % 4) output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
      }
      return output;
    };

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const exp = decodedPayload.exp;
    return !exp || exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

export default function GetStarted() {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const systemTheme = useColorScheme();
  const swiperRef = useRef(null);

  const [fontsLoaded] = useFonts({
    GothamBold: require('../assets/fonts/Gotham-Bold.ttf'),
    GothamLight: require('../assets/fonts/Gotham-Light.ttf'),
    GothamRegular: require('../assets/fonts/Gotham-Book.otf'),
    GothamMedium: require('../assets/fonts/Gotham-Medium.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    DMSansRegular: require('../assets/fonts/DMSans-Regular.ttf'),
    DMSansBold: require('../assets/fonts/DMSans-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) setLanguage(savedLanguage);

        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(false);
        }

        const userToken = await AsyncStorage.getItem('userToken');

        await Promise.all([
          fontsLoaded ? Promise.resolve() : new Promise(() => {}),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);

        if (userToken && !isTokenExpired(userToken)) {
          router.replace('/main/index1');
        }
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded]);

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    await AsyncStorage.setItem('language', newLang);
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      goToLogin();
    }
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;
  const t = translations[language];
  const isLastSlide = currentIndex === images.length - 1;
  const buttonText = isLastSlide ? t.getStarted : t.next;

  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={themeStyles.fullScreenLoader}>
        <StatusBar
          backgroundColor="#FFFFFF"
          barStyle="dark-content"
          translucent={false}
        />
        <View style={themeStyles.loaderContainer}>
          <View style={themeStyles.loaderContent}>
            <Image
              source={require('../assets/images/Sadaka App Logo.png')}
              style={themeStyles.loaderLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    );
  }
    
  return (
    <View style={themeStyles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <View style={themeStyles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination
          dotStyle={themeStyles.dot}
          activeDotStyle={themeStyles.activeDot}
          paginationStyle={themeStyles.pagination}
          onIndexChanged={(index) => setCurrentIndex(index)}
        >
          {images.map((img, index) => (
            <ImageBackground
              key={index}
              source={img}
              defaultSource={fallbackImage}
              style={themeStyles.fullscreenImage}
              resizeMode="cover"
            >
              <View style={themeStyles.overlay} />
              <View style={themeStyles.overlayContent}>
                <View style={themeStyles.textWrapper}>
                  <Text style={themeStyles.heading}>{t[`slide${index + 1}`].heading}</Text>
                  <Text style={themeStyles.subText}>{t[`slide${index + 1}`].subText}</Text>
                </View>
              </View>
            </ImageBackground>
          ))}
        </Swiper>
      </View>

      <View style={themeStyles.overlayContent}>
        <View style={themeStyles.topRight}>
          <TouchableOpacity onPress={goToLogin} style={themeStyles.topButton}>
            <Text style={[themeStyles.topButtonText, { color: isDarkMode ? '#000' : '#fff' }]}>
              {t.skip}
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={toggleLanguage} style={themeStyles.topButton}>
            <Text style={[themeStyles.topButtonText, { color: isDarkMode ? '#000' : '#fff' }]}>
              {t.language}
            </Text>
          </TouchableOpacity> */}
        </View>

        <TouchableOpacity style={themeStyles.button} onPress={goNext}>
          <Text style={themeStyles.buttonText}>{buttonText}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles remain unchanged (baseStyles, lightStyles, darkStyles)
const baseStyles = {
  // ... (all your existing styles unchanged)
  container: { flex: 1 },
  swiperContainer: { position: 'absolute', width: screenWidth, height: screenHeight },
  fullscreenImage: { width: screenWidth, height: screenHeight },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 40,
    paddingBottom: 40,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    marginBottom: 6,
    lineHeight: 32,
    letterSpacing: 1,
    fontWeight: '600',
    fontFamily: 'GothamBold',
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
  },
  subText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: -10,
    lineHeight: 20,
    fontFamily: 'GothamRegular',
    color: '#fefefe',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'GothamBold',
  },
  pagination: {
    bottom: Platform.OS === 'android' ? 100 : 170,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginHorizontal: 2,
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    width: screenWidth,
    height: screenHeight,
    zIndex: 10000,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  loaderContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
  },
  loaderLogo: {
    width: 100,
    height: 100,
    zIndex: 1,
    alignSelf: 'center',
  },
  topRight: {
    flexDirection: 'row',
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 30,
    right: 24,
    gap: 10,
  },
  topButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topButtonText: {
    fontSize: 12,
    fontFamily: 'PoppinsMedium',
  },
};

const lightStyles = StyleSheet.create({
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: '#000' },
  overlay: { ...baseStyles.overlay, backgroundColor: 'rgba(0,0,0,0.5)' },
  button: { ...baseStyles.button, backgroundColor: '#FF9F00' },
  buttonText: { ...baseStyles.buttonText, color: '#fff' },
  dot: { ...baseStyles.dot, backgroundColor: 'rgba(255,255,255,0.3)' },
  activeDot: { ...baseStyles.activeDot, backgroundColor: '#FF9F00' },
  topButton: {
    ...baseStyles.topButton,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

const darkStyles = StyleSheet.create({
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: '#000' },
  overlay: { ...baseStyles.overlay, backgroundColor: 'rgba(0,0,0,0.5)' },
  button: { ...baseStyles.button, backgroundColor: '#FF9F00' },
  buttonText: { ...baseStyles.buttonText, color: '#fff' },
  dot: { ...baseStyles.dot, backgroundColor: 'rgba(255,255,255,0.3)' },
  activeDot: { ...baseStyles.activeDot, backgroundColor: '#FF9F00' },
  topButton: {
    ...baseStyles.topButton,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});