# DevPick

주니어 프론트엔드 개발자를 위한 기술 뉴스 큐레이션 서비스.
매일 하나의 키워드와 관련 아티클을 HN·GeekNews·velog·dev.to에서 자동 수집해 제공합니다.

## 주요 기능

- **오늘의 키워드** — 매일 선정된 기술 키워드와 관련 아티클 (한국어·영어 필터)
- **트렌딩** — 지난 24시간 HN·dev.to 인기글을 카테고리별로 탐색
- **글 상세 모달** — 요약, 사전 지식, 연관 개념을 Claude AI가 생성
- **다크 모드** / 반응형 레이아웃

## 기술 스택

| 영역       | 기술                                |
| ---------- | ----------------------------------- |
| 프레임워크 | React 19 + TypeScript               |
| 빌드       | Vite 8                              |
| 스타일     | Tailwind CSS v4                     |
| 라우팅     | React Router v7                     |
| 상태 관리  | Zustand                             |
| 자동화     | Windows Task Scheduler + Claude Code Agents |

## 프로젝트 구조

```
devpick/
├── public/data/        # 자동 수집된 JSON 데이터 (키워드·트렌딩·스케줄)
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── store/
├── .claude/
│   ├── agents/         # Claude Code 자동화 에이전트 정의
│   └── skills/         # Claude Code 슬래시 커맨드 정의
├── scripts/            # Task Scheduler 실행 스크립트 (PowerShell)
└── .github/workflows/  # GitHub Actions 워크플로우 (수동 실행용 백업)
```

## 자동화 파이프라인

Windows Task Scheduler가 PowerShell 스크립트를 실행하고, 스크립트가 Claude Code 에이전트를 호출해 데이터를 수집합니다.

| 작업                  | 실행 시각 (KST)   | 역할                                                |
| --------------------- | ----------------- | --------------------------------------------------- |
| `DevPick-Schedule`    | 매주 일요일 12:00 | 다음 주 7일치 키워드 선정 → `keyword-schedule.json` |
| `DevPick-Collect`     | 매일 21:00        | 다음날 키워드로 HN·GeekNews·velog 글 수집 + AI 분석 |
| `DevPick-Trending`    | 매일 21:00        | HN·dev.to 24시간 인기글 수집 + AI 분석              |

각 에이전트(`.claude/agents/`)는 WebFetch·WebSearch로 실제 글 본문을 읽어 Claude AI로 분석하고, `public/data/`의 JSON 파일을 업데이트한 뒤 자동으로 커밋·푸시합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 환경 변수

`.env` 파일을 프로젝트 루트에 생성합니다:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Task Scheduler 등록

PowerShell을 **관리자 권한**으로 실행 후:

```powershell
.\scripts\setup-tasks.ps1
```

## 수동 수집 (Claude Code)

Claude Code에서 슬래시 커맨드로 즉시 실행:

```
/collect [keyword]   # 특정 키워드 기사 수집
/trending            # 트렌딩 기사 수집
/schedule            # 다음 주 키워드 선정
```

GitHub Actions에서 수동 실행도 가능합니다 (`workflow_dispatch`).
