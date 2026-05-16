import { readFileSync, writeFileSync } from 'fs';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const KEYWORD_ARG = process.argv[2] || '';

const KEYWORDS = [
  'react-compiler','use-transition','use-deferred-value','react-server-components',
  'server-actions','react-suspense','react-19','concurrent-rendering',
  'partial-prerendering','nextjs-middleware','nextjs-cache','parallel-routes',
  'intercepting-routes','nextjs-instrumentation','zustand','jotai','tanstack-query',
  'tanstack-router','swr','optimistic-updates','typescript-generics','conditional-types',
  'template-literal-types','zod','type-predicates','satisfies-operator','turborepo',
  'nx-monorepo','vite-plugins','rspack','esbuild','biome','module-federation',
  'tree-shaking','view-transitions-api','container-queries','anchor-positioning',
  'speculation-rules','web-workers','wasm','web-streams','css-layers','has-selector',
  'inp','core-web-vitals','react-performance','code-splitting','bundle-analysis',
  'edge-runtime','msw','playwright','vitest','testing-library','visual-regression',
  'contract-testing','trpc','graphql-subscriptions','rest-vs-graphql','api-design',
  'edge-functions','drizzle-orm','prisma','supabase','serverless','vercel-ai-sdk',
  'langchain-js','rag','llm-streaming','function-calling','prompt-engineering',
  'ai-sdk-rsc','embeddings',
];

function hashDate(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function kstDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);
}

function resolveKeyword() {
  if (KEYWORD_ARG) return KEYWORD_ARG;
  const dateStr = kstDate(1);
  try {
    const schedule = JSON.parse(readFileSync('public/data/keyword-schedule.json', 'utf8'));
    if (schedule[dateStr]) return schedule[dateStr];
  } catch {}
  return KEYWORDS[hashDate(dateStr) % KEYWORDS.length];
}

async function fetchHN(keyword) {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=points>30&hitsPerPage=5`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.hits ?? [])
    .filter(h => h.title && (h.url || h.story_url))
    .slice(0, 3)
    .map(h => ({
      title: h.title,
      url: h.url || h.story_url,
      source: 'hn',
      lang: 'en',
      points: h.points,
      published_at: h.created_at?.slice(0, 10) ?? null,
      collected_at: kstDate(),
    }));
}

async function fetchVelog(keyword) {
  const query = `query SearchPosts($keyword: String!) {
    searchPosts(keyword: $keyword) {
      posts { id title url_slug user { username } released_at likes }
    }
  }`;
  try {
    const res = await fetch('https://v2.velog.io/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { keyword } }),
    });
    const data = await res.json();
    if (data.errors) console.error('[velog] GraphQL 오류:', JSON.stringify(data.errors));
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 2);
    return (data?.data?.searchPosts?.posts ?? [])
      .filter(p => new Date(p.released_at) >= cutoff)
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      .slice(0, 3)
      .map(p => ({
      title: p.title,
      url: `https://velog.io/@${p.user.username}/${p.url_slug}`,
      source: 'velog',
      lang: 'ko',
      published_at: p.released_at?.slice(0, 10) ?? null,
      collected_at: kstDate(),
    }));
  } catch (e) {
    console.error('[velog] 수집 실패:', e.message);
    return [];
  }
}

async function fetchGeekNews(keyword) {
  try {
    const res = await fetch(`https://news.hada.io/search?q=${encodeURIComponent(keyword)}`);
    const html = await res.text();
    const matches = [...html.matchAll(/href="(\/topic\?id=\d+)"[^>]*>\s*<[^>]+>\s*([^<]{5,})/g)];
    return matches.slice(0, 3).map(m => ({
      title: m[2].trim(),
      url: `https://news.hada.io${m[1]}`,
      source: 'gn',
      lang: 'ko',
      collected_at: kstDate(),
    })).filter(a => a.title);
  } catch (e) {
    console.error('[GeekNews] 수집 실패:', e.message);
    return [];
  }
}

async function fetchArticleContent(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevPick/1.0)' },
    });
    if (!res.ok) return '';
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
  } catch {
    return '';
  }
}

async function analyzeArticle(article, keyword) {
  const content = await fetchArticleContent(article.url);
  const contentSection = content ? `\n글 본문 (일부):\n${content}` : '';
  if (content) console.log(`[본문] 수집 성공: ${article.title.slice(0, 40)}`);

  const prompt = `다음 글을 읽을 프론트엔드 주니어 개발자를 위해 아래 정보를 생성해주세요.

글 제목: "${article.title}"${contentSection}
메인 키워드: ${keyword}

다음 JSON 형식으로만 응답하세요 (설명 없이):
{
  "minutes": 5,
  "one_liner": "이 글을 한 문장으로 표현 (한국어, 40자 이내)",
  "summary": "글의 핵심 내용을 2~3문장으로 요약 (한국어)",
  "prereqs": [{ "name": "개념명", "detail": "이 개념이 왜 필요한지 한 줄 설명 (한국어)" }],
  "related_concepts": [{ "keyword": "개념명", "reason": "함께 알아야 하는 이유 (한국어, 40자 이내)" }]
}

규칙:
- minutes: 예상 읽기 시간 (분 단위 정수)
- one_liner: 40자 이내 한국어
- summary: 2~3문장 150자 이내 한국어
- prereqs: 사전 지식 2~3개 (name: 개념명, detail: 30자 이내)
- related_concepts: 연관 개념 3~5개 (keyword: 영어 소문자·하이픈, reason: 40자 이내, ${keyword} 자체 제외)`;

  if (!ANTHROPIC_API_KEY) {
    console.error('[Anthropic] ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.');
    return {};
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: '{' },
        ],
      }),
    });
    const data = await res.json();
    if (data.error) {
      console.error(`[Anthropic] API 오류 (${article.title}):`, JSON.stringify(data.error));
      return {};
    }
    const text = data.content?.[0]?.text ?? '';
    const raw = ('{' + text).replace(/^```(?:json)?\n?/,'').replace(/\n?```$/,'').trim();
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[Anthropic] 요청 실패 (${article.title}):`, e.message);
    return {};
  }
}

async function main() {
  const keyword = resolveKeyword();
  console.log(`키워드: ${keyword}`);

  const [hn, velog, gn] = await Promise.all([
    fetchHN(keyword),
    fetchVelog(keyword),
    fetchGeekNews(keyword),
  ]);
  const articles = [...hn, ...gn, ...velog];
  console.log(`수집: HN ${hn.length}개, GeekNews ${gn.length}개, velog ${velog.length}개`);

  const enriched = [];
  for (const article of articles) {
    const r = await analyzeArticle(article, keyword);
    enriched.push({
      ...article,
      minutes: r.minutes ?? null,
      one_liner: r.one_liner ?? null,
      summary: r.summary ?? null,
      prereqs: r.prereqs ?? [],
      related_concepts: r.related_concepts ?? [],
    });
  }

  const dataPath = 'public/data/keywords-data.json';
  let existing = {};
  try { existing = JSON.parse(readFileSync(dataPath, 'utf8')); } catch {}
  existing.generated_at = kstDate();
  existing.keywords = existing.keywords ?? {};
  existing.keywords[keyword] = { articles: enriched };
  writeFileSync(dataPath, JSON.stringify(existing, null, 2));
  console.log(`완료: ${enriched.length}개 저장 → ${dataPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
