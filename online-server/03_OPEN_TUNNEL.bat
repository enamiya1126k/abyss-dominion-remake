@echo off
setlocal EnableExtensions DisableDelayedExpansion
title ABYSS DOMINION - CLOUDFLARE TUNNEL
cd /d "%~dp0"
if exist "fixed-tunnel-domain.txt" goto :fixed_tunnel
where cloudflared >nul 2>nul
if errorlevel 1 (
  echo [ERROR] cloudflared was not found.
  echo Install the Windows version from https://developers.cloudflare.com/tunnel/downloads/
  echo.
  pause
  exit /b 1
)
echo Copy the https://xxxxx.trycloudflare.com URL into the game.
echo To keep the same URL, run 05_SETUP_FIXED_URL.bat once.
echo Keep this window open while playing online.
echo.
cloudflared tunnel --url http://127.0.0.1:8787
goto :end
:fixed_tunnel
title ABYSS DOMINION - FIXED NGROK TUNNEL
where ngrok >nul 2>nul
if errorlevel 1 (
  echo [ERROR] ngrok was not found.
  echo Run 05_SETUP_FIXED_URL.bat again.
  echo.
  pause
  exit /b 1
)
set "FIXED_DOMAIN="
set /p "FIXED_DOMAIN="<"fixed-tunnel-domain.txt"
if not defined FIXED_DOMAIN goto :invalid_fixed_domain
set "ABYSS_FIXED_DOMAIN_INPUT=%FIXED_DOMAIN%"
powershell -NoProfile -Command "$d=$env:ABYSS_FIXED_DOMAIN_INPUT; if($d -match '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'){exit 0}else{exit 1}" >nul 2>nul
if errorlevel 1 goto :invalid_fixed_domain
echo Fixed server URL: https://%FIXED_DOMAIN%
echo Keep this window open while playing online.
echo.
ngrok http 8787 --url "https://%FIXED_DOMAIN%"
goto :end
:invalid_fixed_domain
echo [ERROR] fixed-tunnel-domain.txt is empty or invalid.
echo Run 05_SETUP_FIXED_URL.bat again.
:end
echo.
echo The tunnel has stopped.
pause
