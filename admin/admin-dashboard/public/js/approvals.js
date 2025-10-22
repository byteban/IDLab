// Approval Workflow Management Functions

// Real-time listener for pending approvals (for badge updates)
let approvalsListener = null;

// Initialize approval listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupApprovalsListener();
});

// Setup real-time listener for pending approvals
function setupApprovalsListener() {
    if (approvalsListener) {
        approvalsListener(); // Unsubscribe previous listener
    }

    approvalsListener = db.collection('approvals')
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            const count = snapshot.size;
            const badge = document.getElementById('pending-approvals-badge');
            
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline-block' : 'none';
            }

            // Show notification for new approvals
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && change.doc.metadata.hasPendingWrites === false) {
                    const approval = change.doc.data();
                    showNotification(
                        'New Approval Request',
                        `${approval.type.replace(/_/g, ' ')} from ${approval.requester_name}`,
                        'info'
                    );
                }
            });

            // Reload approvals if currently viewing that tab
            const approvalsTab = document.getElementById('approvals-tab');
            if (approvalsTab && approvalsTab.classList.contains('active')) {
                loadApprovals();
            }
        }, (error) => {
            console.error('Error in approvals listener:', error);
        });
}

// Load and display approvals
async function loadApprovals() {
    const container = document.getElementById('approvals-container');
    const statusFilter = document.getElementById('approval-status-filter').value;
    const typeFilter = document.getElementById('approval-type-filter').value;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading approvals...</p></div>';
    
    try {
        // Build query
        let query = db.collection('approvals');
        
        // Apply status filter
        if (statusFilter !== 'all') {
            query = query.where('status', '==', statusFilter);
        }
        
        // Apply type filter
        if (typeFilter !== 'all') {
            query = query.where('type', '==', typeFilter);
        }
        
        const snapshot = await query.orderBy('created_at', 'desc').get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No approval requests found</p></div>';
            return;
        }
        
        // Build table
        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-hashtag"></i> ID</th>
                            <th><i class="fas fa-user"></i> Requester</th>
                            <th><i class="fas fa-user-tie"></i> Approver</th>
                            <th><i class="fas fa-tag"></i> Type</th>
                            <th><i class="fas fa-info-circle"></i> Status</th>
                            <th><i class="fas fa-calendar"></i> Created</th>
                            <th><i class="fas fa-hourglass"></i> Expires</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        snapshot.forEach(doc => {
            const approval = doc.data();
            const approvalId = doc.id;
            
            // Status badge
            let statusBadge = '';
            if (approval.status === 'approved') {
                statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
            } else if (approval.status === 'rejected') {
                statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
            } else if (approval.status === 'pending') {
                // Check if expired
                const now = new Date();
                const expiresAt = approval.expires_at ? approval.expires_at.toDate() : new Date();
                if (expiresAt < now) {
                    statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-clock"></i> Expired</span>';
                } else {
                    statusBadge = '<span class="status-badge status-pending"><i class="fas fa-hourglass-half"></i> Pending</span>';
                }
            }
            
            // Format dates
            const createdDate = approval.created_at ? formatDate(approval.created_at) : 'N/A';
            const expiresDate = approval.expires_at ? formatDate(approval.expires_at) : 'N/A';
            
            // Days until expiry (for pending requests)
            let expiryInfo = expiresDate;
            if (approval.status === 'pending' && approval.expires_at) {
                const now = new Date();
                const expiresAt = approval.expires_at.toDate();
                const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
                if (daysLeft > 0) {
                    expiryInfo = `${expiresDate}<br><small style="color: ${daysLeft <= 2 ? '#e74c3c' : '#f39c12'}">(${daysLeft} days left)</small>`;
                } else {
                    expiryInfo = `${expiresDate}<br><small style="color: #e74c3c">(Expired)</small>`;
                }
            }
            
            html += `
                <tr>
                    <td><code>${approvalId.substring(0, 8)}</code></td>
                    <td>
                        <strong>${approval.requester_name || 'N/A'}</strong><br>
                        <small>${approval.requester_email}</small>
                    </td>
                    <td>
                        <strong>${approval.approver_name || 'Admin'}</strong><br>
                        <small>${approval.approver_email}</small>
                    </td>
                    <td>${approval.type.replace(/_/g, ' ')}</td>
                    <td>${statusBadge}</td>
                    <td>${createdDate}</td>
                    <td>${expiryInfo}</td>
                    <td>
                        <button class="btn btn-view" onclick="viewApprovalDetails('${approvalId}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${approval.status === 'pending' ? `
                            <button class="btn btn-approve" onclick="manualApproveApproval('${approvalId}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-reject" onclick="manualRejectApproval('${approvalId}')">
                                <i class="fas fa-times"></i> Reject
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
        console.error('Error loading approvals:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading approvals: ' + error.message + '</p></div>';
    }
}

// View approval details
async function viewApprovalDetails(approvalId) {
    try {
        const doc = await db.collection('approvals').doc(approvalId).get();
        
        if (!doc.exists) {
            alert('Approval request not found');
            return;
        }
        
        const approval = doc.data();
        
        // Status badge
        let statusBadge = '';
        if (approval.status === 'approved') {
            statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
        } else if (approval.status === 'rejected') {
            statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
        } else {
            statusBadge = '<span class="status-badge status-pending"><i class="fas fa-hourglass-half"></i> Pending</span>';
        }
        
        let content = `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-hashtag"></i> Approval ID:</div>
                <div class="detail-value"><code>${approvalId}</code></div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user"></i> Requester:</div>
                <div class="detail-value">${approval.requester_name} (${approval.requester_email})</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user-tie"></i> Approver:</div>
                <div class="detail-value">${approval.approver_name || 'Admin'} (${approval.approver_email})</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-tag"></i> Request Type:</div>
                <div class="detail-value">${approval.type.replace(/_/g, ' ').toUpperCase()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-info-circle"></i> Status:</div>
                <div class="detail-value">${statusBadge}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar"></i> Created:</div>
                <div class="detail-value">${formatDate(approval.created_at)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar-times"></i> Expires:</div>
                <div class="detail-value">${formatDate(approval.expires_at)}</div>
            </div>
        `;
        
        // Additional details based on request details
        if (approval.details && Object.keys(approval.details).length > 0) {
            content += `
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-info"></i> Request Details:</div>
                    <div class="detail-value"></div>
                </div>
            `;
            
            Object.keys(approval.details).forEach(key => {
                content += `
                    <div class="detail-row">
                        <div class="detail-label" style="padding-left: 20px;">${key.replace(/_/g, ' ')}:</div>
                        <div class="detail-value">${approval.details[key]}</div>
                    </div>
                `;
            });
        }
        
        // Approval/Rejection info
        if (approval.status === 'approved' && approval.approved_at) {
            content += `
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-check-circle"></i> Approved At:</div>
                    <div class="detail-value">${formatDate(approval.approved_at)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-user-check"></i> Approved By:</div>
                    <div class="detail-value">${approval.approved_by || 'N/A'}</div>
                </div>
            `;
        }
        
        if (approval.status === 'rejected' && approval.rejected_at) {
            content += `
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-times-circle"></i> Rejected At:</div>
                    <div class="detail-value">${formatDate(approval.rejected_at)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-user-times"></i> Rejected By:</div>
                    <div class="detail-value">${approval.rejected_by || 'N/A'}</div>
                </div>
                ${approval.rejection_reason ? `
                    <div class="detail-row">
                        <div class="detail-label"><i class="fas fa-comment"></i> Reason:</div>
                        <div class="detail-value">${approval.rejection_reason}</div>
                    </div>
                ` : ''}
            `;
        }
        
        // Email status
        content += `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-envelope"></i> Email Sent:</div>
                <div class="detail-value">${approval.email_sent ? '✅ Yes' : '❌ No'}</div>
            </div>
            ${approval.email_sent_at ? `
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-clock"></i> Email Sent At:</div>
                    <div class="detail-value">${formatDate(approval.email_sent_at)}</div>
                </div>
            ` : ''}
        `;
        
        // Action buttons for pending requests
        if (approval.status === 'pending') {
            content += `
                <div style="margin-top: 24px; display: flex; gap: 12px;">
                    <button class="btn btn-approve" onclick="manualApproveApproval('${approvalId}'); closeModal();">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-reject" onclick="manualRejectApproval('${approvalId}'); closeModal();">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
        }
        
        showModal('Approval Request Details', content);
        
    } catch (error) {
        console.error('Error viewing approval details:', error);
        alert('Error viewing approval details: ' + error.message);
    }
}

// Manual approve from dashboard
async function manualApproveApproval(approvalId) {
    const confirmed = await showConfirmationModal(
        'Approve Request',
        'Are you sure you want to approve this request?<br><br>The requester will receive a confirmation email.',
        null,
        'fa-check-circle',
        'var(--primary-green)'
    );
    
    if (!confirmed) return;
    
    try {
        // Update status with retry logic
        let retries = 3;
        let success = false;
        let lastError = null;
        
        while (retries > 0 && !success) {
            try {
                await db.collection('approvals').doc(approvalId).update({
                    status: 'approved',
                    approved_at: firebase.firestore.FieldValue.serverTimestamp(),
                    approved_by: firebase.auth().currentUser.email
                });
                success = true;
            } catch (err) {
                lastError = err;
                retries--;
                if (retries > 0) {
                    console.log(`Retrying approval... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                }
            }
        }
        
        if (!success) {
            throw lastError;
        }
        
        await showConfirmationModal(
            'Request Approved! ✅',
            'The approval request has been approved successfully.<br>A confirmation email will be sent to the requester.',
            null,
            'fa-check-circle',
            'var(--success)'
        );
        
        loadApprovals();
        
    } catch (error) {
        console.error('Error approving request:', error);
        
        // Check if it's a network error
        if (error.code === 'unavailable' || error.message.includes('QUIC') || error.message.includes('network')) {
            alert('Network error occurred. Please check your connection and try again.\n\nThe approval may have succeeded - please refresh the page to verify.');
        } else {
            alert('Error approving request: ' + error.message);
        }
    }
}

// Manual reject from dashboard
async function manualRejectApproval(approvalId) {
    const reason = prompt('Please enter rejection reason:');
    
    if (!reason) return;
    
    try {
        // Update status with retry logic
        let retries = 3;
        let success = false;
        let lastError = null;
        
        while (retries > 0 && !success) {
            try {
                await db.collection('approvals').doc(approvalId).update({
                    status: 'rejected',
                    rejected_at: firebase.firestore.FieldValue.serverTimestamp(),
                    rejected_by: firebase.auth().currentUser.email,
                    rejection_reason: reason
                });
                success = true;
            } catch (err) {
                lastError = err;
                retries--;
                if (retries > 0) {
                    console.log(`Retrying rejection... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                }
            }
        }
        
        if (!success) {
            throw lastError;
        }
        
        await showConfirmationModal(
            'Request Rejected',
            'The approval request has been rejected.<br>A notification email will be sent to the requester.',
            null,
            'fa-times-circle',
            'var(--danger)'
        );
        
        loadApprovals();
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        
        // Check if it's a network error
        if (error.code === 'unavailable' || error.message.includes('QUIC') || error.message.includes('network')) {
            alert('Network error occurred. Please check your connection and try again.\n\nThe rejection may have succeeded - please refresh the page to verify.');
        } else {
            alert('Error rejecting request: ' + error.message);
        }
    }
}

// Show notification (basic implementation)
function showNotification(title, message, type = 'info') {
    // You can enhance this with a proper notification library
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    
    // Basic browser notification (if permissions granted)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/assets/idlab.ico',
            badge: '/assets/idlab.ico'
        });
    }
}

// Add filter change listeners
document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('approval-status-filter');
    const typeFilter = document.getElementById('approval-type-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', loadApprovals);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', loadApprovals);
    }
});
