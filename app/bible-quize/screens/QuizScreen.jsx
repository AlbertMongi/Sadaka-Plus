// File: app/bible-quize/screens/QuizScreen.jsx (or wherever your file is)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QuestionService } from '../services/QuestionService';
import { styles as quizStyles } from '../styles/QuizScreen.styles'; // Your original styles
import NavigationBar from '../components/NavigationBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ORANGE = "#E18731"; // Your quiz theme color

const QuizScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { level, levelName } = useLocalSearchParams();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(true);
  const [progress] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [sessionId, setSessionId] = useState(null);

  // Toast state (same design as LoginScreen)
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  // Bottom sheet state
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Toast function
  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "error" }), 3500);
  };

  // Bottom sheet controls
  const openBottomSheet = () => {
    setBottomSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setBottomSheetVisible(false));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedAnswers, questions]);

  // Animations on question change
  useEffect(() => {
    updateProgressBar();
    animateFadeIn();
  }, [currentQuestionIndex]);

  const loadQuestions = async () => {
    try {
      const { sessionId, questions } = await QuestionService.startQuiz(level);
      setSessionId(sessionId);
      setQuestions(questions);
      setLoading(false);
    } catch (error) {
      showToast("Failed to load questions. Please try again.");
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const q = questions[currentQuestionIndex];
    const optionKey = q.optionKeys[answerIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [q.id]: optionKey,
    }));
  };

  const submitQuiz = async () => {
    try {
      const results = await QuestionService.submitAnswers(sessionId, selectedAnswers);
      router.push({
        pathname: "/bible-quize/screens/ResultScreen",
        params: { results: JSON.stringify(results) },
      });
    } catch (err) {
      showToast("Failed to submit quiz. Please check your connection.");
    }
  };

  const updateProgressBar = () => {
    const progressValue = (currentQuestionIndex + 1) / questions.length;
    Animated.timing(progress, {
      toValue: progressValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const animateFadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = questions.length - answeredCount;

    if (unansweredCount > 0 && timeLeft > 0) {
      openBottomSheet();
    } else {
      submitQuiz();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={quizStyles.container}>
        <View style={quizStyles.loadingContainer}>
          <Text style={quizStyles.loadingText}>Loading Questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={quizStyles.container}>
        <View style={quizStyles.errorContainer}>
          <Text style={quizStyles.errorText}>No questions available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const selectedOptionKey = selectedAnswers[currentQuestion.id];
  const unansweredCount = questions.length - Object.keys(selectedAnswers).length;

  return (
    <SafeAreaView style={quizStyles.container}>
      <NavigationBar navigation={navigation} points={20} />

      {/* Custom Toast - Identical to LoginScreen */}
      {toast.visible && (
        <View style={localStyles.toastContainer}>
          <View style={[
            localStyles.toast,
            toast.type === "success" ? localStyles.toastSuccess : localStyles.toastError
          ]}>
            <Ionicons
              name={toast.type === "success" ? "checkmark-circle" : "close-circle"}
              size={22}
              color="#fff"
            />
            <Text style={localStyles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      <ScrollView style={quizStyles.questionContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={quizStyles.questionCard}>
            <View style={quizStyles.questionHeader}>
              <View style={quizStyles.questionNumber}>
                <Text style={quizStyles.questionNumberText}>
                  Question {currentQuestionIndex + 1}/{questions.length}
                </Text>
              </View>
              <Text style={quizStyles.levelLabel}>{levelName}</Text>
            </View>
            <Text style={quizStyles.questionText}>{currentQuestion.question}</Text>
          </View>

          <View style={quizStyles.answersContainer}>
            {currentQuestion.options.map((option, index) => {
              const optionKey = currentQuestion.optionKeys[index];
              const isSelected = selectedOptionKey === optionKey;
              return (
                <TouchableOpacity
                  key={index}
                  style={[quizStyles.answerButton, isSelected && quizStyles.selectedAnswer]}
                  onPress={() => handleAnswerSelect(index)}
                >
                  <View style={quizStyles.answerOption}>
                    <Text style={quizStyles.answerLabel}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                    <Text style={[quizStyles.answerText, isSelected && quizStyles.selectedAnswerText]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={quizStyles.navigationContainer}>
            <TouchableOpacity
              style={[quizStyles.navButton, currentQuestionIndex === 0 && quizStyles.disabledButton]}
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={[
                quizStyles.navButtonText,
                currentQuestionIndex === 0 && quizStyles.disabledButtonText
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            {isLastQuestion ? (
              <TouchableOpacity style={quizStyles.submitButton} onPress={handleSubmitQuiz}>
                <Text style={quizStyles.submitButtonText}>Submit Quiz</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={quizStyles.navButton} onPress={handleNextQuestion}>
                <Text style={quizStyles.navButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Sheet for Incomplete Quiz */}
      <Modal visible={bottomSheetVisible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={closeBottomSheet}>
          <View style={localStyles.modalOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[
          localStyles.bottomSheet,
          {
            transform: [{
              translateY: sheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0]
              })
            }]
          }
        ]}>
          <View style={localStyles.sheetHandle} />

          <Ionicons name="alert-circle-outline" size={56} color={ORANGE} style={{ alignSelf: 'center', marginVertical: 16 }} />

          <Text style={localStyles.sheetTitle}>Incomplete Quiz</Text>
          <Text style={localStyles.sheetMessage}>
            You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
            {'\n'}Are you sure you want to submit?
          </Text>

          <View style={localStyles.sheetButtons}>
            <TouchableOpacity style={localStyles.sheetCancelButton} onPress={closeBottomSheet}>
              <Text style={localStyles.sheetCancelText}>Continue Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity style={localStyles.sheetSubmitButton} onPress={() => {
              closeBottomSheet();
              submitQuiz();
            }}>
              <Text style={localStyles.sheetSubmitText}>Submit Anyway</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default QuizScreen;

// Local styles for Toast & Bottom Sheet (doesn't affect your original styles)
const localStyles = StyleSheet.create({
  // Toast - 100% same as LoginScreen
  toastContainer: {
    position: "absolute",
    top: Platform.OS === 'android' ? 80 : 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 8,
  },
  toastSuccess: { backgroundColor: "#4CAF50" },
  toastError: { backgroundColor: "#FF3B30" },
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "GothamBold",
  },

  // Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'GothamBold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  sheetMessage: {
    fontSize: 16,
    fontFamily: 'GothamMedium',
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  sheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 16,
    fontFamily: 'GothamBold',
    color: '#666',
  },
  sheetSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: 'center',
  },
  sheetSubmitText: {
    fontSize: 16,
    fontFamily: 'GothamBold',
    color: '#fff',
  },
});