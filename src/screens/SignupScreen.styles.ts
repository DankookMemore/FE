import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const contentWidth = screenWidth > 500 ? 400 : '90%';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9ef',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: contentWidth,
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#deb887',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b4226',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#deb887',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#1b1b1b',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    color: '#6b4226',
    fontSize: 16,
    textAlign: 'center',
  },
});