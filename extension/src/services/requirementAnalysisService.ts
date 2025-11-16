/**
 * Requirement Analysis Service
 * Handles communication with the backend API for smell detection
 */


export interface AnalysisResult {
    requirement_id: string;
    description: string;
    smells: string[];
    explanation: string | null;
    raw_model_output?: any;
}

export interface AnalysisError {
    error: string;
    detail?: string;
}

/**
 * Analyze a requirement using the backend API
 * Uses message passing to background script to avoid CORS issues
 */
export async function analyzeRequirement(
    requirementId: string,
    description: string,
    activityPoints?: number
): Promise<AnalysisResult | null> {
    if (!description || description.trim().length === 0) {
        console.warn('[ReqRev] Cannot analyze empty requirement');
        return null;
    }

    try {
        console.log(`[ReqRev] Requesting analysis for: ${requirementId}`);

        // Send message to background script (no CORS restrictions there)
        const response = await chrome.runtime.sendMessage({
            type: 'ANALYZE_REQUIREMENT',
            data: {
                requirement_id: requirementId,
                description: description.trim(),
                activity_points: activityPoints,
            },
        });

        if (!response.success) {
            console.error('[ReqRev] Analysis failed:', response.error);
            return null;
        }

        const result: AnalysisResult = response.data;
        if (result) {
            console.log(`[ReqRev] Analysis complete for ${requirementId}:`, result.smells);
        }
        return result;
    } catch (error) {
        console.error('[ReqRev] Failed to analyze requirement:', error);
        return null;
    }
}

/**
 * Batch analyze multiple requirements
 */
export async function analyzeRequirements(
    requirements: Array<{ id: string; description: string; activityPoints?: number }>
): Promise<Map<string, string[]>> {
    const results = new Map<string, string[]>();

    // Analyze sequentially to avoid overwhelming the API
    for (const req of requirements) {
        const result = await analyzeRequirement(req.id, req.description, req.activityPoints);
        if (result) {
            results.set(req.id, result.smells);
        } else {
            results.set(req.id, []);
        }
    }

    return results;
}

/**
 * Check if the backend API is available
 * Uses message passing to background script to avoid CORS issues
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'CHECK_API_HEALTH',
        });

        if (!response.success) {
            console.error('[ReqRev] Health check failed:', response.error);
            return false;
        }

        return response.data;
    } catch (error) {
        console.error('[ReqRev] Backend API health check failed:', error);
        return false;
    }
}
