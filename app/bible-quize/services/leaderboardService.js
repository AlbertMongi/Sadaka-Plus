// services/leaderboardService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "https://api.sadakaplus.co.tz/api/bible/quizzes";

// Helper to safely get the auth token
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token; // Returns string or null
  } catch (error) {
    console.warn('Failed to read token from storage', error);
    return null;
  }
};

export const fetchLeaderboard = async (filter = 'all') => {
  const token = await getToken();

  if (!token) {
    throw new Error('User not authenticated. Please log in again.');
  }

  // Map filter to backend expected values
  const periodMap = {
    all: 'all',
    monthly: 'monthly',
    weekly: 'weekly',
  };

  const period = periodMap[filter] || 'all';

  const url = `${API_BASE}/leaderboard?period=${period}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load leaderboard: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Normalize response (in case it's { leaderboard: [...] } or direct array)
  const list = Array.isArray(data) ? data : data.leaderboard || data.users || [];

  return list.map(user => ({
    userId: user.userId || user._id || user.id,
    username: user.username || user.name || 'Anonymous',
    score: user.score || user.totalScore || 0,
    quizes: user.quizes || user.totalQuizzes || user.quizCount || 0,
    level: user.level || 1,
  }));
};