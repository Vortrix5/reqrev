/**
 * RequirementsHeader Component
 * Header section with title, count, and action buttons
 */

import React from 'react';

interface RequirementsHeaderProps {
    count: number;
    onAddRequirement: () => void;
}

export const RequirementsHeader: React.FC<RequirementsHeaderProps> = ({
    count,
    onAddRequirement,
}) => {
    return (
        <div className="reqrev-header">
            <div className="reqrev-header-left">
                <h2 className="reqrev-title">Requirements</h2>
                <span className="reqrev-count-badge">{count} total</span>
            </div>
            <div className="reqrev-header-right">
                <button
                    className="reqrev-btn reqrev-btn-primary"
                    onClick={onAddRequirement}
                >
                    + New Requirement
                </button>
            </div>
        </div>
    );
};
