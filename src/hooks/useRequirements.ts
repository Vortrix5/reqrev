/**
 * React Hooks for Requirements Management
 * Reusable hooks for managing requirements state and storage
 */

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_REQUIREMENT_PREFIX, STORAGE_PREFIX } from '../constants';
import { Requirement } from '../types';
import { safeExtensionCall } from '../utils/extensionContext';

/**
 * Hook for managing requirements with Chrome storage persistence
 */
export const useRequirements = (repoId: string) => {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const storageKey = `${STORAGE_PREFIX}${repoId}`;

    /**
     * Load requirements from storage
     */
    useEffect(() => {
        const loadRequirements = async () => {
            const result = await safeExtensionCall(
                async () => chrome.storage.local.get(storageKey)
            );

            if (!result) {
                setIsLoading(false);
                return;
            }

            if (result[storageKey] && Array.isArray(result[storageKey])) {
                setRequirements(result[storageKey]);
            } else {
                // Initialize with sample requirements
                const sampleRequirements = createSampleRequirements();
                const saveResult = await safeExtensionCall(
                    async () => chrome.storage.local.set({ [storageKey]: sampleRequirements })
                );

                if (saveResult !== null) {
                    setRequirements(sampleRequirements);
                }
            }

            setIsLoading(false);
        };

        loadRequirements();
    }, [repoId, storageKey]);

    /**
     * Save requirements to storage
     */
    const saveRequirements = useCallback(async (updatedRequirements: Requirement[]) => {
        const result = await safeExtensionCall(
            async () => chrome.storage.local.set({ [storageKey]: updatedRequirements })
        );

        if (result !== null) {
            setRequirements(updatedRequirements);
            return true;
        }
        return false;
    }, [storageKey]);

    /**
     * Add a new requirement
     */
    const addRequirement = useCallback((): Requirement => {
        const newReq: Requirement = {
            id: getNextId(requirements),
            description: 'Enter requirement description here...',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const updated = [...requirements, newReq];
        saveRequirements(updated);

        return newReq;
    }, [requirements, saveRequirements]);

    /**
     * Update an existing requirement
     */
    const updateRequirement = useCallback((id: string, updates: Partial<Requirement>): boolean => {
        const updated = requirements.map(req =>
            req.id === id
                ? { ...req, ...updates, updatedAt: new Date().toISOString() }
                : req
        );

        saveRequirements(updated);
        return true;
    }, [requirements, saveRequirements]);

    /**
     * Delete a requirement
     */
    const deleteRequirement = useCallback((id: string): boolean => {
        const updated = requirements.filter(req => req.id !== id);
        saveRequirements(updated);
        return true;
    }, [requirements, saveRequirements]);

    /**
     * Get a requirement by ID
     */
    const getRequirement = useCallback((id: string): Requirement | undefined => {
        return requirements.find(req => req.id === id);
    }, [requirements]);

    return {
        requirements,
        isLoading,
        addRequirement,
        updateRequirement,
        deleteRequirement,
        getRequirement,
    };
};

/**
 * Generate next requirement ID
 */
const getNextId = (requirements: Requirement[]): string => {
    if (requirements.length === 0) return `${DEFAULT_REQUIREMENT_PREFIX}1`;

    const maxNum = requirements.reduce((max, req) => {
        const match = req.id.match(/REQ-(\d+)/);
        const num = match ? parseInt(match[1], 10) : 0;
        return Math.max(max, num);
    }, 0);

    return `${DEFAULT_REQUIREMENT_PREFIX}${maxNum + 1}`;
};

/**
 * Create sample requirements for first-time users
 */
const createSampleRequirements = (): Requirement[] => {
    const now = new Date().toISOString();
    return [
        {
            id: 'REQ-1',
            description: 'The system shall provide secure user authentication using OAuth 2.0 or similar industry-standard protocols.',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'REQ-2',
            description: 'All sensitive data shall be encrypted at rest using AES-256 encryption and in transit using TLS 1.3.',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'REQ-3',
            description: 'The system shall respond to 95% of API requests within 200ms under normal load conditions.',
            createdAt: now,
            updatedAt: now,
        },
    ];
};
