# 🌓 Dark Mode Feature - IDLab Website

## Overview
A comprehensive dark mode implementation has been added to the IDLab website, providing users with a comfortable viewing experience in low-light environments while maintaining the same vibrant color theme.

## ✨ Features

### System Preference Detection (New!)
- **Automatic Theme Detection**: If you haven't chosen a theme, the site automatically uses your OS/browser dark mode setting
- **Live Updates**: Changes to your system color scheme are instantly reflected on the page
- **User Choice Priority**: Once you click the toggle button, your preference is saved and system changes won't override it

### Automatic Persistence
- **LocalStorage Integration**: Your theme preference is automatically saved when you use the toggle
- **Cross-page Consistency**: Theme persists across all pages during your session
- **Instant Loading**: Theme applies before page render to prevent flashing

### Smooth Transitions
- **Seamless Switching**: All elements transition smoothly between themes
- **No Flash**: Dark mode loads instantly on page load if previously selected
- **Animated Toggle**: Beautiful floating button with icon transitions

### Complete Coverage
All pages support dark mode:
- ✅ Home (`index.html`)
- ✅ About (`about.html`)
- ✅ Download (`download.html`)
- ✅ Features (`features.html`)
- ✅ Pricing (`pricing.html`)
- ✅ Tutorial (`tutorial.html`)
- ✅ Documentation (`documentation.html`)
- ✅ Privacy Policy (`privacy.html`)
- ✅ Terms of Service (`terms.html`)
- ✅ Paid Templates (`paid-templates.html`)
- ✅ Modal Test Page (`modal-test.html`)

## 🎨 Color Theme

### Light Mode (Default)
- **Primary Color**: #1bc098 (Teal)
- **Background**: #ffffff (White)
- **Alt Background**: #f7fbfa (Light Gray)
- **Text**: #2c3e50 (Dark Gray)
- **Borders**: #e2ecea (Light Border)

### Dark Mode
- **Primary Color**: #1bc098 (Same Teal - maintains brand identity)
- **Background**: #1a1f2e (Dark Blue-Gray)
- **Alt Background**: #242938 (Slightly Lighter Dark)
- **Text**: #e8eef3 (Light Gray)
- **Borders**: #2f3647 (Dark Border)

## 🎯 Usage

### For Users

#### Automatic Behavior
1. **First Visit**: The site automatically matches your operating system's dark/light mode preference
2. **System Changes**: If you change your OS color scheme (e.g., Windows dark mode), the site updates automatically
3. **Manual Override**: Click the toggle button to choose your own preference

#### Toggle Button
1. **Location**: Fixed floating button in bottom-right corner
2. **Click to Switch**: Toggle between light and dark themes manually
3. **Icon Changes**: 
   - 🌙 Moon icon = Light mode active (click for dark)
   - ☀️ Sun icon = Dark mode active (click for light)
4. **Saved Preference**: Your manual choice overrides system settings and is remembered for future visits

#### Reset to System Preference
To let the site follow your OS setting again:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Type: `localStorage.removeItem('theme')`
4. Press Enter and refresh the page

### For Developers

#### CSS Variables Used
```css
:root {
    /* Light mode variables */
    --primary-color: #1bc098;
    --bg-main: #ffffff;
    --bg-alt: #f7fbfa;
    --text-dark: #2c3e50;
    --text-light: #666;
    --border: #e2ecea;
}

body.dark-mode {
    /* Dark mode overrides */
    --bg-main: #1a1f2e;
    --bg-alt: #242938;
    --text-dark: #e8eef3;
    --text-light: #b8c5d0;
    --border: #2f3647;
}
```

#### JavaScript API
```javascript
// Toggle dark mode programmatically
toggleDarkMode();

// Check current theme
const isDark = document.body.classList.contains('dark-mode');

// Force dark mode
document.body.classList.add('dark-mode');
localStorage.setItem('theme', 'dark');

// Force light mode
document.body.classList.remove('dark-mode');
localStorage.setItem('theme', 'light');
```

## 📁 Modified Files

### 1. `styles/styles.css`
- Added CSS variables for theming
- Added `.dark-mode` class styles
- Added dark mode toggle button styles
- Added smooth transitions for theme switching

### 2. `scripts/main.js`
- Added system color scheme detection using `prefers-color-scheme` media query
- Added automatic dark mode if system preference is dark (when no saved preference exists)
- Added listener for system color scheme changes with automatic theme updates
- Added dark mode toggle function with localStorage persistence
- Added icon update logic
- User manual choice always takes precedence over system preference

### 3. All HTML Pages
- Added dark mode toggle button before navigation
- Button uses Iconify icons for moon/sun

## 🔧 Customization

### Change Dark Mode Colors
Edit the CSS variables in `styles/styles.css`:
```css
body.dark-mode {
    --bg-main: #your-color;
    --bg-alt: #your-color;
    --text-dark: #your-color;
    /* etc... */
}
```

### Change Toggle Button Position
Edit in `styles/styles.css`:
```css
.dark-mode-toggle {
    bottom: 30px;  /* Distance from bottom */
    right: 30px;   /* Distance from right */
}
```

### Change Toggle Button Colors
```css
.dark-mode-toggle {
    background: var(--gradient-accent); /* Light mode */
}

body.dark-mode .dark-mode-toggle {
    background: linear-gradient(135deg, #fbbf24, #f59e0b); /* Dark mode */
}
```

## 🎨 Styled Components

All major UI components support dark mode:
- ✅ Navigation bar
- ✅ Hero sections
- ✅ Cards (pricing, features, templates, etc.)
- ✅ Forms and inputs
- ✅ Modals and popups
- ✅ Tables
- ✅ Code blocks
- ✅ Footers
- ✅ Buttons
- ✅ Scrollbars
- ✅ Loading animations

## 🌟 Best Practices

1. **Respect System Preferences**: Site automatically follows OS color scheme for new users
2. **Maintain Contrast**: All text has sufficient contrast in both modes
3. **Consistent Branding**: Primary teal color (#1bc098) remains the same
4. **Smooth Transitions**: All color changes are animated (0.3s ease)
5. **Accessible**: ARIA labels on toggle button
6. **Performance**: Theme applies instantly on load without flash
7. **User Choice**: Manual preference persists across sessions and overrides system settings

## 🎯 Theme Priority Logic

The site applies themes in this order of precedence:

1. **User Manual Choice** (highest priority)
   - If you've clicked the toggle button, your choice is saved in `localStorage`
   - This overrides everything else

2. **System Preference** (fallback)
   - If no manual choice exists, the site checks `prefers-color-scheme`
   - Automatically updates when you change OS settings

3. **Light Mode** (default)
   - Only used if browser doesn't support `prefers-color-scheme`

## 🐛 Troubleshooting

### Theme not persisting after I clicked the toggle
- Check browser localStorage is enabled
- Clear cache and reload
- Verify no browser extensions are blocking localStorage

### Theme not following my OS setting
- You may have previously clicked the toggle button, which saves a manual preference
- To reset: Open Developer Tools Console, run `localStorage.removeItem('theme')`, then refresh
- Check your browser supports `prefers-color-scheme` (all modern browsers do)

### Flash of light theme on page load
- Theme is applied on DOMContentLoaded
- Check JavaScript is loading correctly
- Verify `main.js` is included with `defer` attribute

### Site doesn't update when I change OS dark mode
- If you've manually clicked the toggle button, the site won't auto-update (by design)
- To re-enable system tracking: `localStorage.removeItem('theme')` in console, then refresh

### Elements not switching
- Ensure elements use CSS variables (--var-name)
- Check for hardcoded colors in inline styles

## 📱 Mobile Support

- Touch-friendly toggle button (50px × 50px on mobile)
- Optimized positioning for mobile screens
- Same functionality across all devices

## ♿ Accessibility

- ✅ Proper ARIA labels on toggle button
- ✅ High contrast in both modes
- ✅ Keyboard accessible (can be tabbed to)
- ✅ Screen reader friendly
- ✅ Respects user's system preferences (can be enhanced)

## 🚀 Future Enhancements

Potential improvements:
- [ ] Respect system theme preference (prefers-color-scheme)
- [ ] Add theme transition animations
- [ ] Theme selector (light/dark/auto)
- [ ] Custom color themes
- [ ] Time-based auto-switching

## 📄 License

Part of the IDLab website project. All rights reserved © 2025 IDLab.

---

**Enjoy the dark mode!** 🌙
