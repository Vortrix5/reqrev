/**
 * RequirementsPanel Component
 * 
 * Main React component for managing requirements.
 * Orchestrates smaller components and manages editing state.
 */

import React, { useState } from 'react';
import { useCountBadge } from '../../hooks/useCountBadge';
import { useRequirements } from '../../hooks/useRequirements';
import { Requirement } from '../../types';
import { EmptyState, LoadingState, Modal } from '../ui';
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDescription, setEditDescription] = useState('');
    const [isNewRequirement, setIsNewRequirement] = useState(false);

    // Update count badge when requirements change
    useCountBadge(requirements.length);

    /**
     * Generate next requirement ID without creating it
     */
    const generateNextId = (): string => {
        if (requirements.length === 0) return 'REQ-1';

        const maxNum = requirements.reduce((max, req) => {
            const match = req.id.match(/REQ-(\d+)/);
            const num = match ? parseInt(match[1], 10) : 0;
            return Math.max(max, num);
        }, 0);

        return `REQ-${maxNum + 1}`;
    };

    /**
     * Handle adding a new requirement (draft mode - not saved yet)
     */
    const handleAddRequirement = () => {
        const newId = generateNextId();
        setEditingId(newId);
        setEditDescription('');
        setIsNewRequirement(true);
        setIsModalOpen(true);
    };

    /**
     * Handle starting to edit a requirement
     */
    const handleStartEdit = (req: Requirement) => {
        setEditingId(req.id);
        setEditDescription(req.description);
        setIsNewRequirement(false);
        setIsModalOpen(true);
    };

    /**
     * Handle saving edited requirement
     */
    const handleSaveEdit = async () => {
        if (!editingId || !editDescription.trim()) return;

        if (isNewRequirement) {
            // Create new requirement with the entered description
            addReq(editDescription);
        } else {
            // Update existing requirement
            updateRequirement(editingId, { description: editDescription });
        }

        // Trigger placeholder AI checks
        await flagRequirement(editDescription);
        await evaluateClarity(editDescription);

        closeModal();
    };

    /**
     * Handle canceling edit
     */
    const handleCancelEdit = () => {
        // No need to delete anything - requirement was never created
        closeModal();
    };

    /**
     * Close modal and reset state
     */
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setEditDescription('');
        setIsNewRequirement(false);
    };

    /**
     * Handle deleting a requirement
     */
    const handleDeleteRequirement = (id: string) => {
        if (!confirm('Are you sure you want to delete this requirement?')) return;

        deleteReq(id);

        if (editingId === id) {
            closeModal();
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
                ) : (
                    <RequirementsTable
                        requirements={requirements}
                        onEdit={handleStartEdit}
                        onDelete={handleDeleteRequirement}
                    />
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancelEdit}
                    title={isNewRequirement ? 'New Requirement' : 'Edit Requirement'}
                >
                    {editingId && (
                        <RequirementEditForm
                            id={editingId}
                            description={editDescription}
                            onDescriptionChange={setEditDescription}
                            onSave={handleSaveEdit}
                            onCancel={handleCancelEdit}
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default RequirementsPanel;
