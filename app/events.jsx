import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from './apiConfig'; // ✅ Correct path

const GOLD = '#FF8C00';

export default function EventDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/events/${id}`);
        const json = await response.json();
        if (json.success) {
          setEvent(json.data);
        } else {
          console.error('Failed to fetch event:', json.message);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color={GOLD} style={{ marginTop: 20 }} />;
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={GOLD} />
      </TouchableOpacity>

      <Image
        source={{ uri: `https://via.placeholder.com/300x200/00008B/FFFFFF?text=${event.name}` }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.description}>{event.description}</Text>
        <Text style={styles.detail}><Text style={styles.label}>Location ID:</Text> {event.addressId}</Text>
        <Text style={styles.detail}><Text style={styles.label}>Event Date:</Text> {new Date(event.eventDate).toLocaleString()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 12,
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    color: '#444',
  },
  detail: {
    fontSize: 13,
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: GOLD,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 16,
    color: '#999',
  },
});
