# 키워드 기사 + 트렌딩 통합 수집 스크립트
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# .env 파일에서 환경 변수 로드
$EnvFile = Join-Path $ProjectRoot ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^=#][^=]*)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
        }
    }
} else {
    Write-Error ".env 파일을 찾을 수 없습니다: $EnvFile"
    exit 1
}

# 로그 디렉토리 생성
$LogDir = Join-Path $ProjectRoot "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir "collect-$(Get-Date -Format 'yyyy-MM-dd').log"

Write-Output "[$(Get-Date -Format 'HH:mm:ss')] 통합 수집 시작" | Tee-Object -FilePath $LogFile -Append

# 1단계: 키워드 기사 수집
Write-Output "[$(Get-Date -Format 'HH:mm:ss')] [1/2] 키워드 기사 수집 시작" | Tee-Object -FilePath $LogFile -Append
claude --dangerously-skip-permissions -p "collect tomorrow" --agent article-collector 2>&1 | Tee-Object -FilePath $LogFile -Append
if ($LASTEXITCODE -ne 0) {
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] [1/2] 키워드 수집 실패 (exit $LASTEXITCODE)" | Tee-Object -FilePath $LogFile -Append
} else {
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] [1/2] 키워드 기사 수집 완료" | Tee-Object -FilePath $LogFile -Append
}

# 2단계: 트렌딩 수집
Write-Output "[$(Get-Date -Format 'HH:mm:ss')] [2/2] 트렌딩 수집 시작" | Tee-Object -FilePath $LogFile -Append
claude --dangerously-skip-permissions -p "collect trending" --agent trending-collector 2>&1 | Tee-Object -FilePath $LogFile -Append
if ($LASTEXITCODE -ne 0) {
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] [2/2] 트렌딩 수집 실패 (exit $LASTEXITCODE)" | Tee-Object -FilePath $LogFile -Append
} else {
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] [2/2] 트렌딩 수집 완료" | Tee-Object -FilePath $LogFile -Append
}

Write-Output "[$(Get-Date -Format 'HH:mm:ss')] 통합 수집 종료" | Tee-Object -FilePath $LogFile -Append
