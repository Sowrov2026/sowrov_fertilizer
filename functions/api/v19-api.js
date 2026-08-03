import {
    storeUnanswered, getUnanswered, updateUnansweredStatus,
    trackPopular, getPopular,
    storeFeedback, getFeedback, getFeedbackStats,
    getFlagged, updateFlaggedStatus,
    getSuggestions, updateSuggestionStatus,
    getLogs, getLogStats,
    getQualityStats,
    generateMonthlyReport,
    runHealthCheck,
} from './_shared/v19-data.js';

import { processChatResponse, checkUnknownQuestion } from './_shared/v19-chat.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
};

export async function onRequest(context) {
    const { request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const body = request.method === 'POST' ? await request.json() : {};

        let result;

        switch (action) {
            case 'store_unanswered':
                storeUnanswered(body);
                result = { success: true };
                break;
            case 'get_unanswered':
                result = getUnanswered({
                    status: url.searchParams.get('status'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                break;
            case 'update_unanswered':
                updateUnansweredStatus(body.id, body.status);
                result = { success: true };
                break;
            case 'track_popular':
                trackPopular(body.question, body.metadata);
                result = { success: true };
                break;
            case 'get_popular':
                result = getPopular({
                    limit: parseInt(url.searchParams.get('limit') || '50'),
                    category: url.searchParams.get('category'),
                });
                break;
            case 'store_feedback':
                storeFeedback(body);
                result = { success: true };
                break;
            case 'get_feedback':
                result = getFeedback({
                    rating: url.searchParams.get('rating'),
                    needsReview: url.searchParams.get('needsReview') === 'true',
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                break;
            case 'feedback_stats':
                result = getFeedbackStats();
                break;
            case 'get_flagged':
                result = getFlagged({
                    status: url.searchParams.get('status'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                break;
            case 'update_flagged':
                updateFlaggedStatus(body.id, body.status);
                result = { success: true };
                break;
            case 'get_suggestions':
                result = getSuggestions({
                    type: url.searchParams.get('type'),
                    status: url.searchParams.get('status'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                break;
            case 'update_suggestion':
                updateSuggestionStatus(body.id, body.status);
                result = { success: true };
                break;
            case 'get_logs':
                result = getLogs({
                    type: url.searchParams.get('type'),
                    startDate: url.searchParams.get('startDate'),
                    endDate: url.searchParams.get('endDate'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                break;
            case 'log_stats':
                result = getLogStats();
                break;
            case 'quality_stats':
                result = getQualityStats();
                break;
            case 'monthly_report':
                result = generateMonthlyReport();
                break;
            case 'health_check':
                result = runHealthCheck();
                break;
            case 'track_chat':
                processChatResponse(body.message, body.response, body.intent, body.language, body.startTime);
                result = { success: true };
                break;
            case 'check_unknown':
                result = { unknown: checkUnknownQuestion(body.message, body.intent, body.knowledgeContext) };
                break;
            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders });
        }

        return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error('V19 API error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
    }
}
