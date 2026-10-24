@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS em https://nodejs.org e tente novamente.
  pause
  exit /b 1
)
node iniciar.cjs
if errorlevel 1 pause
