# IDLab Admin Dashboard - Setup Guide

A web-based admin dashboard for managing IDLab license system built with Firebase.

## ✨ Features

- 🔐 **Secure Authentication** - Admin-only access with Firebase Authentication
- 📊 **Statistics Dashboard** - Real-time overview of payments, licenses, and users
- 💳 **Payment Management** - Approve/reject payments and auto-generate licenses
- 📋 **License Requests** - Review and process license requests
- 🔑 **License Management** - View, activate, and deactivate licenses
- 👥 **User Management** - Monitor all registered users

## 🚀 Quick Start

### Step 1: Create Admin User

Before you can log in, create an admin user:

```powershell
cd c:\projects\my-fastapi-app
python admin_manager.py create admin@idlab.zm YourPassword123 "Admin Name"
```

### Step 2: Test Locally

You can open the files directly in your browser:

1. Navigate to `c:\projects\my-fastapi-app\my-fastapi-app\admin-dashboard\public\`
2. Open `login.html` in your web browser
3. Login with your admin credentials

### Step 3: Deploy to Firebase Hosting (Optional)

```powershell
# Navigate to admin dashboard directory
cd c:\projects\my-fastapi-app\my-fastapi-app\admin-dashboard

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy
```

## 📋 How It Works

### Authentication Flow

1. User enters email/password on `login.html`
2. Firebase Authentication verifies credentials
3. System checks for `admin` custom claim
4. If authorized, redirects to `index.html` (main dashboard)

### Payment Approval Process

1. Admin views pending payments in **Payments** tab
2. Clicks "Approve" on a payment
3. System automatically:
   - Updates payment status to "approved"
   - Generates a unique license key (e.g., `ABCD12-EFGH34-IJKL56-MNOP78`)
   - Creates license record in database
   - Displays license key to admin

4. Admin copies and sends license key to user

### License Management

- **View all licenses**: See active and inactive licenses
- **Check expiry**: Monitor which licenses are expiring soon
- **Deactivate**: Manually deactivate licenses if needed
- **Track usage**: See how many devices are using each license

## 🗂️ File Structure

```
admin-dashboard/
├── public/
│   ├── index.html              # Main dashboard page
│   ├── login.html              # Admin login page
│   ├── css/
│   │   ├── main.css           # Base styles
│   │   └── dashboard.css      # Dashboard-specific styles
│   ├── js/
│   │   ├── firebase-config.js  # Firebase initialization
│   │   ├── auth.js            # Authentication logic
│   │   ├── dashboard.js       # Main dashboard controller
│   │   ├── payments.js        # Payment management
│   │   ├── licenses.js        # License & request management
│   │   └── statistics.js      # Statistics & user management
│   └── assets/
│       └── logo.png           # Your logo (optional)
├── firebase.json              # Firebase configuration
├── .firebaserc               # Firebase project settings
└── README.md                 # Documentation
```

## 🔧 Firebase Configuration

The dashboard connects to your Firebase project: **idlab-d9000**

**Required Firebase Services:**
- ✅ Firestore Database
- ✅ Authentication (Email/Password)
- ✅ Storage (for proof of payment documents)

## 📖 Usage Guide

### Dashboard Tabs

1. **📊 Statistics** - Overview of all metrics
2. **💳 Payments** - Manage payment approvals
3. **📋 License Requests** - Process license requests
4. **🔑 Licenses** - View and manage licenses
5. **👥 Users** - View registered users

### Common Tasks

#### Approve a Payment
1. Go to **Payments** tab
2. Find the pending payment
3. Click **View** to see details
4. Click **Approve**
5. Copy the generated license key
6. Send it to the user

#### Deactivate a License
1. Go to **Licenses** tab
2. Find the license
3. Click **View**
4. Click **Deactivate License**

#### View User Information
1. Go to **Users** tab
2. Find the user
3. Click **View** to see details including their license status

## 🔒 Security Notes

⚠️ **Important:**

1. **Admin Access**: Only users with `admin` custom claim can access
2. **Secure Credentials**: Never share admin passwords
3. **HTTPS Only**: Use HTTPS in production
4. **Regular Audits**: Review admin users periodically

## 🐛 Troubleshooting

### "Access denied. Admin privileges required"
**Solution**: Create admin user with `admin_manager.py`

### "Firebase not initialized"
**Solution**: Check `firebase-config.js` has correct project ID

### Data not loading
**Solution**:
1. Open browser console (F12)
2. Check for error messages
3. Verify Firestore collections exist
4. Check internet connection

### Can't login
**Solution**:
1. Verify email/password are correct
2. Check Firebase Authentication console
3. Ensure user has admin custom claim

## 📞 Support

For help:
1. Check browser console for errors
2. Review Firebase project settings
3. Verify admin user exists in `admin_users` collection

## 📝 License

© 2025 IDLab. All rights reserved.
