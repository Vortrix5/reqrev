/**
 * Comprehensive smell descriptions and fix suggestions
 * Provides detailed information about each requirement smell and how to fix it
 * 
 * ALL SMELL LABELS MATCH THE BACKEND TAXONOMY from llm_service/openai_client.py
 */

import { SMELL_DISPLAY_NAMES, SmellCategory } from './smellCategories';

export interface SmellDetails {
    name: string;
    category: SmellCategory;
    description: string;
    why_it_matters: string;
    how_to_fix: string[];
    example_before: string;
    example_after: string;
}

export const SMELL_DETAILS: Record<string, SmellDetails> = {
    // ============================================
    // MORPHOLOGICAL SMELLS (shape & readability)
    // ============================================

    'too_long_sentence': {
        name: SMELL_DISPLAY_NAMES['too_long_sentence'],
        category: 'morphological',
        description: 'The requirement is too long and complex (>30-40 tokens), often with multiple "and/or" chains, making it difficult to understand and verify.',
        why_it_matters: 'Long requirements are harder to read, more likely to contain multiple requirements, and increase the risk of misunderstanding.',
        how_to_fix: [
            'Break into multiple smaller requirements',
            'Remove unnecessary details and explanations',
            'Focus on a single concern per requirement',
            'Move implementation details to design documents'
        ],
        example_before: 'The system shall provide secure user authentication using OAuth 2.0 or similar industry-standard protocols with multi-factor authentication support including SMS, email, and authenticator apps, and shall also log all authentication attempts with timestamps and IP addresses for security auditing purposes.',
        example_after: 'REQ-1: The system shall authenticate users using OAuth 2.0.\nREQ-2: The system shall support multi-factor authentication.\nREQ-3: The system shall log all authentication attempts.'
    },

    'too_short_sentence': {
        name: SMELL_DISPLAY_NAMES['too_short_sentence'],
        category: 'morphological',
        description: 'The requirement is too brief and lacks necessary context, constraints, or acceptance criteria.',
        why_it_matters: 'Short requirements often omit critical details, leading to ambiguity and varied interpretations.',
        how_to_fix: [
            'Add specific acceptance criteria',
            'Include constraints and conditions',
            'Specify expected behavior clearly',
            'Define what constitutes successful completion'
        ],
        example_before: 'The system shall be fast.',
        example_after: 'The system shall respond to 95% of API requests within 200ms under normal load conditions.'
    },

    'unreadable_structure': {
        name: SMELL_DISPLAY_NAMES['unreadable_structure'],
        category: 'morphological',
        description: 'The requirement uses complex syntax, heavy nesting, or confusing punctuation that hinders comprehension.',
        why_it_matters: 'Poor readability increases the chance of misinterpretation and errors during implementation.',
        how_to_fix: [
            'Use simple, clear sentence structures',
            'Break complex sentences into multiple simple ones',
            'Reduce nesting and parenthetical clauses',
            'Follow the "shall" convention for requirements'
        ],
        example_before: 'In the event that a user (who has been properly authenticated and authorized) attempts to access restricted content (which includes, but is not limited to, premium features), the system should (depending on configuration) either redirect to login or display an error.',
        example_after: 'The system shall redirect unauthorized users to the login page when they attempt to access restricted content.'
    },

    'punctuation_issue': {
        name: SMELL_DISPLAY_NAMES['punctuation_issue'],
        category: 'morphological',
        description: 'The requirement has excessive or missing punctuation that affects clarity.',
        why_it_matters: 'Poor punctuation can change meaning or make requirements difficult to parse.',
        how_to_fix: [
            'Use punctuation appropriately and consistently',
            'Remove excessive commas or semicolons',
            'Add punctuation where needed for clarity',
            'Use bullet points for lists instead of complex punctuation'
        ],
        example_before: 'The system shall; validate user input, check permissions: authenticate the user and, log the action.',
        example_after: 'REQ-1: The system shall validate user input.\nREQ-2: The system shall authenticate the user.\nREQ-3: The system shall log the action.'
    },

    'acronym_overuse_or_abbrev': {
        name: SMELL_DISPLAY_NAMES['acronym_overuse_or_abbrev'],
        category: 'morphological',
        description: 'The requirement uses heavy acronyms or abbreviations without introduction, making it hard to understand.',
        why_it_matters: 'Unexplained acronyms can confuse stakeholders and lead to misinterpretation.',
        how_to_fix: [
            'Spell out acronyms on first use',
            'Maintain a glossary of terms',
            'Use common terminology where possible',
            'Balance brevity with clarity'
        ],
        example_before: 'The API shall support RBAC with JWT for SSO via SAML or OIDC.',
        example_after: 'The API shall support Role-Based Access Control (RBAC) using JSON Web Tokens (JWT) for Single Sign-On (SSO) via SAML or OpenID Connect (OIDC).'
    },

    // ============================================
    // LEXICAL SMELLS (word choice)
    // ============================================

    'non_atomic_requirement': {
        name: SMELL_DISPLAY_NAMES['non_atomic_requirement'],
        category: 'lexical',
        description: 'Multiple distinct actions or concerns are combined into a single requirement using "and" or "or".',
        why_it_matters: 'Compound requirements are difficult to test individually, may have different priorities, and reduce traceability.',
        how_to_fix: [
            'Split into separate requirements',
            'Test each requirement independently',
            'Allow separate prioritization',
            'Remove conjunctions that join distinct concerns'
        ],
        example_before: 'The system shall encrypt data at rest and in transit and shall provide audit logs.',
        example_after: 'REQ-1: The system shall encrypt data at rest.\nREQ-2: The system shall encrypt data in transit.\nREQ-3: The system shall provide audit logs.'
    },

    'negative_formulation': {
        name: SMELL_DISPLAY_NAMES['negative_formulation'],
        category: 'lexical',
        description: 'The requirement uses "must not" or "shall not" where a positive formulation would be clearer.',
        why_it_matters: 'Negative requirements can be harder to verify and may leave the desired behavior implicit.',
        how_to_fix: [
            'Rephrase in positive terms when possible',
            'State what the system SHALL do',
            'Make expected behavior explicit',
            'Use negative only when necessary for safety'
        ],
        example_before: 'The system shall not allow unauthorized access.',
        example_after: 'The system shall authenticate and authorize all users before granting access.'
    },

    'vague_pronoun_or_reference': {
        name: SMELL_DISPLAY_NAMES['vague_pronoun_or_reference'],
        category: 'lexical',
        description: 'The requirement uses pronouns like "it", "this", "that", "they" without a clear referent.',
        why_it_matters: 'Ambiguous pronouns can lead to different interpretations of what the requirement refers to.',
        how_to_fix: [
            'Replace pronouns with specific nouns',
            'Name the subject explicitly',
            'Use consistent terminology',
            'Avoid ambiguous references'
        ],
        example_before: 'When the user logs in, it shall verify their credentials.',
        example_after: 'When the user logs in, the system shall verify the user\'s credentials.'
    },

    'subjective_language': {
        name: SMELL_DISPLAY_NAMES['subjective_language'],
        category: 'lexical',
        description: 'The requirement uses subjective terms like "user-friendly", "simple", "fast", or "easy" without measurable criteria.',
        why_it_matters: 'Subjective terms mean different things to different people and cannot be objectively verified.',
        how_to_fix: [
            'Replace subjective terms with measurable criteria',
            'Define specific metrics and thresholds',
            'Use objective, quantifiable language',
            'Specify acceptance criteria'
        ],
        example_before: 'The system shall provide a user-friendly interface.',
        example_after: 'The system shall allow users to complete common tasks in under 3 clicks with 95% success rate in usability testing.'
    },

    'vague_or_implicit_terms': {
        name: SMELL_DISPLAY_NAMES['vague_or_implicit_terms'],
        category: 'lexical',
        description: 'The requirement uses vague terms like "normally", "usually", "as appropriate", "if possible", or "etc."',
        why_it_matters: 'Vague terms leave behavior undefined and make requirements unverifiable.',
        how_to_fix: [
            'Remove hedge words like "normally" or "usually"',
            'Make conditions explicit',
            'Define all cases clearly',
            'Remove "etc." and list all items'
        ],
        example_before: 'The system shall normally respond within 2 seconds, as appropriate.',
        example_after: 'The system shall respond within 2 seconds under normal load conditions (less than 100 concurrent users).'
    },

    'non_verifiable_qualifier': {
        name: SMELL_DISPLAY_NAMES['non_verifiable_qualifier'],
        category: 'lexical',
        description: 'The requirement uses qualifiers like "as soon as possible", "minimal delay", or "high performance" without measurable metrics.',
        why_it_matters: 'Without specific metrics, it\'s impossible to verify if the requirement has been met.',
        how_to_fix: [
            'Replace with specific numerical thresholds',
            'Define measurement criteria',
            'Specify acceptable ranges',
            'Use industry standards where applicable'
        ],
        example_before: 'The system shall process requests with minimal delay.',
        example_after: 'The system shall process 95% of requests within 200ms.'
    },

    'loophole_or_open_ended': {
        name: SMELL_DISPLAY_NAMES['loophole_or_open_ended'],
        category: 'lexical',
        description: 'The requirement uses phrases like "at least", "up to", "including but not limited to" without clear bounds.',
        why_it_matters: 'Open-ended requirements make it difficult to determine when implementation is complete.',
        how_to_fix: [
            'Specify exact bounds or ranges',
            'Define all cases explicitly',
            'Remove escape clauses',
            'Make requirements testable and finite'
        ],
        example_before: 'The system shall support at least PDF, Word, and other common formats.',
        example_after: 'The system shall support the following file formats: PDF, DOCX, TXT, and CSV.'
    },

    'superlative_or_comparative_without_reference': {
        name: SMELL_DISPLAY_NAMES['superlative_or_comparative_without_reference'],
        category: 'lexical',
        description: 'The requirement uses comparatives like "better", "faster", or superlatives like "best", "most" without a baseline.',
        why_it_matters: 'Comparatives and superlatives are meaningless without a reference point for comparison.',
        how_to_fix: [
            'Specify the baseline for comparison',
            'Use absolute metrics instead',
            'Define what "better" means quantitatively',
            'Provide concrete thresholds'
        ],
        example_before: 'The new system shall be faster than the current one.',
        example_after: 'The system shall process requests 50% faster than the current system (average 200ms vs 400ms).'
    },

    'quantifier_without_unit_or_range': {
        name: SMELL_DISPLAY_NAMES['quantifier_without_unit_or_range'],
        category: 'lexical',
        description: 'The requirement uses quantifiers like "many", "few", "several" or numbers without units.',
        why_it_matters: 'Quantifiers without units are ambiguous and unverifiable.',
        how_to_fix: [
            'Replace vague quantifiers with specific numbers',
            'Always include units of measurement',
            'Define ranges with upper and lower bounds',
            'Be precise with quantities'
        ],
        example_before: 'The system shall handle many concurrent users.',
        example_after: 'The system shall handle at least 1000 concurrent users.'
    },

    'design_or_implementation_detail': {
        name: SMELL_DISPLAY_NAMES['design_or_implementation_detail'],
        category: 'lexical',
        description: 'The requirement specifies HOW (technology, architecture, pseudo-code) instead of WHAT behavior is needed.',
        why_it_matters: 'Requirements should focus on what the system must do, leaving implementation choices to designers and developers.',
        how_to_fix: [
            'Focus on behavior and outcomes, not implementation',
            'Remove technology-specific details',
            'State the capability needed, not the solution',
            'Move implementation details to design documents'
        ],
        example_before: 'The system shall use a PostgreSQL database with connection pooling to store user data.',
        example_after: 'The system shall persistently store user data with 99.9% availability.'
    },

    'implicit_requirement': {
        name: SMELL_DISPLAY_NAMES['implicit_requirement'],
        category: 'lexical',
        description: 'Significant behavior is only implied rather than explicitly stated in the requirement.',
        why_it_matters: 'Implicit requirements can be overlooked or interpreted differently by different stakeholders.',
        how_to_fix: [
            'Make all expected behavior explicit',
            'State assumptions clearly',
            'Don\'t rely on "common sense"',
            'Write out all necessary conditions'
        ],
        example_before: 'The system shall allow users to delete their account.',
        example_after: 'The system shall allow users to delete their account. Upon deletion, the system shall permanently remove all user data within 30 days and send a confirmation email.'
    },

    // ============================================
    // ANALYTICAL SMELLS (grammar & structure)
    // ============================================

    'overuse_imperative_form': {
        name: SMELL_DISPLAY_NAMES['overuse_imperative_form'],
        category: 'analytical',
        description: 'Long list of commands without clear conditions, context, or actors.',
        why_it_matters: 'Too many imperatives without structure can be overwhelming and miss important conditions.',
        how_to_fix: [
            'Group related requirements',
            'Add conditions and context',
            'Specify actors and triggers',
            'Organize into logical sections'
        ],
        example_before: 'Validate input. Check permissions. Log action. Update database. Send notification. Clear cache. Refresh view.',
        example_after: 'When a user submits a form, the system shall: (1) validate input, (2) check permissions, (3) update database, (4) send notification.'
    },

    'missing_imperative_verb': {
        name: SMELL_DISPLAY_NAMES['missing_imperative_verb'],
        category: 'analytical',
        description: 'The requirement lacks a clear action verb (shall, will, must) and reads like a description.',
        why_it_matters: 'Requirements need clear obligations; descriptive statements can be ambiguous about what\'s required.',
        how_to_fix: [
            'Start with subject + "shall" + action verb',
            'Make the obligation explicit',
            'Use imperative mood consistently',
            'Avoid passive descriptions'
        ],
        example_before: 'User data is encrypted.',
        example_after: 'The system shall encrypt all user data at rest.'
    },

    'conditional_or_non_assertive_requirement': {
        name: SMELL_DISPLAY_NAMES['conditional_or_non_assertive_requirement'],
        category: 'analytical',
        description: 'Uses weak modals ("may", "might", "could", "should", "maybe", "possibly") that weaken the obligation, OR excessive nested "if...then" logic that obscures the requirement.',
        why_it_matters: 'Weak modals make it unclear if something is required or optional. Complex conditional nesting obscures the core obligation.',
        how_to_fix: [
            'Replace weak modals with "shall" for mandatory requirements',
            'Use "should" only for recommendations, not requirements',
            'Remove hedging words like "maybe" or "possibly"',
            'Simplify complex nested conditions',
            'Break complex conditional logic into multiple requirements'
        ],
        example_before: 'The system should maybe encrypt data if possible.',
        example_after: 'The system shall encrypt all sensitive data at rest.'
    },

    'passive_voice': {
        name: SMELL_DISPLAY_NAMES['passive_voice'],
        category: 'analytical',
        description: 'The requirement uses passive voice, making it unclear who or what performs the action.',
        why_it_matters: 'Passive voice can hide the actor, leading to confusion about responsibility.',
        how_to_fix: [
            'Use active voice: "The system shall..."',
            'Specify the actor explicitly',
            'Make responsibilities clear',
            'Use consistent subject throughout'
        ],
        example_before: 'User data must be validated before being stored.',
        example_after: 'The system shall validate user data before storing it.'
    },

    'domain_term_imbalance': {
        name: SMELL_DISPLAY_NAMES['domain_term_imbalance'],
        category: 'analytical',
        description: 'Too much unexplained jargon, or missing expected domain terminology.',
        why_it_matters: 'Wrong level of domain terminology can confuse stakeholders or fail to communicate properly with experts.',
        how_to_fix: [
            'Match terminology to audience',
            'Explain technical terms for non-experts',
            'Use standard domain vocabulary for experts',
            'Maintain a glossary'
        ],
        example_before: 'The GUI shall facilitate CRUD ops on the DB via the ORM.',
        example_after: 'The user interface shall allow users to create, read, update, and delete records in the database.'
    },

    // ============================================
    // RELATIONAL SMELLS (dependencies)
    // ============================================

    'too_many_dependencies_or_versions': {
        name: SMELL_DISPLAY_NAMES['too_many_dependencies_or_versions'],
        category: 'relational',
        description: 'The requirement references many other requirements or versions, creating complex coupling.',
        why_it_matters: 'High coupling makes requirements harder to understand, test, and change independently.',
        how_to_fix: [
            'Reduce unnecessary dependencies',
            'Group related requirements',
            'Use interfaces to decouple',
            'Reference only essential dependencies'
        ],
        example_before: 'This requirement depends on REQ-1, REQ-2, REQ-3, REQ-7, REQ-10, REQ-15, and REQ-22.',
        example_after: 'This requirement depends on the Authentication Module (see REQ-AUTH-1).'
    },

    'excessive_or_insufficient_coupling': {
        name: SMELL_DISPLAY_NAMES['excessive_or_insufficient_coupling'],
        category: 'relational',
        description: 'Requirements are either overly entangled with each other or floating with no clear relationships.',
        why_it_matters: 'Wrong coupling level makes it hard to understand relationships and impacts of changes.',
        how_to_fix: [
            'Define clear interfaces between modules',
            'Establish appropriate relationships',
            'Group related requirements',
            'Document dependencies explicitly'
        ],
        example_before: 'REQ-42 exists in isolation with no context or relations.',
        example_after: 'REQ-42 shall extend the functionality defined in REQ-40 (User Authentication).'
    },

    'deep_nesting_or_structure_issue': {
        name: SMELL_DISPLAY_NAMES['deep_nesting_or_structure_issue'],
        category: 'relational',
        description: 'Deeply nested hierarchy or confusing organizational structure affects understanding.',
        why_it_matters: 'Complex nesting makes requirements hard to navigate and understand relationships.',
        how_to_fix: [
            'Flatten hierarchy where possible',
            'Limit nesting to 3-4 levels maximum',
            'Use clear categorization',
            'Provide overview diagrams'
        ],
        example_before: 'REQ-1.2.3.4.5.6: Deeply nested sub-sub-sub-sub-requirement.',
        example_after: 'REQ-AUTH-6: Clear categorization with shallow nesting (Module-Category-Number).'
    },

    // ============================================
    // INCOMPLETENESS & LANGUAGE SMELLS
    // ============================================

    'incomplete_requirement': {
        name: SMELL_DISPLAY_NAMES['incomplete_requirement'],
        category: 'incompleteness',
        description: 'The requirement is missing essential elements like trigger, actor, system response, or success criteria.',
        why_it_matters: 'Incomplete requirements cannot be properly implemented or verified.',
        how_to_fix: [
            'Specify the trigger or condition',
            'Identify the actor',
            'Define the system response',
            'Add acceptance criteria'
        ],
        example_before: 'The system shall validate.',
        example_after: 'When a user submits a form, the system shall validate all required fields and display error messages for invalid data.'
    },

    'incomplete_reference_or_condition': {
        name: SMELL_DISPLAY_NAMES['incomplete_reference_or_condition'],
        category: 'incompleteness',
        description: 'The requirement references undefined things or has incomplete conditions.',
        why_it_matters: 'Undefined references and incomplete conditions create ambiguity and implementation gaps.',
        how_to_fix: [
            'Define all referenced items',
            'Complete all conditions',
            'Ensure all terms are explained',
            'Link to external definitions if needed'
        ],
        example_before: 'The system shall comply with the security policy.',
        example_after: 'The system shall comply with the Corporate Information Security Policy v2.1 (Document ID: SEC-POL-001).'
    },

    'missing_system_response': {
        name: SMELL_DISPLAY_NAMES['missing_system_response'],
        category: 'incompleteness',
        description: 'The requirement states a condition but not what the system should do in response.',
        why_it_matters: 'Without a clear response, the requirement is incomplete and cannot be implemented.',
        how_to_fix: [
            'Add explicit system response',
            'Define expected behavior',
            'Specify all outcomes',
            'Include error handling'
        ],
        example_before: 'When the user enters invalid data...',
        example_after: 'When the user enters invalid data, the system shall display a specific error message and prevent form submission.'
    },

    'incorrect_or_confusing_order': {
        name: SMELL_DISPLAY_NAMES['incorrect_or_confusing_order'],
        category: 'incompleteness',
        description: 'Steps or requirements are presented in a confusing or illogical order.',
        why_it_matters: 'Wrong ordering can lead to misunderstanding of the intended workflow or process.',
        how_to_fix: [
            'Present steps in chronological order',
            'Number steps clearly',
            'Use flowcharts for complex processes',
            'Group related requirements logically'
        ],
        example_before: 'The system shall log the result, validate input, and then process the request.',
        example_after: 'The system shall: (1) validate input, (2) process the request, (3) log the result.'
    },

    'missing_unit_of_measurement': {
        name: SMELL_DISPLAY_NAMES['missing_unit_of_measurement'],
        category: 'incompleteness',
        description: 'Numeric values are specified without units of measurement.',
        why_it_matters: 'Without units, numeric requirements are ambiguous and unverifiable.',
        how_to_fix: [
            'Always specify units (ms, MB, seconds, etc.)',
            'Use standard units consistently',
            'Define custom units if needed',
            'Include tolerances where appropriate'
        ],
        example_before: 'The system shall respond within 200.',
        example_after: 'The system shall respond within 200 milliseconds.'
    },

    'partial_content_or_incomplete_enumeration': {
        name: SMELL_DISPLAY_NAMES['partial_content_or_incomplete_enumeration'],
        category: 'incompleteness',
        description: 'The requirement uses "etc.", "and so on", or leaves lists clearly incomplete.',
        why_it_matters: 'Incomplete enumerations make requirements open to interpretation and unverifiable.',
        how_to_fix: [
            'List all items explicitly',
            'Remove "etc." and "and so on"',
            'If list is truly open, create a separate extensibility requirement',
            'Be complete and specific'
        ],
        example_before: 'The system shall support common browsers like Chrome, Firefox, etc.',
        example_after: 'The system shall support the following browsers: Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+.'
    },

    'embedded_rationale_or_justification': {
        name: SMELL_DISPLAY_NAMES['embedded_rationale_or_justification'],
        category: 'incompleteness',
        description: 'The requirement mixes "why" (rationale) into the "what" (requirement).',
        why_it_matters: 'Mixing rationale with requirements makes it harder to understand the actual obligation.',
        how_to_fix: [
            'Separate rationale from requirement',
            'Use a separate "Rationale" field',
            'Keep requirements focused on "what"',
            'Document "why" in supporting documentation'
        ],
        example_before: 'The system shall encrypt data because security is important and breaches are costly.',
        example_after: 'REQ: The system shall encrypt all user data at rest using AES-256.\nRationale: Required for GDPR compliance and to prevent data breaches.'
    },

    'undefined_term': {
        name: SMELL_DISPLAY_NAMES['undefined_term'],
        category: 'incompleteness',
        description: 'Specialized terms are used without definition and may be ambiguous in context.',
        why_it_matters: 'Undefined terms can be interpreted differently by different stakeholders.',
        how_to_fix: [
            'Define specialized terms on first use',
            'Maintain a glossary',
            'Use standard industry terminology',
            'Link to definitions'
        ],
        example_before: 'The system shall implement proper sanitization.',
        example_after: 'The system shall sanitize all user input by removing HTML tags and escaping special characters before storage (see Glossary: Input Sanitization).'
    },

    'language_error_or_grammar_issue': {
        name: SMELL_DISPLAY_NAMES['language_error_or_grammar_issue'],
        category: 'incompleteness',
        description: 'Grammar or spelling errors affect the clarity of the requirement.',
        why_it_matters: 'Language errors can change meaning and reduce professionalism.',
        how_to_fix: [
            'Use spell-check and grammar tools',
            'Have requirements reviewed',
            'Follow consistent style guide',
            'Ensure proper subject-verb agreement'
        ],
        example_before: 'The system shall validates user input and store it in database.',
        example_after: 'The system shall validate user input and store it in the database.'
    },

    'ambiguous_plurality': {
        name: SMELL_DISPLAY_NAMES['ambiguous_plurality'],
        category: 'incompleteness',
        description: 'It\'s unclear whether the requirement applies to all items, some items, or one item.',
        why_it_matters: 'Ambiguous plurality can lead to under-implementation or over-implementation.',
        how_to_fix: [
            'Specify "each", "all", "at least one", or "any"',
            'Make cardinality explicit',
            'Use precise quantifiers',
            'Clarify scope'
        ],
        example_before: 'The system shall validate the field.',
        example_after: 'The system shall validate each field in the form.'
    },
};

/**
 * Get details for a specific smell
 */
export function getSmellDetails(smell: string): SmellDetails | null {
    return SMELL_DETAILS[smell] || null;
}

/**
 * Get all smells in a category
 */
export function getSmellsByCategory(category: SmellCategory): SmellDetails[] {
    return Object.values(SMELL_DETAILS).filter(smell => smell.category === category);
}
