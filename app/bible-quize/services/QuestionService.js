// services/QuestionService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "https://sadaka-plus-api.ludovick.site/api/bible/quizzes";

// Helper: Safely get token (never throws, returns null if not found)
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token; // could be null or string
  } catch (error) {
    console.warn('Failed to read token from storage', error);
    return null;
  }
};

export const QuestionService = {

  startQuiz: async (level) => {
    const token = await getToken();

    if (!token) {
      throw new Error('User not authenticated. Please log in again.');
    }

    const response = await fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ level }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start quiz: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Safely normalize questions
    const questions = Array.isArray(data.questions) ? data.questions : [];

    return {
      sessionId: data.sessionId || data.session_id,
      questions: questions.map(q => ({
        id: q.id || q._id,
        question: q.question || 'No question text',
        options: Object.values(q.options || {}),
        optionKeys: Object.keys(q.options || {}),
        level: q.level,
        points: q.points || 10,
      })),
    };
  },

  submitAnswers: async (sessionId, answers) => {
    const token = await getToken();

    if (!token) {
      throw new Error('Authentication token missing. Please restart the app.');
    }

    if (!sessionId) {
      throw new Error('Invalid session. Please start a new quiz.');
    }

    const response = await fetch(`${API_BASE}/session/${sessionId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Submit failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  },
};