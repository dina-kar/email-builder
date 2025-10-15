@echo off
REM Email Builder Backend - Setup and Run Script for Windows

echo ============================================
echo Email Builder Backend Setup
echo ============================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo [OK] Docker is running

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] .env file created
) else (
    echo [OK] .env file exists
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call pnpm install
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

REM Start Docker services
echo.
echo Starting Docker services (PostgreSQL + LocalStack)...
docker-compose up -d

REM Wait for services to be healthy
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check PostgreSQL
echo Checking PostgreSQL...
:wait_postgres
docker exec email-builder-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo    Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo [OK] PostgreSQL is ready

REM Check LocalStack
echo Checking LocalStack S3...
:wait_localstack
curl -f http://localhost:4566/_localstack/health >nul 2>&1
if errorlevel 1 (
    echo    Waiting for LocalStack...
    timeout /t 2 /nobreak >nul
    goto wait_localstack
)
echo [OK] LocalStack is ready

echo.
echo ============================================
echo [OK] Setup Complete!
echo ============================================
echo.
echo Services running:
echo   - PostgreSQL: localhost:5432
echo   - LocalStack S3: localhost:4566
echo.
echo To start the application:
echo   pnpm run start:dev
echo.
echo To stop Docker services:
echo   docker-compose down
echo.
echo To view logs:
echo   docker-compose logs -f
echo.

pause
