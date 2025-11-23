// components/Loader.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

export default function Loader({ visible = false }) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
