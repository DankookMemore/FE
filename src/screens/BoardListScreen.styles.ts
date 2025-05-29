import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const contentWidth = screenWidth > 500 ? 400 : '90%';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9ef', // 로그인과 동일한 배경 톤
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
  inner: {
    width: contentWidth,
    backgroundColor: '#ffffff', // 카드 배경
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#deb887', // 따뜻한 브라운 테두리
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap', // 추가: 요소가 넘칠 때 줄바꿈 허용
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 요소 간 간격 추가
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6b4226', // 따뜻한 브라운
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b4226',
    marginBottom: 4,
  },
  logout: {
    fontSize: 12, // 글씨 크기 줄임
    color: 'red',
  },
  boardRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fdfdfd',
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  boardRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardText: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fdfdfd',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#deb887',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#1b1b1b',
    fontSize: 12, // 글씨 크기 줄임
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.64)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '30%',
    maxHeight: '60%',
  },
  searchInput: {
    width: '30%', // 검색 입력 길이 조정
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fdfdfd',
    marginTop: 16,
    marginBottom: 8,
  },
  searchButton: {
    marginLeft: 8,
  },
  searchResults: {
    maxHeight: 100,
    marginTop: 8,
  },
  sectionContainer: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 8,
  marginBottom: 12,
},
});
