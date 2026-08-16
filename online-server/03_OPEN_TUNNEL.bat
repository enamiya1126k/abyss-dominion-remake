@echo off
title ABYSS DOMINION - CLOUDFLARE TUNNEL
cd /d "%~dp0"
where cloudflared >nul 2>nul
if errorlevel 1 (
  echo [ERROR] cloudflared was not found.
  echo Install the Windows version from https://developers.cloudflare.com/tunnel/downloads/
  echo.
  pause
  exit /b 1
)
echo Copy the https://xxxxx.trycloudflare.com URL into the game.
echo Keep this window open while playing online.
echo.
cloudflared tunnel --url http://127.0.0.1:8787
echo.
echo The tunnel has stopped.
pause
