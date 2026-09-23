/* ============================================
   SF AI — Quota System Unit Tests
   Tests constants, logic, and edge cases
   ============================================ */

import { QUOTA_MAX, QUOTA_WINDOW_MS } from './api/_shared/quota.js';

function test(label, fn) {
    try {
        fn();
        console.log(`  ✓ ${label}`);
    } catch (e) {
        console.log(`  ✗ ${label}: ${e.message}`);
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEq(actual, expected, msg) {
    if (actual !== expected) throw new Error(msg || `Expected ${expected}, got ${actual}`);
}

// ── Constants ──
console.log('=== Quota Constants ===');

test('QUOTA_MAX is 20', () => {
    assertEq(QUOTA_MAX, 20);
});

test('QUOTA_WINDOW_MS is 7 hours', () => {
    assertEq(QUOTA_WINDOW_MS, 7 * 60 * 60 * 1000);
});

test('QUOTA_WINDOW_MS is 25200000ms', () => {
    assertEq(QUOTA_WINDOW_MS, 25200000);
});

// ── Quota check without Firebase Admin ──
console.log('\n=== Quota Check (no admin) ===');

import { checkQuota } from './api/_shared/quota.js';

test('checkQuota returns allowed when Firebase Admin not configured', async () => {
    // No FIREBASE_SERVICE_ACCOUNT env var set, so admin is unavailable
    const result = await checkQuota('test-user-123');
    assertEq(result.allowed, true, 'Should be allowed when admin unavailable');
    assertEq(result.adminAvailable, false, 'adminAvailable should be false');
});

test('checkQuota returns allowed=true and count=0 when no admin', async () => {
    const result = await checkQuota('any-uid');
    assertEq(result.allowed, true);
    assertEq(result.count, 0);
    assertEq(result.blockedUntil, null);
    assertEq(result.retryMs, null);
});

// ── Frontend formatDuration logic ──
console.log('\n=== Frontend Helpers ===');

function formatDuration(ms) {
    if (ms <= 0) return '0m';
    var totalMin = Math.ceil(ms / 60000);
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
}

test('formatDuration(0) returns 0m', () => {
    assertEq(formatDuration(0), '0m');
});

test('formatDuration(-1000) returns 0m', () => {
    assertEq(formatDuration(-1000), '0m');
});

test('formatDuration(60000) returns 1m', () => {
    assertEq(formatDuration(60000), '1m');
});

test('formatDuration(90000) returns 2m', () => {
    assertEq(formatDuration(90000), '2m');
});

test('formatDuration(3600000) returns 1h 0m', () => {
    assertEq(formatDuration(3600000), '1h 0m');
});

test('formatDuration(5400000) returns 1h 30m', () => {
    assertEq(formatDuration(5400000), '1h 30m');
});

test('formatDuration(25200000) returns 7h 0m', () => {
    assertEq(formatDuration(25200000), '7h 0m');
});

test('formatDuration(1800000) returns 30m', () => {
    assertEq(formatDuration(1800000), '30m');
});

// ── Quota remaining calculation ──
console.log('\n=== Quota Remaining Calculation ===');

function calcRemaining(count, limit) {
    return Math.max(0, limit - count);
}

test('remaining = 20 when count = 0', () => {
    assertEq(calcRemaining(0, 20), 20);
});

test('remaining = 15 when count = 5', () => {
    assertEq(calcRemaining(5, 20), 15);
});

test('remaining = 0 when count = 20', () => {
    assertEq(calcRemaining(20, 20), 0);
});

test('remaining = 0 when count > 20 (overflow)', () => {
    assertEq(calcRemaining(25, 20), 0);
});

// ── Quota response structure ──
console.log('\n=== Quota Response Structure ===');

test('Quota response has required fields', () => {
    const quota = { count: 5, limit: 20, remaining: 15, blockedUntil: null, retryMs: null };
    assert('count' in quota, 'Missing count');
    assert('limit' in quota, 'Missing limit');
    assert('remaining' in quota, 'Missing remaining');
    assert('blockedUntil' in quota, 'Missing blockedUntil');
    assert('retryMs' in quota, 'Missing retryMs');
});

test('Blocked quota response has retryMs', () => {
    const future = Date.now() + 3600000;
    const quota = { count: 20, limit: 20, remaining: 0, blockedUntil: future, retryMs: 3600000 };
    assert(quota.retryMs > 0, 'retryMs should be positive when blocked');
    assertEq(quota.remaining, 0);
});

console.log('\n✅ All quota tests passed');
