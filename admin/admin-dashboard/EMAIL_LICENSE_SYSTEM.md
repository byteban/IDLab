# IDLab Admin Dashboard - Email License System

## Overview

This system automatically sends email notifications with PDF receipts and license keys when an admin approves a payment from the web-based admin dashboard.

## 🎯 Features

- ✅ **Automatic Email Sending**: When payment is approved, email is automatically sent
- 📄 **PDF Receipt Generation**: Professional PDF receipt with license key
- 🔑 **License Key Delivery**: License key included in both email and PDF
- 📧 **Email Tracking**: System tracks when emails are sent
- 🔄 **Manual Resend**: Admins can resend emails if needed
- 🎨 **Professional Design**: Branded email template and PDF receipt

## 📁 Project Structure

```
admin-dashboard/
├── functions/
│   ├── index.js              # Cloud Functions (email logic)
│   ├── package.json          # Dependencies
│   └── EMAIL_SETUP.md        # Email configuration guide
├── public/
│   ├── index.html            # Admin dashboard UI
│   └── js/
│       ├── payments.js       # Updated with email features
│       ├── licenses.js       # License management
│       └── firebase-config.js
├── firebase.json             # Firebase configuration
└── deploy-functions.ps1      # Deployment script
```

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```powershell
cd c:\projects\IDLab\admin\admin-dashboard\functions
npm install
```

This will install:
- firebase-admin: Firebase backend SDK
- firebase-functions: Cloud Functions SDK
- nodemailer: Email sending library
- pdfkit: PDF generation library

### Step 2: Configure Email Service

#### Option A: Gmail (Recommended for small projects)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/security
   - Navigate to "2-Step Verification" → "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. Set Firebase configuration:
```powershell
firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
```

#### Option B: SendGrid (Recommended for production)

1. Create a SendGrid account: https://sendgrid.com/
2. Generate an API key
3. Update `functions/index.js` transporter:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: 'your-sendgrid-api-key'
  }
});
```

### Step 3: Deploy Functions

Run the deployment script:

```powershell
cd c:\projects\IDLab\admin\admin-dashboard
.\deploy-functions.ps1
```

Or deploy manually:

```powershell
firebase deploy --only functions
```

### Step 4: Deploy Updated Dashboard

```powershell
firebase deploy --only hosting
```

Or deploy everything:

```powershell
firebase deploy
```

## 🔧 How It Works

### Workflow

1. **Admin Approves Payment**: Admin clicks "Approve" button in dashboard
2. **License Created**: System generates unique license key
3. **Payment Updated**: Payment status changed to "approved" in Firestore
4. **Function Triggered**: Cloud Function detects status change
5. **PDF Generated**: System creates branded PDF receipt
6. **Email Sent**: Email with license key and PDF sent to user
7. **Status Updated**: Payment record updated with `email_sent: true`

### Cloud Functions

#### `sendLicenseEmail` (Automatic)
- **Trigger**: Firestore document update on `payments/{paymentId}`
- **Condition**: Status changes from non-approved to "approved"
- **Actions**:
  1. Fetches associated license from Firestore
  2. Generates PDF receipt with license key
  3. Sends email with HTML template
  4. Updates payment with email status

#### `resendLicenseEmail` (Manual)
- **Trigger**: HTTPS callable function
- **Purpose**: Allows admins to resend license emails
- **Usage**: Click "Resend License Email" button in payment details

## 📧 Email Template

The email includes:
- Professional branded header
- Personalized greeting
- License key (highlighted)
- License details (package, duration, amount)
- Transaction information
- PDF attachment
- Support contact information

## 📄 PDF Receipt

The PDF receipt includes:
- IDLab branding
- Receipt date and transaction ID
- Customer information
- License details
- Highlighted license key
- Payment information
- Support contact

## 🎨 Dashboard Updates

### Payments Table
- New "Email" column shows email status:
  - ✅ "Sent" - Email delivered successfully
  - ⏱️ "Pending" - Approved but email not sent yet
  - "-" - Not applicable (pending/rejected payments)

### Payment Details Modal
- Email status section shows:
  - ✅ Email sent with timestamp
  - ⏱️ Email pending
- "Resend License Email" button for approved payments

## 🧪 Testing

### Test Email Delivery

1. Create a test payment in Firestore or use the payment form
2. Navigate to admin dashboard: https://your-project.web.app/admin
3. Go to "Payments" tab
4. Find the test payment and click "Approve"
5. Check the user's email inbox
6. Verify PDF attachment is included

### Check Function Logs

```powershell
firebase functions:log
```

Or view in Firebase Console:
- Go to Firebase Console → Functions
- Click on "sendLicenseEmail" or "resendLicenseEmail"
- View logs and execution history

### Manual Resend Test

1. Open an approved payment in the dashboard
2. Click "Resend License Email"
3. Confirm the action
4. Check email delivery

## 🔍 Troubleshooting

### Email Not Sending

**Check 1: Email Configuration**
```powershell
firebase functions:config:get
```
Should show: `{"email":{"user":"...","pass":"..."}}`

**Check 2: Function Logs**
```powershell
firebase functions:log --only sendLicenseEmail
```

**Check 3: Gmail Security**
- Ensure 2FA is enabled
- App password is correct (16 characters, no spaces)
- Try generating a new app password

### License Not Found

Ensure the `approvePayment` function in `payments.js` creates the license before updating payment status.

### PDF Generation Issues

Check that all required npm packages are installed:
```powershell
cd functions
npm list
```

### Permission Errors

Ensure Firebase Functions have proper IAM roles:
- Go to Google Cloud Console
- IAM & Admin → Service Accounts
- Ensure Firebase service account has "Email Sender" role

## 📊 Monitoring

### Firebase Console
- **Functions**: Monitor execution count, errors, and logs
- **Firestore**: Check `payments` collection for `email_sent` field
- **Storage**: Monitor email error logs in `email_errors` collection

### Email Tracking
Query Firestore to see email statistics:
```javascript
// Payments with email sent
db.collection('payments')
  .where('email_sent', '==', true)
  .get()

// Email errors
db.collection('email_errors')
  .orderBy('timestamp', 'desc')
  .get()
```

## 🔒 Security

### Email Credentials
- Never commit email credentials to Git
- Use Firebase Functions config or environment variables
- Rotate passwords regularly

### Function Security
- Cloud Functions are protected by Firebase Authentication
- Only authenticated admins can trigger resend function
- Payment approvals require admin authentication

## 💰 Cost Considerations

### Firebase Functions
- First 2 million invocations/month: Free
- After that: $0.40 per million

### Email Services
- **Gmail**: Free (with rate limits)
- **SendGrid**: 100 emails/day free, then paid plans
- **AWS SES**: $0.10 per 1,000 emails

### Firestore
- First 50,000 document reads/day: Free
- First 20,000 document writes/day: Free

## 🎯 Next Steps

1. ✅ Test email delivery with a real payment approval
2. ✅ Monitor function logs for any errors
3. ✅ Customize email template (colors, branding, content)
4. ✅ Add more email templates (rejection, reminders, etc.)
5. ✅ Set up email analytics (open rates, click rates)
6. ✅ Configure custom domain for sending emails

## 📞 Support

If you encounter issues:
1. Check Firebase Functions logs
2. Review EMAIL_SETUP.md for configuration details
3. Verify Firestore security rules allow function access
4. Ensure all dependencies are installed

## 🔄 Updates & Maintenance

To update the email template:
1. Edit `functions/index.js`
2. Modify the HTML in `mailOptions.html`
3. Redeploy: `firebase deploy --only functions`

To update the PDF template:
1. Edit `generatePDFReceipt` function in `functions/index.js`
2. Adjust PDFKit commands for layout changes
3. Redeploy functions

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: October 22, 2025
