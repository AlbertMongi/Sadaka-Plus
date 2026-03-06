import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles/WelcomeScreen.styles';

const WelcomeScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handlePlayNow = () => {
    router.push('/bible-quize/screens/QuizScreen');
  };

  const userName = "John"; // Replace with actual user name from auth/profile

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}
        onPress={() => router.push('/main/index1')}
        accessibilityLabel={t('common.go_back')}
      >
        <Ionicons name="chevron-back" size={32} color="#000" />
      </TouchableOpacity>

      {/* Main content centered */}
      <View style={styles.centerContent}>
        {/* Bible Quiz Icon Placeholder */}
        <View style={styles.iconContainer}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconPlaceholderText}>📖</Text>
          </View>
        </View>

        {/* Bible Quiz Text */}
        <Text style={styles.titleText}>{t('welcome.bible_quiz')}</Text>

        {/* Welcome Message */}
        <Text style={styles.welcomeText}>
          {t('welcome.welcome_message')}
        </Text>

        {/* Play Now Button with horizontal lines */}
        <View style={styles.buttonSection}>
          <View style={styles.horizontalLine} />
          <TouchableOpacity style={styles.playButton} onPress={handlePlayNow}>
            <Text style={styles.playButtonText}>{t('welcome.play_now')}</Text>
          </TouchableOpacity>
          <View style={styles.horizontalLine} />
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;