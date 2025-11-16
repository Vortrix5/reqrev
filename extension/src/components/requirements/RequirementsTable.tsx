/**
 * RequirementsTable Component
 * Table displaying all requirements
 */

import React from 'react';
import { Requirement } from '../../types';
import { RequirementRow } from './RequirementRow';

interface RequirementsTableProps {
    requirements: Requirement[];
    onEdit: (requirement: Requirement) => void;
    onDelete: (id: string) => void;
    onViewDetails: (requirement: Requirement) => void;
    analyzingIds?: Set<string>;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
    requirements,
    onEdit,
    onDelete,
    onViewDetails,
    analyzingIds = new Set(),
}) => {
    return (
        <div className="reqrev-table-container">
            <table className="reqrev-table">
                <thead>
                    <tr>
                        <th className="reqrev-th-id">ID</th>
                        <th className="reqrev-th-description">Description</th>
                        <th className="reqrev-th-activity">Activity Points</th>
                        <th className="reqrev-th-smells">Smells Detected</th>
                        <th className="reqrev-th-details">Analysis</th>
                        <th className="reqrev-th-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requirements.map(req => (
                        <RequirementRow
                            key={req.id}
                            requirement={req}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onViewDetails={onViewDetails}
                            isAnalyzing={analyzingIds.has(req.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
