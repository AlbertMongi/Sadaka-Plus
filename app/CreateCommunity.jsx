import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const ORANGE = '#DD863C';

export default function CreateCommunityScreen() {
  const router = useRouter();

  const [communityName, setCommunityName] = useState('');
  const [hasGroups, setHasGroups] = useState('YES');
  const [imageUri, setImageUri] = useState(null);
  const [groups, setGroups] = useState([{ name: '', description: '' }]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'Sorry, we need camera roll permissions to let you choose a photo!'
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const addGroup = () => {
    setGroups([...groups, { name: '', description: '' }]);
  };

  const handleCreate = () => {
    // Optionally validate fields here
    router.push('/CommunityList');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back-outline" size={22} color={ORANGE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Communities</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Profile Image Circle */}
        <TouchableOpacity
          style={styles.imageCircle}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.pickedImage} />
          ) : (
            <MaterialCommunityIcons name="account-group" size={42} color={ORANGE} />
          )}
          <View style={styles.cameraCircle}>
            <Ionicons name="camera-outline" size={18} color={ORANGE} />
          </View>
        </TouchableOpacity>

        {/* Community Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>What is your community name</Text>
          <TextInput
            style={styles.input}
            placeholder="Community Name"
            value={communityName}
            onChangeText={setCommunityName}
            placeholderTextColor="#bbb"
          />
        </View>

        {/* Groups Picker */}
        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>Do you have groups in your community</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={hasGroups}
              onValueChange={setHasGroups}
              style={styles.picker}
              dropdownIconColor={ORANGE}
              mode="dropdown"
            >
              <Picker.Item label="YES" value="YES" />
              <Picker.Item label="NO" value="NO" />
            </Picker>
            <Ionicons name="chevron-down-outline" size={18} color={ORANGE} style={styles.pickerIcon} />
          </View>
        </View>

        {/* Groups Section */}
        {hasGroups === 'YES' && (
          <TouchableOpacity style={styles.addGroupRow} onPress={addGroup}>
            <View style={styles.addIcon}>
              <Ionicons name="add-outline" size={18} color={ORANGE} />
            </View>
            <Text style={styles.addGroupText}>Add another group</Text>
          </TouchableOpacity>
        )}

        {/* Create button */}
        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.8}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>Create the community</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 30 : 40,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.4,
  },
  imageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.2,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 30,
    position: 'relative',
    backgroundColor: '#fff',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  pickedImage: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  cameraCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#fff',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: '#bbb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 9,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#444',
    backgroundColor: '#fafafa',
  },
  pickerContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    height: 42,
    justifyContent: 'center',
    position: 'relative',
  },
  picker: {
    width: '100%',
    height: 42,
    color: '#444',
  },
  pickerIcon: {
    position: 'absolute',
    right: 10,
    top: 11,
    pointerEvents: 'none',
  },
  addGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 10,
  },
  addIcon: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addGroupText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: ORANGE,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
