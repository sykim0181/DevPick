import { readFileSync, writeFileSync } from 'fs';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const EVERGREEN_POOL = `
react-compiler, use-transition, use-deferred-value, react-server-components,
server-actions, react-suspense, react-19, concurrent-rendering,
partial-prerendering, nextjs-middleware, nextjs-cache, parallel-routes,
intercepting-routes, nextjs-instrumentation, zustand, jotai, tanstack-query,
tanstack-router, swr, optimistic-updates, typescript-generics, conditional-types,
template-literal-types, zod, type-predicates, satisfies-operator, turborepo,
nx-monorepo, vite-plugins, rspack, esbuild, biome, module-federation, tree-shaking,
view-transitions-api, container-queries, anchor-positioning, speculation-rules,
web-workers, wasm, web-streams, css-layers, has-selector, inp, core-web-vitals,
react-performance, code-splitting, bundle-analysis, edge-runtime, msw, playwright,
vitest, testing-library, visual-regression, contract-testing, trpc,
graphql-subscriptions, rest-vs-graphql, api-design, edge-functions, drizzle-orm,
prisma, supabase, serverless, vercel-ai-sdk, langchain-js, rag, llm-streaming,
function-calling, prompt-engineering, ai-sdk-rsc, embeddings
`.trim();

function kstDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);
}

async function fetchHNTrends() {
  const since = Math.floor(Date.now() / 1000) - 86400 * 3;
  const url = `https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${since},points>50&hitsPerPage=30`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.hits ?? []).map(h => h.title).filter(Boolean);
}

async function fetchDevToTrends() {
  const res = await fetch('https://dev.to/api/articles?top=7&per_page=20');
  const data = await res.json();
  return (data ?? []).map(a => a.title).filter(Boolean);
}

async function selectKeywords(trendTitles, recentKeywords) {
  const prompt = `다음 주 DevPick의 7일치 키워드를 선정해주세요.

DevPick은 주니어~중급 프론트엔드/풀스택 개발자를 위한 기술 뉴스레터입니다.
매일 하나의 기술 키워드와 관련 아티클을 큐레이션합니다.

## Evergreen 키워드 풀 (검증된 중요 기술)
${EVERGREEN_POOL}

## 이번 주 HN·dev.to 트렌드 제목 (새로운 관심사 파악용)
${trendTitles.slice(0, 40).join('\n')}

## 최근 4주 사용 키워드 (제외)
${recentKeywords.join(', ')}

## 선정 기준
1. 균형: 7개 중 4개는 Evergreen 풀에서, 3개는 트렌드에서 영감을 받아 선정
2. 다양성: 같은 카테고리가 3일 이상 연속 나오지 않도록
3. 제외: 최근 4주 사용 키워드는 제외
4. 형식: 영문 소문자·하이픈 (예: react-compiler, view-transitions-api)
5. 실용성: 주니어 개발자가 학습하면 실제 도움이 되는 것 우선

다음 JSON 형식으로만 응답 (설명 없이):
["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"]`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: '[' },
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Anthropic API 오류: ${JSON.stringify(data.error)}`);
  const text = data.content?.[0]?.text ?? '';
  const raw = ('[' + text).replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(raw);
}

async function main() {
  const schedulePath = 'public/data/keyword-schedule.json';
  let existing = {};
  try { existing = JSON.parse(readFileSync(schedulePath, 'utf8')); } catch {}

  // Collect recent 4 weeks of used keywords
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 28);
  const recentKeywords = Object.entries(existing)
    .filter(([date]) => new Date(date) >= cutoff)
    .map(([, kw]) => kw);

  const [hnTitles, devtoTitles] = await Promise.all([fetchHNTrends(), fetchDevToTrends()]);
  const trendTitles = [...hnTitles, ...devtoTitles];
  console.log(`트렌드 수집: HN ${hnTitles.length}개, dev.to ${devtoTitles.length}개`);

  const keywords = await selectKeywords(trendTitles, recentKeywords);
  if (!Array.isArray(keywords) || keywords.length !== 7) {
    throw new Error(`키워드 선정 실패: ${JSON.stringify(keywords)}`);
  }

  // Map keywords to next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => kstDate(i + 1));
  dates.forEach((date, i) => { existing[date] = keywords[i]; });

  // Remove entries older than 90 days
  const cutoff90 = new Date();
  cutoff90.setDate(cutoff90.getDate() - 90);
  for (const date of Object.keys(existing)) {
    if (new Date(date) < cutoff90) delete existing[date];
  }

  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(schedulePath, JSON.stringify(sorted, null, 2));

  console.log(`키워드 스케줄 업데이트 완료`);
  console.log(`기간: ${dates[0]} ~ ${dates[6]}`);
  console.log(`키워드: ${keywords.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
