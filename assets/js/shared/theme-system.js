// Initialize theme synchronously
(function() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    document.body.setAttribute('data-theme', initialTheme);
})();

// Theme system
function updateThemeButtonStates() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const currentContent = document.body.getAttribute('data-content');
    const isEasyRead = currentContent === 'easy-read';
    
    themeButtons.forEach(btn => {
        if (isEasyRead) {
            // Disable theme buttons in Easy Read mode except high-contrast
            if (btn.getAttribute('data-theme') !== 'hicontrast') {
                btn.classList.add('disabled');
                btn.setAttribute('aria-disabled', 'true');
                btn.setAttribute('title', 'Theme selection disabled in Easy Read mode');
            } else {
                btn.classList.remove('disabled');
                btn.removeAttribute('aria-disabled');
                btn.removeAttribute('title');
                btn.classList.add('active');
            }
        } else {
            // Enable all theme buttons in standard mode
            btn.classList.remove('disabled');
            btn.removeAttribute('aria-disabled');
            btn.removeAttribute('title');
            
            // Update active state based on current theme
            const currentTheme = document.body.getAttribute('data-theme');
            if (btn.getAttribute('data-theme') === currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

function setTheme(theme, savePreference = true) {
    document.body.setAttribute('data-theme', theme);
    if (savePreference) {
        localStorage.setItem('theme', theme);
    }
    updateThemeButtonStates();
    
    // Trigger custom event for page-specific theme updates
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: theme } 
    }));
    
    // Basic screen reader announcement
    announceToScreenReader(`Theme changed to ${theme} mode`);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
}

// Theme button event listeners
function setupThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if button is disabled
            if (btn.classList.contains('disabled')) {
                return;
            }
            
            const selectedTheme = btn.getAttribute('data-theme');
            const currentContent = document.body.getAttribute('data-content');
            
            // If in Easy Read mode and clicking light/dark theme, switch to standard mode
            if (currentContent === 'easy-read' && (selectedTheme === 'light' || selectedTheme === 'dark')) {
                // Trigger custom event for content switching (if page supports it)
                document.dispatchEvent(new CustomEvent('switchContentRequested', {
                    detail: { content: 'standard' }
                }));
                setTheme(selectedTheme);
            } else {
                setTheme(selectedTheme);
            }
        });
    });
}

// System theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme');
    const currentContent = document.body.getAttribute('data-content');
    // Don't change theme automatically if in Easy Read mode or if user has saved preference
    if (!savedTheme && currentContent !== 'easy-read') {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
    }
});

// Keyboard navigation for theme buttons
function setupThemeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('theme-btn')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                
                // Don't allow keyboard navigation if button is disabled
                if (e.target.classList.contains('disabled')) {
                    return;
                }
                
                const currentTheme = document.body.getAttribute('data-theme');
                const themes = ['light', 'dark', 'hicontrast'];
                const currentIndex = themes.indexOf(currentTheme);
                
                let nextIndex;
                if (e.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % themes.length;
                } else {
                    nextIndex = (currentIndex - 1 + themes.length) % themes.length;
                }
                
                const newTheme = themes[nextIndex];
                const currentContent = document.body.getAttribute('data-content');
                
                // If in Easy Read mode and navigating to light/dark, switch to standard mode
                if (currentContent === 'easy-read' && (newTheme === 'light' || newTheme === 'dark')) {
                    document.dispatchEvent(new CustomEvent('switchContentRequested', {
                        detail: { content: 'standard' }
                    }));
                }
                
                setTheme(newTheme);
            }
        }
    });
}

// Screen reader announcement utility
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
}

// Initialize theme system on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupThemeButtons();
    setupThemeKeyboardNavigation();
});

// Export functions for pages that need them
window.themeSystem = {
    setTheme,
    updateThemeButtonStates,
    announceToScreenReader
};