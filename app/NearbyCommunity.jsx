
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Haversine formula to get distance in meters
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Radius of Earth in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NearbyCommunity = () => {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearbyChurches, setNearbyChurches] = useState([]);

  const churches = [
    { id: 1, name: "St. Joseph Cathedral", latitude: -6.8145, longitude: 39.2879 },
    { id: 2, name: "Holy Ghost Cathedral", latitude: -6.8161, longitude: 39.289 },
    { id: 3, name: "Azania Front Lutheran Church", latitude: -6.817, longitude: 39.2865 },
    { id: 4, name: "St. Peter’s Oysterbay", latitude: -6.744, longitude: 39.2393 },
    { id: 5, name: "St. Immaculate Church", latitude: -6.825, longitude: 39.3 },
    { id: 6, name: "St. Theresa Catholic Church", latitude: -6.821, longitude: 39.274 },
  ];

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to show nearby communities. Using default location.",
            [{ text: "OK" }]
          );
          setUserLocation({
            latitude: -6.815,
            longitude: 39.288,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setNearbyChurches([]);
          setLoading(false);
          return;
        }

        // Get current location with timeout and balanced accuracy
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds timeout
          mayShowUserSettingsDialog: true, // Android-specific
        });

        const currentLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        // Filter communities within 1km
        const nearby = churches.filter((church) => {
          const distance = getDistanceInMeters(
            currentLocation.latitude,
            currentLocation.longitude,
            church.latitude,
            church.longitude
          );
          return distance <= 1000;
        });

        setUserLocation({
          ...currentLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setNearbyChurches(nearby);
      } catch (error) {
        console.error("Location error:", error);
        let errorMessage = "Failed to get your location. Using default location.";
        if (error.code === "E_LOCATION_TIMEOUT") {
          errorMessage = "Location request timed out. Please try again.";
        } else if (error.code === "E_LOCATION_UNAVAILABLE") {
          errorMessage = "Location services are unavailable on this device.";
        }
        Alert.alert("Error", errorMessage, [{ text: "OK" }]);
        setUserLocation({
          latitude: -6.815,
          longitude: 39.288,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setNearbyChurches([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={{ marginTop: 10 }}>Loading communities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Communities</Text>
        <View style={{ width: 24 }} />
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={userLocation}
        showsUserLocation={true}
        showsMyLocationButton={true}
        liteMode={false} // Full map functionality for both platforms
      >
        {nearbyChurches.length > 0 ? (
          nearbyChurches.map((church) => (
            <Marker
              key={church.id}
              coordinate={{
                latitude: church.latitude,
                longitude: church.longitude,
              }}
              title={church.name}
              // description="Nearby Communities"
            >
              <MaterialIcons name="church" size={24} color="#FF8C00" />
            </Marker>
          ))
        ) : (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="No nearby communities found"
            description="No communities"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  fontFamily: "GothamBold",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "GothamBold",
  },
  map: {
    flex: 1,
    width: "100%",
  },
});

export default NearbyCommunity;       