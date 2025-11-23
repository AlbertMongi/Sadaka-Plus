import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function JoinScreen({ navigation }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState('');

  const onJoinPress = () => {
    if (name.trim() === '' || group === '') {
      alert('Please enter your name and select a group.');
      return;
    }
    navigation.navigate('Success');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#FF8C00" />
        </TouchableOpacity>
      </View>

      {/* Community Info */}
      <View style={styles.community}>
        <Image
          source={{ uri: 'https://i.imgur.com/J3Yahqv.png' }}
          style={styles.communityImage}
        />
        <Text style={styles.communityName}>Man of Victory</Text>
        <Text style={styles.communitySubtitle}>VCC Club Kawe Dar es Salaam</Text>
        <Text style={styles.communityCreated}>created 2 years ago</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>What is your name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>What group do you want to join in the community</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={group}
            onValueChange={(itemValue) => setGroup(itemValue)}
            style={styles.picker}
            dropdownIconColor="#FF8C00"
          >
            <Picker.Item label="Select a group" value="" />
            <Picker.Item label="Group A" value="Group A" />
            <Picker.Item label="Group B" value="Group B" />
          </Picker>
        </View>

        {/* Additional Description */}
        <TouchableOpacity
          style={styles.addDescription}
          onPress={() => setShowDescription(!showDescription)}
        >
          <Ionicons name="add" size={20} color="#FF8C00" />
          <Text style={styles.addDescriptionText}>Additional description</Text>
        </TouchableOpacity>

        {showDescription && (
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Write something..."
            multiline
            value={description}
            onChangeText={setDescription}
          />
        )}
      </View>

      {/* Join Button */}
      <TouchableOpacity style={styles.joinButton} onPress={onJoinPress}>
        <Text style={styles.joinButtonText}>Join Community</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SuccessScreen({ navigation }) {
  return (
    <View style={styles.successWrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#FF8C00" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.successContent}>
        <Ionicons name="clipboard-outline" size={100} color="#FF8C00" />
        <Text style={styles.successText}>
          <Text style={{ fontWeight: 'bold' }}>You have join the community </Text>
          <Text style={{ fontWeight: 'bold' }}>successfully</Text>
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Join" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Join" component={JoinScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  community: {
    alignItems: 'center',
    marginBottom: 30,
  },
  communityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  communitySubtitle: {
    fontSize: 14,
    color: '#888',
  },
  communityCreated: {
    fontSize: 12,
    color: '#aaa',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: 50,
    overflow: 'hidden',
  },
  picker: {
    color: '#333',
    height: 50,
    width: '100%',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },
  addDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  addDescriptionText: {
    marginLeft: 5,
    color: '#FF8C00',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#FF8C00',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-between',
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#000',
  },
  doneButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
