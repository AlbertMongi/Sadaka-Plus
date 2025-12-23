import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NavigationBar from '../components/NavigationBar';
import { QuestionService } from '../services/QuestionService';

const ORANGE = '#E18731';

const ReviewAnswersScreen = ({ navigation }) => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noQuizFound, setNoQuizFound] = useState(false);

  useEffect(() => {
    const loadQuizReview = async () => {
      try {
        const sessionId = await AsyncStorage.getItem('lastQuizSessionId');

        // No recent quiz → show nice empty state
        if (!sessionId) {
          setNoQuizFound(true);
          setLoading(false);
          return;
        }

        const token =
          (await QuestionService.getToken?.()) ||
          (await AsyncStorage.getItem('userToken'));

        if (!token) {
          navigation.navigate('Login');
          return;
        }

        const response = await fetch(
          `https://apis.sadakaplus.co.tz/api/bible/quizzes/session/${sessionId}/submit`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            navigation.navigate('Login');
            return;
          }
          // Other errors → treat as no valid quiz data
          throw new Error('invalid response');
        }

        const data = await response.json();

        const questions = data.answers.map((ans) => ({
          question: ans.question,
          userAnswer: ans.selectedAnswer === null ? 'Not answered' : ans.options[ans.selectedAnswer],
          correctAnswer: ans.options[ans.correctAnswer],
          selectedKey: ans.selectedAnswer,
          correctKey: ans.correctAnswer,
          isCorrect: ans.correct,
        }));

        setQuizData({
          score: data.correct,
          total: data.answers.length,
          wrong: data.wrong ?? data.answers.length - data.correct,
          questions,
        });
      } catch (err) {
        console.log('Review load error:', err);
        // Most errors → treat as no quiz found
        setNoQuizFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadQuizReview();
  }, [navigation]);

  // ── Empty State ───────────────────────────────────────────────────────
  if (noQuizFound) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar navigation={navigation} points={20} />

        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="book-outline" size={64} color={ORANGE} />
          </View>

          <Text style={styles.emptyTitle}>No Quiz Found</Text>
          <Text style={styles.emptyMessage}>
            You haven't completed any quiz yet.{'\n'}Go back and start a new one!
          </Text>

          {/* <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar navigation={navigation} points={20} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading your review...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main Content ───────────────────────────────────────────────────────
  const renderQuestion = ({ item, index }) => {
    const { userAnswer, correctAnswer, isCorrect, selectedKey, correctKey } = item;
    const notAnswered = userAnswer === 'Not answered';

    return (
      <View style={styles.card}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <Text style={styles.question}>{item.question}</Text>

        <View style={styles.answers}>
          <View style={styles.answerRow}>
            <Text style={styles.label}>Your answer:</Text>
            <Text
              style={[
                styles.value,
                notAnswered ? styles.notAnswered : isCorrect ? styles.correct : styles.wrong,
              ]}
            >
              {notAnswered ? userAnswer : `${selectedKey ? `"${selectedKey}" - ` : ''}${userAnswer}`}
            </Text>
          </View>

          {(!isCorrect || notAnswered) && (
            <View style={styles.answerRow}>
              <Text style={[styles.label, styles.correctLabel]}>Correct:</Text>
              <Text style={[styles.value, styles.correct]}>
                {correctKey ? `"${correctKey}" - ` : ''}{correctAnswer}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar navigation={navigation} points={20} />

      <View style={styles.header}>
        <Text style={styles.title}>Review Your Answers</Text>
        <Text style={styles.score}>
          {quizData.score} / {quizData.total}
        </Text>
        <Text style={styles.subtitle}>
          Correct: {quizData.score} • Wrong/Skipped: {quizData.wrong}
        </Text>
      </View>

      <FlatList
        data={quizData.questions}
        renderItem={renderQuestion}
        keyExtractor={(_, i) => `q-${i}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  score: {
    fontSize: 34,
    fontWeight: 'bold',
    color: ORANGE,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    marginTop: 16,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: ORANGE,
    marginBottom: 8,
  },
  question: {
    fontSize: 17,
    lineHeight: 24,
    color: '#222',
    marginBottom: 16,
  },
  answers: { gap: 12 },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  label: {
    fontSize: 15,
    color: '#555',
    minWidth: 90,
    marginTop: 2,
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  correct: { color: '#4CAF50' },
  wrong: { color: '#F44336' },
  notAnswered: {
    color: '#FF9800',
    fontStyle: 'italic',
  },
  correctLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Loading
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff5eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReviewAnswersScreen;