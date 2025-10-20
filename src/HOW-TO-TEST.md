# 🧪 HOW TO TEST YOUR BACKEND

## 🎯 **3 WAYS TO ACCESS THE TEST PAGE:**

---

### **METHOD 1: From Your Admin Dashboard** (EASIEST!)

1. **Open your MingleMood app** in your browser
2. **Sign in as admin**: `hello@minglemood.co`
3. Go to **Admin Dashboard**
4. Click the **"🧪 Test Backend"** button in the top-right corner

✅ This will open the test page in a new tab!

---

### **METHOD 2: Direct URL**

In your browser address bar, type your app URL + `/test-backend.html`:

**Format:**
```
https://your-app-url.com/test-backend.html
```

**Examples:**
- If your app is at: `https://abc123.figma.com/make/minglemood`
  - Go to: `https://abc123.figma.com/make/minglemood/test-backend.html`

- If your app is at: `https://preview.figma-make.com/abc123`
  - Go to: `https://preview.figma-make.com/abc123/test-backend.html`

---

### **METHOD 3: From Your Current App Page**

1. **Open your MingleMood app** (any page)
2. Look at the **address bar** in your browser
3. **Add** `/test-backend.html` to the end of the URL
4. Press **Enter**

**Example:**
- Current URL: `https://abc123.figma.com/make/minglemood/`
- Change to: `https://abc123.figma.com/make/minglemood/test-backend.html`

---

## ✅ **WHAT YOU'LL SEE:**

When you open the test page, you'll see:

```
🚀 MingleMood Backend Test
Testing your Supabase Edge Function deployment

📍 Project ID: [Your Project ID]
🔗 Server URL: https://[project-id].supabase.co/functions/v1/make-server-4bcc747c

Test 1: Health Check
Test 2: Admin Stats (Requires Login)
Test 3: Get Events
Test 4: Database Setup (Admin Only)

[Run All Tests] [Go to Dashboard] [View Edge Functions]
```

---

## 🧪 **RUNNING THE TESTS:**

### **Quick Test (Recommended):**
1. Click **"Run All Tests"** button
2. Wait for all 4 tests to complete (about 10 seconds)
3. Check if you see ✅ green checkmarks

### **Individual Tests:**
Click each test button separately:
- **Health Check** - Verifies server is running
- **Get Admin Stats** - Tests admin endpoints (requires login)
- **Get Events** - Tests event listing
- **Database Setup** - Initializes database tables

---

## ✅ **SUCCESSFUL TEST RESULTS:**

You should see:

### Test 1: Health Check ✅
```
✅ SUCCESS!

Server Status: ok
Server: MingleMood Server v1.0
Timestamp: 2025-10-18T...
CORS: enabled
```

### Test 2: Admin Stats ✅
```
✅ SUCCESS!

{
  "totalUsers": 5,
  "activeUsers": 3,
  "totalEvents": 2,
  "upcomingEvents": 1,
  "totalMatches": 12,
  "revenue": 450
}
```

### Test 3: Get Events ✅
```
✅ SUCCESS!

Found 2 events

{
  "events": [...]
}
```

### Test 4: Database Setup ✅
```
✅ SUCCESS!

{
  "message": "Database initialized successfully"
}
```

---

## ❌ **TROUBLESHOOTING:**

### Problem: "Cannot find page" or 404 error
**Fix:** Make sure you're adding `/test-backend.html` to your app's base URL, not to a random URL.

### Problem: "Connection Error" in Health Check
**Fix:** 
1. Edge Function not deployed - go deploy it in Supabase
2. Check Supabase Dashboard → Edge Functions
3. Verify `make-server-4bcc747c` exists and is active

### Problem: "Not Logged In" for Admin Stats
**Fix:** 
1. Go back to your main app
2. Sign in as `hello@minglemood.co`
3. Come back to test page
4. Run tests again

### Problem: Test page loads but shows no Project ID
**Fix:** 
1. Wait a few seconds for the page to load completely
2. Refresh the page
3. Check browser console for errors (F12)

---

## 🎯 **NEXT STEPS AFTER TESTING:**

Once all tests pass:

✅ **Test Real User Signup:**
1. Go to main app
2. Create a new user account
3. Check for welcome email

✅ **Test Admin Features:**
1. Sign in as admin
2. Create an event
3. View user list
4. Send a test email

✅ **Test RSVP System:**
1. Sign in as regular user
2. RSVP to an event
3. Complete payment (use test card: 4242 4242 4242 4242)

---

## 📍 **STILL CAN'T FIND IT?**

Your test file is located at:
```
/test-backend.html
```

It's in the **root directory** of your project, same level as:
- `/App.tsx`
- `/index.html`
- `/README.md`

Just append `/test-backend.html` to whatever URL your app is currently running at!

---

**Need more help?** Check the browser console (F12 → Console tab) for any error messages.
