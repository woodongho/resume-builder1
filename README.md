# 🚀 AI Resume & Portfolio Builder

사용자의 기본 정보와 경력 사항을 입력받아 **Google Gemini API**를 통해 최적화된 국문 이력서(Resume)와 포트폴리오(Portfolio)를 자동으로 작성해 주는 **Flask 기반 풀스택 웹 애플리케이션**입니다.

---

## 📌 주요 특징 및 기능

1. **직관적인 정보 입력 폼**
   - 이름, 지원 직무, 문체 및 어조(Tone), 경력 사항, 프로젝트 경험 입력
   - **프론트엔드 & 백엔드 양방향 입력값 유효성 검사(Validation)** 적용

2. **맞춤형 AI 프롬프트 모드**
   - **모드 A (일반 / Standard)**: 읽기 쉽고 조화로운 표준 이력서 양식
   - **모드 B (전문가 / Expert)**: STAR(상황, 과제, 행동, 결과) 기법 및 정량적 수치 중심의 심층 이력서

3. **🎨 디자인 이력서 표지 및 컬러 테마 선택**
   - 🍊 **산뜻한 오렌지 (Orange)**: 생기 있고 눈에 띄는 웜톤 표지 (표지 카드 + 아바타 + 온라인 확인 도장)
   - 👔 **전문적인 네이비 (Navy)**: 비즈니스 신뢰감을 주는 정통 딥블루 테마
   - 🌿 **깔끔한 모던 (Modern)**: 군더더기 없는 미니멀 에메랄드/슬레이트 테마

4. **결과 활용 편의 기능**
   - **실시간 마크다운 렌더링**: [Marked.js](https://marked.js.org/)를 이용한 깔끔한 서식 출력
   - **📋 원클릭 결과 복사**: 클립보드 자동 복사
   - **💾 Markdown (.md) 다운로드**: 지원자 이름이 포함된 파일명으로 자동 저장

5. **보안 및 안정성**
   - API Key는 오직 로컬의 `.env` 파일에서만 안전하게 로드
   - `.gitignore` 설정을 통해 API Key 및 가상환경(`venv/`)의 Git 업로드 원천 차단
   - 상세한 백엔드 로깅(요청, 응답 글자 수, 통신 오류) 및 친절한 사용자 오류 안내

---

## 📂 프로젝트 폴더 구조

```text
resume-builder/
├── app.py                  # Flask 백엔드 서버 및 Gemini API 라우트
├── requirements.txt        # 파이썬 의존성 패키지 목록
├── .env                    # 실제 API Key 저장 파일 (Git 추적 제외)
├── .env.example            # 환경변수 설정 가이드 견본
├── .gitignore              # Git 무시 파일 및 폴더 목록
├── README.md               # 프로젝트 매뉴얼
├── sample/
│   └── sample1.png         # 이력서 디자인 양식 참고 샘플
├── templates/
│   └── index.html          # 프론트엔드 웹 화면 템플릿
└── static/
    ├── css/
    │   └── style.css       # 반응형 2단 그리드 및 테마 스타일시트
    └── js/
        └── app.js          # 비동기 API 통신, 검증, 복사/다운로드 스크립트
```

---

## 🛠️ 기술 스택 (Tech Stack)

- **Backend**: Python 3, Flask, python-dotenv, google-genai
- **Frontend**: HTML5, CSS3, JavaScript (ES6+ Fetch API), Marked.js
- **AI Model**: Google Gemini API (`gemini-3.5-flash-lite`)
- **Version Control**: Git

---

## 🚀 빠른 시작 가이드 (Getting Started)

Windows PowerShell 기준으로 아래 순서대로 실행합니다.

### 1. 가상환경 생성 및 활성화

```powershell
# 가상환경 생성
py -m venv venv

# 가상환경 활성화
.\venv\Scripts\Activate.ps1
```
> *(venv)가 터미널 줄 맨 앞에 표시되는지 확인합니다.*

### 2. 필요한 패키지 설치

```powershell
py -m pip install -r requirements.txt
```

### 3. 환경변수(.env) 설정

1. 프로젝트 루트에 `.env` 파일을 생성합니다.
2. [Google AI Studio](https://aistudio.google.com/)에서 무료로 발급받은 본인의 API Key를 입력합니다:

```env
GEMINI_API_KEY=AIzaSy...본인의_실제_API키
```

### 4. 웹 애플리케이션 실행

```powershell
py app.py
```

### 5. 브라우저 접속

웹 브라우저를 열고 다음 로컬 주소로 접속합니다:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 💡 사용 방법

1. **기본 정보 입력**: 이름, 지원 직무, 원하는 어조(Tone)를 선택합니다.
2. **모드 & 테마 선택**:
   - 프롬프트 모드 (모드 A 일반 / 모드 B 전문가)
   - 디자인 테마 (산뜻한 오렌지 / 전문적인 네이비 / 깔끔한 모던)
3. **경력 및 프로젝트 작성**: 간략한 이력과 담당한 프로젝트를 자유롭게 작성합니다.
4. **생성하기**: `[✨ AI 이력서 & 포트폴리오 생성하기]` 버튼을 누릅니다.
5. **결과 활용**: 완성된 이력서 표지와 본문을 확인한 후 `[결과 복사]` 또는 `[Markdown 다운로드]`를 실행합니다.

---

## 📄 라이선스 (License)

This project is open-source and free to use for educational and personal portfolio purposes.
