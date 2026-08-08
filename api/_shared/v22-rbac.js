// V22 Role-Based Access Control
// Cloudflare Pages ES Module

import { ROLES, hasPermission } from './v22-auth.js';

const PERMISSIONS = {
    'users:create': 'ব্যবহারকারী তৈরি',
    'users:read': 'ব্যবহারকারী দেখা',
    'users:update': 'ব্যবহারকারী আপডেট',
    'users:delete': 'ব্যবহারকারী মুছে ফেলা',
    'users:list': 'ব্যবহারকারী তালিকা',
    'products:create': 'পণ্য তৈরি',
    'products:read': 'পণ্য দেখা',
    'products:update': 'পণ্য আপডেট',
    'products:delete': 'পণ্য মুছে ফেলা',
    'orders:create': 'অর্ডার তৈরি',
    'orders:read': 'অর্ডার দেখা',
    'orders:update': 'অর্ডার আপডেট',
    'orders:delete': 'অর্ডার মুছে ফেলা',
    'inventory:create': 'ইনভেন্টরি তৈরি',
    'inventory:read': 'ইনভেন্টরি দেখা',
    'inventory:update': 'ইনভেন্টরি আপডেট',
    'inventory:delete': 'ইনভেন্টরি মুছে ফেলা',
    'reports:view': 'রিপোর্ট দেখা',
    'reports:export': 'রিপোর্ট এক্সপোর্ট',
    'reports:create': 'রিপোর্ট তৈরি',
    'settings:read': 'সেটিংস দেখা',
    'settings:update': 'সেটিংস আপডেট',
    'chat:own': 'নিজের চ্যাট',
    'chat:all': 'সব চ্যাট',
    'chat:moderate': 'চ্যাট মডারেশন',
    'farm:own': 'নিজের খামার',
    'farm:all': 'সব খামার',
    'payments:own': 'নিজের পেমেন্ট',
    'payments:all': 'সব পেমেন্ট',
    'api:manage': 'API পরিচালনা',
    'api:read': 'API দেখা',
};

function requireAll(userRole, permissions) { return permissions.every(p => hasPermission(userRole, p)); }
function requireAny(userRole, permissions) { return permissions.some(p => hasPermission(userRole, p)); }
function isHigherRole(role1, role2) { return (ROLES[role1]?.level || 0) > (ROLES[role2]?.level || 0); }
function getRoleInfo(role) { return ROLES[role] || null; }
function listRoles() { return Object.entries(ROLES).map(([key, value]) => ({ id: key, ...value })); }
function isValidRole(role) { return role in ROLES; }

export { PERMISSIONS, requireAll, requireAny, isHigherRole, getRoleInfo, listRoles, isValidRole, hasPermission };
