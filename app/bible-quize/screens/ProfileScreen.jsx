import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
// import { UserService } from "../../services/UserService";
// import { ScoreService } from "../../services/ScoreService";
import { dummyProfile } from '../services/ProfileScreen'; 
import { styles } from "../styles/ProfileScreen.styles";

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [userProfile, setUserProfile] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await UserService.getCurrentUser();
      const quizzes = await ScoreService.getRecentQuizzes(profile.id, 5);
      const userAchievements = await UserService.getUserAchievements(profile.id);

      setUserProfile(profile);
      setRecentQuizzes(quizzes);
      setAchievements(userAchievements);
      setNewName(profile.name);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleEditName = () => setEditing(true);

  const handleSaveName = async () => {
    if (!newName.trim()) {
      Alert.alert(t('common.error'), t('profile.errors.name_empty'));
      return;
    }

    try {
      await UserService.updateUserName(newName.trim());
      setUserProfile((prev) => ({ ...prev, name: newName.trim() }));
      setEditing(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.errors.update_name_failed'));
    }
  };

  const handleCancelEdit = () => {
    setNewName(userProfile?.name || "");
    setEditing(false);
  };

  const handleResetProgress = () => {
    Alert.alert(
      t('profile.reset_progress_title'),
      t('profile.reset_progress_message'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('profile.reset_button'),
          style: "destructive",
          onPress: async () => {
            try {
              await UserService.resetUserProgress();
              await loadUserData();
              Alert.alert(t('common.success'), t('profile.reset_success'));
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.errors.reset_failed'));
            }
          },
        },
      ]
    );
  };

  const renderAchievement = (achievement) => (
    <View key={achievement.id} style={styles.achievementItem}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>
          {achievement.description}
        </Text>
        <Text style={styles.achievementDate}>
          {t('profile.earned_on', { date: new Date(achievement.dateEarned).toLocaleDateString() })}
        </Text>
      </View>
    </View>
  );

  const renderRecentQuiz = (quiz, index) => (
    <View key={index} style={styles.quizItem}>
      <View style={styles.quizHeader}>
        <Text style={styles.quizLevel}>{quiz.levelName}</Text>
        <Text style={styles.quizDate}>
          {new Date(quiz.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.quizStats}>
        <Text style={styles.quizScore}>
          {t('profile.score')}: {quiz.correctAnswers}/{quiz.totalQuestions}
        </Text>
        <Text style={styles.quizPoints}>+{quiz.score} {t('profile.points')}</Text>
      </View>
    </View>
  );

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userProfile.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            {editing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder={t('profile.name_placeholder')}
                  maxLength={30}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveName}
                  >
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <TouchableOpacity onPress={handleEditName}>
                  <Text style={styles.editText}>{t('common.edit')}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.joinDate}>
              {t('profile.member_since', { date: new Date(userProfile.joinDate).toLocaleDateString() })}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProfile.totalScore}</Text>
            <Text style={styles.statLabel}>{t('profile.total_score')}</Text>
          </View> 

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProfile.level}</Text>
            <Text style={styles.statLabel}>{t('profile.current_level')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProfile.totalQuizzes}</Text>
            <Text style={styles.statLabel}>{t('profile.quizzes_taken')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              #{userProfile.rank || t('profile.unranked')}
            </Text>
            <Text style={styles.statLabel}>{t('profile.global_rank')}</Text>
          </View>
        </View>

        {/* Recent Quizzes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.recent_quizzes')}</Text>
          {recentQuizzes.length > 0 ? (
            recentQuizzes.map(renderRecentQuiz)
          ) : (
            <Text style={styles.emptyText}>{t('profile.no_quizzes_yet')}</Text>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.achievements')}</Text>
          {achievements.length > 0 ? (
            achievements.map(renderAchievement)
          ) : (
            <Text style={styles.emptyText}>{t('profile.no_achievements_yet')}</Text>
          )}
        </View>

        {/* Reset Progress */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetProgress}
          >
            <Text style={styles.resetButtonText}>{t('profile.reset_progress')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;