# 🗑️ How to Delete a User's Email from Supabase

You have **3 methods** to delete users from MingleMood. All methods are already built and working!

---

## Method 1: Standalone User Deleter Tool (EASIEST) ⭐

### How to Access:
Add `?delete-user=true` to your URL:
```
https://minglemood.co/?delete-user=true
```

### Steps:
1. **Go to**: `https://minglemood.co/?delete-user=true`
2. **Login first** as `hello@minglemood.co` (admin account)
3. **You'll see the User Deleter interface** with:
   - Email input field
   - Delete button
   - Debug information panel
4. **Enter the email** you want to delete (e.g., `stevonne408@hotmail.com`)
5. **Click "Delete User Account"**
6. **Confirm** the deletion
7. **Done!** ✅ User deleted, email available for re-use

### What It Deletes:
- ✅ User from Supabase Auth
- ✅ User profile data from KV store
- ✅ All associated metadata
- ✅ Makes email immediately available for re-signup

### Requirements:
- Must be logged in as `hello@minglemood.co`
- User must exist in Supabase

---

## Method 2: Admin Dashboard (INTEGRATED)

### How to Access:
1. Login as `hello@minglemood.co`
2. Click on **"Admin"** tab in the navigation
3. Go to **User Management** section

### Steps:
1. **Login** as admin
2. **Navigate to Admin Dashboard**
3. **Find the user** in the user list
4. **Click the delete/trash icon** next to their name
5. **Confirm deletion**
6. **Done!** ✅

### Features:
- See all users in one place
- View user details before deleting
- Bulk operations possible
- Real-time updates

---

## Method 3: API Call (FOR DEVELOPERS)

If you need to delete users programmatically:

### Endpoint:
```
DELETE https://{projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/users/{email}
```

### Example with cURL:
```bash
curl -X DELETE \
  "https://your-project-id.supabase.co/functions/v1/make-server-4bcc747c/admin/users/user@example.com" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Example with JavaScript:
```javascript
const deleteUser = async (email) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/users/${encodeURIComponent(email)}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  
  return await response.json();
};

// Usage
deleteUser('stevonne408@hotmail.com')
  .then(result => console.log('User deleted:', result))
  .catch(error => console.error('Error:', error));
```

### Response:
```json
{
  "success": true,
  "message": "User user@example.com deleted successfully",
  "deletedUserId": "uuid-here"
}
```

---

## 🎯 Quick Guide for Testing

### Scenario: Testing the signup flow multiple times

**Problem**: "I can't sign up with the same email again"

**Solution**:

1. Go to: `https://minglemood.co/?delete-user=true`
2. Login as admin (`hello@minglemood.co`)
3. Enter test email (e.g., `stevonne408@hotmail.com`)
4. Click "Delete User Account"
5. Wait for success message ✅
6. Now you can sign up with that email again!

---

## 🔒 Security Features

### Who Can Delete Users?
- **ONLY** the admin account: `hello@minglemood.co`
- Any other user gets "Unauthorized" error
- Access token required and verified

### What Gets Deleted?
1. **Supabase Auth Record** - The user's authentication
2. **KV Store Data** - User profile data (`user:{userId}`)
3. **Migration Data** - If user was migrated (`users_data:{userId}`)

### What Doesn't Get Deleted (Currently)?
- **Photos** - Stored in Supabase Storage (if uploaded)
- **RSVPs** - Event registrations (if any)
- **Email Logs** - Tracking of sent emails

**Note**: If you need to delete these too, let me know and I can extend the delete function!

---

## 🛠️ Troubleshooting

### Error: "No access token provided"
- **Solution**: Login as admin first before accessing the delete tool

### Error: "Unauthorized - Admin access required"
- **Solution**: Make sure you're logged in as `hello@minglemood.co`, not any other account

### Error: "User not found"
- **Solution**: 
  - Check the email spelling (case-sensitive)
  - User might already be deleted
  - Verify user exists in Supabase Dashboard

### Error: "Failed to delete user"
- **Solution**: 
  - Check browser console for detailed error
  - Verify Supabase connection
  - Check SUPABASE_SERVICE_ROLE_KEY is set

---

## 📋 Pre-filled Test Email

The standalone deleter has **`stevonne408@hotmail.com`** pre-filled by default. This is likely your test account. You can:
- Use this email for testing
- Change it to any email you want to delete
- Clear it and enter a new one

---

## 🎯 Most Common Use Case

**"I want to re-test the signup flow"**

### Quick Steps:
1. Open: `https://minglemood.co/?delete-user=true`
2. Confirm you're logged in as admin
3. The email field already has `stevonne408@hotmail.com`
4. Click "Delete User Account"
5. Click "OK" to confirm
6. Wait for green success message
7. Go back to main site and sign up again with same email!

---

## 📱 Mobile Access

The standalone deleter works on mobile too:
1. Open `https://minglemood.co/?delete-user=true` on mobile
2. Login as admin
3. Same interface, optimized for touch
4. All functionality works the same

---

## 🔍 Verification

### How to Verify User Was Deleted:

**Method 1: Try to sign up again**
- Go to signup page
- Use the deleted email
- If it works, user was deleted ✅

**Method 2: Check Admin Dashboard**
- Go to Admin tab
- Look in user list
- User should be gone ✅

**Method 3: Supabase Dashboard**
- Go to your Supabase project
- Navigate to Authentication > Users
- Search for the email
- Should not exist ✅

---

## 🚀 Advanced: Bulk Delete

If you need to delete multiple users, you can:

1. **Use the API method** in a loop
2. **Modify the standalone deleter** to accept multiple emails
3. **Use Supabase Dashboard** for manual bulk operations

Need help with bulk deletion? Let me know!

---

## 📞 Support

If you encounter issues:
1. Check the **Debug Information** panel in the standalone deleter
2. Look at **browser console** for error messages
3. Verify you're logged in as `hello@minglemood.co`
4. Check your Supabase connection

---

## ✅ Summary

| Method | Best For | Ease | Requirements |
|--------|----------|------|--------------|
| **Standalone Tool** | Quick single deletes | ⭐⭐⭐⭐⭐ | Admin login |
| **Admin Dashboard** | Managing multiple users | ⭐⭐⭐⭐ | Admin login |
| **API Call** | Automation/scripts | ⭐⭐⭐ | Technical knowledge |

**Recommended**: Use the **Standalone Tool** (`?delete-user=true`) for the easiest experience!

---

## 🎓 What You Learned

Your system already has:
- ✅ Complete user deletion functionality
- ✅ Admin-only access control
- ✅ KV store cleanup
- ✅ Debug information
- ✅ Success/error messaging
- ✅ Confirmation dialogs

Everything is ready to use! 🎉
