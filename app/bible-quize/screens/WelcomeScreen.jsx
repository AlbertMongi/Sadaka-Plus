import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Add this import at the top
import { styles } from '../styles/WelcomeScreen.styles';

const WelcomeScreen = () => {
  const router = useRouter();
  const getCurrentDate = () => {
    const today = new Date('2025-09-19'); // Fixed to September 19, 2025
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'short' });
    const weekday = today.toLocaleString('en-US', { weekday: 'short' });
    const year = today.getFullYear();
    return { day, month, weekday, year };
  };

  const handlePlayNow = () => {
    router.push('/bible-quize/screens/QuizScreen');
  };

  const userName = "John"; // Replace with actual user name
  const { day, month } = getCurrentDate();

  return (
    
    <View style={styles.container}>
{/* Back Arrow */}
<TouchableOpacity
  style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}
  onPress={() => router.push('/main/index1')}
>
  <Ionicons name="chevron-back" size={32} color="#000" />
</TouchableOpacity>
      {/* Date Display */}
      {/* Main content centered */}
      <View style={styles.centerContent}>
        {/* Bible Quiz Icon Placeholder */}
        <View style={styles.iconContainer}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconPlaceholderText}>📖</Text>
          </View>
        </View>

        {/* Bible Quiz Text */}
        <Text style={styles.titleText}>Bible Quiz</Text>

        {/* Welcome Message */}
        <Text style={styles.welcomeText}>
          Welcome!
        </Text>

        {/* Play Now Button with horizontal lines */}
        <View style={styles.buttonSection}>
          <View style={styles.horizontalLine} />
          <TouchableOpacity style={styles.playButton} onPress={handlePlayNow}>
            <Text style={styles.playButtonText}>PLAY NOW</Text>
          </TouchableOpacity>
          <View style={styles.horizontalLine} />
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;