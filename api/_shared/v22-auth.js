// V22 Enterprise Authentication
// JWT + Refresh Token + Multi-Tenant Support
// Cloudflare Pages ES Module (uses Web Crypto API)

const JWT_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

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

function hasPermission(userRole, permission) {
    const role = ROLES[userRole];
    if (!role) return false;
    if (role.permissions.includes('*')) return true;
    return role.permissions.includes(permission) || role.permissions.includes(permission.split(':')[0] + ':*');
}

function generateToken(user, secret) {
    if (!secret) throw new Error('JWT_SECRET not configured');
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || 'default',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
    };
    const enc = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const data = `${headerB64}.${payloadB64}`;
    return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
        .then(key => crypto.subtle.sign('HMAC', key, enc.encode(data)))
        .then(sig => {
            const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
            return `${data}.${sigB64}`;
        });
}

async function verifyToken(token, secret) {
    if (!secret) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const enc = new TextEncoder();
        const data = `${parts[0]}.${parts[1]}`;
        const sig = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
        const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(data));
        if (!valid) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

function generateRefreshToken() {
    const arr = new Uint8Array(64);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

const users = new Map();

function createUser(userData) {
    const idArr = new Uint8Array(16);
    crypto.getRandomValues(idArr);
    const user = {
        id: Array.from(idArr, b => b.toString(16).padStart(2, '0')).join(''),
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

function getUser(userId) { return users.get(userId) || null; }
function updateUser(userId, data) {
    const user = users.get(userId);
    if (!user) return null;
    Object.assign(user, data);
    users.set(userId, user);
    return user;
}
function deleteUser(userId) { return users.delete(userId); }
function listUsers(filter = {}) {
    let list = Array.from(users.values());
    if (filter.role) list = list.filter(u => u.role === filter.role);
    if (filter.tenantId) list = list.filter(u => u.tenantId === filter.tenantId);
    if (filter.status) list = list.filter(u => u.status === filter.status);
    return list;
}

function authMiddleware(requiredRole, secret) {
    return async (request) => {
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'Authentication required', status: 401 };
        }
        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token, secret);
        if (!decoded) {
            return { error: 'Invalid or expired token', status: 401 };
        }
        if (requiredRole && !hasPermission(decoded.role, requiredRole)) {
            return { error: 'Insufficient permissions', status: 403 };
        }
        return { user: decoded };
    };
}

export {
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
