@echo off
chcp 65001 >nul
title ABYSS DOMINION - FIRST SETUP
cd /d "%~dp0"
echo.
echo  ==============================================
echo   ABYSS DOMINION ONLINE - 初回セットアップ
echo  ==============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [エラー] Node.js が見つかりません。
  echo https://nodejs.org/ から LTS 版をインストール後、もう一度実行してください。
  echo.
  pause
  exit /b 1
)
echo Node.js:
node --version
echo.
echo サーバーに必要な部品をインストールします...
call npm ci --omit=dev
if errorlevel 1 (
  echo.
  echo [失敗] インターネット接続を確認して、もう一度実行してください。
  pause
  exit /b 1
)
echo.
echo [完了] 次回から 04_START_ONLINE.bat だけで起動できます。
pause
