@echo off
chcp 65001 >nul
title ABYSS DOMINION - PARTY SERVER
cd /d "%~dp0"
if not exist "node_modules\ws" (
  echo 初回セットアップが未完了です。先に 01_FIRST_SETUP.bat を実行してください。
  pause
  exit /b 1
)
echo この黒い画面はオンライン中ずっと閉じないでください。
echo.
call npm start
echo.
echo サーバーが停止しました。
pause
