# 🚀 Deploy Approval Workflow System

## Quick Deploy

```powershell
cd c:\projects\IDLab\admin\admin-dashboard\functions
npm install
cd ..
firebase deploy --only "functions,hosting:idlab-admin"
```

## Step-by-Step Deployment

### 1. Install Dependencies

The approval system uses the built-in Node.js `crypto` module, so no additional dependencies needed.

```powershell
cd c:\projects\IDLab\admin\admin-dashboard\functions
npm install
```

### 2. Deploy Cloud Functions

```powershell
cd c:\projects\IDLab\admin\admin-dashboard
firebase deploy --only functions
```

This will deploy:
- ✅ `createApprovalRequest` - Create approval and send email
- ✅ `approveRequest` - Handle email approve link
- ✅ `rejectRequest` - Handle email reject link

### 3. Deploy Admin Dashboard

```powershell
firebase deploy --only hosting:idlab-admin
```

This updates the dashboard with:
- ✅ New "Approvals" tab
- ✅ Real-time badge for pending approvals
- ✅ Approval management interface

### 4. Verify Deployment

```powershell
firebase functions:log
```

Check Firebase Console:
- Functions: https://console.firebase.google.com/project/idlab-d9000/functions
- Should see 3 new functions listed

### 5. Set Up Firestore Security Rules

Add these rules for the `approvals` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Approvals collection
    match /approvals/{approvalId} {
      // Authenticated users can create approvals
      allow create: if request.auth != null;
      
      // Only admins can read, update, delete
      allow read, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ... your existing rules ...
  }
}
```

Deploy rules:
```powershell
firebase deploy --only firestore:rules
```

## 🧪 Test Deployment

### Test 1: Create Approval via Console

1. Open: https://idlab-admin.web.app
2. Open browser console (F12)
3. Run:

```javascript
const functions = firebase.functions();
const createApproval = functions.httpsCallable('createApprovalRequest');

createApproval({
  requester_email: 'test@example.com',
  requester_name: 'Test User',
  approver_email: 'contact@idlab.studio',
  type: 'license_extension',
  details: {
    license_key: 'TEST-1234',
    reason: 'Testing approval system'
  }
}).then(result => {
  console.log('✅ Success:', result.data);
  alert('Approval request created! Check email.');
}).catch(error => {
  console.error('❌ Error:', error);
  alert('Error: ' + error.message);
});
```

### Test 2: Check Email

1. Open approver email inbox (contact@idlab.studio)
2. Look for email: "Action Required: LICENSE_EXTENSION Request from Test User"
3. Click "APPROVE REQUEST" button
4. Should open success page

### Test 3: Check Dashboard

1. Go to: https://idlab-admin.web.app
2. Login as admin
3. Click "Approvals" tab
4. Should see:
   - Badge with count
   - List of approval requests
   - Ability to approve/reject

## 📊 Verify Components

### Cloud Functions
```powershell
firebase functions:list
```

Should show:
```
createApprovalRequest (https trigger, callable)
approveRequest (https trigger)
rejectRequest (https trigger)
sendLicenseEmail (firestore trigger)
resendLicenseEmail (callable)
```

### Firestore Collections

Check in Firebase Console:
- `approvals` - Should have test document

### Email Configuration

Verify Zoho SMTP is working:
```powershell
firebase functions:config:get
```

Should show:
```json
{
  "email": {
    "user": "contact@idlab.studio",
    "pass": "***"
  }
}
```

## 🔍 Monitoring

### View Function Logs

```powershell
# All functions
firebase functions:log

# Specific function
firebase functions:log --only createApprovalRequest

# Follow live logs
firebase functions:log --tail
```

### Check Metrics

Firebase Console → Functions → Select function → Metrics

Monitor:
- Invocations (how many times called)
- Execution time
- Memory usage
- Errors

### Common Log Messages

**Success:**
```
Approval request created: abc123xyz
Email sent to: admin@idlab.studio
Approval request approved: abc123xyz
```

**Errors:**
```
Error creating approval request: [error details]
Error approving request: [error details]
Invalid token
Request expired
```

## 🐛 Troubleshooting

### Function Not Found

**Error:** `Function not found`

**Solution:**
```powershell
firebase deploy --only functions
```

### Email Not Sending

**Error:** `Error sending email`

**Solutions:**
1. Check Zoho credentials:
   ```powershell
   firebase functions:config:get
   ```

2. Verify SMTP settings in `functions/index.js`

3. Check function logs:
   ```powershell
   firebase functions:log --only createApprovalRequest
   ```

### Token Validation Fails

**Error:** `Invalid or expired security token`

**Causes:**
- Token already used (one-time use)
- Request expired (>7 days old)
- Token mismatch

**Solution:**
- Create new approval request
- Check token hash algorithm matches

### Dashboard Not Updating

**Error:** Badge not showing, table empty

**Solutions:**
1. Check browser console for errors (F12)
2. Verify approvals.js is loaded
3. Check Firestore rules allow reading
4. Refresh page (Ctrl+F5)

### Permission Denied

**Error:** `Missing or insufficient permissions`

**Solution:**
Update Firestore rules to allow admin access:
```javascript
match /approvals/{approvalId} {
  allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == 'admin';
}
```

## ✅ Deployment Checklist

- [ ] Functions deployed successfully
- [ ] Dashboard deployed successfully  
- [ ] Firestore rules updated
- [ ] Test approval request created
- [ ] Email received with action buttons
- [ ] Email approve link works
- [ ] Email reject link works
- [ ] Dashboard shows approvals
- [ ] Badge updates in real-time
- [ ] Manual approve works
- [ ] Manual reject works
- [ ] Confirmation emails send
- [ ] Function logs show no errors

## 🎯 URLs to Save

**Admin Dashboard:**
https://idlab-admin.web.app

**Cloud Functions:**
- Create Approval: `https://us-central1-idlab-d9000.cloudfunctions.net/createApprovalRequest`
- Approve: `https://us-central1-idlab-d9000.cloudfunctions.net/approveRequest?id={ID}&token={TOKEN}`
- Reject: `https://us-central1-idlab-d9000.cloudfunctions.net/rejectRequest?id={ID}&token={TOKEN}`

**Firebase Console:**
- Functions: https://console.firebase.google.com/project/idlab-d9000/functions
- Firestore: https://console.firebase.google.com/project/idlab-d9000/firestore
- Hosting: https://console.firebase.google.com/project/idlab-d9000/hosting

## 📞 Support

If you encounter issues:

1. Check function logs: `firebase functions:log`
2. Verify deployment: `firebase functions:list`
3. Test locally: `firebase emulators:start`
4. Check Firestore data in console

---

**Status:** Ready to deploy! 🚀  
**Compatibility:** Works alongside existing payment system  
**Breaking Changes:** None
