/**
 * ReqRev Content Script
 * 
 * Entry point for the ReqRev Chrome extension.
 * Injects a "Requirements" tab into GitHub repository pages.
 */

import { TIMING } from './constants';
import { isExtensionContextValid } from './utils/extensionContext';
import { getNavBar } from './utils/githubDOM';
import { getRepoIdentifier, isRepoPage, parseRepoInfo } from './utils/githubNavigation';
import { shouldShowRequirementsTab } from './utils/githubPermissions';
import { PanelManager } from './utils/PanelManager';
import { injectTab, removeTab } from './utils/tabInjection';

// Global state
let panelManager: PanelManager | null = null;
let lastUrl = location.href;
let lastRepoId = getRepoIdentifier();

/**
 * Initialize the extension
 */
const init = async (): Promise<void> => {
    console.log('[ReqRev] Initializing extension...');

    if (!isExtensionContextValid()) {
        console.warn('[ReqRev] Extension context invalidated. Please refresh the page.');
        return;
    }

    if (!isRepoPage()) {
        console.log('[ReqRev] Not a repository page, skipping');
        return;
    }

    const repoId = getRepoIdentifier();
    const repoInfo = parseRepoInfo();

    console.log('[ReqRev] On repository page:', repoId);

    if (!repoId || !repoInfo) {
        console.error('[ReqRev] Could not determine repository identifier');
        return;
    }

    // Check if user has permissions to see the Requirements tab
    const hasPermissions = await shouldShowRequirementsTab(repoInfo.org, repoInfo.repo);

    if (!hasPermissions) {
        console.log('[ReqRev] User does not have write access to this repository, skipping tab injection');
        return;
    }

    console.log('[ReqRev] User has required permissions, proceeding with tab injection');

    // Initialize panel manager
    panelManager = new PanelManager(repoId, () => {
        // This callback is called when the panel is toggled
    });

    // Inject tab with retry logic
    attemptInjection();
};

/**
 * Attempt to inject the tab into GitHub's navigation
 */
const attemptInjection = (): void => {
    let attempts = 0;
    const maxAttempts = TIMING.MAX_INJECTION_ATTEMPTS;

    const tryInject = () => {
        attempts++;

        const navBar = getNavBar();

        if (navBar && panelManager) {
            const success = injectTab((e) => {
                e.preventDefault();
                panelManager!.toggle();
            });

            if (success) {
                panelManager.createPanel();
                panelManager.watchGitHubTabs();
            }
        } else if (attempts < maxAttempts) {
            console.log(`[ReqRev] Attempt ${attempts}/${maxAttempts}: Navigation not ready, retrying...`);
            setTimeout(tryInject, TIMING.INJECTION_RETRY_INTERVAL);
        } else {
            console.error('[ReqRev] Failed to find navigation bar after maximum attempts');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInject);
    } else {
        tryInject();
    }
};

/**
 * Handle GitHub's client-side navigation
 */
const handleNavigation = (): void => {
    new MutationObserver(() => {
        const currentUrl = location.href;
        const currentRepoId = getRepoIdentifier();

        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;

            // Check if we switched repositories
            if (currentRepoId !== lastRepoId) {
                console.log('[ReqRev] Repository changed, re-initializing...');
                lastRepoId = currentRepoId;

                // Clean up existing elements
                if (panelManager) {
                    panelManager.remove();
                    panelManager = null;
                }
                removeTab();

                // Re-initialize if still on a repo page
                if (isRepoPage()) {
                    setTimeout(async () => await init(), TIMING.NAVIGATION_REINIT_DELAY);
                }
            }
        }
    }).observe(document, { subtree: true, childList: true });
};

// Start the extension
(async () => {
    await init();
    handleNavigation();
})();
