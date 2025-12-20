import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import NavigationBar from "../components/NavigationBar";

const API_URL =
  "http://localhost:8001/api/bible/quizzes/session/14b2f784-e9f2-4b4d-86ea-9867ea28b5c4/submit";

const ReviewAnswersScreen = ({ navigation }) => {
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform the API data into the format we need
        const transformedQuestions = data.answers.map((answer) => ({
          question: answer.question,
          correctAnswer: answer.options[answer.correctAnswer], // e.g., "B" → "A pillar of fire"
          userAnswer:
            answer.selectedAnswer === null
              ? "Not answered"
              : answer.options[answer.selectedAnswer],
        }));

        setQuizData({
          score: data.correct,
          totalQuestions: data.answers.length,
          questions: transformedQuestions,
        });
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError(err.message);
        Alert.alert("Error", "Failed to load quiz results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  const renderQuestionItem = ({ item, index }) => {
    const isCorrect = item.userAnswer === item.correctAnswer;
    const isNotAnswered = item.userAnswer === "Not answered";

    return (
      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <Text style={styles.questionText}>{item.question}</Text>
        <View style={styles.answerContainer}>
          <Text
            style={[
              styles.answerText,
              isNotAnswered
                ? styles.notAnswered
                : isCorrect
                ? styles.correct
                : styles.incorrect,
            ]}
          >
            Your Answer: {item.userAnswer}
          </Text>
          {(!isCorrect || isNotAnswered) && (
            <Text style={[styles.answerText, styles.correct]}>
              Correct Answer: {item.correctAnswer}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E18731" />
        <Text style={styles.loadingText}>Loading your answers...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Failed to load results</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar navigation={navigation} points={20} />

      <View style={styles.header}>
        <Text style={styles.title}>📖 Review Answers</Text>
        <Text style={styles.scoreText}>
          Score: {quizData.score} / {quizData.totalQuestions}
        </Text>
      </View>

      <FlatList
        data={quizData.questions}
        renderItem={renderQuestionItem}
        keyExtractor={(item, index) => `question-${index}`}
        contentContainerStyle={styles.questionsListContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E18731",
  },
  questionsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 12,
  },
  answerContainer: {
    marginTop: 4,
  },
  answerText: {
    fontSize: 15,
    marginBottom: 4,
  },
  correct: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  incorrect: {
    color: "#F44336",
    fontWeight: "600",
  },
  notAnswered: {
    color: "#FF9800",
    fontWeight: "600",
    fontStyle: "italic",
  },
});

export default ReviewAnswersScreen;