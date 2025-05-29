import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width > 500 ? 400 : '90%';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9ef',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 20,
    width: 600,
    height: 580,
    opacity: 0.5,
    zIndex: -1,
  },
  card: {
    width: cardWidth,
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
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 32,
    color: '#6b4226',
  },
  input: {
    height: 48,
    borderColor: '#dcdcdc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    color: '#333',
    backgroundColor: '#fdfdfd',
  },
  loginButton: {
    backgroundColor: '#deb887',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#1b1b1b',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    color: '#6b4226',
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  separator: {
    color: '#aaa',
  },
});
