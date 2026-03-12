// screens/ReviewAnswersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import NavigationBar from '../components/NavigationBar';
import { useTranslation } from 'react-i18next';

const ORANGE = '#E18731';
const GREEN = '#4CAF50';
const ORANGE_DARK = '#FF9800';

const ReviewAnswersScreen = () => {
  const { t } = useTranslation();
  const { results } = useLocalSearchParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (!results) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(results);

      if (!parsed?.answers || !Array.isArray(parsed.answers)) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const mapped = parsed.answers.map((ans) => ({
        question: ans.question || t('review_answers.question_text_missing'),
        userAnswer:
          ans.selectedAnswer && ans.options?.[ans.selectedAnswer]
            ? ans.options[ans.selectedAnswer]
            : t('review_answers.not_answered'),
        correctAnswer: ans.options?.[ans.correctAnswer] || '—',
        selectedKey: ans.selectedAnswer || null,
        correctKey: ans.correctAnswer || null,
      }));

      setQuestions(mapped);
    } catch (error) {
      console.log('Error parsing review answers:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [results]);

  // ── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar points={20} />

        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>{t('review_answers.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar points={20} />

        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="book-outline" size={64} color={ORANGE} />
          </View>

          <Text style={styles.emptyTitle}>{t('review_answers.no_answers_title')}</Text>
          <Text style={styles.emptyMessage}>
            {t('review_answers.no_answers_message')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render single question card ────────────────────────────────────────
  const renderQuestion = ({ item, index }) => {
    const { question, userAnswer, correctAnswer, selectedKey, correctKey } = item;

    const isNotAnswered = !selectedKey;
    const isCorrect = selectedKey === correctKey;
    const isWrong = !isNotAnswered && !isCorrect;

    return (
      <View style={styles.card}>
        <Text style={styles.questionNumber}>
          {t('review_answers.question_number', { number: index + 1 })}
        </Text>
        <Text style={styles.question}>{question}</Text>

        <View style={styles.answersContainer}>
          {/* Your Answer */}
          <View style={styles.answerRow}>
            <Text style={styles.label}>{t('review_answers.your_choice')}</Text>

            <Text
              style={[
                styles.answerText,
                isNotAnswered && styles.notAnswered,
                isCorrect && styles.correct,
                isWrong && styles.wrong,
              ]}
            >
              {isNotAnswered
                ? t('review_answers.not_answered')
                : selectedKey
                ? `"${selectedKey}" - ${userAnswer}`
                : userAnswer}
            </Text>
          </View>

          {/* Correct Answer */}
          <View style={styles.answerRow}>
            <Text style={[styles.label, styles.correctLabel]}>
              {t('review_answers.correct_answer')}
            </Text>
            <Text style={[styles.answerText, styles.correct]}>
              {correctKey ? `"${correctKey}" - ` : ''}
              {correctAnswer}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar points={20} />

      <View style={styles.header}>
        <Text style={styles.title}>{t('review_answers.title')}</Text>
      </View>

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(_, index) => `q-${index}`}
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
    // borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 26,
    fontFamily: 'GothamBold',
    color: '#1a1a1a',
  },

  // List & Cards
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  questionNumber: {
    fontSize: 15,
    fontFamily: 'GothamBold',
    color: ORANGE,
    marginBottom: 10,
  },
  question: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'GothamMedium',
    color: '#222',
    marginBottom: 24,
  },

  answersContainer: {
    gap: 16,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontFamily: 'GothamMedium',
    color: '#555',
    minWidth: 100,
    marginTop: 3,
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#333',
    lineHeight: 22,
  },

  // Status colors
  correct: {
    color: GREEN,
    fontFamily: 'GothamBold',
  },
  wrong: {
    color: '#f44336',
    fontFamily: 'GothamBold',
  },
  notAnswered: {
    color: ORANGE_DARK,
    fontStyle: 'italic',
  },
  correctLabel: {
    color: GREEN,
    fontFamily: 'GothamBold',
  },

  // Loading
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'GothamMedium',
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
    fontFamily: 'GothamBold',
    color: '#333',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ReviewAnswersScreen;