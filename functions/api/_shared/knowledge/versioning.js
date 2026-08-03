const STORAGE_KEY = 'sf_knowledge_versions';

function generateHash(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'v' + Math.abs(hash).toString(36) + '-' + Date.now().toString(36);
}

function getStorage() {
    if (typeof globalThis !== 'undefined' && globalThis[STORAGE_KEY]) {
        return globalThis[STORAGE_KEY];
    }
    if (typeof globalThis !== 'undefined') {
        globalThis[STORAGE_KEY] = new Map();
    }
    return globalThis[STORAGE_KEY];
}

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    const cloned = {};
    for (const key of Object.keys(obj)) {
        cloned[key] = deepClone(obj[key]);
    }
    return cloned;
}

function diffObjects(oldObj, newObj, prefix = '') {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    for (const key of allKeys) {
        const field = prefix ? `${prefix}.${key}` : key;
        const oldVal = oldObj ? oldObj[key] : undefined;
        const newVal = newObj ? newObj[key] : undefined;

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes.push({
                field,
                oldValue: oldVal !== undefined ? deepClone(oldVal) : null,
                newValue: newVal !== undefined ? deepClone(newVal) : null,
            });
        }
    }
    return changes;
}

const KnowledgeVersioning = {
    init() {
        const storage = getStorage();
        this.storage = storage;
        return this;
    },

    createVersion(entry, data, editor = 'system') {
        const entryId = entry.id || entry.entryId;
        if (!entryId) {
            throw new Error('Entry must have an id');
        }

        const versions = this.loadVersions(entryId);
        const lastVersion = versions.length > 0 ? versions[versions.length - 1] : null;
        const versionNumber = lastVersion ? lastVersion.version + 1 : 1;

        const changes = lastVersion
            ? diffObjects(lastVersion.data, data)
            : Object.keys(data).map(key => ({
                field: key,
                oldValue: null,
                newValue: deepClone(data[key]),
            }));

        const versionData = {
            id: `${entryId}-v${versionNumber}`,
            version: versionNumber,
            timestamp: new Date().toISOString(),
            editor,
            changes,
            data: deepClone(data),
            hash: generateHash(data),
        };

        versions.push(versionData);
        this.saveVersion(entryId, versions);

        return {
            version: versionNumber,
            timestamp: versionData.timestamp,
            editor,
            changes,
        };
    },

    getVersionHistory(entryId) {
        const versions = this.loadVersions(entryId);
        return versions.map(v => ({
            version: v.version,
            timestamp: v.timestamp,
            editor: v.editor,
            changeCount: v.changes.length,
            hash: v.hash,
        }));
    },

    getVersion(entryId, version) {
        const versions = this.loadVersions(entryId);
        const found = versions.find(v => v.version === version);
        if (!found) {
            return null;
        }
        return deepClone(found);
    },

    compareVersions(entryId, v1, v2) {
        const version1 = this.getVersion(entryId, v1);
        const version2 = this.getVersion(entryId, v2);

        if (!version1 || !version2) {
            return null;
        }

        const changes = diffObjects(version1.data, version2.data);
        const summary = {
            identical: changes.length === 0,
            changedFields: changes.map(c => c.field),
            addedFields: changes.filter(c => c.oldValue === null).map(c => c.field),
            removedFields: changes.filter(c => c.newValue === null).map(c => c.field),
            modifiedFields: changes.filter(c => c.oldValue !== null && c.newValue !== null).map(c => c.field),
        };

        return {
            version1: { version: v1, timestamp: version1.timestamp, editor: version1.editor },
            version2: { version: v2, timestamp: version2.timestamp, editor: version2.editor },
            changes,
            summary,
        };
    },

    rollback(entryId, targetVersion) {
        const versions = this.loadVersions(entryId);
        const target = versions.find(v => v.version === targetVersion);

        if (!target) {
            return { success: false, error: `Version ${targetVersion} not found` };
        }

        const lastVersion = versions.length > 0 ? versions[versions.length - 1] : null;
        const newVersionNumber = lastVersion ? lastVersion.version + 1 : 1;

        const rollbackEntry = {
            id: `${entryId}-v${newVersionNumber}`,
            version: newVersionNumber,
            timestamp: new Date().toISOString(),
            editor: 'system-rollback',
            changes: [
                {
                    field: '__rollback__',
                    oldValue: lastVersion ? deepClone(lastVersion.data) : null,
                    newValue: deepClone(target.data),
                },
            ],
            data: deepClone(target.data),
            hash: generateHash(target.data),
            rollbackTo: targetVersion,
        };

        versions.push(rollbackEntry);
        this.saveVersion(entryId, versions);

        return {
            success: true,
            restoredVersion: targetVersion,
            newVersion: newVersionNumber,
            timestamp: rollbackEntry.timestamp,
        };
    },

    autoVersion(entryId, changes) {
        const versions = this.loadVersions(entryId);
        const lastVersion = versions.length > 0 ? versions[versions.length - 1] : null;

        if (lastVersion && JSON.stringify(lastVersion.changes) === JSON.stringify(changes)) {
            return null;
        }

        const versionNumber = lastVersion ? lastVersion.version + 1 : 1;
        const versionData = {
            id: `${entryId}-v${versionNumber}`,
            version: versionNumber,
            timestamp: new Date().toISOString(),
            editor: 'auto',
            changes: Array.isArray(changes) ? changes : [changes],
            data: null,
            hash: generateHash(changes),
        };

        versions.push(versionData);
        this.saveVersion(entryId, versions);

        return versionNumber;
    },

    getCurrentVersion(entryId) {
        const versions = this.loadVersions(entryId);
        if (versions.length === 0) {
            return null;
        }
        const current = versions[versions.length - 1];
        return {
            version: current.version,
            timestamp: current.timestamp,
            editor: current.editor,
            data: deepClone(current.data),
            hash: current.hash,
        };
    },

    validateVersion(entryId) {
        const versions = this.loadVersions(entryId);
        const issues = [];

        for (let i = 0; i < versions.length; i++) {
            const v = versions[i];

            if (v.version !== i + 1) {
                issues.push({
                    type: 'version_gap',
                    version: v.version,
                    expected: i + 1,
                    message: `Version number gap: expected ${i + 1}, got ${v.version}`,
                });
            }

            const recalculatedHash = generateHash(v.data);
            if (recalculatedHash !== v.hash) {
                issues.push({
                    type: 'hash_mismatch',
                    version: v.version,
                    expected: recalculatedHash,
                    actual: v.hash,
                    message: `Hash mismatch at version ${v.version}`,
                });
            }

            if (!v.timestamp || isNaN(new Date(v.timestamp).getTime())) {
                issues.push({
                    type: 'invalid_timestamp',
                    version: v.version,
                    message: `Invalid timestamp at version ${v.version}`,
                });
            }

            if (i > 0) {
                const prevTimestamp = new Date(versions[i - 1].timestamp).getTime();
                const currTimestamp = new Date(v.timestamp).getTime();
                if (currTimestamp < prevTimestamp) {
                    issues.push({
                        type: 'timestamp_regression',
                        version: v.version,
                        message: `Timestamp at version ${v.version} is before version ${versions[i - 1].version}`,
                    });
                }
            }
        }

        return {
            valid: issues.length === 0,
            totalVersions: versions.length,
            issues,
        };
    },

    saveVersion(entryId, versionData) {
        const storage = getStorage();
        storage.set(entryId, versionData);
    },

    loadVersions(entryId) {
        const storage = getStorage();
        return storage.get(entryId) || [];
    },
};

export default { KnowledgeVersioning };
