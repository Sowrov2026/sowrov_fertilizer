// V19 Self-Evolving API
// Netlify Function for managing AI learning data

const {
    storeUnanswered,
    getUnanswered,
    updateUnansweredStatus,
    trackPopular,
    getPopular,
    storeFeedback,
    getFeedback,
    getFeedbackStats,
    getFlagged,
    updateFlaggedStatus,
    getSuggestions,
    updateSuggestionStatus,
    getLogs,
    getLogStats,
    getQualityStats,
    generateMonthlyReport,
    runHealthCheck,
} = require('./v19-data');

const { processChatResponse, checkUnknownQuestion, handleUnknownQuestion, generateSuggestions } = require('./v19-chat');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    try {
        const url = new URL(event.path, 'http://localhost');
        const action = url.searchParams.get('action') || event.queryStringParameters?.action;
        const body = event.body ? JSON.parse(event.body) : {};

        switch (action) {
            // ── Unknown Questions ──
            case 'store_unanswered':
                storeUnanswered(body);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            
            case 'get_unanswered':
                const unanswered = getUnanswered({
                    status: url.searchParams.get('status'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                return { statusCode: 200, headers, body: JSON.stringify(unanswered) };
            
            case 'update_unanswered':
                updateUnansweredStatus(body.id, body.status);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            
            // ── Popular Questions ──
            case 'track_popular':
                trackPopular(body.question, body.metadata);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            
            case 'get_popular':
                const popular = getPopular({
                    limit: parseInt(url.searchParams.get('limit') || '50'),
                    category: url.searchParams.get('category'),
                });
                return { statusCode: 200, headers, body: JSON.stringify(popular) };
            
            // ── Feedback ──
            case 'store_feedback':
                storeFeedback(body);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            
            case 'get_feedback':
                const feedback = getFeedback({
                    rating: url.searchParams.get('rating'),
                    needsReview: url.searchParams.get('needsReview') === 'true',
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                return { statusCode: 200, headers, body: JSON.stringify(feedback) };
            
            case 'feedback_stats':
                const stats = getFeedbackStats();
                return { statusCode: 200, headers, body: JSON.stringify(stats) };
            
            // ── Flagged Answers ──
            case 'get_flagged':
                const flagged = getFlagged({
                    status: url.searchParams.get('status'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                return { statusCode: 200, headers, body: JSON.stringify(flagged) };
            
            case 'update_flagged':
                updateFlaggedStatus(body.id, body.status);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            
            // ── Suggestions ──
            case 'get_suggestions':
                const suggestions = getSuggestions({
                    type: url.searchParams.get('type'),
                    status: url.searchParams.get('status'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                return { statusCode: 200, headers, body: JSON.stringify(suggestions) };
            
            case 'update_suggestion':
                updateSuggestionStatus(body.id, body.status);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            
            // ── Logs ──
            case 'get_logs':
                const logs = getLogs({
                    type: url.searchParams.get('type'),
                    startDate: url.searchParams.get('startDate'),
                    endDate: url.searchParams.get('endDate'),
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                });
                return { statusCode: 200, headers, body: JSON.stringify(logs) };
            
            case 'log_stats':
                const logStats = getLogStats();
                return { statusCode: 200, headers, body: JSON.stringify(logStats) };
            
            // ── Quality ──
            case 'quality_stats':
                const qualityStats = getQualityStats();
                return { statusCode: 200, headers, body: JSON.stringify(qualityStats) };
            
            // ── Reports ──
            case 'monthly_report':
                const report = generateMonthlyReport();
                return { statusCode: 200, headers, body: JSON.stringify(report) };
            
            // ── Health Check ──
            case 'health_check':
                const health = runHealthCheck();
                return { statusCode: 200, headers, body: JSON.stringify(health) };
            
            // ── Chat Integration ──
            case 'track_chat':
                processChatResponse(body.message, body.response, body.intent, body.language, body.startTime);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            
            case 'check_unknown':
                const isUnknown = checkUnknownQuestion(body.message, body.intent, body.knowledgeContext);
                return { statusCode: 200, headers, body: JSON.stringify({ unknown: isUnknown }) };
            
            default:
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
        }
    } catch (error) {
        console.error('V19 API error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
