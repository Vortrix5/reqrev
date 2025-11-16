/**
 * SmellBadge Component
 * Displays a color-coded badge for a requirement smell
 */

import React from 'react';
import { getCategoryName, getSmellInfo } from '../../utils/smellCategories';

interface SmellBadgeProps {
    smell: string;
    showTooltip?: boolean;
}

export const SmellBadge: React.FC<SmellBadgeProps> = ({ smell, showTooltip = true }) => {
    const smellInfo = getSmellInfo(smell);

    const title = showTooltip
        ? `${getCategoryName(smellInfo.category)}: ${smellInfo.description}`
        : undefined;

    return (
        <span
            className="reqrev-smell-badge"
            style={{
                backgroundColor: smellInfo.color,
            }}
            title={title}
        >
            {smellInfo.label}
        </span>
    );
};

interface SmellBadgeListProps {
    smells: string[];
    maxDisplay?: number;
}

export const SmellBadgeList: React.FC<SmellBadgeListProps> = ({
    smells,
    maxDisplay = 3
}) => {
    if (!smells || smells.length === 0) {
        return <span className="reqrev-no-smells">✓</span>;
    }

    const displaySmells = smells.slice(0, maxDisplay);
    const remaining = smells.length - maxDisplay;

    return (
        <div className="reqrev-smell-badge-list">
            {displaySmells.map((smell, index) => (
                <SmellBadge key={`${smell}-${index}`} smell={smell} />
            ))}
            {remaining > 0 && (
                <span
                    className="reqrev-smell-badge reqrev-smell-more"
                    title={`${remaining} more smell${remaining > 1 ? 's' : ''}: ${smells.slice(maxDisplay).map(s => getSmellInfo(s).label).join(', ')}`}
                >
                    +{remaining}
                </span>
            )}
        </div>
    );
};
