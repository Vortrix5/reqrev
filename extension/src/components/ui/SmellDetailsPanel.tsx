/**
 * Smell Details Panel
 * Displays detailed information about detected smells with fix suggestions
 */

import React from 'react';
import { CATEGORY_COLORS, SmellCategory } from '../../utils/smellCategories';
import { SmellDetails, getSmellDetails } from '../../utils/smellDetails';

interface SmellDetailsPanelProps {
    requirementId: string;
    description: string;
    smells: string[];
    onClose: () => void;
}

export const SmellDetailsPanel: React.FC<SmellDetailsPanelProps> = ({
    requirementId,
    description,
    smells,
    onClose,
}) => {
    // Map smells to details - for unmatched smells, create a basic entry
    const smellDetails = smells.map(smell => {
        const details = getSmellDetails(smell);
        if (details) return details;

        // Create fallback for unmatched smells
        const category: SmellCategory = smell.includes('vague') || smell.includes('subjective') || smell.includes('implicit')
            ? 'lexical'
            : smell.includes('passive') || smell.includes('grammar')
                ? 'analytical'
                : smell.includes('dependency') || smell.includes('coupling')
                    ? 'relational'
                    : smell.includes('missing') || smell.includes('incomplete')
                        ? 'incompleteness'
                        : 'morphological';

        return {
            name: smell.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category,
            description: 'This requirement quality issue was detected by the analysis system.',
            why_it_matters: 'Quality issues can lead to misunderstandings and implementation errors.',
            how_to_fix: [
                'Review the requirement carefully',
                'Make it more specific and measurable',
                'Remove ambiguity and vague terms',
                'Ensure it follows best practices'
            ],
            example_before: description,
            example_after: 'A more specific and well-defined version of this requirement.'
        } as SmellDetails;
    });

    // Show actual smell count
    const totalSmells = smells.length;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="reqrev-smell-panel-overlay" onClick={handleOverlayClick}>
            <div className="reqrev-smell-panel">
                {/* Header */}
                <div className="reqrev-smell-panel-header">
                    <div>
                        <h2>Requirement Quality Analysis</h2>
                        <div className="reqrev-smell-panel-subtitle">
                            {requirementId} • {totalSmells} {totalSmells === 1 ? 'smell' : 'smells'} detected
                        </div>
                    </div>
                    <button
                        className="reqrev-smell-panel-close"
                        onClick={onClose}
                        aria-label="Close panel"
                    >
                        ✕
                    </button>
                </div>

                {/* Original Requirement */}
                <div className="reqrev-smell-panel-section">
                    <h3>Original Requirement</h3>
                    <div className="reqrev-smell-panel-requirement">
                        {description}
                    </div>
                </div>

                {/* Detected Smells */}
                <div className="reqrev-smell-panel-section">
                    <h3>Detected Issues</h3>

                    {smellDetails.length === 0 ? (
                        <div className="reqrev-smell-panel-empty">
                            ✓ No quality issues detected. This requirement looks good!
                        </div>
                    ) : (
                        <div className="reqrev-smell-panel-smells">
                            {smellDetails.map((smell, index) => (
                                <div key={index} className="reqrev-smell-detail-card">
                                    {/* Smell Header */}
                                    <div className="reqrev-smell-detail-header">
                                        <div className="reqrev-smell-detail-title">
                                            <span
                                                className="reqrev-smell-detail-badge"
                                                style={{
                                                    backgroundColor: `${CATEGORY_COLORS[smell.category as SmellCategory]}20`,
                                                    color: CATEGORY_COLORS[smell.category as SmellCategory],
                                                    borderColor: CATEGORY_COLORS[smell.category as SmellCategory],
                                                }}
                                            >
                                                {smell.name}
                                            </span>
                                            <span className="reqrev-smell-detail-category">
                                                {smell.category.charAt(0).toUpperCase() + smell.category.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="reqrev-smell-detail-section">
                                        <h4>What is this?</h4>
                                        <p>{smell.description}</p>
                                    </div>

                                    {/* Why it matters */}
                                    <div className="reqrev-smell-detail-section">
                                        <h4>Why it matters</h4>
                                        <p>{smell.why_it_matters}</p>
                                    </div>

                                    {/* How to fix */}
                                    <div className="reqrev-smell-detail-section">
                                        <h4>How to fix</h4>
                                        <ul className="reqrev-smell-fix-list">
                                            {smell.how_to_fix.map((fix: string, fixIndex: number) => (
                                                <li key={fixIndex}>{fix}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Examples */}
                                    <div className="reqrev-smell-detail-section">
                                        <h4>Example</h4>
                                        <div className="reqrev-smell-example">
                                            <div className="reqrev-smell-example-before">
                                                <div className="reqrev-smell-example-label">BEFORE</div>
                                                <div className="reqrev-smell-example-text">
                                                    {smell.example_before}
                                                </div>
                                            </div>
                                            <div className="reqrev-smell-example-after">
                                                <div className="reqrev-smell-example-label">AFTER</div>
                                                <div className="reqrev-smell-example-text">
                                                    {smell.example_after}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                {smellDetails.length > 0 && (
                    <div className="reqrev-smell-panel-section reqrev-smell-panel-summary">
                        <h3>Quick Tips</h3>
                        <ul>
                            <li>Focus on fixing high-impact smells first (those affecting testability and clarity)</li>
                            <li>Break complex requirements into multiple simpler ones</li>
                            <li>Use specific, measurable criteria instead of vague terms</li>
                            <li>Always specify WHO does WHAT, WHEN, and under what CONDITIONS</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
