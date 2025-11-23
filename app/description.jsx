import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DescriptionScreen() {
  const router = useRouter();

  const community = {
    name: "Harmony Community",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    description: `Harmony Community is a diverse and vibrant group of individuals committed to mutual support, growth, and service. Since its formation, the community has been active in organizing social events, educational workshops, and outreach programs to foster connection and empowerment among members.`,
    formedDate: "March 15, 2010",
    location: "123 Unity Street, Springfield",
    otherInfo: "Membership open to all. Monthly meetings every first Saturday. Volunteer opportunities available.",
  };

  const handleLeave = () => {
    Alert.alert(
      "Leave Community",
      "Are you sure you want to leave this community?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => Alert.alert("You left the community.") },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFA500" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Info</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Community Image & Name */}
        <View style={styles.cardRow}>
          <Image source={{ uri: community.image }} style={styles.image} />
          <Text style={styles.name}>{community.name}</Text>
        </View>

        {/* About */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardText}>{community.description}</Text>
        </View>

        {/* Formed */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Formed</Text>
          <Text style={styles.cardText}>{community.formedDate}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Location</Text>
          <Text style={styles.cardText}>{community.location}</Text>
        </View>

        {/* Other Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Other Information</Text>
          <Text style={styles.cardText}>{community.otherInfo}</Text>
        </View>
      </ScrollView>

      {/* Leave Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.leaveButtonText}>Leave the Community</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Page background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16, // Slightly increased
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  name: {
    fontSize: 16, // Slightly increased
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 14, // Slightly increased
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000',
  },
  cardText: {
    fontSize: 13, // Slightly increased
    color: '#444',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  leaveButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#CC8400',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 3,
  },
  leaveButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.8,
  },
});
