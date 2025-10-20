@echo off
REM 🎉 MingleMood Health Check Fix - Quick Deploy Script (Windows)
REM This script redeploys your Edge Function with the health check fix

echo.
echo 🚀 MingleMood Health Check Fix Deployment
echo ==========================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo.
    echo 📥 Install it with:
    echo    Windows: scoop install supabase
    echo    OR download from: https://github.com/supabase/cli
    echo.
    pause
    exit /b 1
)

echo ✅ Supabase CLI found!
echo.

REM Deploy the Edge Function
echo 📤 Deploying make-server-4bcc747c with health check fix...
echo.

supabase functions deploy make-server-4bcc747c --project-ref vijinjtpbrfkyjrzilnm

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ==========================================
    echo ✅ DEPLOYMENT SUCCESSFUL!
    echo ✅ ==========================================
    echo.
    echo 🎉 Your Edge Function has been updated with the health check fix!
    echo.
    echo 🧪 TEST IT NOW:
    echo    1. Open: https://vijinjtpbrfkyjrzilnm.supabase.co/functions/v1/make-server-4bcc747c/health
    echo    2. You should see: {"status":"healthy",...}
    echo.
    echo 🖥️  ADMIN DASHBOARD:
    echo    1. Go to your MingleMood admin dashboard
    echo    2. Refresh the page (F5)
    echo    3. Click 'Re-check API Key'
    echo    4. The 401 error should be GONE! ✅
    echo.
) else (
    echo.
    echo ❌ ==========================================
    echo ❌ DEPLOYMENT FAILED
    echo ❌ ==========================================
    echo.
    echo 🔍 Troubleshooting:
    echo    1. Check you're in the correct directory (should contain supabase\functions\)
    echo    2. Verify your project reference: vijinjtpbrfkyjrzilnm
    echo    3. Check Supabase dashboard for error details
    echo.
)

pause
