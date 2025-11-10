// Type definitions for ReqRev Chrome Extension

/**
 * Requirement interface matching the ReqRev data model
 */
export interface Requirement {
    id: string;              // Format: REQ-1, REQ-2, etc.
    description: string;     // Detailed description
    activityPoints?: number; // LLM evaluation score (0-100), optional for backward compatibility
    flags?: string[];        // Array of flag types from LLM evaluation
    createdAt: string;       // ISO timestamp
    updatedAt: string;       // ISO timestamp
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

