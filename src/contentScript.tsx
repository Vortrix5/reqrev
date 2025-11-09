/**
 * ReqRev Content Script
 * 
 * Injects a "Requirements" tab into GitHub repository pages.
 * When clicked, displays a React-powered panel for managing requirements.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import RequirementsPanel from './components/RequirementsPanel';

// Detect if we're on a GitHub repository page
const isRepoPage = (): boolean => {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+)\/([^/]+)/);

    // Must have org/repo format and not be github.com root pages
    if (!match) return false;

    const [, org, repo] = match;
    const excludedPages = ['settings', 'notifications', 'explore', 'marketplace'];

    return !excludedPages.includes(org);
};

// Extract org/repo from current URL
const getRepoIdentifier = (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+)\/([^/]+)/);

    if (!match) return null;

    const [, org, repo] = match;
    return `${org}/${repo}`;
};

/**
 * Inject the "Requirements" tab into GitHub's navigation bar
 */
const injectRequirementsTab = (): void => {
    // Find the navigation bar (GitHub's tab container)
    const navBar = document.querySelector('nav[aria-label="Repository"] ul.UnderlineNav-body') as HTMLElement;

    if (!navBar) {
        console.log('[ReqRev] Navigation bar not found, retrying...');
        return;
    }

    // Check if tab already exists
    if (document.getElementById('reqrev-tab')) {
        console.log('[ReqRev] Tab already exists');
        return;
    }

    console.log('[ReqRev] Injecting Requirements tab');

    // Create the tab element matching GitHub's structure
    const tabItem = document.createElement('li');
    tabItem.className = 'd-flex';
    tabItem.id = 'reqrev-tab';

    const tabLink = document.createElement('a');
    tabLink.href = '#';
    tabLink.className = 'UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item';
    tabLink.setAttribute('data-tab-item', 'reqrev-requirements');
    tabLink.setAttribute('role', 'tab');
    tabLink.setAttribute('aria-selected', 'false');
    tabLink.innerHTML = `
    <svg class="octicon octicon-checklist UnderlineNav-octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
      <path fill="currentColor" d="M2.5 3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5ZM3 6a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1H3Zm-.5 3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5ZM6 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1H6Zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1H6Zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1H6Z"/>
    </svg>
    <span data-content="Requirements">Requirements</span>
    <span class="Counter" id="reqrev-count">0</span>
  `;

    // Add click handler to toggle panel
    tabLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleRequirementsPanel();
    });

    tabItem.appendChild(tabLink);

    // Find the Pull Requests tab and insert after it
    const pullRequestsTab = Array.from(navBar.children).find(child => {
        const link = child.querySelector('a');
        return link && link.textContent?.includes('Pull requests');
    });

    if (pullRequestsTab && pullRequestsTab.nextSibling) {
        navBar.insertBefore(tabItem, pullRequestsTab.nextSibling);
    } else {
        // Fallback: append at the end
        navBar.appendChild(tabItem);
    }

    console.log('[ReqRev] Tab injected successfully');
};

/**
 * Create and mount the Requirements panel
 */
const createRequirementsPanel = (): void => {
    // Check if panel already exists
    if (document.getElementById('reqrev-panel-container')) {
        console.log('[ReqRev] Panel already exists');
        return;
    }

    const repoId = getRepoIdentifier();
    if (!repoId) {
        console.error('[ReqRev] Could not determine repository identifier');
        return;
    }

    console.log('[ReqRev] Creating panel for repo:', repoId);

    // Create container for the panel - make it a turbo-frame like GitHub uses
    const container = document.createElement('turbo-frame');
    container.id = 'reqrev-panel-container';
    container.className = 'reqrev-panel-hidden';
    container.setAttribute('data-turbo-action', 'advance');

    // Find GitHub's main content area (where turbo-frames live)
    const mainContent = document.querySelector('div[role="main"]') || document.querySelector('main');

    if (mainContent) {
        // Insert as first child in main content area
        mainContent.insertBefore(container, mainContent.firstChild);
    } else {
        document.body.appendChild(container);
    }

    // Mount React component
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <RequirementsPanel repoId={repoId} onClose={toggleRequirementsPanel} />
        </React.StrictMode>
    );

    console.log('[ReqRev] Panel mounted successfully');
};

// Store interval ID for enforcement
let tabEnforcementInterval: number | null = null;

/**
 * Toggle the visibility of the Requirements panel
 */
const toggleRequirementsPanel = (): void => {
    const container = document.getElementById('reqrev-panel-container');

    if (!container) {
        createRequirementsPanel();
        // Wait for next tick to toggle visibility
        setTimeout(() => {
            const newContainer = document.getElementById('reqrev-panel-container');
            if (newContainer) {
                newContainer.classList.remove('reqrev-panel-hidden');
                newContainer.classList.add('reqrev-panel-visible');
                updateTabStates(true);
                startTabEnforcement();
            }
        }, 100);
        return;
    }

    // Toggle visibility
    if (container.classList.contains('reqrev-panel-hidden')) {
        container.classList.remove('reqrev-panel-hidden');
        container.classList.add('reqrev-panel-visible');
        updateTabStates(true);
        startTabEnforcement();
    } else {
        container.classList.remove('reqrev-panel-visible');
        container.classList.add('reqrev-panel-hidden');
        updateTabStates(false);
        stopTabEnforcement();
    }
};

/**
 * Start enforcing Requirements tab state
 */
const startTabEnforcement = (): void => {
    stopTabEnforcement(); // Clear any existing interval

    // Enforce immediately
    enforceRequirementsTabState();

    // Then enforce every 100ms while panel is open
    tabEnforcementInterval = window.setInterval(() => {
        enforceRequirementsTabState();
    }, 100);
};

/**
 * Stop enforcing tab state
 */
const stopTabEnforcement = (): void => {
    if (tabEnforcementInterval !== null) {
        window.clearInterval(tabEnforcementInterval);
        tabEnforcementInterval = null;
    }
};

/**
 * Update tab states - ensure only Requirements tab is active when panel is open
 */
const updateTabStates = (isRequirementsActive: boolean): void => {
    // Update Requirements tab
    const reqrevTabLink = document.querySelector('#reqrev-tab a');
    if (reqrevTabLink) {
        if (isRequirementsActive) {
            reqrevTabLink.setAttribute('aria-selected', 'true');
            reqrevTabLink.classList.add('selected');

            // Hide ALL GitHub content - search in multiple possible containers
            const mainContent = document.querySelector('div[role="main"]');
            if (mainContent) {
                // Hide all direct children except our panel
                Array.from(mainContent.children).forEach(child => {
                    if (child.id !== 'reqrev-panel-container') {
                        (child as HTMLElement).style.display = 'none';
                    }
                });
            }

            // Also check for container-xl which might hold content
            const containerXL = document.querySelector('.container-xl');
            if (containerXL) {
                (containerXL as HTMLElement).style.display = 'none';
            }
        } else {
            reqrevTabLink.setAttribute('aria-selected', 'false');
            reqrevTabLink.classList.remove('selected');

            // Restore ALL GitHub content visibility
            const mainContent = document.querySelector('div[role="main"]');
            if (mainContent) {
                Array.from(mainContent.children).forEach(child => {
                    if (child.id !== 'reqrev-panel-container') {
                        (child as HTMLElement).style.display = '';
                    }
                });
            }

            // Restore container-xl
            const containerXL = document.querySelector('.container-xl');
            if (containerXL) {
                (containerXL as HTMLElement).style.display = '';
            }
        }
    }

    // Deactivate all other GitHub tabs when Requirements is active
    if (isRequirementsActive) {
        const navBar = document.querySelector('nav[aria-label="Repository"] ul.UnderlineNav-body');
        if (navBar) {
            const allTabs = navBar.querySelectorAll('a.UnderlineNav-item');

            const resetGitHubTabs = () => {
                allTabs.forEach(tab => {
                    if (tab !== reqrevTabLink) {
                        // Reset to default state - no selected class
                        tab.setAttribute('aria-selected', 'false');
                        tab.classList.remove('selected');
                        tab.removeAttribute('aria-current'); // Remove aria-current="page"
                        // Force base classes only
                        tab.className = 'UnderlineNav-item no-wrap js-responsive-underlinenav-item js-selected-navigation-item';
                    }
                });
            };

            // Reset immediately
            resetGitHubTabs();

            // Use requestAnimationFrame to ensure changes persist after GitHub's JS runs
            requestAnimationFrame(() => {
                resetGitHubTabs();
            });

            // Double-check after a small delay (GitHub's JS might run async)
            setTimeout(() => {
                resetGitHubTabs();
            }, 100);
        }
    }
};

/**
 * Monitor GitHub's tab changes and auto-close Requirements panel when another tab becomes active
 */
const watchGitHubTabs = (): void => {
    const navBar = document.querySelector('nav[aria-label="Repository"] ul.UnderlineNav-body');
    if (!navBar) return;

    // Use MutationObserver to watch for class changes on tab elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target as HTMLElement;

                // Check if a non-Requirements tab just became selected
                if (target.classList.contains('selected') &&
                    target.getAttribute('data-tab-item') !== 'reqrev-requirements') {

                    // Close Requirements panel
                    const container = document.getElementById('reqrev-panel-container');
                    if (container && container.classList.contains('reqrev-panel-visible')) {
                        container.classList.remove('reqrev-panel-visible');
                        container.classList.add('reqrev-panel-hidden');

                        // Remove selected state from Requirements tab
                        const reqrevTabLink = document.querySelector('#reqrev-tab a');
                        if (reqrevTabLink) {
                            reqrevTabLink.setAttribute('aria-selected', 'false');
                            reqrevTabLink.classList.remove('selected');
                        }
                    }
                }

                // If Requirements is active and another tab tries to become active, force it back
                const reqrevTabLink = document.querySelector('#reqrev-tab a');
                const container = document.getElementById('reqrev-panel-container');
                if (reqrevTabLink &&
                    container &&
                    container.classList.contains('reqrev-panel-visible') &&
                    target !== reqrevTabLink &&
                    target.classList.contains('selected')) {

                    // Force remove selected from other tabs when Requirements is active
                    target.classList.remove('selected');
                    target.setAttribute('aria-selected', 'false');
                    target.removeAttribute('aria-current'); // Remove aria-current="page"
                    // Reset to base classes only
                    target.className = 'UnderlineNav-item no-wrap js-responsive-underlinenav-item js-selected-navigation-item';
                }
            }
        });
    });

    // Observe all tab links for class and attribute changes
    const allTabs = navBar.querySelectorAll('a.UnderlineNav-item');
    allTabs.forEach(tab => {
        observer.observe(tab, {
            attributes: true,
            attributeFilter: ['class', 'aria-selected', 'aria-current']
        });
    });

    console.log('[ReqRev] Watching GitHub tabs for changes');
};

/**
 * Continuously enforce that only Requirements tab is selected when panel is open
 */
const enforceRequirementsTabState = (): void => {
    const container = document.getElementById('reqrev-panel-container');
    const reqrevTabLink = document.querySelector('#reqrev-tab a');

    if (container && reqrevTabLink && container.classList.contains('reqrev-panel-visible')) {
        const navBar = document.querySelector('nav[aria-label="Repository"] ul.UnderlineNav-body');
        if (navBar) {
            const allTabs = navBar.querySelectorAll('a.UnderlineNav-item');
            allTabs.forEach(tab => {
                if (tab !== reqrevTabLink) {
                    // Remove ALL active/selected states from GitHub tabs
                    tab.classList.remove('selected');
                    tab.setAttribute('aria-selected', 'false');
                    tab.removeAttribute('aria-current'); // Remove the aria-current="page" attribute!

                    // Ensure it has only the base classes
                    tab.className = 'UnderlineNav-item no-wrap js-responsive-underlinenav-item js-selected-navigation-item';
                }
            });

            // Ensure Requirements tab stays selected
            if (!reqrevTabLink.classList.contains('selected')) {
                reqrevTabLink.classList.add('selected');
                reqrevTabLink.setAttribute('aria-selected', 'true');
            }
        }
    }
};

/**
 * Check if extension context is still valid
 */
const isExtensionContextValid = (): boolean => {
    try {
        return !!(chrome.runtime && chrome.runtime.id);
    } catch (e) {
        return false;
    }
};

/**
 * Initialize the extension
 */
const init = (): void => {
    console.log('[ReqRev] Initializing extension...');

    // Check if extension context is valid
    if (!isExtensionContextValid()) {
        console.warn('[ReqRev] Extension context invalidated. Please refresh the page.');
        return;
    }

    if (!isRepoPage()) {
        console.log('[ReqRev] Not a repository page, skipping');
        return;
    }

    console.log('[ReqRev] On repository page:', getRepoIdentifier());

    // Inject tab with retry logic (GitHub uses client-side routing)
    let attempts = 0;
    const maxAttempts = 10;

    const tryInject = () => {
        attempts++;

        const navBar = document.querySelector('nav[aria-label="Repository"] ul.UnderlineNav-body');

        if (navBar) {
            injectRequirementsTab();
            createRequirementsPanel();
            // Watch GitHub tabs for changes to auto-close panel
            watchGitHubTabs();
        } else if (attempts < maxAttempts) {
            console.log(`[ReqRev] Attempt ${attempts}/${maxAttempts}: Navigation not ready, retrying...`);
            setTimeout(tryInject, 500);
        } else {
            console.error('[ReqRev] Failed to find navigation bar after maximum attempts');
        }
    };

    // Start injection attempts
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInject);
    } else {
        tryInject();
    }

    // Listen for GitHub's client-side navigation (pushState/replaceState)
    let lastUrl = location.href;
    let lastRepoId = getRepoIdentifier();

    new MutationObserver(() => {
        const currentUrl = location.href;
        const currentRepoId = getRepoIdentifier();

        // Only re-initialize if we changed repositories or left/entered a repo page
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;

            // Check if we're switching between different repos or to/from non-repo pages
            if (currentRepoId !== lastRepoId) {
                console.log('[ReqRev] Repository changed, re-initializing...');
                lastRepoId = currentRepoId;

                // Stop any running enforcement
                stopTabEnforcement();

                // Remove existing elements
                const existingTab = document.getElementById('reqrev-tab');
                const existingPanel = document.getElementById('reqrev-panel-container');

                if (existingTab) existingTab.remove();
                if (existingPanel) existingPanel.remove();

                // Re-initialize if still on a repo page
                if (isRepoPage()) {
                    setTimeout(tryInject, 500);
                }
            }
            // If we're still on the same repo (just changing tabs within repo), do nothing
            // The tab and panel already exist and work fine
        }
    }).observe(document, { subtree: true, childList: true });
};

// Start the extension
init();
