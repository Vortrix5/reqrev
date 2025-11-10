/**
 * Extension Context Utilities
 * Helper functions for checking Chrome extension context validity
 */

/**
 * Check if extension context is still valid
 * Returns false if the extension was reloaded or disabled
 */
export const isExtensionContextValid = (): boolean => {
    try {
        return !!(chrome.runtime && chrome.runtime.id);
    } catch (e) {
        return false;
    }
};

/**
 * Safely execute a function that requires extension context
 * Shows user-friendly error if context is invalid
 */
export const safeExtensionCall = async <T>(
    fn: () => Promise<T>,
    errorMessage = 'Extension was reloaded. Please refresh the page.'
): Promise<T | null> => {
    try {
        if (!isExtensionContextValid()) {
            console.warn('[ReqRev] Extension context invalidated');
            alert(errorMessage);
            return null;
        }
        return await fn();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
            console.warn('[ReqRev] Extension was reloaded');
            alert(errorMessage);
            return null;
        }
        throw error;
    }
};
