// screens/ResultScreen.js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/ResultScreen.styles';
import { useTranslation } from 'react-i18next';

const ResultScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { results } = useLocalSearchParams();

  const [parsedResults, setParsedResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebrationAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!results) {
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(results);
      setParsedResults(data);
      startCelebrationAnimation();
    } catch (e) {
      console.error('Failed to parse results:', e);
    } finally {
      setLoading(false);
    }
  }, [results]);

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

  const getScoreMessage = (percentage = 0) => {
    if (percentage >= 90) return { key: 'result.outstanding', color: '#27AE60' };
    if (percentage >= 80) return { key: 'result.excellent', color: '#2ECC71' };
    if (percentage >= 70) return { key: 'result.good_job', color: '#E18731' };
    if (percentage >= 60) return { key: 'result.well_done', color: '#E18731' };
    return { key: 'result.keep_studying', color: '#E74C3C' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E18731" />
        <Text style={styles.loadingText}>{t('result.calculating_results')}</Text>
      </SafeAreaView>
    );
  }

  if (!parsedResults) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: '#666' }}>{t('result.no_results_available')}</Text>
      </SafeAreaView>
    );
  }

  // Calculate percentage safely
  const correct = Number(parsedResults.correct) || 0;
  const total = Number(parsedResults.totalQuestions) || 
                Number(parsedResults.answers?.length) || 
                10; // fallback to 10 if nothing is available

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scoreMessage = getScoreMessage(percentage);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - Score Circle with PERCENTAGE */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.scoreCircle,
              { transform: [{ scale: celebrationAnim }] },
            ]}
          >
            <Text style={[styles.scorePercentage, { color: scoreMessage.color }]}>
              {percentage}%
            </Text>
          </Animated.View>

          <Text style={[styles.scoreMessage, { color: scoreMessage.color }]}>
            {t(scoreMessage.key)}
          </Text>
        </View>

        {/* Results Summary */}
        <View style={styles.resultsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{correct}</Text>
            <Text style={styles.statLabel}>{t('result.correct')}</Text>
            <Text style={styles.statSubLabel}>{t('result.great_job')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Number(parsedResults.wrong) || 0}</Text>
            <Text style={styles.statLabel}>{t('result.wrong')}</Text>
            <Text style={styles.statSubLabel}>{t('result.review_below')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push('/bible-quize/screens/QuizScreen')}
          >
            <Text style={styles.primaryButtonText}>{t('result.play_again')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push({
              pathname: '/bible-quize/screens/ReviewAnswers',
              params: { results: JSON.stringify(parsedResults) },
            })}
          >
            <Text style={styles.secondaryButtonText}>{t('result.review_answers')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tertiaryButton}
            onPress={() => router.push('/main/index1')}
          >
            <Text style={styles.tertiaryButtonText}>{t('result.back_to_home')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResultScreen;