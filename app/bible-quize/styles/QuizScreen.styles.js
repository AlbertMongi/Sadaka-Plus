import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  questionContainer: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 60,
    marginTop: 10,
  },

  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },

  questionHeader: {
    alignItems: 'center',
    marginBottom: 0,
  },

  questionNumber: {
    backgroundColor: '#E18731',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },

  questionNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'GothamBold',
    letterSpacing: 0.5,
  },

  levelLabel: {
    fontSize: 14,
    color: '#E18731',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'GothamBold',
    marginBottom: 15,
  },

  questionText: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: 'GothamMedium',
  },

  answersContainer: {
    gap: 25,
  },

  answerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    padding: 18,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },

  selectedAnswer: {
    borderColor: '#E18731',
    backgroundColor: '#FFF8F5',
    shadowOpacity: 0.15,
  },

  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  answerLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E18731',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    marginRight: 15,
    fontFamily: 'GothamBold',
  },

  answerText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 22,
    fontFamily: 'GothamRegular',
  },

  selectedAnswerText: {
    color: '#333333',
    fontFamily: 'GothamMedium',
  },

  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    elevation: 5,
  },

  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  disabledButton: {
    backgroundColor: '#F8F8F8',
    shadowOpacity: 0,
    elevation: 0,
  },

  navButtonText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'GothamBold',
  },

  disabledButtonText: {
    color: '#CCCCCC',
    fontFamily: 'GothamRegular',
  },

  submitButton: {
    backgroundColor: '#E18731',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: '#E18731',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'GothamBold',
    letterSpacing: 1,
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  loadingText: {
    fontSize: 18,
    color: '#666666',
    fontFamily: 'GothamMedium',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    fontFamily: 'GothamBold',
    textAlign: 'center',
  },
});
