// License Requests Management Functions

// Load and display license requests
async function loadLicenseRequests() {
    const container = document.getElementById('requests-container');
    const statusFilter = document.getElementById('request-status-filter');
    
    if (!container) {
        console.error('Requests container not found');
        return;
    }
    
    const statusValue = statusFilter ? statusFilter.value : 'all';
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading license requests...</p></div>';
    
    try {
        console.log('Loading license requests from Firestore...');
        
        // Build query
        let query = db.collection('license_requests');
        
        // Apply status filter
        if (statusValue !== 'all') {
            query = query.where('status', '==', statusValue);
        }
        
        const snapshot = await query.orderBy('created_at', 'desc').get();
        console.log(`Found ${snapshot.size} license requests`);
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No license requests found</p></div>';
            return;
        }
        
        // Build table
        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-hashtag"></i> ID</th>
                            <th><i class="fas fa-user"></i> Customer</th>
                            <th><i class="fas fa-building"></i> Organization</th>
                            <th><i class="fas fa-tag"></i> Package</th>
                            <th><i class="fas fa-money-bill"></i> Amount</th>
                            <th><i class="fas fa-info-circle"></i> Status</th>
                            <th><i class="fas fa-calendar"></i> Date</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        requests.forEach(request => {
            const requestId = request.id;
            
            // Status badge
            let statusBadge = '';
            if (request.status === 'approved') {
                statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
            } else if (request.status === 'rejected') {
                statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
            } else {
                statusBadge = '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>';
            }
            
            // Format date
            const createdDate = request.created_at ? formatDate(request.created_at) : 'N/A';
            
            // Package display name
            const packageDisplay = request.package_type ? request.package_type.replace(/_/g, ' ').toUpperCase() : 'N/A';
            
            html += `
                <tr>
                    <td><code>${requestId.substring(0, 8)}</code></td>
                    <td>
                        <strong>${request.full_name || 'N/A'}</strong><br>
                        <small>${request.email}</small><br>
                        <small><i class="fas fa-phone"></i> ${request.phone || 'N/A'}</small>
                    </td>
                    <td>
                        <strong>${request.school_name || 'N/A'}</strong><br>
                        <small><i class="fas fa-map-marker-alt"></i> ${request.province || 'N/A'}</small>
                    </td>
                    <td>
                        <strong>${packageDisplay}</strong><br>
                        <small>${request.duration_months || 12} months</small><br>
                        <small>${request.license_type || 'N/A'}</small>
                    </td>
                    <td>
                        <strong>K${request.amount || 0}</strong><br>
                        <small>${request.payment_method || 'N/A'}</small>
                        ${request.payment_proof_url ? `<br><a href="${request.payment_proof_url}" target="_blank" class="payment-proof-link"><i class="fas fa-receipt"></i> View Proof</a>` : ''}
                    </td>
                    <td>${statusBadge}</td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn btn-view" onclick="viewRequestDetails('${requestId}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${request.status === 'pending' ? `
                            <button class="btn btn-approve" onclick="approveRequest('${requestId}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-reject" onclick="rejectRequest('${requestId}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                        ${request.status === 'approved' && request.email_sent !== true ? `
                            <button class="btn btn-resend" onclick="resendLicenseEmail('${requestId}')">
                                <i class="fas fa-envelope"></i> Resend Email
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading license requests:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading requests: ' + error.message + '</p></div>';
    }
}

// View request details
async function viewRequestDetails(requestId) {
    try {
        const doc = await db.collection('license_requests').doc(requestId).get();
        
        if (!doc.exists) {
            alert('License request not found');
            return;
        }
        
        const request = doc.data();
        
        // Status badge
        let statusBadge = '';
        if (request.status === 'approved') {
            statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
        } else if (request.status === 'rejected') {
            statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
        } else {
            statusBadge = '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>';
        }
        
        const modalContent = `
            <div class="request-details">
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Customer Information</h4>
                    <p><strong>Name:</strong> ${request.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${request.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${request.phone || 'N/A'}</p>
                    <p><strong>Organization:</strong> ${request.school_name || 'N/A'}</p>
                    <p><strong>Province:</strong> ${request.province || 'N/A'}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-tag"></i> License Information</h4>
                    <p><strong>Package Type:</strong> ${request.package_type ? request.package_type.replace(/_/g, ' ').toUpperCase() : 'N/A'}</p>
                    <p><strong>License Type:</strong> ${request.license_type || 'N/A'}</p>
                    <p><strong>Duration:</strong> ${request.duration_months || 12} months</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-money-bill"></i> Payment Information</h4>
                    <p><strong>Amount:</strong> K${request.amount || 0}</p>
                    <p><strong>Payment Method:</strong> ${request.payment_method || 'N/A'}</p>
                    ${request.payment_proof_url ? `<p><strong>Payment Proof:</strong> <a href="${request.payment_proof_url}" target="_blank">View Proof</a></p>` : ''}
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Status & Timeline</h4>
                    <p><strong>Status:</strong> ${statusBadge}</p>
                    <p><strong>Submitted:</strong> ${request.created_at ? formatDate(request.created_at) : 'N/A'}</p>
                    ${request.approved_at ? `<p><strong>Approved:</strong> ${formatDate(request.approved_at)}</p>` : ''}
                    ${request.rejected_at ? `<p><strong>Rejected:</strong> ${formatDate(request.rejected_at)}</p>` : ''}
                    ${request.how_heard ? `<p><strong>How they heard about us:</strong> ${request.how_heard}</p>` : ''}
                </div>
                
                ${request.status === 'pending' ? `
                    <div class="detail-actions">
                        <button class="btn btn-approve" onclick="approveRequest('${requestId}'); closeModal();">
                            <i class="fas fa-check"></i> Approve Request
                        </button>
                        <button class="btn btn-reject" onclick="rejectRequest('${requestId}'); closeModal();">
                            <i class="fas fa-times"></i> Reject Request
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        showModal('License Request Details', modalContent);
        
    } catch (error) {
        console.error('Error loading request details:', error);
        alert('Error loading request details: ' + error.message);
    }
}

// Generate license key
function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    
    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }
    
    return segments.join('-');
}

// Approve request
async function approveRequest(requestId) {
    const confirmed = await showConfirmationModal(
        'Approve License Request',
        'Are you sure you want to approve this license request?<br><br>This will generate a license key and send an email to the customer.',
        null,
        'fa-check-circle',
        'var(--primary-green)'
    );
    
    if (!confirmed) return;
    
    try {
        // Get request data
        const requestDoc = await db.collection('license_requests').doc(requestId).get();
        if (!requestDoc.exists) {
            throw new Error('Request not found');
        }
        
        const requestData = requestDoc.data();
        
        // Generate license key
        const licenseKey = generateLicenseKey();
        
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (requestData.duration_months || 12));
        
        // Create license in the 'licenses' collection
        const licenseDoc = await db.collection('licenses').add({
            key: licenseKey,
            email: requestData.email,
            package_type: requestData.package_type,
            duration_months: requestData.duration_months || 12,
            expires_at: firebase.firestore.Timestamp.fromDate(expiryDate),
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            request_id: requestId
        });
        
        // Create payment record for cloud function compatibility
        const paymentDoc = await db.collection('payments').add({
            ...requestData,
            status: 'approved',
            approved_at: firebase.firestore.FieldValue.serverTimestamp(),
            approved_by: firebase.auth().currentUser.email,
            license_id: licenseDoc.id,
            license_key: licenseKey
        });
        
        // Update license with payment_id for bidirectional linking
        await licenseDoc.update({
            payment_id: paymentDoc.id
        });
        
        // Update request status
        await db.collection('license_requests').doc(requestId).update({
            status: 'approved',
            approved_at: firebase.firestore.FieldValue.serverTimestamp(),
            approved_by: firebase.auth().currentUser.email,
            license_key: licenseKey,
            license_id: licenseDoc.id,
            payment_id: paymentDoc.id
        });
        
        // The cloud function should automatically trigger when the payment status changes to 'approved'
        
        await showConfirmationModal(
            'Request Approved! ✅',
            `License request has been approved successfully.<br><br>License Key: <strong>${licenseKey}</strong><br><br>An email with the license key will be sent to the customer automatically.`,
            null,
            'fa-check-circle',
            'var(--success)'
        );
        
        loadLicenseRequests();
        
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Error approving request: ' + error.message);
    }
}

// Reject request
async function rejectRequest(requestId) {
    const reason = prompt('Please enter rejection reason:');
    
    if (!reason) return;
    
    const confirmed = await showConfirmationModal(
        'Reject License Request',
        `Are you sure you want to reject this license request?<br><br>Reason: ${reason}`,
        null,
        'fa-times-circle',
        'var(--danger)'
    );
    
    if (!confirmed) return;
    
    try {
        await db.collection('license_requests').doc(requestId).update({
            status: 'rejected',
            rejected_at: firebase.firestore.FieldValue.serverTimestamp(),
            rejected_by: firebase.auth().currentUser.email,
            rejection_reason: reason
        });
        
        await showConfirmationModal(
            'Request Rejected',
            'The license request has been rejected successfully.',
            null,
            'fa-check-circle',
            'var(--success)'
        );
        
        loadLicenseRequests();
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Error rejecting request: ' + error.message);
    }
}

// Resend license email (manual)
async function resendLicenseEmail(requestId) {
    const confirmed = await showConfirmationModal(
        'Resend License Email',
        'Are you sure you want to resend the license email to the customer?',
        null,
        'fa-envelope',
        'var(--primary-blue)'
    );
    
    if (!confirmed) return;
    
    try {
        // Get request data
        const requestDoc = await db.collection('license_requests').doc(requestId).get();
        if (!requestDoc.exists) {
            throw new Error('Request not found');
        }
        
        const requestData = requestDoc.data();
        
        if (!requestData.payment_id) {
            throw new Error('No payment record found for this request');
        }
        
        // Call the resend cloud function
        const resendFunction = firebase.functions().httpsCallable('resendLicenseEmail');
        await resendFunction({ paymentId: requestData.payment_id });
        
        await showConfirmationModal(
            'Email Sent! ✅',
            'The license email has been resent successfully.',
            null,
            'fa-check-circle',
            'var(--success)'
        );
        
        loadLicenseRequests();
        
    } catch (error) {
        console.error('Error resending email:', error);
        alert('Error resending email: ' + error.message);
    }
}

// Utility function to format dates
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

console.log('License requests management loaded');