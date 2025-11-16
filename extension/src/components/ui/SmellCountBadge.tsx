/**
 * Smell Count Badge
 * Displays the number of smells with color-coded severity
 */

import React from 'react';

interface SmellCountBadgeProps {
    count: number;
    isAnalyzing?: boolean;
}

/**
 * Get severity level and color based on smell count
 */
function getSeverity(count: number): { level: string; color: string; className: string } {
    if (count === 0) {
        return { level: 'Perfect', color: '#10b981', className: 'perfect' }; // Green
    } else if (count <= 2) {
        return { level: 'Good', color: '#eab308', className: 'good' }; // Yellow
    } else if (count <= 5) {
        return { level: 'Needs Work', color: '#f59e0b', className: 'warning' }; // Orange
    } else {
        return { level: 'Critical', color: '#ef4444', className: 'critical' }; // Red
    }
}

export const SmellCountBadge: React.FC<SmellCountBadgeProps> = ({ count, isAnalyzing }) => {
    if (isAnalyzing) {
        return (
            <div className="reqrev-smell-count-badge analyzing">
                <span className="reqrev-smell-count-spinner"></span>
                Analyzing...
            </div>
        );
    }

    const severity = getSeverity(count);

    if (count === 0) {
        return (
            <div
                className={`reqrev-smell-count-badge ${severity.className}`}
                style={{ backgroundColor: `${severity.color}20`, color: severity.color, borderColor: severity.color }}
                title={`${severity.level}: No quality issues detected`}
            >
                <span className="reqrev-smell-count-icon">✓</span>
                {severity.level}
            </div>
        );
    }

    return (
        <div
            className={`reqrev-smell-count-badge ${severity.className}`}
            style={{ backgroundColor: `${severity.color}20`, color: severity.color, borderColor: severity.color }}
            title={`${severity.level}: ${count} quality ${count === 1 ? 'issue' : 'issues'} detected`}
        >
            <span className="reqrev-smell-count-number">{count}</span>
            <span className="reqrev-smell-count-label">{count === 1 ? 'Smell' : 'Smells'}</span>
        </div>
    );
};
