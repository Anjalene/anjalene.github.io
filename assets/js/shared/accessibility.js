// Focus management utilities
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Improved focus visibility
function enhanceFocusVisibility() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// Skip to main content functionality
function setupSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');
    
    skipLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
                
                // Remove tabindex after focus to maintain normal tab flow
                target.addEventListener('blur', () => {
                    target.removeAttribute('tabindex');
                }, { once: true });
            }
        });
    });
}

// Reduced motion detection and utilities
function respectReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function updateMotionPreference() {
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }
    
    // Set initial state
    updateMotionPreference();
    
    // Listen for changes
    prefersReducedMotion.addEventListener('change', updateMotionPreference);
}

// Announce page changes for screen readers
function announcePageChange(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
}

// High contrast mode detection (Windows specific)
function detectHighContrast() {
    const highContrastMedia = window.matchMedia('(prefers-contrast: more)');
    
    function updateContrastPreference() {
        if (highContrastMedia.matches) {
            document.body.classList.add('system-high-contrast');
        } else {
            document.body.classList.remove('system-high-contrast');
        }
    }
    
    // Set initial state
    updateContrastPreference();
    
    // Listen for changes
    highContrastMedia.addEventListener('change', updateContrastPreference);
}

// Keyboard navigation helpers
function setupUniversalKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Universal keyboard shortcuts
        if (e.key === 'Escape') {
            // Close any open modals, dropdowns, etc.
            document.dispatchEvent(new CustomEvent('escapePressed'));
        }
        
        // Enter and Space should activate buttons and links
        if ((e.key === 'Enter' || e.key === ' ') && 
            (e.target.tagName === 'BUTTON' || e.target.getAttribute('role') === 'button')) {
            if (e.key === ' ') {
                e.preventDefault(); // Prevent page scroll
            }
            e.target.click();
        }
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', () => {
    enhanceFocusVisibility();
    setupSkipLinks();
    respectReducedMotion();
    detectHighContrast();
    setupUniversalKeyboardNavigation();
});

// Export utilities for pages that need them
window.accessibility = {
    trapFocus,
    announcePageChange,
    enhanceFocusVisibility,
    respectReducedMotion
};