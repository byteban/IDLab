// Loading animation
window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    const body = document.body;
    
    if (loader) {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
            loader.classList.add('fade-out');
            body.classList.remove('loading');
            
            // Remove loader from DOM after animation
            setTimeout(() => {
                loader.remove();
            }, 500);
            
            // Trigger content animations
            animateContent();
            
            // Show announcement modal if enabled
            showAnnouncementModal();
        }, 800);
    } else {
        // If no loader, just animate content
        body.classList.remove('loading');
        animateContent();
        
        // Show announcement modal if enabled
        showAnnouncementModal();
    }
});

// ==================== ANNOUNCEMENT MODAL SYSTEM ====================

// Configuration for the announcement modal
const modalConfig = {
    enabled: true,
    autoClose: true,
    autoCloseDelay: 8000,
    showOnce: true,
    title: "📅 Upcoming Webinar",
    message: `
        <p><strong>Join us for a live demo!</strong></p>
        <p>📆 Date: October 25, 2025</p>
        <p>🕐 Time: 2:00 PM GMT</p>
        <p>Learn how to create professional ID cards in minutes.</p>
    `,
    icon: "mdi:calendar-star",
    actionButton: {
        show: true,
        text: "Register Now",
        link: "https://yourwebinar.link"
    }
};

// Function to show the announcement modal
function showAnnouncementModal() {
    // Check if modal should be shown
    if (!modalConfig.enabled) {
        return;
    }
    
    // Check if modal should only show once
    if (modalConfig.showOnce && sessionStorage.getItem('modalShown')) {
        return;
    }
    
    const modal = document.getElementById('announcementModal');
    if (!modal) return;
    
    // Update modal content
    const titleElement = document.getElementById('modalTitle');
    const messageElement = document.getElementById('modalMessage');
    const iconElement = modal.querySelector('.modal-icon iconify-icon');
    const actionBtn = document.getElementById('modalActionBtn');
    
    if (titleElement) titleElement.textContent = modalConfig.title;
    if (messageElement) messageElement.innerHTML = modalConfig.message;
    if (iconElement) iconElement.setAttribute('icon', modalConfig.icon);
    
    // Handle action button
    if (actionBtn) {
        if (modalConfig.actionButton.show) {
            actionBtn.textContent = modalConfig.actionButton.text;
            actionBtn.style.display = 'inline-block';
            actionBtn.onclick = () => {
                if (modalConfig.actionButton.link) {
                    window.location.href = modalConfig.actionButton.link;
                }
                closeAnnouncementModal();
            };
        } else {
            actionBtn.style.display = 'none';
        }
    }
    
    // Show modal with a slight delay
    setTimeout(() => {
        modal.classList.add('show');
        
        // Mark as shown if showOnce is enabled
        if (modalConfig.showOnce) {
            sessionStorage.setItem('modalShown', 'true');
        }
        
        // Auto-close if enabled
        if (modalConfig.autoClose) {
            setTimeout(() => {
                closeAnnouncementModal();
            }, modalConfig.autoCloseDelay);
        }
    }, 1000);
    
    // Setup close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = closeAnnouncementModal;
    }
    
    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeAnnouncementModal();
        }
    };
    
    // Close on Escape key
    document.addEventListener('keydown', handleEscapeKey);
}

// Function to close the modal
function closeAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    if (modal) {
        modal.classList.remove('show');
        document.removeEventListener('keydown', handleEscapeKey);
    }
}

// Handle Escape key press
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeAnnouncementModal();
    }
}

// Public function to manually show modal (can be called from console or other scripts)
function showModal(config = {}) {
    // Merge custom config with default
    Object.assign(modalConfig, config);
    showAnnouncementModal();
}

// Public function to update modal content dynamically
function updateModalContent(title, message, icon = null) {
    modalConfig.title = title;
    modalConfig.message = message;
    if (icon) modalConfig.icon = icon;
}

// ==================== END MODAL SYSTEM ====================

// Content animation function
function animateContent() {
    const elements = document.querySelectorAll('.fade-in-content');
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 100);
    });
}

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add loading class to body initially
    document.body.classList.add('loading');
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navWrapper = document.querySelector('.nav-wrapper');
    const navbar = document.querySelector('.navbar');
    
    // Create backdrop element
    let navBackdrop = document.querySelector('.nav-backdrop');
    if (!navBackdrop) {
        navBackdrop = document.createElement('div');
        navBackdrop.className = 'nav-backdrop';
        document.body.appendChild(navBackdrop);
    }

    function setAria(state) {
        if (navWrapper) navWrapper.setAttribute('aria-hidden', state ? 'false' : 'true');
        if (navBackdrop) navBackdrop.setAttribute('aria-hidden', state ? 'false' : 'true');
    }

    // Initialize aria-hidden
    setAria(false);

    function closeMenu() {
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        if (navWrapper) navWrapper.classList.remove('active');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.classList.remove('menu-open');
        setAria(false);
        // Restore scroll position safety
    }

    function openMenu() {
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.add('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
        if (navWrapper) navWrapper.classList.add('active');
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.classList.add('menu-open');
        setAria(true);
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // Close menu when clicking backdrop
    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMenu);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
            closeMenu();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navWrapper && navWrapper.classList.contains('active') && 
            !navWrapper.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMenu();
        }
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Share buttons
    const shareBtns = document.querySelectorAll('.share-btn');
    const currentUrl = encodeURIComponent(window.location.origin + window.location.pathname);
    shareBtns.forEach(btn => {
        const net = btn.dataset.network;
        if (net === 'copy') {
            btn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    btn.textContent = 'Copied!';
                    setTimeout(()=> btn.textContent = 'Copy Link', 1800);
                } catch (e) {
                    btn.textContent = 'Failed';
                    setTimeout(()=> btn.textContent = 'Copy Link', 1800);
                }
            });
        } else if (net === 'twitter') {
            btn.href = `https://twitter.com/intent/tweet?text=Check%20out%20IDLab%20for%20fast%20ID%20card%20creation&url=${currentUrl}`;
        } else if (net === 'facebook') {
            btn.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
        } else if (net === 'linkedin') {
            btn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
        }
    });
});

// Copy to clipboard function
function copyToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✗ Failed';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}
