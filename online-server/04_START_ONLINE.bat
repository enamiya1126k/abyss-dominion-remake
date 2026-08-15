@echo off
chcp 65001 >nul
title ABYSS DOMINION - ONLINE STARTER
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :missing_node
where cloudflared >nul 2>nul
if errorlevel 1 goto :missing_cloudflared
if not exist "node_modules\ws" goto :missing_setup
echo ローカルサーバーを別画面で起動します...
start "ABYSS PARTY SERVER" cmd /k "cd /d ""%~dp0"" && call npm start"
timeout /t 3 /nobreak >nul
echo.
echo 外部公開トンネルを起動します。
echo 表示された https://xxxxx.trycloudflare.com をゲームのパーティ画面へ入力してください。
echo この画面とサーバー画面は、遊んでいる間は閉じないでください。
echo.
cloudflared tunnel --url http://127.0.0.1:8787
goto :end
:missing_node
echo Node.js がありません。Node.js LTS をインストールしてください。
goto :error
:missing_cloudflared
echo cloudflared がありません。Cloudflare公式からインストールしてください。
goto :error
:missing_setup
echo 初回セットアップが未完了です。01_FIRST_SETUP.bat を実行してください。
:error
echo.
pause
exit /b 1
:end
echo.
echo オンライン公開を終了しました。
pause
