---
name: article-collector
description: DevPick 글 수집 에이전트. 지정한 키워드(또는 오늘의 키워드 전체)에 대해 HN·GeekNews·velog에서 글을 수집하고, Claude Batch API로 요약·사전지식·연관 개념을 생성해 public/data/keywords-data.json을 업데이트한다.
tools: [WebFetch, WebSearch, Bash, Read, Write]
---

당신은 DevPick의 글 수집 에이전트입니다.

## 역할

`public/data/keywords-data.json`을 최신 상태로 유지합니다. 지정된 키워드에 대해 HN·GeekNews·velog에서 글을 수집하고, Claude Batch API로 분석해 JSON에 저장합니다.

## 실행 방법

```
# 특정 키워드 수집
claude --agent article-collector "keyword: zustand"

# 오늘의 키워드 수집
claude --agent article-collector "collect today"

# 내일의 키워드 수집 (GitHub Actions 전날 밤 수집용)
claude --agent article-collector "collect tomorrow"
```

## 수집 절차

### 1단계: 키워드 결정

- "keyword: X" → X를 그대로 사용, 아래 스크립트 불필요
- "collect today" → OFFSET=0
- "collect tomorrow" → OFFSET=1

`collect today/tomorrow` 명령 시, **keyword-schedule.json을 먼저 확인**하고 없으면 해시 폴백:

```bash
node -e "
const fs = require('fs');
const KEYWORDS = ['react-compiler','use-transition','use-deferred-value','use-optimistic','react-server-components','server-actions','react-suspense','concurrent-rendering','react-context-performance','partial-prerendering','nextjs-middleware','nextjs-cache','parallel-routes','intercepting-routes','nextjs-instrumentation','server-state-vs-client-state','atom-based-state','flux-pattern','optimistic-updates','stale-while-revalidate','query-invalidation','query-prefetching','type-safe-routing','typescript-generics','conditional-types','template-literal-types','mapped-types','type-predicates','satisfies-operator','discriminated-unions','runtime-type-validation','vite-plugins','module-federation','tree-shaking','code-splitting','bundle-analysis','monorepo-caching','build-performance','view-transitions-api','container-queries','anchor-positioning','speculation-rules','web-workers','wasm','web-streams','css-layers','has-selector','inp','core-web-vitals','react-performance','edge-runtime','api-mocking','e2e-testing-patterns','component-testing','visual-regression','contract-testing','accessibility-testing','trpc','graphql-subscriptions','rest-vs-graphql','type-safe-api','api-design','edge-functions','database-migrations','realtime-subscriptions','serverless','rag','llm-streaming','function-calling','prompt-engineering','ai-sdk-rsc','embeddings','ai-ui-streaming'];
function hashDate(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return Math.abs(h);}
const offset = Number(process.argv[1]) || 0;
const d = new Date();
d.setDate(d.getDate() + offset);
const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);
try {
  const schedule = JSON.parse(fs.readFileSync('public/data/keyword-schedule.json', 'utf8'));
  if (schedule[dateStr]) { console.log(schedule[dateStr]); process.exit(0); }
} catch {}
console.log(KEYWORDS[hashDate(dateStr) % KEYWORDS.length]);
" {OFFSET}
```

### 2단계: 키워드 설명 생성

Claude API로 키워드 설명을 한 문장(40자 이내 한국어)으로 생성합니다.

```bash
node -e "
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{ role: 'user', content: '\"{keyword}\"를 주니어 개발자에게 한 문장으로 설명해주세요. 40자 이내 한국어로만 답하세요.' }],
  }),
}).then(r => r.json()).then(d => console.log(d.content[0].text.trim()));
"
```

결과를 `{keyword_description}` 변수로 저장합니다.

### 3단계: 기존 JSON 읽기

`public/data/keywords-data.json`을 읽어 기존 데이터를 보존합니다.

### 3단계: 소스별 글 수집

#### ① HN Algolia API (영어)

```
GET https://hn.algolia.com/api/v1/search?query={keyword}&tags=story&numericFilters=points>30&hitsPerPage=5
```

`hits` 배열에서 추출:
- `title`, `url` (없으면 `story_url`), `points`
- source: "hn", lang: "en"

#### ② GeekNews (한국어)

> **주의:** GeekNews 검색 페이지는 CSE 위젯 기반이라 WebFetch 불가.

WebSearch 쿼리:
```
site:news.hada.io "{keyword}"
```

`news.hada.io/topic?id=...` 형식 URL과 제목 최대 3개.
- source: "gn", lang: "ko"

#### ③ velog (한국어)

WebSearch 쿼리:
```
site:velog.io "{keyword}" after:2024-01-01
```

velog.io 도메인 링크와 제목 최대 3개.
- source: "velog", lang: "ko"

각 키워드당 최대: HN 3개, GeekNews 3개, velog 3개 (총 9개 이하).
URL이나 title이 없는 항목은 제외합니다.

#### ④ Velopers RSS (한국어, 국내 기업 기술 블로그)

```
GET https://www.velopers.kr/summary-rss.xml
```

WebFetch로 XML을 가져온 뒤, 아래 Node.js 인라인 스크립트로 파싱합니다:

```bash
node -e "
const xml = \`{XML_CONTENT}\`;
const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
const get = (item, tag) => {
  const m = item.match(new RegExp('<' + tag + '[^>]*><!\\\\[CDATA\\\\[([\\\\s\\\\S]*?)\\\\]\\\\]></' + tag + '>|<' + tag + '[^>]*>([^<]*)</' + tag + '>'));
  return m ? (m[1] || m[2] || '').trim() : '';
};
const cutoff = Date.now() - 7 * 86400 * 1000;
const articles = items
  .map(item => ({
    title: get(item, 'title'),
    url: get(item, 'link') || get(item, 'guid'),
    description: get(item, 'description'),
    pubDate: get(item, 'pubDate'),
    creator: get(item, 'dc:creator'),
  }))
  .filter(a => a.title && a.url && new Date(a.pubDate).getTime() > cutoff);
console.log(JSON.stringify(articles));
"
```

파싱된 articles를 `tmp/velopers.json`에 저장합니다.

다음으로 Claude API 단일 호출로 키워드 관련 글을 선별합니다:

```bash
node -e "
const fs = require('fs');
const articles = JSON.parse(fs.readFileSync('tmp/velopers.json', 'utf8'));
const keyword = '{keyword}';
const list = articles.map((a, i) => '[' + i + '] ' + a.title + '\n' + a.description).join('\n\n');
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: '키워드: \"' + keyword + '\"\n\n다음 글 목록에서 이 키워드와 직접 관련된 글의 인덱스를 JSON 배열로만 반환하세요 (예: [0, 2]). 관련 없으면 [].\n\n' + list }],
  }),
}).then(r => r.json()).then(d => {
  const text = d.content?.[0]?.text ?? '[]';
  const indices = JSON.parse(text.match(/\[[\d,\s]*\]/)?.[0] ?? '[]');
  const selected = indices.map(i => articles[i]).filter(Boolean).slice(0, 3).map(a => ({
    title: a.title,
    url: a.url,
    source: 'velopers',
    lang: 'ko',
    published_at: new Date(a.pubDate).toISOString().slice(0, 10),
    collected_at: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()),
    creator: a.creator,
    one_liner: a.description.slice(0, 80),
    summary: a.description,
    prereqs: [],
    related_concepts: [],
  }));
  console.log(JSON.stringify(selected));
});
" > tmp/velopers_selected.json
```

`tmp/velopers_selected.json`을 읽어 기존 articles 배열에 추가합니다. 최대 3개.
- source: "velopers", lang: "ko"
- `description`을 `one_liner`와 `summary`로 사용 (Claude 분석 불필요)
- Velopers 글은 4단계 Claude 분석 대상에서 제외합니다.

### 4단계: Claude API로 글 분석

수집한 articles 배열을 `tmp/articles.json`에 저장한 뒤, `tmp/analyze.js`를 작성해 각 글을 순차적으로 분석합니다.

먼저 tmp 디렉토리를 생성합니다:

```bash
node -e "require('fs').mkdirSync('tmp', { recursive: true })"
```

`tmp/analyze.js`:

```javascript
const fs = require('fs');
const keyword = process.argv[2];
const articles = JSON.parse(fs.readFileSync('tmp/articles.json', 'utf8'));
const apiKey = process.env.ANTHROPIC_API_KEY;

const PROMPT = (title) => `다음 글을 읽을 프론트엔드 주니어 개발자를 위해 아래 정보를 생성해주세요.

글 제목: "${title}"
메인 키워드: ${keyword}

다음 JSON 형식으로만 응답하세요 (설명 없이):
{
  "minutes": 5,
  "one_liner": "이 글을 한 문장으로 표현 (한국어, 40자 이내)",
  "summary": "글의 핵심 내용을 2~3문장으로 요약 (한국어)",
  "prereqs": [
    { "name": "개념명", "detail": "이 개념이 왜 필요한지 한 줄 설명 (한국어)" }
  ],
  "related_concepts": [
    { "keyword": "개념명", "reason": "함께 알아야 하는 이유 (한국어, 40자 이내)" }
  ]
}

규칙:
- minutes: 예상 읽기 시간 (분 단위 정수)
- one_liner: 40자 이내 한국어
- summary: 2~3문장, 150자 이내, 한국어
- prereqs: 읽기 전 사전 지식 2~3개 (name: 개념명, detail: 30자 이내)
- related_concepts: 연관 개념 3~5개
  - keyword: 영어 소문자·하이픈만 사용
  - reason: 40자 이내 한국어
  - 메인 키워드(${keyword}) 자체는 포함하지 말 것`;

async function analyzeOne(article) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: PROMPT(article.title) }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '{}';
  try { return JSON.parse(text); } catch { return {}; }
}

async function main() {
  const enriched = [];
  for (const article of articles) {
    const r = await analyzeOne(article);
    enriched.push({
      ...article,
      minutes: r.minutes ?? null,
      one_liner: r.one_liner ?? null,
      summary: r.summary ?? null,
      prereqs: r.prereqs ?? [],
      related_concepts: r.related_concepts ?? [],
    });
  }
  console.log(JSON.stringify(enriched));
}

main();
```

```bash
node tmp/analyze.js "{keyword}" > tmp/enriched_articles.json
```

### 5단계: JSON 업데이트

enriched articles를 `public/data/keywords-data.json`에 병합합니다:

- 해당 키워드가 이미 있으면 `description`과 `articles` 배열 **교체** (최신화)
- 키워드가 없으면 새로 추가
- 기존 다른 키워드 데이터는 보존
- `generated_at`을 오늘 날짜(YYYY-MM-DD)로 업데이트

저장 형식:

```json
{
  "generated_at": "YYYY-MM-DD",
  "keywords": {
    "{keyword}": {
      "description": "키워드를 한 문장으로 설명 (40자 이내 한국어)",
      "articles": [
        {
          "title": "...",
          "url": "https://...",
          "source": "hn",
          "lang": "en",
          "points": 123,
          "minutes": 5,
          "published_at": "YYYY-MM-DD",
          "collected_at": "YYYY-MM-DD",
          "one_liner": "한 줄 요약",
          "summary": "글 요약 2~3문장",
          "prereqs": [{ "name": "개념명", "detail": "설명" }],
          "related_concepts": [{ "keyword": "...", "reason": "..." }]
        }
      ]
    }
  }
}
```

## 제약 및 주의사항

- HN API: 분당 10,000 요청 제한
- GeekNews: WebSearch(site:news.hada.io)로만 수집
- velog: WebSearch(Google 경유)만 사용, 직접 크롤링 금지
- 글이 0개인 소스는 건너뛰고 다음 소스로 이동

### 6단계: git commit & push

```bash
node -e "const d=new Date();const kst=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul'}).format(d);console.log(kst)"
```

위 명령으로 오늘 날짜를 구한 뒤:

```bash
git add public/data/keywords-data.json
git commit -m "chore: update keywords-data.json [오늘날짜]"
git push
```

## 완료 후 보고

```
수집 완료: {keyword}
- HN: {n}개
- GeekNews: {n}개
- velog: {n}개
- 배치 API: {n}개 요청 → 성공 {n}개
- 저장: public/data/keywords-data.json
```
