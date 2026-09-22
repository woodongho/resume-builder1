import os
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from dotenv import load_dotenv
from google import genai
from google.genai import errors

# 프로젝트 루트 디렉터리 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. 환경변수(.env) 로드 (루트 디렉터리의 .env 명시)
load_dotenv(os.path.join(BASE_DIR, ".env"))

# 2. 로깅(Logging) 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# 3. Flask 웹 애플리케이션 초기화 (템플릿 및 정적 파일 절대 경로 명시)
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# 4. Gemini API 클라이언트 초기화 함수
def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.error("GEMINI_API_KEY가 환경변수에 설정되어 있지 않습니다.")
        return None
    return genai.Client(api_key=api_key)


# 5. 메인 홈 화면 라우트 (Vercel Serverless 리라이트 경로 호환 지원)
@app.route("/")
@app.route("/api")
@app.route("/api/index")
@app.route("/api/index.py")
def index():
    logger.info("홈페이지(index.html) 접속 요청 (요청 경로: %s)", request.path)
    return render_template("index.html")


# 5-1. PWA 설정 파일 서빙 (루트 경로 및 /api 프리픽스 매핑)
@app.route("/manifest.json")
@app.route("/api/manifest.json")
def manifest():
    static_dir = os.path.join(BASE_DIR, "static")
    return send_from_directory(static_dir, "manifest.json", mimetype="application/manifest+json")


@app.route("/sw.js")
@app.route("/api/sw.js")
def service_worker():
    static_dir = os.path.join(BASE_DIR, "static")
    response = send_from_directory(static_dir, "sw.js", mimetype="application/javascript")
    response.headers["Service-Worker-Allowed"] = "/"
    return response


# 6. AI 이력서 & 포트폴리오 생성 API 라우트
@app.route("/generate", methods=["POST"])
@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json()
    if not data:
        logger.warning("요청 본문이 올바른 JSON 형식이 아닙니다.")
        return jsonify({"success": False, "error": "요청 데이터가 전달되지 않았습니다."}), 400

    name = data.get("name", "").strip()
    role = data.get("role", "").strip()
    experience = data.get("experience", "").strip()
    projects = data.get("projects", "").strip()
    tone = data.get("tone", "전문적이고 신뢰감 있는")
    prompt_type = data.get("prompt_type", "general")

    logger.info("AI 생성 요청 수신 - 이름: %s, 직무: %s, 모드: %s, 톤: %s", name, role, prompt_type, tone)

    if not name:
        return jsonify({"success": False, "error": "이름을 입력해 주세요."}), 400
    if not role:
        return jsonify({"success": False, "error": "지원 직무를 입력해 주세요."}), 400
    if not experience:
        return jsonify({"success": False, "error": "경력 사항을 입력해 주세요."}), 400
    if not projects:
        return jsonify({"success": False, "error": "프로젝트 경험을 입력해 주세요."}), 400

    client = get_gemini_client()
    if not client:
        return jsonify({
            "success": False,
            "error": "Gemini API Key가 설정되지 않았습니다. 환경변수에 올바른 API 키를 입력해 주세요."
        }), 500

    if prompt_type == "expert":
        system_instruction = (
            "당신은 글로벌 테크 기업의 시니어 채용 담당자이자 테크니컬 리크루팅 전문가입니다. "
            "지원자의 역량이 극대화되도록 STAR(Situation, Task, Action, Result) 기법과 "
            "수치화된 성과(Metric), 문제 해결 역량 중심의 전문적인 이력서 및 포트폴리오를 작성하세요."
        )
        user_prompt = f"""
다음 지원자 정보를 바탕으로 채용 담당자의 눈을 사로잡을 수 있는 최고 수준의 국문 이력서(Resume)와 포트폴리오(Portfolio)를 Markdown 형식으로 작성해 주세요.

[지원자 정보]
- 이름: {name}
- 지원 직무: {role}
- 어조 및 스타일(Tone): {tone}
- 주요 경력 사항:
{experience}
- 수행 프로젝트:
{projects}

[작성 요구사항]
1. 문서 구조:
   - Part 1. 이력서 (Resume)
     * 한 줄 프로필 요약 (Impactful One-liner)
     * 핵심 역량 키워드 (Core Competencies)
     * 전문 경력 기술 (STAR 기법 적용: 배경, 과제, 실행한 조치, 정량적 결과)
   - Part 2. 상세 포트폴리오 (Portfolio)
     * 프로젝트별 배경 및 목표
     * 본인의 구체적 기여도 및 사용 기술 스택
     * 기술적 난제 해결 과정(Problem Solving) 및 구체적 비즈니스/기술적 성과
2. 어조: '{tone}' 분위기를 철저히 반영하되, 설득력 있고 전문적인 어휘를 사용하세요.
3. 출력 형식: 깔끔하게 서식화된 Markdown 문법(#, ##, -, **굵게** 등)을 사용하세요.
"""
    else:
        system_instruction = (
            "당신은 친절하고 전문적인 커리어 컨설턴트입니다. "
            "지원자의 강점이 잘 드러나도록 깔끔하고 가독성 높은 표준 이력서와 포트폴리오를 작성해 주세요."
        )
        user_prompt = f"""
다음 지원자 정보를 바탕으로 깔끔하고 가독성 높은 국문 이력서(Resume)와 포트폴리오(Portfolio)를 Markdown 형식으로 작성해 주세요.

[지원자 정보]
- 이름: {name}
- 지원 직무: {role}
- 어조 및 스타일(Tone): {tone}
- 주요 경력 사항:
{experience}
- 수행 프로젝트:
{projects}

[작성 요구사항]
1. 문서 구조:
   - Part 1. 이력서 (Resume)
     * 자기소개 및 프로필 요약
     * 보유 기술 및 핵심 강점
     * 주요 경력 사항
   - Part 2. 포트폴리오 (Portfolio)
     * 주요 프로젝트 소개
     * 담당 역할 및 사용 기술
     * 배운 점 및 주요 성과
2. 어조: '{tone}' 스타일에 맞추어 자연스럽고 매력적인 문장으로 작성하세요.
3. 출력 형식: 보기 편한 Markdown 문법(#, ##, -, **굵게** 등)을 적용하세요.
"""

    try:
        logger.info("Gemini 모델 호출 시작 (model: gemini-2.5-flash-lite)")
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=f"{system_instruction}\n\n{user_prompt}"
        )

        generated_text = response.text
        if not generated_text:
            raise ValueError("AI로부터 비어 있는 응답이 반환되었습니다.")

        logger.info("Gemini 응답 생성 성공 (응답 글자 수: %d자)", len(generated_text))
        return jsonify({
            "success": True,
            "result": generated_text
        })

    except errors.APIError as e:
        logger.error("Gemini API 호출 오류: %s", str(e))
        return jsonify({
            "success": False,
            "error": f"Gemini API 통신 중 오류가 발생했습니다: {e.message if hasattr(e, 'message') else str(e)}"
        }), 502
    except Exception as e:
        logger.error("서버 내부 예외 발생: %s", str(e), exc_info=True)
        return jsonify({
            "success": False,
            "error": f"서버 처리 중 오류가 발생했습니다: {str(e)}"
        }), 500


# 7. 에러 핸들러 (Vercel 환경에서의 디버깅 및 명확한 오류 안내)
@app.errorhandler(404)
def page_not_found(e):
    logger.error("404 Not Found - 요청 경로: %s", request.path)
    return jsonify({
        "status": 404,
        "error": "Not Found",
        "requested_path": request.path,
        "message": "요청하신 경로를 서버에서 찾을 수 없습니다."
    }), 404


@app.errorhandler(500)
def server_error(e):
    logger.error("500 Server Error - %s", str(e), exc_info=True)
    return jsonify({
        "status": 500,
        "error": "Internal Server Error",
        "detail": str(e)
    }), 500


# 로컬 직접 실행 진입점
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
