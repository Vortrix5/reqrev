/**
 * React Hooks for Requirements Management
 * Reusable hooks for managing requirements state and storage
 */

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_REQUIREMENT_PREFIX, STORAGE_PREFIX } from '../constants';
import { analyzeRequirement } from '../services/requirementAnalysisService';
import { Requirement } from '../types';
import { safeExtensionCall } from '../utils/extensionContext';

/**
 * Hook for managing requirements with Chrome storage persistence
 */
export const useRequirements = (repoId: string) => {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
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
     * Analyze a requirement and update its flags
     */
    const analyzeAndUpdateRequirement = useCallback(async (req: Requirement) => {
        if (!req.description || req.description.trim().length === 0) {
            return;
        }

        // Mark as analyzing
        setAnalyzingIds(prev => new Set(prev).add(req.id));

        try {
            const result = await analyzeRequirement(req.id, req.description);

            if (result) {
                // Update requirement with smells using state updater to avoid stale closure
                setRequirements(currentReqs => {
                    const updatedReqs = currentReqs.map(r =>
                        r.id === req.id
                            ? { ...r, flags: result.smells, updatedAt: new Date().toISOString() }
                            : r
                    );
                    // Save to storage
                    safeExtensionCall(
                        async () => chrome.storage.local.set({ [storageKey]: updatedReqs })
                    );
                    return updatedReqs;
                });
            }
        } catch (error) {
            console.error(`[ReqRev] Failed to analyze ${req.id}:`, error);
        } finally {
            // Remove from analyzing set
            setAnalyzingIds(prev => {
                const next = new Set(prev);
                next.delete(req.id);
                return next;
            });
        }
    }, [storageKey]);

    /**
     * Add a new requirement
     */
    const addRequirement = useCallback((description?: string): Requirement => {
        const newReq: Requirement = {
            id: getNextId(requirements),
            description: description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            flags: [],
        };

        const updated = [...requirements, newReq];
        saveRequirements(updated);

        // Analyze the new requirement if it has description
        if (description && description.trim().length > 0) {
            // Delay slightly to ensure state is updated
            setTimeout(() => analyzeAndUpdateRequirement(newReq), 100);
        }

        return newReq;
    }, [requirements, saveRequirements, analyzeAndUpdateRequirement]);

    /**
     * Update an existing requirement
     */
    const updateRequirement = useCallback(async (id: string, updates: Partial<Requirement>): Promise<boolean> => {
        const updated = requirements.map(req =>
            req.id === id
                ? { ...req, ...updates, updatedAt: new Date().toISOString() }
                : req
        );

        await saveRequirements(updated);

        // If description was updated, re-analyze
        if (updates.description !== undefined) {
            const updatedReq = updated.find(r => r.id === id);
            if (updatedReq) {
                analyzeAndUpdateRequirement(updatedReq);
            }
        }

        return true;
    }, [requirements, saveRequirements, analyzeAndUpdateRequirement]);

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
        analyzingIds,
        addRequirement,
        updateRequirement,
        deleteRequirement,
        getRequirement,
        analyzeRequirement: analyzeAndUpdateRequirement,
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
