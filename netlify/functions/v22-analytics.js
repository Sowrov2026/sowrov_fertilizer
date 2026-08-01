// V22 Business Analytics
// Production-ready analytics engine for SF AI Enterprise Platform

const analytics = new Map();

// Track event
function trackEvent(event) {
    const { userId, type, data } = event;
    if (!type) throw new Error('Event type is required');
    const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        userId: userId || 'anonymous',
        type,
        data: data || {},
        timestamp: new Date().toISOString(),
    };
    if (!analytics.has(type)) analytics.set(type, []);
    analytics.get(type).push(entry);
    return entry;
}

// Batch track events
function trackEvents(events) {
    return events.map(event => trackEvent(event));
}

// Get events by type
function getEventsByType(type, limit = 100) {
    const events = analytics.get(type) || [];
    return events.slice(-limit);
}

// Get events by user
function getEventsByUser(userId, limit = 100) {
    const all = [];
    for (const [, events] of analytics) {
        all.push(...events.filter(e => e.userId === userId));
    }
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
}

// Get sales analytics
function getSalesAnalytics(period = 'month') {
    const salesEvents = analytics.get('sale') || analytics.get('order') || [];
    const now = new Date();
    let startDate;

    switch (period) {
        case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filtered = salesEvents.filter(e => new Date(e.timestamp) >= startDate);
    const totalSales = filtered.reduce((sum, e) => sum + (e.data.amount || 0), 0);
    const totalOrders = filtered.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    const productCount = {};
    filtered.forEach(e => {
        if (e.data.product) {
            productCount[e.data.product] = (productCount[e.data.product] || 0) + 1;
        }
    });
    const topProducts = Object.entries(productCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

    const salesByDay = {};
    filtered.forEach(e => {
        const day = e.timestamp.slice(0, 10);
        salesByDay[day] = (salesByDay[day] || 0) + (e.data.amount || 0);
    });

    const salesByCategory = {};
    filtered.forEach(e => {
        const cat = e.data.category || 'uncategorized';
        salesByCategory[cat] = (salesByCategory[cat] || 0) + (e.data.amount || 0);
    });

    return {
        totalSales,
        totalOrders,
        averageOrderValue,
        conversionRate: totalOrders > 0 ? Math.min(100, Math.round((totalOrders / Math.max(1, analytics.get('visit')?.length || 1)) * 100)) : 0,
        topProducts,
        salesByDay: Object.entries(salesByDay).map(([date, amount]) => ({ date, amount })),
        salesByCategory: Object.entries(salesByCategory).map(([category, amount]) => ({ category, amount })),
        period,
        generatedAt: new Date().toISOString(),
    };
}

// Get user analytics
function getUserAnalytics() {
    const userEvents = analytics.get('user') || analytics.get('register') || [];
    const loginEvents = analytics.get('login') || [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const usersByRole = {};
    userEvents.forEach(e => {
        const role = e.data.role || 'customer';
        usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    const districtCount = {};
    userEvents.forEach(e => {
        if (e.data.district) {
            districtCount[e.data.district] = (districtCount[e.data.district] || 0) + 1;
        }
    });

    const activeUserIds = new Set(
        loginEvents
            .filter(e => new Date(e.timestamp) >= thirtyDaysAgo)
            .map(e => e.userId)
    );

    const todayUserIds = new Set(
        loginEvents
            .filter(e => new Date(e.timestamp) >= todayStart)
            .map(e => e.userId)
    );

    const totalUsers = new Set(userEvents.map(e => e.userId)).size;
    const newUsers = userEvents.filter(e => new Date(e.timestamp) >= thirtyDaysAgo).length;
    const returningUsers = loginEvents.filter(e => new Date(e.timestamp) >= thirtyDaysAgo).length - newUsers;

    return {
        totalUsers,
        activeUsers: activeUserIds.size,
        newUsers,
        returningUsers: Math.max(0, returningUsers),
        usersByRole,
        usersByDistrict: Object.entries(districtCount)
            .sort(([, a], [, b]) => b - a)
            .map(([district, count]) => ({ district, count })),
        generatedAt: new Date().toISOString(),
    };
}

// Get product analytics
function getProductAnalytics() {
    const productEvents = analytics.get('product') || [];
    const orderEvents = analytics.get('order') || analytics.get('sale') || [];

    const salesCount = {};
    orderEvents.forEach(e => {
        const name = e.data.product || e.data.productName;
        if (name) salesCount[name] = (salesCount[name] || 0) + (e.data.quantity || 1);
    });

    const topSelling = Object.entries(salesCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([name, sold]) => ({ name, sold }));

    const lowStock = productEvents
        .filter(e => e.data.stock !== undefined && e.data.stock > 0 && e.data.stock <= (e.data.minStock || 10))
        .map(e => ({ name: e.data.name, stock: e.data.stock, minStock: e.data.minStock }));

    const outOfStock = productEvents
        .filter(e => e.data.stock === 0)
        .map(e => ({ name: e.data.name }));

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newProducts = productEvents
        .filter(e => new Date(e.timestamp) >= sevenDaysAgo)
        .map(e => ({ name: e.data.name, addedAt: e.timestamp }));

    return {
        totalProducts: new Set(productEvents.map(e => e.data.name)).size,
        topSelling,
        lowStock,
        outOfStock,
        newProducts,
        generatedAt: new Date().toISOString(),
    };
}

// Get revenue analytics
function getRevenueAnalytics(startDate, endDate) {
    const revenueEvents = analytics.get('revenue') || analytics.get('sale') || [];
    const expenseEvents = analytics.get('expense') || [];

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const filteredRevenue = revenueEvents.filter(e => {
        const d = new Date(e.timestamp);
        return d >= start && d <= end;
    });
    const filteredExpenses = expenseEvents.filter(e => {
        const d = new Date(e.timestamp);
        return d >= start && d <= end;
    });

    const totalRevenue = filteredRevenue.reduce((sum, e) => sum + (e.data.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.data.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100 * 100) / 100 : 0;

    const revenueByMonth = {};
    filteredRevenue.forEach(e => {
        const month = e.timestamp.slice(0, 7);
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (e.data.amount || 0);
    });

    const expensesByCategory = {};
    filteredExpenses.forEach(e => {
        const cat = e.data.category || 'uncategorized';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.data.amount || 0);
    });

    return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        revenueByMonth: Object.entries(revenueByMonth).map(([month, amount]) => ({ month, amount })),
        expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({ category, amount })),
        period: { start: start.toISOString(), end: end.toISOString() },
        generatedAt: new Date().toISOString(),
    };
}

// Get crop analytics
function getCropAnalytics() {
    const cropEvents = analytics.get('crop') || [];
    const orderEvents = analytics.get('order') || analytics.get('sale') || [];

    const cropOrderCount = {};
    orderEvents.forEach(e => {
        const crop = e.data.crop || e.data.category;
        if (crop) cropOrderCount[crop] = (cropOrderCount[crop] || 0) + (e.data.quantity || 1);
    });

    const popularCrops = Object.entries(cropOrderCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([name, orders]) => ({ name, orders }));

    const districtCropCount = {};
    cropEvents.forEach(e => {
        if (e.data.district && e.data.crop) {
            const key = `${e.data.district}:${e.data.crop}`;
            districtCropCount[key] = (districtCropCount[key] || 0) + 1;
        }
    });

    const cropByDistrict = Object.entries(districtCropCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50)
        .map(([key, count]) => {
            const [district, crop] = key.split(':');
            return { district, crop, count };
        });

    const monthlyCrops = {};
    cropEvents.forEach(e => {
        const month = e.timestamp.slice(0, 7);
        if (!monthlyCrops[month]) monthlyCrops[month] = {};
        const crop = e.data.crop || 'unknown';
        monthlyCrops[month][crop] = (monthlyCrops[month][crop] || 0) + 1;
    });

    const seasonalTrends = Object.entries(monthlyCrops)
        .map(([month, crops]) => ({
            month,
            topCrop: Object.entries(crops).sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown',
            totalActivity: Object.values(crops).reduce((a, b) => a + b, 0),
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        popularCrops,
        cropByDistrict,
        seasonalTrends,
        generatedAt: new Date().toISOString(),
    };
}

// Get dashboard summary
function getDashboardSummary() {
    const orderEvents = analytics.get('order') || analytics.get('sale') || [];
    const userEvents = analytics.get('user') || analytics.get('register') || [];
    const productEvents = analytics.get('product') || [];

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayOrders = orderEvents.filter(e => new Date(e.timestamp) >= todayStart);

    return {
        totalOrders: orderEvents.length,
        totalRevenue: orderEvents.reduce((sum, e) => sum + (e.data.amount || 0), 0),
        totalUsers: new Set(userEvents.map(e => e.userId)).size,
        totalProducts: new Set(productEvents.map(e => e.data.name)).size,
        pendingOrders: orderEvents.filter(e => e.data.status === 'pending').length,
        lowStockItems: productEvents.filter(e => e.data.stock > 0 && e.data.stock <= (e.data.minStock || 10)).length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, e) => sum + (e.data.amount || 0), 0),
        generatedAt: new Date().toISOString(),
    };
}

// Export analytics
function exportAnalytics(type, format = 'json') {
    const data = analytics.get(type) || [];
    if (format === 'csv') {
        if (data.length === 0) return '';
        const headers = ['id', 'userId', 'type', 'timestamp', ...new Set(data.flatMap(d => Object.keys(d.data)))];
        const rows = data.map(d =>
            [d.id, d.userId, d.type, d.timestamp, ...headers.slice(4).map(h => d.data[h] || '')].join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(data, null, 2);
}

// Get analytics summary for all types
function getAllAnalyticsSummary() {
    const summary = {};
    for (const [type, events] of analytics) {
        summary[type] = {
            count: events.length,
            latest: events[events.length - 1]?.timestamp || null,
            earliest: events[0]?.timestamp || null,
        };
    }
    return summary;
}

// Clear analytics data (for testing or reset)
function clearAnalytics(type) {
    if (type) {
        analytics.delete(type);
    } else {
        analytics.clear();
    }
}

// Netlify function handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    try {
        if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
        }

        const params = new URLSearchParams(event.queryStringParameters || {});
        const action = params.get('action') || 'dashboard';
        const type = params.get('type');
        const period = params.get('period') || 'month';
        const format = params.get('format') || 'json';

        let result;

        switch (action) {
            case 'track':
                if (event.httpMethod !== 'POST') {
                    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST required' }) };
                }
                const body = JSON.parse(event.body || '{}');
                result = trackEvent(body);
                break;
            case 'dashboard':
                result = getDashboardSummary();
                break;
            case 'sales':
                result = getSalesAnalytics(period);
                break;
            case 'users':
                result = getUserAnalytics();
                break;
            case 'products':
                result = getProductAnalytics();
                break;
            case 'revenue':
                result = getRevenueAnalytics(params.get('startDate'), params.get('endDate'));
                break;
            case 'crops':
                result = getCropAnalytics();
                break;
            case 'export':
                result = exportAnalytics(type || 'order', format);
                return {
                    statusCode: 200,
                    headers: {
                        ...headers,
                        'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
                        'Content-Disposition': `attachment; filename="analytics-${type}.${format}"`,
                    },
                    body: typeof result === 'string' ? result : JSON.stringify(result),
                };
            case 'summary':
                result = getAllAnalyticsSummary();
                break;
            default:
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify(result) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
