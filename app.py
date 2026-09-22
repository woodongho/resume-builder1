import os
import sys

# 프로젝트 루트 디렉터리를 sys.path에 등록
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# api/index.py의 Flask app 및 logger 인스턴스 임포트
from api.index import app, logger

# 로컬 실행 진입점 (기존 'python app.py' 실행 방식 100% 유지)
if __name__ == "__main__":
    logger.info("AI Resume & Portfolio Builder 서버 시작: http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
