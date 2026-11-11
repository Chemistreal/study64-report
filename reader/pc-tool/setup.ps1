# Yeobaek studio setup (Windows PowerShell)
#   irm https://chemistreal.github.io/study64-report/reader/pc-tool/setup.ps1 | iex
# Installs everything under D:\yeobaek-studio (or %USERPROFILE%\yeobaek-studio when there is no D: drive):
#   app\        studio program files (from the Yeobaek site)
#   tts-env\    Python environment with edge-tts + ffmpeg (Microsoft Edge neural voices, no API key)
#   cache\      pip cache and temporary files
# Node.js, Python 3.12 and GitHub CLI are installed with winget only when missing. Nothing else on the PC is changed.
$ErrorActionPreference = 'Stop'
$base = 'https://chemistreal.github.io/study64-report/reader'
$root = if (Test-Path 'D:\') { 'D:\yeobaek-studio' } else { Join-Path $HOME 'yeobaek-studio' }
if ($env:YEOBAEK_STUDIO_DIR) { $root = $env:YEOBAEK_STUDIO_DIR }
New-Item -ItemType Directory -Force -Path "$root\cache\pip", "$root\cache\tmp", "$root\app" | Out-Null
$env:PIP_CACHE_DIR = "$root\cache\pip"; $env:TMP = "$root\cache\tmp"; $env:TEMP = "$root\cache\tmp"
function Refresh-Path { $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User') }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Host 'Installing Node.js LTS (winget)...'; winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements; Refresh-Path }
if (-not (Get-Command py -ErrorAction SilentlyContinue)) { Write-Host 'Installing Python 3.12 (winget)...'; winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements; Refresh-Path }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Write-Host 'Installing GitHub CLI (winget)...'; winget install -e --id GitHub.cli --accept-package-agreements --accept-source-agreements; Refresh-Path }

# Program files
$files = 'index.html','vendor/jszip.min.js','vendor/JSZIP-LICENSE.txt','pc-tool/package.json','pc-tool/engine.mjs','pc-tool/publish.mjs','pc-tool/studio.mjs','pc-tool/studio.html','pc-tool/make-audio.mjs','pc-tool/edge_book.py','pc-tool/inbox-build.mjs','pc-tool/audio-site/site.yml','pc-tool/studio.cmd'
foreach ($f in $files) {
  $target = Join-Path "$root\app" $f
  New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
  Invoke-WebRequest -UseBasicParsing -Uri "$base/$f" -OutFile $target
}

# Python environment for the voice
$py = "$root\tts-env\Scripts\python.exe"
if (-not (Test-Path $py)) { py -3.12 -m venv "$root\tts-env"; if (-not (Test-Path $py)) { py -3 -m venv "$root\tts-env" } }
& $py -m pip install -q --upgrade pip
& $py -m pip install -q --upgrade edge-tts imageio-ffmpeg
& $py -c "import edge_tts, imageio_ffmpeg; print('edge-tts', edge_tts.__version__, '/ ffmpeg ok')"

Write-Host ''
Write-Host "Ready: $root"
Write-Host "Open the studio: double-click $root\app\pc-tool\studio.cmd   (or: node `"$root\app\pc-tool\studio.mjs`")"
Write-Host 'To publish to the Yeobaek reader, sign in once:  gh auth login'
