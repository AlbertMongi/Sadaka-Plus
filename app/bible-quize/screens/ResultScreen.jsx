import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/ResultScreen.styles';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ResultScreen = () => {
  const router = useRouter();
  const { results } = useLocalSearchParams();

  // Safely parse results
  let parsedResults = null;
  try {
    parsedResults = results ? JSON.parse(results) : null;
  } catch (e) {
    console.error("Failed to parse results:", e);
  }

  const [loading, setLoading] = useState(true);
  const [celebrationAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (parsedResults) {
      setLoading(false);
      startCelebrationAnimation();
    }
  }, []);

  const startCelebrationAnimation = () => {
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationAnim, {
        toValue: 1.15,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getScoreMessage = () => {
    const percentage = parsedResults?.totalScore || 0;
    if (percentage >= 90) return { message: "Outstanding!", color: '#27AE60' };
    if (percentage >= 80) return { message: "Excellent!", color: '#2ECC71' };
    if (percentage >= 70) return { message: "Good Job!", color: '#E18731' };
    if (percentage >= 60) return { message: "Well Done!", color: '#E18731' };
    return { message: "Keep Studying!", color: '#E74C3C' };
  };

  // Fixed: Use router.push() instead of navigation.navigate()
  const handlePlayAgain = () => {
    router.push('/bible-quize/screens/QuizScreen');
  };

  const handleViewAnswers = () => {
    router.push({
      pathname: '',
      params: { results: JSON.stringify(parsedResults) },
    });
  };

  const handleBackHome = () => {
    router.push('/main/bible'); // or '/' if that's your home
    // Alternative: router.back() if you want to go back in history
  };

  if (loading || !parsedResults) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E18731" />
        <Text style={styles.loadingText}>Calculating Results...</Text>
      </SafeAreaView>
    );
  }

  const scoreMessage = getScoreMessage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.scoreCircle,
              { transform: [{ scale: celebrationAnim }] },
            ]}
          >
            <Text style={[styles.scorePercentage, { color: scoreMessage.color }]}>
              {parsedResults.totalScore}%
            </Text>
          </Animated.View>

          <Text style={[styles.scoreMessage, { color: scoreMessage.color }]}>
            {scoreMessage.message}
          </Text>
          <Text style={styles.levelCompleted}>
            Level {parsedResults.level} Completed
          </Text>
        </View>

        {/* Results Summary */}
        <View style={styles.resultsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{parsedResults.correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
            <Text style={styles.statSubLabel}>Great job!</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{parsedResults.wrongAnswers}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
            <Text style={styles.statSubLabel}>Review below</Text>
          </View>
        </View>

        {/* Rank Improvement (Optional) */}
        {parsedResults.rankChange && (
          <View style={styles.rankCard}>
            <Text style={styles.rankTitle}>Your Rank</Text>
            <Text style={parsedResults.rankChange > 0 ? styles.rankImproved : styles.rankMaintained}>
              {parsedResults.rankChange > 0 
                ? `Improved by ${parsedResults.rankChange} positions` 
                : "Rank maintained"}
            </Text>
          </View>
        )}

        {/* Answer Breakdown */}
        {parsedResults.answers && parsedResults.answers.length > 0 && (
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>Answer Breakdown</Text>
            {parsedResults.answers.map((ans, idx) => (
              <View key={idx} style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>
                  Q{idx + 1}
                </Text>
                <Text style={[
                  styles.performanceValue,
                  { color: ans.isCorrect ? '#27AE60' : '#E74C3C' }
                ]}>
                  {ans.isCorrect ? 'Correct' : 'Incorrect'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePlayAgain}>
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewAnswers}>
            <Text style={styles.secondaryButtonText}>Review Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tertiaryButton} onPress={handleBackHome}>
            <Text style={styles.tertiaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResultScreen;