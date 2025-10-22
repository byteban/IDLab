# Email Configuration Setup Guide

## Environment Variables Setup

To configure the email service for sending license notifications, you need to set up Firebase Functions configuration with your Zoho email credentials.

### Using Firebase CLI (Production - Recommended)

```bash
firebase functions:config:set email.user="contact@idlab.studio" email.pass="ne29ctBqX5Hg"
```

### Using Environment Variables (Local Development)

Create a `.env` file in the functions directory:

```
EMAIL_USER=contact@idlab.studio
EMAIL_PASS=ne29ctBqX5Hg
```

## Zoho Mail Setup (Current Configuration)

Your IDLab system is configured to use **Zoho Mail** SMTP service.

### Current Settings:
- **SMTP Host**: smtp.zoho.com
- **Port**: 465 (SSL)
- **Email**: contact@idlab.studio
- **Password**: ne29ctBqX5Hg

### Important Notes:
1. ✅ Zoho SMTP is already configured in the code
2. ✅ Uses SSL (secure connection on port 465)
3. ✅ Professional email address (contact@idlab.studio)
4. ✅ No 2FA or app password setup needed for Zoho
5. ⚠️ Credentials are hardcoded as fallback but should be set via Firebase config

### Security Best Practice:
While the credentials are hardcoded as fallback, you should still set them via Firebase config:

```bash
firebase functions:config:set email.user="contact@idlab.studio" email.pass="ne29ctBqX5Hg"
```

This keeps credentials out of version control for production deployments.

## Alternative Email Services

### SendGrid
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

### Amazon SES
```javascript
const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  auth: {
    user: 'your-ses-smtp-username',
    pass: 'your-ses-smtp-password'
  }
});
```

## Deployment

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Set email configuration:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
   ```

3. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## Testing

After deployment, when an admin approves a payment from the dashboard:
1. The status changes to "approved"
2. The Cloud Function automatically triggers
3. A PDF receipt is generated
4. An email with the license key and PDF is sent to the user
5. The payment record is updated with `email_sent: true`

## Manual Resend

If you need to resend an email, you can call the `resendLicenseEmail` function from the admin dashboard.
