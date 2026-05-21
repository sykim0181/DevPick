import { readFileSync, writeFileSync } from 'fs';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function kstDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

async function fetchHN() {
  const since = Math.floor(Date.now() / 1000) - 86400;
  const url = `https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${since},points>50&hitsPerPage=20`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.hits ?? [])
    .filter(h => h.title && (h.url || h.story_url))
    .map(h => ({
      title: h.title,
      url: h.url || h.story_url,
      source: 'hn',
      points: h.points,
      comments: h.num_comments,
      published_at: h.created_at?.slice(0, 10) ?? null,
      collected_at: kstDate(),
    }));
}

async function fetchDevTo() {
  const res = await fetch('https://dev.to/api/articles?top=7&per_page=10');
  const data = await res.json();
  return (data ?? []).map(a => ({
    title: a.title,
    url: a.url,
    source: 'devto',
    positive_reactions: a.positive_reactions_count,
    comments: a.comments_count,
    reading_time_minutes: a.reading_time_minutes,
    published_at: a.published_at?.slice(0, 10) ?? null,
    collected_at: kstDate(),
  }));
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

async function analyzeArticle(article) {
  const content = await fetchArticleContent(article.url);
  const contentSection = content ? `\n글 본문 (일부):\n${content}` : '';
  if (content) console.log(`[본문] 수집 성공: ${article.title.slice(0, 40)}`);

  const prompt = `다음 글을 읽을 주니어 개발자를 위해 아래 정보를 생성해주세요.
글 제목: "${article.title}"${contentSection}

다음 JSON 형식으로만 응답하세요 (설명 없이):
{
  "is_dev_related": true,
  "category": "frontend",
  "lang": "en",
  "minutes": 5,
  "one_liner": "이 글을 한 문장으로 표현 (한국어, 40자 이내)",
  "summary": "글의 핵심 내용을 2~3문장으로 요약 (한국어)",
  "prereqs": [{ "name": "개념명", "detail": "이 개념이 왜 필요한지 한 줄 설명 (한국어)" }],
  "related_concepts": [{ "keyword": "개념명", "reason": "함께 알아야 하는 이유 (한국어, 40자 이내)" }]
}

규칙:
- is_dev_related: 소프트웨어 개발·프로그래밍·기술 인프라와 직접 관련된 글이면 true, 그 외(정치·사회·건강·스포츠 등)면 false
- category: frontend | backend | ai | devops | cs | other
- lang: 글이 작성된 언어 (en 또는 ko)
- minutes: 예상 읽기 시간 (분 단위 정수)
- one_liner: 40자 이내 한국어 (is_dev_related가 false면 빈 문자열)
- summary: 2~3문장 150자 이내 한국어 (is_dev_related가 false면 빈 문자열)
- prereqs: 사전 지식 2~3개 (is_dev_related가 false면 빈 배열)
- related_concepts: 연관 개념 3~5개 (keyword: 영어 소문자·하이픈, is_dev_related가 false면 빈 배열)`;

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
  const [hn, devto] = await Promise.all([fetchHN(), fetchDevTo()]);
  console.log(`수집: HN ${hn.length}개, dev.to ${devto.length}개`);

  const seen = new Set();
  const articles = [...hn, ...devto].filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  const enriched = [];
  for (const article of articles) {
    const r = await analyzeArticle(article);
    if (r.is_dev_related === false) {
      console.log(`[필터] 개발 무관 글 제외: ${article.title}`);
      continue;
    }
    enriched.push({
      ...article,
      category: r.category ?? 'other',
      lang: r.lang ?? 'en',
      minutes: r.minutes ?? null,
      one_liner: r.one_liner ?? null,
      summary: r.summary ?? null,
      prereqs: r.prereqs ?? [],
      related_concepts: r.related_concepts ?? [],
    });
  }

  enriched.sort((a, b) => (b.points ?? b.positive_reactions ?? 0) - (a.points ?? a.positive_reactions ?? 0));

  const dataPath = 'public/data/trending-data.json';
  let existing = {};
  try { existing = JSON.parse(readFileSync(dataPath, 'utf8')); } catch {}

  // 기존 파일이 구 포맷({articles:[...]})이면 초기화
  if (Array.isArray(existing.articles)) existing = {};

  const today = kstDate();
  existing[today] = enriched.slice(0, 30);

  // 7일 초과 항목 삭제
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  for (const key of Object.keys(existing)) {
    if (new Date(key) < cutoff) delete existing[key];
  }

  writeFileSync(dataPath, JSON.stringify(existing, null, 2));
  console.log(`완료: ${enriched.slice(0, 30).length}개 저장 → ${dataPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
