# Test Approval Workflow System

This document shows how to test the approval workflow system.

## 1. Create Test Approval Request

You can create test approval requests from the browser console or integrate into your app.

### From Browser Console (Firebase Console or Admin Dashboard)

```javascript
// Make sure you're authenticated first
const functions = firebase.functions();
const createApproval = functions.httpsCallable('createApprovalRequest');

// Test 1: License Extension Request
createApproval({
  requester_email: 'testuser@example.com',
  requester_name: 'John Doe',
  approver_email: 'contact@idlab.studio',
  approver_name: 'IDLab Admin',
  type: 'license_extension',
  details: {
    license_key: 'ABCD-1234-EFGH-5678',
    current_expiry: '2025-11-30',
    requested_extension: '6 months',
    reason: 'Need extension for ongoing school project'
  }
}).then((result) => {
  console.log('✅ Approval request created:', result.data);
}).catch((error) => {
  console.error('❌ Error:', error);
});

// Test 2: Refund Request
createApproval({
  requester_email: 'customer@example.com',
  requester_name: 'Jane Smith',
  approver_email: 'contact@idlab.studio',
  approver_name: 'IDLab Admin',
  type: 'refund_request',
  details: {
    payment_id: 'pay_12345',
    amount: 'K500',
    reason: 'Software not compatible with system',
    payment_date: '2025-10-20'
  }
}).then((result) => {
  console.log('✅ Refund request created:', result.data);
}).catch((error) => {
  console.error('❌ Error:', error);
});

// Test 3: Feature Request
createApproval({
  requester_email: 'poweruser@example.com',
  requester_name: 'Mike Johnson',
  approver_email: 'contact@idlab.studio',
  type: 'feature_request',
  details: {
    feature: 'Bulk ID card printing',
    description: 'Need ability to print 100+ cards at once',
    priority: 'high'
  }
}).then((result) => {
  console.log('✅ Feature request created:', result.data);
});

// Test 4: Custom Template Request
createApproval({
  requester_email: 'designer@school.edu',
  requester_name: 'Sarah Designer',
  approver_email: 'contact@idlab.studio',
  type: 'custom_template',
  details: {
    organization: 'Springfield High School',
    template_type: 'Student ID',
    special_requirements: 'Include QR code and magnetic stripe',
    budget: 'K2000'
  }
}).then((result) => {
  console.log('✅ Template request created:', result.data);
});
```

## 2. Test Email-Based Approval

After creating a test request:

1. Check the approver's email inbox (contact@idlab.studio)
2. Open the approval request email
3. Click either "APPROVE REQUEST" or "REJECT REQUEST" button
4. Verify the response page shows success
5. Check requester's email for confirmation

## 3. Test Dashboard Approval

1. Log into admin dashboard: https://idlab-admin.web.app
2. Click "Approvals" tab
3. You should see:
   - Badge showing number of pending approvals
   - List of all approval requests
   - Filter by status and type
4. Click "View" to see details
5. Click "Approve" or "Reject" to process

## 4. Test Real-Time Updates

1. Open admin dashboard in two browser windows
2. In one window, go to Approvals tab
3. In the other window (or console), create a new approval request
4. First window should:
   - Show notification: "New Approval Request"
   - Update badge count automatically
   - Refresh table with new request

## 5. Test Expiration

Approval requests expire after 7 days. To test:

1. Create approval request
2. In Firestore, manually change `expires_at` to past date
3. Try to approve via email link
4. Should show "Request Expired" error
5. Dashboard should show "Expired" status

## 6. Test Token Security

Try accessing approval endpoint with invalid token:

```
https://us-central1-idlab-d9000.cloudfunctions.net/approveRequest?id=VALID_ID&token=INVALID_TOKEN
```

Should show "Invalid or expired security token" error.

## 7. Integration Examples

### From Your Website Form

```html
<form id="extension-request-form">
  <input type="email" name="email" placeholder="Your email" required>
  <input type="text" name="license_key" placeholder="License key" required>
  <textarea name="reason" placeholder="Reason for extension" required></textarea>
  <button type="submit">Request Extension</button>
</form>

<script>
document.getElementById('extension-request-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const functions = firebase.functions();
  const createApproval = functions.httpsCallable('createApprovalRequest');
  
  try {
    const result = await createApproval({
      requester_email: formData.get('email'),
      requester_name: firebase.auth().currentUser.displayName,
      approver_email: 'contact@idlab.studio',
      type: 'license_extension',
      details: {
        license_key: formData.get('license_key'),
        reason: formData.get('reason')
      }
    });
    
    alert('✅ Extension request submitted! You will receive an email confirmation.');
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
});
</script>
```

### From Python Backend (using Firebase Admin SDK)

```python
from firebase_admin import firestore
import hashlib
import secrets
from datetime import datetime, timedelta

db = firestore.client()

def create_approval_request(requester_email, requester_name, approver_email, 
                           request_type, details):
    # Generate token
    token = secrets.token_hex(32)
    hashed_token = hashlib.sha256(token.encode()).hexdigest()
    
    # Create approval document
    approval_ref = db.collection('approvals').document()
    approval_ref.set({
        'requester_email': requester_email,
        'requester_name': requester_name,
        'approver_email': approver_email,
        'type': request_type,
        'status': 'pending',
        'token': hashed_token,
        'details': details,
        'created_at': firestore.SERVER_TIMESTAMP,
        'expires_at': datetime.now() + timedelta(days=7),
        'email_sent': False
    })
    
    # Cloud Function will automatically send email
    print(f"✅ Approval request created: {approval_ref.id}")
    return approval_ref.id

# Example usage
create_approval_request(
    requester_email='user@example.com',
    requester_name='John Doe',
    approver_email='contact@idlab.studio',
    request_type='license_extension',
    details={
        'license_key': 'ABCD-1234',
        'reason': 'Project extension needed'
    }
)
```

## 8. Monitoring

### Check Cloud Function Logs

```powershell
firebase functions:log
```

Look for:
- "Approval request created: [ID]"
- "Approval request approved: [ID]"
- "Approval request rejected: [ID]"

### Query Firestore

```javascript
// Get all pending approvals
db.collection('approvals')
  .where('status', '==', 'pending')
  .get()
  .then(snapshot => {
    console.log(`${snapshot.size} pending approvals`);
  });

// Get expired approvals
const now = new Date();
db.collection('approvals')
  .where('status', '==', 'pending')
  .where('expires_at', '<', now)
  .get()
  .then(snapshot => {
    console.log(`${snapshot.size} expired approvals`);
  });

// Get approvals by type
db.collection('approvals')
  .where('type', '==', 'license_extension')
  .get()
  .then(snapshot => {
    console.log(`${snapshot.size} license extension requests`);
  });
```

## 9. Expected Results

### Successful Approval Request Creation:
- ✅ Document created in Firestore `approvals` collection
- ✅ Email sent to approver with action buttons
- ✅ Badge in dashboard shows count
- ✅ Returns: `{ success: true, approval_id: "..." }`

### Email Approval:
- ✅ Opens response page with success message
- ✅ Updates Firestore status to "approved"
- ✅ Sends confirmation email to requester
- ✅ Dashboard updates in real-time

### Dashboard Approval:
- ✅ Shows confirmation modal
- ✅ Updates Firestore immediately
- ✅ Reloads table with updated status
- ✅ Badge count decreases

## 10. Troubleshooting

**No email received?**
- Check spam folder
- Verify Zoho SMTP credentials in Firebase config
- Check function logs: `firebase functions:log`

**Badge not updating?**
- Check browser console for errors
- Verify Firestore listeners are active
- Refresh page and check again

**Token validation fails?**
- Tokens are one-time use
- Check if request already processed
- Check if request expired

**Function not deploying?**
- Run: `npm install` in functions directory
- Check for syntax errors: `npm run lint`
- Deploy: `firebase deploy --only functions`

## Success! 🎉

If all tests pass, your approval workflow system is ready for production use!
