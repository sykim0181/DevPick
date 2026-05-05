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
| 자동화     | GitHub Actions + Claude Code Agents |

## 프로젝트 구조

```
devpick/
├── public/data/        # 자동 수집된 JSON 데이터 (키워드·트렌딩·스케줄)
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── store/
├── .claude/agents/     # Claude Code 자동화 에이전트 정의
└── .github/workflows/  # GitHub Actions 워크플로우
```

## 자동화 파이프라인

세 가지 GitHub Actions 워크플로우가 데이터를 자동으로 최신 상태로 유지합니다.

| 워크플로우             | 실행 시각 (KST)   | 역할                                                |
| ---------------------- | ----------------- | --------------------------------------------------- |
| `keyword-schedule.yml` | 매주 일요일 21:00 | Claude API로 다음 주 7일치 키워드 선정              |
| `collect.yml`          | 매일 23:00        | 다음날 키워드로 HN·GeekNews·velog 글 수집 + AI 분석 |
| `trending.yml`         | 매일 10:00        | HN·dev.to 24시간 인기글 수집 + AI 분석              |

각 워크플로우는 Claude Code 에이전트(`.claude/agents/`)를 실행해 데이터를 수집하고 `public/data/`의 JSON 파일을 업데이트한 뒤 자동으로 커밋합니다.
