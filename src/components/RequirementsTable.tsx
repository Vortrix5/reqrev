/**
 * RequirementsTable Component
 * Table displaying all requirements
 */

import React from 'react';
import { Requirement } from '../types';
import { RequirementRow } from './RequirementRow';

interface RequirementsTableProps {
    requirements: Requirement[];
    onEdit: (requirement: Requirement) => void;
    onDelete: (id: string) => void;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
    requirements,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="reqrev-table-container">
            <table className="reqrev-table">
                <thead>
                    <tr>
                        <th className="reqrev-th-id">ID</th>
                        <th className="reqrev-th-description">Description</th>
                        <th className="reqrev-th-activity">Activity Points</th>
                        <th className="reqrev-th-flags">Flags</th>
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
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
