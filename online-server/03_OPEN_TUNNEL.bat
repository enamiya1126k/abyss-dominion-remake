@echo off
chcp 65001 >nul
title ABYSS DOMINION - CLOUDFLARE TUNNEL
cd /d "%~dp0"
where cloudflared >nul 2>nul
if errorlevel 1 (
  echo [エラー] cloudflared が見つかりません。
  echo https://developers.cloudflare.com/tunnel/downloads/ の Windows 版をインストールしてください。
  echo.
  pause
  exit /b 1
)
echo このあと表示される https://xxxxx.trycloudflare.com をゲームへ入力します。
echo この黒い画面はオンライン中ずっと閉じないでください。
echo.
cloudflared tunnel --url http://127.0.0.1:8787
echo.
echo トンネルが停止しました。
pause
