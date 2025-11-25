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
 * Flat list of all valid smell IDs (matches FLAT_SMELL_LABELS in Python backend)
 * This is the single source of truth for smell labels in the frontend.
 */
export const FLAT_SMELL_LABELS = [
    // Morphological
    "too_long_sentence",
    "too_short_sentence",
    "unreadable_structure",
    "punctuation_issue",
    "acronym_overuse_or_abbrev",

    // Lexical
    "non_atomic_requirement",
    "negative_formulation",
    "vague_pronoun_or_reference",
    "subjective_language",
    "vague_or_implicit_terms",
    "non_verifiable_qualifier",
    "loophole_or_open_ended",
    "superlative_or_comparative_without_reference",
    "quantifier_without_unit_or_range",
    "design_or_implementation_detail",
    "implicit_requirement",

    // Analytical
    "overuse_imperative_form",
    "missing_imperative_verb",
    "conditional_or_non_assertive_requirement",
    "passive_voice",
    "domain_term_imbalance",

    // Relational
    "too_many_dependencies_or_versions",
    "excessive_or_insufficient_coupling",
    "deep_nesting_or_structure_issue",

    // Incompleteness & language
    "incomplete_requirement",
    "incomplete_reference_or_condition",
    "missing_system_response",
    "incorrect_or_confusing_order",
    "missing_unit_of_measurement",
    "partial_content_or_incomplete_enumeration",
    "embedded_rationale_or_justification",
    "undefined_term",
    "language_error_or_grammar_issue",
    "ambiguous_plurality",
] as const;

/**
 * Map of all smell labels to their categories
 */
export const SMELL_CATEGORIES: Record<string, SmellCategory> = {
    // Morphological (5 smells)
    'too_long_sentence': 'morphological',
    'too_short_sentence': 'morphological',
    'unreadable_structure': 'morphological',
    'punctuation_issue': 'morphological',
    'acronym_overuse_or_abbrev': 'morphological',

    // Lexical (11 smells)
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

    // Analytical (5 smells)
    'overuse_imperative_form': 'analytical',
    'missing_imperative_verb': 'analytical',
    'conditional_or_non_assertive_requirement': 'analytical',
    'passive_voice': 'analytical',
    'domain_term_imbalance': 'analytical',

    // Relational (3 smells)
    'too_many_dependencies_or_versions': 'relational',
    'excessive_or_insufficient_coupling': 'relational',
    'deep_nesting_or_structure_issue': 'relational',

    // Incompleteness & language (10 smells)
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
    // Morphological
    'too_long_sentence': 'Too Long',
    'too_short_sentence': 'Too Short',
    'unreadable_structure': 'Unreadable',
    'punctuation_issue': 'Punctuation',
    'acronym_overuse_or_abbrev': 'Acronym Heavy',

    // Lexical
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

    // Analytical
    'overuse_imperative_form': 'Too Imperative',
    'missing_imperative_verb': 'Missing Verb',
    'conditional_or_non_assertive_requirement': 'Conditional',
    'passive_voice': 'Passive Voice',
    'domain_term_imbalance': 'Domain Imbalance',

    // Relational
    'too_many_dependencies_or_versions': 'Too Many Deps',
    'excessive_or_insufficient_coupling': 'Coupling Issue',
    'deep_nesting_or_structure_issue': 'Nesting Issue',

    // Incompleteness & language
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
    // Strip backticks in case they were included in the smell ID
    const cleanedLabel = smellLabel.replace(/`/g, '');

    const category = SMELL_CATEGORIES[cleanedLabel] || 'unknown';
    const displayName = SMELL_DISPLAY_NAMES[cleanedLabel] || formatSmellLabel(cleanedLabel);
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
    // Strip backticks (in case LLM included them from prompt)
    const cleaned = smellLabel.replace(/`/g, '');

    return cleaned
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
