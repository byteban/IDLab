# 🚀 Deployment Checklist

## Pre-Deployment
- [ ] Node.js installed (check: `node --version`)
- [ ] Firebase CLI installed (check: `firebase --version`)
- [ ] Logged into Firebase (check: `firebase login`)
- [ ] In correct directory: `c:\projects\IDLab\admin\admin-dashboard`

## Configuration
- [ ] Email service chosen (Gmail/SendGrid/Other)
- [ ] Email credentials obtained (App Password for Gmail)
- [ ] Firebase Functions config set:
  ```powershell
  firebase functions:config:set email.user="..." email.pass="..."
  ```
- [ ] Verify config: `firebase functions:config:get`

## Dependencies
- [ ] Navigate to functions folder: `cd functions`
- [ ] Install packages: `npm install`
- [ ] Verify installation: Check for `node_modules` folder
- [ ] Return to root: `cd ..`

## Deployment
- [ ] Deploy Cloud Functions:
  ```powershell
  firebase deploy --only functions
  ```
- [ ] Check deployment success in Firebase Console
- [ ] Deploy Admin Dashboard:
  ```powershell
  firebase deploy --only hosting
  ```
- [ ] Verify dashboard URL works

## Testing
- [ ] Access admin dashboard: `https://your-project.web.app/admin`
- [ ] Login with admin credentials
- [ ] Navigate to "Payments" tab
- [ ] Create or find test payment
- [ ] Approve payment
- [ ] Verify license generated
- [ ] Check user email for:
  - [ ] Email received
  - [ ] License key visible
  - [ ] PDF attached
  - [ ] PDF opens correctly
  - [ ] License key in PDF matches email

## Verification
- [ ] Check Firebase Console → Functions
  - [ ] `sendLicenseEmail` shows as deployed
  - [ ] `resendLicenseEmail` shows as deployed
- [ ] Check function logs: `firebase functions:log`
- [ ] Check Firestore:
  - [ ] Payment has `email_sent: true`
  - [ ] Payment has `email_sent_at` timestamp
  - [ ] No errors in `email_errors` collection
- [ ] Test resend functionality:
  - [ ] Open approved payment details
  - [ ] Click "Resend License Email"
  - [ ] Verify email received again

## Dashboard UI
- [ ] Payments table shows "Email" column
- [ ] Email status shows correctly:
  - [ ] Green "Sent" for delivered emails
  - [ ] Yellow "Pending" for approved without email
  - [ ] Gray dash for pending/rejected
- [ ] Payment details modal shows email status
- [ ] Resend button appears for approved payments
- [ ] Resend button works correctly

## Production Readiness
- [ ] Email configuration is secure (not in code)
- [ ] Firebase Functions have proper IAM roles
- [ ] Firestore security rules allow function access
- [ ] Email sending works reliably
- [ ] PDF generation completes without errors
- [ ] Error logging configured
- [ ] Monitoring set up in Firebase Console

## Documentation
- [ ] Team briefed on email system
- [ ] Email configuration documented
- [ ] Support process defined
- [ ] Troubleshooting guide accessible

## Optional Enhancements
- [ ] Customize email template branding
- [ ] Add company logo to PDF
- [ ] Configure custom email domain
- [ ] Set up SendGrid for production use
- [ ] Add email analytics
- [ ] Create additional email templates (rejection, etc.)

## Rollback Plan
If issues arise:
- [ ] Previous version accessible
- [ ] Rollback command ready: `firebase rollback functions`
- [ ] Admin notified of rollback procedure
- [ ] Error logs captured for analysis

## Post-Deployment
- [ ] Monitor first 10 email sends
- [ ] Check function execution times
- [ ] Monitor Firestore writes
- [ ] Review email delivery rates
- [ ] Collect user feedback
- [ ] Document any issues found

## Sign-Off
- [ ] System tested and working ✅
- [ ] All stakeholders notified 📢
- [ ] Documentation complete 📚
- [ ] Monitoring active 📊
- [ ] Support team ready 🎧

---

## Quick Commands Reference

```powershell
# Setup everything
.\setup-email-system.ps1

# Deploy functions only
firebase deploy --only functions

# Deploy hosting only
firebase deploy --only hosting

# Deploy everything
firebase deploy

# View logs
firebase functions:log

# Check config
firebase functions:config:get

# Set config
firebase functions:config:set email.user="..." email.pass="..."

# Rollback if needed
firebase rollback functions
```

---

**When all items are checked, you're ready to go live! 🎉**
