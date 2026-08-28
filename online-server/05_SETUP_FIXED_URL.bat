@echo off
setlocal EnableExtensions DisableDelayedExpansion
title ABYSS DOMINION - FIXED URL SETUP
cd /d "%~dp0"

echo ABYSS DOMINION fixed server URL setup
echo =======================================
echo This setup uses the free ngrok dev domain assigned to your account.
echo Your authtoken is saved only in ngrok's config on this PC.
echo It is never written into this game folder.
echo.

where ngrok >nul 2>nul
if errorlevel 1 goto :missing_ngrok

echo 1. Open the ngrok authtoken page and copy your authtoken.
start "" "https://dashboard.ngrok.com/get-started/your-authtoken"
set "NGROK_AUTHTOKEN="
set /p "NGROK_AUTHTOKEN=Paste the ngrok authtoken here: "
if not defined NGROK_AUTHTOKEN goto :missing_token
ngrok config add-authtoken "%NGROK_AUTHTOKEN%"
if errorlevel 1 goto :token_failed
set "NGROK_AUTHTOKEN="

echo.
echo 2. Open the Domains page and copy the assigned dev domain.
echo    Example: your-name.ngrok-free.app
start "" "https://dashboard.ngrok.com/domains"
set "FIXED_DOMAIN="
set /p "FIXED_DOMAIN=Paste the domain only, without https:// or a trailing slash: "
if not defined FIXED_DOMAIN goto :missing_domain
set "FIXED_DOMAIN=%FIXED_DOMAIN:https://=%"
set "FIXED_DOMAIN=%FIXED_DOMAIN:http://=%"
if "%FIXED_DOMAIN:~-1%"=="/" set "FIXED_DOMAIN=%FIXED_DOMAIN:~0,-1%"
set "ABYSS_FIXED_DOMAIN_INPUT=%FIXED_DOMAIN%"
powershell -NoProfile -Command "$d=$env:ABYSS_FIXED_DOMAIN_INPUT; if($d -match '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'){exit 0}else{exit 1}" >nul 2>nul
if errorlevel 1 goto :invalid_domain
>"fixed-tunnel-domain.txt" echo(%FIXED_DOMAIN%

echo.
echo [DONE] Fixed URL setup is complete.
echo Server URL: https://%FIXED_DOMAIN%
echo.
echo From now on, start online play with 04_START_ONLINE.bat.
echo Enter this URL in the Party screen only once; the game remembers it.
pause
exit /b 0

:missing_ngrok
echo [ERROR] ngrok was not found.
echo Download the Windows agent, place ngrok.exe on PATH, then run this file again.
start "" "https://ngrok.com/download/windows"
goto :error
:missing_token
echo [ERROR] No authtoken was entered. Nothing was saved.
goto :error
:token_failed
set "NGROK_AUTHTOKEN="
echo [ERROR] ngrok could not save the authtoken. Check the token and try again.
goto :error
:missing_domain
echo [ERROR] No domain was entered. No fixed domain file was created.
goto :error
:invalid_domain
echo [ERROR] The domain is invalid. Paste a URL such as https://your-name.ngrok-free.app.
:error
echo.
pause
exit /b 1
