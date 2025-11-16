/**
 * Background Script
 * Handles API calls to the backend (no CORS restrictions)
 */

import { API_BASE_URL } from './constants';

interface AnalysisRequest {
    requirement_id: string;
    description: string;
    activity_points?: number;
}

interface AnalysisResult {
    requirement_id: string;
    description: string;
    smells: string[];
    explanation: string | null;
    raw_model_output?: any;
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ANALYZE_REQUIREMENT') {
        handleAnalyzeRequirement(message.data)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep the message channel open for async response
    }

    if (message.type === 'CHECK_API_HEALTH') {
        handleHealthCheck()
            .then(isHealthy => sendResponse({ success: true, data: isHealthy }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

/**
 * Handle requirement analysis request
 */
async function handleAnalyzeRequirement(data: AnalysisRequest): Promise<AnalysisResult | null> {
    const { requirement_id, description, activity_points } = data;

    if (!description || description.trim().length === 0) {
        console.warn('[ReqRev Background] Cannot analyze empty requirement');
        return null;
    }

    try {
        console.log(`[ReqRev Background] Analyzing requirement: ${requirement_id}`);

        const response = await fetch(`${API_BASE_URL}/analyze_requirement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requirement_id,
                description: description.trim(),
                activity_points,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: `HTTP ${response.status}: ${response.statusText}`,
            }));
            console.error('[ReqRev Background] Analysis API error:', errorData);
            return null;
        }

        const result: AnalysisResult = await response.json();
        console.log(`[ReqRev Background] Analysis complete for ${requirement_id}:`, result.smells);
        return result;
    } catch (error) {
        console.error('[ReqRev Background] Failed to analyze requirement:', error);
        return null;
    }
}

/**
 * Handle health check request
 */
async function handleHealthCheck(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        console.error('[ReqRev Background] Backend API health check failed:', error);
        return false;
    }
}

console.log('[ReqRev Background] Service worker initialized');
