export const KEYWORDS = [
  // React / 렌더링 심화
  "react-compiler",
  "use-transition",
  "use-deferred-value",
  "react-server-components",
  "server-actions",
  "react-suspense",
  "react-19",
  "concurrent-rendering",

  // Next.js 심화
  "partial-prerendering",
  "nextjs-middleware",
  "nextjs-cache",
  "parallel-routes",
  "intercepting-routes",
  "nextjs-instrumentation",

  // 상태 관리 / 데이터 패칭
  "zustand",
  "jotai",
  "tanstack-query",
  "tanstack-router",
  "swr",
  "optimistic-updates",

  // TypeScript 심화
  "typescript-generics",
  "conditional-types",
  "template-literal-types",
  "zod",
  "type-predicates",
  "satisfies-operator",

  // 번들러 / 빌드 툴
  "turborepo",
  "nx-monorepo",
  "vite-plugins",
  "rspack",
  "esbuild",
  "biome",
  "module-federation",
  "tree-shaking",

  // 웹 표준 / 브라우저 최신 기능
  "view-transitions-api",
  "container-queries",
  "anchor-positioning",
  "speculation-rules",
  "web-workers",
  "wasm",
  "web-streams",
  "css-layers",
  "has-selector",

  // 성능
  "inp",
  "core-web-vitals",
  "react-performance",
  "code-splitting",
  "bundle-analysis",
  "edge-runtime",

  // 테스팅
  "msw",
  "playwright",
  "vitest",
  "testing-library",
  "visual-regression",
  "contract-testing",

  // API / 풀스택 확장
  "trpc",
  "graphql-subscriptions",
  "rest-vs-graphql",
  "api-design",
  "edge-functions",
  "drizzle-orm",
  "prisma",
  "supabase",
  "serverless",

  // AI / LLM 연동
  "vercel-ai-sdk",
  "langchain-js",
  "rag",
  "llm-streaming",
  "function-calling",
  "prompt-engineering",
  "ai-sdk-rsc",
  "embeddings",
] as const;

export type Keyword = (typeof KEYWORDS)[number];

export const KEYWORD_DESCRIPTIONS: Record<string, string> = {
  // React / 렌더링 심화
  "react-compiler":         "빌드 타임에 React 코드를 자동 최적화하는 공식 컴파일러",
  "use-transition":         "무거운 상태 업데이트를 비긴급 처리로 전환해 UI를 부드럽게 유지",
  "use-deferred-value":     "렌더링 비용이 큰 값의 갱신을 뒤로 미뤄 응답성을 높이는 훅",
  "react-server-components":"서버에서 실행되어 클라이언트 번들 크기를 줄이는 React 컴포넌트",
  "server-actions":         "클라이언트에서 서버 함수를 직접 호출하는 Next.js 풀스택 패턴",
  "react-suspense":         "비동기 데이터 로딩 중 폴백 UI를 선언적으로 처리하는 React 기능",
  "react-19":               "Actions, use() 훅 등 새로운 패턴을 담은 React의 최신 메이저 버전",
  "concurrent-rendering":   "여러 렌더링 작업을 우선순위에 따라 병렬 처리하는 React 핵심 원리",
  // Next.js 심화
  "partial-prerendering":   "정적 셸과 동적 스트림을 조합해 빠른 초기 로딩을 구현하는 기법",
  "nextjs-middleware":      "요청 전 엣지에서 실행되는 Next.js 미들웨어로 인증·리다이렉트 처리",
  "nextjs-cache":           "Next.js의 다층 캐싱 전략 — fetch 캐시부터 라우터 캐시까지",
  "parallel-routes":        "하나의 레이아웃에서 여러 페이지를 동시에 렌더링하는 Next.js 패턴",
  "intercepting-routes":    "현재 컨텍스트를 유지하면서 다른 경로를 모달로 표시하는 기법",
  "nextjs-instrumentation": "Next.js 앱의 시작 시점에 모니터링·추적 코드를 주입하는 API",
  // 상태 관리 / 데이터 패칭
  "zustand":                "보일러플레이트 없이 전역 상태를 관리하는 경량 React 상태 라이브러리",
  "jotai":                  "atom 단위로 상태를 관리해 불필요한 리렌더링을 최소화하는 라이브러리",
  "tanstack-query":         "서버 상태의 패칭·캐싱·동기화를 선언적으로 처리하는 데이터 라이브러리",
  "tanstack-router":        "완전한 타입 안전성을 갖춘 React용 최신 클라이언트 사이드 라우터",
  "swr":                    "stale-while-revalidate 전략으로 항상 최신 데이터를 유지하는 훅",
  "optimistic-updates":     "서버 응답 전 UI를 미리 업데이트해 체감 속도를 높이는 UX 패턴",
  // TypeScript 심화
  "typescript-generics":    "타입을 파라미터로 받아 재사용 가능한 타입 로직을 작성하는 기법",
  "conditional-types":      "조건에 따라 타입을 분기하는 TypeScript의 강력한 타입 시스템 기능",
  "template-literal-types": "문자열 리터럴을 조합해 동적 타입을 생성하는 TypeScript 기능",
  "zod":                    "런타임 유효성 검사와 TypeScript 타입 추론을 동시에 처리하는 스키마 라이브러리",
  "type-predicates":        "함수 반환값으로 타입을 좁혀주는 TypeScript의 타입 가드 선언",
  "satisfies-operator":     "타입 추론을 유지하면서 타입 호환성을 검사하는 TypeScript 연산자",
  // 번들러 / 빌드 툴
  "turborepo":              "모노레포에서 태스크를 병렬·캐시해 빌드 속도를 극적으로 줄이는 도구",
  "nx-monorepo":            "대규모 모노레포의 빌드·테스트·배포를 통합 관리하는 스마트 빌드 시스템",
  "vite-plugins":           "Vite의 Rollup 호환 플러그인 API로 번들링 파이프라인을 확장하는 방법",
  "rspack":                 "Rust로 재작성한 webpack 호환 번들러 — 기존 설정 그대로 속도를 개선",
  "esbuild":                "Go로 작성된 극속 JavaScript 번들러·트랜스파일러",
  "biome":                  "ESLint·Prettier를 대체하는 Rust 기반 통합 린터·포매터",
  "module-federation":      "런타임에 다른 앱의 모듈을 동적으로 로드하는 마이크로 프론트엔드 기법",
  "tree-shaking":           "사용하지 않는 코드를 번들에서 제거해 최종 크기를 줄이는 최적화 기법",
  // 웹 표준 / 브라우저 최신 기능
  "view-transitions-api":   "페이지·요소 전환 시 부드러운 애니메이션을 CSS만으로 구현하는 브라우저 API",
  "container-queries":      "부모 컨테이너 크기 기반으로 스타일을 적용하는 차세대 CSS 반응형 기법",
  "anchor-positioning":     "CSS만으로 요소를 다른 요소에 연결해 배치하는 신규 CSS 기능",
  "speculation-rules":      "브라우저가 페이지 이동 전 미리 로딩·렌더링하도록 지시하는 Chrome API",
  "web-workers":            "메인 스레드를 막지 않고 무거운 연산을 백그라운드에서 실행하는 API",
  "wasm":                   "C/Rust 등 타 언어를 브라우저에서 네이티브 속도로 실행하는 바이너리 포맷",
  "web-streams":            "대용량 데이터를 청크 단위로 읽고 쓰는 브라우저 스트리밍 API",
  "css-layers":             "CSS 우선순위를 명시적 레이어로 제어해 스타일 충돌을 방지하는 @layer 규칙",
  "has-selector":           "자식 요소 상태에 따라 부모를 스타일링할 수 있는 CSS :has() 선택자",
  // 성능
  "inp":                    "사용자 입력부터 화면 반응까지의 지연을 측정하는 Core Web Vitals 지표",
  "core-web-vitals":        "LCP·INP·CLS 세 지표로 측정하는 Google의 웹 성능 표준",
  "react-performance":      "메모이제이션·코드 분할·프로파일링으로 React 앱 성능을 최적화하는 기법",
  "code-splitting":         "번들을 청크로 분리해 초기 로딩 크기를 줄이는 핵심 성능 최적화 전략",
  "bundle-analysis":        "번들 구성을 시각화해 크기의 원인을 찾고 최적화 기회를 발굴하는 방법",
  "edge-runtime":           "사용자와 가까운 엣지 노드에서 코드를 실행해 지연 시간을 줄이는 환경",
  // 테스팅
  "msw":                    "서비스 워커로 네트워크 요청을 가로채 API를 모킹하는 테스트 도구",
  "playwright":             "크로스 브라우저 E2E 테스트를 안정적으로 작성하는 Microsoft의 테스트 프레임워크",
  "vitest":                 "Vite 환경에서 Jest 호환 API로 빠른 단위 테스트를 실행하는 프레임워크",
  "testing-library":        "사용자 관점으로 컴포넌트를 테스트하는 DOM Testing Library 생태계",
  "visual-regression":      "스크린샷 비교로 의도치 않은 UI 변경을 자동으로 감지하는 테스트 기법",
  "contract-testing":       "API 제공자와 소비자 간 계약을 검증해 통합 오류를 사전 방지하는 기법",
  // API / 풀스택 확장
  "trpc":                   "타입 안전한 API를 별도 스키마 없이 TypeScript만으로 구축하는 프레임워크",
  "graphql-subscriptions":  "실시간 데이터 업데이트를 WebSocket으로 전달하는 GraphQL 구독 기능",
  "rest-vs-graphql":        "REST와 GraphQL의 트레이드오프를 비교해 적합한 API 방식을 선택하는 기준",
  "api-design":             "확장 가능하고 사용하기 쉬운 API를 설계하는 원칙과 실전 패턴",
  "edge-functions":         "글로벌 엣지 네트워크에서 실행되는 서버리스 함수로 지연을 최소화",
  "drizzle-orm":            "타입 안전한 SQL을 TypeScript로 작성하는 경량 ORM",
  "prisma":                 "직관적인 스키마 정의와 강력한 타입 추론을 제공하는 Node.js ORM",
  "supabase":               "PostgreSQL 기반의 오픈소스 Firebase 대안 — Auth·Storage·Realtime 제공",
  "serverless":             "서버 관리 없이 함수 단위로 배포·실행하는 클라우드 컴퓨팅 패러다임",
  // AI / LLM 연동
  "vercel-ai-sdk":          "스트리밍·구조화된 출력 등 LLM 연동을 간소화하는 Vercel의 AI 라이브러리",
  "langchain-js":           "LLM 체인·에이전트·메모리를 조합해 AI 앱을 구축하는 JavaScript 프레임워크",
  "rag":                    "외부 문서를 검색해 LLM 답변의 정확성을 높이는 Retrieval-Augmented Generation",
  "llm-streaming":          "LLM 응답을 토큰 단위로 스트리밍해 체감 응답 속도를 높이는 기법",
  "function-calling":       "LLM이 외부 함수를 직접 호출하도록 구조화된 출력을 생성하는 기능",
  "prompt-engineering":     "원하는 출력을 얻기 위해 LLM 입력을 체계적으로 설계하는 기법",
  "ai-sdk-rsc":             "React Server Components와 LLM을 연결해 서버 사이드 AI UI를 구현하는 패턴",
  "embeddings":             "텍스트를 벡터로 변환해 의미 기반 검색과 추천을 구현하는 핵심 개념",
};

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodayDateStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export function getTodayDateDisplay(): string {
  const d = new Date();
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function getKeywordForDate(dateStr: string): string {
  return KEYWORDS[hashDate(dateStr) % KEYWORDS.length];
}

export function getTodayKeyword(): string {
  return getKeywordForDate(getTodayDateStr());
}

export function formatKeyword(kw: string): string {
  return kw.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function getTimeUntilMidnight(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}시간 ${mins}분`;
}
