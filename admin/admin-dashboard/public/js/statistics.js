// Statistics and User Management Functions

async function loadStatistics() {
    try {
        // Load payment statistics
        const paymentsSnapshot = await db.collection('payments').get();
        const totalPayments = paymentsSnapshot.size;
        const pendingPayments = paymentsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
        
        document.getElementById('total-payments').textContent = totalPayments;
        document.getElementById('pending-payments').textContent = pendingPayments;
        
        // Load license statistics
        const licensesSnapshot = await db.collection('licenses').get();
        const totalLicenses = licensesSnapshot.size;
        const activeLicenses = licensesSnapshot.docs.filter(doc => {
            const license = doc.data();
            const isExpired = license.expires_at && license.expires_at.toDate() < new Date();
            return license.is_active && !isExpired;
        }).length;
        
        document.getElementById('total-licenses').textContent = totalLicenses;
        document.getElementById('active-licenses').textContent = activeLicenses;
        
        // Load user statistics
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        
        document.getElementById('total-users').textContent = totalUsers;
        
        // Load request statistics
        const requestsSnapshot = await db.collection('license_requests').get();
        const pendingRequests = requestsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
        
        document.getElementById('pending-requests').textContent = pendingRequests;
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadUsers() {
    const container = document.getElementById('users-container');
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading users...</p></div>';
    
    try {
        const snapshot = await db.collection('users').orderBy('registered_at', 'desc').get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No users found</p></div>';
            return;
        }
        
        // Create table
        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-user"></i> Name</th>
                            <th><i class="fas fa-envelope"></i> Email</th>
                            <th><i class="fas fa-user-tag"></i> User Type</th>
                            <th><i class="fas fa-key"></i> License Key</th>
                            <th><i class="fas fa-mobile-alt"></i> Device ID</th>
                            <th><i class="fas fa-calendar"></i> Registered</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        snapshot.forEach(doc => {
            const user = doc.data();
            
            html += `
                <tr>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.user_type || 'N/A'}</td>
                    <td>${user.license_key ? `<code>${user.license_key}</code>` : 'N/A'}</td>
                    <td>${user.device_id ? `<code>${user.device_id.substring(0, 12)}...</code>` : 'N/A'}</td>
                    <td>${formatDate(user.registered_at)}</td>
                    <td>
                        <button class="btn btn-view" onclick="viewUserDetails('${doc.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading users: ' + error.message + '</p></div>';
    }
}

async function viewUserDetails(userId) {
    try {
        const doc = await db.collection('users').doc(userId).get();
        
        if (!doc.exists) {
            alert('User not found');
            return;
        }
        
        const user = doc.data();
        
        // Get associated license if exists
        let licenseInfo = '';
        if (user.license_key) {
            const licenseSnapshot = await db.collection('licenses')
                .where('key', '==', user.license_key)
                .limit(1)
                .get();
            
            if (!licenseSnapshot.empty) {
                const license = licenseSnapshot.docs[0].data();
                const isExpired = license.expires_at && license.expires_at.toDate() < new Date();
                licenseInfo = `
                    <div class="detail-row">
                        <div class="detail-label"><i class="fas fa-info-circle"></i> License Status:</div>
                        <div class="detail-value">
                            ${license.is_active && !isExpired ? 
                                '<span class="status-badge status-active"><i class="fas fa-check-circle"></i> Active</span>' : 
                                '<span class="status-badge status-inactive"><i class="fas fa-times-circle"></i> Inactive</span>'}
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><i class="fas fa-calendar-times"></i> License Expires:</div>
                        <div class="detail-value">${formatDate(license.expires_at)}</div>
                    </div>
                `;
            }
        }
        
        const content = `
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-hashtag"></i> User ID:</div>
                <div class="detail-value">${userId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user"></i> Name:</div>
                <div class="detail-value">${user.name || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-envelope"></i> Email:</div>
                <div class="detail-value">${user.email || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user-tag"></i> User Type:</div>
                <div class="detail-value">${user.user_type || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-key"></i> License Key:</div>
                <div class="detail-value">${user.license_key ? `<code>${user.license_key}</code>` : 'N/A'}</div>
            </div>
            ${licenseInfo}
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-mobile-alt"></i> Device ID:</div>
                <div class="detail-value">${user.device_id ? `<code>${user.device_id}</code>` : 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar"></i> Registered:</div>
                <div class="detail-value">${formatDate(user.registered_at)}</div>
            </div>
        `;
        
        showModal('User Details', content);
        
    } catch (error) {
        console.error('Error viewing user:', error);
        alert('Error loading user details: ' + error.message);
    }
}