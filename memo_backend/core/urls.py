from django.urls import path, include
from .views import signup_view, login_view, UserViewSet, BoardViewSet, MemoViewSet
from rest_framework.routers import DefaultRouter
from .views import reset_password_view

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'boards', BoardViewSet)
router.register(r'memos', MemoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view),
    path('signup/', signup_view),
    path('reset-password/', reset_password_view),
]
