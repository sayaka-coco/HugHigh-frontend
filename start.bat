@echo off
chcp 65001 > nul
echo Starting HugHigh Frontend...
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

REM Start the development server
echo.
echo =====================================
echo Frontend is starting...
echo URL: http://localhost:3000
echo =====================================
echo.
call npm run dev
