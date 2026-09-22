/**
 * ==========================================================================
 * AI Resume & Portfolio Builder - 프론트엔드 스크립트 (app.js)
 * 기능: 폼 검증, 비동기 API 요청(Fetch), 로딩/에러 UI 제어, 마크다운 렌더링,
 *       클립보드 복사, 마크다운(.md) 파일 다운로드
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. 주요 DOM 엘리먼트 가져오기
    const resumeForm = document.getElementById("resumeForm");
    const nameInput = document.getElementById("name");
    const roleInput = document.getElementById("role");
    const toneSelect = document.getElementById("tone");
    const experienceInput = document.getElementById("experience");
    const projectsInput = document.getElementById("projects");
    const submitBtn = document.getElementById("submitBtn");

    // UI 알림 및 상태 뷰 엘리먼트
    const errorBox = document.getElementById("errorBox");
    const placeholderView = document.getElementById("placeholderView");
    const loadingView = document.getElementById("loadingView");
    const resultView = document.getElementById("resultView");
    const actionToolbar = document.getElementById("actionToolbar");

    // 액션 버튼
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    // 생성된 원본 마크다운 텍스트를 저장할 변수
    let currentRawMarkdown = "";

    // 2. 오류 메시지 표시/숨김 헬퍼 함수
    function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove("hidden");
        // 에러 위치로 부드럽게 스크롤
        errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hideError() {
        errorBox.textContent = "";
        errorBox.classList.add("hidden");
    }

    // 3. 폼 제출(Submit) 이벤트 핸들러
    resumeForm.addEventListener("submit", async (e) => {
        // 폼 제출 시 브라우저 새로고침 방지
        e.preventDefault();
        hideError();

        // 3-1. 사용자 입력값 가져오기 및 공백 제거
        const name = nameInput.value.trim();
        const role = roleInput.value.trim();
        const tone = toneSelect.value;
        const experience = experienceInput.value.trim();
        const projects = projectsInput.value.trim();

        // 선택된 라디오 버튼 모드(general vs expert) 값 확인
        const selectedRadio = document.querySelector('input[name="prompt_type"]:checked');
        const promptType = selectedRadio ? selectedRadio.value : "general";

        // 선택된 표지 및 디자인 테마(orange vs navy vs modern) 확인
        const selectedThemeRadio = document.querySelector('input[name="resume_theme"]:checked');
        const resumeTheme = selectedThemeRadio ? selectedThemeRadio.value : "orange";

        // 3-2. 프론트엔드 유효성 검사 (Validation)
        if (!name) {
            showError("이름을 입력해 주세요.");
            nameInput.focus();
            return;
        }
        if (!role) {
            showError("지원 직무를 입력해 주세요.");
            roleInput.focus();
            return;
        }
        if (!experience) {
            showError("주요 경력 사항을 입력해 주세요.");
            experienceInput.focus();
            return;
        }
        if (!projects) {
            showError("수행 프로젝트 경험을 입력해 주세요.");
            projectsInput.focus();
            return;
        }

        // 3-3. 로딩 상태 UI 전환
        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ AI가 작성 중입니다...";
        placeholderView.classList.add("hidden");
        resultView.classList.add("hidden");
        actionToolbar.classList.add("hidden");
        loadingView.classList.remove("hidden");

        // 3-4. Flask 백엔드 (/generate) 비동기 통신
        try {
            const requestPayload = {
                name: name,
                role: role,
                tone: tone,
                prompt_type: promptType,
                experience: experience,
                projects: projects
            };

            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestPayload)
            });

            const data = await response.json();

            // 백엔드 처리 결과 확인
            if (!response.ok || !data.success) {
                throw new Error(data.error || "이력서 생성 중 문제가 발생했습니다.");
            }

            // 3-5. 성공 시 결과 화면 표시
            currentRawMarkdown = data.result;

            // sample1.png 스타일의 디자인 이력서 표지(Cover Card) HTML 생성
            const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
            const stampName = name.length >= 3 ? name.slice(-2) : name;
            const coverCardHtml = `
                <div class="resume-cover-card">
                    <div class="cover-banner">
                        <div class="cover-left">
                            <span class="cover-label">이력서 · RESUME</span>
                            <h2 class="cover-name">${name}</h2>
                            <div class="cover-role-badge">
                                <span>지원직무:</span>
                                <strong>${role}</strong>
                            </div>
                        </div>
                        <div class="cover-right">
                            <div class="cover-avatar" title="지원자 프로필">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                            <div class="cover-stamp" title="온라인 검증 완료 도장">
                                <span class="cover-stamp-name">${stampName}</span>
                                <span>확인완료</span>
                            </div>
                        </div>
                    </div>
                    <div class="cover-meta-bar">
                        <span>📅 작성일: ${today}</span>
                        <span>✨ 스타일: ${tone}</span>
                    </div>
                </div>
            `;

            // 선택된 테마 클래스를 적용 (theme-orange, theme-navy, theme-modern)
            resultView.className = `result-content markdown-body theme-${resumeTheme}`;

            // Marked.js 라이브러리를 사용하여 마크다운을 깔끔한 HTML로 변환 후 표지와 결합
            if (typeof marked !== "undefined" && marked.parse) {
                resultView.innerHTML = coverCardHtml + marked.parse(currentRawMarkdown);
            } else {
                resultView.innerHTML = coverCardHtml + `<pre style="white-space: pre-wrap;">${currentRawMarkdown}</pre>`;
            }

            loadingView.classList.add("hidden");
            resultView.classList.remove("hidden");
            actionToolbar.classList.remove("hidden");

        } catch (error) {
            console.error("생성 중 오류 발생:", error);
            showError(error.message || "서버와 통신할 수 없습니다. 서버가 켜져 있는지 확인해 주세요.");

            // 오류 시 로딩 해제 후 플레이스홀더 복구
            loadingView.classList.add("hidden");
            if (!currentRawMarkdown) {
                placeholderView.classList.remove("hidden");
            }
        } finally {
            // 버튼 상태 원상 복구
            submitBtn.disabled = false;
            submitBtn.textContent = "✨ AI 이력서 & 포트폴리오 생성하기";
        }
    });

    // 4. 결과 복사 버튼 기능
    copyBtn.addEventListener("click", async () => {
        if (!currentRawMarkdown) {
            alert("복사할 결과 내용이 없습니다.");
            return;
        }

        try {
            await navigator.clipboard.writeText(currentRawMarkdown);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "✅ 복사 완료!";
            copyBtn.style.backgroundColor = "#dcfce7";
            copyBtn.style.color = "#15803d";

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = "";
                copyBtn.style.color = "";
            }, 2000);
        } catch (err) {
            console.error("클립보드 복사 실패:", err);
            // 클립보드 API 미지원 환경 대비 폴백
            fallbackCopyText(currentRawMarkdown);
        }
    });

    // 5. 마크다운 파일(.md) 다운로드 기능
    downloadBtn.addEventListener("click", () => {
        if (!currentRawMarkdown) {
            alert("다운로드할 결과 내용이 없습니다.");
            return;
        }

        const userName = nameInput.value.trim() || "지원자";
        const fileName = `${userName}_이력서_포트폴리오.md`;

        // 마크다운 텍스트를 담은 Blob 객체 생성
        const blob = new Blob([currentRawMarkdown], { type: "text/markdown;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // 가상 링크 요소를 만들어 클릭 이벤트 발생
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // 사용한 임시 링크와 URL 정리
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // 구형 브라우저 클립보드 복사 보조 함수
    function fallbackCopyText(text) {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = text;
        tempTextArea.style.position = "fixed";
        tempTextArea.style.left = "-9999px";
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand("copy");
            alert("결과가 클립보드에 복사되었습니다!");
        } catch (e) {
            alert("복사에 실패했습니다. 직접 내용을 드래그하여 복사해 주세요.");
        }
        document.body.removeChild(tempTextArea);
    }

    // 6. PWA Service Worker 등록 및 설치(Install) 프롬프트 연동
    const installPwaBtn = document.getElementById("installPwaBtn");
    let deferredPrompt = null;

    // 6-1. Service Worker 등록
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js")
                .then((registration) => {
                    console.log("[PWA] Service Worker 등록 성공 (Scope):", registration.scope);
                })
                .catch((error) => {
                    console.error("[PWA] Service Worker 등록 실패:", error);
                });
        });
    }

    // 6-2. PWA 설치 가능 시점 감지 (Chrome, Edge 등)
    window.addEventListener("beforeinstallprompt", (e) => {
        // 브라우저 기본 미니 정보 표시줄 방지
        e.preventDefault();
        deferredPrompt = e;
        // 사용자에게 설치 버튼 노출
        if (installPwaBtn) {
            installPwaBtn.classList.remove("hidden");
        }
    });

    // 6-3. 설치 버튼 클릭 시 프롬프트 팝업 표시
    if (installPwaBtn) {
        installPwaBtn.addEventListener("click", async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log("[PWA] 설치 선택 결과:", outcome);
            deferredPrompt = null;
            installPwaBtn.classList.add("hidden");
        });
    }

    // 6-4. 설치 완료 시 버튼 숨김
    window.addEventListener("appinstalled", () => {
        console.log("[PWA] 앱이 성공적으로 설치되었습니다.");
        if (installPwaBtn) {
            installPwaBtn.classList.add("hidden");
        }
        deferredPrompt = null;
    });
});
