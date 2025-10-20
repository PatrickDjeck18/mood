@echo off
REM MingleMood Supabase Edge Function Deployment Script (Windows)
REM This script helps deploy the Edge Function to Supabase

echo.
echo ============================================
echo MingleMood Edge Function Deployment Script
echo ============================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Supabase CLI is not installed!
    echo.
    echo Please install it first:
    echo   npm install -g supabase
    echo.
    echo Or visit: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo [OK] Supabase CLI found
supabase --version
echo.

REM Check if user is logged in
echo Checking Supabase authentication...
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Not logged in to Supabase!
    echo.
    echo Please run: supabase login
    pause
    exit /b 1
)

echo [OK] Authenticated with Supabase
echo.

REM Check if project is linked
echo Checking project link...
if not exist .supabase\config.toml (
    echo WARNING: Project not linked yet!
    echo.
    set /p PROJECT_REF="Enter your Supabase Project Reference ID: "
    echo.
    echo Linking project...
    supabase link --project-ref %PROJECT_REF%
    echo.
)

echo [OK] Project is linked
echo.

REM Deploy the Edge Function
echo Deploying Edge Function: make-server-4bcc747c
echo.
supabase functions deploy make-server-4bcc747c

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Deployment failed!
    echo Check the error messages above for details.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] Edge Function Successfully Deployed!
echo ============================================
echo.
echo Test the deployment:
echo   Open verify-deployment.html in your browser
echo.
echo View logs:
echo   supabase functions logs make-server-4bcc747c
echo.
echo Your admin dashboard should now work!
echo   Log in at: https://minglemood.co
echo   Admin email: hello@minglemood.co
echo.
echo ============================================
echo.
pause
