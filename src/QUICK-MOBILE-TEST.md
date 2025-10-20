# 📱 Quick Mobile Test Checklist

## Pre-Test Setup
- [ ] Clear browser cache/cookies
- [ ] Use a fresh/new email address
- [ ] Have your phone ready to test

## Test Flow

### Step 1: Photos & Basic Info ✅
1. [ ] Upload at least 1 photo from gallery
2. [ ] Enter Full Name
3. [ ] Enter Age (number)
4. [ ] Select Gender
5. [ ] Select Location
6. [ ] **(CRITICAL)** Tap "Continue" button
7. [ ] **CHECK:** Page should scroll to top and show Step 2

### Expected After Step 1:
- ✅ Page shows "Professional & Personal Details" heading
- ✅ See "Step 2 of 5" in progress indicator
- ✅ See Profession and Education fields
- ❌ **NOT** a blank white page

### If Blank Page Appears:
1. [ ] Tap the blue bug icon (🐛) in bottom-right corner
2. [ ] Screenshot the debug info panel
3. [ ] Note what "Current Step" shows
4. [ ] Check browser console if possible

### Step 2: Professional Details ✅
1. [ ] Enter Profession
2. [ ] Enter Education
3. [ ] Select at least 3 interests (tap to select)
4. [ ] Tap "Continue"
5. [ ] **CHECK:** Should advance to Step 3

### Step 3: About You ✅
1. [ ] Select "What you're looking for" (required)
2. [ ] Optionally add bio
3. [ ] Tap "Continue"
4. [ ] **CHECK:** Should advance to Step 4

### Step 4: Dating Preferences ✅
1. [ ] Select age range preferences
2. [ ] Select age flexibility
3. [ ] Select ethnicity flexibility  
4. [ ] Select religion flexibility
5. [ ] Rate all importance items (6 ratings total)
6. [ ] Tap "Continue"
7. [ ] **CHECK:** Should advance to Step 5

### Step 5: Review & Complete ✅
1. [ ] Review your profile information
2. [ ] Tap "Complete Profile"
3. [ ] **CHECK:** Should show Thank You page

## Debug Tools Available

### Mobile Debug Panel 🐛
- Location: Bottom-right floating button
- Shows: Current step, processing status, form values
- Use when: Something seems stuck or broken

### Browser Console
- **iOS Safari:** Requires Mac + USB cable + Safari Web Inspector
- **Android Chrome:** Connect via USB, open `chrome://inspect` on desktop
- Shows: Detailed logs and any JavaScript errors

### Desktop Mobile Emulation
- Chrome DevTools (F12 or Cmd+Option+I)
- Click device icon or Ctrl+Shift+M
- Select mobile device (e.g., iPhone 12 Pro)
- Test full flow with console access

## What to Report

If issues occur, please provide:

1. **Device & Browser**
   - Example: "iPhone 13, iOS 17.2, Safari"
   - Example: "Samsung Galaxy S21, Android 13, Chrome"

2. **Step Where Issue Occurred**
   - "Blank page after Step 1"
   - "Stuck on Step 3"

3. **Debug Panel Info** (if available)
   - Screenshot showing current step, can proceed status, etc.

4. **Console Errors** (if accessible)
   - Red error messages
   - Failed network requests
   - JavaScript errors

5. **What You See**
   - "Blank white page"
   - "Button is disabled but shouldn't be"
   - "Photos not uploading"

## Expected Success Indicators

### ✅ Working Properly:
- Smooth transitions between all 5 steps
- Progress bar updates (20%, 40%, 60%, 80%, 100%)
- Step indicators turn green when completed
- Continue button enables when requirements met
- Thank You page shows after completion

### ❌ Problems to Report:
- Blank white page at any point
- Stuck on a step (can't proceed even with all fields filled)
- Photos not uploading/showing
- JavaScript errors in console
- Button stays disabled when it shouldn't be

## Quick Fixes to Try First

1. **Refresh the page** - Sometimes helps with cached code
2. **Clear cache** - Browser settings > Clear browsing data
3. **Try different browser** - Safari vs Chrome
4. **Check internet connection** - Photos need good connection
5. **Allow photo permissions** - When prompted by browser

## Contact
If issues persist: **hello@minglemood.co**

Include:
- Device/browser info
- Screenshots (especially debug panel)
- Console logs if available
- Description of what happened
