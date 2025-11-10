/**
 * RequirementsPanel Component
 * 
 * Main React component for managing requirements.
 * Orchestrates smaller components and manages editing state.
 */

import React, { useState } from 'react';
import { useCountBadge } from '../hooks/useCountBadge';
import { useRequirements } from '../hooks/useRequirements';
import { Requirement } from '../types';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { RequirementEditForm } from './RequirementEditForm';
import { RequirementsHeader } from './RequirementsHeader';
import { RequirementsTable } from './RequirementsTable';

interface RequirementsPanelProps {
    repoId: string;
    onClose: () => void;
}

/**
 * Placeholder for future AI-powered requirement flagging
 */
const flagRequirement = async (text: string): Promise<void> => {
    console.log('[ReqRev] Flag check for:', text);
    // TODO: Integrate with AI backend to check for ambiguous/conflicting requirements
};

/**
 * Placeholder for future AI-powered clarity evaluation
 */
const evaluateClarity = async (text: string): Promise<void> => {
    console.log('[ReqRev] Evaluating clarity for:', text);
    // TODO: Integrate with AI backend to score requirement clarity
};

const RequirementsPanel: React.FC<RequirementsPanelProps> = ({ repoId, onClose }) => {
    const {
        requirements,
        isLoading,
        addRequirement: addReq,
        updateRequirement,
        deleteRequirement: deleteReq,
    } = useRequirements(repoId);

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editDescription, setEditDescription] = useState('');

    // Update count badge when requirements change
    useCountBadge(requirements.length);

    /**
     * Handle adding a new requirement
     */
    const handleAddRequirement = () => {
        const newReq = addReq();
        setIsEditing(newReq.id);
        setEditDescription(newReq.description);
    };

    /**
     * Handle starting to edit a requirement
     */
    const handleStartEdit = (req: Requirement) => {
        setIsEditing(req.id);
        setEditDescription(req.description);
    };

    /**
     * Handle saving edited requirement
     */
    const handleSaveEdit = async () => {
        if (!isEditing) return;

        updateRequirement(isEditing, { description: editDescription });

        // Trigger placeholder AI checks
        await flagRequirement(editDescription);
        await evaluateClarity(editDescription);

        setIsEditing(null);
        setEditDescription('');
    };

    /**
     * Handle canceling edit
     */
    const handleCancelEdit = () => {
        setIsEditing(null);
        setEditDescription('');
    };

    /**
     * Handle deleting a requirement
     */
    const handleDeleteRequirement = (id: string) => {
        if (!confirm('Are you sure you want to delete this requirement?')) return;

        deleteReq(id);

        if (isEditing === id) {
            setIsEditing(null);
        }
    };

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <div className="reqrev-panel">
            <div className="reqrev-panel-content">
                <RequirementsHeader
                    count={requirements.length}
                    onAddRequirement={handleAddRequirement}
                />

                {requirements.length === 0 ? (
                    <EmptyState />
                ) : isEditing ? (
                    <RequirementEditForm
                        id={isEditing}
                        description={editDescription}
                        onDescriptionChange={setEditDescription}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                    />
                ) : (
                    <RequirementsTable
                        requirements={requirements}
                        onEdit={handleStartEdit}
                        onDelete={handleDeleteRequirement}
                    />
                )}
            </div>
        </div>
    );
};

export default RequirementsPanel;
