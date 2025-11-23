import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  dateContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },

  dateBox: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  dateDaySection: {
    backgroundColor: '#E18731',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateMonthSection: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateDayText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'GothamBold',
  },

  dateMonthText: {
    fontSize: 18,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontFamily: 'GothamBold',
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },

  iconContainer: {
    marginBottom: 20,
  },

  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E18731',
  },

  iconPlaceholderText: {
    fontSize: 40,
    fontFamily: 'GothamBold',
  },

  titleText: {
    fontSize: 32,
    color: '#E17731',
    marginBottom: 20,
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: 'GothamBold',
  },

  welcomeText: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 50,
    textAlign: 'center',
    fontFamily: 'GothamRegular',
  },

  buttonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.8,
    marginTop: 20,
  },

  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E17731',
    opacity: 0.3,
  },

  playButton: {
    backgroundColor: '#E17731',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 20,
    shadowColor: '#E17731',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'GothamBold',
  },
});
