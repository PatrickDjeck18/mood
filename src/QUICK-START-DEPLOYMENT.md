# 🚀 Quick Start: Deploy Your Edge Function in 5 Minutes

Follow these simple steps to deploy your MingleMood backend and fix the admin dashboard.

## ⚡ Super Quick Method (Recommended)

### **Step 1: Install Supabase CLI**

Choose your platform:

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
npm install -g supabase
```

**Linux:**
```bash
npm install -g supabase
```

### **Step 2: Login**

```bash
supabase login
```

A browser window will open. Login to your Supabase account.

### **Step 3: Run the Deployment Script**

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```bash
deploy.bat
```

The script will guide you through the rest!

### **Step 4: Verify**

Open `verify-deployment.html` in your browser and enter your Supabase Project ID to test.

---

## 📝 Manual Method (If scripts don't work)

### **Step 1: Install & Login**

```bash
# Install
npm install -g supabase

# Login
supabase login
```

### **Step 2: Link Your Project**

```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```

**Where to find your Project Reference ID:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your MingleMood project
3. Go to Settings → General
4. Copy the "Reference ID" (looks like: `abcdefghijklmnop`)

### **Step 3: Deploy**

```bash
supabase functions deploy make-server-4bcc747c
```

### **Step 4: Test**

Visit this URL in your browser (replace YOUR_PROJECT_ID):
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4bcc747c/health
```

You should see:
```json
{"status":"ok","message":"MingleMood server is running"}
```

---

## ✅ What Happens After Deployment?

1. **Admin Dashboard works** - No more "Backend Connection Issue" errors
2. **User deletion works** - You can delete test accounts
3. **Email system works** - Event notifications can be sent
4. **RSVP system works** - Users can book events
5. **All backend features active** - Full platform functionality

---

## 🐛 Troubleshooting

### "supabase: command not found"

**Solution:** The CLI isn't installed or not in your PATH.

Try:
```bash
npm install -g supabase
```

Then close and reopen your terminal.

---

### "Failed to link project"

**Solution:** Check your Project Reference ID.

1. Go to Supabase Dashboard
2. Settings → General
3. Copy the exact "Reference ID"
4. Run: `supabase link --project-ref YOUR_EXACT_ID`

---

### "Deployment succeeded but dashboard still broken"

**Solution:** Wait 1-2 minutes for the function to activate, then:

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Log out and log back in
4. Check the health endpoint works

---

### "Health endpoint returns 404"

**Solution:** The function isn't deployed correctly.

1. Check deployment logs: `supabase functions logs make-server-4bcc747c`
2. Redeploy: `supabase functions deploy make-server-4bcc747c`
3. Verify in Supabase Dashboard → Edge Functions

---

## 🆘 Still Having Issues?

1. **Check the full deployment guide:** See `DEPLOYMENT-GUIDE.md`
2. **View function logs:** `supabase functions logs make-server-4bcc747c`
3. **Check Supabase Dashboard:** Edge Functions → make-server-4bcc747c → Logs
4. **Test with verification tool:** Open `verify-deployment.html`

---

## 📞 Need to Delete a User Right Now?

### Option A: After deployment, use the admin dashboard
1. Log in as hello@minglemood.co
2. Admin Dashboard → Users tab
3. Enter email and click Delete

### Option B: Use the standalone tool (works without deployment)
1. Go to: `https://minglemood.co/?delete-user=true`
2. Log in as admin
3. Delete the user

### Option C: Use Supabase Dashboard directly
1. Go to supabase.com/dashboard
2. Select project → Authentication → Users
3. Find user → Click ⋮ → Delete user

---

## ⏱️ Time Estimate

- **First time:** 5-10 minutes (includes CLI installation)
- **Subsequent deployments:** 30 seconds

---

## 🎉 Success Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Function deployed
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Admin dashboard loads without errors
- [ ] Can delete test users

Once all boxes are checked, your backend is fully operational! 🚀
