// V22 Enterprise Authentication
// JWT + Refresh Token + Multi-Tenant Support

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set');
}
const JWT_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

// User Roles & Permissions
const ROLES = {
    super_admin: {
        level: 100,
        permissions: ['*'],
        description: 'সুপার অ্যাডমিন — সম্পূর্ণ নিয়ন্ত্রণ',
    },
    admin: {
        level: 80,
        permissions: ['users:*', 'products:*', 'orders:*', 'inventory:*', 'reports:*', 'settings:*'],
        description: 'অ্যাডমিন — সিস্টেম পরিচালনা',
    },
    officer: {
        level: 60,
        permissions: ['users:view', 'products:*', 'orders:view', 'inventory:*', 'reports:view'],
        description: 'কৃষি কর্মকর্তা — কৃষি সেবা',
    },
    dealer: {
        level: 40,
        permissions: ['products:view', 'orders:own', 'inventory:own', 'customers:own'],
        description: 'ডিলার — পণ্য বিক্রয়',
    },
    retailer: {
        level: 30,
        permissions: ['products:view', 'orders:own', 'inventory:own'],
        description: 'রিটেইলার — খুচরা বিক্রয়',
    },
    wholesaler: {
        level: 35,
        permissions: ['products:view', 'orders:own', 'inventory:own', 'bulk:own'],
        description: 'পাইকারি — পাইকারি বিক্রয়',
    },
    farmer: {
        level: 10,
        permissions: ['chat:own', 'products:view', 'orders:own', 'farm:own'],
        description: 'কৃষক — কৃষক সেবা',
    },
};

// Permission Check
function hasPermission(userRole, permission) {
    const role = ROLES[userRole];
    if (!role) return false;
    if (role.permissions.includes('*')) return true;
    return role.permissions.includes(permission) || role.permissions.includes(permission.split(':')[0] + ':*');
}

// Generate JWT
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || 'default',
        iat: Math.floor(Date.now() / 1000),
    };
    // Simple JWT implementation
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 900 })).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
}

// Verify JWT
function verifyToken(token) {
    try {
        const [header, body, signature] = token.split('.');
        const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
        // Constant-time comparison to prevent timing attacks
        if (!crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expectedSig))) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

// Generate Refresh Token
function generateRefreshToken(user) {
    return crypto.randomBytes(64).toString('hex');
}

// Auth Middleware
function authMiddleware(requiredRole) {
    return (event) => {
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Authentication required' }) };
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid or expired token' }) };
        }
        if (requiredRole && !hasPermission(decoded.role, requiredRole)) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Insufficient permissions' }) };
        }
        return { user: decoded };
    };
}

// User Management
const users = new Map(); // In production: Firebase Firestore

function createUser(userData) {
    const user = {
        id: crypto.randomBytes(16).toString('hex'),
        email: userData.email,
        name: userData.name,
        role: userData.role || 'farmer',
        tenantId: userData.tenantId || 'default',
        phone: userData.phone || '',
        avatar: userData.avatar || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        loginCount: 0,
    };
    users.set(user.id, user);
    return user;
}

function getUser(userId) {
    return users.get(userId) || null;
}

function updateUser(userId, data) {
    const user = users.get(userId);
    if (!user) return null;
    Object.assign(user, data);
    users.set(userId, user);
    return user;
}

function deleteUser(userId) {
    return users.delete(userId);
}

function listUsers(filter = {}) {
    let list = Array.from(users.values());
    if (filter.role) list = list.filter(u => u.role === filter.role);
    if (filter.tenantId) list = list.filter(u => u.tenantId === filter.tenantId);
    if (filter.status) list = list.filter(u => u.status === filter.status);
    return list;
}

module.exports = {
    ROLES,
    hasPermission,
    generateToken,
    verifyToken,
    generateRefreshToken,
    authMiddleware,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    listUsers,
};
