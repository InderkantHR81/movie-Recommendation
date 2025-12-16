@echo off
echo ========================================
echo Movie Recommendation System - Setup
echo ========================================
echo.

echo [1/5] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/5] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/5] Checking Environment Files...
cd ..\backend
if not exist .env (
    echo Creating backend .env file from example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit backend\.env with your configuration:
    echo    - MONGODB_URI (your MongoDB connection string)
    echo    - JWT_SECRET (a strong random secret)
    echo    - OPENAI_API_KEY (your OpenAI API key)
    echo.
) else (
    echo ✓ Backend .env file already exists
)

cd ..\frontend
if not exist .env (
    echo Creating frontend .env file...
    echo VITE_API_URL=http://localhost:5000/api > .env
    echo ✓ Frontend .env file created
) else (
    echo ✓ Frontend .env file already exists
)
echo.

echo [4/5] Setup Complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Configure backend\.env with your settings:
echo    - MongoDB URI (local or Atlas)
echo    - JWT Secret (random string)
echo    - OpenAI API Key
echo.
echo 2. Start MongoDB (if using local):
echo    mongod
echo.
echo 3. Seed the database:
echo    cd backend
echo    node scripts\seedMovies.js
echo.
echo 4. Start the backend (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 5. Start the frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 6. Open browser: http://localhost:3000
echo.
echo ========================================
echo.
pause
