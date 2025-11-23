import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from "react-native";
// import { UserService } from "../../services/UserService";
// import { ScoreService } from "../../services/ScoreService";
import { dummyProfile } from '../services/ProfileScreen'; 
import { styles } from "../styles/ProfileScreen.styles";

const ProfileScreen = ({ navigation }) => {
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
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      await UserService.updateUserName(newName.trim());
      setUserProfile((prev) => ({ ...prev, name: newName.trim() }));
      setEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update name");
    }
  };

  const handleCancelEdit = () => {
    setNewName(userProfile?.name || "");
    setEditing(false);
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your progress? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await UserService.resetUserProgress();
              await loadUserData();
              Alert.alert("Success", "Progress has been reset");
            } catch (error) {
              Alert.alert("Error", "Failed to reset progress");
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
          Earned {new Date(achievement.dateEarned).toLocaleDateString()}
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
          Score: {quiz.correctAnswers}/{quiz.totalQuestions}
        </Text>
        <Text style={styles.quizPoints}>+{quiz.score} points</Text>
      </View>
    </View>
  );

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Profile...</Text>
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
                  placeholder="Enter your name"
                  maxLength={30}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveName}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <TouchableOpacity onPress={handleEditName}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.joinDate}>
              Member since {new Date(userProfile.joinDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProfile.totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View> 

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProfile.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProfile.totalQuizzes}</Text>
            <Text style={styles.statLabel}>Quizzes Taken</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              #{userProfile.rank || "N/A"}
            </Text>
            <Text style={styles.statLabel}>Global Rank</Text>
          </View>
        </View>

        {/* Recent Quizzes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Quizzes</Text>
          {recentQuizzes.length > 0 ? (
            recentQuizzes.map(renderRecentQuiz)
          ) : (
            <Text style={styles.emptyText}>No quizzes taken yet</Text>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.length > 0 ? (
            achievements.map(renderAchievement)
          ) : (
            <Text style={styles.emptyText}>No achievements yet</Text>
          )}
        </View>

        {/* Reset Progress */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetProgress}
          >
            <Text style={styles.resetButtonText}>Reset Progress</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
