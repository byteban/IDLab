// License Management Functions

async function loadLicenses() {
    const container = document.getElementById('licenses-container');
    const statusFilter = document.getElementById('license-status-filter').value;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading licenses...</p></div>';
    
    try {
        // Fetch all licenses (no index required)
        const snapshot = await db.collection('licenses').get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No licenses found</p></div>';
            return;
        }
        
        // Convert to array and filter/sort in JavaScript
        let licenses = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            licenses.push({
                id: doc.id,
                ...data
            });
        });
        
        // Apply status filter
        if (statusFilter === 'active') {
            licenses = licenses.filter(lic => lic.is_active === true);
        } else if (statusFilter === 'inactive') {
            licenses = licenses.filter(lic => lic.is_active === false);
        }
        
        // Sort by created_at descending
        licenses.sort((a, b) => {
            const dateA = a.created_at ? a.created_at.toMillis() : 0;
            const dateB = b.created_at ? b.created_at.toMillis() : 0;
            return dateB - dateA;
        });
        
        if (licenses.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No licenses found</p></div>';
            return;
        }
        
        // Create table
        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-key"></i> License Key</th>
                            <th><i class="fas fa-user"></i> User</th>
                            <th><i class="fas fa-envelope"></i> Email</th>
                            <th><i class="fas fa-building"></i> Organization</th>
                            <th><i class="fas fa-tag"></i> Type</th>
                            <th><i class="fas fa-calendar-plus"></i> Created</th>
                            <th><i class="fas fa-calendar-times"></i> Expires</th>
                            <th><i class="fas fa-info-circle"></i> Status</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        licenses.forEach(license => {
            const isActive = license.is_active;
            const isExpired = license.expires_at && license.expires_at.toDate() < new Date();
            
            html += `
                <tr>
                    <td><code>${license.key}</code></td>
                    <td>${license.user_name || 'N/A'}</td>
                    <td>${license.user_email || 'N/A'}</td>
                    <td>${license.organization || 'N/A'}</td>
                    <td>${license.type || 'N/A'}</td>
                    <td>${formatDate(license.created_at)}</td>
                    <td>${formatDate(license.expires_at)}</td>
                    <td>
                        ${isActive && !isExpired ? 
                            '<span class="status-badge status-active"><i class="fas fa-check-circle"></i> Active</span>' : 
                            '<span class="status-badge status-inactive"><i class="fas fa-times-circle"></i> Inactive</span>'}
                    </td>
                    <td>
                        <button class="btn btn-view" onclick="viewLicenseDetails('${license.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${isActive ? `
                            <button class="btn btn-deactivate" onclick="deactivateLicense('${license.id}')">
                                <i class="fas fa-ban"></i> Deactivate
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading licenses:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading licenses: ' + error.message + '</p></div>';
    }
}

async function viewLicenseDetails(licenseId) {
    try {
        const doc = await db.collection('licenses').doc(licenseId).get();
        
        if (!doc.exists) {
            alert('License not found');
            return;
        }
        
        const license = doc.data();
        const isActive = license.is_active;
        const isExpired = license.expires_at && license.expires_at.toDate() < new Date();
        
        const content = `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-key"></i> License Key:</div>
                <div class="detail-value"><code>${license.key}</code></div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user"></i> User Name:</div>
                <div class="detail-value">${license.user_name || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-envelope"></i> User Email:</div>
                <div class="detail-value">${license.user_email || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-building"></i> Organization:</div>
                <div class="detail-value">${license.organization || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-tag"></i> License Type:</div>
                <div class="detail-value">${license.type || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-clock"></i> Duration:</div>
                <div class="detail-value">${license.duration_months || 'N/A'} months</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-mobile-alt"></i> Max Devices:</div>
                <div class="detail-value">${license.max_devices || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar-plus"></i> Created:</div>
                <div class="detail-value">${formatDate(license.created_at)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar-times"></i> Expires:</div>
                <div class="detail-value">${formatDate(license.expires_at)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-info-circle"></i> Status:</div>
                <div class="detail-value">
                    ${isActive && !isExpired ? 
                        '<span class="status-badge status-active"><i class="fas fa-check-circle"></i> Active</span>' : 
                        '<span class="status-badge status-inactive"><i class="fas fa-times-circle"></i> Inactive</span>'}
                </div>
            </div>
            ${license.payment_id ? `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-credit-card"></i> Payment ID:</div>
                <div class="detail-value">${license.payment_id}</div>
            </div>
            ` : ''}
            ${isActive ? `
            <div style="margin-top: 24px;">
                <button class="btn btn-deactivate" onclick="deactivateLicense('${licenseId}'); closeModal();">
                    <i class="fas fa-ban"></i> Deactivate License
                </button>
            </div>
            ` : ''}
        `;
        
        showModal('License Details', content);
        
    } catch (error) {
        console.error('Error viewing license:', error);
        alert('Error loading license details: ' + error.message);
    }
}

async function deactivateLicense(licenseId) {
    if (!confirm('Are you sure you want to deactivate this license?')) {
        return;
    }
    
    try {
        await db.collection('licenses').doc(licenseId).update({
            is_active: false,
            deactivated_at: firebase.firestore.FieldValue.serverTimestamp(),
            deactivated_by: firebase.auth().currentUser.email
        });
        
        alert('License deactivated successfully');
        loadLicenses();
        loadStatistics();
        
    } catch (error) {
        console.error('Error deactivating license:', error);
        alert('Error deactivating license: ' + error.message);
    }
}

async function loadLicenseRequests() {
    const container = document.getElementById('requests-container');
    const statusFilter = document.getElementById('request-status-filter').value;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading license requests...</p></div>';
    
    try {
        // Fetch all license requests (no index required)
        const snapshot = await db.collection('license_requests').get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No license requests found</p></div>';
            return;
        }
        
        // Convert to array and filter/sort in JavaScript
        let requests = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            requests.push({
                id: doc.id,
                ...data,
                submitted_at: data.submitted_at
            });
        });
        
        // Apply status filter
        if (statusFilter !== 'all') {
            requests = requests.filter(req => req.status === statusFilter);
        }
        
        // Sort by submitted_at descending
        requests.sort((a, b) => {
            const dateA = a.submitted_at ? a.submitted_at.toMillis() : 0;
            const dateB = b.submitted_at ? b.submitted_at.toMillis() : 0;
            return dateB - dateA;
        });
        
        if (requests.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No license requests found</p></div>';
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
                            <th><i class="fas fa-info-circle"></i> Status</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        requests.forEach(request => {
            const organization = request.school || request.business_name || 'N/A';
            let statusBadge = '';
            
            if (request.status === 'approved') {
                statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
            } else if (request.status === 'rejected') {
                statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
            } else {
                statusBadge = '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>';
            }
            
            html += `
                <tr>
                    <td>${formatDate(request.submitted_at)}</td>
                    <td>${request.full_name || request.name || 'N/A'}</td>
                    <td>${request.email || 'N/A'}</td>
                    <td>${organization}</td>
                    <td>${request.package_type || 'N/A'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-view" onclick="viewRequestDetails('${request.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${request.status === 'pending' ? `
                            <button class="btn btn-approve" onclick="approveRequest('${request.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-reject" onclick="rejectRequest('${request.id}')">
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
        console.error('Error loading license requests:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading requests: ' + error.message + '</p></div>';
    }
}

async function viewRequestDetails(requestId) {
    try {
        const doc = await db.collection('license_requests').doc(requestId).get();
        
        if (!doc.exists) {
            alert('Request not found');
            return;
        }
        
        const request = doc.data();
        const organization = request.school || request.business_name || 'N/A';
        
        let statusBadge = '';
        if (request.status === 'approved') {
            statusBadge = '<span class="status-badge status-active"><i class="fas fa-check"></i> Approved</span>';
        } else if (request.status === 'rejected') {
            statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Rejected</span>';
        } else {
            statusBadge = '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>';
        }
        
        const content = `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-hashtag"></i> Request ID:</div>
                <div class="detail-value">${requestId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user"></i> Full Name:</div>
                <div class="detail-value">${request.full_name || request.name || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-envelope"></i> Email:</div>
                <div class="detail-value">${request.email || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-phone"></i> Phone:</div>
                <div class="detail-value">${request.phone || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-building"></i> Organization:</div>
                <div class="detail-value">${organization}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-box"></i> Package Type:</div>
                <div class="detail-value">${request.package_type || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-info-circle"></i> Status:</div>
                <div class="detail-value">${statusBadge}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar"></i> Submitted:</div>
                <div class="detail-value">${formatDate(request.submitted_at)}</div>
            </div>
            ${request.status === 'pending' ? `
            <div style="margin-top: 24px; display: flex; gap: 12px;">
                <button class="btn btn-approve" onclick="approveRequest('${requestId}'); closeModal();">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-reject" onclick="rejectRequest('${requestId}'); closeModal();">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
            ` : ''}
        `;
        
        showModal('License Request Details', content);
        
    } catch (error) {
        console.error('Error viewing request:', error);
        alert('Error loading request details: ' + error.message);
    }
}

async function approveRequest(requestId) {
    // Show custom confirmation modal
    const confirmed = await showConfirmationModal(
        'Approve License Request',
        'Are you sure you want to approve this request and generate a license?<br><br>An email with the license key will be sent to the user.',
        null,
        'fa-check-circle',
        'var(--primary-green)'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        // Get the request data
        const requestDoc = await db.collection('license_requests').doc(requestId).get();
        
        if (!requestDoc.exists) {
            alert('Request not found');
            return;
        }
        
        const request = requestDoc.data();
        
        // Create a payment record (which will trigger the email Cloud Function)
        const paymentData = {
            full_name: request.full_name || request.name,
            email: request.email,
            phone: request.phone,
            school: request.school_name,
            business_name: request.business_name,
            package_type: request.package_type,
            duration_months: request.duration_months,
            duration: request.duration_months,
            amount: request.amount_paid || request.amount,
            payment_method: request.payment_method,
            transaction_id: request.transaction_id || 'N/A',
            proof_of_payment_url: request.payment_proof_url,
            status: 'approved', // Set directly to approved
            submitted_at: request.created_at || firebase.firestore.FieldValue.serverTimestamp(),
            approved_at: firebase.firestore.FieldValue.serverTimestamp(),
            approved_by: firebase.auth().currentUser.email,
            source: 'license_request',
            license_request_id: requestId
        };
        
        // Create payment document
        const paymentRef = await db.collection('payments').add(paymentData);
        const paymentId = paymentRef.id;
        
        // Generate license key
        const licenseKey = generateLicenseKey();
        
        // Create license in database
        const organization = request.school_name || request.business_name || '';
        const durationMonths = parseInt(request.duration_months || request.duration || 12);
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
        
        await db.collection('licenses').add({
            key: licenseKey,
            user_email: request.email,
            user_name: request.full_name || request.name,
            organization: organization,
            type: request.package_type,
            duration_months: durationMonths,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            expires_at: firebase.firestore.Timestamp.fromDate(expiryDate),
            is_active: true,
            payment_id: paymentId,
            license_request_id: requestId,
            max_devices: getMaxDevicesForType(request.package_type)
        });
        
        // Update license request status
        await db.collection('license_requests').doc(requestId).update({
            status: 'approved',
            approved_at: firebase.firestore.FieldValue.serverTimestamp(),
            approved_by: firebase.auth().currentUser.email,
            payment_id: paymentId,
            license_key: licenseKey
        });
        
        // Show success message
        await showConfirmationModal(
            'License Request Approved! ✅',
            `License key generated: <div class="license-key" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; font-family: monospace; font-size: 14px;">${licenseKey}</div>An email with the license key and receipt has been automatically sent to <strong>${request.email}</strong>`,
            null,
            'fa-check-circle',
            'var(--success)'
        );
        
        loadLicenseRequests();
        loadStatistics();
        
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Error approving request: ' + error.message);
    }
}

async function rejectRequest(requestId) {
    const reason = prompt('Please enter rejection reason:');
    
    if (!reason) {
        return;
    }
    
    try {
        await db.collection('license_requests').doc(requestId).update({
            status: 'rejected',
            rejection_reason: reason,
            rejected_at: firebase.firestore.FieldValue.serverTimestamp(),
            rejected_by: firebase.auth().currentUser.email
        });
        
        alert('Request rejected successfully');
        loadLicenseRequests();
        loadStatistics();
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Error rejecting request: ' + error.message);
    }
}