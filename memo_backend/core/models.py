from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model

class User(AbstractUser):
    nickname = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)

class Board(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    summary = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Memo(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='memos')
    number = models.AutoField(primary_key=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name='memos')

