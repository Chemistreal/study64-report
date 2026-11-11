# Yeobaek PC audio maker - setup (Windows PowerShell)
#   irm https://chemistreal.github.io/study64-report/reader/pc-tool/setup.ps1 | iex
# Installs Node.js LTS if missing (winget), downloads the Yeobaek engine files to %USERPROFILE%\yeobaek-pc,
# and installs onnxruntime-node (CPU + DirectML GPU on Windows). Nothing else on the PC is changed.
$ErrorActionPreference = 'Stop'
$base = 'https://chemistreal.github.io/study64-report/reader'
$dir  = Join-Path $HOME 'yeobaek-pc'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'Installing Node.js LTS (winget)...'
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
}
$files = 'index.html','ai-auto.js','supertonic-helper.js','vendor/lame.min.js','vendor/LAMEJS-LICENSE.txt','vendor/jszip.min.js','vendor/JSZIP-LICENSE.txt','pc-tool/make-audio.mjs','pc-tool/package.json'
foreach ($f in $files) {
  $target = Join-Path $dir $f
  New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
  Invoke-WebRequest -UseBasicParsing -Uri "$base/$f" -OutFile $target
}
Push-Location (Join-Path $dir 'pc-tool')
npm install --no-audit --no-fund
Pop-Location
Write-Host ''
Write-Host "Ready: $dir\pc-tool"
Write-Host 'Run:   cd $HOME\yeobaek-pc\pc-tool ; node make-audio.mjs <folder-or-zip> --voice M1'
