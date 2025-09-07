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
        }, 800);
    } else {
        // If no loader, just animate content
        body.classList.remove('loading');
        animateContent();
    }
});

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

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
            mobileMenuBtn.classList.toggle('active');
            navWrapper.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    document.addEventListener('click', (e) => {
        if (navWrapper && mobileMenuBtn && !navWrapper.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            navWrapper.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
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
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            navWrapper.classList.remove('active');
            document.body.classList.remove('menu-open');
            if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
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
