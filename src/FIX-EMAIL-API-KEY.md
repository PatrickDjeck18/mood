# 🔧 Fix Email Service Issue - Invalid API Key

## 🚨 The Problem

Your admin dashboard is showing:
```
🔑 Email Service Issue: Invalid API Key
Failed to fetch
```

This means your **RESEND_API_KEY** is either:
- ❌ Invalid format (doesn't start with `re_`)
- ❌ Expired or revoked
- ❌ Not set properly in Supabase
- ❌ Network issue connecting to Resend

---

## ✅ SOLUTION: Step-by-Step Fix

### Step 1: Get a New Resend API Key

1. **Go to Resend Dashboard**
   ```
   https://resend.com/api-keys
   ```

2. **Login to your Resend account**
   - Use your Resend credentials
   - If you don't have an account, create one at https://resend.com/signup

3. **Create a New API Key**
   - Click "Create API Key" button
   - **Name**: "MingleMood Production" (or any name)
   - **Permission**: Select "Full Access" or "Sending Access"
   - Click "Create"

4. **Copy the API Key**
   - The key will look like: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **IMPORTANT**: Copy it immediately - you won't see it again!
   - It should start with `re_`
   
   Example format:
   ```
   re_123ABC456DEF789GHI012JKL345MNO
   ```

---

### Step 2: Update Supabase Environment Variable

1. **Go to Your Supabase Project Dashboard**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **Navigate to Edge Functions Settings**
   - Click on "Edge Functions" in the left sidebar
   - Click on "Settings" or "Secrets"
   - Or go directly to:
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions
   ```

3. **Find RESEND_API_KEY Secret**
   - Look for `RESEND_API_KEY` in the list of secrets
   - Click "Edit" or the pencil icon next to it

4. **Update the Value**
   - Paste your new API key from Step 1
   - Make sure it starts with `re_`
   - **No spaces before or after**
   
   ```
   Name: RESEND_API_KEY
   Value: re_123ABC456DEF789GHI012JKL345MNO
   ```

5. **Save the Secret**
   - Click "Save" or "Update"
   - Wait for confirmation

---

### Step 3: Redeploy Your Edge Function (CRITICAL!)

**IMPORTANT**: Updating the secret is NOT enough! You must redeploy.

#### Option A: Using Supabase Dashboard (EASIEST)

1. Go to Edge Functions in Supabase Dashboard
2. Find the `make-server-4bcc747c` function
3. Click "Deploy" or "Redeploy"
4. Wait for deployment to complete (~30 seconds)

#### Option B: Using Command Line

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Deploy the function
supabase functions deploy make-server-4bcc747c
```

---

### Step 4: Verify Your Domain in Resend

1. **Go to Resend Domains**
   ```
   https://resend.com/domains
   ```

2. **Add Your Domain** (if not already added)
   - Click "Add Domain"
   - Enter: `minglemood.co`
   - Click "Add"

3. **Verify DNS Records**
   - Resend will show you DNS records to add
   - You need to add these to your GoDaddy DNS settings

4. **Add DNS Records in GoDaddy**
   
   a. Login to GoDaddy
   b. Go to "My Products" → "DNS"
   c. Find `minglemood.co`
   d. Add the DNS records provided by Resend:
   
   **Typical records you'll need to add:**
   ```
   Type: TXT
   Name: @
   Value: [provided by Resend]
   
   Type: TXT
   Name: _dmarc
   Value: [provided by Resend]
   
   Type: CNAME
   Name: resend._domainkey
   Value: [provided by Resend]
   ```

5. **Wait for Verification**
   - DNS changes can take 5-60 minutes
   - Resend will show "Verified" when ready
   - You can click "Verify" to check status

---

### Step 5: Test the Fix

1. **Go to Your Admin Dashboard**
   ```
   https://minglemood.co
   ```

2. **Login as Admin**
   - Email: `hello@minglemood.co`
   - Password: [your admin password]

3. **Check for the Red Error Banner**
   - If it's GONE → ✅ Success!
   - If it's still there → Continue to troubleshooting

4. **Test Sending an Email**
   - In admin dashboard, look for "Test Backend" or "Email Funnel Manager"
   - Send a test email to yourself
   - Check if you receive it

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" Error

**Possible Causes:**
1. Network connectivity issue
2. Resend API is down
3. CORS issue
4. Edge function not redeployed

**Solutions:**
1. **Check Resend Status**
   ```
   https://resend.com/status
   ```
   
2. **Verify Network Connection**
   - Try accessing https://api.resend.com in browser
   - Should show a JSON response
   
3. **Redeploy Edge Function Again**
   - Sometimes the first deploy doesn't pick up new secrets
   - Deploy twice to be sure
   
4. **Check Browser Console**
   - Press F12 in browser
   - Look for error messages
   - Share them if you need help

---

### Issue: API Key Format Error

**Error Message:**
```
Invalid RESEND_API_KEY format. Resend API keys should start with "re_".
```

**Solution:**
1. Your API key doesn't start with `re_`
2. Get a new key from https://resend.com/api-keys
3. Make sure you copy the ENTIRE key
4. Check for extra spaces or characters

---

### Issue: "401 Unauthorized" Error

**Error Message:**
```
API key is invalid or unauthorized.
```

**Possible Causes:**
- API key was revoked
- API key is from a different Resend account
- API key expired

**Solution:**
1. Delete the old API key in Resend dashboard
2. Create a brand new one
3. Update Supabase secret with new key
4. Redeploy edge function

---

### Issue: Domain Not Verified

**Error Message:**
```
Domain not verified in Resend
```

**Solution:**
1. Complete Step 4 above (Verify Your Domain)
2. Make sure DNS records are added in GoDaddy
3. Wait at least 30 minutes for DNS propagation
4. Click "Verify" in Resend dashboard

---

### Issue: Still Showing Error After Everything

**Last Resort Steps:**

1. **Double-Check the Secret Name**
   - Must be exactly: `RESEND_API_KEY`
   - Case-sensitive
   - No typos

2. **Check Secret Value Has No Spaces**
   ```
   ✅ Correct: re_ABC123XYZ789
   ❌ Wrong:  re_ABC123XYZ789 
   ❌ Wrong:  re_ABC123XYZ789
   ```

3. **Create a Completely New API Key**
   - Delete ALL old Resend API keys
   - Create a fresh one
   - Use that new one

4. **Wait 5 Minutes After Redeploying**
   - Edge functions need time to restart
   - Clear browser cache
   - Refresh admin dashboard

5. **Check Supabase Logs**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for errors related to RESEND_API_KEY
   - Share them if you need help

---

## 📋 Quick Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Created new Resend API key
- [ ] API key starts with `re_`
- [ ] Copied entire API key (no spaces)
- [ ] Updated RESEND_API_KEY in Supabase secrets
- [ ] Secret name is exactly `RESEND_API_KEY`
- [ ] Redeployed edge function
- [ ] Waited 2-3 minutes after deployment
- [ ] Added domain `minglemood.co` to Resend
- [ ] Added DNS records to GoDaddy
- [ ] Domain shows "Verified" in Resend
- [ ] Cleared browser cache
- [ ] Refreshed admin dashboard
- [ ] Red error banner is gone

---

## 🎯 Expected Result

After fixing, you should see:

### ✅ In Admin Dashboard:
- **NO** red error banner about API key
- Email service status shows "Working"
- Can send test emails successfully

### ✅ In Resend Dashboard:
- Domain shows as "Verified"
- API key shows as "Active"
- Can see sent emails in logs

### ✅ In Email:
- Welcome emails arrive when users sign up
- Profile approval emails are sent
- Event invitation emails work

---

## 🔍 How to Verify It's Working

### Test 1: Check API Key Validation

1. Login to admin dashboard
2. Look for "Test Backend" or "Administrator" section
3. Click "Re-check API Key" button
4. Should show: ✅ "API key is valid and working!"

### Test 2: Send Test Email

1. In admin dashboard, find "Email Funnel Manager"
2. Click "Test Email" or similar button
3. Enter your email address
4. Click send
5. Check your inbox (and spam folder)
6. Should receive email within 1 minute

### Test 3: Sign Up a Test User

1. Go to signup page (logged out)
2. Create a test account with new email
3. Complete signup
4. Check email for welcome message
5. Should receive within 1 minute

---

## 💡 Pro Tips

### Tip 1: Use Resend's Testing Domain First

If you're having domain verification issues:
1. Resend provides a testing domain
2. Use it to verify emails work
3. Then switch to your custom domain later

### Tip 2: Keep Old API Key Active

When testing new key:
1. Don't delete old key immediately
2. Create new key
3. Update Supabase
4. Test
5. Only delete old key once new one works

### Tip 3: Monitor Resend Dashboard

Check your Resend dashboard regularly:
- View sent emails
- See delivery rates
- Check for bounces
- Monitor API usage

---

## 📞 Still Need Help?

If you're still stuck after following all steps:

1. **Check Supabase Edge Function Logs**
   - Screenshot any errors
   - Look for red error messages

2. **Check Browser Console**
   - Press F12
   - Go to Console tab
   - Screenshot any red errors

3. **Check Resend Dashboard**
   - Any error messages?
   - Is domain verified?
   - Is API key active?

4. **Share These Details:**
   - Which step failed?
   - Error message you're seeing
   - Screenshot of red banner
   - Screenshot of Supabase secrets (blur the values!)

---

## 🚀 Final Notes

**Why This Error Happens:**
- Resend API keys can expire
- Domain verification needs DNS setup
- Edge functions cache environment variables
- Secrets don't update without redeployment

**Prevention:**
- Keep API keys documented
- Monitor email delivery
- Test regularly
- Set up alerts in Resend

**Success Criteria:**
1. ✅ No red error banner
2. ✅ Test emails deliver
3. ✅ Welcome emails send automatically
4. ✅ All email templates work

---

## ⏱️ Time Estimate

- **Getting new API key**: 2 minutes
- **Updating Supabase secret**: 1 minute  
- **Redeploying function**: 1 minute
- **DNS verification**: 5-60 minutes (waiting)
- **Testing**: 5 minutes

**Total active time**: ~10 minutes
**Total wait time**: Up to 1 hour (for DNS)

---

## ✅ You're Done When:

1. Red error banner is completely gone from admin dashboard
2. Can send test emails successfully
3. New user signups receive welcome emails
4. Resend dashboard shows emails being sent
5. All email templates work correctly

**Good luck! The fix is straightforward - just follow the steps carefully!** 🎉
