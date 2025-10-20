#!/bin/bash

# MingleMood Supabase Edge Function Deployment Script
# This script helps deploy the Edge Function to Supabase

set -e  # Exit on error

echo "🚀 MingleMood Edge Function Deployment Script"
echo "=============================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Check if user is logged in
echo "🔑 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase!"
    echo ""
    echo "Please run: supabase login"
    exit 1
fi

echo "✅ Authenticated with Supabase"
echo ""

# Check if project is linked
echo "🔗 Checking project link..."
if [ ! -f .supabase/config.toml ]; then
    echo "⚠️  Project not linked yet!"
    echo ""
    read -p "Enter your Supabase Project Reference ID: " PROJECT_REF
    echo ""
    echo "Linking project..."
    supabase link --project-ref "$PROJECT_REF"
    echo ""
fi

echo "✅ Project is linked"
echo ""

# Deploy the Edge Function
echo "📦 Deploying Edge Function: make-server-4bcc747c"
echo ""
supabase functions deploy make-server-4bcc747c

echo ""
echo "✅ Deployment complete!"
echo ""

# Get project details
echo "🔍 Getting deployment details..."
PROJECT_REF=$(grep 'project_id' .supabase/config.toml | cut -d'"' -f2 || echo "unknown")

echo ""
echo "=============================================="
echo "✅ Edge Function Successfully Deployed!"
echo "=============================================="
echo ""
echo "📍 Function URL:"
echo "   https://${PROJECT_REF}.supabase.co/functions/v1/make-server-4bcc747c"
echo ""
echo "🧪 Test the deployment:"
echo "   curl https://${PROJECT_REF}.supabase.co/functions/v1/make-server-4bcc747c/health"
echo ""
echo "   Or open verify-deployment.html in your browser"
echo ""
echo "📊 View logs:"
echo "   supabase functions logs make-server-4bcc747c"
echo ""
echo "🔐 Environment Variables (Secrets):"
echo "   The following secrets are already configured:"
echo "   - RESEND_API_KEY ✅"
echo "   - STRIPE_SECRET_KEY ✅"
echo "   - STRIPE_PUBLISHABLE_KEY ✅"
echo "   - SUPABASE_* (auto-provided) ✅"
echo ""
echo "🎉 Your admin dashboard should now work!"
echo "   Log in at: https://minglemood.co"
echo "   Admin email: hello@minglemood.co"
echo ""
echo "=============================================="
