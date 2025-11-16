/**
 * Count Badge Hook
 * Hook for syncing requirements count with the tab badge
 */

import { useEffect } from 'react';
import { updateCountBadge } from '../utils/githubDOM';

/**
 * Hook to update the count badge when requirements change
 */
export const useCountBadge = (count: number): void => {
    useEffect(() => {
        updateCountBadge(count);
    }, [count]);
};
