// Main Dashboard Controller for IDLab Admin

// Tab switching function
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Deactivate all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        
        // Activate corresponding button
        const buttonIndex = ['stats', 'payments', 'requests', 'licenses', 'users'].indexOf(tabName);
        if (buttonIndex !== -1) {
            buttons[buttonIndex].classList.add('active');
        }
        
        // Load data for the selected tab
        switch(tabName) {
            case 'stats':
                loadStatistics();
                break;
            case 'payments':
                loadPayments();
                break;
            case 'requests':
                loadLicenseRequests();
                break;
            case 'licenses':
                loadLicenses();
                break;
            case 'users':
                loadUsers();
                break;
        }
    }
}

// Modal functions
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('detail-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('detail-modal').classList.remove('show');
}

// Format date helper
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format currency helper
function formatCurrency(amount) {
    return `K${parseFloat(amount || 0).toFixed(2)}`;
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            // Display user email
            const emailElement = document.getElementById('admin-email');
            if (emailElement) {
                emailElement.querySelector('span').textContent = user.email;
            }
            
            // Load initial statistics
            loadStatistics();
            
            // Set up filter listeners
            document.getElementById('payment-status-filter')?.addEventListener('change', loadPayments);
            document.getElementById('request-status-filter')?.addEventListener('change', loadLicenseRequests);
            document.getElementById('license-status-filter')?.addEventListener('change', loadLicenses);
        } else {
            window.location.href = 'login.html';
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('detail-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});