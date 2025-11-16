/**
 * Tab Injection Utilities
 * Handles creation and injection of the Requirements tab into GitHub's navigation
 */

import { ATTRIBUTES, CSS_CLASSES, IDS, TAB_NAMES } from '../constants';
import { findPullRequestsTab, getNavBar, requirementsTabExists } from './githubDOM';

/**
 * Create the Requirements tab element
 */
export const createTabElement = (onClick: (e: Event) => void): HTMLLIElement => {
    const tabItem = document.createElement('li');
    tabItem.className = 'd-flex';
    tabItem.id = IDS.TAB;

    const tabLink = document.createElement('a');
    tabLink.href = '#';
    tabLink.className = CSS_CLASSES.UNDERLINE_NAV_ITEM;
    tabLink.setAttribute(ATTRIBUTES.TAB_ITEM, TAB_NAMES.REQUIREMENTS);
    tabLink.setAttribute(ATTRIBUTES.ROLE, 'tab');
    tabLink.setAttribute(ATTRIBUTES.ARIA_SELECTED, 'false');
    tabLink.innerHTML = `
    <svg class="octicon octicon-checklist UnderlineNav-octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
      <path fill="currentColor" d="M2.5 3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5ZM3 6a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1H3Zm-.5 3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5ZM6 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1H6Zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1H6Zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1H6Z"/>
    </svg>
    <span data-content="Requirements">Requirements</span>
    <span class="Counter" id="${IDS.COUNT_BADGE}">0</span>
  `;

    tabLink.addEventListener('click', onClick);
    tabItem.appendChild(tabLink);

    return tabItem;
};

/**
 * Inject the Requirements tab into GitHub's navigation bar
 */
export const injectTab = (onClick: (e: Event) => void): boolean => {
    const navBar = getNavBar();

    if (!navBar) {
        console.log('[ReqRev] Navigation bar not found');
        return false;
    }

    if (requirementsTabExists()) {
        console.log('[ReqRev] Tab already exists');
        return true;
    }

    console.log('[ReqRev] Injecting Requirements tab');

    const tabItem = createTabElement(onClick);
    const pullRequestsTab = findPullRequestsTab(navBar);

    if (pullRequestsTab && pullRequestsTab.nextSibling) {
        navBar.insertBefore(tabItem, pullRequestsTab.nextSibling);
    } else {
        navBar.appendChild(tabItem);
    }

    console.log('[ReqRev] Tab injected successfully');
    return true;
};

/**
 * Remove the Requirements tab from the navigation
 */
export const removeTab = (): void => {
    const existingTab = document.getElementById(IDS.TAB);
    if (existingTab) {
        existingTab.remove();
    }
};
