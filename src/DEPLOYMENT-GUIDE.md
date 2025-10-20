# MingleMood Supabase Edge Function Deployment Guide

This guide will help you deploy the MingleMood backend Edge Function to Supabase.

## Prerequisites

1. **Supabase CLI installed**
   - Install via npm: `npm install -g supabase`
   - Or via Homebrew (Mac): `brew install supabase/tap/supabase`
   - Or download from: https://github.com/supabase/cli

2. **Supabase Project Access**
   - You need your Project ID and Service Role Key
   - These are available in your Supabase Dashboard under Settings → API

## Step 1: Install Supabase CLI

Choose your installation method:

```bash
# Option A: Via npm (recommended)
npm install -g supabase

# Option B: Via Homebrew (Mac only)
brew install supabase/tap/supabase

# Option C: Via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Verify installation:
```bash
supabase --version
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate. Follow the prompts.

## Step 3: Link Your Project

You need your Project Reference ID (found in Supabase Dashboard → Settings → General):

```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```

Example:
```bash
supabase link --project-ref abcdefghijklmnop
```

## Step 4: Deploy the Edge Function

From your project root directory (where this file is located), run:

```bash
supabase functions deploy make-server-4bcc747c
```

This will automatically deploy all files in `/supabase/functions/server/`

## Step 5: Set Environment Variables (Secrets)

The Edge Function needs access to these environment variables:

```bash
# Set the Resend API key for email functionality
supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Note: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY 
# are automatically available in Edge Functions - you don't need to set them!
```

You already have these secrets set according to your configuration:
- ✅ SUPABASE_URL (auto-provided)
- ✅ SUPABASE_ANON_KEY (auto-provided)
- ✅ SUPABASE_SERVICE_ROLE_KEY (auto-provided)
- ✅ RESEND_API_KEY (you set this)
- ✅ STRIPE_SECRET_KEY (you set this)
- ✅ STRIPE_PUBLISHABLE_KEY (you set this)

## Step 6: Verify Deployment

After deployment, test the Edge Function:

```bash
# Test health endpoint
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4bcc747c/health
```

Or visit this URL in your browser:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4bcc747c/health
```

You should see: `{"status":"ok","message":"MingleMood server is running"}`

## Step 7: Test in Your App

1. Log in to your MingleMood app as admin (hello@minglemood.co)
2. Navigate to the Admin Dashboard
3. The dashboard should now load without errors
4. Try the user deletion tool in the Users tab

## Troubleshooting

### Error: "supabase: command not found"
- The CLI is not installed or not in your PATH
- Re-install using the instructions in Step 1

### Error: "Failed to link project"
- Check your Project Reference ID in Supabase Dashboard → Settings → General
- Make sure you're logged in: `supabase login`

### Error: "Function deployment failed"
- Check that all TypeScript files in `/supabase/functions/server/` are valid
- Look for syntax errors in the deployment output

### Admin Dashboard still shows "Backend Connection Issue"
- Wait 1-2 minutes after deployment for the function to fully activate
- Check the Edge Function logs in Supabase Dashboard → Edge Functions → make-server-4bcc747c → Logs
- Verify the health endpoint returns `{"status":"ok"}`

### Email functionality not working
- Verify RESEND_API_KEY is set: `supabase secrets list`
- Check that your Resend API key is valid
- View Edge Function logs for email errors

## Viewing Logs

To see real-time logs from your Edge Function:

```bash
supabase functions logs make-server-4bcc747c
```

Or view logs in the Supabase Dashboard:
1. Go to Edge Functions
2. Click on `make-server-4bcc747c`
3. Click the "Logs" tab

## Quick Reference Commands

```bash
# Deploy the function
supabase functions deploy make-server-4bcc747c

# View logs
supabase functions logs make-server-4bcc747c

# List all secrets
supabase secrets list

# Set a secret
supabase secrets set SECRET_NAME=value

# Delete a secret
supabase secrets unset SECRET_NAME
```

## Alternative: Manual Deployment via Dashboard

If you prefer not to use the CLI:

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create a new function"
3. Name it: `make-server-4bcc747c`
4. Copy/paste the code from `/supabase/functions/server/index.tsx`
5. Create the helper files in the function editor (if supported)
6. Deploy

⚠️ Note: The dashboard method is less reliable than CLI deployment for complex functions with multiple files.

## Need Help?

- Supabase CLI Docs: https://supabase.com/docs/guides/cli
- Edge Functions Guide: https://supabase.com/docs/guides/functions
- Supabase Discord: https://discord.supabase.com
