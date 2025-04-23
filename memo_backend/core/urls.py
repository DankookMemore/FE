from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, MemoViewSet, UserViewSet

from .views import (
    signup_view,
    login_view,
    reset_password_view,
    my_profile,
    summarize_board_view,  # ✅ 요약 API import 추가
    UserViewSet,
    BoardViewSet,
    MemoViewSet,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'boards', BoardViewSet)
router.register(r'memos', MemoViewSet)

urlpatterns = [
    path('', include(router.urls)),                      # ViewSet 기반 API들
    path('login/', login_view),                          # 로그인
    path('signup/', signup_view),                        # 회원가입
    path('reset-password/', reset_password_view),        # 비밀번호 초기화
    path('me/', my_profile),                             # 내 정보 조회
    path('boards/<int:pk>/summarize/', summarize_board_view),

]
