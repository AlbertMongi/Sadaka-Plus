import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
// import { UserService } from '../../services/UserService';
// import { QuestionService } from '../../services/QuestionService';
import { styles } from '../styles/LevelSelectionScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';

const LevelSelectionScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await UserService.getCurrentUser();
      const availableLevels = await QuestionService.getAvailableLevels();
      setUserProfile(profile);
      setLevels(availableLevels);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLevelSelect = (level) => {
    navigation.navigate('Quiz', { level: level.id, levelName: level.name });
  };

  const isLevelUnlocked = (levelId) => {
    return userProfile?.level >= levelId;
  };

  const renderLevel = (level) => {
    const unlocked = isLevelUnlocked(level.id);
    
    return (
      <TouchableOpacity
        key={level.id}
        style={[
          styles.levelCard,
          !unlocked && styles.lockedLevelCard
        ]}
        onPress={() => unlocked && handleLevelSelect(level)}
        disabled={!unlocked}
      >
        <View style={styles.levelHeader}>
          <Text style={[
            styles.levelTitle,
            !unlocked && styles.lockedText
          ]}>
            Level {level.id}: {level.name}
          </Text>
          {!unlocked && (
            <Text style={styles.lockIcon}>🔒</Text>
          )}
        </View>
        
        <Text style={[
          styles.levelDescription,
          !unlocked && styles.lockedText
        ]}>
          {level.description}
        </Text>
        
        <View style={styles.levelStats}>
          <Text style={[
            styles.statText,
            !unlocked && styles.lockedText
          ]}>
            Difficulty: {level.difficulty}
          </Text>
          <Text style={[
            styles.statText,
            !unlocked && styles.lockedText
          ]}>
            Questions: {level.questionCount}
          </Text>
        </View>
        
        {unlocked && (
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>Play Now</Text>
          </View>
        )}
        
        {!unlocked && (
          <View style={styles.unlockRequirement}>
            <Text style={styles.unlockText}>
              Reach Level {level.id} to unlock
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Level</Text>
        <Text style={styles.subtitle}>
          Current Level: {userProfile?.level || 1}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {levels.map(renderLevel)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LevelSelectionScreen;
