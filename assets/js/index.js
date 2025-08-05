// Desktop interface functionality
(function() {
    'use strict';

    // Handle background image loading
    function checkImageLoad() {
        const img = new Image();
        img.onload = function() {
            console.log('Background image loaded successfully');
        };
        img.onerror = function() {
            console.warn('Could not load mainbg.png - using fallback gradient');
            const desktopContainer = document.querySelector('.desktop-container');
            if (desktopContainer) {
                desktopContainer.style.background = `
                    linear-gradient(135deg, #e8c5e8, #d4a5d4, #c085c0, #b675b6, #a865a8)
                `;
            }
        };
        img.src = './assets/images/mainbg.png';
    }

    // Enhanced folder navigation with keyboard support
    function setupFolderNavigation() {
        const folders = document.querySelectorAll('.folder');
        
        folders.forEach((folder, index) => {
            // Click handler
            folder.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                console.log(`Navigating to ${href}`);
                // Let the browser handle normal navigation
            });

            // Enhanced keyboard navigation
            folder.addEventListener('keydown', function(e) {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        focusNextFolder(index, folders);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        focusPreviousFolder(index, folders);
                        break;
                    case 'Home':
                        e.preventDefault();
                        folders[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        folders[folders.length - 1].focus();
                        break;
                }
            });

            // Add tabindex for keyboard navigation
            folder.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
    }

    function focusNextFolder(currentIndex, folders) {
        const nextIndex = (currentIndex + 1) % folders.length;
        updateFolderFocus(currentIndex, nextIndex, folders);
    }

    function focusPreviousFolder(currentIndex, folders) {
        const prevIndex = (currentIndex - 1 + folders.length) % folders.length;
        updateFolderFocus(currentIndex, prevIndex, folders);
    }

    function updateFolderFocus(oldIndex, newIndex, folders) {
        folders[oldIndex].setAttribute('tabindex', '-1');
        folders[newIndex].setAttribute('tabindex', '0');
        folders[newIndex].focus();
    }

    // Announce page load to screen readers
    function announcePageLoad() {
        if (window.accessibility && window.accessibility.announcePageChange) {
            window.accessibility.announcePageChange('Desktop interface loaded with 5 navigation folders');
        }
    }

    // Handle window resize for responsive layout
    function handleResize() {
        // Log viewport changes for debugging responsive issues
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        console.log(`Viewport: ${viewport.width}x${viewport.height}`);
        
        // Announce layout changes to screen readers if significant
        const isSmallScreen = viewport.width <= 768;
        const isShortScreen = viewport.height <= 600;
        
        if (isSmallScreen || isShortScreen) {
            setTimeout(() => {
                if (window.accessibility && window.accessibility.announcePageChange) {
                    window.accessibility.announcePageChange('Layout adjusted for smaller screen');
                }
            }, 500); // Delay to avoid too many announcements during resize
        }
    }

    // Initialize on DOM load
    function init() {
        checkImageLoad();
        setupFolderNavigation();
        announcePageLoad();
        
        // Add resize listener with throttling
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
    }

    // Wait for DOM and accessibility scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();