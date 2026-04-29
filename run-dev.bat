@echo off
echo Starting JobMagnet Development Environment...

echo.
echo Starting Backend (ASP.NET Core)...
cd Backend
start "Backend" cmd /k "dotnet run"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend (React)...
cd ..\Frontend
start "Frontend" cmd /k "npm start"

echo.
echo Development servers are starting...
echo Backend: https://localhost:7000
echo Frontend: http://localhost:3000
echo.
pause
