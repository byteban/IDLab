# 🚀 Quick Reference - Approval Workflow

## Deploy
```powershell
cd c:\projects\IDLab\admin\admin-dashboard
firebase deploy --only "functions,hosting:idlab-admin"
```

## Create Approval (JavaScript)
```javascript
const functions = firebase.functions();
const createApproval = functions.httpsCallable('createApprovalRequest');

await createApproval({
  requester_email: 'user@example.com',
  requester_name: 'John Doe',
  approver_email: 'contact@idlab.studio',
  type: 'license_extension',
  details: { license_key: 'ABCD-1234', reason: 'Need extension' }
});
```

## URLs
- **Admin Dashboard:** https://idlab-admin.web.app
- **Main Website:** https://idlab-d9000.web.app
- **Approve:** `https://us-central1-idlab-d9000.cloudfunctions.net/approveRequest?id={ID}&token={TOKEN}`
- **Reject:** `https://us-central1-idlab-d9000.cloudfunctions.net/rejectRequest?id={ID}&token={TOKEN}`

## Firestore Collection
```
approvals/
  {approval_id}
    - requester_email
    - requester_name
    - approver_email
    - type
    - status (pending/approved/rejected)
    - token (hashed)
    - details {}
    - created_at
    - expires_at (7 days)
    - email_sent
```

## Request Types
- `license_extension` - License renewal requests
- `feature_request` - Feature access requests
- `refund_request` - Refund requests
- `custom_template` - Custom design requests
- `account_upgrade` - Account tier upgrades

## Check Logs
```powershell
firebase functions:log
```

## Query Approvals
```javascript
// Pending
db.collection('approvals').where('status', '==', 'pending').get()

// Expired
db.collection('approvals')
  .where('expires_at', '<', new Date())
  .where('status', '==', 'pending').get()
```

## Dashboard Features
- ✅ Real-time badge (shows pending count)
- ✅ Filter by status and type
- ✅ View details modal
- ✅ Manual approve/reject
- ✅ Browser notifications
- ✅ Automatic updates

## Security
- ✅ SHA-256 token hashing
- ✅ 7-day expiration
- ✅ One-time use tokens
- ✅ Admin-only access
