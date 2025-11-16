/**
 * GitHub Permissions Utilities
 * Helper functions for checking user's repository permissions
 */

/**
 * Permission levels on GitHub repositories
 */
export type PermissionLevel = 'admin' | 'write' | 'read' | 'none';

export interface RepoPermissions {
    hasAccess: boolean;
    level: PermissionLevel;
    isOwner: boolean;
    isCollaborator: boolean;
}

/**
 * Check if user has write or admin access to the repository
 * This checks the DOM for indicators that the user has write/admin permissions
 */
export const hasWriteAccess = (): boolean => {
    // Method 1: Check for Settings tab (only visible to users with admin access)
    const settingsTab = document.querySelector('a[data-tab-item="settings-tab"]') ||
        document.querySelector('a[href*="/settings"]') ||
        document.querySelector('a[data-selected-links*="repo_settings"]');

    if (settingsTab) {
        return true;
    }

    // Method 2: Check for "Add file" or "Create new file" button
    const addFileButton = document.querySelector('[data-hotkey="c"]') ||
        document.querySelector('button:has-text("Add file")') ||
        document.querySelector('[aria-label*="Add file"]');

    if (addFileButton) {
        return true;
    }

    // Method 3: Check for edit buttons in the file browser
    const editButton = document.querySelector('[aria-label="Edit this file"]') ||
        document.querySelector('button[aria-label*="Edit"]');

    if (editButton) {
        return true;
    }

    // Method 4: Check the repository's data attributes or meta information
    const repoContainer = document.querySelector('[data-repository-permission]');
    if (repoContainer) {
        const permission = repoContainer.getAttribute('data-repository-permission');
        return permission === 'write' || permission === 'admin';
    }

    return false;
};

/**
 * Check if user is the repository owner
 * Compares the authenticated user with the repository owner
 */
export const isRepoOwner = async (repoOwner: string): Promise<boolean> => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    return currentUser.toLowerCase() === repoOwner.toLowerCase();
};

/**
 * Get the current authenticated GitHub user
 */
export const getCurrentUser = async (): Promise<string | null> => {
    // Method 1: Try to get from DOM - GitHub includes this in the page
    const userMenu = document.querySelector('meta[name="user-login"]');
    if (userMenu) {
        const username = userMenu.getAttribute('content');
        if (username) return username;
    }

    // Method 2: Try to get from navigation menu
    const avatarButton = document.querySelector('[data-login]');
    if (avatarButton) {
        const username = avatarButton.getAttribute('data-login');
        if (username) return username;
    }

    // Method 3: Try to get from user menu
    const detailsMenu = document.querySelector('details summary img[alt^="@"]');
    if (detailsMenu) {
        const alt = detailsMenu.getAttribute('alt');
        if (alt) {
            const match = alt.match(/@([^"]+)/);
            if (match) return match[1];
        }
    }

    return null;
};

/**
 * Check user's permissions for the repository using GitHub API
 * This is more reliable but requires API access
 */
export const checkRepoPermissions = async (owner: string, repo: string): Promise<RepoPermissions> => {
    const defaultPermissions: RepoPermissions = {
        hasAccess: false,
        level: 'none',
        isOwner: false,
        isCollaborator: false,
    };

    try {
        // First, check if user is authenticated
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.log('[ReqRev] User not authenticated');
            return defaultPermissions;
        }

        // Check if user is the owner
        const isOwner = currentUser.toLowerCase() === owner.toLowerCase();
        if (isOwner) {
            return {
                hasAccess: true,
                level: 'admin',
                isOwner: true,
                isCollaborator: false,
            };
        }

        // Try to use GitHub API to check permissions
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/collaborators/${currentUser}/permission`;

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            const permission = data.permission as string;

            const hasWriteAccess = permission === 'admin' || permission === 'write';

            return {
                hasAccess: hasWriteAccess,
                level: permission as PermissionLevel,
                isOwner: false,
                isCollaborator: hasWriteAccess,
            };
        } else if (response.status === 404) {
            // User is not a collaborator
            return defaultPermissions;
        } else if (response.status === 403) {
            // API rate limit or authentication issue - fall back to DOM detection
            console.warn('[ReqRev] API rate limited or unauthorized, falling back to DOM detection');
            return {
                hasAccess: hasWriteAccess(),
                level: hasWriteAccess() ? 'write' : 'read',
                isOwner: false,
                isCollaborator: hasWriteAccess(),
            };
        }

        return defaultPermissions;
    } catch (error) {
        console.error('[ReqRev] Error checking repository permissions:', error);

        // Fall back to DOM-based detection
        const domHasAccess = hasWriteAccess();
        return {
            hasAccess: domHasAccess,
            level: domHasAccess ? 'write' : 'none',
            isOwner: false,
            isCollaborator: domHasAccess,
        };
    }
};

/**
 * Determine if the Requirements tab should be shown for the current user and repository
 */
export const shouldShowRequirementsTab = async (owner: string, repo: string): Promise<boolean> => {
    const permissions = await checkRepoPermissions(owner, repo);

    // Show the tab if user is owner or has write/admin access
    const shouldShow = permissions.isOwner || permissions.isCollaborator ||
        permissions.level === 'admin' || permissions.level === 'write';

    console.log('[ReqRev] Permission check result:', {
        owner,
        repo,
        permissions,
        shouldShow,
    });

    return shouldShow;
};
