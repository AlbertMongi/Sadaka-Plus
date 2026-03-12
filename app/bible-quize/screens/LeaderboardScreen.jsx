// LeaderboardScreen.jsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigationBar from "../components/NavigationBar";
import { styles } from "../styles/LeaderboardScreen.styles";
import { fetchLeaderboard } from "../services/leaderboardService";
import { useTranslation } from "react-i18next";

export default function LeaderboardScreen({ navigation }) {
  const { t } = useTranslation();

  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    loadCurrentUser();
  }, [filter]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLeaderboard(filter);

      // Map backend response to UI format
      const formatted = data.map((user, index) => ({
        userId: user.userId,
        name: user.username,
        totalQuizzes: user.quizes,
        totalScore: user.score,
        // level: user.level || 1, // if backend sends level
      }));

      setLeaderboard(formatted);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      // Replace with real current user ID logic (e.g. from token or storage)
      const currentUserId = "76510aac-91da-420c-9e55-cbb0a492403c"; // ← example
      const me = leaderboard.find((u) => u.userId === currentUserId);
      if (me) {
        setCurrentUser({
          id: me.userId,
          rank: leaderboard.indexOf(me) + 1,
          ...me,
        });
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    await loadCurrentUser();
    setRefreshing(false);
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = currentUser && item.userId === currentUser.id;
    const rankColors = {
      0: '#FFD700', // Gold
      1: '#C0C0C0', // Silver
      2: '#CD7F32', // Bronze
    };

    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem
      ]}>
        <View style={styles.rankContainer}>
          <View style={[
            styles.rankBadge,
            index < 3 && { backgroundColor: rankColors[index] }
          ]}>
            <Text style={[
              styles.rankText,
              index < 3 && styles.topRankText
            ]}>
              {index + 1}
            </Text>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={[
            styles.userName,
            isCurrentUser && styles.currentUserName
          ]}>
            {item.name}
            {isCurrentUser && ` (${t('leaderboard.you')})`}
          </Text>
          <Text style={styles.userLevel}>
            {t('leaderboard.level')} {item.level || 1} • {item.totalQuizzes} {t('leaderboard.quizzes')}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[
            styles.userScore,
            isCurrentUser && styles.currentUserScore
          ]}>
            {item.totalScore.toLocaleString()}
          </Text>
          <Text style={styles.scoreLabel}>{t('leaderboard.points')}</Text>
        </View>
      </View>
    );
  };

  const renderFilterButton = (filterType, labelKey) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.activeFilterButtonText
      ]}>
        {t(labelKey)}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E18731" />
        <Text style={styles.loadingText}>{t('leaderboard.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar header */}
      <NavigationBar navigation={navigation} points={20} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('leaderboard.title')}</Text>
        <Text style={styles.subtitle}>{t('leaderboard.subtitle')}</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'leaderboard.filter_all_time')}
        {renderFilterButton('monthly', 'leaderboard.filter_this_month')}
        {renderFilterButton('weekly', 'leaderboard.filter_this_week')}
      </View>

      {/* Current User Position */}
      {currentUser && (
        <View style={styles.currentUserCard}>
          <Text style={styles.currentUserTitle}>{t('leaderboard.your_position')}</Text>
          <View style={styles.currentUserStats}>
            <View style={styles.currentUserStat}>
              <Text style={styles.currentUserStatValue}>
                #{currentUser.rank || t('leaderboard.unranked')}
              </Text>
              <Text style={styles.currentUserStatLabel}>{t('leaderboard.rank')}</Text>
            </View>
            <View style={styles.currentUserStat}>
              <Text style={styles.currentUserStatValue}>
                {currentUser.totalScore?.toLocaleString() || 0}
              </Text>
              <Text style={styles.currentUserStatLabel}>{t('leaderboard.points')}</Text>
            </View>
            {/* Uncomment if level is available */}
            {/* <View style={styles.currentUserStat}>
              <Text style={styles.currentUserStatValue}>
                {currentUser.level || 1}
              </Text>
              <Text style={styles.currentUserStatLabel}>{t('leaderboard.level')}</Text>
            </View> */}
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => `${item.userId}-${index}`}
        style={styles.leaderboardList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E18731']}
            tintColor="#E18731"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('leaderboard.empty_title')}</Text>
            <Text style={styles.emptySubText}>
              {t('leaderboard.empty_subtitle')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}