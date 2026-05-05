const fs = require('fs');

const today = '2026-04-30';
const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

const tsToDate = t => new Date(t * 1000).toISOString().slice(0, 10);

const hn = [
  { title: 'Zed 1.0', url: 'https://zed.dev/blog/zed-1-0', points: 1845, comments: 590, created_at_i: 1777473259, category: 'other' },
  { title: 'HERMES.md in commit messages causes requests to route to extra usage billing', url: 'https://github.com/anthropics/claude-code/issues/53262', points: 1128, comments: 477, created_at_i: 1777488871, category: 'ai' },
  { title: 'Copy Fail', url: 'https://copy.fail/', points: 965, comments: 357, created_at_i: 1777486433, category: 'frontend' },
  { title: 'Cursor Camp', url: 'https://neal.fun/cursor-camp/', points: 937, comments: 150, created_at_i: 1777477183, category: 'other' },
  { title: 'Online age verification is the hill to die on', url: 'https://x.com/GlennMeder/status/2049088498163216560', points: 885, comments: 595, created_at_i: 1777477797, category: 'other' },
  { title: 'Where the goblins came from', url: 'https://openai.com/index/where-the-goblins-came-from/', points: 586, comments: 327, created_at_i: 1777519264, category: 'ai' },
  { title: 'We need a federation of forges', url: 'https://blog.tangled.org/federation/', points: 570, comments: 361, created_at_i: 1777471259, category: 'devops' },
  { title: 'Mistral Medium 3.5', url: 'https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5', points: 465, comments: 215, created_at_i: 1777475866, category: 'ai' },
  { title: 'HashiCorp co-founder says GitHub no longer a place for serious work', url: 'https://www.theregister.com/2026/04/29/mitchell_hashimoto_ghostty_quitting_github/', points: 401, comments: 227, created_at_i: 1777462966, category: 'devops' },
  { title: 'FastCGI: 30 years old and still the better protocol for reverse proxies', url: 'https://www.agwa.name/blog/post/fastcgi_is_the_better_protocol_for_reverse_proxies', points: 335, comments: 78, created_at_i: 1777479399, category: 'backend' },
  { title: 'Kyoto cherry blossoms now bloom earlier than at any point in 1,200 years', url: 'https://jivx.com/kyoto-bloom', points: 328, comments: 93, created_at_i: 1777491156, category: 'other' },
  { title: 'Maryland becomes first state to ban surveillance pricing in grocery stores', url: 'https://www.theguardian.com/technology/2026/apr/29/maryland-grocery-stores-ban-surveillance-pricing', points: 296, comments: 190, created_at_i: 1777481401, category: 'other' },
  { title: 'Why AI companies want you to be afraid of them', url: 'https://www.bbc.com/future/article/20260428-ai-companies-want-you-to-be-afraid-of-them', points: 276, comments: 213, created_at_i: 1777476361, category: 'ai' },
  { title: "The Zig project's rationale for their anti-AI contribution policy", url: 'https://simonwillison.net/2026/Apr/30/zig-anti-ai/', points: 271, comments: 113, created_at_i: 1777515347, category: 'cs' },
  { title: 'OpenTrafficMap', url: 'https://opentrafficmap.org/', points: 266, comments: 62, created_at_i: 1777492170, category: 'other' },
  { title: 'Laws of UX', url: 'https://lawsofux.com/', points: 266, comments: 39, created_at_i: 1777481893, category: 'frontend' },
  { title: 'An open-source stethoscope that costs between $2.5 and $5 to produce', url: 'https://github.com/GliaX/Stethoscope', points: 253, comments: 109, created_at_i: 1777474051, category: 'other' },
  { title: "Third editor fired in Elsevier's citation cartel crackdown", url: 'https://www.chrisbrunet.com/p/third-editor-fired-in-elseviers-citation', points: 253, comments: 78, created_at_i: 1777477525, category: 'other' },
  { title: "He asked AI to count carbs 27000 times. It couldn't give the same answer twice", url: 'https://www.diabettech.com/i-asked-ai-to-count-my-carbs-27000-times-it-couldnt-give-me-the-same-answer-twice/', points: 238, comments: 297, created_at_i: 1777466330, category: 'ai' },
  { title: 'Craig Venter has died', url: 'https://www.jcvi.org/media-center/j-craig-venter-genomics-pioneer-and-founder-jcvi-and-diploid-genomics-inc-dies-79', points: 231, comments: 41, created_at_i: 1777513496, category: 'other' }
];

const devto = [
  { title: '15 Essential Sections Every README Needs: Give Your Project What It Deserves', url: 'https://dev.to/georgekobaidze/15-essential-sections-every-readme-needs-give-your-project-what-it-deserves-fie', positive_reactions: 115, comments: 68, reading_time_minutes: 11, published_at: '2026-04-26', category: 'other' },
  { title: 'What was your win this week!?', url: 'https://dev.to/devteam/what-was-your-win-this-week-8ep', positive_reactions: 58, comments: 114, reading_time_minutes: 1, published_at: '2026-04-24', category: 'other' },
  { title: 'I Used to Love Coding. Now I Just Prompt.', url: 'https://dev.to/harsh2644/i-used-to-love-coding-now-i-just-prompt-550l', positive_reactions: 113, comments: 77, reading_time_minutes: 5, published_at: '2026-04-24', category: 'ai' },
  { title: 'So, what am I doing after 22 years in tech?', url: 'https://dev.to/phalkmin/so-what-am-i-doing-after-22-years-in-tech-7ic', positive_reactions: 47, comments: 14, reading_time_minutes: 7, published_at: '2026-04-23', category: 'other' },
  { title: 'Fine-Tuning Gemma 4 with Cloud Run Jobs: Serverless GPUs (NVIDIA RTX 6000 Pro) for pet breed classification', url: 'https://dev.to/googleai/fine-tuning-gemma-4-with-cloud-run-jobs-serverless-gpus-nvidia-rtx-6000-pro-for-pet-breed-45ib', positive_reactions: 50, comments: 4, reading_time_minutes: 9, published_at: '2026-04-28', category: 'ai' },
  { title: 'How I used Gemini CLI to orchestrate a complex RAG migration', url: 'https://dev.to/googleai/how-i-used-gemini-cli-to-orchestrate-a-complex-rag-migration-43ga', positive_reactions: 41, comments: 2, reading_time_minutes: 6, published_at: '2026-04-28', category: 'ai' },
  { title: 'Congrats to the April Fools Challenge Winners!!', url: 'https://dev.to/devteam/congrats-to-the-april-fools-challenge-winners-l8f', positive_reactions: 48, comments: 14, reading_time_minutes: 2, published_at: '2026-04-23', category: 'other' },
  { title: 'What It Actually Feels Like to Build Something You Are Proud Of', url: 'https://dev.to/_boweii/what-it-actually-feels-like-to-build-something-youre-proud-of-35mi', positive_reactions: 33, comments: 20, reading_time_minutes: 6, published_at: '2026-04-27', category: 'other' },
  { title: 'Monthly Dev Report: April 2026', url: 'https://dev.to/francistrdev/monthly-dev-report-april-2026-nak', positive_reactions: 46, comments: 8, reading_time_minutes: 3, published_at: '2026-04-28', category: 'other' },
  { title: 'Are We Using AI at the Wrong Scale?', url: 'https://dev.to/kernelpryanic/are-we-using-ai-at-the-wrong-scale-2klo', positive_reactions: 54, comments: 12, reading_time_minutes: 5, published_at: '2026-04-28', category: 'ai' }
];

const hnArticles = hn.map(a => ({
  title: a.title,
  url: a.url,
  source: 'hn',
  points: a.points,
  comments: a.comments,
  category: a.category,
  published_at: tsToDate(a.created_at_i),
  collected_at: today
}));

const devtoArticles = devto.map(a => ({
  title: a.title,
  url: a.url,
  source: 'devto',
  positive_reactions: a.positive_reactions,
  comments: a.comments,
  reading_time_minutes: a.reading_time_minutes,
  category: a.category,
  published_at: a.published_at,
  collected_at: today
}));

const all = [...hnArticles, ...devtoArticles];
const seen = new Set();
const deduped = all.filter(a => {
  if (seen.has(a.url)) return false;
  seen.add(a.url);
  return true;
});

const sorted = deduped.sort((a, b) => {
  const aScore = a.points || a.positive_reactions || 0;
  const bScore = b.points || b.positive_reactions || 0;
  return bScore - aScore;
}).slice(0, 30);

const output = {
  generated_at: now,
  period: '24h',
  articles: sorted
};

const outPath = 'D:/project/devpick/public/data/trending-data.json';
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log('Written to: ' + outPath);
console.log('Total articles: ' + sorted.length);
console.log('HN: ' + sorted.filter(a => a.source === 'hn').length);
console.log('devto: ' + sorted.filter(a => a.source === 'devto').length);
