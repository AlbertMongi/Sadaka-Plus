import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import NavigationBar from '../components/NavigationBar';

const ORANGE = '#E18731';

const ReviewAnswersScreen = () => {
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

      const parsedResults = JSON.parse(results);

      if (!parsedResults?.answers || !Array.isArray(parsedResults.answers)) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const mappedQuestions = parsedResults.answers.map((ans) => ({
        question: ans.question || 'Question text not available',
        userAnswer: ans.selectedAnswer 
          ? (ans.options?.[ans.selectedAnswer] || 'Option not found') 
          : 'Not answered',
        correctAnswer: ans.options?.[ans.correctAnswer] || '—',
        selectedKey: ans.selectedAnswer || null,
        correctKey: ans.correctAnswer || null,
      }));

      setQuestions(mappedQuestions);
      setLoading(false);
    } catch (error) {
      console.log('Error parsing review data:', error);
      setQuestions([]);
      setLoading(false);
    }
  }, [results]);

  // ── Empty / No Data State ──────────────────────────────────────────────
  if (!loading && questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar points={20} />

        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="book-outline" size={64} color={ORANGE} />
          </View>

          <Text style={styles.emptyTitle}>No Answers to Review</Text>
          <Text style={styles.emptyMessage}>
            You haven't completed any quiz yet.{'\n'}
            Try completing one first!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar points={20} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading your review...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main Content ───────────────────────────────────────────────────────
  const renderQuestion = ({ item, index }) => {
    const { userAnswer, correctAnswer, selectedKey, correctKey } = item;
    const notAnswered = !selectedKey;

    return (
      <View style={styles.card}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <Text style={styles.question}>{item.question}</Text>

        <View style={styles.answersContainer}>
          <View style={styles.answerRow}>
            <Text style={styles.label}>Your choice:</Text>
            <Text style={[
              styles.answerText,
              notAnswered ? styles.notAnswered : null
            ]}>
              {notAnswered 
                ? 'Not answered' 
                : `${selectedKey ? `"${selectedKey}" - ` : ''}${userAnswer}`}
            </Text>
          </View>

          <View style={styles.answerRow}>
            <Text style={[styles.label, styles.correctLabel]}>Correct answer:</Text>
            <Text style={[styles.answerText, styles.correct]}>
              {correctKey ? `"${correctKey}" - ` : ''}{correctAnswer}
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
        <Text style={styles.title}>Review Your Answers</Text>
      </View>

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(_, i) => `q-${i}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />z++++
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
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 26,
    fontFamily: 'GothamBold',
    color: '#1a1a1a',
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
    fontFamily: 'GothamBold',
    color: ORANGE,
    marginBottom: 8,
  },
  question: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'GothamMedium',
    color: '#222',
    marginBottom: 20,
  },
  answersContainer: {
    gap: 14,
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
    marginTop: 2,
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GothamMedium',
    color: '#333',
  },
  correct: {
    color: '#4CAF50',
    fontFamily: 'GothamBold',
  },
  correctLabel: {
    color: '#4CAF50',
    fontFamily: 'GothamBold',
  },
  notAnswered: {
    color: '#FF9800',
    fontFamily: 'GothamMedium',
    fontStyle: 'italic',
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
