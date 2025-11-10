/**
 * LoadingState Component
 * Displayed while requirements are loading
 */

import React from 'react';

export const LoadingState: React.FC = () => {
    return (
        <div className="reqrev-panel">
            <div className="reqrev-panel-content">
                <div className="reqrev-loading">Loading requirements...</div>
            </div>
        </div>
    );
};
