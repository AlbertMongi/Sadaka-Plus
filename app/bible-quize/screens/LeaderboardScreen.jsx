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

// Import the service
import { fetchLeaderboard } from "../services/leaderboardService";

const LeaderboardScreen = ({ navigation }) => {
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
      // fallback if not returned
        totalQuizzes: user.quizes,
        totalScore: user.score,
      }));

      setLeaderboard(formatted);
    } catch (error) {
      // console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      // You can also create a UserService for current user
      const me = leaderboard.find((u) => u.userId === "76510aac-91da-420c-9e55-cbb0a492403c"); // Example
      if (me) {
        setCurrentUser({ id: me.userId, rank: leaderboard.indexOf(me) + 1, ...me });
      }
    } catch (error) {
      // console.error("Error loading current user:", error);
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
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.userLevel}>
            Level {item.level} • {item.totalQuizzes} quizzes
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[
            styles.userScore,
            isCurrentUser && styles.currentUserScore
          ]}>
            {item.totalScore.toLocaleString()}
          </Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>
      </View>
    );
  };

  const renderFilterButton = (filterType, label) => (
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
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E18731" />
        <Text style={styles.loadingText}>Loading Leaderboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar header */}
      <NavigationBar navigation={navigation} points={20} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>Top Bible Quiz Champions</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All Time')}
        {renderFilterButton('monthly', 'This Month')}
        {renderFilterButton('weekly', 'This Week')}
      </View>

      {/* Current User Position */}
      {currentUser && (
        <View style={styles.currentUserCard}>
          <Text style={styles.currentUserTitle}>Your Position</Text>
          <View style={styles.currentUserStats}>
            <View style={styles.currentUserStat}>
              <Text style={styles.currentUserStatValue}>
                #{currentUser.rank || 'Unranked'}
              </Text>
              <Text style={styles.currentUserStatLabel}>Rank</Text>
            </View>
            <View style={styles.currentUserStat}>
              <Text style={styles.currentUserStatValue}>
                {currentUser.totalScore?.toLocaleString() || 0}
              </Text>
              <Text style={styles.currentUserStatLabel}>Points</Text>
            </View>
            <View style={styles.currentUserStat}>
              {/* <Text style={styles.currentUserStatValue}>
                {currentUser.level || 1}
              </Text> */}
              {/* <Text style={styles.currentUserStatLabel}>Level</Text> */}
            </View>
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
            <Text style={styles.emptyText}>No rankings available yet</Text>
            <Text style={styles.emptySubText}>
              Complete some quizzes to see the leaderboard!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default LeaderboardScreen;