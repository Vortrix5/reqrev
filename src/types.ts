// Type definitions for ReqRev Chrome Extension

/**
 * Requirement interface matching the ReqRev data model
 */
export interface Requirement {
    id: string;          // Format: REQ-1, REQ-2, etc.
    title: string;       // Short title/summary
    description: string; // Detailed description
    createdAt: string;   // ISO timestamp
    updatedAt: string;   // ISO timestamp
}

/**
 * Storage key structure for per-repo requirements
 */
export interface StorageSchema {
    [key: `requirements:${string}/${string}`]: Requirement[];
}

/**
 * Chrome Storage API helpers
 */
declare global {
    interface Window {
        chrome: typeof chrome;
    }
}

export { };

