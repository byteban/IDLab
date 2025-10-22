# 🔄 Approval Workflow System - Integration Guide

## Overview

This document outlines the integration of the **old Tkinter/FastAPI approval workflow** with your existing **payment-based licensing system**. Both systems will coexist, serving different use cases.

---

## 🎯 Two Systems Working Together

### System 1: Payment-Based Licensing (Current)
**Use Case**: Direct payment → License generation  
**Collection**: `payments`  
**Flow**: User pays → Admin approves → License generated → Email sent

```
User Submits Payment
        ↓
Firebase: "payments" collection
        ↓
Admin Dashboard: Approves via UI
        ↓
Cloud Function: Auto-triggers
        ↓
Email: License key + PDF receipt
```

### System 2: Approval Workflow (New/Old Logic)
**Use Case**: Request-based approvals requiring authorization  
**Collection**: `approvals`  
**Flow**: User requests → Email sent to approver → Approver clicks link → Status updated

```
User/System Creates Request
        ↓
Firebase: "approvals" collection
        ↓
Cloud Function: Sends email to approver
        ↓
Email: Contains approve/reject links
        ↓
Approver Clicks Link
        ↓
API Endpoint: Validates token + Updates status
        ↓
Email: Confirmation to requester
        ↓
Dashboard: Real-time update
```

---

## 📋 Use Cases for Approval Workflow

1. **License Extension Requests**: User requests license renewal before expiry
2. **Feature Access Requests**: User requests premium features
3. **Template Approval**: Designer submits custom template for review
4. **Refund Requests**: User requests refund (admin approves/rejects)
5. **Account Upgrades**: User requests account tier upgrade
6. **Data Export Requests**: User requests data export (requires approval)

---

## 🗄️ Database Structure

### Collection: `approvals`

```javascript
{
  "id": "auto-generated",
  "requester_id": "firebase_user_uid",
  "requester_email": "user@example.com",
  "requester_name": "John Doe",
  "approver_email": "admin@idlab.studio", // Who should approve
  "approver_name": "Admin Name", // Optional
  "type": "license_extension", // Type of request
  "status": "pending", // pending | approved | rejected | expired
  "token": "hashed_secure_token", // For email link authentication
  "details": {
    // Request-specific data
    "license_key": "ABCD-1234-EFGH-5678",
    "reason": "Need extension for ongoing project",
    "custom_field": "any data"
  },
  "created_at": Timestamp,
  "expires_at": Timestamp, // Request expires after X days
  "approved_at": Timestamp | null,
  "approved_by": "approver@email.com" | null,
  "rejected_at": Timestamp | null,
  "rejection_reason": "reason text" | null,
  "email_sent": true,
  "email_sent_at": Timestamp
}
```

### Collection: `approval_templates`

```javascript
{
  "id": "license_extension_request",
  "name": "License Extension Request",
  "subject": "Action Required: License Extension Request from {{requester_name}}",
  "html_body": "<p>Dear {{approver_name}},</p>...",
  "variables": ["requester_name", "approver_name", "approval_link", "reject_link"],
  "active": true,
  "created_at": Timestamp,
  "updated_at": Timestamp
}
```

---

## 🔧 Cloud Functions (New)

### Function 1: `createApprovalRequest`

**Trigger**: HTTPS Callable  
**Purpose**: Create approval request and send email  

```javascript
exports.createApprovalRequest = functions.https.onCall(async (data, context) => {
  // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const {
    requester_email,
    requester_name,
    approver_email,
    type,
    details
  } = data;

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Create approval document
  const approvalRef = await admin.firestore().collection('approvals').add({
    requester_id: context.auth.uid,
    requester_email,
    requester_name,
    approver_email,
    type,
    status: 'pending',
    token: hashedToken,
    details,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    expires_at: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    ),
    email_sent: false
  });

  // Generate approval and reject URLs
  const approvalId = approvalRef.id;
  const approveUrl = `https://your-app.com/api/approve/${approvalId}?token=${token}`;
  const rejectUrl = `https://your-app.com/api/reject/${approvalId}?token=${token}`;

  // Send email to approver
  await sendApprovalEmail(approver_email, {
    requester_name,
    type,
    details,
    approve_url: approveUrl,
    reject_url: rejectUrl
  });

  // Update email sent status
  await approvalRef.update({
    email_sent: true,
    email_sent_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, approval_id: approvalId };
});
```

### Function 2: `approveRequest`

**Trigger**: HTTPS Request  
**Purpose**: Handle approval link clicks  

```javascript
exports.approveRequest = functions.https.onRequest(async (req, res) => {
  const { approvalId } = req.params;
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Token required');
  }

  // Hash the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Get approval document
  const approvalDoc = await admin.firestore()
    .collection('approvals')
    .doc(approvalId)
    .get();

  if (!approvalDoc.exists) {
    return res.status(404).send('Approval request not found');
  }

  const approval = approvalDoc.data();

  // Validate token
  if (approval.token !== hashedToken) {
    return res.status(401).send('Invalid token');
  }

  // Check if expired
  if (approval.expires_at.toDate() < new Date()) {
    return res.status(410).send('Approval request expired');
  }

  // Check if already processed
  if (approval.status !== 'pending') {
    return res.status(400).send(`Request already ${approval.status}`);
  }

  // Update status
  await approvalDoc.ref.update({
    status: 'approved',
    approved_at: admin.firestore.FieldValue.serverTimestamp(),
    approved_by: approval.approver_email
  });

  // Send confirmation email to requester
  await sendConfirmationEmail(approval.requester_email, {
    requester_name: approval.requester_name,
    type: approval.type,
    status: 'approved'
  });

  // Return success page
  res.send(`
    <html>
      <head><title>Request Approved</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #1bc098;">✅ Request Approved</h1>
        <p>The ${approval.type} request has been approved successfully.</p>
        <p>A confirmation email has been sent to ${approval.requester_email}</p>
      </body>
    </html>
  `);
});
```

### Function 3: `rejectRequest`

**Trigger**: HTTPS Request  
**Purpose**: Handle rejection link clicks  

```javascript
exports.rejectRequest = functions.https.onRequest(async (req, res) => {
  // Similar logic to approveRequest but updates status to 'rejected'
  // Optionally shows a form to collect rejection reason
});
```

---

## 📧 Email Templates

### Approval Request Email

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #2c3e50; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1bc098; color: white; padding: 20px; text-align: center; }
    .content { background: #f8f9fa; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; margin: 10px; 
              text-decoration: none; border-radius: 5px; font-weight: bold; }
    .approve-btn { background: #1bc098; color: white; }
    .reject-btn { background: #e74c3c; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>IDLab - Approval Required</h1>
    </div>
    <div class="content">
      <p>Dear {{approver_name}},</p>
      
      <p><strong>{{requester_name}}</strong> has submitted a request that requires your approval:</p>
      
      <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #1bc098;">
        <p><strong>Request Type:</strong> {{request_type}}</p>
        <p><strong>Details:</strong> {{request_details}}</p>
        <p><strong>Submitted:</strong> {{submitted_date}}</p>
      </div>
      
      <p>Please review and take action:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{approve_link}}" class="button approve-btn">✅ Approve Request</a>
        <a href="{{reject_link}}" class="button reject-btn">❌ Reject Request</a>
      </div>
      
      <p style="color: #7f8c8d; font-size: 12px;">
        This request will expire on {{expiry_date}}. If no action is taken, 
        it will be automatically rejected.
      </p>
      
      <p style="color: #7f8c8d; font-size: 12px;">
        Alternatively, you can review this request in the admin dashboard at 
        <a href="https://idlab-admin.web.app">idlab-admin.web.app</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🎨 Dashboard Integration

### New Tab: "Approvals"

Add to `index.html`:

```html
<div class="tab-button" onclick="switchTab('approvals')">
    <i class="fas fa-check-circle"></i>
    <span>Approvals</span>
    <span id="pending-approvals-badge" class="badge">0</span>
</div>
```

### Approvals Table

```javascript
async function loadApprovals() {
    const container = document.getElementById('approvals-container');
    const statusFilter = document.getElementById('approval-status-filter').value;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading approvals...</p></div>';
    
    try {
        let query = db.collection('approvals');
        
        if (statusFilter !== 'all') {
            query = query.where('status', '==', statusFilter);
        }
        
        const snapshot = await query.orderBy('created_at', 'desc').get();
        
        // Render table with approve/reject actions
        // Show real-time updates via Firestore listeners
    } catch (error) {
        console.error('Error loading approvals:', error);
    }
}

// Real-time listener for pending approvals
db.collection('approvals')
  .where('status', '==', 'pending')
  .onSnapshot((snapshot) => {
    const count = snapshot.size;
    document.getElementById('pending-approvals-badge').textContent = count;
    
    // Show notification for new approvals
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        showNotification('New approval request received!');
      }
    });
  });
```

---

## 🔒 Security Features

1. **Token-Based Authentication**: Secure tokens in URLs prevent unauthorized access
2. **Token Expiration**: Approval links expire after 7 days
3. **One-Time Use**: Token invalidated after approval/rejection
4. **Rate Limiting**: Prevent email spam and abuse
5. **Admin Access Control**: Dashboard requires admin authentication
6. **Audit Logging**: All actions logged with timestamps and user info

---

## 📊 Analytics Integration

Track approval workflow metrics:

- **Average Approval Time**: Time from request to approval
- **Approval Rate**: % of requests approved vs rejected
- **Bottleneck Identification**: Which approvers are slow
- **Request Volume by Type**: Most common request types
- **Expiry Rate**: % of requests that expire without action

---

## 🚀 Implementation Steps

1. ✅ Deploy new Cloud Functions for approval workflow
2. ✅ Add Firestore security rules for `approvals` collection
3. ✅ Create email templates in Firestore
4. ✅ Add "Approvals" tab to dashboard
5. ✅ Implement real-time listeners for notifications
6. ✅ Add analytics tracking for approval metrics
7. ✅ Test with sample approval requests

---

## 🧪 Testing the System

### Create Test Approval Request

```javascript
// From Firebase Console or client app
const functions = firebase.functions();
const createApproval = functions.httpsCallable('createApprovalRequest');

createApproval({
  requester_email: 'user@example.com',
  requester_name: 'Test User',
  approver_email: 'admin@idlab.studio',
  type: 'license_extension',
  details: {
    license_key: 'TEST-1234-ABCD-5678',
    reason: 'Testing approval workflow'
  }
}).then((result) => {
  console.log('Approval request created:', result.data);
});
```

---

## 📞 Support & Documentation

- **Admin Dashboard**: https://idlab-admin.web.app
- **API Documentation**: See `APPROVAL_API.md`
- **Email Support**: contact@idlab.studio

---

**Status**: Ready for implementation ✅  
**Systems**: Payment-based + Approval workflow (dual system)  
**Benefits**: Flexibility for different use cases
