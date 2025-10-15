@echo off
REM Complete Email Builder Backend - All-in-One Setup and Start Script

cls
echo ======================================================================
echo        EMAIL BUILDER BACKEND - COMPLETE SETUP ^& START
echo ======================================================================
echo.

REM Step 1: Check Docker
echo [INFO] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Step 2: Check pnpm
echo [INFO] Checking pnpm...
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pnpm is not installed. Installing pnpm...
    call npm install -g pnpm
)
echo [OK] pnpm is available

REM Step 3: Create .env file
echo [INFO] Setting up environment...
if not exist .env (
    copy .env.example .env >nul
    echo [OK] Environment file created
) else (
    echo [OK] Environment file exists
)

REM Step 4: Install dependencies
echo [INFO] Installing dependencies (this may take a moment)...
if not exist node_modules (
    call pnpm install --silent
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

REM Step 5: Start Docker services
echo [INFO] Starting Docker services...
docker-compose down >nul 2>&1
docker-compose up -d
echo [OK] Docker services started

REM Step 6: Wait for PostgreSQL
echo [INFO] Waiting for PostgreSQL to be ready...
set MAX_TRIES=30
set COUNT=0
:wait_postgres
docker exec email-builder-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    set /a COUNT+=1
    if %COUNT% GEQ %MAX_TRIES% (
        echo [ERROR] PostgreSQL failed to start
        pause
        exit /b 1
    )
    timeout /t 1 /nobreak >nul
    goto wait_postgres
)
echo [OK] PostgreSQL is ready

REM Step 7: Wait for LocalStack
echo [INFO] Waiting for LocalStack to be ready...
set COUNT=0
:wait_localstack
curl -f http://localhost:4566/_localstack/health >nul 2>&1
if errorlevel 1 (
    set /a COUNT+=1
    if %COUNT% GEQ %MAX_TRIES% (
        echo [ERROR] LocalStack failed to start
        pause
        exit /b 1
    )
    timeout /t 1 /nobreak >nul
    goto wait_localstack
)
echo [OK] LocalStack is ready

REM Step 8: Verify S3 bucket
timeout /t 3 /nobreak >nul
echo [INFO] Verifying S3 bucket...
aws --endpoint-url=http://localhost:4566 s3 ls s3://email-templates-assets >nul 2>&1
echo [OK] S3 bucket configured

echo.
echo ======================================================================
echo [OK] SETUP COMPLETE - STARTING APPLICATION
echo ======================================================================
echo.
echo Services:
echo   - PostgreSQL:     localhost:5432
echo   - LocalStack S3:  localhost:4566
echo   - Backend API:    http://localhost:3000/api
echo.
echo Starting NestJS application...
echo.
echo ----------------------------------------------------------------------

REM Step 9: Start the application
call pnpm run start:dev
