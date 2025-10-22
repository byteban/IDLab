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
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(num);
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
