/**
 * GitHub DOM Utilities
 * Helper functions for interacting with GitHub's DOM structure
 */

import { ATTRIBUTES, CSS_CLASSES, IDS, SELECTORS } from '../constants';

/**
 * Get the repository navigation bar element
 */
export const getNavBar = (): HTMLElement | null => {
    return document.querySelector(SELECTORS.NAV_BAR) as HTMLElement;
};

/**
 * Get the main content container
 */
export const getMainContent = (): HTMLElement | null => {
    return document.querySelector(SELECTORS.MAIN_CONTENT) ||
        document.querySelector(SELECTORS.MAIN_TAG);
};

/**
 * Find the Pull Requests tab in the navigation
 */
export const findPullRequestsTab = (navBar: HTMLElement): Element | null => {
    return Array.from(navBar.children).find(child => {
        const link = child.querySelector('a');
        return link && link.textContent?.includes('Pull requests');
    }) || null;
};

/**
 * Check if the Requirements tab already exists
 */
export const requirementsTabExists = (): boolean => {
    return !!document.getElementById(IDS.TAB);
};

/**
 * Get the Requirements tab link element
 */
export const getRequirementsTabLink = (): Element | null => {
    return document.querySelector(`#${IDS.TAB} a`);
};

/**
 * Get the Requirements panel container
 */
export const getPanelContainer = (): HTMLElement | null => {
    return document.getElementById(IDS.PANEL_CONTAINER);
};

/**
 * Get all navigation tab links
 */
export const getAllNavTabs = (navBar?: HTMLElement | null): NodeListOf<Element> | null => {
    const nav = navBar || getNavBar();
    if (!nav) return null;
    return nav.querySelectorAll(SELECTORS.NAV_ITEM);
};

/**
 * Reset a tab to its default unselected state
 */
export const resetTabState = (tab: Element): void => {
    tab.setAttribute(ATTRIBUTES.ARIA_SELECTED, 'false');
    tab.classList.remove(CSS_CLASSES.TAB_SELECTED);
    tab.removeAttribute(ATTRIBUTES.ARIA_CURRENT);
    tab.className = 'UnderlineNav-item no-wrap js-responsive-underlinenav-item js-selected-navigation-item';
};

/**
 * Set tab as selected
 */
export const setTabSelected = (tab: Element, selected: boolean): void => {
    if (selected) {
        tab.setAttribute(ATTRIBUTES.ARIA_SELECTED, 'true');
        tab.classList.add(CSS_CLASSES.TAB_SELECTED);
    } else {
        tab.setAttribute(ATTRIBUTES.ARIA_SELECTED, 'false');
        tab.classList.remove(CSS_CLASSES.TAB_SELECTED);
    }
};

/**
 * Hide GitHub's default content
 */
export const hideGitHubContent = (): void => {
    const mainContent = getMainContent();
    if (mainContent) {
        Array.from(mainContent.children).forEach(child => {
            if (child.id !== IDS.PANEL_CONTAINER) {
                (child as HTMLElement).style.display = 'none';
            }
        });
    }

    const containerXL = document.querySelector(SELECTORS.CONTAINER_XL);
    if (containerXL) {
        (containerXL as HTMLElement).style.display = 'none';
    }
};

/**
 * Restore GitHub's default content visibility
 */
export const showGitHubContent = (): void => {
    const mainContent = getMainContent();
    if (mainContent) {
        Array.from(mainContent.children).forEach(child => {
            if (child.id !== IDS.PANEL_CONTAINER) {
                (child as HTMLElement).style.display = '';
            }
        });
    }

    const containerXL = document.querySelector(SELECTORS.CONTAINER_XL);
    if (containerXL) {
        (containerXL as HTMLElement).style.display = '';
    }
};

/**
 * Update the count badge in the Requirements tab
 */
export const updateCountBadge = (count: number): void => {
    const counter = document.getElementById(IDS.COUNT_BADGE);
    if (counter) {
        counter.textContent = count.toString();
    }
};
