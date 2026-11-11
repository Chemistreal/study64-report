@echo off
rem Yeobaek studio: double-click to open http://127.0.0.1:7788
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Run setup.ps1 first. & pause & exit /b 1)
node studio.mjs
if errorlevel 1 pause
