import React, { useState, useEffect, useRef, useCallback } from "react";

// 파리낚시 — 전국 하천·계곡 순례 + 장비 업그레이드
// 8개 장소(실제 지명/실제 대표 어종). 각 장소마다 물살·어종·배경·해금조건이 다름.
// 해금: 코인 + 최소 장비 합계 레벨. 점수=코인. window.storage 영구 저장.

// ─── 어종 (30여 종) ───
// rarity: 1흔함 2보통 3귀함 4희귀 5전설.  desc: 도감 설명.
const FISH = {
  // 흔함 (rarity 1)
  피라미:   { color: "#9fd3e0", points: 10, holdMs: 1150, size: 1.0, fight: 0, emoji: "🐟", cm: 12, rarity: 1, desc: "하천 중·하류 여울의 대표 잡어. 환경 적응력이 뛰어나다." },
  버들치:   { color: "#b7c98f", points: 12, holdMs: 1100, size: 0.9, fight: 0, emoji: "🐟", cm: 10, rarity: 1, desc: "맑은 계곡 상류에 사는 작은 물고기. 1급수의 지표종." },
  갈겨니:   { color: "#a7c4a0", points: 14, holdMs: 1080, size: 0.95, fight: 0, emoji: "🐟", cm: 14, rarity: 1, desc: "피라미와 닮았지만 눈이 크고 세로 줄무늬가 있다." },
  붕어:     { color: "#d4b483", points: 18, holdMs: 980, size: 1.2, fight: 0, emoji: "🐠", cm: 25, rarity: 1, desc: "어디서나 잘 잡히는 국민 민물고기. 생명력이 강하다." },
  돌고기:   { color: "#9a8c6d", points: 16, holdMs: 1020, size: 0.95, fight: 0, emoji: "🐟", cm: 12, rarity: 1, desc: "주둥이가 뾰족하고 돌 틈을 좋아하는 작은 물고기." },
  모래무지: { color: "#cbbf9a", points: 18, holdMs: 1000, size: 1.05, fight: 0, emoji: "🐟", cm: 15, rarity: 1, desc: "모래 바닥에 몸을 숨기는 습성이 있다." },
  미꾸라지: { color: "#8f7a52", points: 16, holdMs: 1000, size: 0.85, fight: 0, emoji: "🐟", cm: 13, rarity: 1, desc: "진흙 바닥의 미끄러운 몸. 추어탕의 주인공." },
  // 보통 (rarity 2)
  참붕어:   { color: "#c8aa6e", points: 24, holdMs: 940, size: 1.1, fight: 0, emoji: "🐠", cm: 10, rarity: 2, desc: "붕어와 닮은 소형종. 떼지어 다닌다." },
  각시붕어: { color: "#d98fa3", points: 28, holdMs: 900, size: 0.9, fight: 0, emoji: "🐠", cm: 6, rarity: 2, desc: "산란기 수컷이 화려한 혼인색을 띠는 아름다운 종." },
  누치:     { color: "#aeb6b0", points: 30, holdMs: 880, size: 1.4, fight: 1, emoji: "🐠", cm: 40, rarity: 2, desc: "큰 강 중류의 바닥을 누비는 잉어과 물고기." },
  참마자:   { color: "#b0a585", points: 30, holdMs: 870, size: 1.2, fight: 1, emoji: "🐟", cm: 18, rarity: 2, desc: "여울의 모래·자갈 바닥을 좋아하는 날렵한 종." },
  돌마자:   { color: "#a59878", points: 28, holdMs: 880, size: 1.0, fight: 0, emoji: "🐟", cm: 10, rarity: 2, desc: "돌 밑에 붙어 사는 작은 바닥물고기." },
  납자루:   { color: "#bca0c0", points: 26, holdMs: 900, size: 0.95, fight: 0, emoji: "🐠", cm: 8, rarity: 2, desc: "조개에 알을 낳는 독특한 번식 습성을 가졌다." },
  동자개:   { color: "#c9a24f", points: 34, holdMs: 820, size: 1.25, fight: 1, emoji: "🐡", cm: 20, rarity: 2, desc: "노란 몸에 수염이 난 '빠가사리'. 가시에 주의." },
  끄리:     { color: "#9bb0b8", points: 36, holdMs: 800, size: 1.45, fight: 1, emoji: "🐟", cm: 35, rarity: 2, desc: "강한 힘으로 루어를 치는 사나운 육식 어종." },
  // 귀함 (rarity 3)
  메기:     { color: "#6b7a8f", points: 40, holdMs: 780, size: 1.6, fight: 2, emoji: "🐡", cm: 50, rarity: 3, desc: "넓은 입과 긴 수염의 야행성 포식자." },
  미유기:   { color: "#5f7280", points: 44, holdMs: 760, size: 1.4, fight: 2, emoji: "🐡", cm: 25, rarity: 3, desc: "계곡에 사는 메기. '산메기'로 불린다." },
  쏘가리:   { color: "#8a7b4f", points: 50, holdMs: 720, size: 1.5, fight: 2, emoji: "🐡", cm: 40, rarity: 3, desc: "표범 무늬의 최고급 민물 육식어. 맑은 강을 좋아한다." },
  꺽지:     { color: "#6e7d5a", points: 46, holdMs: 740, size: 1.3, fight: 2, emoji: "🐡", cm: 22, rarity: 3, desc: "바위 틈을 지키는 텃세 강한 토종 육식어." },
  강준치:   { color: "#aab6bd", points: 48, holdMs: 720, size: 1.7, fight: 2, emoji: "🐟", cm: 45, rarity: 3, desc: "은빛의 길쭉한 몸. 수면 가까이서 먹이를 노린다." },
  가물치:   { color: "#5a6b4f", points: 55, holdMs: 700, size: 1.8, fight: 3, emoji: "🐍", cm: 60, rarity: 3, desc: "공기호흡도 하는 강인한 포식자. 늪지의 제왕." },
  산천어:   { color: "#7fae9e", points: 52, holdMs: 700, size: 1.45, fight: 2, emoji: "🐟", cm: 30, rarity: 3, desc: "찬 계곡에 사는 연어과. 옆구리에 파마크 무늬." },
  은어:     { color: "#bcd0c4", points: 54, holdMs: 700, size: 1.35, fight: 2, emoji: "🐟", cm: 25, rarity: 3, desc: "수박향이 난다는 맑은 물의 귀공자." },
  쉬리:     { color: "#e0a36a", points: 50, holdMs: 720, size: 1.0, fight: 1, emoji: "🐟", cm: 12, rarity: 3, desc: "오색 띠를 두른 한국 고유종. 1급수에만 산다." },
  // 희귀 (rarity 4)
  잉어:     { color: "#e08f43", points: 65, holdMs: 640, size: 1.9, fight: 3, emoji: "🎏", cm: 60, rarity: 4, desc: "오래 사는 대형 잉어과. 묵직한 손맛을 준다." },
  향어:     { color: "#c98a55", points: 80, holdMs: 620, size: 2.0, fight: 3, emoji: "🎏", cm: 55, rarity: 4, desc: "이스라엘 잉어. 양식으로 들어온 대형종." },
  떡붕어:   { color: "#cdb98a", points: 70, holdMs: 640, size: 1.8, fight: 3, emoji: "🎏", cm: 40, rarity: 4, desc: "몸높이가 높은 대형 붕어. 낚시인의 인기 대상." },
  어름치:   { color: "#b8c4cc", points: 95, holdMs: 600, size: 1.7, fight: 3, emoji: "🐟", cm: 35, rarity: 4, desc: "천연기념물로 지정된 한국 고유종." },
  열목어:   { color: "#d98b9e", points: 110, holdMs: 600, size: 1.75, fight: 3, emoji: "🐟", cm: 50, rarity: 4, desc: "냉수성 연어과. 산란기엔 온몸이 붉게 물든다." },
  // 전설 (rarity 5)
  황쏘가리: { color: "#f0c84a", points: 160, holdMs: 580, size: 1.7, fight: 4, emoji: "🥇", cm: 45, rarity: 5, desc: "한강의 황금빛 쏘가리. 천연기념물." },
  황금잉어: { color: "#ffcf3f", points: 220, holdMs: 560, size: 2.15, fight: 4, emoji: "🥇", cm: 70, rarity: 5, desc: "전설로만 전해지는 황금빛 대물. 행운의 상징." },
};

const FISH_ART = {
  "피라미": `<ellipse cx="48" cy="26" rx="36" ry="10.5" fill="#9fd3e0"/><polygon points="80,26 98,16 98,36" fill="#88c2d2"/> <path d="M40,16 L52,16 L46,11 Z" fill="#7fb8c8"/><path d="M40,36 L54,36 L48,43 Z" fill="#7fb8c8"/> <line x1="24" y1="20" x2="24" y2="32" stroke="#6aa3b3" strokeWidth="2"/><line x1="32" y1="19" x2="32" y2="33" stroke="#6aa3b3" strokeWidth="2"/><line x1="40" y1="19" x2="40" y2="33" stroke="#6aa3b3" strokeWidth="2"/> <circle cx="16" cy="24" r="3" fill="#fff"/><circle cx="15" cy="24" r="1.6" fill="#123"/>`,
  "버들치": `<ellipse cx="48" cy="26" rx="35" ry="9" fill="#b7c98f"/><polygon points="80,26 98,18 98,34" fill="#9eb277"/> <path d="M42,17 L54,17 L48,13 Z" fill="#9eb277"/><path d="M42,35 L54,35 L48,40 Z" fill="#9eb277"/> <g fill="#8a9e65" opacity="0.6"><circle cx="30" cy="24" r="1.2"/><circle cx="42" cy="27" r="1.2"/><circle cx="54" cy="24" r="1.2"/></g> <circle cx="16" cy="24" r="2.8" fill="#fff"/><circle cx="15" cy="24" r="1.5" fill="#123"/>`,
  "갈겨니": `<ellipse cx="48" cy="26" rx="36" ry="10" fill="#a7c4a0"/><polygon points="80,26 98,17 98,35" fill="#8fae88"/> <path d="M40,16 L54,16 L47,12 Z" fill="#8fae88"/><path d="M40,36 L54,36 L47,41 Z" fill="#8fae88"/> <line x1="20" y1="26" x2="74" y2="26" stroke="#7a9b73" strokeWidth="2.4" opacity="0.7"/> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/>`,
  "붕어": `<ellipse cx="46" cy="26" rx="33" ry="14.5" fill="#d4b483"/><polygon points="76,26 98,14 98,38" fill="#c9a972"/> <path d="M40,12 L66,12 L70,8 L46,9 Z" fill="#b89863"/><path d="M40,40 L58,40 L54,46 L44,46 Z" fill="#b89863"/> <circle cx="16" cy="24" r="3.4" fill="#fff"/><circle cx="15" cy="24" r="1.8" fill="#123"/>`,
  "돌고기": `<ellipse cx="48" cy="26" rx="35" ry="9.5" fill="#9a8c6d"/><polygon points="80,26 98,18 98,34" fill="#82765b"/> <path d="M42,17 L54,17 L48,13 Z" fill="#82765b"/> <line x1="22" y1="26" x2="72" y2="26" stroke="#6f6450" strokeWidth="2" opacity="0.6" strokeDasharray="3 2"/> <path d="M13,26 Q8,24 6,26 Q8,28 13,26 Z" fill="#82765b"/> <circle cx="18" cy="24" r="2.8" fill="#fff"/><circle cx="17" cy="24" r="1.5" fill="#123"/>`,
  "모래무지": `<ellipse cx="48" cy="27" rx="36" ry="9" fill="#cbbf9a"/><polygon points="80,27 98,19 98,35" fill="#b5a982"/> <path d="M40,18 L56,18 L50,14 Z" fill="#b5a982"/> <g fill="#9c9070"><circle cx="28" cy="24" r="1.6"/><circle cx="40" cy="26" r="1.6"/><circle cx="52" cy="24" r="1.6"/><circle cx="64" cy="27" r="1.6"/></g> <path d="M13,27 Q8,25 6,27 Q8,29 13,27 Z" fill="#b5a982"/> <circle cx="18" cy="25" r="2.8" fill="#fff"/><circle cx="17" cy="25" r="1.5" fill="#123"/>`,
  "미꾸라지": `<path d="M8,26 Q40,16 76,24 Q88,26 96,28 Q88,30 76,30 Q40,36 8,26 Z" fill="#8f7a52"/> <polygon points="90,27 99,22 99,33" fill="#7d6a45"/> <g fill="#6f5d3c" opacity="0.5"><circle cx="30" cy="23" r="1.3"/><circle cx="44" cy="26" r="1.3"/><circle cx="58" cy="25" r="1.3"/></g> <circle cx="13" cy="24" r="2.2" fill="#fff"/><circle cx="12.5" cy="24" r="1.2" fill="#123"/> <path d="M11,25 Q4,22 1,18" stroke="#7d6a45" strokeWidth="1.1" fill="none"/><path d="M11,27 Q4,30 1,34" stroke="#7d6a45" strokeWidth="1.1" fill="none"/>`,
  "참붕어": `<ellipse cx="46" cy="26" rx="32" ry="12.5" fill="#c8aa6e"/><polygon points="76,26 98,16 98,36" fill="#b3955a"/> <path d="M40,14 L62,14 L66,10 L46,11 Z" fill="#b3955a"/><path d="M40,38 L56,38 L52,44 L44,44 Z" fill="#b3955a"/> <line x1="22" y1="26" x2="70" y2="26" stroke="#a3854a" strokeWidth="1.6" opacity="0.5"/> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/>`,
  "각시붕어": `<ellipse cx="46" cy="26" rx="31" ry="13" fill="#d98fa3"/><polygon points="74,26 98,15 98,37" fill="#c4788d"/> <path d="M40,13 L60,13 L64,9 L46,10 Z" fill="#c4788d"/><path d="M40,39 L56,39 L52,45 L44,45 Z" fill="#7fae9e"/> <line x1="40" y1="26" x2="70" y2="26" stroke="#5f9ec0" strokeWidth="2" opacity="0.7"/> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/>`,
  "누치": `<ellipse cx="46" cy="26" rx="36" ry="11" fill="#aeb6b0"/><polygon points="78,26 98,15 98,37" fill="#969e98"/> <path d="M38,15 L62,15 L66,11 L44,12 Z" fill="#969e98"/><path d="M40,37 L58,37 L54,43 L44,43 Z" fill="#969e98"/> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/> <path d="M13,28 Q7,30 3,29" stroke="#969e98" strokeWidth="1.3" fill="none"/>`,
  "참마자": `<ellipse cx="48" cy="27" rx="36" ry="9.5" fill="#b0a585"/><polygon points="80,27 98,18 98,36" fill="#9a8f6e"/> <path d="M40,18 L56,18 L50,13 Z" fill="#9a8f6e"/> <g fill="#867c5e"><circle cx="30" cy="25" r="1.6"/><circle cx="44" cy="27" r="1.6"/><circle cx="58" cy="25" r="1.6"/></g> <circle cx="17" cy="25" r="2.9" fill="#fff"/><circle cx="16" cy="25" r="1.5" fill="#123"/>`,
  "돌마자": `<ellipse cx="48" cy="27" rx="34" ry="9" fill="#a59878"/><polygon points="78,27 98,19 98,35" fill="#8e8264"/> <path d="M40,18 L54,18 L48,14 Z" fill="#8e8264"/> <g fill="#7a6f54" opacity="0.7"><rect x="28" y="24" width="4" height="3"/><rect x="42" y="25" width="4" height="3"/><rect x="56" y="24" width="4" height="3"/></g> <circle cx="17" cy="25" r="2.8" fill="#fff"/><circle cx="16" cy="25" r="1.5" fill="#123"/>`,
  "납자루": `<ellipse cx="46" cy="26" rx="31" ry="12" fill="#bca0c0"/><polygon points="74,26 98,16 98,36" fill="#a589ab"/> <path d="M40,14 L60,14 L64,10 L46,11 Z" fill="#a589ab"/><path d="M40,38 L56,38 L52,44 L44,44 Z" fill="#a589ab"/> <line x1="38" y1="26" x2="70" y2="26" stroke="#8f7396" strokeWidth="1.8" opacity="0.6"/> <circle cx="16" cy="24" r="3" fill="#fff"/><circle cx="15" cy="24" r="1.6" fill="#123"/>`,
  "동자개": `<ellipse cx="48" cy="27" rx="37" ry="10" fill="#c9a24f"/><polygon points="82,27 98,19 98,35" fill="#b08d3e"/> <path d="M30,18 L70,17 L70,21 Q50,19 30,22 Z" fill="#b08d3e"/> <circle cx="14" cy="25" r="2.6" fill="#fff"/><circle cx="13.5" cy="25" r="1.4" fill="#123"/> <path d="M12,26 Q3,22 0,16" stroke="#b08d3e" strokeWidth="1.3" fill="none"/><path d="M12,28 Q3,33 0,40" stroke="#b08d3e" strokeWidth="1.3" fill="none"/> <path d="M14,29 Q7,34 5,41" stroke="#b08d3e" strokeWidth="1.1" fill="none"/>`,
  "끄리": `<ellipse cx="46" cy="26" rx="37" ry="10.5" fill="#9bb0b8"/><polygon points="80,26 98,15 98,37" fill="#83989f"/> <path d="M40,16 L58,16 L52,11 Z" fill="#83989f"/><path d="M40,36 L56,36 L52,42 L44,42 Z" fill="#83989f"/> <path d="M14,22 L26,24 L14,28 Z" fill="#fff" opacity="0.5"/> <circle cx="16" cy="23" r="3.2" fill="#fff"/><circle cx="15" cy="23" r="1.7" fill="#123"/>`,
  "메기": `<ellipse cx="50" cy="28" rx="40" ry="10" fill="#6b7a8f"/><polygon points="84,28 98,20 98,36" fill="#5d6c80"/> <path d="M30,19 Q50,15 72,20 L72,24 Q50,21 30,23 Z" fill="#5d6c80"/> <path d="M28,34 Q50,40 76,34" stroke="#5d6c80" strokeWidth="3" fill="none"/> <circle cx="14" cy="25" r="2.4" fill="#fff"/><circle cx="13.5" cy="25" r="1.3" fill="#123"/> <path d="M12,27 Q2,22 0,16" stroke="#5d6c80" strokeWidth="1.4" fill="none"/><path d="M12,29 Q2,34 0,42" stroke="#5d6c80" strokeWidth="1.4" fill="none"/><path d="M14,30 Q6,36 4,44" stroke="#5d6c80" strokeWidth="1.2" fill="none"/>`,
  "미유기": `<ellipse cx="50" cy="27" rx="40" ry="8.5" fill="#5f7280"/><polygon points="84,27 98,20 98,34" fill="#516373"/> <path d="M30,33 Q52,39 78,33" stroke="#516373" strokeWidth="3" fill="none"/> <circle cx="14" cy="25" r="2.2" fill="#fff"/><circle cx="13.5" cy="25" r="1.2" fill="#123"/> <path d="M12,26 Q3,22 1,17" stroke="#516373" strokeWidth="1.3" fill="none"/><path d="M12,28 Q3,33 1,40" stroke="#516373" strokeWidth="1.3" fill="none"/>`,
  "쏘가리": `<ellipse cx="48" cy="27" rx="37" ry="12" fill="#8a7b4f"/><polygon points="82,27 98,18 98,38" fill="#7a6c43"/> <path d="M24,16 L78,15 L78,11 L24,12 Z" fill="#6e6038"/> <g fill="#5c5230"><ellipse cx="30" cy="24" rx="3" ry="4"/><ellipse cx="42" cy="28" rx="3" ry="4"/><ellipse cx="54" cy="23" rx="3" ry="4"/><ellipse cx="64" cy="29" rx="3" ry="4"/><ellipse cx="36" cy="32" rx="2.5" ry="3"/><ellipse cx="58" cy="33" rx="2.5" ry="3"/></g> <path d="M40,39 L58,39 L54,45 L44,45 Z" fill="#7a6c43"/> <circle cx="15" cy="25" r="3.2" fill="#ffd86b"/><circle cx="14" cy="25" r="1.7" fill="#123"/>`,
  "꺽지": `<ellipse cx="48" cy="27" rx="34" ry="12.5" fill="#6e7d5a"/><polygon points="78,27 98,17 98,37" fill="#5d6b4b"/> <path d="M26,15 L74,14 L74,11 L26,12 Z" fill="#505d40"/> <g stroke="#4a5639" strokeWidth="3" opacity="0.7"><line x1="30" y1="18" x2="30" y2="36"/><line x1="44" y1="17" x2="44" y2="37"/><line x1="58" y1="18" x2="58" y2="36"/></g> <path d="M40,40 L58,40 L54,45 L44,45 Z" fill="#5d6b4b"/> <circle cx="16" cy="25" r="3.2" fill="#fff"/><circle cx="15" cy="25" r="1.7" fill="#123"/>`,
  "강준치": `<ellipse cx="46" cy="26" rx="38" ry="9.5" fill="#aab6bd"/><polygon points="80,26 98,15 98,37" fill="#929ea5"/> <path d="M40,17 L56,17 L50,12 Z" fill="#929ea5"/><path d="M40,35 L58,35 L54,42 L44,42 Z" fill="#929ea5"/> <path d="M12,21 L26,24 L12,27 Z" fill="#fff" opacity="0.5"/> <circle cx="16" cy="23" r="3.2" fill="#fff"/><circle cx="15" cy="23" r="1.7" fill="#123"/>`,
  "가물치": `<path d="M8,26 Q40,15 78,23 Q90,26 96,28 Q90,30 78,29 Q40,37 8,26 Z" fill="#5a6b4f"/> <polygon points="88,27 99,21 99,33" fill="#4a5a40"/> <path d="M28,30 Q50,34 74,30" stroke="#4a5a40" strokeWidth="3" fill="none" opacity="0.7"/> <g fill="#3e4d36"><ellipse cx="34" cy="24" rx="3" ry="2.4"/><ellipse cx="50" cy="26" rx="3" ry="2.4"/><ellipse cx="64" cy="25" rx="3" ry="2.4"/></g> <circle cx="14" cy="24" r="2.6" fill="#fff"/><circle cx="13.5" cy="24" r="1.4" fill="#123"/>`,
  "산천어": `<ellipse cx="47" cy="26" rx="37" ry="11" fill="#7fae9e"/><polygon points="80,26 98,16 98,36" fill="#6a9989"/> <path d="M44,15 L62,15 L66,11 L50,12 Z" fill="#6a9989"/><path d="M68,18 L76,18 L78,15 L70,16 Z" fill="#6a9989"/> <g fill="#557a6c" opacity="0.8"><ellipse cx="28" cy="26" rx="2.2" ry="4"/><ellipse cx="40" cy="26" rx="2.2" ry="4"/><ellipse cx="52" cy="26" rx="2.2" ry="4"/><ellipse cx="64" cy="26" rx="2.2" ry="4"/></g> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/>`,
  "은어": `<ellipse cx="47" cy="26" rx="38" ry="9.5" fill="#bcd0c4"/><polygon points="80,26 98,17 98,35" fill="#a3b8ac"/> <path d="M44,16 L60,16 L64,12 L48,13 Z" fill="#a3b8ac"/><path d="M66,18 L74,18 L76,15 L68,16 Z" fill="#a3b8ac"/> <ellipse cx="40" cy="24" rx="5" ry="3" fill="#d8c878" opacity="0.6"/> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/>`,
  "쉬리": `<ellipse cx="47" cy="26" rx="37" ry="8.5" fill="#e0a36a"/><polygon points="80,26 98,18 98,34" fill="#c98a55"/> <path d="M42,17 L56,17 L50,13 Z" fill="#c98a55"/> <rect x="14" y="23" width="66" height="2.2" fill="#4a8fc0" opacity="0.8"/><rect x="14" y="27" width="66" height="2.2" fill="#3a6b9a" opacity="0.7"/> <circle cx="16" cy="24" r="2.9" fill="#fff"/><circle cx="15" cy="24" r="1.5" fill="#123"/>`,
  "잉어": `<ellipse cx="46" cy="27" rx="36" ry="15" fill="#e08f43"/><polygon points="80,27 98,15 98,39" fill="#cf8038"/> <path d="M30,13 L70,13 L66,9 L34,10 Z" fill="#c97a34"/><path d="M42,42 L60,42 L56,47 L46,47 Z" fill="#c97a34"/> <g stroke="#c97a34" strokeWidth="1" fill="none" opacity="0.5"><path d="M24,20 Q30,27 24,34"/><path d="M34,18 Q40,27 34,36"/><path d="M46,17 Q52,27 46,37"/></g> <circle cx="16" cy="25" r="3.4" fill="#fff"/><circle cx="15" cy="25" r="1.8" fill="#123"/> <path d="M13,29 Q6,32 2,30" stroke="#c97a34" strokeWidth="1.4" fill="none"/><path d="M13,31 Q6,36 2,38" stroke="#c97a34" strokeWidth="1.4" fill="none"/>`,
  "향어": `<ellipse cx="46" cy="27" rx="36" ry="16" fill="#c98a55"/><polygon points="80,27 98,14 98,40" fill="#b67843"/> <path d="M30,12 L70,12 L66,8 L34,9 Z" fill="#b07440"/><path d="M42,43 L60,43 L56,48 L46,48 Z" fill="#b07440"/> <g fill="#a86c3a" opacity="0.5"><circle cx="30" cy="22" r="2"/><circle cx="44" cy="20" r="2"/><circle cx="40" cy="34" r="2"/></g> <circle cx="16" cy="25" r="3.4" fill="#fff"/><circle cx="15" cy="25" r="1.8" fill="#123"/> <path d="M13,29 Q6,32 2,30" stroke="#b07440" strokeWidth="1.4" fill="none"/>`,
  "떡붕어": `<ellipse cx="46" cy="27" rx="32" ry="17" fill="#cdb98a"/><polygon points="76,27 98,14 98,40" fill="#b8a474"/> <path d="M38,11 L64,11 L68,7 L44,8 Z" fill="#b8a474"/><path d="M40,42 L58,42 L54,48 L44,48 Z" fill="#b8a474"/> <circle cx="16" cy="25" r="3.4" fill="#fff"/><circle cx="15" cy="25" r="1.8" fill="#123"/>`,
  "어름치": `<ellipse cx="46" cy="26" rx="37" ry="11.5" fill="#b8c4cc"/><polygon points="80,26 98,15 98,37" fill="#9fadb6"/> <path d="M38,15 L62,15 L66,11 L44,12 Z" fill="#9fadb6"/><path d="M40,37 L58,37 L54,43 L44,43 Z" fill="#9fadb6"/> <g fill="#7f8d96"><circle cx="30" cy="22" r="1.4"/><circle cx="42" cy="22" r="1.4"/><circle cx="54" cy="22" r="1.4"/><circle cx="36" cy="30" r="1.4"/><circle cx="48" cy="30" r="1.4"/><circle cx="60" cy="30" r="1.4"/></g> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/>`,
  "열목어": `<ellipse cx="47" cy="26" rx="37" ry="12" fill="#d98b9e"/><polygon points="80,26 98,16 98,36" fill="#cd8295"/> <path d="M44,15 L62,15 L66,10 L50,11 Z" fill="#c4788b"/><path d="M68,18 L76,18 L78,14 L70,15 Z" fill="#c4788b"/> <g fill="#a85f72"><circle cx="28" cy="22" r="1.6"/><circle cx="38" cy="27" r="1.6"/><circle cx="48" cy="23" r="1.6"/><circle cx="58" cy="28" r="1.6"/><circle cx="34" cy="31" r="1.4"/><circle cx="54" cy="32" r="1.4"/></g> <circle cx="16" cy="24" r="3.2" fill="#fff"/><circle cx="15" cy="24" r="1.7" fill="#123"/>`,
  "황쏘가리": `<ellipse cx="48" cy="27" rx="37" ry="12" fill="#f0c84a"/><polygon points="82,27 98,18 98,38" fill="#dcb433"/> <path d="M24,16 L78,15 L78,11 L24,12 Z" fill="#d0a82a"/> <g fill="#c89e22"><ellipse cx="30" cy="24" rx="3" ry="4"/><ellipse cx="42" cy="28" rx="3" ry="4"/><ellipse cx="54" cy="23" rx="3" ry="4"/><ellipse cx="64" cy="29" rx="3" ry="4"/></g> <path d="M40,39 L58,39 L54,45 L44,45 Z" fill="#dcb433"/> <circle cx="15" cy="25" r="3.2" fill="#fff"/><circle cx="14" cy="25" r="1.7" fill="#123"/> <text x="50" y="50" fontSize="6" fill="#fff" textAnchor="middle">★</text>`,
  "황금잉어": ` <ellipse cx="46" cy="27" rx="37" ry="16" fill="#f5c63a"/><polygon points="82,27 98,14 98,40" fill="#edb43a"/> <path d="M30,12 L70,12 L66,8 L34,9 Z" fill="#e0a020"/><path d="M42,43 L60,43 L56,48 L46,48 Z" fill="#e0a020"/> <g stroke="#e0a020" strokeWidth="1" fill="none" opacity="0.5"><path d="M24,20 Q30,27 24,34"/><path d="M36,18 Q42,27 36,36"/><path d="M48,17 Q54,27 48,37"/></g> <circle cx="16" cy="25" r="3.6" fill="#fff"/><circle cx="15" cy="25" r="1.9" fill="#123"/> <path d="M13,29 Q6,32 2,30" stroke="#e0a020" strokeWidth="1.4" fill="none"/> <text x="52" y="50" fontSize="7" fill="#fff" textAnchor="middle">★</text>`,
};

const BG_ART = {
  "valley": `<rect width="720" height="130" fill="#bfe0d8"/> <polygon points="0,0 0,360 150,360 120,120 70,60 0,30" fill="#7a9e7c"/> <polygon points="720,0 720,360 560,360 600,140 660,70 720,40" fill="#6e9472"/> <polygon points="60,120 90,60 130,130" fill="#3f6b4a"/><polygon points="100,140 135,70 175,150" fill="#4a7a55"/> <polygon points="600,150 635,80 675,160" fill="#3f6b4a"/><polygon points="555,130 585,75 620,140" fill="#4a7a55"/> <polygon points="250,70 360,20 470,70 470,90 250,90" fill="#9fc4b0" opacity="0.6"/> <rect y="118" width="720" height="6" fill="#ffffff" opacity="0.25"/>`,
  "river": `<rect width="720" height="130" fill="#bfe0ea"/> <path d="M0,90 Q180,55 360,75 Q540,95 720,68 L720,120 L0,120 Z" fill="#8fbf9a"/> <path d="M0,100 Q200,80 400,95 Q560,105 720,90 L720,120 L0,120 Z" fill="#7aae86"/> <ellipse cx="120" cy="80" rx="60" ry="14" fill="#9fc9a8" opacity="0.6"/> <ellipse cx="560" cy="74" rx="80" ry="16" fill="#9fc9a8" opacity="0.5"/> <rect y="118" width="720" height="6" fill="#ffffff" opacity="0.25"/>`,
  "plain": `<rect width="720" height="130" fill="#cfe6cc"/> <path d="M0,95 Q360,70 720,95 L720,120 L0,120 Z" fill="#9ec47e"/> <g stroke="#7fa85f" stroke-width="2"> <line x1="40" y1="118" x2="36" y2="95"/><line x1="55" y1="118" x2="58" y2="92"/><line x1="70" y1="118" x2="66" y2="97"/> <line x1="640" y1="118" x2="636" y2="95"/><line x1="655" y1="118" x2="658" y2="92"/><line x1="670" y1="118" x2="666" y2="97"/> </g> <g fill="#caa84a"><ellipse cx="48" cy="92" rx="3" ry="7"/><ellipse cx="58" cy="89" rx="3" ry="7"/><ellipse cx="650" cy="92" rx="3" ry="7"/><ellipse cx="660" cy="89" rx="3" ry="7"/></g> <rect y="118" width="720" height="6" fill="#ffffff" opacity="0.25"/>`,
  "lake": `<rect width="720" height="130" fill="#c4dde6"/> <polygon points="0,95 120,55 240,90 380,50 520,92 660,60 720,90 720,120 0,120" fill="#8aa6b0" opacity="0.7"/> <polygon points="0,100 160,70 320,98 480,72 640,100 720,85 720,120 0,120" fill="#9fbac4" opacity="0.6"/> <ellipse cx="360" cy="112" rx="300" ry="10" fill="#ffffff" opacity="0.3"/> <rect y="118" width="720" height="6" fill="#ffffff" opacity="0.3"/>`,
  "city": `<rect width="720" height="130" fill="#c6d6e2"/> <g fill="#8a9bb0" opacity="0.85"> <rect x="40" y="50" width="34" height="70"/><rect x="82" y="30" width="28" height="90"/><rect x="118" y="60" width="40" height="60"/> <rect x="540" y="40" width="30" height="80"/><rect x="578" y="62" width="36" height="58"/><rect x="622" y="34" width="26" height="86"/><rect x="654" y="58" width="34" height="62"/> </g> <g fill="#ffe9a8" opacity="0.7"><rect x="48" y="60" width="5" height="6"/><rect x="60" y="75" width="5" height="6"/><rect x="90" y="45" width="5" height="6"/><rect x="628" y="50" width="5" height="6"/><rect x="660" y="70" width="5" height="6"/></g> <path d="M180,118 Q360,70 540,118" stroke="#a05a4a" stroke-width="4" fill="none"/> <g stroke="#a05a4a" stroke-width="2"><line x1="240" y1="100" x2="240" y2="118"/><line x1="300" y1="88" x2="300" y2="118"/><line x1="360" y1="84" x2="360" y2="118"/><line x1="420" y1="88" x2="420" y2="118"/><line x1="480" y1="100" x2="480" y2="118"/></g> <rect y="118" width="720" height="6" fill="#ffffff" opacity="0.25"/>`,
  "jeju": `<rect width="720" height="130" fill="#c4e2dc"/> <polygon points="220,90 360,18 500,90 500,110 220,110" fill="#7aa888"/> <polygon points="330,40 360,18 392,42 375,52 345,52" fill="#5f8a6e"/> <g fill="#ffffff" opacity="0.7"><rect x="120" y="60" width="10" height="58" rx="4"/><rect x="135" y="64" width="8" height="54" rx="4"/></g> <g fill="#5a6b66"><rect x="600" y="98" width="22" height="20" rx="3"/><rect x="628" y="104" width="18" height="14" rx="3"/><rect x="580" y="106" width="16" height="12" rx="3"/></g> <rect y="118" width="720" height="6" fill="#ffffff" opacity="0.25"/>`,
};

const RARITY = {
  1: { name: "흔함", color: "#8a9a92" },
  2: { name: "보통", color: "#4a90c0" },
  3: { name: "귀함", color: "#8a5fc0" },
  4: { name: "희귀", color: "#d08020" },
  5: { name: "전설", color: "#e0b020" },
};

// 도감 완성 보상: 희귀도별 컴플리트 + 전체 컴플리트
const RARITY_REWARD = { 1: 300, 2: 500, 3: 900, 4: 1500, 5: 2500 };
const ALL_REWARD = 5000;
const ALL_TITLE = "🎏 강태공";

// 시간대: 입질에 영향. 밤·새벽이 잘 물린다.
const TIMES = {
  day:    { name: "낮", icon: "☀️", approachMul: 1.0,  overlay: "rgba(255,255,200,0)" },
  sunset: { name: "노을", icon: "🌇", approachMul: 1.15, overlay: "rgba(255,140,60,0.18)" },
  night:  { name: "밤", icon: "🌙", approachMul: 1.3,  overlay: "rgba(20,30,80,0.34)" },
};
// 날씨: 비 오면 입질↑ 페이크↓, 흐림은 약간↑
const SKIES = {
  clear:  { name: "맑음", icon: "☀️", approachMul: 1.0,  fakeMul: 1.0,  overlay: "rgba(0,0,0,0)" },
  cloudy: { name: "흐림", icon: "☁️", approachMul: 1.1,  fakeMul: 0.95, overlay: "rgba(120,130,140,0.16)" },
  rain:   { name: "비", icon: "🌧️", approachMul: 1.25, fakeMul: 0.8,  overlay: "rgba(90,110,140,0.22)" },
};
// 강태공 레벨: 누적 경험치 → 레벨/칭호. 레벨 오를수록 필요 경험치 증가.
const ANGLER_TITLES = [
  { min: 1, name: "낚시 초보" },
  { min: 5, name: "낚시꾼" },
  { min: 10, name: "조사(釣士)" },
  { min: 18, name: "강태공" },
  { min: 28, name: "낚시 명인" },
  { min: 40, name: "낚시의 신" },
];
// 레벨 L까지 누적 필요 경험치 (L레벨 도달 총량)
function expForLevel(L) { return Math.round(120 * (L - 1) + 55 * (L - 1) * (L - 1)); }
function anglerLevelFromExp(exp) {
  let L = 1;
  while (expForLevel(L + 1) <= exp) L++;
  return L;
}
function anglerTitle(level) {
  let t = ANGLER_TITLES[0].name;
  for (const x of ANGLER_TITLES) if (level >= x.min) t = x.name;
  return t;
}
function levelUpReward(level) { return 100 + level * 50; }

// 가상 경쟁자 리더보드. 기준점수(base)는 플레이어 최고점 대비 상대 배율로 분포시킨다.
const RIVALS = [
  { name: "낚시왕 봉현", mul: 1.25, emoji: "👑" },
  { name: "월척사냥꾼", mul: 1.08, emoji: "🎣" },
  { name: "강태공 김씨", mul: 0.95, emoji: "🧓" },
  { name: "떡밥장인 박씨", mul: 0.8, emoji: "🟤" },
  { name: "주말낚시 이씨", mul: 0.62, emoji: "🧢" },
  { name: "초보 최씨", mul: 0.42, emoji: "🐟" },
  { name: "입문자 정씨", mul: 0.28, emoji: "🔰" },
];
// 플레이어 최고점 기준으로 라이벌 점수 산출 + 내 점수 끼워 정렬
function buildLeaderboard(myBest) {
  // 라이벌 점수는 고정 기준점(2200) + 내 최고점의 영향이 약하게. 실력이 늘면 1위까지 추월 가능.
  const anchor = 800 + myBest * 0.5;
  const list = RIVALS.map((r) => ({
    name: r.name, emoji: r.emoji,
    score: Math.round((600 + anchor * r.mul) / 10) * 10,
    me: false,
  }));
  list.push({ name: "나", emoji: "⭐", score: myBest, me: true });
  list.sort((a, b) => b.score - a.score);
  return list;
}

// 장소별 미션 목표 (점수는 해금 난이도 비례)
function spotMissions(spot) {
  const scoreGoal = Math.max(300, Math.round((400 + spot.unlock.coin * 0.12) / 50) * 50);
  const catchGoal = 7 + Math.round(spot.unlock.gearSum / 3);
  // 그 장소에서 잡을 수 있는 가장 높은 희귀도를 '대물' 기준으로 (장소마다 달성 가능하도록)
  const maxRarity = Math.max(...spot.fish.map(([n]) => (FISH[n] ? FISH[n].rarity : 1)));
  const bigTier = Math.min(maxRarity, 3); // 3(귀함) 이상이 있으면 귀함 기준, 없으면 그 장소 최고 등급
  const rname = RARITY[bigTier] ? RARITY[bigTier].name : "희귀";
  return [
    { id: "score", label: `${scoreGoal}점 이상 얻기`, target: scoreGoal },
    { id: "catch", label: `한 판에 ${catchGoal}마리 낚기`, target: catchGoal },
    { id: "big", label: `${rname} 이상 어종 낚기`, target: 1, bigTier },
  ];
}

// ── 빗방울/파문 (비 날씨용, 한 번만 생성) ──
const RAINDROPS = Array.from({ length: 55 }).map(() => ({
  x: Math.random() * 105 - 2,
  len: 14 + Math.random() * 18,
  dur: 0.5 + Math.random() * 0.35,
  delay: -Math.random() * 1.2,
}));
const RAINRIPPLES = Array.from({ length: 14 }).map(() => ({
  x: Math.random() * 100,
  y: 55 + Math.random() * 42,
  dur: 1.2 + Math.random() * 0.9,
  delay: -Math.random() * 2.5,
}));

// 배경 장식 물고기 떼 (잡을 수 없음, 하단을 유유히 헤엄침)
const BGFISH = Array.from({ length: 7 }).map((_, i) => ({
  y: 62 + Math.random() * 32,          // 하단~중하단 (%)
  size: 14 + Math.random() * 16,
  dur: 16 + Math.random() * 16,        // 가로 횡단 시간
  delay: -Math.random() * 30,
  dir: i % 2 === 0 ? 1 : -1,           // 진행 방향
  opacity: 0.12 + Math.random() * 0.16,
}));

function rollWeather() {
  const t = Math.random();
  const time = t < 0.5 ? "day" : t < 0.75 ? "sunset" : "night";
  const s = Math.random();
  const sky = s < 0.55 ? "clear" : s < 0.82 ? "cloudy" : "rain";
  return { time, sky };
}

// 오늘 날짜 키 (YYYY-MM-DD)
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
// 날짜 시드 기반 의사난수 (같은 날 같은 과제)
function seeded(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = Math.imul(h ^ (h >>> 15), 1 | h); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function makeDailyTasks() {
  const date = todayKey();
  const rnd = seeded(date);
  const allFish = Object.keys(FISH);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const tasks = [];
  // 1) 총 N마리 잡기
  const totalN = 8 + Math.floor(rnd() * 8);
  tasks.push({ id: "total", type: "total", target: totalN, prog: 0, reward: 200, label: `물고기 ${totalN}마리 낚기` });
  // 2) 특정 어종 잡기 (흔함~보통 위주)
  const common = allFish.filter((n) => FISH[n].rarity <= 2);
  const fishName = pick(common);
  const fishN = 2 + Math.floor(rnd() * 3);
  tasks.push({ id: "fish", type: "fish", fish: fishName, target: fishN, prog: 0, reward: 300, label: `${fishName} ${fishN}마리 낚기` });
  // 3) 월척(대물/완벽) 또는 콤보
  if (rnd() < 0.5) {
    const comboN = 5 + Math.floor(rnd() * 4);
    tasks.push({ id: "combo", type: "combo", target: comboN, prog: 0, reward: 350, label: `${comboN} 콤보 달성` });
  } else {
    tasks.push({ id: "big", type: "big", target: 1, prog: 0, reward: 350, label: `대물(귀함 이상) 1마리 낚기` });
  }
  return { date, tasks };
}

// ─── 장소(스테이지) ───
// flow: 물살 (물고기 속도배율·입질유지 단축배율). bg: [상단,중단,하단] 색.
// fish: [{name, weight}]. unlock: {coin, gearSum} (gearSum = 세 장비 레벨 합 최소치)
const SPOTS = [
  {
    id: "stream", name: "동네 앞 개울", sub: "잔잔하고 평화로운 첫 낚시터",
    flow: 0.85, fakeBase: 0.18, type: "plain", geo: { lat: 37.39, lon: 126.95 },
    bg: ["#cfeccb", "#7fc4ad", "#3f8f7a"],
    fish: [["피라미", 40], ["붕어", 26], ["갈겨니", 16], ["돌고기", 10], ["모래무지", 8]],
    unlock: { coin: 0, gearSum: 3 },
  },
  {
    id: "cheonggye", name: "청계천", sub: "도심을 흐르는 복원 하천",
    flow: 0.95, fakeBase: 0.2, type: "city", geo: { lat: 37.57, lon: 127.00 },
    bg: ["#d6e7ef", "#6fa8c4", "#356f8a"],
    fish: [["피라미", 30], ["붕어", 24], ["참붕어", 18], ["미꾸라지", 12], ["누치", 9], ["잉어", 7]],
    unlock: { coin: 400, gearSum: 4 },
  },
  {
    id: "seomjin", name: "섬진강", sub: "맑고 너른 남도의 강",
    flow: 1.0, fakeBase: 0.22, type: "river", geo: { lat: 35.20, lon: 127.46 },
    bg: ["#cfe6dd", "#5aa5a0", "#2f7570"],
    fish: [["붕어", 22], ["갈겨니", 18], ["각시붕어", 16], ["납자루", 14], ["참마자", 12], ["메기", 10], ["잉어", 8]],
    unlock: { coin: 900, gearSum: 5 },
  },
  {
    id: "han", name: "한강", sub: "도시를 가로지르는 대형 하천",
    flow: 1.05, fakeBase: 0.24, type: "city", geo: { lat: 37.55, lon: 126.80 },
    bg: ["#cdd8e6", "#5d7fa8", "#33506f"],
    fish: [["잉어", 22], ["붕어", 18], ["떡붕어", 16], ["동자개", 14], ["메기", 12], ["향어", 10], ["황쏘가리", 8]],
    unlock: { coin: 1600, gearSum: 6 },
  },
  {
    id: "soyang", name: "소양강", sub: "물살이 살아있는 강원의 강",
    flow: 1.2, fakeBase: 0.25, type: "lake", geo: { lat: 37.87, lon: 127.73 },
    bg: ["#c9e1e8", "#4f93a8", "#2c6275"],
    fish: [["끄리", 22], ["누치", 18], ["강준치", 16], ["쏘가리", 14], ["잉어", 12], ["가물치", 10], ["돌마자", 8]],
    unlock: { coin: 2600, gearSum: 7 },
  },
  {
    id: "donggang", name: "동강 (영월)", sub: "급류와 절벽의 청정 계곡",
    flow: 1.4, fakeBase: 0.27, type: "valley", geo: { lat: 37.18, lon: 128.47 },
    bg: ["#bfe0e0", "#3f8fa0", "#235a6b"],
    fish: [["쏘가리", 22], ["꺽지", 18], ["누치", 16], ["은어", 14], ["미유기", 12], ["산천어", 10], ["쉬리", 8]],
    unlock: { coin: 4200, gearSum: 8 },
  },
  {
    id: "seorak", name: "설악산 계곡", sub: "1급수 최상류, 냉수성 어종의 땅",
    flow: 1.55, fakeBase: 0.28, type: "valley", geo: { lat: 38.12, lon: 128.47 },
    bg: ["#cfe9e6", "#3f8c86", "#1f5a55"],
    fish: [["산천어", 22], ["버들치", 18], ["쉬리", 16], ["은어", 14], ["열목어", 12], ["미유기", 10], ["어름치", 8]],
    unlock: { coin: 6500, gearSum: 9 },
  },
  {
    id: "imjin", name: "임진강", sub: "분단을 가로지르는 큰 강",
    flow: 1.0, fakeBase: 0.21, type: "river", geo: { lat: 37.89, lon: 126.77 },
    bg: ["#d2e6ea", "#5fa0b4", "#356f86"],
    fish: [["피라미", 30], ["붕어", 24], ["누치", 18], ["참마자", 14], ["끄리", 8], ["잉어", 6]],
    unlock: { coin: 600, gearSum: 4 },
  },
  {
    id: "geum", name: "금강 (공주)", sub: "백제의 젖줄, 너른 중류",
    flow: 1.0, fakeBase: 0.22, type: "river", geo: { lat: 36.45, lon: 127.12 },
    bg: ["#d8e4d0", "#6aa888", "#3f7a60"],
    fish: [["붕어", 26], ["피라미", 20], ["납자루", 16], ["동자개", 14], ["메기", 12], ["잉어", 12]],
    unlock: { coin: 1100, gearSum: 5 },
  },
  {
    id: "yeongsan", name: "영산강", sub: "남도 평야를 적시는 강",
    flow: 0.95, fakeBase: 0.23, type: "plain", geo: { lat: 35.02, lon: 126.72 },
    bg: ["#dde6cf", "#7fae7a", "#4f8050"],
    fish: [["붕어", 28], ["참붕어", 20], ["각시붕어", 16], ["미꾸라지", 14], ["가물치", 12], ["떡붕어", 10]],
    unlock: { coin: 1400, gearSum: 5 },
  },
  {
    id: "daecheong", name: "대청호", sub: "물안개 피는 거대한 호수",
    flow: 0.9, fakeBase: 0.24, type: "lake", geo: { lat: 36.48, lon: 127.48 },
    bg: ["#d2e0e6", "#5f93a8", "#356074"],
    fish: [["붕어", 24], ["떡붕어", 20], ["잉어", 18], ["강준치", 16], ["끄리", 12], ["가물치", 10]],
    unlock: { coin: 1900, gearSum: 6 },
  },
  {
    id: "chungju", name: "충주호", sub: "내륙의 깊고 푸른 담수호",
    flow: 1.0, fakeBase: 0.24, type: "lake", geo: { lat: 36.99, lon: 128.00 },
    bg: ["#cfe0e8", "#5790a8", "#335f78"],
    fish: [["잉어", 22], ["떡붕어", 18], ["강준치", 18], ["쏘가리", 16], ["끄리", 14], ["향어", 12]],
    unlock: { coin: 2300, gearSum: 6 },
  },
  {
    id: "namgang", name: "남강 (진주)", sub: "진주성을 휘감는 강",
    flow: 1.1, fakeBase: 0.25, type: "river", geo: { lat: 35.18, lon: 128.08 },
    bg: ["#d4e2dd", "#5fa097", "#357066"],
    fish: [["피라미", 22], ["누치", 20], ["끄리", 18], ["쏘가리", 16], ["메기", 14], ["잉어", 10]],
    unlock: { coin: 3000, gearSum: 7 },
  },
  {
    id: "milyang", name: "밀양강", sub: "영남알프스에서 흘러온 물",
    flow: 1.25, fakeBase: 0.26, type: "valley", geo: { lat: 35.50, lon: 128.75 },
    bg: ["#cfe2e0", "#4f9aa0", "#2c6b70"],
    fish: [["쏘가리", 24], ["꺽지", 20], ["누치", 16], ["은어", 14], ["끄리", 14], ["미유기", 12]],
    unlock: { coin: 3600, gearSum: 7 },
  },
  {
    id: "hantan", name: "한탄강 (연천)", sub: "현무암 협곡의 급류",
    flow: 1.45, fakeBase: 0.27, type: "valley", geo: { lat: 38.05, lon: 127.07 },
    bg: ["#cfe0e2", "#4f9398", "#2c6468"],
    fish: [["쏘가리", 22], ["꺽지", 20], ["누치", 18], ["메기", 14], ["산천어", 14], ["쉬리", 12]],
    unlock: { coin: 4800, gearSum: 8 },
  },
  {
    id: "hyeongsan", name: "형산강 (포항)", sub: "동해로 드는 맑은 하구",
    flow: 1.3, fakeBase: 0.26, type: "river", geo: { lat: 36.03, lon: 129.36 },
    bg: ["#cfe4e6", "#509aa4", "#2c6b74"],
    fish: [["은어", 24], ["피라미", 18], ["끄리", 16], ["쏘가리", 16], ["강준치", 14], ["향어", 12]],
    unlock: { coin: 5400, gearSum: 8 },
  },
  {
    id: "nakdong", name: "낙동강 (부산)", sub: "영남을 가로지른 거대한 강",
    flow: 1.2, fakeBase: 0.25, type: "city", geo: { lat: 35.18, lon: 128.97 },
    bg: ["#d0dde6", "#5787a8", "#335574"],
    fish: [["잉어", 22], ["향어", 18], ["강준치", 16], ["가물치", 14], ["쏘가리", 14], ["떡붕어", 10], ["황쏘가리", 6]],
    unlock: { coin: 6000, gearSum: 9 },
  },
  {
    id: "jeju", name: "제주 천지연", sub: "폭포 아래 신비로운 못",
    flow: 1.35, fakeBase: 0.26, type: "jeju", geo: { lat: 33.24, lon: 126.42 }, island: true,
    bg: ["#cfe9e2", "#3f9a90", "#1f6a60"],
    fish: [["은어", 24], ["산천어", 20], ["쉬리", 18], ["버들치", 14], ["열목어", 14], ["어름치", 10]],
    unlock: { coin: 7000, gearSum: 9 },
  },
  {
    id: "halla", name: "한라산 계곡", sub: "남녘 최고봉의 청정 계류",
    flow: 1.6, fakeBase: 0.27, type: "valley", geo: { lat: 33.40, lon: 126.75 }, island: true,
    bg: ["#e0e8cc", "#8ab870", "#4f8048"],
    fish: [["산천어", 22], ["버들치", 20], ["쉬리", 16], ["은어", 14], ["열목어", 14], ["어름치", 10], ["황금잉어", 4]],
    unlock: { coin: 8000, gearSum: 10 },
  },
  {
    id: "baekdu", name: "백두대간 비경", sub: "전설의 황금빛 물고기가 산다",
    flow: 1.7, fakeBase: 0.26, type: "valley", geo: { lat: 38.45, lon: 128.30 },
    bg: ["#e8e0c2", "#9ab86a", "#5a8a4a"],
    fish: [["열목어", 22], ["산천어", 18], ["어름치", 16], ["은어", 12], ["향어", 12], ["황쏘가리", 12], ["황금잉어", 8]],
    unlock: { coin: 11000, gearSum: 10 },
  },
];

// ─── 장비 ───
// 단계 업그레이드 장비: 막대, 낚싯줄 (레벨마다 고유 이름)
const GEAR = {
  rod: {
    name: "막대", icon: "🪵", desc: "동시 입질 수 · 낚싯줄 개수↑",
    levelNames: ["나무막대", "강철막대", "카본막대"],
    levels: [
      { maxBites: 3, lines: 12 },
      { maxBites: 4, lines: 14 },
      { maxBites: 5, lines: 16 },
    ],
    cost: [0, 800, 2600],
  },
  line: {
    name: "낚싯줄", icon: "🧵", desc: "입질 유지시간↑ · 대물 끌어올리기↑",
    levelNames: ["나일론줄", "합사줄", "카본줄"],
    levels: [
      { holdMul: 1.0, dragReduce: 0 },
      { holdMul: 1.25, dragReduce: 1 },
      { holdMul: 1.55, dragReduce: 2 },
    ],
    cost: [0, 700, 2200],
  },
};

// 장착형 미끼: 여러 종류를 사서 하나를 장착. 효과가 서로 다름.
const BAITS = {
  basic:  { name: "기본파리", icon: "🪰", cost: 0,    desc: "평범한 미끼. 무난하다.",                eff: { approachMul: 1.0, fakeMul: 1.0,  bigBoost: 0,   nightMul: 1.0 } },
  shiny:  { name: "반짝파리", icon: "✨", cost: 1800,  desc: "고급 어종이 잘 문다.",                  eff: { approachMul: 1.1, fakeMul: 0.8,  bigBoost: 0.9, nightMul: 1.0 } },
  glow:   { name: "야광파리", icon: "💡", cost: 2600,  desc: "밤에 강력. 전체 입질↑.",               eff: { approachMul: 1.25, fakeMul: 0.7, bigBoost: 0.3, nightMul: 1.5 } },
  dough:  { name: "떡밥",     icon: "🟤", cost: 1200,  desc: "입질이 잦지만 헛입질이 아주 많다.",      eff: { approachMul: 1.4, fakeMul: 1.9,  bigBoost: 0,   nightMul: 1.0 } },
  lure:   { name: "루어",     icon: "🎣", cost: 3800, desc: "대물 전문. 잡어는 잘 안 문다.",          eff: { approachMul: 1.0, fakeMul: 0.45, bigBoost: 1.7, nightMul: 1.0 } },
};

// 어망(살림망): 등급이 높을수록 잡은 점수에 보너스. 하나를 장착.
const CREELS = {
  basic:  { name: "소쿠리",     icon: "🧺", cost: 0,    mult: 1.0,  desc: "기본 어망." },
  net:    { name: "망태기",     icon: "🎒", cost: 1500, mult: 1.15, desc: "점수 +15%." },
  basket: { name: "대나무 살림망", icon: "🪣", cost: 4000, mult: 1.35, desc: "점수 +35%." },
  pro:    { name: "프로 살림망",  icon: "⚜️", cost: 9000, mult: 1.6,  desc: "점수 +60%." },
};

const POOL_W = 720, POOL_H = 360, WATER_TOP = 70, HOOK_Y = 150, RAIL_Y = 60;
const SAVE_KEY = "flyfishing:save:v3";

function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

let audioCtx = null;
function getCtx() { if (typeof window === "undefined") return null; if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); } return audioCtx; }
function tone({ freq = 440, dur = 0.12, type = "sine", vol = 0.18, slideTo = null, attack = 0.005, delay = 0 }) {
  const ctx = getCtx(); if (!ctx) return; if (ctx.state === "suspended") ctx.resume();
  const t = ctx.currentTime + delay, osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + dur + 0.02);
}
// 짧은 노이즈 버스트 (물보라·첨벙 느낌). 필터로 색깔 조절.
function noise({ dur = 0.18, vol = 0.16, type = "lowpass", freq = 1200, q = 1, slideTo = null, delay = 0 }) {
  const ctx = getCtx(); if (!ctx) return; if (ctx.state === "suspended") ctx.resume();
  const t = ctx.currentTime + delay;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); // 감쇠 노이즈
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.setValueAtTime(freq, t); filt.Q.value = q;
  if (slideTo) filt.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  const gain = ctx.createGain(); gain.gain.setValueAtTime(vol, t); gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start(t); src.stop(t + dur + 0.02);
}
const sfx = {
  // 입질: 톡톡 두드리는 느낌 + 약한 물방울
  bite: () => { tone({ freq: 340, slideTo: 200, dur: 0.08, type: "triangle", vol: 0.18 }); noise({ dur: 0.06, vol: 0.06, freq: 900 }); },
  // 챔질 성공: "척!" 물 가르는 노이즈 + 맑은 띵
  catch: () => {
    noise({ dur: 0.14, vol: 0.18, type: "highpass", freq: 600, slideTo: 2200 });
    tone({ freq: 600, slideTo: 920, dur: 0.12, type: "square", vol: 0.13 });
    tone({ freq: 920, dur: 0.12, type: "sine", vol: 0.12, delay: 0.07 });
  },
  // 완벽: 청량한 상승 아르페지오 + 반짝
  perfect: () => {
    noise({ dur: 0.12, vol: 0.14, type: "highpass", freq: 1200, slideTo: 4000 });
    [784, 1047, 1318, 1568].forEach((f, i) => tone({ freq: f, dur: 0.12, type: "triangle", vol: 0.15, delay: i * 0.05 }));
  },
  // 대물: 묵직한 저음 + 첨벙
  big: () => {
    tone({ freq: 140, slideTo: 70, dur: 0.32, type: "sawtooth", vol: 0.2 });
    noise({ dur: 0.3, vol: 0.2, type: "lowpass", freq: 500, slideTo: 160 });
    [440, 587, 740].forEach((f, i) => tone({ freq: f, dur: 0.16, type: "triangle", vol: 0.13, delay: 0.12 + i * 0.07 }));
  },
  miss: () => { tone({ freq: 200, slideTo: 80, dur: 0.2, type: "sawtooth", vol: 0.15 }); noise({ dur: 0.12, vol: 0.08, freq: 400 }); },
  pull: () => { tone({ freq: 240 + Math.random() * 120, dur: 0.05, type: "square", vol: 0.12 }); noise({ dur: 0.04, vol: 0.07, freq: 1500 }); },
  fever: () => [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.14, type: "triangle", vol: 0.16, delay: i * 0.08 })),
  buy: () => { tone({ freq: 700, dur: 0.1, type: "square", vol: 0.15 }); tone({ freq: 1050, dur: 0.12, vol: 0.14, delay: 0.08 }); },
  unlock: () => [523, 659, 784, 1047, 1318].forEach((f, i) => tone({ freq: f, dur: 0.16, type: "triangle", vol: 0.16, delay: i * 0.09 })),
  splash: () => noise({ dur: 0.2, vol: 0.14, type: "bandpass", freq: 1400, q: 0.6, slideTo: 500 }),
};

// 배경음 사용 안 함 (효과음만 유지). start/stop는 호출돼도 아무 동작 없음.
let bgmNodes = null;
const bgm = { start() {}, stop() {} };

export default function FlyFishingGame() {
  const [screen, setScreen] = useState("loading"); // loading|map|playing|result|shop|book
  const [coins, setCoins] = useState(0);
  const [gearLvl, setGearLvl] = useState({ rod: 1, line: 1 });
  const [ownedBaits, setOwnedBaits] = useState(["basic"]); // 보유한 미끼
  const [equippedBait, setEquippedBait] = useState("basic"); // 장착 미끼
  const [ownedCreels, setOwnedCreels] = useState(["basic"]); // 보유 어망
  const [equippedCreel, setEquippedCreel] = useState("basic"); // 장착 어망
  const [shopTab, setShopTab] = useState("gear"); // 상점 탭: gear|bait|creel
  const [anglerExp, setAnglerExp] = useState(0); // 강태공 누적 경험치
  const [levelUpInfo, setLevelUpInfo] = useState(null); // 결과 화면 레벨업 표시
  const [isNewPlayer, setIsNewPlayer] = useState(false); // 첫 플레이 여부
  const [tutStep, setTutStep] = useState(0); // 튜토리얼 단계 (0이면 안 봄)
  const [unlocked, setUnlocked] = useState(["stream"]);
  const [bestBySpot, setBestBySpot] = useState({});
  const [stars, setStars] = useState({}); // 장소별 획득 별 {spotId: 0~3}
  const [book, setBook] = useState({}); // 도감: {어종명: 누적 잡은 수}
  const [bestSize, setBestSize] = useState({}); // 어종별 최고 크기(cm)
  const [claimed, setClaimed] = useState({}); // 받은 도감 보상 {r1..r5, all}
  const [daily, setDaily] = useState(null); // {date, tasks:[{id,type,target,fish?,prog,done,claimed,reward,label}]}
  const [spotIdx, setSpotIdx] = useState(0);
  const [selPin, setSelPin] = useState(null); // 지도에서 선택한 장소 idx
  const [mapZoom, setMapZoom] = useState(1); // 지도 확대 배율
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 }); // 지도 이동
  const panRef = useRef(null); // 드래그 상태
  const [newCatches, setNewCatches] = useState([]); // 이번 판에 처음 잡은 신규 어종
  const [bookSel, setBookSel] = useState(null); // 도감 상세로 볼 어종명

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [, force] = useState(0);
  const [pops, setPops] = useState([]);
  const [shake, setShake] = useState(0); // 화면 흔들림 강도
  const [splashes, setSplashes] = useState([]); // 물보라 파티클
  const [fanfare, setFanfare] = useState(null); // 대물/완벽 플래시
  const [creelFlies, setCreelFlies] = useState([]); // 어망으로 날아가는 물고기
  const [creelBounce, setCreelBounce] = useState(0); // 어망 출렁임 트리거
  const [weather, setWeather] = useState({ time: "day", sky: "clear" }); // 시간대·날씨
  const weatherRef = useRef({ time: "day", sky: "clear", approachMul: 1, fakeMul: 1 });
  const [flash, setFlash] = useState({});
  const [fever, setFever] = useState(false);
  const [creel, setCreel] = useState({});
  const [drag, setDrag] = useState(null);
  const [lastEarned, setLastEarned] = useState(0);
  const [lastStarResult, setLastStarResult] = useState(null); // {earned, prev, missions:[{...,done}]}

  const raf = useRef(0), lastTs = useRef(0), lastSpawn = useRef(0);
  const fishIdRef = useRef(0), popIdRef = useRef(0), runningRef = useRef(false);
  const fishesRef = useRef([]), occupiedLines = useRef(new Set());
  const comboRef = useRef(0); comboRef.current = combo;
  const feverRef = useRef(false); feverRef.current = fever;
  const feverUntil = useRef(0), elapsedRef = useRef(0);
  const dragRef = useRef(null); dragRef.current = drag;
  const soundOn = useRef(true), scoreRef = useRef(0); scoreRef.current = score;
  const dailyRef = useRef(null); dailyRef.current = daily;
  const runStats = useRef({ caught: 0, big: 0 }); // 이번 판 미션 추적
  const creelMulRef = useRef(1); // 장착 어망 점수 배율
  const poolBoxRef = useRef(null); // 게임 낚시터 컨테이너
  const creelBoxRef = useRef(null); // 하단 어망
  const eff = useRef({}), spotRef = useRef(SPOTS[0]);

  const computeEff = useCallback((lvls, baitKey) => {
    const r = GEAR.rod.levels[lvls.rod - 1], l = GEAR.line.levels[lvls.line - 1];
    const b = (BAITS[baitKey] || BAITS.basic).eff;
    eff.current = {
      approachMul: b.approachMul, fakeMul: b.fakeMul, bigBoost: b.bigBoost, nightMul: b.nightMul || 1,
      maxBites: r.maxBites, lines: r.lines, holdMul: l.holdMul, dragReduce: l.dragReduce,
    };
  }, []);

  const lineCount = () => eff.current.lines || 12;
  const lineX = useCallback((i) => { const n = lineCount(); return 60 + ((POOL_W - 120) / (n - 1)) * i; }, []);
  // 해금 진척도: 막대+낚싯줄 레벨 합 + 보유 미끼 수 (기존 조건 범위와 맞춤)
  const gearSum = (gl, baits) => gl.rod + gl.line + (baits ? baits.length : 1);

  const persist = useCallback(async (next) => { try { await window.storage.set(SAVE_KEY, JSON.stringify(next), false); } catch (e) {} }, []);
  // 최신 상태 ref (저장 시 누락 방지)
  const stateRef = useRef({});
  stateRef.current = { coins, gearLvl, unlocked, bestBySpot, book, bestSize, claimed, daily, stars, ownedBaits, equippedBait, anglerExp, ownedCreels, equippedCreel };
  const saveAll = useCallback((over = {}) => {
    persist({ ...stateRef.current, ...over });
  }, [persist]);

  useEffect(() => {
    (async () => {
      let data = null;
      try { const r = await window.storage.get(SAVE_KEY); if (r && r.value) data = JSON.parse(r.value); } catch (e) {}
      if (data) {
        setCoins(data.coins || 0);
        const gl = data.gearLvl && data.gearLvl.rod ? { rod: data.gearLvl.rod, line: data.gearLvl.line } : { rod: 1, line: 1 };
        setGearLvl(gl);
        const ob = data.ownedBaits && data.ownedBaits.length ? data.ownedBaits : ["basic"];
        const eb = data.equippedBait && ob.includes(data.equippedBait) ? data.equippedBait : "basic";
        setOwnedBaits(ob); setEquippedBait(eb);
        setAnglerExp(data.anglerExp || 0);
        const oc = data.ownedCreels && data.ownedCreels.length ? data.ownedCreels : ["basic"];
        setOwnedCreels(oc);
        setEquippedCreel(data.equippedCreel && oc.includes(data.equippedCreel) ? data.equippedCreel : "basic");
        setUnlocked(data.unlocked && data.unlocked.length ? data.unlocked : ["stream"]);
        setBestBySpot(data.bestBySpot || {});
        setStars(data.stars || {});
        setBook(data.book || {});
        setBestSize(data.bestSize || {});
        setClaimed(data.claimed || {});
        if (data.daily && data.daily.date === todayKey()) setDaily(data.daily);
        else setDaily(makeDailyTasks());
        computeEff(gl, eb);
      } else { computeEff({ rod: 1, line: 1 }, "basic"); setDaily(makeDailyTasks()); setIsNewPlayer(true); }
      setScreen("title");
    })();
  }, [computeEff]);

  const addPop = (x, y, text, color) => {
    const id = popIdRef.current++;
    setPops((p) => [...p, { id, x, y, text, color }]);
    setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 800);
  };
  const play = (n) => { if (soundOn.current && sfx[n]) sfx[n](); };

  // 일일 과제 진행 갱신. kind별로 해당 과제 prog 증가
  const advanceDaily = (kind, payload = {}) => {
    setDaily((dy) => {
      if (!dy) return dy;
      let changed = false;
      const tasks = dy.tasks.map((t) => {
        if (t.done) return t;
        let inc = 0;
        if (kind === "catch") {
          if (t.type === "total") inc = 1;
          else if (t.type === "fish" && t.fish === payload.name) inc = 1;
          else if (t.type === "big" && payload.big) inc = 1;
        } else if (kind === "combo" && t.type === "combo") {
          if (payload.combo >= t.target) { changed = true; return { ...t, prog: t.target, done: true }; }
        }
        if (inc > 0) {
          const np = Math.min(t.target, t.prog + inc);
          changed = true;
          return { ...t, prog: np, done: np >= t.target };
        }
        return t;
      });
      if (!changed) return dy;
      return { ...dy, tasks };
    });
  };

  const triggerShake = (strength = 5) => {
    setShake(strength);
    setTimeout(() => setShake(0), 280);
  };
  const addSplash = (x, y, big = false) => {
    const n = big ? 10 : 6;
    const parts = Array.from({ length: n }).map(() => ({
      id: popIdRef.current++,
      x, y,
      dx: (Math.random() - 0.5) * (big ? 90 : 55),
      dy: -(20 + Math.random() * (big ? 70 : 45)),
      r: 2 + Math.random() * (big ? 4 : 2.5),
    }));
    setSplashes((s) => [...s, ...parts]);
    const ids = new Set(parts.map((p) => p.id));
    setTimeout(() => setSplashes((s) => s.filter((p) => !ids.has(p.id))), 650);
  };
  const showFanfare = (text) => {
    setFanfare({ text, t: Date.now() });
    setTimeout(() => setFanfare((f) => (f && Date.now() - f.t >= 900 ? null : f)), 950);
  };

  // 잡은 물고기가 어망으로 날아가는 연출 (화면 전체 fixed 좌표)
  const flyToCreel = (name, lineIdx) => {
    const pool = poolBoxRef.current, creel = creelBoxRef.current;
    if (!pool || !creel) return;
    const pr = pool.getBoundingClientRect(), cr = creel.getBoundingClientRect();
    // 시작: 잡힌 줄의 화면 위치 (POOL 좌표 → 실제 픽셀)
    const sx = pr.left + (lineX(lineIdx) / POOL_W) * pr.width;
    const sy = pr.top + (HOOK_Y / POOL_H) * pr.height;
    // 도착: 어망 중앙
    const ex = cr.left + cr.width / 2, ey = cr.top + cr.height / 2;
    const id = popIdRef.current++;
    setCreelFlies((arr) => [...arr, { id, name, sx, sy, ex, ey }]);
    setTimeout(() => {
      setCreelFlies((arr) => arr.filter((a) => a.id !== id));
      setCreelBounce((b) => b + 1); // 도착 시 어망 출렁
      setTimeout(() => setCreelBounce((b) => b), 0);
    }, 600);
  };

  const pickFishType = useCallback(() => {
    const boost = eff.current.bigBoost || 0;
    const spot = spotRef.current;
    const weighted = spot.fish.map(([name, w]) => {
      const f = FISH[name];
      const big = f.points >= 60 ? 1 : 0;
      return { name, w: w * (1 + big * boost) };
    });
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (const x of weighted) { if (r < x.w) return x.name; r -= x.w; }
    return weighted[0].name;
  }, []);

  const endGame = useCallback(() => {
    runningRef.current = false; cancelAnimationFrame(raf.current); bgm.stop();
    const earned = scoreRef.current;
    setLastEarned(earned); setDrag(null);
    const spot = spotRef.current;
    // 미션 판정
    const miss = spotMissions(spot);
    const prog = { score: earned, catch: runStats.current.caught, big: runStats.current.big };
    const results = miss.map((m) => ({ ...m, done: prog[m.id] >= m.target, cur: prog[m.id] }));
    const earnedStars = results.filter((r) => r.done).length;
    const prevStars = stars[spot.id] || 0;
    setLastStarResult({ earnedStars, prevStars, results });

    // 강태공 경험치·레벨업 처리
    const gainedExp = runStats.current.exp || 0;
    const prevExp = anglerExp, newExp = prevExp + gainedExp;
    const prevLevel = anglerLevelFromExp(prevExp), newLevel = anglerLevelFromExp(newExp);
    let levelBonus = 0;
    for (let L = prevLevel + 1; L <= newLevel; L++) levelBonus += levelUpReward(L);
    setAnglerExp(newExp);
    if (newLevel > prevLevel) {
      setLevelUpInfo({ from: prevLevel, to: newLevel, title: anglerTitle(newLevel), bonus: levelBonus });
      play("unlock");
    } else setLevelUpInfo(null);

    const totalEarned = earned + levelBonus;
    setCoins((c) => {
      const nc = c + totalEarned;
      setBestBySpot((bb) => {
        const nb = { ...bb, [spot.id]: Math.max(bb[spot.id] || 0, earned) };
        setStars((st) => {
          const ns = { ...st, [spot.id]: Math.max(prevStars, earnedStars) };
          saveAll({ coins: nc, bestBySpot: nb, stars: ns, anglerExp: newExp });
          return ns;
        });
        return nb;
      });
      return nc;
    });
    setScreen("result");
  }, [saveAll, stars, anglerExp]);

  const registerMiss = (n = 1) => { setCombo(0); setMissCount((m) => { const nm = m + n; if (nm >= 5) endGame(); return nm; }); };
  const bumpCombo = () => {
    setCombo((c) => {
      const nc = c + 1;
      if (nc > 0 && nc % 8 === 0 && !feverRef.current) { setFever(true); feverUntil.current = performance.now() + 6000; play("fever"); vibrate([20, 40, 20, 40, 20]); }
      advanceDaily("combo", { combo: nc });
      return nc;
    });
  };

  const spawnFish = () => {
    const name = pickFishType(); const type = FISH[name];
    const spot = spotRef.current;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const y = WATER_TOP + 40 + Math.random() * (POOL_H - WATER_TOP - 80);
    fishesRef.current.push({
      id: fishIdRef.current++, name, type,
      x: dir === 1 ? -40 : POOL_W + 40, y, baseY: y,
      vx: dir * (40 + Math.random() * 35 + type.points * 0.2) * spot.flow,
      dir, state: "swim", targetLine: null, biteStart: 0, isFake: false, wiggleSeed: Math.random() * 6.28,
      targetY: y, nextDepth: 0, pitch: 0,
    });
  };

  const loop = useCallback((ts) => {
    if (!runningRef.current) return;
    if (!lastTs.current) lastTs.current = ts;
    const dt = Math.min(50, ts - lastTs.current) / 1000; lastTs.current = ts; elapsedRef.current += dt;
    const now = performance.now(); const E = eff.current; const spot = spotRef.current;
    if (feverRef.current && now > feverUntil.current) setFever(false);
    const inFever = feverRef.current;
    const ramp = Math.min(1, elapsedRef.current / 45);
    const spawnGap = (inFever ? 450 : 900) - ramp * 400;
    const W = weatherRef.current;
    const nightBonus = W.time === "night" ? (E.nightMul || 1) : 1;
    const approachChance = ((inFever ? 0.02 : 0.0045) + ramp * 0.006) * E.approachMul * W.approachMul * nightBonus;
    const fakeChance = (inFever ? 0.05 : spot.fakeBase) * E.fakeMul * W.fakeMul;
    const flowHold = 1 / spot.flow; // 물살 세면 유지시간 짧아짐
    const maxBites = E.maxBites;

    if (ts - lastSpawn.current > spawnGap + Math.random() * 400) { lastSpawn.current = ts; if (fishesRef.current.length < (inFever ? 12 : 9)) spawnFish(); }

    const fishes = fishesRef.current; const missQueue = [];
    for (const f of fishes) {
      if (f.state === "swim") {
        // 속도에 미세한 가감속 (sin으로 부드럽게 빨라졌다 느려졌다)
        const speedMod = 0.7 + 0.5 * (0.5 + 0.5 * Math.sin(now / 900 + f.wiggleSeed));
        f.x += f.vx * speedMod * dt;
        // 목표 깊이(targetY)를 가끔 바꿔서 위아래로 유영, 부드럽게 따라감
        if (now > (f.nextDepth || 0)) {
          const margin = 40;
          f.targetY = WATER_TOP + margin + Math.random() * (POOL_H - WATER_TOP - margin * 2 - 30);
          f.nextDepth = now + 1500 + Math.random() * 2500;
        }
        const ty = (f.targetY != null ? f.targetY : f.baseY);
        f.baseY += (ty - f.baseY) * Math.min(1, dt * 1.2); // 부드럽게 깊이 이동
        const bob = Math.sin(now / 520 + f.wiggleSeed) * 6; // 잔잔한 상하 일렁임
        f.y = f.baseY + bob;
        // 몸 기울기: 상하 이동 방향에 따라 살짝 기울임 (다음 렌더에서 사용)
        f.pitch = Math.cos(now / 520 + f.wiggleSeed) * 6 + (ty - f.baseY) * 0.04;
        if (occupiedLines.current.size < maxBites && Math.random() < approachChance) {
          let cand = null, bestD = Infinity;
          for (let i = 0; i < E.lines; i++) {
            if (occupiedLines.current.has(i)) continue;
            const lx = lineX(i); const ahead = f.dir === 1 ? lx > f.x : lx < f.x; const d = Math.abs(lx - f.x);
            if (ahead && d < bestD && d < 260) { bestD = d; cand = i; }
          }
          if (cand !== null) { f.state = "approach"; f.targetLine = cand; f.isFake = Math.random() < fakeChance; occupiedLines.current.add(cand); }
        }
      } else if (f.state === "approach") {
        const tx = lineX(f.targetLine), ty = HOOK_Y - (f.isFake ? 14 : 0);
        const dx = tx - f.x, dy = ty - f.y, dist = Math.hypot(dx, dy), sp = 160 * dt;
        f.pitch = Math.atan2(dy, Math.abs(dx) + 0.01) * 18; // 향하는 방향으로 몸 기울임
        if (dist < 6) {
          f.x = tx; f.y = ty; f.pitch = 0;
          if (f.isFake) { f.state = "fake"; f.biteStart = now; }
          else { f.state = "bite"; f.biteStart = now; play("bite"); vibrate(Math.round(30 + f.type.size * 25)); }
        } else { f.x += (dx / dist) * sp; f.y += (dy / dist) * sp; f.dir = dx >= 0 ? 1 : -1; }
      } else if (f.state === "fake") {
        f.x = lineX(f.targetLine) + Math.sin(now / 60) * 4;
        if (now - f.biteStart > 500) { occupiedLines.current.delete(f.targetLine); f.state = "flee"; f.vx = f.dir * 120; f.targetLine = null; }
      } else if (f.state === "bite") {
        const held = now - f.biteStart;
        f.x = lineX(f.targetLine) + Math.sin(now / 50) * 3; f.y = HOOK_Y + Math.sin(now / 40) * 2;
        if (held > f.type.holdMs * E.holdMul * flowHold) { missQueue.push(f.targetLine); occupiedLines.current.delete(f.targetLine); f.state = "flee"; f.vx = f.dir * 130; f.targetLine = null; }
      } else if (f.state === "fighting") {
        f.x = lineX(f.dragLine) + Math.sin(now / 70) * 10; f.y = HOOK_Y + Math.sin(now / 90) * 4;
      } else if (f.state === "flee" || f.state === "caught") {
        f.x += f.vx * dt; if (f.state === "caught") f.y -= 130 * dt;
      }
    }
    fishesRef.current = fishes.filter((f) => f.x > -70 && f.x < POOL_W + 70 && !(f.state === "caught" && f.y < -40));

    const d = dragRef.current;
    if (d && now > d.until) {
      const ff = fishesRef.current.find((x) => x.id === d.fishId);
      if (ff) { ff.state = "flee"; ff.vx = ff.dir * 130; }
      occupiedLines.current.delete(d.line); addPop(lineX(d.line), HOOK_Y, "놓쳤다!", "#ff6b6b"); play("miss"); setDrag(null); registerMiss(1);
    }
    if (missQueue.length > 0) { missQueue.forEach((li) => addPop(lineX(li), HOOK_Y + 24, "놓침!", "#ff6b6b")); play("miss"); registerMiss(missQueue.length); }

    force((n) => n + 1); raf.current = requestAnimationFrame(loop);
  }, [lineX, pickFishType, endGame]);

  useEffect(() => {
    if (screen !== "playing") { bgm.stop(); return; }
    const iv = setInterval(() => { setTimeLeft((tl) => { if (tl <= 1) { clearInterval(iv); endGame(); return 0; } return tl - 1; }); }, 1000);
    return () => clearInterval(iv);
  }, [screen, endGame]);

  const startSpot = (idx) => {
    getCtx(); computeEff(gearLvl, equippedBait); spotRef.current = SPOTS[idx]; setSpotIdx(idx);
    if (soundOn.current) bgm.start();
    creelMulRef.current = (CREELS[equippedCreel] || CREELS.basic).mult;
    const w = rollWeather();
    setWeather(w);
    weatherRef.current = { ...w, approachMul: TIMES[w.time].approachMul * SKIES[w.sky].approachMul, fakeMul: SKIES[w.sky].fakeMul };
    setScore(0); setCombo(0); setMissCount(0); setTimeLeft(60);
    setPops([]); setFlash({}); setFever(false); setCreel({}); setDrag(null); setNewCatches([]); setSplashes([]); setFanfare(null); setShake(0);
    runStats.current = { caught: 0, big: 0, exp: 0 };
    // 이번 장소의 '대물' 기준 희귀도 (spotMissions와 동일 계산)
    const sp = SPOTS[idx];
    const maxR = Math.max(...sp.fish.map(([n]) => (FISH[n] ? FISH[n].rarity : 1)));
    runStats.current.bigTier = Math.min(maxR, 3);
    setLevelUpInfo(null);
    setCreelFlies([]); setCreelBounce(0);
    fishesRef.current = []; occupiedLines.current = new Set();
    elapsedRef.current = 0; lastTs.current = 0; lastSpawn.current = 0; feverUntil.current = 0;
    setScreen("playing"); runningRef.current = true; raf.current = requestAnimationFrame(loop);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const landFish = (f, line, mult, label) => {
    const c = comboRef.current, feverBonus = feverRef.current ? 2 : 1;
    const g = Math.round(f.type.points * mult * (1 + c * 0.1) * feverBonus * creelMulRef.current);
    setScore((s) => s + g); bumpCombo();
    addPop(lineX(line), HOOK_Y - 10, `${label} +${g}`, f.name === "황금잉어" ? "#ffcf3f" : "#ffe066");
    setFlash((cf) => ({ ...cf, [line]: Date.now() }));
    setTimeout(() => setFlash((cf) => { const n = { ...cf }; delete n[line]; return n; }), 250);
    setCreel((cr) => ({ ...cr, [f.name]: (cr[f.name] || 0) + 1 }));
    // 크기 뽑기: 기준 cm의 0.7~1.4배. mult(잘 챈 정도) 높으면 큰 개체 확률↑
    const base = f.type.cm || 20;
    const roll = 0.7 + Math.random() * 0.7 + (mult >= 3 ? 0.08 : 0);
    const sizeCm = Math.round(base * Math.min(1.45, roll) * 10) / 10;
    setBestSize((bs) => {
      const prevBest = bs[f.name] || 0;
      if (sizeCm > prevBest) {
        if (prevBest > 0) addPop(lineX(line), HOOK_Y - 44, `📏 신기록 ${sizeCm}cm!`, "#ffd86b");
        return { ...bs, [f.name]: sizeCm };
      }
      return bs;
    });
    setBook((bk) => {
      const isNew = !bk[f.name];
      if (isNew) {
        setNewCatches((nc) => nc.includes(f.name) ? nc : [...nc, f.name]);
        addPop(lineX(line), HOOK_Y - 28, "✨ 도감 등록!", "#7fe0c0");
      }
      return { ...bk, [f.name]: (bk[f.name] || 0) + 1 };
    });
    occupiedLines.current.delete(line); f.state = "caught"; f.vx = 0; f.targetLine = null;
    const big = f.type.fight >= 3 || f.type.rarity >= 4;
    play(big ? "big" : mult >= 3 ? "perfect" : "catch");
    if (big) setTimeout(() => play("splash"), 60);
    vibrate(big ? [20, 40, 30, 40, 20] : mult >= 3 ? [15, 30, 15] : 18);
    flyToCreel(f.name, line);
    addSplash(lineX(line), HOOK_Y, big);
    triggerShake(big ? 8 : mult >= 3 ? 6 : 3.5);
    if (f.type.rarity >= 5) showFanfare(`🎉 ${f.name}!`);
    else if (big) showFanfare(`✨ ${f.name}`);
    else if (mult >= 3) showFanfare("PERFECT!");
    advanceDaily("catch", { name: f.name, big: f.type.rarity >= 3 });
    runStats.current.caught += 1;
    if (f.type.rarity >= (runStats.current.bigTier || 3)) runStats.current.big += 1;
    // 경험치: 어종 점수 비례 + 완벽 챔질 보너스
    runStats.current.exp += Math.round(f.type.points * (mult >= 3 ? 1.3 : 1));
  };

  const yankLine = (i) => {
    if (screen !== "playing") return;
    const d = dragRef.current;
    // 대물 연타 중에는 어느 줄/어디를 눌러도 연타로 인정 (미스 없음)
    if (d) {
      play("pull"); vibrate(12);
      setDrag((prev) => { if (!prev) return prev; const got = prev.got + 1; if (got >= prev.need) { const ff = fishesRef.current.find((x) => x.id === prev.fishId); if (ff) landFish(ff, prev.line, 2, "월척! 🎉"); return null; } return { ...prev, got }; });
      return;
    }
    const f = fishesRef.current.find((ff) => ff.state === "bite" && ff.targetLine === i);
    if (f) {
      const held = performance.now() - f.biteStart, maxHold = f.type.holdMs * eff.current.holdMul;
      let mult = 1, label = "성공 👍";
      if (held < maxHold * 0.3) { mult = 3; label = "완벽! ⚡"; } else if (held < maxHold * 0.6) { mult = 2; label = "훌륭 ✨"; }
      if (f.type.fight >= 3) {
        f.state = "fighting"; f.dragLine = i;
        const need = Math.max(2, f.type.fight + 2 - eff.current.dragReduce);
        setDrag({ fishId: f.id, need, got: 0, until: performance.now() + 2800, line: i });
        addPop(lineX(i), HOOK_Y - 10, "연타로 끌어올려!", "#fff"); play("bite"); vibrate([10, 20, 10]);
      } else landFish(f, i, mult, label);
    } else { addPop(lineX(i), HOOK_Y, "헛챔질", "#ff9f43"); play("miss"); registerMiss(1); }
  };

  const buyUpgrade = (key) => {
    const lvl = gearLvl[key]; if (lvl >= 3) return;
    const cost = GEAR[key].cost[lvl]; if (coins < cost) { play("miss"); return; }
    play("buy");
    const nextLvls = { ...gearLvl, [key]: lvl + 1 }, nextCoins = coins - cost;
    setGearLvl(nextLvls); setCoins(nextCoins); computeEff(nextLvls, equippedBait);
    saveAll({ coins: nextCoins, gearLvl: nextLvls });
  };

  const buyBait = (key) => {
    if (ownedBaits.includes(key)) { equipBait(key); return; }
    const cost = BAITS[key].cost; if (coins < cost) { play("miss"); return; }
    play("buy");
    const nextOwned = [...ownedBaits, key], nextCoins = coins - cost;
    setOwnedBaits(nextOwned); setCoins(nextCoins);
    setEquippedBait(key); computeEff(gearLvl, key);
    saveAll({ coins: nextCoins, ownedBaits: nextOwned, equippedBait: key });
  };
  const equipBait = (key) => {
    if (!ownedBaits.includes(key)) return;
    play("pull");
    setEquippedBait(key); computeEff(gearLvl, key);
    saveAll({ equippedBait: key });
  };

  const buyCreel = (key) => {
    if (ownedCreels.includes(key)) { equipCreel(key); return; }
    const cost = CREELS[key].cost; if (coins < cost) { play("miss"); return; }
    play("buy");
    const nextOwned = [...ownedCreels, key], nextCoins = coins - cost;
    setOwnedCreels(nextOwned); setCoins(nextCoins); setEquippedCreel(key);
    saveAll({ coins: nextCoins, ownedCreels: nextOwned, equippedCreel: key });
  };
  const equipCreel = (key) => {
    if (!ownedCreels.includes(key)) return;
    play("pull");
    setEquippedCreel(key);
    saveAll({ equippedCreel: key });
  };

  const claimReward = (key, amount) => {
    if (claimed[key]) return;
    play("unlock");
    const nextClaimed = { ...claimed, [key]: true };
    const nextCoins = coins + amount;
    setClaimed(nextClaimed); setCoins(nextCoins);
    saveAll({ coins: nextCoins, claimed: nextClaimed });
  };

  const claimDaily = (taskId) => {
    const dy = dailyRef.current;
    if (!dy) return;
    const t = dy.tasks.find((x) => x.id === taskId);
    if (!t || !t.done || t.claimed) return;
    play("buy");
    const nextDaily = { ...dy, tasks: dy.tasks.map((x) => x.id === taskId ? { ...x, claimed: true } : x) };
    const nextCoins = coins + t.reward;
    setDaily(nextDaily); setCoins(nextCoins);
    saveAll({ coins: nextCoins, daily: nextDaily });
  };

  const tryUnlock = (idx) => {
    const spot = SPOTS[idx];
    if (unlocked.includes(spot.id)) { startSpot(idx); return; }
    const okGear = gearSum(gearLvl, ownedBaits) >= spot.unlock.gearSum;
    const okCoin = coins >= spot.unlock.coin;
    if (okGear && okCoin) {
      play("unlock");
      const nextCoins = coins - spot.unlock.coin;
      const nextUnlocked = [...unlocked, spot.id];
      setCoins(nextCoins); setUnlocked(nextUnlocked);
      saveAll({ coins: nextCoins, unlocked: nextUnlocked });
    } else play("miss");
  };

  const fishes = fishesRef.current;
  const creelList = Object.entries(creel);
  const creelTotal = creelList.reduce((s, [, n]) => s + n, 0);
  const N = lineCount();
  const spot = spotRef.current;

  if (screen === "loading") return <Center><div style={{ color: "#cfeee4", fontFamily: "'Jua',sans-serif", fontSize: 20 }}>불러오는 중…</div></Center>;

  // ─── 타이틀 ───
  if (screen === "title") {
    const startGame = () => {
      if (isNewPlayer) { setTutStep(1); setScreen("tutorial"); }
      else setScreen("map");
    };
    return (
      <Center>
        <Fonts />
        <div style={{ ...cardStyle, maxWidth: 420, textAlign: "center", padding: "36px 24px", background: "linear-gradient(180deg,#bfe6ea,#7fc4ad)" }}>
          <div style={{ fontSize: 64, marginBottom: 4 }}>🎣</div>
          <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 38, color: "#0c3b34", lineHeight: 1.1 }}>파리낚시</div>
          <div style={{ fontSize: 14, color: "#2c6f86", margin: "8px 0 28px" }}>전국 방방곡곡, 한 마리 낚으러 가자</div>
          <BigBtn onClick={startGame}>🎣 {isNewPlayer ? "시작하기" : "이어하기"}</BigBtn>
          {!isNewPlayer && (
            <div style={{ marginTop: 8 }}>
              <BigBtn onClick={() => { setTutStep(1); setScreen("tutorial"); }} variant="ghost">📖 조작법 다시 보기</BigBtn>
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <button onClick={() => setScreen("credits")} style={{ background: "none", border: "none", color: "#2c6f86", fontSize: 12.5, cursor: "pointer", fontFamily: "'Gowun Dodum',sans-serif", textDecoration: "underline" }}>ⓘ 정보 · 크레딧</button>
          </div>
        </div>
      </Center>
    );
  }

  // ─── 크레딧/정보 ───
  if (screen === "credits") {
    return (
      <Center>
        <Fonts />
        <div style={{ ...cardStyle, maxWidth: 420, padding: "28px 24px" }}>
          <div style={{ fontSize: 44, textAlign: "center" }}>🎣</div>
          <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 26, color: "#0c3b34", textAlign: "center" }}>파리낚시</div>
          <div style={{ fontSize: 12.5, color: "#5a7d77", textAlign: "center", marginBottom: 18 }}>전국 민물 낚시 여행</div>

          <div style={{ textAlign: "left", fontSize: 13.5, color: "#37544d", lineHeight: 1.7 }}>
            <div style={{ fontFamily: "'Jua',sans-serif", color: "#0c3b34", fontSize: 15, marginBottom: 4 }}>🎮 게임</div>
            <div style={{ marginBottom: 14 }}>전국 20개 하천·계곡을 돌며 31종의 토종 민물고기를 낚는 캐주얼 낚시 게임.</div>

            <div style={{ fontFamily: "'Jua',sans-serif", color: "#0c3b34", fontSize: 15, marginBottom: 4 }}>🎵 음악</div>
            <div style={{ background: "#f1f8f5", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#5a7d77", marginBottom: 14, lineHeight: 1.6 }}>
              "Almost New" — Kevin MacLeod (incompetech.com)<br />
              Licensed under Creative Commons: By Attribution 4.0<br />
              <span style={{ color: "#2c6f86" }}>creativecommons.org/licenses/by/4.0/</span>
            </div>

            <div style={{ fontFamily: "'Jua',sans-serif", color: "#0c3b34", fontSize: 15, marginBottom: 4 }}>🔊 효과음</div>
            <div style={{ marginBottom: 6 }}>Web Audio로 직접 생성 (자체 제작)</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <BigBtn onClick={() => setScreen("title")} variant="ghost">← 돌아가기</BigBtn>
          </div>
        </div>
      </Center>
    );
  }

  // ─── 튜토리얼 ───
  if (screen === "tutorial") {
    const steps = [
      { emoji: "🐟", title: "물고기가 다가와요", body: "물 위에 가로로 줄이 여러 개 걸려 있어요. 물고기가 헤엄치다 미끼를 뭅니다." },
      { emoji: "❗", title: "입질이 오면 탭!", body: "물고기가 줄을 물면 그 줄이 흔들리고 ❗ 표시가 떠요. 그 줄을 탭하면 낚여요. 타이밍이 정확할수록 점수가 커져요(👍 → ✨ → ⚡)." },
      { emoji: "🎣", title: "대물은 끌어올리기", body: "큰 물고기는 무니까 줄이 팽팽해져요. 화면을 연타해서 끌어올리세요. 미끼·장비를 키우고 도감을 채우면 더 멀리, 더 깊이 떠날 수 있어요!" },
      { emoji: "⏱️", title: "한 판은 60초!", body: "제한 시간은 60초예요. 입질을 놓치거나 빈 줄을 잘못 치면 미스(❌)가 쌓이는데, 5번 쌓이면 그 자리에서 끝나요. 침착하게, 확실할 때만 챔질하세요!" },
    ];
    const s = steps[Math.min(tutStep, steps.length) - 1];
    const last = tutStep >= steps.length;
    const next = () => { if (last) { setTutStep(0); setIsNewPlayer(false); setScreen("map"); } else setTutStep((t) => t + 1); };
    return (
      <Center>
        <Fonts />
        <div style={{ ...cardStyle, maxWidth: 400, textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>{s.emoji}</div>
          <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 22, color: "#0c3b34", marginBottom: 8 }}>{s.title}</div>
          <div style={{ fontSize: 14, color: "#37544d", lineHeight: 1.7, minHeight: 76 }}>{s.body}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "16px 0" }}>
            {steps.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === tutStep - 1 ? "#27ae8f" : "#d4e4de" }} />)}
          </div>
          <BigBtn onClick={next}>{last ? "🎣 낚으러 가기!" : "다음 →"}</BigBtn>
          {!last && (
            <div style={{ marginTop: 6 }}>
              <button onClick={() => { setTutStep(0); setIsNewPlayer(false); setScreen("map"); }} style={{ background: "none", border: "none", color: "#9bb0a8", fontSize: 12.5, cursor: "pointer", fontFamily: "'Gowun Dodum',sans-serif" }}>건너뛰기</button>
            </div>
          )}
        </div>
      </Center>
    );
  }

  // ─── 지도(장소 선택) ───
  if (screen === "map") {
    const sel = selPin != null ? SPOTS[selPin] : null;
    const selUnlocked = sel && unlocked.includes(sel.id);
    const selOkGear = sel && gearSum(gearLvl, ownedBaits) >= sel.unlock.gearSum;
    const selOkCoin = sel && coins >= sel.unlock.coin;
    const selCanUnlock = sel && !selUnlocked && selOkGear && selOkCoin;
    return (
      <Center>
        <Fonts />
        <div style={{ ...cardStyle, maxWidth: 720, padding: "18px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 24, color: "#0c3b34" }}>🗺️ 낚시 여행{claimed.all && <span style={{ fontSize: 12, marginLeft: 8, color: "#d08020" }}>{ALL_TITLE}</span>}</div>
            <div style={{ fontFamily: "'Jua',sans-serif", color: "#c8881f" }}>🪙 {coins}</div>
          </div>
          {/* 강태공 레벨 */}
          {(() => {
            const lv = anglerLevelFromExp(anglerExp);
            const curBase = expForLevel(lv), nextBase = expForLevel(lv + 1);
            const pct = Math.max(0, Math.min(100, ((anglerExp - curBase) / (nextBase - curBase)) * 100));
            return (
              <div style={{ width: "100%", marginTop: 8, background: "#f1f8f5", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22 }}>🎣</div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 12.5, color: "#0c3b34", fontFamily: "'Jua',sans-serif" }}>Lv.{lv} <span style={{ color: "#2c6f86" }}>{anglerTitle(lv)}</span></div>
                  <div style={{ height: 6, background: "#e4efea", borderRadius: 3, marginTop: 3 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#27ae8f,#7fe0c0)", borderRadius: 3, transition: "width .3s" }} />
                  </div>
                </div>
                <div style={{ fontSize: 10.5, color: "#7a948c" }}>{anglerExp - curBase}/{nextBase - curBase}</div>
              </div>
            );
          })()}

          {/* 2단: 왼쪽 지도 / 오른쪽 정보 */}
          <div style={{ display: "flex", gap: 16, width: "100%", marginTop: 10, alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 46%", maxWidth: "46%" }}>

          {/* 한반도 지도 */}
          <div style={{ position: "relative", width: "100%", marginTop: 10 }}>
            {/* 줌/팬 뷰포트 */}
            <div
              style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 14, touchAction: "none" }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setMapZoom((z) => (z > 1.2 ? 1 : 2));
                setMapPan({ x: 0, y: 0 });
              }}
              onPointerDown={(e) => {
                if (mapZoom <= 1) return;
                panRef.current = { sx: e.clientX, sy: e.clientY, px: mapPan.x, py: mapPan.y };
              }}
              onPointerMove={(e) => {
                if (!panRef.current) return;
                const dx = e.clientX - panRef.current.sx;
                const dy = e.clientY - panRef.current.sy;
                const lim = 140 * (mapZoom - 1);
                setMapPan({
                  x: Math.max(-lim, Math.min(lim, panRef.current.px + dx)),
                  y: Math.max(-lim, Math.min(lim, panRef.current.py + dy)),
                });
              }}
              onPointerUp={() => { panRef.current = null; }}
              onPointerLeave={() => { panRef.current = null; }}
            >
            <div style={{ position: "relative", width: "100%", transform: `translate(${mapPan.x}px,${mapPan.y}px) scale(${mapZoom})`, transformOrigin: "center center", transition: panRef.current ? "none" : "transform .2s", cursor: mapZoom > 1 ? "grab" : "default" }}>
            <svg viewBox="0 0 200 280" style={{ width: "100%", display: "block" }}>
              <defs>
                <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cde7d4" />
                  <stop offset="100%" stopColor="#a7d8c2" />
                </linearGradient>
              </defs>
              {/* 바다 배경 */}
              <rect x="0" y="0" width="200" height="280" fill="#bfe3ef" rx="14" />
              {/* 한반도 윤곽 */}
              <path d={KOREA_PATH} fill="url(#land)" stroke="#5a9e84" strokeWidth="1.6" strokeLinejoin="round" />
              {/* 제주도 */}
              <path d={JEJU_PATH} fill="url(#land)" stroke="#5a9e84" strokeWidth="1.4" strokeLinejoin="round" />
              {/* 핀들을 잇는 여행 경로 (본토만) */}
              <polyline
                points={SPOTS.filter((s) => !s.island).map((s) => { const p = geoToPct(s.geo.lat, s.geo.lon, false, s.id); return `${(p.x / 100) * 200},${(p.y / 100) * 280}`; }).join(" ")}
                fill="none" stroke="rgba(255,159,67,.5)" strokeWidth="1.2" strokeDasharray="3 3"
              />
            </svg>

            {/* 핀 (절대 위치 오버레이) */}
            {SPOTS.map((s, idx) => {
              const isUnlocked = unlocked.includes(s.id);
              const okGear = gearSum(gearLvl, ownedBaits) >= s.unlock.gearSum;
              const okCoin = coins >= s.unlock.coin;
              const canUnlock = !isUnlocked && okGear && okCoin;
              const selected = selPin === idx;
              const p = geoToPct(s.geo.lat, s.geo.lon, s.island, s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelPin(idx); play("pull"); }}
                  style={{
                    position: "absolute",
                    left: `${p.x}%`, top: `${p.y}%`,
                    transform: "translate(-50%,-50%)",
                    width: selected ? 28 : 22, height: selected ? 28 : 22,
                    borderRadius: "50%", border: (stars[s.id] || 0) >= 3 ? "2.5px solid #ffce3a" : selected ? "2.5px solid #fff" : "1.5px solid rgba(255,255,255,.8)",
                    background: isUnlocked
                      ? (s.id === "baekdu" ? "radial-gradient(circle,#ffe27a,#e8a72c)" : "radial-gradient(circle,#7fd8c0,#2c9c86)")
                      : canUnlock ? "radial-gradient(circle,#ffd86b,#ff9f43)" : "rgba(120,140,150,.85)",
                    color: "#fff", fontSize: selected ? 12 : 10, fontWeight: 700, cursor: "pointer",
                    boxShadow: selected ? "0 0 0 3px rgba(255,159,67,.35), 0 3px 6px rgba(0,0,0,.3)" : "0 2px 4px rgba(0,0,0,.3)",
                    display: "grid", placeItems: "center", padding: 0, zIndex: selected ? 6 : 2,
                    animation: canUnlock && !selected ? "pinpulse 1.2s infinite" : "none",
                    transition: "width .15s, height .15s",
                  }}
                >
                  {isUnlocked ? (s.id === "baekdu" ? "★" : idx + 1) : canUnlock ? "🔓" : "🔒"}
                </button>
              );
            })}
            </div>{/* transform */}
            </div>{/* viewport */}

            {/* 줌 컨트롤 */}
            <div style={{ position: "absolute", right: 8, bottom: 8, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
              <button onClick={() => { setMapZoom((z) => Math.min(2.5, +(z + 0.5).toFixed(1))); }} style={zoomBtn}>＋</button>
              <button onClick={() => { setMapZoom((z) => { const nz = Math.max(1, +(z - 0.5).toFixed(1)); if (nz === 1) setMapPan({ x: 0, y: 0 }); return nz; }); }} style={zoomBtn}>－</button>
            </div>
            {mapZoom > 1 && (
              <div style={{ position: "absolute", left: 8, bottom: 8, fontSize: 10, color: "#5a7d77", background: "rgba(255,255,255,.8)", padding: "2px 7px", borderRadius: 8, zIndex: 10 }}>×{mapZoom} · 끌어서 이동</div>
            )}
          </div>
          </div>{/* 왼쪽 지도 칼럼 끝 */}

          {/* 오른쪽 정보 칼럼 */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* 선택된 장소 상세 패널 */}
          {sel ? (
            <div style={{
              width: "100%", borderRadius: 14, overflow: "hidden",
              background: `linear-gradient(120deg, ${sel.bg[1]}, ${sel.bg[2]})`, color: "#fff", textAlign: "left",
            }}>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 19, textShadow: "0 1px 3px rgba(0,0,0,.4)" }}>
                    {selUnlocked ? "" : selCanUnlock ? "🔓 " : "🔒 "}{sel.name}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>물살 {"🌊".repeat(Math.round(sel.flow * 1.6))}</div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.92, margin: "3px 0 6px", textShadow: "0 1px 2px rgba(0,0,0,.4)" }}>{sel.sub}</div>
                <div style={{ fontSize: 12.5, marginBottom: 8 }}>{sel.fish.map(([n]) => `${FISH[n].emoji}${n}`).join("  ")}</div>
                {selUnlocked && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 16, letterSpacing: 2, marginBottom: 4 }}>
                      {[0, 1, 2].map((i) => <span key={i} style={{ color: i < (stars[sel.id] || 0) ? "#ffce3a" : "rgba(255,255,255,.4)" }}>★</span>)}
                      {bestBySpot[sel.id] != null && <span style={{ fontSize: 11, opacity: 0.85, marginLeft: 8 }}>최고 🪙{bestBySpot[sel.id]}</span>}
                    </div>
                    <div style={{ fontSize: 10.5, opacity: 0.85, lineHeight: 1.5 }}>
                      {spotMissions(sel).map((m, i) => <div key={i}>· {m.label}</div>)}
                    </div>
                  </div>
                )}
                {selUnlocked ? (
                  <button onClick={() => startSpot(selPin)} style={mapBtn()}>낚시하러 가기 →</button>
                ) : selCanUnlock ? (
                  <button onClick={() => tryUnlock(selPin)} style={mapBtn()}>🔓 해금하기 🪙{sel.unlock.coin}</button>
                ) : (
                  <div style={{ fontSize: 11.5, background: "rgba(0,0,0,.28)", borderRadius: 10, padding: "6px 9px" }}>
                    해금 조건: 🪙{sel.unlock.coin} {selOkCoin ? "✓" : "(부족)"} · 장비 진척도 {sel.unlock.gearSum} {selOkGear ? "✓" : `(현재 ${gearSum(gearLvl, ownedBaits)})`}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", textAlign: "center", color: "#5a7d77", fontSize: 13, padding: "20px 0" }}>
              지도에서 낚시터를 골라보세요 📍
            </div>
          )}

          {/* 일일 도전 과제 */}
          {daily && (
            <div style={{ width: "100%", background: "#f1f8f5", borderRadius: 14, padding: "10px 12px" }}>
              <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 14, color: "#0c3b34", marginBottom: 8, textAlign: "left" }}>📋 오늘의 도전</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {daily.tasks.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, color: t.done ? "#27ae8f" : "#37544d" }}>
                        {t.done ? "✓ " : ""}{t.label}
                      </div>
                      <div style={{ height: 5, background: "#e4efea", borderRadius: 3, marginTop: 3 }}>
                        <div style={{ width: `${Math.min(100, (t.prog / t.target) * 100)}%`, height: "100%", background: t.done ? "#27ae8f" : "#7fc4ad", borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ minWidth: 60, textAlign: "right" }}>
                      {t.claimed ? (
                        <span style={{ fontSize: 11, color: "#aab" }}>완료</span>
                      ) : t.done ? (
                        <button onClick={() => claimDaily(t.id)} style={rewardBtn}>🪙{t.reward}</button>
                      ) : (
                        <span style={{ fontSize: 11, color: "#9bb0a8" }}>{t.prog}/{t.target}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <BigBtn onClick={() => setScreen("shop")} variant="ghost">🛒 상점</BigBtn>
            <BigBtn onClick={() => setScreen("book")} variant="ghost">📖 도감 {Object.keys(book).length}/{Object.keys(FISH).length}</BigBtn>
          </div>
          <BigBtn onClick={() => setScreen("rank")} variant="ghost">🏆 랭킹</BigBtn>
          </div>{/* 오른쪽 정보 칼럼 끝 */}
          </div>{/* 2단 flex 끝 */}
        </div>
        <style>{`@keyframes pinpulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,159,67,.5),0 3px 6px rgba(0,0,0,.3)} 50%{box-shadow:0 0 0 7px rgba(255,159,67,0),0 3px 6px rgba(0,0,0,.3)} }`}</style>
      </Center>
    );
  }

  // ─── 랭킹(리더보드) ───
  if (screen === "rank") {
    const myBest = Math.max(0, ...Object.values(bestBySpot), 0);
    const board = buildLeaderboard(myBest);
    const myRank = board.findIndex((x) => x.me) + 1;
    const lv = anglerLevelFromExp(anglerExp);
    return (
      <Center>
        <Fonts />
        <div style={{ ...cardStyle, maxWidth: 440 }}>
          <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 24, color: "#0c3b34" }}>🏆 낚시꾼 랭킹</div>
          <div style={{ fontSize: 12.5, color: "#5a7d77", margin: "4px 0 12px" }}>한 판 최고 점수 기준 · 나의 최고 🪙{myBest}</div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
            {board.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12,
                background: p.me ? "linear-gradient(135deg,#fff3cf,#ffe09e)" : "#f1f8f5",
                border: p.me ? "1.5px solid #ffce3a" : "1.5px solid transparent",
              }}>
                <div style={{ width: 26, textAlign: "center", fontFamily: "'Jua',sans-serif", fontSize: 15, color: i === 0 ? "#e0962a" : "#7a948c" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div style={{ fontSize: 20 }}>{p.emoji}</div>
                <div style={{ flex: 1, textAlign: "left", fontFamily: "'Jua',sans-serif", fontSize: 14.5, color: "#0c3b34" }}>
                  {p.name}{p.me && <span style={{ fontSize: 11, color: "#b8860b", marginLeft: 6 }}>Lv.{lv} {anglerTitle(lv)}</span>}
                </div>
                <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 15, color: "#2c6f86" }}>🪙{p.score}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12.5, color: "#5a7d77", margin: "12px 0 4px" }}>
            {myRank === 1 ? "🎉 1등! 최고의 낚시꾼이에요" : `현재 ${myRank}위 · 더 높은 점수로 따라잡아 보세요`}
          </div>
          <BigBtn onClick={() => setScreen("map")} variant="ghost">← 지도로</BigBtn>
        </div>
      </Center>
    );
  }

  // ─── 도감 ───
  if (screen === "book") {
    const names = Object.keys(FISH);
    const caught = names.filter((n) => book[n]).length;
    // 희귀도별 그룹
    const byRarity = {};
    names.forEach((n) => { const r = FISH[n].rarity; (byRarity[r] = byRarity[r] || []).push(n); });
    return (
      <Center>
        <Fonts />
        <div style={{ ...cardStyle, maxWidth: 480, padding: "20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 24, color: "#0c3b34" }}>📖 어종 도감</div>
            <div style={{ fontFamily: "'Jua',sans-serif", color: "#2c6f86", fontSize: 16 }}>{caught} / {names.length}</div>
          </div>
          {/* 진행 바 */}
          <div style={{ width: "100%", height: 8, background: "#e4efea", borderRadius: 4, marginTop: 8 }}>
            <div style={{ width: `${(caught / names.length) * 100}%`, height: "100%", background: "linear-gradient(90deg,#27ae8f,#7fe0c0)", borderRadius: 4, transition: "width .3s" }} />
          </div>

          {/* 전체 완성 보상 */}
          {caught === names.length && (
            <div style={{ width: "100%", marginTop: 10, background: claimed.all ? "#eef5f2" : "linear-gradient(135deg,#ffe9a8,#ffd054)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 14, color: "#5a3a00" }}>🏆 도감 완성!</div>
                <div style={{ fontSize: 11.5, color: claimed.all ? "#7a948c" : "#8a5a00" }}>{claimed.all ? `칭호 획득: ${ALL_TITLE}` : `칭호 ${ALL_TITLE} + 🪙${ALL_REWARD}`}</div>
              </div>
              {!claimed.all && (
                <button onClick={() => claimReward("all", ALL_REWARD)} style={rewardBtn}>받기</button>
              )}
            </div>
          )}

          <div style={{ width: "100%", marginTop: 12, maxHeight: "60vh", overflowY: "auto" }}>
            {[1, 2, 3, 4, 5].map((r) => {
              const group = byRarity[r] || [];
              const gotCount = group.filter((n) => book[n]).length;
              const complete = group.length > 0 && gotCount === group.length;
              const rk = `r${r}`;
              return (
              <div key={r} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 13, color: RARITY[r].color, textAlign: "left" }}>
                    {RARITY[r].name} <span style={{ color: "#aab", fontWeight: 400 }}>{gotCount}/{group.length}</span>
                  </div>
                  {complete && (
                    claimed[rk]
                      ? <span style={{ fontSize: 11, color: "#27ae8f" }}>✓ 보상 완료</span>
                      : <button onClick={() => claimReward(rk, RARITY_REWARD[r])} style={rewardBtn}>🪙{RARITY_REWARD[r]} 받기</button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {(byRarity[r] || []).map((n) => {
                    const f = FISH[n], got = !!book[n];
                    return (
                      <div key={n}
                        onClick={() => { if (got) { setBookSel(n); play("pull"); } }}
                        style={{
                          background: got ? "#f1f8f5" : "#eceeed", borderRadius: 10, padding: "8px 4px",
                          textAlign: "center", border: `1.5px solid ${got ? RARITY[r].color + "55" : "transparent"}`,
                          position: "relative", cursor: got ? "pointer" : "default",
                        }}>
                        <div style={{ height: 34, display: "grid", placeItems: "center" }}>
                          {got ? <FishArt name={n} size={64} /> : <FishArt name={n} size={64} silhouette />}
                        </div>
                        <div style={{ fontSize: 11, color: got ? "#0c3b34" : "#aab", marginTop: 3, fontWeight: got ? 700 : 400 }}>
                          {got ? n : "???"}
                        </div>
                        {got && <div style={{ fontSize: 9.5, color: "#7a948c" }}>×{book[n]}{bestSize[n] ? ` · ${bestSize[n]}cm` : ""}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ); })}
          </div>
          <BigBtn onClick={() => { setBookSel(null); setScreen("map"); }} variant="ghost">← 지도로</BigBtn>
        </div>

        {/* 어종 상세 카드 */}
        {bookSel && (() => {
          const f = FISH[bookSel];
          const habitats = SPOTS.filter((sp) => sp.fish.some(([nm]) => nm === bookSel));
          return (
            <div
              onClick={() => setBookSel(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(8,30,28,.6)", display: "grid", placeItems: "center", zIndex: 40, padding: 20, backdropFilter: "blur(3px)" }}
            >
              <div onClick={(e) => e.stopPropagation()} style={{
                background: "#fff", borderRadius: 20, width: "100%", maxWidth: 320, overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,.4)", animation: "cardpop .25s ease-out",
              }}>
                <div style={{ background: `linear-gradient(135deg, ${RARITY[f.rarity].color}, ${RARITY[f.rarity].color}cc)`, padding: "18px 18px 14px", color: "#fff", position: "relative" }}>
                  <div style={{ position: "absolute", top: 10, right: 14, fontSize: 12, opacity: 0.9, fontFamily: "'Jua',sans-serif" }}>{RARITY[f.rarity].name}</div>
                  <div style={{ display: "grid", placeItems: "center", marginTop: 6 }}>
                    <div style={{ background: "rgba(255,255,255,.25)", borderRadius: 16, padding: "10px 18px" }}>
                      <FishArt name={bookSel} size={150} />
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 24, textAlign: "center", marginTop: 10, textShadow: "0 1px 4px rgba(0,0,0,.3)" }}>{bookSel}</div>
                </div>
                <div style={{ padding: "16px 18px 20px", textAlign: "left" }}>
                  <div style={{ fontSize: 13.5, color: "#37544d", lineHeight: 1.6, marginBottom: 4 }}>{f.desc}</div>
                  <div style={{ fontSize: 12, color: "#9bb0a8", marginBottom: 12 }}>힘: {f.fight >= 3 ? "🔥 대물급 (드래그 필요)" : f.fight >= 1 ? "보통" : "약함"}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    <Stat label="점수" value={`${f.points}점`} />
                    <Stat label="잡은 수" value={`${book[bookSel]}마리`} />
                    <Stat label="최고 크기" value={bestSize[bookSel] ? `${bestSize[bookSel]}cm` : "-"} />
                  </div>
                  <div style={{ fontSize: 12, color: "#7a948c", marginBottom: 4 }}>📍 서식지</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {habitats.map((sp) => (
                      <span key={sp.id} style={{ fontSize: 12, background: "#eef5f2", color: "#2c6f86", padding: "4px 9px", borderRadius: 10 }}>{sp.name}</span>
                    ))}
                  </div>
                  <button onClick={() => setBookSel(null)} style={{
                    width: "100%", marginTop: 18, padding: "10px", borderRadius: 14, border: "none",
                    background: "#eef5f2", color: "#2c6f86", fontFamily: "'Jua',sans-serif", fontSize: 15, cursor: "pointer",
                  }}>닫기</button>
                </div>
              </div>
            </div>
          );
        })()}
        <style>{`@keyframes cardpop { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
      </Center>
    );
  }

  // ─── 상점 ───
  if (screen === "shop") {
    return (
      <Center>
        <Fonts />
        <div style={{ ...cardStyle, maxWidth: 460 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 26, color: "#0c3b34" }}>🛒 장비 상점</div>
            <div style={{ fontFamily: "'Jua',sans-serif", color: "#c8881f" }}>🪙 {coins}</div>
          </div>
          <div style={{ fontSize: 12, color: "#5a7d77", marginTop: 4 }}>장비를 갖출수록 새 장소가 열려요 (진척도 {gearSum(gearLvl, ownedBaits)})</div>

          {/* 탭 */}
          <div style={{ display: "flex", gap: 6, width: "100%", marginTop: 12 }}>
            {[["gear", "🎣 장비"], ["bait", "🪰 미끼"], ["creel", "🧺 어망"]].map(([key, label]) => (
              <button key={key} onClick={() => setShopTab(key)} style={{
                flex: 1, padding: "9px 0", borderRadius: 12, border: "none", cursor: "pointer",
                fontFamily: "'Jua',sans-serif", fontSize: 14,
                background: shopTab === key ? "#27ae8f" : "#eef5f2",
                color: shopTab === key ? "#fff" : "#5a7d77",
              }}>{label}</button>
            ))}
          </div>

          {/* 장비 (막대·낚싯줄) */}
          {shopTab === "gear" && (
          <div style={{ width: "100%", marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.keys(GEAR).map((key) => {
              const g = GEAR[key], lvl = gearLvl[key], maxed = lvl >= 3, cost = maxed ? 0 : g.cost[lvl], afford = coins >= cost;
              const curName = g.levelNames[lvl - 1], nextName = !maxed ? g.levelNames[lvl] : null;
              return (
                <div key={key} style={{ background: "#f1f8f5", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                  <div style={{ fontSize: 30 }}>{g.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 16, color: "#0c3b34" }}>{curName} <span style={{ color: "#2c6f86", fontSize: 12 }}>Lv.{lvl}</span></div>
                    <div style={{ fontSize: 11.5, color: "#5a7d77", margin: "2px 0 4px" }}>{g.desc}{nextName ? ` · 다음: ${nextName}` : ""}</div>
                    <div style={{ display: "flex", gap: 4 }}>{[1, 2, 3].map((n) => <div key={n} style={{ width: 22, height: 6, borderRadius: 3, background: n <= lvl ? "#27ae8f" : "#d4e4de" }} />)}</div>
                  </div>
                  <button onClick={() => buyUpgrade(key)} disabled={maxed || !afford} style={{
                    fontFamily: "'Jua',sans-serif", fontSize: 14, border: "none", borderRadius: 12, padding: "8px 12px", minWidth: 72,
                    cursor: maxed || !afford ? "default" : "pointer",
                    background: maxed ? "#bcd" : afford ? "linear-gradient(135deg,#ffd86b,#ff9f43)" : "#e0e0e0",
                    color: maxed ? "#fff" : afford ? "#5a3a00" : "#999", boxShadow: maxed || !afford ? "none" : "0 3px 0 #d97f1e",
                  }}>{maxed ? "MAX" : `🪙${cost}`}</button>
                </div>
              );
            })}
          </div>
          )}

          {/* 미끼 (장착형) */}
          {shopTab === "bait" && (
          <div style={{ width: "100%", marginTop: 14, textAlign: "left" }}>
            <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 16, color: "#0c3b34", marginBottom: 8 }}>🪰 미끼 <span style={{ fontSize: 12, color: "#5a7d77" }}>· 하나 골라 장착</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.keys(BAITS).map((key) => {
                const bt = BAITS[key], owned = ownedBaits.includes(key), equipped = equippedBait === key, afford = coins >= bt.cost;
                return (
                  <div key={key} style={{ background: equipped ? "#e3f2ec" : "#f1f8f5", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, border: equipped ? "1.5px solid #27ae8f" : "1.5px solid transparent" }}>
                    <div style={{ fontSize: 24 }}>{bt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 15, color: "#0c3b34" }}>{bt.name}{equipped && <span style={{ fontSize: 11, color: "#27ae8f", marginLeft: 6 }}>장착 중</span>}</div>
                      <div style={{ fontSize: 11.5, color: "#5a7d77" }}>{bt.desc}</div>
                    </div>
                    {owned ? (
                      equipped ? <span style={{ fontSize: 12, color: "#27ae8f", fontFamily: "'Jua',sans-serif" }}>✓</span>
                        : <button onClick={() => equipBait(key)} style={{ fontFamily: "'Jua',sans-serif", fontSize: 13, border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", background: "#cfe2da", color: "#2c6f86" }}>장착</button>
                    ) : (
                      <button onClick={() => buyBait(key)} disabled={!afford} style={{
                        fontFamily: "'Jua',sans-serif", fontSize: 13, border: "none", borderRadius: 10, padding: "7px 12px", minWidth: 64,
                        cursor: afford ? "pointer" : "default",
                        background: afford ? "linear-gradient(135deg,#ffd86b,#ff9f43)" : "#e0e0e0",
                        color: afford ? "#5a3a00" : "#999", boxShadow: afford ? "0 3px 0 #d97f1e" : "none",
                      }}>🪙{bt.cost}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* 어망 (장착형 - 점수 보너스) */}
          {shopTab === "creel" && (
          <div style={{ width: "100%", marginTop: 14, textAlign: "left" }}>
            <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 16, color: "#0c3b34", marginBottom: 8 }}>🧺 어망 <span style={{ fontSize: 12, color: "#5a7d77" }}>· 점수 보너스</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.keys(CREELS).map((key) => {
                const cr = CREELS[key], owned = ownedCreels.includes(key), equipped = equippedCreel === key, afford = coins >= cr.cost;
                return (
                  <div key={key} style={{ background: equipped ? "#e3f2ec" : "#f1f8f5", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, border: equipped ? "1.5px solid #27ae8f" : "1.5px solid transparent" }}>
                    <div style={{ fontSize: 24 }}>{cr.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 15, color: "#0c3b34" }}>{cr.name}{equipped && <span style={{ fontSize: 11, color: "#27ae8f", marginLeft: 6 }}>장착 중</span>}</div>
                      <div style={{ fontSize: 11.5, color: "#5a7d77" }}>{cr.desc}</div>
                    </div>
                    {owned ? (
                      equipped ? <span style={{ fontSize: 12, color: "#27ae8f", fontFamily: "'Jua',sans-serif" }}>✓</span>
                        : <button onClick={() => equipCreel(key)} style={{ fontFamily: "'Jua',sans-serif", fontSize: 13, border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", background: "#cfe2da", color: "#2c6f86" }}>장착</button>
                    ) : (
                      <button onClick={() => buyCreel(key)} disabled={!afford} style={{
                        fontFamily: "'Jua',sans-serif", fontSize: 13, border: "none", borderRadius: 10, padding: "7px 12px", minWidth: 64,
                        cursor: afford ? "pointer" : "default",
                        background: afford ? "linear-gradient(135deg,#ffd86b,#ff9f43)" : "#e0e0e0",
                        color: afford ? "#5a3a00" : "#999", boxShadow: afford ? "0 3px 0 #d97f1e" : "none",
                      }}>🪙{cr.cost}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          <BigBtn onClick={() => setScreen("map")} variant="ghost">← 지도로</BigBtn>
        </div>
      </Center>
    );
  }

  // ─── 결과 ───
  if (screen === "result") {
    const nextSpot = SPOTS[spotIdx + 1];
    const nextLocked = nextSpot && !unlocked.includes(nextSpot.id);
    return (
      <Center>
        <Fonts />
        <div style={cardStyle}>
          <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 22, color: "#2c6f86" }}>{SPOTS[spotIdx].name}</div>
          <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 28, color: "#0c3b34" }}>낚시 종료</div>
          <div style={{ fontSize: 18, color: "#2c6f86", margin: "8px 0 2px" }}>이번 판 🪙 +{lastEarned}</div>
          {levelUpInfo && (
            <div style={{ width: "100%", background: "linear-gradient(135deg,#ffe9a8,#ffd054)", borderRadius: 14, padding: "12px 14px", margin: "6px 0 4px", animation: "cardpop .3s ease-out" }}>
              <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 18, color: "#5a3a00" }}>🎉 레벨 업! Lv.{levelUpInfo.to}</div>
              <div style={{ fontSize: 13, color: "#8a5a00", marginTop: 2 }}>칭호 「{levelUpInfo.title}」 · 보너스 🪙{levelUpInfo.bonus}</div>
            </div>
          )}
          <div style={{ fontSize: 14, color: "#5a7d77", marginBottom: 8 }}>보유 코인 {coins}</div>

          {/* 별점 + 미션 현황 */}
          {lastStarResult && (
            <div style={{ width: "100%", background: "#f1f8f5", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 30, letterSpacing: 4, marginBottom: 6 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ color: i < lastStarResult.earnedStars ? "#ffce3a" : "#d4e4de" }}>★</span>
                ))}
              </div>
              {lastStarResult.earnedStars > lastStarResult.prevStars && (
                <div style={{ fontSize: 12, color: "#e0962a", marginBottom: 6 }}>🎉 최고 기록 갱신!</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {lastStarResult.results.map((m) => (
                  <div key={m.id} style={{ fontSize: 12.5, color: m.done ? "#27ae8f" : "#9bb0a8", textAlign: "left" }}>
                    {m.done ? "★" : "☆"} {m.label} <span style={{ opacity: 0.7 }}>({m.cur}/{m.target})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {creelList.length > 0 && (
            <div style={{ fontSize: 13, color: "#3a6b62", margin: "8px 0 12px" }}>{creelList.map(([n, c]) => `${FISH[n].emoji}${n}×${c}`).join("　")}</div>
          )}
          {newCatches.length > 0 && (
            <div style={{ fontSize: 12.5, color: "#1c7a5e", background: "#e3f7ef", padding: "8px 10px", borderRadius: 10, marginBottom: 8 }}>
              ✨ 도감 신규 등록: {newCatches.join("·")}
            </div>
          )}
          {nextLocked && (
            <div style={{ fontSize: 12, color: "#a06a1f", background: "#fff5e2", padding: "8px 10px", borderRadius: 10, marginBottom: 8 }}>
              다음 장소 「{nextSpot.name}」 해금: 🪙{nextSpot.unlock.coin} · 장비 진척도 {nextSpot.unlock.gearSum}
            </div>
          )}
          <BigBtn onClick={() => startSpot(spotIdx)}>한 번 더</BigBtn>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <BigBtn onClick={() => setScreen("shop")} variant="ghost">🛒 상점</BigBtn>
            <BigBtn onClick={() => setScreen("rank")} variant="ghost">🏆 랭킹</BigBtn>
          </div>
          <BigBtn onClick={() => setScreen("map")} variant="ghost">🗺️ 지도로</BigBtn>
        </div>
        <style>{`@keyframes cardpop { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
      </Center>
    );
  }

  // ─── 게임 화면 ───
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Gowun Dodum','Apple SD Gothic Neo',sans-serif", background: "#0c3b34", userSelect: "none", padding: 8, boxSizing: "border-box" }}>
      <Fonts />
      <RotateHint />
      <div style={{ width: "100%", maxWidth: POOL_W, position: "relative" }}>
        <div style={{ position: "absolute", top: 8, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 12, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.6)", pointerEvents: "none" }}>
          <div style={{ fontFamily: "'Jua',sans-serif", fontSize: 22 }}>
            🎣 {score}
            {combo > 1 && <span style={{ fontSize: 14, marginLeft: 8, color: "#ffe066" }}>🔥{combo}</span>}
            {fever && <span style={{ fontSize: 14, marginLeft: 8, color: "#ff5ca8" }}>★FEVER</span>}
          </div>
          <div style={{ textAlign: "right", fontSize: 13 }}>
            <div>{spot.name} · ⏱{timeLeft}s</div>
            <div>{BAITS[equippedBait].icon}{CREELS[equippedCreel].icon}{TIMES[weather.time].icon}{SKIES[weather.sky].icon} {"❌".repeat(missCount) || ""}</div>
          </div>
        </div>
        <button onClick={() => { soundOn.current = !soundOn.current; if (soundOn.current) bgm.start(); else bgm.stop(); force((n) => n + 1); }} style={{ position: "absolute", top: 44, left: 12, zIndex: 13, background: "rgba(0,0,0,.3)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, padding: "2px 8px", cursor: "pointer" }}>{soundOn.current ? "🔊" : "🔇"}</button>

        <div ref={poolBoxRef}
          onPointerDown={() => { if (dragRef.current) yankLine(dragRef.current.line); }}
          style={{
          position: "relative", width: "100%", aspectRatio: `${POOL_W} / ${POOL_H}`, borderRadius: 16, overflow: "hidden",
          background: fever ? "linear-gradient(180deg,#ffe0c2 0 16%,#ff9bbf 16% 55%,#b85a8e 100%)" : `linear-gradient(180deg,${spot.bg[0]} 0 16%,${spot.bg[1]} 16% 55%,${spot.bg[2]} 100%)`,
          boxShadow: "0 12px 30px rgba(0,0,0,.35)", transition: "background .4s",
          animation: shake ? "screenshake .28s ease-out" : "none",
          ["--shk"]: `${shake}px`,
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: POOL_W, height: POOL_H, transform: "scale(var(--s))", transformOrigin: "top left" }}
            ref={(el) => { if (el && el.parentElement) { const w = el.parentElement.clientWidth; el.parentElement.style.setProperty("--s", w / POOL_W); el.style.setProperty("--s", w / POOL_W); } }}>
            {/* 장소 배경 풍경 */}
            {BG_ART[spot.type] && (
              <svg width={POOL_W} height={POOL_H} viewBox={`0 0 ${POOL_W} ${POOL_H}`} style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }} dangerouslySetInnerHTML={{ __html: BG_ART[spot.type] }} />
            )}

            {/* 풍경: 흐르는 구름 (수면 위 하늘) */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 8, height: WATER_TOP - 14, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
              {[{ t: 12, d: 48, dur: 55, o: 0.5 }, { t: 26, d: 70, dur: 80, o: 0.38 }, { t: 6, d: 38, dur: 67, o: 0.32 }].map((c, i) => (
                <div key={i} style={{ position: "absolute", top: c.t, left: -80, width: c.d, height: c.d * 0.42, background: "#fff", opacity: c.o, borderRadius: "50%", filter: "blur(3px)", animation: `cloud ${c.dur}s linear infinite`, animationDelay: `${-i * 18}s` }} />
              ))}
            </div>

            {/* 물속 기포 */}
            <div style={{ position: "absolute", left: 0, right: 0, top: WATER_TOP, bottom: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
              {[{ x: 14, s: 5, dur: 8 }, { x: 30, s: 3, dur: 11 }, { x: 52, s: 6, dur: 7 }, { x: 70, s: 4, dur: 10 }, { x: 88, s: 3, dur: 9 }].map((b, i) => (
                <div key={i} style={{ position: "absolute", left: `${b.x}%`, bottom: -10, width: b.s, height: b.s, borderRadius: "50%", background: "rgba(255,255,255,.35)", animation: `bubble ${b.dur}s ease-in infinite`, animationDelay: `${-i * 2.5}s` }} />
              ))}
            </div>

            {/* 배경 물고기 떼 (장식, 하단을 유유히 헤엄침) */}
            <div style={{ position: "absolute", left: 0, right: 0, top: WATER_TOP, bottom: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
              {BGFISH.map((b, i) => (
                <div key={i} style={{
                  position: "absolute", top: `${b.y}%`, left: 0, width: b.size, height: b.size * 0.5,
                  opacity: b.opacity,
                  animation: `bgfish${b.dir > 0 ? "R" : "L"} ${b.dur}s linear infinite`, animationDelay: `${b.delay}s`,
                }}>
                  <svg width={b.size} height={b.size * 0.5} viewBox="0 0 40 20" style={{ display: "block", transform: `scaleX(${b.dir})` }}>
                    <ellipse cx="16" cy="10" rx="14" ry="5.5" fill="#0c3b34" />
                    <polygon points="28,10 40,3 40,17" fill="#0c3b34" />
                  </svg>
                </div>
              ))}
            </div>

            {/* 강바닥: 모래 + 바위 + 수초 군락 */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 78, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
              {/* 바닥 모래 */}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 26, background: "linear-gradient(180deg, transparent, rgba(40,60,55,.35))" }} />
              {/* 바위들 */}
              {[{ x: 12, w: 70, h: 26 }, { x: 44, w: 100, h: 20 }, { x: 72, w: 84, h: 30 }].map((r, i) => (
                <div key={`rock${i}`} style={{ position: "absolute", left: `${r.x}%`, bottom: -8, width: r.w, height: r.h, background: "rgba(35,55,52,.5)", borderRadius: "50% 50% 0 0" }} />
              ))}
              {/* 수초 군락 (여러 가닥) */}
              {[6, 9, 13, 30, 34, 66, 70, 74, 88, 92].map((wx, i) => (
                <div key={`weed${i}`} style={{ position: "absolute", left: `${wx}%`, bottom: -6, width: 3.5, height: 22 + (i % 3) * 12, background: "linear-gradient(180deg, transparent, rgba(50,130,85,.5))", borderRadius: "50% 50% 0 0", transformOrigin: "bottom", animation: `weed ${3 + (i % 4) * 0.5}s ease-in-out infinite`, animationDelay: `${-i * 0.4}s` }} />
              ))}
            </div>

            {[24, POOL_W - 34].map((x, k) => <div key={k} style={{ position: "absolute", left: x, top: 30, width: 10, height: 60, background: "linear-gradient(#a9743b,#6b4420)", borderRadius: 5, boxShadow: "0 2px 4px rgba(0,0,0,.3)" }} />)}
            <div style={{ position: "absolute", left: 28, right: 28, top: RAIL_Y, height: 3, background: "#5a3d20", borderRadius: 2 }} />

            {/* 시간대·날씨 색 오버레이 */}
            <div style={{ position: "absolute", inset: 0, background: TIMES[weather.time].overlay, pointerEvents: "none", zIndex: 1 }} />
            <div style={{ position: "absolute", inset: 0, background: SKIES[weather.sky].overlay, pointerEvents: "none", zIndex: 1 }} />
            {/* 비: 개별 빗방울이 떨어지고 수면에 파문 */}
            {weather.sky === "rain" && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
                {RAINDROPS.map((r, i) => (
                  <div key={i} style={{
                    position: "absolute", left: `${r.x}%`, top: -20,
                    width: 1.5, height: r.len,
                    background: "linear-gradient(180deg, transparent, rgba(200,220,235,.65))",
                    transform: "rotate(14deg)",
                    animation: `raindrop ${r.dur}s linear infinite`, animationDelay: `${r.delay}s`,
                  }} />
                ))}
                {RAINRIPPLES.map((r, i) => (
                  <div key={`r${i}`} style={{
                    position: "absolute", left: `${r.x}%`, top: `${r.y}%`,
                    width: 10, height: 4, border: "1px solid rgba(220,235,245,.5)", borderRadius: "50%",
                    animation: `ripplehit ${r.dur}s ease-out infinite`, animationDelay: `${r.delay}s`,
                  }} />
                ))}
              </div>
            )}

            {fishes.map((f) => {
              const biting = f.state === "bite" || f.state === "fighting";
              const swimming = f.state === "swim" || f.state === "approach";
              const rnow = performance.now();
              const tailHz = swimming ? (60 + Math.abs(f.vx || 40)) : 0;
              const wag = swimming ? Math.sin(rnow / (1000 / (tailHz / 18 + 4)) + (f.wiggleSeed || 0)) * 5 : 0;
              const pitch = swimming ? (f.pitch || 0) : 0;
              return (
              <div key={f.id} style={{ position: "absolute", left: f.x, top: f.y, transform: `translate(-50%,-50%) scaleX(${-f.dir}) scale(${f.type.size}) rotate(${(pitch + wag) * f.dir}deg)`, transition: "none", filter: biting ? "drop-shadow(0 0 6px #ffe066)" : "drop-shadow(0 2px 3px rgba(0,0,0,.3))", opacity: f.state === "flee" ? 0.6 : 1 }}>
                <FishArt name={f.name} size={48} glow={biting} />
              </div>); })}

            {Array.from({ length: N }).map((_, i) => {
              const x = lineX(i);
              const biteFish = fishes.find((f) => (f.state === "bite" || f.state === "fighting") && (f.targetLine === i || f.dragLine === i));
              const isBite = !!biteFish, fighting = biteFish && biteFish.state === "fighting", fl = !!flash[i];
              const sway = isBite ? Math.sin(performance.now() / 50) * (fighting ? 11 : 6) : 0;
              return (
                <div key={i} onClick={(e) => { e.stopPropagation(); yankLine(i); }} style={{ position: "absolute", left: x - 18, top: RAIL_Y, width: 36, height: HOOK_Y - RAIL_Y + 30, cursor: "pointer", zIndex: 6 }}>
                  <svg width="36" height={HOOK_Y - RAIL_Y + 30} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                    <line x1="18" y1="0" x2={18 + sway} y2={HOOK_Y - RAIL_Y} stroke={isBite ? "rgba(255,224,102,.95)" : "rgba(255,255,255,.5)"} strokeWidth={isBite ? 2.4 : 1.4} />
                  </svg>
                  <div style={{ position: "absolute", left: 9 + sway, top: HOOK_Y - RAIL_Y - 6, fontSize: 13, animation: isBite ? "wiggle .25s infinite" : "none" }}>{BAITS[equippedBait].icon}</div>
                  {isBite && !fighting && <div style={{ position: "absolute", left: 4, top: -18, fontSize: 18, animation: "pulse .35s infinite alternate" }}>❗</div>}
                  {fighting && <div style={{ position: "absolute", left: -4, top: -20, fontSize: 16, animation: "pulse .2s infinite alternate", color: "#fff", fontWeight: 700 }}>👆연타!</div>}
                  {fl && <div style={{ position: "absolute", left: 6, top: 0, fontSize: 22, animation: "yank .25s ease-out" }}>✨</div>}
                </div>
              );
            })}

            {drag && <div style={{ position: "absolute", left: lineX(drag.line) - 30, top: HOOK_Y + 18, width: 60, height: 8, background: "rgba(0,0,0,.35)", borderRadius: 4, zIndex: 8 }}><div style={{ width: `${(drag.got / drag.need) * 100}%`, height: "100%", background: "#ffe066", borderRadius: 4, transition: "width .1s" }} /></div>}

            {pops.map((p) => <div key={p.id} style={{ position: "absolute", left: p.x, top: p.y, transform: "translateX(-50%)", color: p.color, fontFamily: "'Jua',sans-serif", fontSize: 16, fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,.6)", animation: "floatUp .8s ease-out forwards", zIndex: 9, pointerEvents: "none", whiteSpace: "nowrap" }}>{p.text}</div>)}

            {/* 물보라 파티클 */}
            {splashes.map((s) => (
              <div key={s.id} style={{
                position: "absolute", left: s.x, top: s.y, width: s.r * 2, height: s.r * 2,
                borderRadius: "50%", background: "rgba(255,255,255,.85)", pointerEvents: "none", zIndex: 8,
                ["--dx"]: `${s.dx}px`, ["--dy"]: `${s.dy}px`,
                animation: "splash .6s ease-out forwards",
              }} />
            ))}

            {/* 팡파르 */}
            {fanfare && (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", zIndex: 11 }}>
                <div style={{
                  fontFamily: "'Jua',sans-serif", fontSize: 40, color: "#fff",
                  textShadow: "0 2px 8px rgba(0,0,0,.5), 0 0 20px rgba(255,224,102,.8)",
                  animation: "fanfare .9s ease-out forwards",
                }}>{fanfare.text}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center", color: "#cfeee4", fontSize: 14, minHeight: 24 }}>
          <span ref={creelBoxRef} key={creelBounce} style={{ fontFamily: "'Jua',sans-serif", color: "#ffe066", display: "inline-block", animation: creelBounce ? "creelpop .35s ease-out" : "none" }}>🧺 어망</span>
          {creelTotal === 0 ? <span style={{ opacity: 0.6 }}>아직 비어있어요</span> : creelList.map(([n, c]) => <span key={n} style={{ background: "rgba(255,255,255,.08)", padding: "2px 8px", borderRadius: 12 }}>{FISH[n].emoji} {n} <b>{c}</b></span>)}
        </div>
      </div>

      {/* 어망으로 날아가는 물고기 (화면 전체 오버레이) */}
      {creelFlies.map((fl) => (
        <div key={fl.id} style={{
          position: "fixed", left: 0, top: 0, zIndex: 50, pointerEvents: "none",
          ["--sx"]: `${fl.sx}px`, ["--sy"]: `${fl.sy}px`, ["--ex"]: `${fl.ex}px`, ["--ey"]: `${fl.ey}px`,
          animation: "flycreel .6s ease-in forwards",
        }}>
          <FishArt name={fl.name} size={42} />
        </div>
      ))}

      <style>{`
        @keyframes floatUp { from{opacity:1;transform:translateX(-50%) translateY(0)} to{opacity:0;transform:translateX(-50%) translateY(-26px)} }
        @keyframes pulse { from{transform:scale(1);opacity:.7} to{transform:scale(1.3);opacity:1} }
        @keyframes wiggle { 0%,100%{transform:rotate(-14deg)} 50%{transform:rotate(14deg)} }
        @keyframes yank { from{transform:translateY(18px) scale(.5);opacity:0} to{transform:translateY(0) scale(1.2);opacity:1} }
        @keyframes screenshake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(calc(var(--shk) * -1),var(--shk))} 40%{transform:translate(var(--shk),calc(var(--shk) * -0.6))} 60%{transform:translate(calc(var(--shk) * -0.6),var(--shk))} 80%{transform:translate(var(--shk),0)} }
        @keyframes splash { from{transform:translate(0,0);opacity:1} to{transform:translate(var(--dx),var(--dy));opacity:0} }
        @keyframes fanfare { 0%{transform:scale(.3);opacity:0} 25%{transform:scale(1.1);opacity:1} 70%{transform:scale(1);opacity:1} 100%{transform:scale(1.05);opacity:0} }
        @keyframes raindrop { from{transform:translateY(0) rotate(14deg)} to{transform:translateY(${POOL_H + 30}px) rotate(14deg)} }
        @keyframes ripplehit { 0%{transform:scale(.3);opacity:0} 30%{opacity:.7} 100%{transform:scale(1.8);opacity:0} }
        @keyframes cloud { from{transform:translateX(0)} to{transform:translateX(${POOL_W + 160}px)} }
        @keyframes bubble { 0%{transform:translateY(0) translateX(0);opacity:0} 15%{opacity:.6} 100%{transform:translateY(-220px) translateX(8px);opacity:0} }
        @keyframes weed { 0%,100%{transform:rotate(-7deg)} 50%{transform:rotate(7deg)} }
        @keyframes bgfishR { from{transform:translateX(-50px)} to{transform:translateX(${POOL_W + 50}px)} }
        @keyframes bgfishL { from{transform:translateX(${POOL_W + 50}px)} to{transform:translateX(-50px)} }
        @keyframes flycreel { 0%{transform:translate(var(--sx),var(--sy)) scale(1) rotate(0deg);opacity:1} 70%{opacity:1} 100%{transform:translate(var(--ex),var(--ey)) scale(.3) rotate(360deg);opacity:0.2} }
        @keyframes creelpop { 0%{transform:scale(1)} 40%{transform:scale(1.4)} 70%{transform:scale(.9)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
}

function Fonts() { return <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&display=swap" rel="stylesheet" />; }
function Stat({ label, value }) {
  return (
    <div style={{ background: "#f1f8f5", borderRadius: 10, padding: "6px 10px", flex: "1 1 auto", minWidth: 70, textAlign: "center" }}>
      <div style={{ fontSize: 10.5, color: "#7a948c" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#0c3b34", fontFamily: "'Jua',sans-serif" }}>{value}</div>
    </div>
  );
}

// 남한 중심 한반도 윤곽 (viewBox 0 0 200 280). 게임용 단순화지만 실제 형태에 근접.
// 서해(완만), 동해(직선적), 남해(다도해), 동남으로 부산까지 뻗는 형태를 반영.
const KOREA_PATH = "M96,8 C101,6 107,9 108,16 C110,24 116,27 121,31 C128,36 136,38 140,46 C143,52 139,59 133,61 C140,66 149,68 153,77 C156,84 151,92 154,100 C157,109 152,118 145,123 C150,131 149,142 142,148 C147,157 143,168 135,173 C139,183 133,193 124,198 C127,208 121,219 111,224 C108,234 101,243 93,249 C90,257 82,261 76,256 C71,249 76,239 71,231 C65,223 55,222 51,213 C46,204 52,194 46,186 C40,178 45,166 39,158 C34,150 40,138 36,128 C32,118 40,108 38,98 C36,88 45,82 50,75 C53,67 50,57 57,50 C63,44 73,47 79,41 C85,35 86,22 92,15 C93,12 94,9 96,8 Z";

// 핀 겹침 해소용 화면 미세 오프셋 (퍼센트). 실제 위치를 크게 안 바꾸고 살짝만 분산.
const PIN_OFFSET = {
  cheonggye: { dx: 2.5, dy: -1.5 },
  han: { dx: -3, dy: 1.5 },
  stream: { dx: 0, dy: 3 },
  imjin: { dx: -1, dy: -2 },
  hantan: { dx: 3, dy: -1 },
  seorak: { dx: 2, dy: -1 },
  donggang: { dx: 0, dy: 2 },
  daecheong: { dx: 0, dy: 2.5 },
  geum: { dx: -3.5, dy: -1.5 },
  chungju: { dx: 0, dy: -3 },
  jeju: { dx: -1, dy: 0 },
  halla: { dx: 2, dy: 0 },
};

// 실제 위경도 → 지도 퍼센트 좌표 (윤곽 안쪽에 들어오도록 보정)
function geoToPct(lat, lon, island, id) {
  const off = (id && PIN_OFFSET[id]) || { dx: 0, dy: 0 };
  if (island) {
    const rx = (lon - 126.2) / (126.95 - 126.2);
    const ry = (33.56 - lat) / (33.56 - 33.1);
    return { x: +(30 + rx * 16 + off.dx).toFixed(1), y: +(90 + ry * 6 + off.dy).toFixed(1) };
  }
  const LON_W = 125.8, LON_E = 129.6, LAT_N = 38.7, LAT_S = 34.3;
  const rx = (lon - LON_W) / (LON_E - LON_W);
  const ry = (LAT_N - lat) / (LAT_N - LAT_S);
  return { x: +(26 + rx * 40 + off.dx).toFixed(1), y: +(12 + ry * 72 + off.dy).toFixed(1) };
}
// 제주도 윤곽 (viewBox 0 0 200 280 기준 타원형 섬)
const JEJU_PATH = "M52,256 Q56,250 72,250 Q92,250 98,256 Q100,262 92,266 Q72,270 58,266 Q50,262 52,256 Z";

function Center({ children }) { return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0c3b34", fontFamily: "'Gowun Dodum',sans-serif", padding: 16, boxSizing: "border-box" }}><RotateHint />{children}</div>; }
function RotateHint() {
  return (
    <>
      <style>{`@media (max-aspect-ratio: 1/1) and (hover: none) and (pointer: coarse) { .rotate-hint { display: flex !important; } }`}</style>
      <div className="rotate-hint" style={{
        display: "none", position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(12,59,52,.95)", color: "#fff", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24,
        fontFamily: "'Jua','Gowun Dodum',sans-serif",
      }}>
        <div style={{ fontSize: 54, animation: "rotatehint 1.5s ease-in-out infinite" }}>📱</div>
        <div style={{ fontSize: 20, marginTop: 16 }}>기기를 가로로 돌려주세요</div>
        <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>낚시는 가로 화면에서 즐길 수 있어요</div>
        <style>{`@keyframes rotatehint { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(90deg)} }`}</style>
      </div>
    </>
  );
}
const cardStyle = { background: "#fff", borderRadius: 22, padding: "26px 22px", width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "0 16px 40px rgba(0,0,0,.3)" };
function BigBtn({ children, onClick, variant }) {
  const ghost = variant === "ghost";
  return <button onClick={onClick} style={{ fontFamily: "'Jua',sans-serif", fontSize: 17, width: "100%", marginTop: 10, padding: "12px", borderRadius: 16, border: "none", cursor: "pointer", background: ghost ? "#eef5f2" : "linear-gradient(135deg,#ffd86b,#ff9f43)", color: ghost ? "#2c6f86" : "#5a3a00", boxShadow: ghost ? "none" : "0 5px 0 #d97f1e" }}>{children}</button>;
}
function mapBtn() { return { fontFamily: "'Jua',sans-serif", fontSize: 14, border: "none", borderRadius: 12, padding: "7px 16px", cursor: "pointer", background: "rgba(255,255,255,.92)", color: "#0c3b34", boxShadow: "0 3px 0 rgba(0,0,0,.2)" }; }
const rewardBtn = { fontFamily: "'Jua',sans-serif", fontSize: 12, border: "none", borderRadius: 10, padding: "5px 12px", cursor: "pointer", background: "linear-gradient(135deg,#ffd86b,#ff9f43)", color: "#5a3a00", boxShadow: "0 2px 0 #d97f1e" };
const zoomBtn = { width: 34, height: 34, borderRadius: 10, border: "none", background: "rgba(255,255,255,.92)", color: "#2c6f86", fontSize: 20, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,.2)", display: "grid", placeItems: "center", lineHeight: 1 };
// 어종별 SVG 그림. name으로 FISH_ART에서 마크업을 찾아 렌더. 없으면 기본 실루엣.
function FishArt({ name, size = 48, glow = false, silhouette = false }) {
  const art = FISH_ART[name];
  const h = size * 0.52; // viewBox 100x52 비율
  const sil = silhouette ? "brightness(0) opacity(0.32)" : "";
  const glowF = glow ? "drop-shadow(0 0 4px #ffe066)" : "";
  const filter = [sil, glowF].filter(Boolean).join(" ") || "none";
  if (!art) {
    const color = (FISH[name] && FISH[name].color) || "#9fd3e0";
    return (
      <svg width={size} height={h} viewBox="0 0 100 52" style={{ display: "block", filter }}>
        <ellipse cx="42" cy="26" rx="34" ry="14" fill={color} />
        <polygon points="70,26 98,10 98,42" fill={color} />
        <circle cx="20" cy="22" r="3.4" fill="#fff" /><circle cx="19" cy="22" r="1.8" fill="#123" />
      </svg>
    );
  }
  return (
    <svg
      width={size} height={h} viewBox="0 0 100 52"
      style={{ display: "block", filter, overflow: "visible" }}
      dangerouslySetInnerHTML={{ __html: art }}
    />
  );
}
