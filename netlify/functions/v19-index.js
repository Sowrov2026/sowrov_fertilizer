const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge');
const INDEX_FILE = path.join(KNOWLEDGE_DIR, 'knowledge_index.json');

function scanKnowledgeBase() {
    const index = {
        crops: [],
        diseases: [],
        fertilizers: [],
        insects: [],
        weeds: [],
        faq: [],
        chatgaiya: [],
        weather: [],
        soil: [],
        government: [],
        lastRebuilt: new Date().toISOString(),
        totalDocuments: 0,
    };

    const knowledgeFiles = [
        { dir: 'crops', pattern: /\.js$/ },
        { dir: 'diseases', pattern: /\.js$/ },
        { dir: 'fertilizers', pattern: /\.js$/ },
        { dir: 'insects', pattern: /\.js$/ },
        { dir: 'weeds', pattern: /\.js$/ },
        { dir: 'weather', pattern: /\.js$/ },
        { dir: 'soil', pattern: /\.js$/ },
        { dir: 'government', pattern: /\.js$/ },
    ];

    knowledgeFiles.forEach(({ dir, pattern }) => {
        const dirPath = path.join(KNOWLEDGE_DIR, dir);
        if (fs.existsSync(dirPath)) {
            try {
                const files = fs.readdirSync(dirPath).filter(f => pattern.test(f));
                files.forEach(file => {
                    const filePath = path.join(dirPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const count = extractItemCount(content);
                    index[dir].push({ file: `${dir}/${file}`, count });
                    index.totalDocuments += count;
                });
            } catch (e) {
                console.error(`Error scanning ${dir}:`, e.message);
            }
        }
    });

    const faqPath = path.join(KNOWLEDGE_DIR, 'faq', 'database.js');
    if (fs.existsSync(faqPath)) {
        try {
            const content = fs.readFileSync(faqPath, 'utf8');
            const count = extractFaqCount(content);
            index.faq.push({ file: 'faq/database.js', count });
            index.totalDocuments += count;
        } catch (e) {
            console.error('Error scanning FAQ:', e.message);
        }
    }

    const chatgaiyaPath = path.join(KNOWLEDGE_DIR, '..', 'chatgaiya', 'engine.js');
    if (fs.existsSync(chatgaiyaPath)) {
        try {
            const content = fs.readFileSync(chatgaiyaPath, 'utf8');
            const count = extractChatgaiyaCount(content);
            index.chatgaiya.push({ file: 'chatgaiya/engine.js', count });
            index.totalDocuments += count;
        } catch (e) {
            console.error('Error scanning Chatgaiya:', e.message);
        }
    }

    const mainIndex = path.join(KNOWLEDGE_DIR, 'index.js');
    if (fs.existsSync(mainIndex)) {
        try {
            const content = fs.readFileSync(mainIndex, 'utf8');
            index.totalDocuments += extractDocCount(content);
        } catch (e) {
            console.error('Error scanning main index:', e.message);
        }
    }

    return index;
}

function extractItemCount(content) {
    const patterns = [
        /(\d+)\s*(?:items|entries|records|crops|diseases|fertilizers)/i,
        /(?:const|let|var)\s+\w+\s*=\s*\[[\s\S]*?\]/g,
        /id:\s*\d+/g,
    ];

    for (const pattern of patterns) {
        if (typeof pattern === 'string') continue;
        const matches = content.match(pattern);
        if (matches && typeof pattern.source === 'string' && pattern.source.includes('\\d+')) {
            return parseInt(matches[1]) || matches.length;
        }
        if (Array.isArray(matches)) {
            return matches.length;
        }
    }

    const lines = content.split('\n').filter(l => l.trim().length > 0);
    return Math.max(1, Math.floor(lines.length / 10));
}

function extractDocCount(content) {
    const match = content.match(/(\d+)\s*(?:documents|docs|entries|items|total)/i);
    return match ? parseInt(match[1]) : 0;
}

function extractFaqCount(content) {
    const matches = content.match(/id:\s*\d+/g);
    return matches ? matches.length : 0;
}

function extractChatgaiyaCount(content) {
    const matches = content.match(/banglish:/g);
    return matches ? matches.length : 0;
}

function rebuildIndex() {
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
        fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
    }

    const index = scanKnowledgeBase();

    try {
        fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
        console.log(`Index rebuilt: ${index.totalDocuments} documents`);
    } catch (e) {
        console.error('Failed to write index:', e.message);
    }

    return index;
}

function getIndex() {
    if (fs.existsSync(INDEX_FILE)) {
        try {
            const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
            const age = Date.now() - new Date(index.lastRebuilt).getTime();
            const maxAge = 24 * 60 * 60 * 1000;
            if (age > maxAge) {
                console.log('Index stale, rebuilding...');
                return rebuildIndex();
            }
            return index;
        } catch (e) {
            console.error('Index corrupt, rebuilding:', e.message);
            return rebuildIndex();
        }
    }
    return rebuildIndex();
}

function searchIndex(query) {
    const index = getIndex();
    const results = [];
    const q = query.toLowerCase();

    const categories = ['crops', 'diseases', 'fertilizers', 'insects', 'weeds', 'faq', 'chatgaiya', 'weather', 'soil', 'government'];

    categories.forEach(cat => {
        if (index[cat]) {
            index[cat].forEach(item => {
                if (item.file.toLowerCase().includes(q)) {
                    results.push({ category: cat, ...item });
                }
            });
        }
    });

    return results;
}

function getStats() {
    const index = getIndex();
    return {
        totalDocuments: index.totalDocuments,
        lastRebuilt: index.lastRebuilt,
        categories: {
            crops: index.crops.length,
            diseases: index.diseases.length,
            fertilizers: index.fertilizers.length,
            insects: index.insects.length,
            weeds: index.weeds.length,
            faq: index.faq.length,
            chatgaiya: index.chatgaiya.length,
            weather: index.weather.length,
            soil: index.soil.length,
            government: index.government.length,
        },
    };
}

module.exports = { rebuildIndex, getIndex, scanKnowledgeBase, searchIndex, getStats };
