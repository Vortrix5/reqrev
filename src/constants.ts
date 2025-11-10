/**
 * Constants and Configuration
 * Centralized configuration for the ReqRev extension
 */

export const SELECTORS = {
    NAV_BAR: 'nav[aria-label="Repository"] ul.UnderlineNav-body',
    NAV_ITEM: 'a.UnderlineNav-item',
    MAIN_CONTENT: 'div[role="main"]',
    MAIN_TAG: 'main',
    CONTAINER_XL: '.container-xl',
} as const;

export const IDS = {
    TAB: 'reqrev-tab',
    PANEL_CONTAINER: 'reqrev-panel-container',
    COUNT_BADGE: 'reqrev-count',
} as const;

export const CSS_CLASSES = {
    PANEL_HIDDEN: 'reqrev-panel-hidden',
    PANEL_VISIBLE: 'reqrev-panel-visible',
    TAB_SELECTED: 'selected',
    UNDERLINE_NAV_ITEM: 'UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item',
} as const;

export const ATTRIBUTES = {
    TAB_ITEM: 'data-tab-item',
    ARIA_SELECTED: 'aria-selected',
    ARIA_CURRENT: 'aria-current',
    ROLE: 'role',
} as const;

export const TAB_NAMES = {
    REQUIREMENTS: 'reqrev-requirements',
} as const;

export const TIMING = {
    INJECTION_RETRY_INTERVAL: 500,
    MAX_INJECTION_ATTEMPTS: 10,
    TAB_ENFORCEMENT_INTERVAL: 100,
    PANEL_CREATION_DELAY: 100,
    TAB_RESET_DELAY: 100,
    NAVIGATION_REINIT_DELAY: 500,
} as const;

export const EXCLUDED_GITHUB_PAGES = [
    'settings',
    'notifications',
    'explore',
    'marketplace',
] as const;

export const STORAGE_PREFIX = 'requirements:' as const;

export const DEFAULT_REQUIREMENT_PREFIX = 'REQ-' as const;
