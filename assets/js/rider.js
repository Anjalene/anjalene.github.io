// Initialize content version synchronously
(function() {
    const savedContent = localStorage.getItem('contentVersion');
    const initialContent = savedContent || 'standard';
    document.body.setAttribute('data-content', initialContent);
})();

// Content version system (specific to rider page)
const easyReadBtn = document.querySelector('.easy-read-btn');
const contentVersions = document.querySelectorAll('.content-version');

function switchContent(version) {
    // Hide all content versions
    contentVersions.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected version
    const targetContent = document.querySelector(`.${version}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Update button state
    if (version === 'easy-read') {
        easyReadBtn.classList.add('active');
        easyReadBtn.textContent = 'hard read';
        easyReadBtn.setAttribute('aria-label', 'Switch to Standard version');
        // Force high-contrast theme for Easy Read mode
        if (window.themeSystem) {
            window.themeSystem.setTheme('hicontrast', false);
        }
    } else {
        easyReadBtn.classList.remove('active');
        easyReadBtn.textContent = 'easy read';
        easyReadBtn.setAttribute('aria-label', 'Switch to Easy Read version');
        // Restore saved theme when leaving Easy Read mode
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const restoreTheme = savedTheme || systemTheme;
        if (window.themeSystem) {
            window.themeSystem.setTheme(restoreTheme, false);
        }
    }
    
    // Save content preference
    localStorage.setItem('contentVersion', version);
    document.body.setAttribute('data-content', version);
    
    // Update theme button states
    if (window.themeSystem) {
        window.themeSystem.updateThemeButtonStates();
    }
    
    // Screen reader announcement
    if (window.themeSystem) {
        window.themeSystem.announceToScreenReader(
            `Switched to ${version === 'easy-read' ? 'Easy Read' : 'Standard'} content version`
        );
    }
}

function initializeContent() {
    const savedContent = localStorage.getItem('contentVersion');
    const initialContent = savedContent || 'standard';
    switchContent(initialContent);
}

// Navigation (specific to rider page sections)
const navIcons = document.querySelectorAll('.nav-icon');
const sections = document.querySelectorAll('section');

function updateActiveNav() {
    let current = 'intro';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
            current = section.id;
        }
    });

    navIcons.forEach(icon => {
        icon.classList.remove('active');
        if (icon.getAttribute('data-section') === current) {
            icon.classList.add('active');
        }
    });
    
    // Trigger button color update
    updateButtonColors();
}

// Button color management (FIXED VERSION)
function updateButtonColors() {
    const currentTheme = document.body.getAttribute('data-theme');
    const navIcons = document.querySelectorAll('.nav-icon');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const navContainer = document.querySelector('.nav-and-themes');
    
    // Skip color updates for high-contrast mode
    if (currentTheme === 'hicontrast') return;
    
    // 80s theme colors
    const colors = {
        light: { default: '#7B5B95', hover: '#4A3B6B', active: '#CCFF00' },
        dark: { default: '#9B7BB5', hover: '#D4B8E8', active: '#CCFF00' }
    };
    
    const currentColors = colors[currentTheme];
    const isHovering = navContainer && navContainer.classList.contains('hover-state');
    
    // Handle NAV ICONS (use stroke)
    navIcons.forEach(button => {
        const svg = button.querySelector('svg');
        if (!svg) return;
        
        if (button.classList.contains('active')) {
            svg.style.stroke = currentColors.active;
        } else if (button.matches(':hover')) {
            svg.style.stroke = currentColors.active;
        } else if (isHovering && !button.matches(':hover') && !button.classList.contains('active')) {
            svg.style.stroke = currentColors.hover;
        } else {
            svg.style.stroke = currentColors.default;
        }
    });
    
    // Handle THEME BUTTONS (use fill) - THIS WAS THE BUG FIX
    themeButtons.forEach(button => {
        const svg = button.querySelector('svg');
        if (!svg) return;
        
        // Skip styling for disabled buttons
        if (button.classList.contains('disabled')) return;
        
        if (button.classList.contains('active')) {
            svg.style.fill = currentColors.active;
        } else if (button.matches(':hover')) {
            svg.style.fill = currentColors.active;
        } else if (isHovering && !button.matches(':hover') && !button.classList.contains('active')) {
            svg.style.fill = currentColors.hover;
        } else {
            svg.style.fill = currentColors.default;
        }
    });
}

// Event listeners for rider-specific functionality
easyReadBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const currentContent = document.body.getAttribute('data-content');
    const newContent = currentContent === 'standard' ? 'easy-read' : 'standard';
    switchContent(newContent);
});

// Navigation container hover effects (rider page specific)
const navContainer = document.querySelector('.nav-and-themes');
if (navContainer) {
    navContainer.addEventListener('mouseenter', () => {
        navContainer.classList.add('hover-state');
        updateButtonColors();
    });
    
    navContainer.addEventListener('mouseleave', () => {
        navContainer.classList.remove('hover-state');
        updateButtonColors();
    });
}

// Button hover effects for header icons only
document.querySelectorAll('.nav-icon, .theme-btn').forEach(button => {
    button.addEventListener('mouseenter', updateButtonColors);
    button.addEventListener('mouseleave', updateButtonColors);
});

// Section navigation (rider page specific)
navIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = icon.getAttribute('data-section');
        const currentContent = document.body.getAttribute('data-content');
        const contentSelector = currentContent === 'easy-read' ? '.easy-read-content' : '.standard-content';
        const target = document.querySelector(`${contentSelector} #${targetId}`);
        
        if (target) {
            const offsetTop = target.offsetTop - 120;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll handling for navigation
window.addEventListener('scroll', updateActiveNav);

// Keyboard navigation for rider-specific elements
document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('nav-icon') || e.target.classList.contains('easy-read-btn')) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.target.click();
        }
    }
});

// Listen for theme system events
document.addEventListener('themeChanged', (e) => {
    updateButtonColors();
});

// Listen for content switching requests from theme system
document.addEventListener('switchContentRequested', (e) => {
    switchContent(e.detail.content);
});

// Initialize rider page
document.addEventListener('DOMContentLoaded', () => {
    initializeContent();
    updateActiveNav();
    requestAnimationFrame(updateButtonColors);
});