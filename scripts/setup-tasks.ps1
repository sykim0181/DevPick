# Task Scheduler 등록 스크립트
# PowerShell 관리자 권환으로 실행 필요

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$PwshExe = "powershell.exe"

function Register-Task {
    param($TaskName, $ScriptName, $Trigger)

    $ScriptPath = Join-Path $ProjectRoot "scripts\$ScriptName"
    $Action = New-ScheduledTaskAction `
        -Execute $PwshExe `
        -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$ScriptPath`"" `
        -WorkingDirectory $ProjectRoot

    $Settings = New-ScheduledTaskSettingsSet `
        -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable

    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Output "기존 작업 제거: $TaskName"
    }

    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -RunLevel Highest | Out-Null

    Write-Output "등록 완료: $TaskName"
}

# 매일 21:00 - 키워드 관련 기사 수집 (내일 키워드 미리 수집)
Register-Task `
    -TaskName "DevPick-Keyword" `
    -ScriptName "run-keyword.ps1" `
    -Trigger (New-ScheduledTaskTrigger -Daily -At "21:00")

# 매일 21:00 - 트렌딩 수집
Register-Task `
    -TaskName "DevPick-Trending" `
    -ScriptName "run-trending.ps1" `
    -Trigger (New-ScheduledTaskTrigger -Daily -At "21:00")

# 매주 일요일 12:00 - 키워드 스케줄 갱신
Register-Task `
    -TaskName "DevPick-Schedule" `
    -ScriptName "run-schedule.ps1" `
    -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "12:00")

Write-Output ""
Write-Output "Task Scheduler 등록 완료:"
Write-Output "  DevPick-Collect  → 매일 21:00"
Write-Output "  DevPick-Trending → 매일 21:00"
Write-Output "  DevPick-Schedule → 매주 일요일 12:00"
Write-Output ""
Write-Output "확인: Get-ScheduledTask | Where-Object { `$_.TaskName -like 'DevPick-*' }"
