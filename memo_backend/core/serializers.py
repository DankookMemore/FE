from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Board, Memo
from django.contrib.auth.models import User 

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'nickname', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
            email=validated_data['email']
        )
        return user


class BoardSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Board
        fields = [
            'id', 'title', 'category', 'summary', 'is_completed',
            'user', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class MemoSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Memo
        fields = ['id', 'board', 'content', 'timestamp', 'is_finished', 'summary', 'user']
        read_only_fields = ['id', 'timestamp', 'summary', 'user']
