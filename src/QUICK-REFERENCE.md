# 🚀 Quick Reference Card

## Deploy in 30 Seconds

```bash
./deploy.sh        # Mac/Linux
deploy.bat         # Windows
```

---

## Delete User Now

### Before Deployment
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Your Project → **Authentication** → **Users**
3. Find `stevonne408@hotmail.com`
4. Click **⋮** → **Delete user**

### After Deployment
1. Visit: `https://minglemood.co/?delete-user=true`
2. Login as admin
3. Click **Delete**

---

## Test Deployment

**Method 1:** Open `verify-deployment.html`

**Method 2:** Visit:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4bcc747c/health
```

Should return: `{"status":"ok"}`

---

## Common Commands

```bash
# Deploy
supabase functions deploy make-server-4bcc747c

# View logs
supabase functions logs make-server-4bcc747c

# List secrets
supabase secrets list
```

---

## Find Your Project ID

**Dashboard:** Settings → API → Project URL

**Format:** 
- URL: `https://abc123xyz.supabase.co`
- Project ID: `abc123xyz`

---

## Admin Access

**URL:** https://minglemood.co

**Email:** hello@minglemood.co

**Features:**
- Delete users
- Manage events
- View analytics
- Send emails

---

## Files You Need

| Need to... | Open this file |
|------------|---------------|
| Deploy quickly | `deploy.sh` or `deploy.bat` |
| Learn how to deploy | `QUICK-START-DEPLOYMENT.md` |
| Troubleshoot issues | `DEPLOYMENT-GUIDE.md` |
| Test deployment | `verify-deployment.html` |
| See API docs | `supabase/functions/README.md` |

---

## Emergency Help

**Problem:** Deployment fails
**Fix:** Check `DEPLOYMENT-GUIDE.md` → Troubleshooting section

**Problem:** Dashboard still broken
**Fix:** Wait 2 minutes, hard refresh (Ctrl+Shift+R)

**Problem:** Can't delete user
**Fix:** Use Supabase Dashboard directly (option above)

---

## That's It!

👉 **Next Step:** Run `./deploy.sh`

⏱️ **Time:** 2 minutes

✅ **Result:** Working admin dashboard
