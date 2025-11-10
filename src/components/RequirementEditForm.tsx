/**
 * RequirementEditForm Component
 * Form for editing a requirement
 */

import React from 'react';

interface RequirementEditFormProps {
    id: string;
    description: string;
    onDescriptionChange: (description: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export const RequirementEditForm: React.FC<RequirementEditFormProps> = ({
    id,
    description,
    onDescriptionChange,
    onSave,
    onCancel,
}) => {
    return (
        <div className="reqrev-edit-form-container">
            <div className="reqrev-edit-form">
                <div className="reqrev-form-row">
                    <div className="reqrev-form-group">
                        <label className="reqrev-label">ID</label>
                        <div className="reqrev-id-display">{id}</div>
                    </div>
                </div>

                <div className="reqrev-form-row">
                    <div className="reqrev-form-group reqrev-form-group-full">
                        <label className="reqrev-label">Description</label>
                        <textarea
                            className="reqrev-textarea"
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            placeholder="Detailed requirement description"
                            rows={6}
                        />
                    </div>
                </div>

                <div className="reqrev-form-actions">
                    <button
                        className="reqrev-btn reqrev-btn-success"
                        onClick={onSave}
                    >
                        Save Changes
                    </button>
                    <button
                        className="reqrev-btn reqrev-btn-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
