import random
import string

from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Board, Memo
from .serializers import UserSerializer, BoardSerializer, MemoSerializer

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']


class MemoViewSet(viewsets.ModelViewSet):
    queryset = Memo.objects.all()
    serializer_class = MemoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['board']

    def get_queryset(self):
        return Memo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
def login_view(request):
    email = request.data.get('username')  # 프론트는 username 키에 이메일을 담아서 보내고 있음
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': '존재하지 않는 이메일입니다.'}, status=401)

    if user_obj.check_password(password):
        return Response({
            'id': user_obj.id,
            'username': user_obj.username,
            'nickname': user_obj.nickname,
        }, status=200)
    else:
        return Response({'error': '비밀번호가 틀렸습니다.'}, status=401)


@api_view(['POST'])
def signup_view(request):
    print("✅ 회원가입 요청 받음") 

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
        user.save()  # 이 줄이 없어도 create_user는 저장하지만 명시적으로 써줘도 좋아
        return Response({'message': '회원가입이 완료되었습니다.'}, status=201)
    except Exception as e:
        print("❌ 회원가입 오류 발생:", str(e))  # 로그 찍기!
        return Response({'error': f'서버 오류: {str(e)}'}, status=500)

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


def generate_temp_password(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
