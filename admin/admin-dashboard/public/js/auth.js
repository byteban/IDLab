// Authentication handler for IDLab Admin Dashboard

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');
    const loadingIndicator = document.getElementById('loading');

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user && window.location.pathname.includes('login')) {
            // Verify user has admin privileges
            try {
                const idTokenResult = await user.getIdTokenResult();
                if (idTokenResult.claims.admin) {
                    window.location.href = '/';
                } else {
                    showError('Access denied. Admin privileges required.');
                    firebase.auth().signOut();
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                showError('Error verifying admin status');
            }
        } else if (!user && !window.location.pathname.includes('login')) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
        }
    });

    // Redirect non-authenticated users
    firebase.auth().onAuthStateChanged((user) => {
        if (!user && !window.location.pathname.includes('login')) {
            window.location.href = '/login';
        }
    });

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                showError('Please enter both email and password.');
                return;
            }

            // Show loading state
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Signing in...</span>';
            if (loadingIndicator) loadingIndicator.classList.add('show');
            errorMessage.classList.remove('show');

            try {
                // Sign in with Firebase Authentication
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Verify admin privileges
                const idTokenResult = await user.getIdTokenResult();
                
                if (!idTokenResult.claims.admin) {
                    // Not an admin, sign out
                    await firebase.auth().signOut();
                    showError('Access denied. Admin privileges required.');
                    return;
                }

                // Check if user exists in admin_users collection
                const adminDoc = await db.collection('admin_users')
                    .where('email', '==', email)
                    .limit(1)
                    .get();

                if (adminDoc.empty) {
                    await firebase.auth().signOut();
                    showError('Admin user not found in database.');
                    return;
                }

                // Update last login time
                const adminId = adminDoc.docs[0].id;
                await db.collection('admin_users').doc(adminId).update({
                    last_login: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Successful login - redirect to dashboard
                console.log('Login successful:', user.email);
                window.location.href = '/';

            } catch (error) {
                console.error('Login error:', error);
                let errorMsg = 'Login failed. Please try again.';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMsg = 'Invalid email or password.';
                        break;
                    case 'auth/invalid-email':
                        errorMsg = 'Invalid email format.';
                        break;
                    case 'auth/user-disabled':
                        errorMsg = 'This account has been disabled.';
                        break;
                    case 'auth/too-many-requests':
                        errorMsg = 'Too many failed attempts. Please try again later.';
                        break;
                    default:
                        errorMsg = error.message || errorMsg;
                }
                
                showError(errorMsg);
            } finally {
                // Reset button state
                loginButton.disabled = false;
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Sign In</span>';
                if (loadingIndicator) loadingIndicator.classList.remove('show');
            }
        });
    }

    // Logout function (for use on dashboard)
    window.logout = async function() {
        try {
            await firebase.auth().signOut();
            console.log('User signed out');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error signing out: ' + error.message);
        }
    };

    function showError(message) {
        if (errorMessage) {
            const span = errorMessage.querySelector('span');
            if (span) {
                span.textContent = message;
            } else {
                errorMessage.textContent = message;
            }
            errorMessage.classList.add('show');
        }
    }
});