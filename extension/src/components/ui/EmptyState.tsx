/**
 * EmptyState Component
 * Displayed when there are no requirements
 */

import React from 'react';

export const EmptyState: React.FC = () => {
    return (
        <div className="reqrev-empty-state">
            <p>No requirements yet. Click "+ New Requirement" to get started.</p>
        </div>
    );
};
