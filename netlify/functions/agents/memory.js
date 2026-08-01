/**
 * Smart Memory — V11 Enterprise
 * Responsibilities: Remember user crop, location, preferred language, recent disease, recent product, season
 * Never ask repeatedly
 */

class SmartMemory {
    constructor() {
        this.conversations = new Map(); // sessionId -> memory
    }

    /**
     * Get or create memory for a session
     */
    getSession(sessionId) {
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, {
                crop: null,
                location: null,
                language: null,
                dialect: null,
                disease: null,
                product: null,
                season: null,
                lastIntent: null,
                topics: [],
                messageCount: 0,
                lastActivity: Date.now(),
            });
        }
        return this.conversations.get(sessionId);
    }

    /**
     * Update memory from user message
     */
    updateFromMessage(sessionId, message, intentResult, languageResult) {
        const memory = this.getSession(sessionId);

        memory.messageCount++;
        memory.lastActivity = Date.now();

        // Update crop
        if (intentResult.cropName) {
            memory.crop = intentResult.cropName;
            memory.topics.push({ type: 'crop', value: intentResult.cropName, time: Date.now() });
        }

        // Update location
        if (intentResult.location) {
            memory.location = intentResult.location;
        }

        // Update season
        if (intentResult.season) {
            memory.season = intentResult.season;
        }

        // Update language
        if (languageResult.language) {
            memory.language = languageResult.language;
        }
        if (languageResult.dialect) {
            memory.dialect = languageResult.dialect;
        }

        // Update disease
        if (intentResult.isDiseaseQuery) {
            memory.disease = message.substring(0, 100); // Store first 100 chars
        }

        // Update last intent
        memory.lastIntent = intentResult.primaryIntent;

        // Keep only last 10 topics
        if (memory.topics.length > 10) {
            memory.topics = memory.topics.slice(-10);
        }
    }

    /**
     * Get context summary for LLM
     */
    getContextSummary(sessionId) {
        const memory = this.getSession(sessionId);
        const parts = [];

        if (memory.crop) parts.push(`Previously discussed crop: ${memory.crop}`);
        if (memory.location) parts.push(`User location: ${memory.location} (give local recommendations)`);
        if (memory.season) parts.push(`Current season: ${memory.season}`);
        if (memory.disease) parts.push(`Recent disease discussed: ${memory.disease}`);
        if (memory.language) parts.push(`User language: ${memory.language}`);
        if (memory.dialect) parts.push(`User dialect: ${memory.dialect}`);

        return parts.join('\n');
    }

    /**
     * Check if we should avoid asking something (already known)
     */
    shouldAsk(sessionId, questionType) {
        const memory = this.getSession(sessionId);

        switch (questionType) {
            case 'crop':
                return !memory.crop; // Only ask if no crop known
            case 'location':
                return !memory.location;
            case 'season':
                return !memory.season;
            case 'language':
                return !memory.language;
            default:
                return true;
        }
    }

    /**
     * Clean up old sessions (older than 2 hours)
     */
    cleanup() {
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        for (const [sessionId, memory] of this.conversations) {
            if (now - memory.lastActivity > twoHours) {
                this.conversations.delete(sessionId);
            }
        }
    }

    /**
     * Get total active sessions
     */
    activeSessions() {
        return this.conversations.size;
    }
}

// Singleton instance
const smartMemory = new SmartMemory();

// V33 FIX: Remove setInterval - never fires in Netlify Functions
// Cleanup is now called inline at the start of each request in chat.js

module.exports = { smartMemory };
