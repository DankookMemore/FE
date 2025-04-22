from django.contrib.auth.models import AbstractUser
from django.db import models

# ❌ get_user_model이나 User import 하지 말 것

class User(AbstractUser):
    nickname = models.CharField(max_length=30)
    email = models.EmailField(unique=True)  # 중복 방지

class Board(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    summary = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Memo(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_finished = models.BooleanField(default=False)
    summary = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'{self.user.nickname} - {self.content[:20]}'
