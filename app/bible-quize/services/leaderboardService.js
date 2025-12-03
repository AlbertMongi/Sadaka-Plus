import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:8000/api/bible/quizzes/leaderboard";

const getToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

export const fetchLeaderboard = async (filter = "all") => {
  try {
    const token = await getToken();

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
      params: {
        filter, // if backend supports weekly/monthly filters
      },
    });

    return response.data;
  } catch (error) {
    // console.error("Error fetching leaderboard:", error.response?.data || error.message);
    throw error;
  }
};
