// Loading animation - Optimized for fast loading
window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    const body = document.body;
    
    if (loader) {
        // Reduced delay for faster perceived loading
        setTimeout(() => {
            loader.classList.add('fade-out');
            body.classList.remove('loading');
            
            // Remove loader from DOM after animation
            setTimeout(() => {
                loader.remove();
            }, 300);
            
            // Trigger content animations
            animateContent();
            
            // Show announcement modal if enabled
            showAnnouncementModal();
        }, 300); // Reduced from 800ms to 300ms
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
    autoClose: false,          // Don't auto-close construction notice
    autoCloseDelay: 50000,
    showOnce: true,
    title: "🚧 Site Under Construction",
    message: `
        <p><strong>Thank you for visiting!</strong></p>
        <p>Our website is currently undergoing improvements to serve you better.</p>
        <p>During this time, some features may be limited or unavailable.</p>
        <p>We're working hard to complete the updates soon and appreciate your patience.</p>
        <p>Please check back regularly for new content and features.</p>
    `,
    icon: "mdi:hammer-wrench",
    actionButton: {
        show: true,
        text: "Contact Us",
        link: "#contact"       // Link to contact section or page
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

// ==================== DARK MODE SYSTEM ====================

// Check for saved theme preference. If none, use the user's system preference.
const savedTheme = localStorage.getItem('theme');
const supportsPrefers = window.matchMedia !== undefined;
const systemPrefersDark = supportsPrefers && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (savedTheme === null && systemPrefersDark)) {
    document.body.classList.add('dark-mode');
}

// Listen for changes to the system color scheme only when the user hasn't chosen a preference.
if (supportsPrefers) {
    const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
        // Respect explicit user choice stored in localStorage
        if (localStorage.getItem('theme')) return;

        if (e.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Update the toggle icon if it's available
        updateDarkModeIcon();
    };

    // Add change listener with backwards compatibility
    if (typeof colorSchemeMedia.addEventListener === 'function') {
        colorSchemeMedia.addEventListener('change', handleSystemThemeChange);
    } else if (typeof colorSchemeMedia.addListener === 'function') {
        colorSchemeMedia.addListener(handleSystemThemeChange);
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    // Update toggle button icon
    updateDarkModeIcon();
}

// Update dark mode toggle icon
function updateDarkModeIcon() {
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('iconify-icon');
    if (document.body.classList.contains('dark-mode')) {
        icon.setAttribute('icon', 'mdi:white-balance-sunny');
    } else {
        icon.setAttribute('icon', 'mdi:moon-waxing-crescent');
    }
}

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDarkModeIcon();
    
    // Add click event to dark mode toggle
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleDarkMode);
    }
});

// ==================== END DARK MODE SYSTEM ====================

// ==================== ANIMATIONS SYSTEM ====================

// Enhanced content animation function - Fast and smooth
function animateContent() {
    const fadeElements = document.querySelectorAll('.fade-in-content');
    const slideLeftElements = document.querySelectorAll('.slide-in-left');
    const slideRightElements = document.querySelectorAll('.slide-in-right');
    const scaleElements = document.querySelectorAll('.scale-up');
    
    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    fadeElements.forEach(el => observer.observe(el));
    slideLeftElements.forEach(el => observer.observe(el));
    slideRightElements.forEach(el => observer.observe(el));
    scaleElements.forEach(el => observer.observe(el));
}

// ==================== SUCCESS STORIES CAROUSEL ====================

let currentSlide = 0;
let autoSlideInterval;
const autoSlideDelay = 5000; // 5 seconds

function initStoriesCarousel() {
    const storiesGrid = document.querySelector('.stories-grid');
    const dotsContainer = document.getElementById('storyCarouselDots');
    
    if (!storiesGrid || !dotsContainer) return;
    
    const cards = storiesGrid.querySelectorAll('.story-card');
    const totalCards = cards.length;
    
    // Determine cards per view based on screen size
    function getCardsPerView() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 980) return 2;
        return 4;
    }
    
    let cardsPerView = getCardsPerView();
    const totalSlides = Math.ceil(totalCards / cardsPerView);
    
    // Create navigation dots
    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentSlide = index;
        const cardWidth = cards[0].offsetWidth;
        const gap = 24; // 1.5rem in pixels
        const offset = -(currentSlide * cardsPerView * (cardWidth + gap));
        
        storiesGrid.style.transform = `translateX(${offset}px)`;
        
        // Update active dot
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }
    
    // Auto-slide functionality
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, autoSlideDelay);
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newCardsPerView = getCardsPerView();
            if (newCardsPerView !== cardsPerView) {
                cardsPerView = newCardsPerView;
                currentSlide = 0;
                createDots();
                goToSlide(0);
            }
        }, 250);
    });
    
    // Pause on hover
    storiesGrid.addEventListener('mouseenter', stopAutoSlide);
    storiesGrid.addEventListener('mouseleave', startAutoSlide);
    
    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    storiesGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    });
    
    storiesGrid.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left - next slide
            nextSlide();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right - previous slide
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(currentSlide);
        }
    }
    
    // Initialize
    createDots();
    goToSlide(0);
    startAutoSlide();
}

// ==================== END CAROUSEL SYSTEM ====================

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
    
    // Initialize animations
    animateContent();
    
    // Initialize stories carousel if on a page with the carousel
    if (document.querySelector('.stories-grid')) {
        initStoriesCarousel();
    }
    
    // Initialize dropdown menus
    initDropdownMenus();
});

// ==================== DROPDOWN MENU SYSTEM ====================

function initDropdownMenus() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (!toggle) return;
        
        // Prevent default link behavior for dropdown toggle
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Only handle click to toggle on mobile
            if (window.innerWidth <= 768) {
                // Close other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
                
                // Update aria-expanded
                const isActive = dropdown.classList.contains('active');
                toggle.setAttribute('aria-expanded', isActive);
            }
        });
        
        // Desktop hover behavior
        if (window.innerWidth > 768) {
            dropdown.addEventListener('mouseenter', () => {
                dropdown.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            });
            
            dropdown.addEventListener('mouseleave', () => {
                dropdown.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        }
    });
    
    // Close dropdowns when clicking outside (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('.nav-dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        }
    });
    
    // Handle window resize - reset dropdown states
    window.addEventListener('resize', () => {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// ==================== END DROPDOWN SYSTEM ====================

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
