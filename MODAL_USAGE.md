# Announcement Modal Usage Guide

## Overview
The announcement modal is a centered popup that appears automatically when the page loads. It's perfect for displaying:
- Software release announcements
- Meeting notifications
- Event alerts
- Important updates
- Promotional messages

## Features
✅ Auto-display on page load (configurable)  
✅ Centered with dimmed background  
✅ Smooth animations (fade in/out, scale, bounce)  
✅ Close button (X) in top-right corner  
✅ Auto-close after specified time (optional)  
✅ Show once per session (optional)  
✅ Fully customizable content  
✅ Responsive design  
✅ Keyboard accessible (ESC to close)  

## Basic Configuration

The modal is controlled by the `modalConfig` object in `scripts/main.js`:

```javascript
const modalConfig = {
    enabled: true,              // Set to false to disable modal
    autoClose: true,            // Auto-close after delay
    autoCloseDelay: 10000,      // Time in milliseconds (10 seconds)
    showOnce: false,            // Show only once per browser session
    title: "🎉 New Release Available!",
    message: `
        <p><strong>IDLab v2.0 is now available!</strong></p>
        <p>What's new:</p>
        <ul>
            <li>Enhanced template editor</li>
            <li>Batch ID card generation</li>
        </ul>
    `,
    icon: "mdi:bell-ring",      // Iconify icon
    actionButton: {
        show: true,
        text: "Download Now",
        link: "download.html"
    }
};
```

## How to Enable/Disable

### To Show the Modal:
Set `enabled: true` in `modalConfig`

### To Hide the Modal:
Set `enabled: false` in `modalConfig`

## Common Use Cases

### 1. Software Release Announcement
```javascript
const modalConfig = {
    enabled: true,
    autoClose: false,  // Let user close manually
    title: "🚀 IDLab v3.0 Released!",
    message: `
        <p>We're excited to announce IDLab v3.0!</p>
        <ul>
            <li>AI-powered template suggestions</li>
            <li>Real-time collaboration</li>
            <li>100+ new templates</li>
        </ul>
    `,
    icon: "mdi:rocket-launch",
    actionButton: {
        show: true,
        text: "Download Update",
        link: "download.html"
    }
};
```

### 2. Meeting/Event Notification
```javascript
const modalConfig = {
    enabled: true,
    autoClose: true,
    autoCloseDelay: 8000,
    showOnce: true,  // Show only once
    title: "📅 Upcoming Webinar",
    message: `
        <p><strong>Join us for a live demo!</strong></p>
        <p>Date: October 25, 2025</p>
        <p>Time: 2:00 PM GMT</p>
        <p>Learn how to create professional ID cards in minutes.</p>
    `,
    icon: "mdi:calendar-star",
    actionButton: {
        show: true,
        text: "Register Now",
        link: "https://yourwebinar.link"
    }
};
```

### 3. Simple Alert Message
```javascript
const modalConfig = {
    enabled: true,
    autoClose: true,
    autoCloseDelay: 5000,
    title: "⚠️ Maintenance Notice",
    message: `
        <p>Scheduled maintenance on October 22, 2025</p>
        <p>Expected downtime: 2 hours (2:00 AM - 4:00 AM GMT)</p>
    `,
    icon: "mdi:alert-circle",
    actionButton: {
        show: false  // No action button
    }
};
```

### 4. Promotional Message
```javascript
const modalConfig = {
    enabled: true,
    autoClose: false,
    title: "🎁 Limited Time Offer!",
    message: `
        <p><strong>50% OFF Premium Templates</strong></p>
        <p>Use code: <strong>SAVE50</strong></p>
        <p>Offer ends October 31, 2025</p>
    `,
    icon: "mdi:gift",
    actionButton: {
        show: true,
        text: "Shop Now",
        link: "pricing.html"
    }
};
```

## Advanced Usage

### Show Modal Programmatically
You can trigger the modal from browser console or other scripts:

```javascript
// Show modal with custom content
showModal({
    enabled: true,
    title: "Custom Title",
    message: "<p>Custom message</p>"
});

// Update content and show
updateModalContent(
    "New Title", 
    "<p>New message</p>", 
    "mdi:information"
);
showAnnouncementModal();

// Close modal programmatically
closeAnnouncementModal();
```

## Available Iconify Icons

Change the `icon` property to use different icons:

- `mdi:bell-ring` - Notifications/Alerts
- `mdi:rocket-launch` - Launches/Releases
- `mdi:calendar-star` - Events
- `mdi:gift` - Promotions
- `mdi:alert-circle` - Warnings
- `mdi:information` - Info messages
- `mdi:check-circle` - Success messages
- `mdi:star` - Featured content
- `mdi:megaphone` - Announcements
- `mdi:bullhorn` - Important updates

Browse more icons at: https://icon-sets.iconify.design/mdi/

## Customization

### Change Colors
Edit in `styles/styles.css`:

```css
.modal-icon {
    color: #1bc098;  /* Change icon color */
}

.modal-btn-primary {
    background: linear-gradient(135deg, #1bc098, #18a882);  /* Change button color */
}
```

### Adjust Timing
```javascript
autoCloseDelay: 5000,  // 5 seconds
autoCloseDelay: 15000, // 15 seconds
autoCloseDelay: 30000, // 30 seconds
```

### Modal Size
Edit in `styles/styles.css`:

```css
.modal-container {
    max-width: 500px;  /* Adjust width */
}
```

## Best Practices

1. **Don't overuse** - Use sparingly for important announcements only
2. **Keep messages short** - Users should be able to read in 5-10 seconds
3. **Use appropriate icons** - Match icon to message type
4. **Test timing** - Ensure auto-close gives enough reading time
5. **Consider mobile** - Modal is responsive but test on mobile devices
6. **Use showOnce for recurring visitors** - Avoid annoying repeat visitors

## Troubleshooting

### Modal not appearing?
- Check `enabled: true` in modalConfig
- Verify modal HTML is in index.html
- Check browser console for errors

### Modal appears but content is wrong?
- Update `title`, `message`, and other fields in modalConfig
- Ensure HTML in message is valid

### Auto-close not working?
- Verify `autoClose: true`
- Check `autoCloseDelay` value (in milliseconds)

### Modal shows every time?
- Set `showOnce: true` to show only once per session
- Clear sessionStorage to reset: `sessionStorage.clear()`

## Files Modified

1. **index.html** - Modal HTML structure
2. **styles/styles.css** - Modal styling and animations
3. **scripts/main.js** - Modal logic and configuration

---

**Need help?** Contact IDLab support or refer to the documentation.
