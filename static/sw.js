/**
 * AI Resume & Portfolio Builder - Service Worker
 */

const CACHE_NAME = "resume-builder-v1";

// 사전 캐싱할 정적 파일 목록
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/static/css/style.css",
  "/static/js/app.js",
  "/static/icons/icon-192.png",
  "/static/icons/icon-512.png"
];

// 1. Service Worker 설치: 정적 자원 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // 새로운 Service Worker가 대기 상태에 머물지 않고 즉시 활성화
  self.skipWaiting();
});

// 2. Service Worker 활성화: 이전 버전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // 활성화 즉시 현재 클라이언트를 제어
  self.clients.claim();
});

// 3. 네트워크 요청 가로채기 (Fetch)
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // AI 생성 요청(POST /generate) 등 GET이 아닌 요청은 Service Worker가 개입하지 않고 네트워크로 직접 전달
  if (request.method !== "GET") {
    return;
  }

  // Network First 전략 (네트워크 우선 시도 후 실패 시 캐시 반환)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 유효한 응답이면 복사본을 캐시에 업데이트
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        // 네트워크 연결 실패(오프라인) 시 캐시에서 탐색
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 페이지 탐색 요청인 경우 루트 페이지 캐시 반환
        if (request.mode === "navigate") {
          return caches.match("/");
        }
      })
  );
});
