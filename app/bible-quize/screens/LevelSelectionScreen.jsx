import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
// import { UserService } from '../../services/UserService';
// import { QuestionService } from '../../services/QuestionService';
import { styles } from '../styles/LevelSelectionScreen.styles';

const LevelSelectionScreen = ({ navigation }) => {
  const { t } = useTranslation();

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
            {t('level_selection.level_prefix', { id: level.id, name: level.name })}
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
            {t('level_selection.difficulty')}: {level.difficulty}
          </Text>
          <Text style={[
            styles.statText,
            !unlocked && styles.lockedText
          ]}>
            {t('level_selection.questions')}: {level.questionCount}
          </Text>
        </View>
        
        {unlocked && (
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>{t('level_selection.play_now')}</Text>
          </View>
        )}
        
        {!unlocked && (
          <View style={styles.unlockRequirement}>
            <Text style={styles.unlockText}>
              {t('level_selection.unlock_requirement', { requiredLevel: level.id })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('level_selection.title')}</Text>
        <Text style={styles.subtitle}>
          {t('level_selection.current_level', { level: userProfile?.level || 1 })}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {levels.map(renderLevel)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LevelSelectionScreen;