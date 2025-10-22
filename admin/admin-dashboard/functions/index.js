const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

admin.initializeApp();

/**
 * IDLab Email License System
 * ===========================
 * 
 * WORKFLOW:
 * 1. Admin approves payment in dashboard (web UI)
 * 2. Payment status changes from "pending" to "approved" in Firestore
 * 3. License is created with unique key
 * 4. Cloud Function "sendLicenseEmail" automatically triggers
 * 5. Function generates PDF receipt with license details
 * 6. Email sent to user with license key and PDF attachment
 * 7. Payment record updated with email_sent status
 * 
 * COMPONENTS:
 * - sendLicenseEmail: Automatic trigger on payment approval
 * - resendLicenseEmail: Manual callable function for resending
 * - generatePDFReceipt: Creates branded PDF receipt
 * - Email transporter: Nodemailer configured for Zoho SMTP
 * 
 * CONFIGURATION REQUIRED:
 * firebase functions:config:set email.user="contact@idlab.studio" email.pass="ne29ctBqX5Hg"
 */

// Configure email transporter for Zoho Mail
// Using Zoho SMTP with SSL on port 465
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: functions.config().email?.user || process.env.EMAIL_USER || 'contact@idlab.studio',
    pass: functions.config().email?.pass || process.env.EMAIL_PASS || 'ne29ctBqX5Hg'
  }
});

// Generate PDF receipt
function generatePDFReceipt(payment, licenseKey) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Header with branding
    doc.fontSize(28)
       .fillColor('#1bc098')
       .text('IDLab', { align: 'center' })
       .moveDown(0.3);

    doc.fontSize(20)
       .fillColor('#2c3e50')
       .text('License Receipt', { align: 'center' })
       .moveDown(2);

    // Receipt details
    doc.fontSize(12)
       .fillColor('#7f8c8d')
       .text(`Receipt Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
       .text(`Transaction ID: ${payment.id}`, { align: 'right' })
       .moveDown(2);

    // Customer Information
    doc.fontSize(14)
       .fillColor('#2c3e50')
       .text('Customer Information', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11)
       .fillColor('#2c3e50')
       .text(`Name: ${payment.full_name || payment.name || 'N/A'}`)
       .text(`Email: ${payment.email}`)
       .text(`Phone: ${payment.phone || 'N/A'}`)
       .text(`Organization: ${payment.school || payment.business_name || 'N/A'}`)
       .moveDown(2);

    // License Information
    doc.fontSize(14)
       .fillColor('#2c3e50')
       .text('License Information', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11)
       .text(`Package Type: ${payment.package_type}`)
       .text(`Duration: ${payment.duration_months || payment.duration || 12} months`)
       .moveDown(1);

    // License Key (highlighted)
    doc.fontSize(12)
       .fillColor('#1bc098')
       .text('Your License Key:', { continued: false })
       .fontSize(16)
       .font('Courier-Bold')
       .fillColor('#16a085')
       .text(licenseKey, { align: 'center' })
       .font('Helvetica')
       .moveDown(2);

    // Payment Information
    doc.fontSize(14)
       .fillColor('#2c3e50')
       .text('Payment Information', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11)
       .text(`Amount Paid: ${formatCurrency(payment.amount)}`)
       .text(`Payment Method: ${payment.payment_method || 'N/A'}`)
       .text(`Payment Status: Approved`)
       .moveDown(2);

    // Footer
    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text('Thank you for choosing IDLab!', { align: 'center' })
       .moveDown(0.5)
       .fontSize(9)
       .text('For support, please contact us at contact@idlab.studio', { align: 'center' })
       .text('Visit us at https://idlab-d9000.web.app', { align: 'center' });

    // Draw a border
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke('#1bc098');

    doc.end();
  });
}

// Helper function to format currency
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `K${num.toFixed(2)}`;
}

// Cloud Function: Send email when payment is approved
exports.sendLicenseEmail = functions.firestore
  .document('payments/{paymentId}')
  .onUpdate(async (change, context) => {
    const paymentId = context.params.paymentId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status changed from pending to approved
    if (beforeData.status !== 'approved' && afterData.status === 'approved') {
      try {
        // Get the associated license
        const licensesSnapshot = await admin.firestore()
          .collection('licenses')
          .where('payment_id', '==', paymentId)
          .limit(1)
          .get();

        if (licensesSnapshot.empty) {
          console.error('No license found for payment:', paymentId);
          return null;
        }

        const licenseDoc = licensesSnapshot.docs[0];
        const license = licenseDoc.data();
        const licenseKey = license.key;

        // Generate PDF receipt
        const pdfBuffer = await generatePDFReceipt({
          id: paymentId,
          ...afterData
        }, licenseKey);

        // Prepare email
        const mailOptions = {
          from: 'IDLab Support <contact@idlab.studio>',
          to: afterData.email,
          subject: 'IDLab License Approved - Your License Key Inside',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #2c3e50;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #1bc098 0%, #17b393 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                }
                .content {
                  background: #f8f9fa;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .license-box {
                  background: white;
                  border: 3px solid #1bc098;
                  border-radius: 10px;
                  padding: 20px;
                  margin: 20px 0;
                  text-align: center;
                }
                .license-key {
                  font-family: 'Courier New', monospace;
                  font-size: 24px;
                  font-weight: bold;
                  color: #1bc098;
                  letter-spacing: 2px;
                  margin: 15px 0;
                }
                .info-box {
                  background: white;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #e0e0e0;
                }
                .info-row:last-child {
                  border-bottom: none;
                }
                .info-label {
                  font-weight: bold;
                  color: #7f8c8d;
                }
                .info-value {
                  color: #2c3e50;
                }
                .button {
                  display: inline-block;
                  background: #1bc098;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #e0e0e0;
                  color: #7f8c8d;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🎉 Payment Approved!</h1>
                <p>Your IDLab license is ready</p>
              </div>
              
              <div class="content">
                <h2>Hello ${afterData.full_name || afterData.name || 'Valued Customer'},</h2>
                
                <p>Great news! Your payment has been approved and your IDLab license has been generated.</p>
                
                <div class="license-box">
                  <p style="margin: 0; color: #7f8c8d;">Your License Key:</p>
                  <div class="license-key">${licenseKey}</div>
                  <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Please keep this key safe</p>
                </div>
                
                <div class="info-box">
                  <h3 style="margin-top: 0;">License Details</h3>
                  <div class="info-row">
                    <span class="info-label">Package Type:</span>
                    <span class="info-value">${afterData.package_type}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Duration:</span>
                    <span class="info-value">${afterData.duration_months || afterData.duration || 12} months</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Amount Paid:</span>
                    <span class="info-value">${formatCurrency(afterData.amount)}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Transaction ID:</span>
                    <span class="info-value">${paymentId}</span>
                  </div>
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ol>
                  <li>Download and install IDLab from our website</li>
                  <li>Launch the application</li>
                  <li>Enter your license key when prompted</li>
                  <li>Start using IDLab!</li>
                </ol>
                
                <div style="text-align: center;">
                  <a href="https://idlab-d9000.web.app/download.html" class="button">Download IDLab</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #7f8c8d;">
                  <strong>Note:</strong> Your detailed receipt is attached to this email as a PDF document.
                  Please keep it for your records.
                </p>
              </div>
              
              <div class="footer">
                <p><strong>Need Help?</strong></p>
                <p>Contact us at <a href="mailto:contact@idlab.studio" style="color: #1bc098;">contact@idlab.studio</a></p>
                <p>Visit us at <a href="https://idlab-d9000.web.app" style="color: #1bc098;">https://idlab-d9000.web.app</a></p>
                <p style="margin-top: 20px;">© ${new Date().getFullYear()} IDLab. All rights reserved.</p>
              </div>
            </body>
            </html>
          `,
          attachments: [
            {
              filename: `IDLab-Receipt-${paymentId}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Update payment record with email sent status
        await admin.firestore()
          .collection('payments')
          .doc(paymentId)
          .update({
            email_sent: true,
            email_sent_at: admin.firestore.FieldValue.serverTimestamp()
          });

        console.log('License email sent successfully to:', afterData.email);
        return null;

      } catch (error) {
        console.error('Error sending license email:', error);
        
        // Log error to Firestore for admin visibility
        await admin.firestore()
          .collection('email_errors')
          .add({
            payment_id: paymentId,
            email: afterData.email,
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        
        return null;
      }
    }

    return null;
  });

// Cloud Function: Manual email resend (callable function)
exports.resendLicenseEmail = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { paymentId } = data;

  if (!paymentId) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment ID is required');
  }

  try {
    // Get payment data
    const paymentDoc = await admin.firestore()
      .collection('payments')
      .doc(paymentId)
      .get();

    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const payment = paymentDoc.data();

    if (payment.status !== 'approved') {
      throw new functions.https.HttpsError('failed-precondition', 'Payment must be approved');
    }

    // Get associated license
    const licensesSnapshot = await admin.firestore()
      .collection('licenses')
      .where('payment_id', '==', paymentId)
      .limit(1)
      .get();

    if (licensesSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'License not found');
    }

    const license = licensesSnapshot.docs[0].data();
    const licenseKey = license.key;

    // Generate PDF and send email (reuse the same logic)
    const pdfBuffer = await generatePDFReceipt({
      id: paymentId,
      ...payment
    }, licenseKey);

    const mailOptions = {
      from: 'IDLab Support <contact@idlab.studio>',
      to: payment.email,
      subject: 'IDLab License Key - Resent as Requested',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #2c3e50;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1bc098 0%, #17b393 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .license-key {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              font-weight: bold;
              color: #1bc098;
              text-align: center;
              padding: 20px;
              background: white;
              border: 2px solid #1bc098;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your IDLab License</h1>
          </div>
          <div class="content">
            <p>As requested, here is your IDLab license information:</p>
            <div class="license-key">${licenseKey}</div>
            <p>Please check the attached PDF for complete details including your receipt.</p>
            <p style="margin-top: 30px; color: #7f8c8d;">
              Need help? Contact us at <a href="mailto:contact@idlab.studio" style="color: #1bc098;">contact@idlab.studio</a>
            </p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `IDLab-Receipt-${paymentId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: 'Email resent successfully' };

  } catch (error) {
    console.error('Error resending email:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// APPROVAL WORKFLOW SYSTEM
// ============================================================================

const crypto = require('crypto');

/**
 * Create Approval Request
 * 
 * Creates a new approval request and sends email to approver with action links.
 * 
 * Usage:
 *   const createApproval = firebase.functions().httpsCallable('createApprovalRequest');
 *   createApproval({ requester_email, approver_email, type, details })
 */
exports.createApprovalRequest = functions.https.onCall(async (data, context) => {
  // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to create approval request');
  }

  const {
    requester_email,
    requester_name,
    approver_email,
    approver_name,
    type,
    details
  } = data;

  // Validate required fields
  if (!requester_email || !approver_email || !type) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create approval document
    const approvalRef = await admin.firestore().collection('approvals').add({
      requester_id: context.auth.uid,
      requester_email: requester_email,
      requester_name: requester_name || 'User',
      approver_email: approver_email,
      approver_name: approver_name || 'Admin',
      type: type,
      status: 'pending',
      token: hashedToken,
      details: details || {},
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
      email_sent: false,
      approved_at: null,
      approved_by: null,
      rejected_at: null,
      rejection_reason: null
    });

    const approvalId = approvalRef.id;

    // Generate approval and reject URLs
    const baseUrl = 'https://us-central1-idlab-d9000.cloudfunctions.net';
    const approveUrl = `${baseUrl}/approveRequest?id=${approvalId}&token=${token}`;
    const rejectUrl = `${baseUrl}/rejectRequest?id=${approvalId}&token=${token}`;

    // Send approval request email
    const mailOptions = {
      from: 'IDLab Support <contact@idlab.studio>',
      to: approver_email,
      subject: `Action Required: ${type.replace(/_/g, ' ').toUpperCase()} Request from ${requester_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #2c3e50; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1bc098 0%, #17b393 100%); 
                     color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f8f9fa; padding: 30px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; 
                       border-left: 4px solid #1bc098; border-radius: 8px; }
            .info-row { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #7f8c8d; }
            .value { color: #2c3e50; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 15px 40px; margin: 10px; 
                     text-decoration: none; border-radius: 8px; font-weight: bold; 
                     font-size: 16px; transition: all 0.3s; }
            .approve-btn { background: #1bc098; color: white; }
            .approve-btn:hover { background: #16a085; transform: translateY(-2px); }
            .reject-btn { background: #e74c3c; color: white; }
            .reject-btn:hover { background: #c0392b; transform: translateY(-2px); }
            .footer { padding: 20px; text-align: center; color: #7f8c8d; font-size: 12px; }
            .expiry { background: #fff3cd; padding: 15px; border-radius: 8px; 
                     margin: 20px 0; text-align: center; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 IDLab - Approval Required</h1>
            </div>
            <div class="content">
              <p>Dear ${approver_name || 'Admin'},</p>
              
              <p><strong>${requester_name}</strong> has submitted a request that requires your approval:</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Request Type:</span>
                  <span class="value">${type.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="label">Requester:</span>
                  <span class="value">${requester_name} (${requester_email})</span>
                </div>
                <div class="info-row">
                  <span class="label">Submitted:</span>
                  <span class="value">${new Date().toLocaleString()}</span>
                </div>
                ${Object.keys(details || {}).map(key => `
                  <div class="info-row">
                    <span class="label">${key.replace(/_/g, ' ')}:</span>
                    <span class="value">${details[key]}</span>
                  </div>
                `).join('')}
              </div>
              
              <p style="font-size: 16px; font-weight: bold; text-align: center; margin: 30px 0 20px;">
                Please review and take action:
              </p>
              
              <div class="button-container">
                <a href="${approveUrl}" class="button approve-btn">✅ APPROVE REQUEST</a>
                <a href="${rejectUrl}" class="button reject-btn">❌ REJECT REQUEST</a>
              </div>
              
              <div class="expiry">
                ⏰ This request will expire on <strong>${expiresAt.toLocaleDateString()}</strong>
                <br>If no action is taken, it will be automatically rejected.
              </div>
              
              <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">
                Alternatively, you can review this request in the admin dashboard at 
                <a href="https://idlab-admin.web.app" style="color: #1bc098;">idlab-admin.web.app</a>
              </p>
            </div>
            <div class="footer">
              <p>IDLab - Professional ID Card Solutions</p>
              <p>Contact: <a href="mailto:contact@idlab.studio" style="color: #1bc098;">contact@idlab.studio</a></p>
              <p>Website: <a href="https://idlab-d9000.web.app" style="color: #1bc098;">idlab-d9000.web.app</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update email sent status
    await approvalRef.update({
      email_sent: true,
      email_sent_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Approval request created:', approvalId);
    return { 
      success: true, 
      approval_id: approvalId,
      message: 'Approval request created and email sent successfully'
    };

  } catch (error) {
    console.error('Error creating approval request:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Approve Request (HTTP Endpoint)
 * 
 * Handles approval link clicks from email.
 * Validates token and updates approval status.
 */
exports.approveRequest = functions.https.onRequest(async (req, res) => {
  const approvalId = req.query.id;
  const token = req.query.token;

  if (!approvalId || !token) {
    return res.status(400).send(generateResponsePage(
      'error',
      'Invalid Request',
      'Missing approval ID or token.'
    ));
  }

  try {
    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Get approval document
    const approvalDoc = await admin.firestore()
      .collection('approvals')
      .doc(approvalId)
      .get();

    if (!approvalDoc.exists) {
      return res.status(404).send(generateResponsePage(
        'error',
        'Not Found',
        'Approval request not found.'
      ));
    }

    const approval = approvalDoc.data();

    // Validate token
    if (approval.token !== hashedToken) {
      return res.status(401).send(generateResponsePage(
        'error',
        'Unauthorized',
        'Invalid or expired security token.'
      ));
    }

    // Check if expired
    const now = new Date();
    const expiresAt = approval.expires_at.toDate();
    if (expiresAt < now) {
      return res.status(410).send(generateResponsePage(
        'error',
        'Request Expired',
        `This approval request expired on ${expiresAt.toLocaleDateString()}.`
      ));
    }

    // Check if already processed
    if (approval.status !== 'pending') {
      return res.status(400).send(generateResponsePage(
        'info',
        'Already Processed',
        `This request has already been ${approval.status}.`
      ));
    }

    // Update status to approved
    await approvalDoc.ref.update({
      status: 'approved',
      approved_at: admin.firestore.FieldValue.serverTimestamp(),
      approved_by: approval.approver_email
    });

    // Send confirmation email to requester
    await sendConfirmationEmail(approval, 'approved');

    console.log('Approval request approved:', approvalId);

    return res.send(generateResponsePage(
      'success',
      'Request Approved! ✅',
      `The ${approval.type.replace(/_/g, ' ')} request has been approved successfully.
       <br><br>A confirmation email has been sent to <strong>${approval.requester_email}</strong>.`
    ));

  } catch (error) {
    console.error('Error approving request:', error);
    return res.status(500).send(generateResponsePage(
      'error',
      'Server Error',
      'An error occurred while processing your request. Please try again or contact support.'
    ));
  }
});

/**
 * Reject Request (HTTP Endpoint)
 * 
 * Handles rejection link clicks from email.
 * Validates token and updates approval status.
 */
exports.rejectRequest = functions.https.onRequest(async (req, res) => {
  const approvalId = req.query.id;
  const token = req.query.token;

  if (!approvalId || !token) {
    return res.status(400).send(generateResponsePage(
      'error',
      'Invalid Request',
      'Missing approval ID or token.'
    ));
  }

  try {
    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Get approval document
    const approvalDoc = await admin.firestore()
      .collection('approvals')
      .doc(approvalId)
      .get();

    if (!approvalDoc.exists) {
      return res.status(404).send(generateResponsePage(
        'error',
        'Not Found',
        'Approval request not found.'
      ));
    }

    const approval = approvalDoc.data();

    // Validate token
    if (approval.token !== hashedToken) {
      return res.status(401).send(generateResponsePage(
        'error',
        'Unauthorized',
        'Invalid or expired security token.'
      ));
    }

    // Check if expired
    const now = new Date();
    const expiresAt = approval.expires_at.toDate();
    if (expiresAt < now) {
      return res.status(410).send(generateResponsePage(
        'error',
        'Request Expired',
        `This approval request expired on ${expiresAt.toLocaleDateString()}.`
      ));
    }

    // Check if already processed
    if (approval.status !== 'pending') {
      return res.status(400).send(generateResponsePage(
        'info',
        'Already Processed',
        `This request has already been ${approval.status}.`
      ));
    }

    // Show rejection reason form
    if (req.method === 'GET') {
      return res.send(generateRejectionForm(approvalId, token));
    }

    // Process rejection (POST)
    if (req.method === 'POST') {
      const reason = req.body.reason || 'No reason provided';

      // Update status to rejected
      await approvalDoc.ref.update({
        status: 'rejected',
        rejected_at: admin.firestore.FieldValue.serverTimestamp(),
        rejected_by: approval.approver_email,
        rejection_reason: reason
      });

      // Send confirmation email to requester
      await sendConfirmationEmail(approval, 'rejected', reason);

      console.log('Approval request rejected:', approvalId);

      return res.send(generateResponsePage(
        'success',
        'Request Rejected',
        `The ${approval.type.replace(/_/g, ' ')} request has been rejected.
         <br><br>A notification has been sent to <strong>${approval.requester_email}</strong>.`
      ));
    }

  } catch (error) {
    console.error('Error rejecting request:', error);
    return res.status(500).send(generateResponsePage(
      'error',
      'Server Error',
      'An error occurred while processing your request. Please try again or contact support.'
    ));
  }
});

// Helper function to send confirmation emails
async function sendConfirmationEmail(approval, status, reason = null) {
  const isApproved = status === 'approved';
  
  const mailOptions = {
    from: 'IDLab Support <contact@idlab.studio>',
    to: approval.requester_email,
    subject: `${isApproved ? '✅ Approved' : '❌ Rejected'}: Your ${approval.type.replace(/_/g, ' ')} Request`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #2c3e50; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: ${isApproved ? '#1bc098' : '#e74c3c'}; 
                   color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f8f9fa; padding: 30px; }
          .status-box { background: white; padding: 25px; margin: 20px 0; 
                       border-radius: 8px; text-align: center; 
                       border: 3px solid ${isApproved ? '#1bc098' : '#e74c3c'}; }
          .status-icon { font-size: 60px; margin-bottom: 15px; }
          .status-text { font-size: 24px; font-weight: bold; 
                        color: ${isApproved ? '#1bc098' : '#e74c3c'}; }
          .info-box { background: white; padding: 20px; margin: 20px 0; 
                     border-radius: 8px; border-left: 4px solid #1bc098; }
          .reason-box { background: #fff3cd; padding: 15px; margin: 20px 0; 
                       border-radius: 8px; border-left: 4px solid #f39c12; }
          .footer { padding: 20px; text-align: center; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅' : '❌'} Request ${isApproved ? 'Approved' : 'Rejected'}</h1>
          </div>
          <div class="content">
            <p>Dear ${approval.requester_name},</p>
            
            <div class="status-box">
              <div class="status-icon">${isApproved ? '✅' : '❌'}</div>
              <div class="status-text">${isApproved ? 'APPROVED' : 'REJECTED'}</div>
            </div>
            
            <p>Your <strong>${approval.type.replace(/_/g, ' ')}</strong> request has been 
            ${isApproved ? 'approved' : 'rejected'}.</p>
            
            <div class="info-box">
              <p><strong>Request Details:</strong></p>
              <p>Type: ${approval.type.replace(/_/g, ' ')}</p>
              <p>Submitted: ${approval.created_at ? new Date(approval.created_at.toMillis()).toLocaleString() : 'N/A'}</p>
              <p>${isApproved ? 'Approved' : 'Rejected'} by: ${approval.approver_email}</p>
            </div>
            
            ${!isApproved && reason ? `
              <div class="reason-box">
                <p><strong>Reason for Rejection:</strong></p>
                <p>${reason}</p>
              </div>
            ` : ''}
            
            ${isApproved ? `
              <p style="color: #1bc098; font-weight: bold; text-align: center; margin: 20px 0;">
                🎉 Your request has been processed successfully!
              </p>
            ` : `
              <p style="color: #7f8c8d; text-align: center; margin: 20px 0;">
                If you have questions, please contact our support team.
              </p>
            `}
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="https://idlab-d9000.web.app" 
                 style="background: #1bc098; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;">
                Visit IDLab
              </a>
            </p>
          </div>
          <div class="footer">
            <p>IDLab - Professional ID Card Solutions</p>
            <p>Contact: <a href="mailto:contact@idlab.studio" style="color: #1bc098;">contact@idlab.studio</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Helper function to generate HTML response pages
function generateResponsePage(type, title, message) {
  const colors = {
    success: { bg: '#1bc098', icon: '✅' },
    error: { bg: '#e74c3c', icon: '❌' },
    info: { bg: '#3498db', icon: 'ℹ️' }
  };
  
  const color = colors[type] || colors.info;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - IDLab</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: scaleIn 0.5s ease-out;
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        h1 {
          color: ${color.bg};
          margin-bottom: 15px;
          font-size: 28px;
        }
        p {
          color: #555;
          line-height: 1.6;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .button {
          background: ${color.bg};
          color: white;
          padding: 14px 30px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
          transition: all 0.3s;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">${color.icon}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="https://idlab-d9000.web.app" class="button">Return to IDLab</a>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// APPROVAL STATUS CHANGE LISTENER
// ============================================================================

/**
 * Send Approval Notification Email
 * 
 * Automatically sends email when approval status changes from pending to approved/rejected
 * This handles manual approvals/rejections from the admin dashboard
 */
exports.sendApprovalNotification = functions.firestore
  .document('approvals/{approvalId}')
  .onUpdate(async (change, context) => {
    const approvalId = context.params.approvalId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status changed from pending to approved or rejected
    if (beforeData.status === 'pending' && 
        (afterData.status === 'approved' || afterData.status === 'rejected')) {
      
      try {
        // Check if we've already sent an email for this status change
        // (to prevent duplicate emails if function runs multiple times)
        if (afterData.notification_email_sent) {
          console.log('Notification email already sent for approval:', approvalId);
          return null;
        }

        const isApproved = afterData.status === 'approved';
        const reason = afterData.rejection_reason || null;

        console.log(`Sending ${isApproved ? 'approval' : 'rejection'} notification for:`, approvalId);

        // Send confirmation email using the existing helper function
        await sendConfirmationEmail(afterData, afterData.status, reason);

        // Update the approval document to mark email as sent
        await change.after.ref.update({
          notification_email_sent: true,
          notification_email_sent_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Approval notification email sent successfully to:', afterData.requester_email);
        return null;

      } catch (error) {
        console.error('Error sending approval notification email:', error);
        
        // Log error to Firestore for admin visibility
        await admin.firestore()
          .collection('email_errors')
          .add({
            approval_id: approvalId,
            email: afterData.requester_email,
            error: error.message,
            type: 'approval_notification',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        
        return null;
      }
    }

    return null;
  });

// Helper function to generate rejection form
function generateRejectionForm(approvalId, token) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reject Request - IDLab</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
        }
        h1 {
          color: #e74c3c;
          margin-bottom: 15px;
          text-align: center;
        }
        p {
          color: #555;
          margin-bottom: 20px;
          text-align: center;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
        }
        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          font-family: Arial, sans-serif;
          resize: vertical;
          min-height: 100px;
        }
        textarea:focus {
          outline: none;
          border-color: #e74c3c;
        }
        .buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        button {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        .reject-btn {
          background: #e74c3c;
          color: white;
        }
        .reject-btn:hover {
          background: #c0392b;
          transform: translateY(-2px);
        }
        .cancel-btn {
          background: #95a5a6;
          color: white;
        }
        .cancel-btn:hover {
          background: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>❌ Reject Request</h1>
        <p>Please provide a reason for rejecting this request:</p>
        <form method="POST">
          <label for="reason">Rejection Reason:</label>
          <textarea 
            id="reason" 
            name="reason" 
            placeholder="Enter the reason for rejection..."
            required
          ></textarea>
          <div class="buttons">
            <button type="button" class="cancel-btn" onclick="history.back()">Cancel</button>
            <button type="submit" class="reject-btn">Reject Request</button>
          </div>
        </form>
      </div>
    </body>
    </html>
  `;
}
