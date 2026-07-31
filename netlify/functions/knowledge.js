/**
 * Knowledge Base — V11 Enterprise Architecture
 * This file re-exports from the new modular knowledge structure
 * For backward compatibility
 */

const { ALL_DOCUMENTS, searchKnowledge, buildKnowledgeContext } = require('./knowledge/index');

// Legacy aliases
const searchKnowledgeBase = searchKnowledge;
const buildRAGContext = buildKnowledgeContext;

module.exports = {
    KNOWLEDGE_BASE: ALL_DOCUMENTS,
    searchKnowledgeBase,
    buildRAGContext,
    searchKnowledge,
    buildKnowledgeContext,
};
