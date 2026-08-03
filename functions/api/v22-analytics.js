const analytics = new Map();

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

function trackEvents(events) { return events.map(event => trackEvent(event)); }
function getEventsByType(type, limit = 100) { return (analytics.get(type) || []).slice(-limit); }
function getEventsByUser(userId, limit = 100) {
    const all = [];
    for (const [, events] of analytics) { all.push(...events.filter(e => e.userId === userId)); }
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
}

function getSalesAnalytics(period = 'month') {
    const salesEvents = analytics.get('sale') || analytics.get('order') || [];
    const now = new Date();
    let startDate;
    switch (period) {
        case 'day': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
        case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        default: startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const filtered = salesEvents.filter(e => new Date(e.timestamp) >= startDate);
    const totalSales = filtered.reduce((sum, e) => sum + (e.data.amount || 0), 0);
    const totalOrders = filtered.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    const productCount = {};
    filtered.forEach(e => { if (e.data.product) productCount[e.data.product] = (productCount[e.data.product] || 0) + 1; });
    const topProducts = Object.entries(productCount).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));
    const salesByDay = {};
    filtered.forEach(e => { const day = e.timestamp.slice(0, 10); salesByDay[day] = (salesByDay[day] || 0) + (e.data.amount || 0); });
    const salesByCategory = {};
    filtered.forEach(e => { const cat = e.data.category || 'uncategorized'; salesByCategory[cat] = (salesByCategory[cat] || 0) + (e.data.amount || 0); });
    return {
        totalSales, totalOrders, averageOrderValue,
        conversionRate: totalOrders > 0 ? Math.min(100, Math.round((totalOrders / Math.max(1, analytics.get('visit')?.length || 1)) * 100)) : 0,
        topProducts,
        salesByDay: Object.entries(salesByDay).map(([date, amount]) => ({ date, amount })),
        salesByCategory: Object.entries(salesByCategory).map(([category, amount]) => ({ category, amount })),
        period, generatedAt: new Date().toISOString(),
    };
}

function getUserAnalytics() {
    const userEvents = analytics.get('user') || analytics.get('register') || [];
    const loginEvents = analytics.get('login') || [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const usersByRole = {};
    userEvents.forEach(e => { const role = e.data.role || 'customer'; usersByRole[role] = (usersByRole[role] || 0) + 1; });
    const districtCount = {};
    userEvents.forEach(e => { if (e.data.district) districtCount[e.data.district] = (districtCount[e.data.district] || 0) + 1; });
    const activeUserIds = new Set(loginEvents.filter(e => new Date(e.timestamp) >= thirtyDaysAgo).map(e => e.userId));
    const totalUsers = new Set(userEvents.map(e => e.userId)).size;
    const newUsers = userEvents.filter(e => new Date(e.timestamp) >= thirtyDaysAgo).length;
    const returningUsers = loginEvents.filter(e => new Date(e.timestamp) >= thirtyDaysAgo).length - newUsers;
    return {
        totalUsers, activeUsers: activeUserIds.size, newUsers, returningUsers: Math.max(0, returningUsers),
        usersByRole,
        usersByDistrict: Object.entries(districtCount).sort(([, a], [, b]) => b - a).map(([district, count]) => ({ district, count })),
        generatedAt: new Date().toISOString(),
    };
}

function getProductAnalytics() {
    const productEvents = analytics.get('product') || [];
    const orderEvents = analytics.get('order') || analytics.get('sale') || [];
    const salesCount = {};
    orderEvents.forEach(e => { const name = e.data.product || e.data.productName; if (name) salesCount[name] = (salesCount[name] || 0) + (e.data.quantity || 1); });
    const topSelling = Object.entries(salesCount).sort(([, a], [, b]) => b - a).slice(0, 20).map(([name, sold]) => ({ name, sold }));
    const lowStock = productEvents.filter(e => e.data.stock !== undefined && e.data.stock > 0 && e.data.stock <= (e.data.minStock || 10)).map(e => ({ name: e.data.name, stock: e.data.stock, minStock: e.data.minStock }));
    const outOfStock = productEvents.filter(e => e.data.stock === 0).map(e => ({ name: e.data.name }));
    return { totalProducts: new Set(productEvents.map(e => e.data.name)).size, topSelling, lowStock, outOfStock, generatedAt: new Date().toISOString() };
}

function getRevenueAnalytics(startDate, endDate) {
    const revenueEvents = analytics.get('revenue') || analytics.get('sale') || [];
    const expenseEvents = analytics.get('expense') || [];
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    const filteredRevenue = revenueEvents.filter(e => { const d = new Date(e.timestamp); return d >= start && d <= end; });
    const filteredExpenses = expenseEvents.filter(e => { const d = new Date(e.timestamp); return d >= start && d <= end; });
    const totalRevenue = filteredRevenue.reduce((sum, e) => sum + (e.data.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.data.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    return {
        totalRevenue, totalExpenses, netProfit,
        profitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100 * 100) / 100 : 0,
        period: { start: start.toISOString(), end: end.toISOString() },
        generatedAt: new Date().toISOString(),
    };
}

function getCropAnalytics() {
    const cropEvents = analytics.get('crop') || [];
    const orderEvents = analytics.get('order') || analytics.get('sale') || [];
    const cropOrderCount = {};
    orderEvents.forEach(e => { const crop = e.data.crop || e.data.category; if (crop) cropOrderCount[crop] = (cropOrderCount[crop] || 0) + (e.data.quantity || 1); });
    const popularCrops = Object.entries(cropOrderCount).sort(([, a], [, b]) => b - a).slice(0, 20).map(([name, orders]) => ({ name, orders }));
    return { popularCrops, generatedAt: new Date().toISOString() };
}

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
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, e) => sum + (e.data.amount || 0), 0),
        generatedAt: new Date().toISOString(),
    };
}

function exportAnalytics(type, format = 'json') {
    const data = analytics.get(type) || [];
    if (format === 'csv') {
        if (data.length === 0) return '';
        const headers = ['id', 'userId', 'type', 'timestamp', ...new Set(data.flatMap(d => Object.keys(d.data)))];
        const rows = data.map(d => [d.id, d.userId, d.type, d.timestamp, ...headers.slice(4).map(h => d.data[h] || '')].join(','));
        return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(data, null, 2);
}

function getAllAnalyticsSummary() {
    const summary = {};
    for (const [type, events] of analytics) {
        summary[type] = { count: events.length, latest: events[events.length - 1]?.timestamp || null, earliest: events[0]?.timestamp || null };
    }
    return summary;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

export async function onRequest(context) {
    const { request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action') || 'dashboard';
        const type = url.searchParams.get('type');
        const period = url.searchParams.get('period') || 'month';
        const format = url.searchParams.get('format') || 'json';

        let result;

        switch (action) {
            case 'track':
                if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: corsHeaders });
                const body = await request.json();
                result = trackEvent(body);
                break;
            case 'dashboard': result = getDashboardSummary(); break;
            case 'sales': result = getSalesAnalytics(period); break;
            case 'users': result = getUserAnalytics(); break;
            case 'products': result = getProductAnalytics(); break;
            case 'revenue': result = getRevenueAnalytics(url.searchParams.get('startDate'), url.searchParams.get('endDate')); break;
            case 'crops': result = getCropAnalytics(); break;
            case 'export':
                result = exportAnalytics(type || 'order', format);
                return new Response(typeof result === 'string' ? result : JSON.stringify(result), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': format === 'csv' ? 'text/csv' : 'application/json', 'Content-Disposition': `attachment; filename="analytics-${type}.${format}"` },
                });
            case 'summary': result = getAllAnalyticsSummary(); break;
            default: return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
        }

        return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
}
