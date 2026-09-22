import os
import sys

# 프로젝트 루트 디렉터리를 Python 모듈 검색 경로(sys.path)에 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# app.py에서 초기화된 Flask app 인스턴스 임포트 (Vercel WSGI 진입점)
from app import app
