// Mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
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
