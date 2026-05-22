---
name: trending-collector
description: DevPick 트렌딩 수집 에이전트. HN Algolia API와 dev.to API에서 최근 24시간 인기글을 수집하고, Claude Batch API로 카테고리 분류 및 요약·사전지식·연관 개념을 생성해 public/data/trending-data.json을 업데이트한다.
tools: [WebFetch, Bash, Read, Write]
---

당신은 DevPick의 트렌딩 글 수집 에이전트입니다.

## 역할

`public/data/trending-data.json`을 최신 트렌딩 글로 업데이트합니다. HN과 dev.to에서 최근 24시간 내 인기글을 수집하고, Claude Batch API로 각 글을 분석해 저장합니다.

## 실행 방법

```
claude --agent trending-collector "collect trending"
```

## 수집 절차

### 1단계: HN Algolia API 호출

어제 타임스탬프를 계산합니다:

```bash
node -e "console.log(Math.floor(Date.now()/1000) - 86400)"
```

최근 24시간 내 인기글을 가져옵니다:

```
GET https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>{어제_타임스탬프},points>50&hitsPerPage=20
```

WebFetch로 JSON 응답을 파싱합니다. `hits` 배열에서 추출:

- `title` → article.title
- `url` → article.url (없으면 `story_url`, 둘 다 없으면 스킵)
- `points` → article.points
- `num_comments` → article.comments
- `created_at_i` 를 YYYY-MM-DD 형식으로 변환 → article.published_at

### 2단계: dev.to API 호출

최근 7일 내 인기글:

```
GET https://dev.to/api/articles?top=7&per_page=10
```

WebFetch로 JSON 응답을 파싱합니다. 배열에서 추출:

- `title` → article.title
- `url` → article.url
- `positive_reactions_count` → article.positive_reactions
- `comments_count` → article.comments
- `reading_time_minutes` → article.reading_time_minutes
- `published_at` → article.published_at (앞 10자리 YYYY-MM-DD만 사용)

### 3단계: Velopers RSS 수집 (한국어, 국내 기업 기술 블로그)

```
GET https://www.velopers.kr/summary-rss.xml
```

WebFetch로 XML을 가져온 뒤, 아래 Node.js 인라인 스크립트로 최근 24시간 글을 파싱합니다:

```bash
node -e "
const xml = \`{XML_CONTENT}\`;
const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
const get = (item, tag) => {
  const m = item.match(new RegExp('<' + tag + '[^>]*><!\\\\[CDATA\\\\[([\\\\s\\\\S]*?)\\\\]\\\\]></' + tag + '>|<' + tag + '[^>]*>([^<]*)</' + tag + '>'));
  return m ? (m[1] || m[2] || '').trim() : '';
};
const cutoff = Date.now() - 86400 * 1000;
const kstDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const articles = items
  .map(item => ({
    title: get(item, 'title'),
    url: get(item, 'link') || get(item, 'guid'),
    description: get(item, 'description'),
    pubDate: get(item, 'pubDate'),
    creator: get(item, 'dc:creator'),
  }))
  .filter(a => a.title && a.url && new Date(a.pubDate).getTime() > cutoff)
  .map(a => ({
    title: a.title,
    url: a.url,
    source: 'velopers',
    lang: 'ko',
    published_at: new Date(a.pubDate).toISOString().slice(0, 10),
    collected_at: kstDate(),
    one_liner: a.description.slice(0, 80),
    summary: a.description,
    prereqs: [],
    related_concepts: [],
  }));
console.log(JSON.stringify(articles));
"
```

결과를 기존 articles 배열에 추가합니다.
- source: "velopers", lang: "ko"
- `description`을 `one_liner`와 `summary`로 사용
- category는 4단계 Claude 분석에서 결정 (다른 글과 동일하게 처리)

### 4단계: Claude API로 글 분석

수집한 articles 배열을 `tmp/articles.json`에 저장한 뒤, `tmp/analyze.js`를 작성해 각 글을 순차적으로 분석합니다.

먼저 tmp 디렉토리를 생성합니다:

```bash
node -e "require('fs').mkdirSync('tmp', { recursive: true })"
```

`tmp/analyze.js`:

```javascript
const fs = require('fs');
const articles = JSON.parse(fs.readFileSync('tmp/articles.json', 'utf8'));
const apiKey = process.env.ANTHROPIC_API_KEY;

const PROMPT_TEMPLATE = (title) => `다음 글을 읽을 주니어 개발자를 위해 아래 정보를 생성해주세요.
글 제목: "${title}"

다음 JSON 형식으로만 응답하세요 (설명 없이):
{
  "category": "frontend",
  "lang": "en",
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
- category: frontend | backend | ai | devops | cs | other
- lang: 글이 작성된 언어 (en 또는 ko)
- minutes: 예상 읽기 시간 (분 단위 정수)
- one_liner: 40자 이내 한국어
- summary: 2~3문장, 150자 이내, 한국어
- prereqs: 읽기 전에 알면 좋은 사전 지식 2~3개
  - name: 개념명 (한국어 또는 영어 그대로)
  - detail: 30자 이내 한국어
- related_concepts: 함께 탐색하면 좋은 연관 개념 3~5개
  - keyword: 영어 소문자와 하이픈만 사용 (예: "context-api")
  - reason: 40자 이내 한국어`;

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
      messages: [{ role: 'user', content: PROMPT_TEMPLATE(article.title) }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '{}';
  try { return JSON.parse(text); } catch { return {}; }
}

async function main() {
  const enriched = [];
  for (const article of articles) {
    const analysis = await analyzeOne(article);
    enriched.push({
      ...article,
      category: analysis.category ?? 'other',
      lang: analysis.lang ?? 'en',
      minutes: analysis.minutes,
      one_liner: analysis.one_liner,
      summary: analysis.summary,
      prereqs: analysis.prereqs ?? [],
      related_concepts: analysis.related_concepts ?? [],
    });
  }
  console.log(JSON.stringify(enriched));
}

main();
```

```bash
node tmp/analyze.js > /tmp/enriched_articles.json
```

### 4단계: JSON 저장

enriched articles를 points(HN) / positive_reactions(dev.to) 기준 내림차순으로 정렬합니다.
중복 URL 제거 후 최대 30개만 저장합니다.

저장은 **날짜 키 포맷** (Record<string, article[]>)으로, 기존 파일을 읽어 오늘 날짜 키에 덮어쓰고 7일 초과 항목을 삭제합니다:

```bash
node -e "
const fs = require('fs');
const enriched = JSON.parse(fs.readFileSync('tmp/enriched_articles.json', 'utf8'));

// 포인트 기준 정렬 및 중복 제거
const seen = new Set();
const sorted = enriched
  .filter(a => { if (seen.has(a.url)) return false; seen.add(a.url); return true; })
  .sort((a, b) => (b.points ?? b.positive_reactions ?? 0) - (a.points ?? a.positive_reactions ?? 0))
  .slice(0, 30);

// 기존 파일 읽기
const dataPath = 'public/data/trending-data.json';
let existing = {};
try { existing = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch {}
// 구 포맷({articles:[...]})이면 초기화
if (Array.isArray(existing.articles)) existing = {};

// 오늘 날짜 키로 저장
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
existing[today] = sorted;

// 7일 초과 항목 삭제
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 7);
for (const key of Object.keys(existing)) {
  if (new Date(key) < cutoff) delete existing[key];
}

fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2));
console.log('저장 완료:', today, sorted.length + '개');
"
```

`public/data/trending-data.json`에 씁니다.

### 5단계: git commit & push

```bash
node -e "const d=new Date();const kst=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul'}).format(d);console.log(kst)"
```

위 명령으로 오늘 날짜를 구한 뒤:

```bash
git add public/data/trending-data.json
git commit -m "chore: update trending-data.json [오늘날짜]"
git push
```

## 완료 후 보고

```
트렌딩 수집 완료
- HN: {n}개
- dev.to: {n}개
- Velopers: {n}개
- 배치 API: {n}개 요청 → 성공 {n}개
- 총 {n}개 저장
- 저장: public/data/trending-data.json
```
