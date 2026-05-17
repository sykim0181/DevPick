---
name: collect
description: 특정 키워드(또는 내일의 키워드)로 HN·GeekNews·velog 기사를 수집하고 keywords-data.json을 업데이트합니다.
---

article-collector 에이전트를 실행합니다.

인자가 있으면 해당 키워드로, 없으면 내일의 키워드로 수집합니다.

- `/collect` → 내일 키워드 자동 선택 ("collect tomorrow")
- `/collect vitest` → vitest 키워드로 수집

$ARGUMENTS가 비어있으면 "collect tomorrow", 있으면 "keyword: $ARGUMENTS" 를 에이전트에 전달합니다.
