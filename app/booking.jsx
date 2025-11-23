import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const pastors = ['Pastor Tony', 'Pastor James', 'Pastor Mary'];
const bookTypes = ['Private', 'Group', 'Online'];

export default function BookingPage() {
  const [selectedPastor, setSelectedPastor] = useState(pastors[0]);
  const [bookType, setBookType] = useState(bookTypes[0]);
  const [note, setNote] = useState('');

  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());

  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const onChangeCheckIn = (event, selectedDate) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) setCheckIn(selectedDate);
  };

  const onChangeCheckOut = (event, selectedDate) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) setCheckOut(selectedDate);
  };

  const formatDate = date => {
    return date.toLocaleDateString();
  };

  const onSubmit = () => {
    // Handle booking submission logic here
    alert(`Booking confirmed:
Pastor: ${selectedPastor}
Check-In: ${formatDate(checkIn)}
Check-Out: ${formatDate(checkOut)}
Book Type: ${bookType}
Note: ${note}`);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Booking Form</Text>

          {/* Pastor Dropdown */}
          <Text style={styles.label}>Select Pastor</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPastor}
              onValueChange={setSelectedPastor}
              style={styles.picker}
              dropdownIconColor="#FF8C00"
            >
              {pastors.map(pastor => (
                <Picker.Item key={pastor} label={pastor} value={pastor} />
              ))}
            </Picker>
          </View>

          {/* Check In */}
          <Text style={styles.label}>Check-In</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowCheckInPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(checkIn)}</Text>
          </TouchableOpacity>
          {showCheckInPicker && (
            <DateTimePicker
              value={checkIn}
              mode="date"
              display="default"
              onChange={onChangeCheckIn}
              minimumDate={new Date()}
            />
          )}

          {/* Check Out */}
          <Text style={styles.label}>Check-Out</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(checkOut)}</Text>
          </TouchableOpacity>
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOut}
              mode="date"
              display="default"
              onChange={onChangeCheckOut}
              minimumDate={checkIn}
            />
          )}

          {/* Book Type Dropdown */}
          <Text style={styles.label}>Book Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bookType}
              onValueChange={setBookType}
              style={styles.picker}
              dropdownIconColor="#FF8C00"
            >
              {bookTypes.map(type => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          {/* Note Input */}
          <Text style={styles.label}>Note</Text>
          <TextInput
            multiline
            numberOfLines={4}
            style={styles.noteInput}
            placeholder="Enter any notes..."
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#000',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  dateText: {
    color: '#000',
    fontSize: 14,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#000',
    marginBottom: 30,
    minHeight: 100,
  },
  button: {
    backgroundColor: '#FF8C00',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 40,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
