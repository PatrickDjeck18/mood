# Email Setup Guide for MingleMood Social

## Current Status
⚠️ **Email functionality is currently disabled** because the RESEND_API_KEY is invalid or missing.

**What's happening:**
- User registration ✅ **WORKS** (not affected)
- Profile creation ✅ **WORKS** (not affected)
- Email notifications ❌ **DISABLED** (users won't receive emails)

**Error Details:**
- Current RESEND_API_KEY starts with: `B3ijaFl0r2...`
- Required format: Must start with `re_`
- This appears to be an invalid or placeholder key

---

## How to Fix Email Functionality

### Step 1: Create a Resend Account
1. Go to **https://resend.com**
2. Click "Sign Up" (it's free to start)
3. Verify your email address

### Step 2: Get Your API Key
1. Login to Resend dashboard
2. Go to **https://resend.com/api-keys**
3. Click **"Create API Key"**
4. Give it a name like "MingleMood Production"
5. Copy the full API key (it will start with `re_`)
6. ⚠️ **IMPORTANT:** Save it immediately - you won't be able to see it again!

### Step 3: Verify Your Domain (CRITICAL)
Since you're sending from `hello@minglemood.co`, you **MUST** verify the `minglemood.co` domain in Resend.

1. Go to **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter: `minglemood.co`
4. Resend will show you DNS records to add

### Step 4: Add DNS Records to GoDaddy
You need to add these DNS records in your GoDaddy account:

1. Login to **GoDaddy.com**
2. Go to **My Products** → **Domains** → Click on `minglemood.co`
3. Find **DNS Management** or **Manage DNS**
4. Add the records that Resend provides (usually 3 records):
   - **SPF Record** (TXT record)
   - **DKIM Record** (TXT record)
   - **DMARC Record** (TXT record)

**Example DNS Records from Resend:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [long DKIM key from Resend]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none
```

⚠️ **DNS propagation can take 1-48 hours**

### Step 5: Update RESEND_API_KEY in Supabase
1. Go to your Supabase project
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Find `RESEND_API_KEY`
4. Click **Edit**
5. Paste your new API key (starting with `re_`)
6. Click **Save**

### Step 6: Test Email Functionality
After setting up:
1. Wait for DNS records to propagate (check with https://mxtoolbox.com)
2. Go to your MingleMood admin dashboard
3. Navigate to Email Funnel Manager
4. Send a test email
5. Check the logs - you should see: `✅ Email sent successfully!`

---

## Alternative: Use Microsoft Outlook/SMTP (Advanced)

Since you mentioned using Microsoft Outlook for email, you could alternatively modify the app to use SMTP instead of Resend. However, this requires:

1. **Code changes** to replace Resend with an SMTP library
2. **Microsoft 365 Business** account with SMTP enabled
3. **App passwords** configured in Microsoft account
4. **Additional complexity** in email handling

**Recommendation:** Resend is easier and more reliable for transactional emails. Stick with Resend.

---

## Why Resend Over Other Email Services?

✅ **Pros:**
- Simple API integration (already implemented in your app)
- Reliable delivery rates
- Great for transactional emails (signups, notifications)
- Free tier: 3,000 emails/month
- Easy domain verification

❌ **Microsoft Outlook/SMTP Cons:**
- More complex to set up
- SMTP can be unreliable for automated emails
- May require additional authentication
- Risk of being flagged as spam

---

## Troubleshooting

### "Domain not verified" error
- Wait for DNS propagation (can take up to 48 hours)
- Check DNS records are correct in GoDaddy
- Use https://mxtoolbox.com to verify DNS records

### "Invalid API key" error
- Make sure the key starts with `re_`
- Check you copied the entire key (they're very long)
- Try creating a new API key in Resend dashboard

### Emails going to spam
- Make sure domain is verified
- Add DKIM, SPF, and DMARC records
- Send emails from `hello@minglemood.co` (not a different domain)
- Warm up your domain by sending gradually (start with few emails)

---

## Cost Estimate

**Resend Pricing:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Enterprise: Custom pricing

**For 400+ users:**
- Welcome emails: 400 emails
- Event invitations: ~2-4 emails/user/month = 800-1,600 emails
- Surveys and follow-ups: ~500 emails/month
- **Total estimate:** ~2,000-2,500 emails/month

**Recommended Plan:** Free tier should work initially. Upgrade to Pro when you scale.

---

## Summary Checklist

- [ ] Create Resend account at https://resend.com
- [ ] Generate API key (starts with `re_`)
- [ ] Add domain `minglemood.co` in Resend
- [ ] Copy DNS records from Resend
- [ ] Add DNS records to GoDaddy
- [ ] Wait for DNS propagation (1-48 hours)
- [ ] Verify domain is active in Resend
- [ ] Update RESEND_API_KEY in Supabase environment variables
- [ ] Test email functionality in admin dashboard
- [ ] Monitor email logs for successful delivery

---

## Need Help?

**Resend Support:**
- Documentation: https://resend.com/docs
- Support: support@resend.com

**GoDaddy DNS Help:**
- https://www.godaddy.com/help/manage-dns-records-680

**MingleMood App Issues:**
- Check server logs in Supabase Edge Functions
- Review email logs in Admin Dashboard → Email Funnel Manager
