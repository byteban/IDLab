// Payment Management Functions

// Confirmation Modal Functions
function showConfirmationModal(title, message, onConfirm, icon = 'fa-check-circle', iconColor = 'var(--primary-green)') {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmation-modal');
        const titleEl = document.getElementById('confirmation-title');
        const messageEl = document.getElementById('confirmation-message');
        const iconEl = document.querySelector('.confirmation-icon i');
        const confirmBtn = document.getElementById('confirmation-confirm-btn');
        const cancelBtn = document.getElementById('confirmation-cancel-btn');
        
        // Set content
        titleEl.textContent = title;
        // Support HTML in message for line breaks
        messageEl.innerHTML = message.replace(/\n/g, '<br>');
        iconEl.className = `fas ${icon}`;
        iconEl.style.color = iconColor;
        
        // Show modal
        modal.classList.add('show');
        
        // Handle confirm
        const handleConfirm = () => {
            modal.classList.remove('show');
            cleanup();
            resolve(true);
            if (onConfirm) onConfirm();
        };
        
        // Handle cancel
        const handleCancel = () => {
            modal.classList.remove('show');
            cleanup();
            resolve(false);
        };
        
        // Cleanup function
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleBackdropClick);
        };
        
        // Close on backdrop click
        const handleBackdropClick = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };
        
        // Attach event listeners
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleBackdropClick);
    });
}

async function loadPayments() {
    const container = document.getElementById('payments-container');
    const statusFilter = document.getElementById('payment-status-filter').value;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading payments...</p></div>';
    
    try {
        // Fetch all payments (no index required)
        const snapshot = await db.collection('payments').get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No payments found</p></div>';
            return;
        }
        
        // Convert to array and filter/sort in JavaScript
        let payments = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            payments.push({
                id: doc.id,
                ...data
            });
        });
        
        // Apply status filter
        if (statusFilter !== 'all') {
            payments = payments.filter(payment => payment.status === statusFilter);
        }
        
        // Sort by submitted_at descending
        payments.sort((a, b) => {
            const dateA = a.submitted_at ? a.submitted_at.toMillis() : 0;
            const dateB = b.submitted_at ? b.submitted_at.toMillis() : 0;
            return dateB - dateA;
        });
        
        if (payments.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No payments found</p></div>';
            return;
        }
        
        // Create table
        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-calendar"></i> Date</th>
                            <th><i class="fas fa-user"></i> Name</th>
                            <th><i class="fas fa-envelope"></i> Email</th>
                            <th><i class="fas fa-building"></i> Organization</th>
                            <th><i class="fas fa-box"></i> Package</th>
                            <th><i class="fas fa-money-bill"></i> Amount</th>
                            <th><i class="fas fa-info-circle"></i> Status</th>
                            <th><i class="fas fa-paper-plane"></i> Email</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        payments.forEach(payment => {
            const organization = payment.school || payment.business_name || 'N/A';
            
            let statusBadge = '';
            if (payment.status === 'approved') {
                statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
            } else if (payment.status === 'rejected') {
                statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
            } else {
                statusBadge = '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>';
            }
            
            let emailStatusBadge = '';
            if (payment.status === 'approved') {
                if (payment.email_sent) {
                    emailStatusBadge = '<span class="status-badge status-active" title="Email sent successfully"><i class="fas fa-check"></i> Sent</span>';
                } else {
                    emailStatusBadge = '<span class="status-badge status-pending" title="Email pending"><i class="fas fa-clock"></i> Pending</span>';
                }
            } else {
                emailStatusBadge = '<span style="color: #7f8c8d;">-</span>';
            }
            
            html += `
                <tr>
                    <td>${formatDate(payment.submitted_at)}</td>
                    <td>${payment.full_name || payment.name || 'N/A'}</td>
                    <td>${payment.email || 'N/A'}</td>
                    <td>${organization}</td>
                    <td>${payment.package_type || 'N/A'}</td>
                    <td><strong>${formatCurrency(payment.amount)}</strong></td>
                    <td>${statusBadge}</td>
                    <td>${emailStatusBadge}</td>
                    <td>
                        <button class="btn btn-view" onclick="viewPaymentDetails('${payment.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${payment.status === 'pending' ? `
                            <button class="btn btn-approve" onclick="approvePayment('${payment.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-reject" onclick="rejectPayment('${payment.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading payments:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading payments: ' + error.message + '</p></div>';
    }
}

async function viewPaymentDetails(paymentId) {
    try {
        const doc = await db.collection('payments').doc(paymentId).get();
        
        if (!doc.exists) {
            alert('Payment not found');
            return;
        }
        
        const payment = doc.data();
        const organization = payment.school || payment.business_name || 'N/A';
        
        let statusBadge = '';
        if (payment.status === 'approved') {
            statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
        } else if (payment.status === 'rejected') {
            statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
        } else {
            statusBadge = '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>';
        }
        
        const content = `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-hashtag"></i> Payment ID:</div>
                <div class="detail-value">${paymentId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user"></i> Full Name:</div>
                <div class="detail-value">${payment.full_name || payment.name || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-envelope"></i> Email:</div>
                <div class="detail-value">${payment.email || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-phone"></i> Phone:</div>
                <div class="detail-value">${payment.phone || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-building"></i> Organization:</div>
                <div class="detail-value">${organization}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-box"></i> Package Type:</div>
                <div class="detail-value">${payment.package_type || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-clock"></i> Duration:</div>
                <div class="detail-value">${payment.duration_months || payment.duration || 'N/A'} months</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-money-bill-wave"></i> Amount:</div>
                <div class="detail-value"><strong>${formatCurrency(payment.amount)}</strong></div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-credit-card"></i> Payment Method:</div>
                <div class="detail-value">${payment.payment_method || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-receipt"></i> Transaction ID:</div>
                <div class="detail-value">${payment.transaction_id || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-info-circle"></i> Status:</div>
                <div class="detail-value">${statusBadge}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar"></i> Submitted:</div>
                <div class="detail-value">${formatDate(payment.submitted_at)}</div>
            </div>
            ${payment.email_sent ? `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-envelope-circle-check"></i> Email Status:</div>
                <div class="detail-value">
                    <span class="status-badge status-active">
                        <i class="fas fa-check"></i> Email Sent
                    </span>
                    ${payment.email_sent_at ? `<br><small>Sent: ${formatDate(payment.email_sent_at)}</small>` : ''}
                </div>
            </div>
            ` : payment.status === 'approved' ? `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-envelope"></i> Email Status:</div>
                <div class="detail-value">
                    <span class="status-badge status-pending">
                        <i class="fas fa-clock"></i> Pending
                    </span>
                </div>
            </div>
            ` : ''}
            ${payment.proof_of_payment_url ? `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-file-image"></i> Proof of Payment:</div>
                <div class="detail-value">
                    <a href="${payment.proof_of_payment_url}" target="_blank" style="color: var(--primary-green); text-decoration: none;">
                        <i class="fas fa-external-link-alt"></i> View Document
                    </a>
                </div>
            </div>
            ` : ''}
            ${payment.status === 'pending' ? `
            <div style="margin-top: 24px; display: flex; gap: 12px;">
                <button class="btn btn-approve" onclick="approvePayment('${paymentId}'); closeModal();">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-reject" onclick="rejectPayment('${paymentId}'); closeModal();">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
            ` : payment.status === 'approved' ? `
            <div style="margin-top: 24px;">
                <button class="btn btn-view" onclick="resendLicenseEmail('${paymentId}');">
                    <i class="fas fa-paper-plane"></i> Resend License Email
                </button>
            </div>
            ` : ''}
        `;
        
        showModal('Payment Details', content);
        
    } catch (error) {
        console.error('Error viewing payment:', error);
        alert('Error loading payment details: ' + error.message);
    }
}

async function approvePayment(paymentId) {
    // Show custom confirmation modal
    const confirmed = await showConfirmationModal(
        'Approve Payment',
        'Are you sure you want to approve this payment and generate a license?',
        null,
        'fa-check-circle',
        'var(--primary-green)'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const doc = await db.collection('payments').doc(paymentId).get();
        
        if (!doc.exists) {
            alert('Payment not found');
            return;
        }
        
        const payment = doc.data();
        
        // Update payment status
        await db.collection('payments').doc(paymentId).update({
            status: 'approved',
            approved_at: firebase.firestore.FieldValue.serverTimestamp(),
            approved_by: firebase.auth().currentUser.email
        });
        
        // Generate license key
        const licenseKey = generateLicenseKey();
        
        // Create license in database
        const organization = payment.school || payment.business_name || '';
        const durationMonths = parseInt(payment.duration_months || payment.duration || 12);
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
        
        await db.collection('licenses').add({
            key: licenseKey,
            user_email: payment.email,
            user_name: payment.full_name || payment.name,
            organization: organization,
            type: payment.package_type,
            duration_months: durationMonths,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            expires_at: firebase.firestore.Timestamp.fromDate(expiryDate),
            is_active: true,
            payment_id: paymentId,
            max_devices: getMaxDevicesForType(payment.package_type)
        });
        
        // Show success message
        await showConfirmationModal(
            'Payment Approved!',
            `License key generated:<br><div class="license-key">${licenseKey}</div>Please send this to the user via email.`,
            null,
            'fa-check-circle',
            'var(--success)'
        );
        
        // Reload payments
        loadPayments();
        loadStatistics();
        
    } catch (error) {
        console.error('Error approving payment:', error);
        alert('Error approving payment: ' + error.message);
    }
}

async function rejectPayment(paymentId) {
    const reason = prompt('Please enter rejection reason:');
    
    if (!reason) {
        return;
    }
    
    try {
        await db.collection('payments').doc(paymentId).update({
            status: 'rejected',
            rejection_reason: reason,
            rejected_at: firebase.firestore.FieldValue.serverTimestamp(),
            rejected_by: firebase.auth().currentUser.email
        });
        
        alert('Payment rejected successfully');
        loadPayments();
        loadStatistics();
        
    } catch (error) {
        console.error('Error rejecting payment:', error);
        alert('Error rejecting payment: ' + error.message);
    }
}

async function resendLicenseEmail(paymentId) {
    // Show custom confirmation modal
    const confirmed = await showConfirmationModal(
        'Resend License Email',
        'Are you sure you want to resend the license email to the user?',
        null,
        'fa-envelope',
        'var(--info)'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        // Call the Cloud Function to resend email
        const resendFunction = firebase.functions().httpsCallable('resendLicenseEmail');
        const result = await resendFunction({ paymentId: paymentId });
        
        if (result.data.success) {
            // Show success message
            await showConfirmationModal(
                'Email Sent!',
                'License email has been resent successfully!',
                null,
                'fa-check-circle',
                'var(--success)'
            );
            
            // Refresh the payment details
            closeModal();
            setTimeout(() => {
                viewPaymentDetails(paymentId);
            }, 500);
        } else {
            alert('Failed to resend email. Please try again.');
        }
        
    } catch (error) {
        console.error('Error resending email:', error);
        alert('Error resending email: ' + error.message + '\n\nPlease ensure the Cloud Functions are deployed.');
    }
}

function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 6;
    let key = '';
    
    for (let i = 0; i < segments; i++) {
        if (i > 0) key += '-';
        for (let j = 0; j < segmentLength; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    
    return key;
}

function getMaxDevicesForType(packageType) {
    const deviceLimits = {
        'school': 50,
        'business': 10,
        'individual': 3,
        'trial': 1
    };
    
    return deviceLimits[packageType] || 1;
}