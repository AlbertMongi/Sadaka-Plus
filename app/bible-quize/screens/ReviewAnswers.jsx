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
import { QuestionService } from "../services/QuestionService"; // Import your service
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReviewAnswersScreen = ({ navigation }) => {
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizReview = async () => {
      try {
        // Retrieve sessionId from AsyncStorage (set it after submitQuiz in QuizScreen)
        const sessionId = await AsyncStorage.getItem("lastQuizSessionId");

        if (!sessionId) {
          throw new Error("No recent quiz found. Please complete a quiz first.");
        }

        // Reuse the same endpoint as submit — it returns results even after submission
        const response = await fetch(
          `https://apis.sadakaplus.co.tz/api/bible/quizzes/session/${sessionId}/submit`,
          {
            method: "GET", // Important: GET to retrieve submitted results
            headers: {
              Authorization: `Bearer ${await QuestionService.getToken?.() || (await AsyncStorage.getItem("userToken"))}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 401) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`Failed to load review: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // Transform answers to show full text
        const transformedQuestions = data.answers.map((answer) => {
          const userAnswerText =
            answer.selectedAnswer === null
              ? "Not answered"
              : answer.options[answer.selectedAnswer];

          const correctAnswerText = answer.options[answer.correctAnswer];

          return {
            question: answer.question,
            userAnswer: userAnswerText,
            correctAnswer: correctAnswerText,
            selectedKey: answer.selectedAnswer,
            correctKey: answer.correctAnswer,
            isCorrect: answer.correct,
          };
        });

        setQuizData({
          score: data.correct,
          totalQuestions: data.answers.length,
          wrong: data.wrong || data.answers.length - data.correct,
          questions: transformedQuestions,
          sessionId: data.sessionId,
        });
      } catch (err) {
        console.error("Review fetch error:", err);
        setError(err.message);

        // Specific user-friendly messages
        if (err.message.includes("log in")) {
          Alert.alert("Session Expired", "Please log in again to view your answers.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
          ]);
        } else if (err.message.includes("No recent quiz")) {
          Alert.alert("No Quiz Found", err.message, [
            { text: "Go Back", onPress: () => navigation.goBack() },
          ]);
        } else {
          Alert.alert("Error", err.message || "Could not load your answers.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizReview();
  }, [navigation]);

  const renderQuestionItem = ({ item, index }) => {
    const isCorrect = item.isCorrect;
    const isNotAnswered = item.userAnswer === "Not answered";

    return (
      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <Text style={styles.questionText}>{item.question}</Text>

        <View style={styles.answerContainer}>
          <Text
            style={[
              styles.answerLabel,
              isNotAnswered
                ? styles.notAnswered
                : isCorrect
                ? styles.correct
                : styles.incorrect,
            ]}
          >
            Your Answer:{' '}
            <Text style={styles.answerValue}>
              {isNotAnswered
                ? item.userAnswer
                : `"${item.selectedKey}" - ${item.userAnswer}`}
            </Text>
          </Text>

          {(!isCorrect || isNotAnswered) && (
            <Text style={[styles.answerLabel, styles.correct]}>
              Correct Answer:{' '}
              <Text style={styles.answerValue}>
                "{item.correctKey}" - {item.correctAnswer}
              </Text>
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

  if (error || !quizData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{error || "Failed to load review"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar navigation={navigation} points={20} />

      <View style={styles.header}>
        <Text style={styles.title}>Review Answers</Text>
        <Text style={styles.scoreText}>
          Score: {quizData.score} / {quizData.totalQuestions}
        </Text>
        <Text style={styles.detailText}>
          Correct: {quizData.score} | Wrong/Skipped: {quizData.wrong}
        </Text>
      </View>

      <FlatList
        data={quizData.questions}
        renderItem={renderQuestionItem}
        keyExtractor={(item, index) => `question-${index}`}
        contentContainerStyle={styles.questionsListContent}
        showsVerticalScrollIndicator={false}
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
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontFamily: "GothamMedium",
  },
  header: {
    padding: 24,
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
    fontFamily: "GothamBold",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E18731",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "GothamMedium",
  },
  questionsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  questionCard: {
    marginTop: 16,
    padding: 18,
    backgroundColor: "#FFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E18731",
    marginBottom: 6,
    fontFamily: "GothamBold",
  },
  questionText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#333",
    marginBottom: 16,
    fontFamily: "GothamMedium",
  },
  answerContainer: {
    marginTop: 8,
  },
  answerLabel: {
    fontSize: 15.5,
    marginBottom: 6,
    fontFamily: "GothamMedium",
  },
  answerValue: {
    fontWeight: "600",
    fontFamily: "GothamBold",
  },
  correct: {
    color: "#4CAF50",
  },
  incorrect: {
    color: "#F44336",
  },
  notAnswered: {
    color: "#FF9800",
    fontStyle: "italic",
  },
});

export default ReviewAnswersScreen;