# 키워드 스케줄 갱신 스크립트
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
$LogFile = Join-Path $LogDir "schedule-$(Get-Date -Format 'yyyy-MM-dd').log"

Write-Output "[$(Get-Date -Format 'HH:mm:ss')] 키워드 스케줄 갱신 시작" | Tee-Object -FilePath $LogFile -Append

claude --dangerously-skip-permissions -p "schedule next week" --agent keyword-scheduler 2>&1 | Tee-Object -FilePath $LogFile -Append

if ($LASTEXITCODE -ne 0) {
    Write-Error "[$(Get-Date -Format 'HH:mm:ss')] 스케줄 갱신 실패 (exit $LASTEXITCODE)"
    exit $LASTEXITCODE
}

Write-Output "[$(Get-Date -Format 'HH:mm:ss')] 키워드 스케줄 갱신 완료" | Tee-Object -FilePath $LogFile -Append
