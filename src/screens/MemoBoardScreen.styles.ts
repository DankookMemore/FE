import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const contentWidth = screenWidth > 500 ? 400 : '90%';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9ef',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: contentWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    fontSize: 18,
    marginRight: 12,
    color: '#6b4226',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b4226',
    textAlign: 'center',
  },
  logout: {
    color: 'red',
    fontSize: 16,
  },

  promptBox: {
    width: contentWidth,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  memoBox: {
    width: contentWidth,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  memoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#444',
  },
  memoContent: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },

  input: {
    width: contentWidth,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#fdfdfd',
    color: '#333',
  },
  addButton: {
    width: contentWidth,
    backgroundColor: '#deb887',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#1b1b1b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryButton: {
    width: contentWidth,
    backgroundColor: '#deb887',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryButtonText: {
    color: '#1b1b1b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryBox: {
    width: contentWidth,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
  },

  actionContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
  editText: {
    color: '#2680EB',
  },
  deleteText: {
    color: '#EB4138',
  },
});
