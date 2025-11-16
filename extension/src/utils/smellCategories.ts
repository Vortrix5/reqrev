/**
 * Smell Category Mapping and Colors
 * Maps smell labels to their categories with color codes
 */

export type SmellCategory = 'morphological' | 'lexical' | 'analytical' | 'relational' | 'incompleteness' | 'unknown';

export interface SmellInfo {
    category: SmellCategory;
    label: string;
    color: string; // CSS color for badge
    description: string;
}

/**
 * Color scheme for each smell category
 */
export const CATEGORY_COLORS: Record<SmellCategory, string> = {
    morphological: '#8b5cf6',    // Purple - shape and structure
    lexical: '#f59e0b',           // Orange - word choice
    analytical: '#3b82f6',        // Blue - grammar and analysis
    relational: '#10b981',        // Green - relationships
    incompleteness: '#ef4444',    // Red - missing or errors
    unknown: '#6b7280',           // Gray - unclassified
};

/**
 * Map of all smell labels to their categories
 */
export const SMELL_CATEGORIES: Record<string, SmellCategory> = {
    // Morphological smells (7)
    'too_long_sentence': 'morphological',
    'too_short_sentence': 'morphological',
    'too_long_paragraph': 'morphological',
    'too_short_paragraph': 'morphological',
    'unreadable_structure': 'morphological',
    'punctuation_issue': 'morphological',
    'acronym_overuse_or_abbrev': 'morphological',

    // Lexical smells (11)
    'non_atomic_requirement': 'lexical',
    'negative_formulation': 'lexical',
    'vague_pronoun_or_reference': 'lexical',
    'subjective_language': 'lexical',
    'vague_or_implicit_terms': 'lexical',
    'non_verifiable_qualifier': 'lexical',
    'loophole_or_open_ended': 'lexical',
    'superlative_or_comparative_without_reference': 'lexical',
    'quantifier_without_unit_or_range': 'lexical',
    'design_or_implementation_detail': 'lexical',
    'implicit_requirement': 'lexical',

    // Analytical smells (5)
    'overuse_imperative_form': 'analytical',
    'missing_imperative_verb': 'analytical',
    'conditional_or_non_assertive_requirement': 'analytical',
    'passive_voice': 'analytical',
    'domain_term_imbalance': 'analytical',

    // Relational smells (3)
    'too_many_dependencies_or_versions': 'relational',
    'excessive_or_insufficient_coupling': 'relational',
    'deep_nesting_or_structure_issue': 'relational',

    // Incompleteness smells (10)
    'incomplete_requirement': 'incompleteness',
    'incomplete_reference_or_condition': 'incompleteness',
    'missing_system_response': 'incompleteness',
    'incorrect_or_confusing_order': 'incompleteness',
    'missing_unit_of_measurement': 'incompleteness',
    'partial_content_or_incomplete_enumeration': 'incompleteness',
    'embedded_rationale_or_justification': 'incompleteness',
    'undefined_term': 'incompleteness',
    'language_error_or_grammar_issue': 'incompleteness',
    'ambiguous_plurality': 'incompleteness',
};

/**
 * Human-readable labels for display
 */
export const SMELL_DISPLAY_NAMES: Record<string, string> = {
    'too_long_sentence': 'Too Long',
    'too_short_sentence': 'Too Short',
    'too_long_paragraph': 'Long Paragraph',
    'too_short_paragraph': 'Short Paragraph',
    'unreadable_structure': 'Unreadable',
    'punctuation_issue': 'Punctuation',
    'acronym_overuse_or_abbrev': 'Acronym Heavy',

    'non_atomic_requirement': 'Non-Atomic',
    'negative_formulation': 'Negative Form',
    'vague_pronoun_or_reference': 'Vague Pronoun',
    'subjective_language': 'Subjective',
    'vague_or_implicit_terms': 'Vague Terms',
    'non_verifiable_qualifier': 'Non-Verifiable',
    'loophole_or_open_ended': 'Open-Ended',
    'superlative_or_comparative_without_reference': 'Superlative',
    'quantifier_without_unit_or_range': 'No Unit',
    'design_or_implementation_detail': 'Implementation Detail',
    'implicit_requirement': 'Implicit',

    'overuse_imperative_form': 'Too Imperative',
    'missing_imperative_verb': 'Missing Verb',
    'conditional_or_non_assertive_requirement': 'Conditional',
    'passive_voice': 'Passive Voice',
    'domain_term_imbalance': 'Domain Imbalance',

    'too_many_dependencies_or_versions': 'Too Many Deps',
    'excessive_or_insufficient_coupling': 'Coupling Issue',
    'deep_nesting_or_structure_issue': 'Nesting Issue',

    'incomplete_requirement': 'Incomplete',
    'incomplete_reference_or_condition': 'Incomplete Ref',
    'missing_system_response': 'No Response',
    'incorrect_or_confusing_order': 'Confusing Order',
    'missing_unit_of_measurement': 'Missing Unit',
    'partial_content_or_incomplete_enumeration': 'Partial Content',
    'embedded_rationale_or_justification': 'Embedded Rationale',
    'undefined_term': 'Undefined Term',
    'language_error_or_grammar_issue': 'Language Error',
    'ambiguous_plurality': 'Ambiguous Plural',
};

/**
 * Get smell category information
 */
export function getSmellInfo(smellLabel: string): SmellInfo {
    const category = SMELL_CATEGORIES[smellLabel] || 'unknown';
    const displayName = SMELL_DISPLAY_NAMES[smellLabel] || formatSmellLabel(smellLabel);
    const color = CATEGORY_COLORS[category];

    return {
        category,
        label: displayName,
        color,
        description: getCategoryDescription(category),
    };
}

/**
 * Format smell label for display (fallback if not in display names)
 */
function formatSmellLabel(smellLabel: string): string {
    return smellLabel
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get category description
 */
function getCategoryDescription(category: SmellCategory): string {
    const descriptions: Record<SmellCategory, string> = {
        morphological: 'Shape and readability issues',
        lexical: 'Word choice and vague terms',
        analytical: 'Grammar and structure problems',
        relational: 'Dependencies and coupling',
        incompleteness: 'Missing information or errors',
        unknown: 'Unclassified quality issue',
    };
    return descriptions[category];
}

/**
 * Get category display name
 */
export function getCategoryName(category: SmellCategory): string {
    const names: Record<SmellCategory, string> = {
        morphological: 'Morphological',
        lexical: 'Lexical',
        analytical: 'Analytical',
        relational: 'Relational',
        incompleteness: 'Incompleteness',
        unknown: 'Unknown',
    };
    return names[category];
}
