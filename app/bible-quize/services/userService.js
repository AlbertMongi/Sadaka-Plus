// services/userService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your real production API (not localhost on device!)
const API_URL = 'https://apis.sadakaplus.co.tz/api/bible/quizzes/user';

let isFetching = false; // Prevent multiple simultaneous calls

export const fetchCurrentUser = async () => {
  // Prevent multiple calls at once (common cause of spam errors)
  if (isFetching) {
    return null;
  }

  try {
    isFetching = true;

    // Safely get token – never throws
    let token;
    try {
      token = await AsyncStorage.getItem('userToken');
    } catch (storageError) {
      console.warn('AsyncStorage error (token read failed)');
      return null;
    }

    // If no token → user not logged in → silently skip
    if (!token) {
      return null;
    }

    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 8000, // Prevent hanging forever
    });

    return response.data;

  } catch (error) {
    // Network error, timeout, 401, etc. → do NOT crash the app
    const isNetworkError = !error.response;
    const isAuthError = error.response?.status === 401;

    if (isNetworkError || isAuthError) {
      // These are expected when offline or token expired → silent
      return null;
    }

    // Only log real unexpected errors
    console.warn('fetchCurrentUser failed:', error.message);
    return null;

  } finally {
    isFetching = false;
  }
};