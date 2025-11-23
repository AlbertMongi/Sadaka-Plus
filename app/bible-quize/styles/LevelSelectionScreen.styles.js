import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lockedLevelCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  lockIcon: {
    fontSize: 20,
  },
  levelDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 15,
    lineHeight: 20,
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statText: {
    fontSize: 14,
    color: '#95A5A6',
  },
  lockedText: {
    color: '#BDC3C7',
  },
  playButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  unlockRequirement: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  unlockText: {
    color: '#95A5A6',
    fontSize: 14,
  },
});