# 게임 자료를 PC 의 D 드라이브에 받는다 (docs/auto.md 3장 7번).
#
# 목록은 tools/game/assets.json 이다. 클라우드에서 fetch_assets.py 가 받으면서 적은 주소와 해시다.
# 같은 주소에서 받고 해시가 같은지 본다. 다르면 그 파일을 실패로 적고 다음으로 간다.
#
# PC 를 같이 쓴다. C:\SeochoOps\pc_busy.lock 이 있으면 아무것도 안 하고 끝낸다.
#
# 사용법 (PowerShell):
#     powershell -ExecutionPolicy Bypass -File tools\game\fetch_assets.ps1
#     powershell -ExecutionPolicy Bypass -File tools\game\fetch_assets.ps1 -Dest D:\HonoluluGame\assets

param(
    [string]$Dest = "D:\HonoluluGame\assets",
    [string]$List = (Join-Path $PSScriptRoot "assets.json")
)

if (Test-Path "C:\SeochoOps\pc_busy.lock") {
    Write-Host "[멈춤] C:\SeochoOps\pc_busy.lock 이 있다. PC 를 다른 일이 쓰고 있다"
    exit 2
}

# Windows PowerShell 5.1 은 진행 표시를 그리느라 받기가 수십 배 느려진다 (2026-10-08 PC 에서 확인)
$ProgressPreference = 'SilentlyContinue'
$L = Get-Content -Raw -Encoding UTF8 $List | ConvertFrom-Json
$ok = 0; $skip = 0; $bad = @()
foreach ($x in $L.items) {
    $to = Join-Path $Dest ($x.file -replace "/", "\")
    New-Item -ItemType Directory -Force -Path (Split-Path $to) | Out-Null
    if (Test-Path $to) {
        if ((Get-FileHash -Algorithm SHA256 $to).Hash.ToLower() -eq $x.sha256) { $skip++; continue }
    }
    $got = $false
    $err = ""
    foreach ($try in 1..3) {
        try {
            Invoke-WebRequest -Uri $x.url -OutFile $to -UseBasicParsing -TimeoutSec 600 -UserAgent "study64-game-fetch/1.0 (public-domain and CC0 asset mirror for a private game)"
            $got = $true; break
        } catch { $err = $_.Exception.Message; Start-Sleep -Seconds (4 * $try) }
    }
    if (-not $got) { $bad += "$($x.file) : $err"; continue }
    if ((Get-FileHash -Algorithm SHA256 $to).Hash.ToLower() -ne $x.sha256) {
        $bad += "$($x.file) : 해시가 다르다. 출처가 파일을 바꿨다"
        continue
    }
    $ok++
    Write-Host ("  {0,-10} {1}" -f $x.source, $x.file)
}

# 출처와 권리를 같이 둔다. CC BY 는 출처를 적어야 한다
$L.items | Select-Object source, file, license, page | Export-Csv -Encoding UTF8 -NoTypeInformation (Join-Path $Dest "CREDITS.csv")

foreach ($b in $bad) { Write-Host "[실패] $b" }
Write-Host ("받음 {0} / 이미 있음 {1} / 실패 {2} / {3}" -f $ok, $skip, $bad.Count, $Dest)
if ($bad.Count) { exit 1 }
