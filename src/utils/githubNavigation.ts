/**
 * GitHub Navigation Utilities
 * Helper functions for URL parsing and page detection
 */

import { EXCLUDED_GITHUB_PAGES } from '../constants';

/**
 * Parse repository information from GitHub URL
 */
export interface RepoInfo {
    org: string;
    repo: string;
    fullPath: string;
}

/**
 * Check if current page is a GitHub repository page
 */
export const isRepoPage = (): boolean => {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+)\/([^/]+)/);

    if (!match) return false;

    const [, org] = match;
    return !(EXCLUDED_GITHUB_PAGES as readonly string[]).includes(org);
};

/**
 * Extract org/repo identifier from current URL
 */
export const getRepoIdentifier = (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+)\/([^/]+)/);

    if (!match) return null;

    const [, org, repo] = match;
    return `${org}/${repo}`;
};

/**
 * Parse detailed repository information from URL
 */
export const parseRepoInfo = (): RepoInfo | null => {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+)\/([^/]+)/);

    if (!match) return null;

    const [, org, repo] = match;

    if ((EXCLUDED_GITHUB_PAGES as readonly string[]).includes(org)) {
        return null;
    }

    return {
        org,
        repo,
        fullPath: `${org}/${repo}`,
    };
};
