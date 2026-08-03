class SmartMemory {
    constructor() {
        this.conversations = new Map();
    }

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

    updateFromMessage(sessionId, message, intentResult, languageResult) {
        const memory = this.getSession(sessionId);

        memory.messageCount++;
        memory.lastActivity = Date.now();

        if (intentResult.cropName) {
            memory.crop = intentResult.cropName;
            memory.topics.push({ type: 'crop', value: intentResult.cropName, time: Date.now() });
        }

        if (intentResult.location) {
            memory.location = intentResult.location;
        }

        if (intentResult.season) {
            memory.season = intentResult.season;
        }

        if (languageResult.language) {
            memory.language = languageResult.language;
        }
        if (languageResult.dialect) {
            memory.dialect = languageResult.dialect;
        }

        if (intentResult.isDiseaseQuery) {
            memory.disease = message.substring(0, 100);
        }

        memory.lastIntent = intentResult.primaryIntent;

        if (memory.topics.length > 10) {
            memory.topics = memory.topics.slice(-10);
        }
    }

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

    shouldAsk(sessionId, questionType) {
        const memory = this.getSession(sessionId);

        switch (questionType) {
            case 'crop':
                return !memory.crop;
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

    cleanup() {
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        for (const [sessionId, memory] of this.conversations) {
            if (now - memory.lastActivity > twoHours) {
                this.conversations.delete(sessionId);
            }
        }
    }

    activeSessions() {
        return this.conversations.size;
    }
}

const smartMemory = new SmartMemory();

export { smartMemory };
