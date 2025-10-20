#!/bin/bash

# 🎉 MingleMood Health Check Fix - Quick Deploy Script
# This script redeploys your Edge Function with the health check fix

echo "🚀 MingleMood Health Check Fix Deployment"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "📥 Install it with:"
    echo "   macOS/Linux: brew install supabase/tap/supabase"
    echo "   Windows: scoop install supabase"
    echo ""
    echo "   OR download from: https://github.com/supabase/cli"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found!"
echo ""

# Check if logged in
echo "🔑 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Please login first:"
    echo "   supabase login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Deploy the Edge Function
echo "📤 Deploying make-server-4bcc747c with health check fix..."
echo ""

supabase functions deploy make-server-4bcc747c --project-ref vijinjtpbrfkyjrzilnm

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ =========================================="
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "✅ =========================================="
    echo ""
    echo "🎉 Your Edge Function has been updated with the health check fix!"
    echo ""
    echo "🧪 TEST IT NOW:"
    echo "   1. Open: https://vijinjtpbrfkyjrzilnm.supabase.co/functions/v1/make-server-4bcc747c/health"
    echo "   2. You should see: {\"status\":\"healthy\",...}"
    echo ""
    echo "🖥️  ADMIN DASHBOARD:"
    echo "   1. Go to your MingleMood admin dashboard"
    echo "   2. Refresh the page (F5)"
    echo "   3. Click 'Re-check API Key'"
    echo "   4. The 401 error should be GONE! ✅"
    echo ""
else
    echo ""
    echo "❌ =========================================="
    echo "❌ DEPLOYMENT FAILED"
    echo "❌ =========================================="
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check you're in the correct directory (should contain supabase/functions/)"
    echo "   2. Verify your project reference: vijinjtpbrfkyjrzilnm"
    echo "   3. Check Supabase dashboard for error details"
    echo ""
    exit 1
fi
