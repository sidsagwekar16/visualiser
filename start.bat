@echo off
echo.
echo ========================================
echo  Schema Visualizer - Starting...
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    (
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=development
        echo.
        echo # CORS Configuration
        echo ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    ) > .env
    echo .env file created!
    echo.
)

echo Starting both server and client...
echo.
echo Server will run on: http://localhost:3001
echo Client will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both services
echo.

npm run dev



