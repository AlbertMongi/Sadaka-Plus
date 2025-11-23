import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function Success({ route, navigation }) {
  const { groupName } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Successfully joined the{groupName ? ` ${groupName}` : ''} community!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#4BB543', textAlign: 'center', paddingHorizontal: 20 },
});
