// 파리낚시 서비스워커 — 오프라인 지원
// v3: index.html은 "네트워크 우선"으로 바꿔서, 배포할 때마다 sw.js를 안 건드려도
//     인터넷이 연결돼 있으면 항상 최신 버전을 받아오도록 수정.
const CACHE = "flyfishing-v3";

// 자주 안 바뀌는 정적 자원 — 캐시 우선(오프라인/속도 최적화)
const STATIC_ASSETS = [
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./bgm.mp3",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
];

// 게임 본체 — 네트워크 우선(항상 최신 버전을 받아오려는 대상)
const NETWORK_FIRST_PATHS = ["./", "./index.html"];

function isNetworkFirst(url) {
  const path = url.pathname;
  return (
    NETWORK_FIRST_PATHS.some((p) => url.href.endsWith(p.replace("./", "/"))) ||
    path === "/" ||
    path.endsWith("/index.html")
  );
}

// 설치: 정적 자원만 미리 캐싱 (index.html은 여기서 강제로 안 넣음 — fetch 시 항상 새로 받아옴)
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => Promise.allSettled(STATIC_ASSETS.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 옛 캐시 정리 + 즉시 모든 탭 장악
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // ── index.html(게임 본체): 네트워크 우선, 실패하면(오프라인) 캐시로 폴백 ──
  if (isNetworkFirst(url) || e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  // ── 그 외 정적 자원: 캐시 우선, 없으면 네트워크에서 받아와 캐시에 저장 ──
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("./index.html")); // 오프라인 폴백
    })
  );
});
