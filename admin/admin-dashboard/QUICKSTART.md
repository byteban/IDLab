# 🚀 Quick Start Guide - IDLab Admin Dashboard

## Step 1: Create Your First Admin User

Open PowerShell and run:

```powershell
cd c:\projects\my-fastapi-app
python admin_manager.py create admin@idlab.zm Admin123! "Admin User"
```

**Expected Output:**
```
✅ Firebase initialized successfully
✅ User created with ID: abc123...
✅ Admin privileges granted
✅ Admin user added to Firestore
```

## Step 2: Open the Dashboard

### Option A: Open Directly in Browser (Easiest)

1. Navigate to: `c:\projects\my-fastapi-app\my-fastapi-app\admin-dashboard\public\`
2. Double-click `login.html` to open in your default browser
3. Login with:
   - **Email:** `admin@idlab.zm`
   - **Password:** `Admin123!`

### Option B: Use a Local Web Server (Recommended)

```powershell
cd c:\projects\my-fastapi-app\my-fastapi-app\admin-dashboard\public
python -m http.server 8000
```

Then open: `http://localhost:8000/login.html`

### Option C: Deploy to Firebase Hosting

```powershell
cd c:\projects\my-fastapi-app\my-fastapi-app\admin-dashboard

# Install Firebase CLI (one-time setup)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy --only hosting
```

You'll get a URL like: `https://idlab-d9000.web.app`

## Step 3: Test the Dashboard

Once logged in, you should see:

1. **📊 Statistics Tab** - Dashboard overview (will show 0s if no data yet)
2. **💳 Payments Tab** - Payment management
3. **📋 License Requests Tab** - License request processing
4. **🔑 Licenses Tab** - License management
5. **👥 Users Tab** - User overview

## Step 4: Test Payment Approval (Optional)

To test the full flow, you can manually add a test payment in Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `idlab-d9000`
3. Go to **Firestore Database**
4. Create a new collection: `payments`
5. Add a document with these fields:

```json
{
  "email": "test@example.com",
  "full_name": "Test User",
  "school": "Test School",
  "package_type": "school",
  "duration_months": 12,
  "amount": 500,
  "status": "pending",
  "submitted_at": [Timestamp - use "now"]
}
```

6. Refresh the dashboard and go to **Payments** tab
7. You should see the test payment - try approving it!

## 🎯 What You Can Do Now

### Manage Payments
- ✅ View all payments (pending/approved/rejected)
- ✅ Approve payments and auto-generate licenses
- ✅ Reject payments with reason
- ✅ View payment details and proof of payment

### Manage Licenses
- ✅ View all licenses
- ✅ Check expiry dates
- ✅ Deactivate licenses
- ✅ Filter by status (active/inactive)

### Manage Users
- ✅ View all registered users
- ✅ Check user license status
- ✅ View device information

### View Statistics
- ✅ Total payments & licenses
- ✅ Pending payments & requests
- ✅ Active licenses count
- ✅ Total users

## 🔒 Security Features

Your dashboard includes:

- ✅ **Admin-only access** - Only users with `admin` custom claim can login
- ✅ **Secure authentication** - Firebase Authentication handles all security
- ✅ **Auto-logout** - Redirects to login if session expires
- ✅ **Permission checks** - Verifies admin status on every request

## 📱 How It Works

### License Generation Flow

1. **User submits payment** → Document created in `payments` collection
2. **Admin approves payment** → Dashboard updates status to "approved"
3. **System auto-generates license** → Creates unique key (e.g., `ABCD12-EFGH34-IJKL56-MNOP78`)
4. **License stored in database** → Added to `licenses` collection with expiry date
5. **Admin sends key to user** → User can activate in your app

### Key Features

- **Auto-generated license keys**: Unique 24-character keys with dashes
- **Expiry tracking**: Automatically calculates expiry based on duration
- **Device limits**: Enforces max devices per license type (school: 50, business: 10)
- **Real-time updates**: All changes reflect immediately in the dashboard

## 🎨 Customization

### Change Logo
Replace `public/assets/logo.png` with your own logo

### Modify Styles
Edit these files:
- `public/css/main.css` - Base styles
- `public/css/dashboard.css` - Dashboard-specific styles
- Or modify the inline `<style>` in `index.html`

### Add Features
The modular JavaScript structure makes it easy to add features:
- `payments.js` - Payment-related functions
- `licenses.js` - License-related functions
- `statistics.js` - Stats and user functions
- `dashboard.js` - Core dashboard functions

## 🐛 Troubleshooting

### "Access denied" error
**Cause:** User doesn't have admin privileges  
**Solution:** Run `python admin_manager.py list` to verify admin user exists

### Dashboard shows no data
**Cause:** No data in Firestore collections  
**Solution:** Add test data or wait for real payments/users

### Firebase errors in console
**Cause:** Network issues or configuration problems  
**Solution:** 
1. Check internet connection
2. Verify `firebase-config.js` has correct credentials
3. Check Firebase Console for service status

### Can't approve payments
**Cause:** User not authenticated or missing permissions  
**Solution:** Logout and login again to refresh authentication token

## 📞 Next Steps

1. ✅ Create admin user
2. ✅ Login to dashboard
3. ✅ Test with sample payment
4. ✅ Approve and generate license
5. ✅ Send license key to test user
6. ✅ Monitor statistics

## 🌐 Production Deployment

When ready for production:

1. Deploy to Firebase Hosting: `firebase deploy`
2. Set up custom domain (optional)
3. Enable Firestore security rules
4. Set up monitoring and analytics
5. Create admin user training documentation

## 💡 Pro Tips

- **Keep your admin credentials safe** - Never share passwords
- **Regular backups** - Export Firestore data regularly
- **Monitor usage** - Check Statistics tab daily
- **Quick filters** - Use status filters to find pending items quickly
- **Keyboard shortcuts** - Press Enter to submit login form

---

**🎉 You're all set! Enjoy your new admin dashboard!**

For detailed documentation, see `SETUP.md`
