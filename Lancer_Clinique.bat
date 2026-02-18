@echo off
REM Lancer l'application Clinique Desktop (Backend + Frontend)

REM Start Backend in a new window (visible for debugging)
echo Starting Backend...
start "Clinique Backend" cmd /c "cd /d %~dp0\clinique-backend && call start.bat"

REM Wait 3 seconds for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

REM Start Frontend
echo Starting Frontend...
cd /d "%~dp0\frontend"
call npm run electron:dev
