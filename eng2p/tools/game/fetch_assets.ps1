# 게임 자료를 PC 의 D 드라이브에 받는다 (docs/auto.md 3장 7번).
#
# 목록은 tools/game/assets.json 이다. 클라우드에서 fetch_assets.py 가 적은 주소와 해시다.
# 같은 주소에서 받고 해시가 같은지 본다. 다르면 그 파일을 실패로 적고 다음으로 간다.
#
# 해시는 두 가지다 (2026-10-09).
#   sha256  항목: 클라우드가 받아서 잰 값. 그대로 맞춘다
#   md5     항목: 받지 않고 출처 API(Poly Haven 모델)가 준 값을 옮긴 것. sha256 칸이 없다.
#           md5 로 맞추고, **맞으면 처음 잰 sha256 을 <Dest>\SHA256_FIRST.json 에 적는다.** 그 뒤로는 그 값이 기준이다
#           (md5 는 짝을 지어낼 수 있어서 한 번 맞춘 뒤에는 sha256 으로 고정한다). 적힌 값과 달라지면 실패로 센다
#   optional: true 인 항목(삼각형이 아주 많은 모델)은 기본으로 안 받는다. -WithOptional 을 주면 받는다
#
# PC 를 같이 쓴다. C:\SeochoOps\pc_busy.lock 이 있으면 아무것도 안 하고 끝낸다.
#
# 사용법 (PowerShell):
#     powershell -ExecutionPolicy Bypass -File tools\game\fetch_assets.ps1
#     powershell -ExecutionPolicy Bypass -File tools\game\fetch_assets.ps1 -Dest D:\HonoluluGame\assets
#     powershell -ExecutionPolicy Bypass -File tools\game\fetch_assets.ps1 -Prefix polyhaven/models/            # 사진 스캔 모델만
#     powershell -ExecutionPolicy Bypass -File tools\game\fetch_assets.ps1 -Prefix polyhaven/models/ -WithOptional
#     powershell -ExecutionPolicy Bypass -File tools\game\fetch_assets.ps1 -Prefix polyhaven/models/ -Plan     # 받지 않고 개수와 크기만

param(
    [string]$Dest = "D:\HonoluluGame\assets",
    [string]$List = (Join-Path $PSScriptRoot "assets.json"),
    [string]$Prefix = "",
    [switch]$WithOptional,
    [switch]$Plan
)

if (Test-Path "C:\SeochoOps\pc_busy.lock") {
    Write-Host "[멈춤] C:\SeochoOps\pc_busy.lock 이 있다. PC 를 다른 일이 쓰고 있다"
    exit 2
}

# Windows PowerShell 5.1 은 진행 표시를 그리느라 받기가 수십 배 느려진다 (2026-10-08 PC 에서 확인)
$ProgressPreference = 'SilentlyContinue'
$L = Get-Content -Raw -Encoding UTF8 $List | ConvertFrom-Json
$Prefix = $Prefix -replace "\\", "/"
$items = @($L.items | Where-Object { $_.file.StartsWith($Prefix) })
$optionalSkipped = @($items | Where-Object { $_.optional -and -not $WithOptional })
$items = @($items | Where-Object { -not ($_.optional -and -not $WithOptional) })

if ($Plan) {
    $bytes = ($items | Measure-Object -Property bytes -Sum).Sum
    $optBytes = ($optionalSkipped | Measure-Object -Property bytes -Sum).Sum
    $md5only = @($items | Where-Object { -not $_.sha256 -and $_.md5 }).Count
    Write-Host ("계획: 받을 것 {0}개 {1:N1} MB (십진 MB, md5 만 있는 것 {2}개) / optional 이라 건너뛸 것 {3}개 {4:N1} MB / 접두사 '{5}'" -f $items.Count, ($bytes / 1000000), $md5only, $optionalSkipped.Count, ($optBytes / 1000000), $Prefix)
    exit 0
}

# 처음 잰 sha256 (md5 만 있는 항목용). 한 번 적으면 그 값이 기준이다
$firstPath = Join-Path $Dest "SHA256_FIRST.json"
$first = @{}
if (Test-Path $firstPath) {
    $o = Get-Content -Raw -Encoding UTF8 $firstPath | ConvertFrom-Json
    foreach ($p in $o.PSObject.Properties) { $first[$p.Name] = $p.Value }
}
$firstNew = 0

function Save-First {
    $ord = [ordered]@{}
    foreach ($k in ($first.Keys | Sort-Object)) { $ord[$k] = $first[$k] }
    New-Item -ItemType Directory -Force -Path (Split-Path $firstPath) | Out-Null
    $json = $ord | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText($firstPath, $json, (New-Object System.Text.UTF8Encoding($false)))
}

# 파일이 목록 항목과 맞는가. 크기(bytes)를 먼저 보고, 해시는 sha256 칸이 있으면 sha256, 없고 md5 가 있으면 md5.
# 돌려주는 것: "" 이면 맞음, 아니면 어긋난 까닭
function Test-Item($path, $x) {
    if ($x.bytes -and ((Get-Item $path).Length -ne [int64]$x.bytes)) { return "크기가 다르다" }
    if ($x.sha256) {
        if ((Get-FileHash -Algorithm SHA256 $path).Hash.ToLower() -ne ([string]$x.sha256).ToLower()) { return "해시가 다르다. 출처가 파일을 바꿨다" }
        return ""
    }
    if ($x.md5) {
        if ((Get-FileHash -Algorithm MD5 $path).Hash.ToLower() -ne ([string]$x.md5).ToLower()) { return "md5 가 다르다. 출처가 파일을 바꿨다" }
        return ""
    }
    return "목록에 sha256 도 md5 도 없다"
}

# md5 만 있는 항목: 맞은 파일의 sha256 을 처음 잰 값과 맞추거나(있으면) 처음 적는다(없으면). 돌려주는 것: "" 이면 됐음, 아니면 까닭
function Test-First($path, $x) {
    if ($x.sha256) { return "" }
    $s = (Get-FileHash -Algorithm SHA256 $path).Hash.ToLower()
    if ($first.ContainsKey($x.file)) {
        if (([string]$first[$x.file].sha256).ToLower() -ne $s) { return "처음 잰 sha256 과 다르다. 받은 뒤에 파일이 바뀌었다" }
        return ""
    }
    $script:first[$x.file] = [pscustomobject]@{ sha256 = $s; md5 = [string]$x.md5; bytes = (Get-Item $path).Length; first = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") }
    $script:firstNew++
    return ""
}

$ok = 0; $skip = 0; $warn = 0; $bad = @()
foreach ($x in $items) {
    $to = Join-Path $Dest ($x.file -replace "/", "\")
    New-Item -ItemType Directory -Force -Path (Split-Path $to) | Out-Null
    if (Test-Path $to) {
        if ((Test-Item $to $x) -eq "") {
            $why = Test-First $to $x
            if ($why -ne "") { $bad += "$($x.file) : $why" } else { $skip++ }
            continue
        }
        if ($x.volatile) { $skip++; continue }
    }
    $got = $false
    $err = ""
    foreach ($try in 1..3) {
        try {
            Invoke-WebRequest -Uri $x.url -OutFile $to -UseBasicParsing -TimeoutSec 600 -UserAgent "study64-game-fetch/1.0 (https://github.com/Chemistreal/game; public-domain and CC0 asset mirror for a private non-commercial game)"
            $got = $true; break
        } catch { $err = $_.Exception.Message; Start-Sleep -Seconds (4 * $try) }
    }
    if (-not $got) { $bad += "$($x.file) : $err"; continue }
    $why = Test-Item $to $x
    if ($why -ne "") {
        # 받을 때마다 조금 다른 파일을 주는 출처(썸네일, OCR 문서)는 목록에 volatile 로 적는다. 경고만 하고 둔다
        if ($x.volatile) {
            Write-Host ("  [경고] {0} : 해시가 다르다. volatile 이라 그대로 둔다" -f $x.file)
            $warn++
            continue
        }
        $bad += "$($x.file) : $why"
        continue
    }
    $why = Test-First $to $x
    if ($why -ne "") { $bad += "$($x.file) : $why"; continue }
    $ok++
    Write-Host ("  {0,-10} {1}" -f $x.source, $x.file)
}
if ($firstNew -gt 0) { Save-First }

# 출처와 권리를 같이 둔다. CC BY 는 출처를 적어야 한다
$L.items | Select-Object source, file, license, page | Export-Csv -Encoding UTF8 -NoTypeInformation (Join-Path $Dest "CREDITS.csv")

foreach ($b in $bad) { Write-Host "[실패] $b" }
if ($optionalSkipped.Count -gt 0) { Write-Host ("optional 이라 건너뜀 {0}개 (-WithOptional 로 받는다)" -f $optionalSkipped.Count) }
if ($firstNew -gt 0) { Write-Host ("처음 잰 sha256 {0}개를 적었다: {1}" -f $firstNew, $firstPath) }
Write-Host ("받음 {0} / 이미 있음 {1} / 경고 {2} / 실패 {3} / {4}" -f $ok, $skip, $warn, $bad.Count, $Dest)
if ($bad.Count) { exit 1 }
