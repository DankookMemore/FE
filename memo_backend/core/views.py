import random
import string
from openai import OpenAI
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

from .models import Board, Memo
from .serializers import UserSerializer, BoardSerializer, MemoSerializer

User = get_user_model()
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# JWT 토큰 생성 함수
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# 사용자 프로필 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# 로그인
@api_view(['POST'])
def login_view(request):
    email = request.data.get('username')
    password = request.data.get('password')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': '존재하지 않는 이메일입니다.'}, status=401)

    if user.check_password(password):
        tokens = get_tokens_for_user(user)
        return Response({
            'id': user.id,
            'username': user.username,
            'nickname': user.nickname,
            'token': tokens['access'],
        }, status=200)
    else:
        return Response({'error': '비밀번호가 틀렸습니다.'}, status=401)

# 회원가입
@api_view(['POST'])
def signup_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    nickname = request.data.get('nickname')
    email = request.data.get('email')

    if not username or not password or not nickname or not email:
        return Response({'error': '모든 필드를 입력해주세요.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': '이미 사용 중인 아이디입니다.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': '이미 등록된 이메일입니다.'}, status=400)

    if User.objects.filter(nickname=nickname).exists():
        return Response({'error': '이미 사용 중인 닉네임입니다.'}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            nickname=nickname,
            email=email
        )
        user.save()
        return Response({'message': '회원가입이 완료되었습니다.'}, status=201)
    except Exception as e:
        return Response({'error': f'서버 오류: {str(e)}'}, status=500)

# 비밀번호 재설정
@api_view(['POST'])
def reset_password_view(request):
    username = request.data.get('username')
    new_password = request.data.get('new_password')

    if not username or not new_password:
        return Response({'error': '아이디와 새 비밀번호를 모두 입력해주세요.'}, status=400)

    try:
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        return Response({'message': '비밀번호가 성공적으로 변경되었습니다.'}, status=200)
    except User.DoesNotExist:
        return Response({'error': '해당 사용자를 찾을 수 없습니다.'}, status=404)

# 임시 비밀번호 생성
def generate_temp_password(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# GPT 요약
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def summarize_board_view(request, pk):
    board = get_object_or_404(Board, pk=pk, user=request.user)
    memos = Memo.objects.filter(board=board)
    all_text = "\n".join([memo.content for memo in memos if memo.content.strip() != ""])

    if not all_text:
        return Response({"summary": "요약할 메모가 없습니다."})

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f"다음은 아이디어 메모입니다. 전체 흐름을 고려하여 한 문단으로 핵심만 간결하게 요약해주세요:\n\n{all_text}"
                }
            ],
            max_tokens=300,
            temperature=0.7,
        )

        summary = response.choices[0].message.content.strip()
        board.summary = summary
        board.save()

        return Response({"summary": summary})

    except Exception as e:
        print("❌ GPT 요약 실패:", str(e))
        return Response({"summary": f"[요약 실패] {str(e)}"}, status=500)

# ViewSets
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']

    def get_queryset(self):
        return Board.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MemoViewSet(viewsets.ModelViewSet):
    queryset = Memo.objects.all()
    serializer_class = MemoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['board']

    def get_queryset(self):
        return Memo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
