// V22 Role-Based Access Control
const { ROLES, hasPermission } = require('./v22-auth');

// Permission definitions
const PERMISSIONS = {
    // User management
    'users:create': 'ব্যবহারকারী তৈরি',
    'users:read': 'ব্যবহারকারী দেখা',
    'users:update': 'ব্যবহারকারী আপডেট',
    'users:delete': 'ব্যবহারকারী মুছে ফেলা',
    'users:list': 'ব্যবহারকারী তালিকা',

    // Product management
    'products:create': 'পণ্য তৈরি',
    'products:read': 'পণ্য দেখা',
    'products:update': 'পণ্য আপডেট',
    'products:delete': 'পণ্য মুছে ফেলা',

    // Order management
    'orders:create': 'অর্ডার তৈরি',
    'orders:read': 'অর্ডার দেখা',
    'orders:update': 'অর্ডার আপডেট',
    'orders:delete': 'অর্ডার মুছে ফেলা',

    // Inventory
    'inventory:create': 'ইনভেন্টরি তৈরি',
    'inventory:read': 'ইনভেন্টরি দেখা',
    'inventory:update': 'ইনভেন্টরি আপডেট',
    'inventory:delete': 'ইনভেন্টরি মুছে ফেলা',

    // Reports
    'reports:view': 'রিপোর্ট দেখা',
    'reports:export': 'রিপোর্ট এক্সপোর্ট',
    'reports:create': 'রিপোর্ট তৈরি',

    // Settings
    'settings:read': 'সেটিংস দেখা',
    'settings:update': 'সেটিংস আপডেট',

    // Chat
    'chat:own': 'নিজের চ্যাট',
    'chat:all': 'সব চ্যাট',
    'chat:moderate': 'চ্যাট মডারেশন',

    // Farm
    'farm:own': 'নিজের খামার',
    'farm:all': 'সব খামার',

    // Payments
    'payments:own': 'নিজের পেমেন্ট',
    'payments:all': 'সব পেমেন্ট',

    // API
    'api:manage': 'API পরিচালনা',
    'api:read': 'API দেখা',
};

// Check multiple permissions
function requireAll(userRole, permissions) {
    return permissions.every(p => hasPermission(userRole, p));
}

// Check any permission
function requireAny(userRole, permissions) {
    return permissions.some(p => hasPermission(userRole, p));
}

// Role hierarchy check
function isHigherRole(role1, role2) {
    return (ROLES[role1]?.level || 0) > (ROLES[role2]?.level || 0);
}

// Get role info
function getRoleInfo(role) {
    return ROLES[role] || null;
}

// List all roles
function listRoles() {
    return Object.entries(ROLES).map(([key, value]) => ({
        id: key,
        ...value,
    }));
}

// Validate role
function isValidRole(role) {
    return role in ROLES;
}

module.exports = {
    PERMISSIONS,
    requireAll,
    requireAny,
    isHigherRole,
    getRoleInfo,
    listRoles,
    isValidRole,
    hasPermission,
};
