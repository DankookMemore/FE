from django.contrib import admin
from .models import Board, Memo  # ✅ 너의 모델들 import

admin.site.register(Board)  # ✅ 등록
admin.site.register(Memo)   # ✅ 등록
