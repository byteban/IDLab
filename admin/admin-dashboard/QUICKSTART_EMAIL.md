# Email License System - Quick Start

## 🚀 Quick Deploy

Run the automated setup:

```powershell
cd c:\projects\IDLab\admin\admin-dashboard
.\setup-email-system.ps1
```

This will:
1. Check prerequisites
2. Install dependencies
3. Configure email service
4. Deploy Cloud Functions
5. Deploy admin dashboard

## 📋 Manual Steps

If you prefer manual setup:

### 1. Install Dependencies
```powershell
cd functions
npm install
```

### 2. Configure Email (Optional - fallback exists)
```powershell
firebase functions:config:set email.user="contact@idlab.studio" email.pass="ne29ctBqX5Hg"
```

**Note**: Zoho credentials are hardcoded as fallback, so this step is optional but recommended for production.

### 3. Deploy
```powershell
firebase deploy --only functions
firebase deploy --only hosting
```

## ✅ Testing

1. Go to your admin dashboard: `https://your-project.web.app/admin`
2. Navigate to "Payments" tab
3. Find a pending payment
4. Click "Approve"
5. Check the user's email for:
   - Email with license key
   - PDF receipt attachment

## 🔍 Verify Deployment

Check function logs:
```powershell
firebase functions:log
```

Check email configuration:
```powershell
firebase functions:config:get
```

## 📚 Documentation

- **Complete Guide**: `EMAIL_LICENSE_SYSTEM.md`
- **Email Setup**: `functions/EMAIL_SETUP.md`
- **Deploy Script**: `deploy-functions.ps1`

## 🐛 Troubleshooting

**Email not sending?**
1. Check `firebase functions:log`
2. Verify email config: `firebase functions:config:get`
3. Ensure Zoho credentials are correct (contact@idlab.studio)

**Function not triggering?**
1. Check Firebase Console → Functions
2. Verify function deployment status
3. Check Firestore security rules

**PDF not generating?**
1. Ensure all npm packages installed
2. Check function memory allocation in Firebase Console
3. Review error logs

## 📧 Email Service

**Provider**: Zoho Mail  
**SMTP**: smtp.zoho.com (Port 465, SSL)  
**From**: IDLab Support <contact@idlab.studio>  
**Status**: ✅ Production Ready

## 📞 Support

For issues, check:
- Firebase Functions logs
- Firestore `email_errors` collection
- Browser console (admin dashboard)

---

**Status**: ✅ Production Ready  
**System**: Automatic email with PDF receipt and license key  
**Trigger**: Admin approves payment in dashboard
