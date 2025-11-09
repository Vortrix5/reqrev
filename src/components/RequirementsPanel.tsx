/**
 * RequirementsPanel Component
 * 
 * Main React component for managing requirements.
 * Provides CRUD operations and persists data to chrome.storage.local.
 */

import React, { useEffect, useState } from 'react';
import { Requirement } from '../types';

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
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const storageKey = `requirements:${repoId}`;

    /**
     * Load requirements from chrome.storage.local
     */
    useEffect(() => {
        const loadRequirements = async () => {
            try {
                // Check if extension context is still valid
                if (!chrome.runtime?.id) {
                    console.warn('[ReqRev] Extension context invalidated, skipping load');
                    return;
                }

                const result = await chrome.storage.local.get(storageKey);

                if (result[storageKey] && Array.isArray(result[storageKey])) {
                    setRequirements(result[storageKey]);
                } else {
                    // Initialize with sample requirements on first load
                    const sampleRequirements: Requirement[] = [
                        {
                            id: 'REQ-1',
                            title: 'User Authentication',
                            description: 'The system shall provide secure user authentication using OAuth 2.0 or similar industry-standard protocols.',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                        {
                            id: 'REQ-2',
                            title: 'Data Encryption',
                            description: 'All sensitive data shall be encrypted at rest using AES-256 encryption and in transit using TLS 1.3.',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                        {
                            id: 'REQ-3',
                            title: 'API Response Time',
                            description: 'The system shall respond to 95% of API requests within 200ms under normal load conditions.',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    ];

                    // Check context again before saving
                    if (!chrome.runtime?.id) {
                        console.warn('[ReqRev] Extension context invalidated, skipping save');
                        return;
                    }

                    await chrome.storage.local.set({ [storageKey]: sampleRequirements });
                    setRequirements(sampleRequirements);
                }
            } catch (error) {
                // Check if it's a context invalidation error
                if (error instanceof Error && error.message.includes('Extension context invalidated')) {
                    console.warn('[ReqRev] Extension was reloaded. Please refresh the page.');
                } else {
                    console.error('[ReqRev] Error loading requirements:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadRequirements();
    }, [repoId, storageKey]);

    /**
     * Update the counter badge in the tab
     */
    useEffect(() => {
        const counter = document.getElementById('reqrev-count');
        if (counter) {
            counter.textContent = requirements.length.toString();
        }
    }, [requirements]);

    /**
     * Save requirements to chrome.storage.local
     */
    const saveRequirements = async (updatedRequirements: Requirement[]) => {
        try {
            // Check if extension context is still valid
            if (!chrome.runtime?.id) {
                alert('Extension was reloaded. Please refresh the page to continue.');
                return;
            }

            await chrome.storage.local.set({ [storageKey]: updatedRequirements });
            setRequirements(updatedRequirements);
        } catch (error) {
            console.error('[ReqRev] Error saving requirements:', error);

            // Check if it's a context invalidation error
            if (error instanceof Error && error.message.includes('Extension context invalidated')) {
                alert('Extension was reloaded. Please refresh the page to continue.');
            } else {
                alert('Failed to save requirements. Please try again.');
            }
        }
    };

    /**
     * Generate next requirement ID
     */
    const getNextId = (): string => {
        if (requirements.length === 0) return 'REQ-1';

        const maxNum = requirements.reduce((max, req) => {
            const match = req.id.match(/REQ-(\d+)/);
            const num = match ? parseInt(match[1], 10) : 0;
            return Math.max(max, num);
        }, 0);

        return `REQ-${maxNum + 1}`;
    };

    /**
     * Add a new requirement
     */
    const addRequirement = () => {
        const newReq: Requirement = {
            id: getNextId(),
            title: 'New Requirement',
            description: 'Enter requirement description here...',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const updated = [...requirements, newReq];
        saveRequirements(updated);

        // Automatically enter edit mode for new requirement
        setIsEditing(newReq.id);
        setEditTitle(newReq.title);
        setEditDescription(newReq.description);
    };

    /**
     * Delete a requirement
     */
    const deleteRequirement = (id: string) => {
        if (!confirm('Are you sure you want to delete this requirement?')) return;

        const updated = requirements.filter(req => req.id !== id);
        saveRequirements(updated);

        if (isEditing === id) {
            setIsEditing(null);
        }
    };

    /**
     * Start editing a requirement
     */
    const startEdit = (req: Requirement) => {
        setIsEditing(req.id);
        setEditTitle(req.title);
        setEditDescription(req.description);
    };

    /**
     * Save edited requirement
     */
    const saveEdit = async () => {
        if (!isEditing) return;

        const updated = requirements.map(req => {
            if (req.id === isEditing) {
                return {
                    ...req,
                    title: editTitle,
                    description: editDescription,
                    updatedAt: new Date().toISOString(),
                };
            }
            return req;
        });

        await saveRequirements(updated);

        // Trigger placeholder AI checks
        await flagRequirement(editDescription);
        await evaluateClarity(editDescription);

        setIsEditing(null);
        setEditTitle('');
        setEditDescription('');
    };

    /**
     * Cancel editing
     */
    const cancelEdit = () => {
        setIsEditing(null);
        setEditTitle('');
        setEditDescription('');
    };

    if (isLoading) {
        return (
            <div className="reqrev-panel">
                <div className="reqrev-panel-content">
                    <div className="reqrev-loading">Loading requirements...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="reqrev-panel">
            <div className="reqrev-panel-content">
                {/* Header */}
                <div className="reqrev-header">
                    <div className="reqrev-header-left">
                        <h2 className="reqrev-title">Requirements</h2>
                        <span className="reqrev-count-badge">{requirements.length} total</span>
                    </div>
                    <div className="reqrev-header-right">
                        <button
                            className="reqrev-btn reqrev-btn-primary"
                            onClick={addRequirement}
                        >
                            + New Requirement
                        </button>
                    </div>
                </div>

                {/* Requirements Table */}
                {requirements.length === 0 ? (
                    <div className="reqrev-empty-state">
                        <p>No requirements yet. Click "+ New Requirement" to get started.</p>
                    </div>
                ) : isEditing ? (
                    // Edit Form (full width)
                    <div className="reqrev-edit-form-container">
                        <div className="reqrev-edit-form">
                            <div className="reqrev-form-row">
                                <div className="reqrev-form-group">
                                    <label className="reqrev-label">ID</label>
                                    <div className="reqrev-id-display">{isEditing}</div>
                                </div>
                            </div>

                            <div className="reqrev-form-row">
                                <div className="reqrev-form-group reqrev-form-group-full">
                                    <label className="reqrev-label">Title</label>
                                    <input
                                        type="text"
                                        className="reqrev-input"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="Requirement title"
                                    />
                                </div>
                            </div>

                            <div className="reqrev-form-row">
                                <div className="reqrev-form-group reqrev-form-group-full">
                                    <label className="reqrev-label">Description</label>
                                    <textarea
                                        className="reqrev-textarea"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Detailed requirement description"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="reqrev-form-actions">
                                <button
                                    className="reqrev-btn reqrev-btn-success"
                                    onClick={saveEdit}
                                >
                                    Save Changes
                                </button>
                                <button
                                    className="reqrev-btn reqrev-btn-secondary"
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Table View
                    <div className="reqrev-table-container">
                        <table className="reqrev-table">
                            <thead>
                                <tr>
                                    <th className="reqrev-th-id">ID</th>
                                    <th className="reqrev-th-title">Title</th>
                                    <th className="reqrev-th-description">Description</th>
                                    <th className="reqrev-th-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requirements.map(req => (
                                    <tr key={req.id} className="reqrev-table-row">
                                        <td className="reqrev-td-id">
                                            <span className="reqrev-requirement-id">{req.id}</span>
                                        </td>
                                        <td className="reqrev-td-title">
                                            <span className="reqrev-requirement-title">{req.title}</span>
                                        </td>
                                        <td className="reqrev-td-description">
                                            <span className="reqrev-requirement-description">{req.description}</span>
                                        </td>
                                        <td className="reqrev-td-actions">
                                            <div className="reqrev-requirement-actions">
                                                <button
                                                    className="reqrev-btn-icon reqrev-btn-edit"
                                                    onClick={() => startEdit(req)}
                                                    title="Edit requirement"
                                                >
                                                    <svg height="16" viewBox="0 0 16 16" width="16">
                                                        <path fill="currentColor" d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="reqrev-btn-icon reqrev-btn-delete"
                                                    onClick={() => deleteRequirement(req.id)}
                                                    title="Delete requirement"
                                                >
                                                    <svg height="16" viewBox="0 0 16 16" width="16">
                                                        <path fill="currentColor" d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequirementsPanel;
