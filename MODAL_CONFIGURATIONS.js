// ========================================
// ANNOUNCEMENT MODAL - QUICK CONFIGURATIONS
// ========================================
// ⚠️ THIS IS A REFERENCE FILE - DO NOT INCLUDE IN YOUR HTML
// Copy and paste ONE of these configurations into scripts/main.js
// to quickly change the modal appearance and behavior

// ----------------------------------------
// CONFIGURATION 1: Software Release
// ----------------------------------------
const modalConfig = {
    enabled: true,
    autoClose: false,
    autoCloseDelay: 10000,
    showOnce: false,
    title: "🚀 IDLab v3.0 Released!",
    message: `
        <p><strong>We're excited to announce IDLab v3.0!</strong></p>
        <p>What's new:</p>
        <ul>
            <li>AI-powered template suggestions</li>
            <li>Real-time collaboration</li>
            <li>Cloud backup and sync</li>
            <li>100+ new professional templates</li>
        </ul>
    `,
    icon: "mdi:rocket-launch",
    actionButton: {
        show: true,
        text: "Download Now",
        link: "download.html"
    }
};

// ----------------------------------------
// CONFIGURATION 2: Event/Meeting Notice
// ----------------------------------------
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

// ----------------------------------------
// CONFIGURATION 3: Maintenance Alert
// ----------------------------------------
const modalConfig = {
    enabled: true,
    autoClose: true,
    autoCloseDelay: 7000,
    showOnce: false,
    title: "⚠️ Scheduled Maintenance",
    message: `
        <p><strong>System maintenance scheduled</strong></p>
        <p>📅 Date: October 22, 2025</p>
        <p>⏰ Time: 2:00 AM - 4:00 AM GMT</p>
        <p>Expected downtime: 2 hours</p>
    `,
    icon: "mdi:alert-circle",
    actionButton: {
        show: false
    }
};

// ----------------------------------------
// CONFIGURATION 4: Promotion/Discount
// ----------------------------------------
const modalConfig = {
    enabled: true,
    autoClose: false,
    autoCloseDelay: 10000,
    showOnce: true,
    title: "🎁 Limited Time Offer!",
    message: `
        <p><strong>50% OFF Premium Templates</strong></p>
        <p>✨ Get access to 200+ professional templates</p>
        <p>💰 Use code: <strong>SAVE50</strong></p>
        <p>⏰ Offer ends October 31, 2025</p>
    `,
    icon: "mdi:gift",
    actionButton: {
        show: true,
        text: "Shop Now",
        link: "pricing.html"
    }
};

// ----------------------------------------
// CONFIGURATION 5: Welcome Message
// ----------------------------------------
const modalConfig = {
    enabled: true,
    autoClose: true,
    autoCloseDelay: 6000,
    showOnce: true,
    title: "👋 Welcome to IDLab!",
    message: `
        <p><strong>Thank you for visiting!</strong></p>
        <p>Create professional ID cards in minutes with our easy-to-use tools.</p>
        <p>Get started with our free templates or explore premium options.</p>
    `,
    icon: "mdi:hand-wave",
    actionButton: {
        show: true,
        text: "Get Started",
        link: "download.html"
    }
};

// ----------------------------------------
// CONFIGURATION 6: New Feature Highlight
// ----------------------------------------
const modalConfig = {
    enabled: true,
    autoClose: false,
    autoCloseDelay: 10000,
    showOnce: false,
    title: "✨ New Feature: Batch Processing",
    message: `
        <p><strong>Create multiple ID cards at once!</strong></p>
        <p>Import from Excel or CSV and generate hundreds of ID cards automatically.</p>
        <ul>
            <li>Import from Excel/CSV files</li>
            <li>Automatic data mapping</li>
            <li>Bulk export to PDF</li>
        </ul>
    `,
    icon: "mdi:file-multiple",
    actionButton: {
        show: true,
        text: "Learn More",
        link: "features.html"
    }
};

// ----------------------------------------
// CONFIGURATION 7: Survey/Feedback Request
// ----------------------------------------
const modalConfig = {
    enabled: true,
    autoClose: false,
    autoCloseDelay: 10000,
    showOnce: true,
    title: "💬 We Value Your Feedback!",
    message: `
        <p><strong>Help us improve IDLab</strong></p>
        <p>Take our 2-minute survey and get a chance to win premium templates!</p>
        <p>🎁 10 lucky participants will receive free premium access.</p>
    `,
    icon: "mdi:comment-question",
    actionButton: {
        show: true,
        text: "Take Survey",
        link: "https://yoursurvey.link"
    }
};

// ----------------------------------------
// CONFIGURATION 8: Holiday Greeting
// ----------------------------------------
const modalConfig = {
    enabled: true,
    autoClose: true,
    autoCloseDelay: 5000,
    showOnce: true,
    title: "🎄 Happy Holidays!",
    message: `
        <p><strong>Season's Greetings from IDLab</strong></p>
        <p>Thank you for being part of our community!</p>
        <p>Wishing you a wonderful holiday season and a prosperous new year.</p>
    `,
    icon: "mdi:party-popper",
    actionButton: {
        show: false
    }
};

// ----------------------------------------
// CONFIGURATION 9: Disabled (No Modal)
// ----------------------------------------
const modalConfig = {
    enabled: false,  // Modal will not show
    autoClose: true,
    autoCloseDelay: 10000,
    showOnce: false,
    title: "",
    message: "",
    icon: "mdi:bell-ring",
    actionButton: {
        show: false
    }
};

// ----------------------------------------
// POPULAR ICONIFY ICONS
// ----------------------------------------
// Announcements: mdi:megaphone, mdi:bullhorn
// Updates: mdi:rocket-launch, mdi:auto-fix
// Events: mdi:calendar-star, mdi:calendar-check
// Warnings: mdi:alert-circle, mdi:alert
// Success: mdi:check-circle, mdi:check-bold
// Info: mdi:information, mdi:lightbulb
// Gifts/Promos: mdi:gift, mdi:sale, mdi:tag-percent
// Welcome: mdi:hand-wave, mdi:account-star
// Features: mdi:star, mdi:new-box, mdi:sparkles
// Feedback: mdi:comment-question, mdi:message-star

// Browse more at: https://icon-sets.iconify.design/mdi/
