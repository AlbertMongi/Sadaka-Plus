import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const UpliftingScreen = () => {
  const navigation = useNavigation();

  // Example notification state (can come from API or props later)
  const [hasNotification, setHasNotification] = useState(true);

  const verseText = `“Fear not, for I am with you;
be not dismayed, for I am your God;
I will strengthen you, I will help you,
I will uphold you with my righteous hand.”
Isaiah 41:10`;

  // Handle share
  const onShare = async () => {
    try {
      await Share.share({
        message: verseText,
      });
    } catch (error) {
      console.log('Error sharing:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Uplifting</Text>

        {/* Notification Icon */}
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => navigation.navigate('Notification')}
        >
          <Icon name="notifications-outline" size={24} color="#FFA500" />
          {/* {hasNotification && <View style={styles.dot} />} */}
        </TouchableOpacity>
      </View>

      {/* Verse Content */}
      <View style={styles.content}>
        <Text style={styles.verse}>
          “Fear not, for I am with{'\n'}
          you;{'\n'}
          be not dismayed, for I{'\n'}
          am your God;{'\n'}
          I will strengthen you, I{'\n'}
          will help you,{'\n'}
          I will uphold you with my{'\n'}
          righteous hand.”
        </Text>
        <Text style={styles.reference}>Isaiah 41:10</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Icon name="bookmark-outline" size={22} color="#666" />
          <Text style={styles.footerText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem} onPress={onShare}>
          <Icon name="share-social-outline" size={22} color="#666" />
          <Text style={styles.footerText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <Icon name="play-circle-outline" size={22} color="#666" />
          <Text style={styles.footerText}>Next Verse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'GothamBold',
    color: '#000',
  },
  bellContainer: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00AEEF',
  },
  // CONTENT
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  verse: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    color: '#000',
    fontFamily: 'GothamMedium', 
  },
  reference: {
    fontSize: 18,
    color: '#FF9500',
    marginTop: 15,
    textAlign: 'center',
    fontFamily: 'GothamBold', 
  },
  // FOOTER
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'GothamMedium', 
  },
});

export default UpliftingScreen;