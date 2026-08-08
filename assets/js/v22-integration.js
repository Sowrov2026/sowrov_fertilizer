(function() {
  'use strict';

  var API_BASE = '/api';

  var SFEnterprise = {

    _token: null,
    _refreshToken: null,
    _user: null,
    _cache: {},
    _cacheExpiry: {},

    init: function() {
      this._token = localStorage.getItem('sf_token');
      this._refreshToken = localStorage.getItem('sf_refresh_token');
      var userData = localStorage.getItem('sf_user');
      if (userData) {
        try { this._user = JSON.parse(userData); } catch (e) { this._user = null; }
      }
      this._setupAutoRefresh();
      this._setupOfflineListener();
    },

    _setupAutoRefresh: function() {
      var self = this;
      setInterval(function() {
        if (self._token && self._user) {
          self.refreshToken().catch(function() {});
        }
      }, 14 * 60 * 1000);
    },

    _setupOfflineListener: function() {
      var self = this;
      window.addEventListener('online', function() {
        document.dispatchEvent(new CustomEvent('sf:online'));
      });
      window.addEventListener('offline', function() {
        document.dispatchEvent(new CustomEvent('sf:offline'));
      });
    },

    // ==================== AUTHENTICATION ====================

    login: async function(email, password) {
      var result = await this.apiCall('/v22-auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email: email, password: password })
      });
      if (result.accessToken) {
        this._token = result.accessToken;
        this._refreshToken = result.refreshToken;
        this._user = result.user;
        localStorage.setItem('sf_token', result.accessToken);
        localStorage.setItem('sf_refresh_token', result.refreshToken);
        localStorage.setItem('sf_user', JSON.stringify(result.user));
        document.dispatchEvent(new CustomEvent('sf:login', { detail: result.user }));
      }
      return result;
    },

    logout: async function() {
      try {
        await this.apiCall('/v22-auth', {
          method: 'POST',
          body: JSON.stringify({ action: 'logout' })
        });
      } catch (e) {}
      this._token = null;
      this._refreshToken = null;
      this._user = null;
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_refresh_token');
      localStorage.removeItem('sf_user');
      document.dispatchEvent(new CustomEvent('sf:logout'));
    },

    refreshToken: async function() {
      if (!this._refreshToken) throw new Error('No refresh token');
      var result = await this.apiCall('/v22-auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'refresh', refreshToken: this._refreshToken })
      });
      if (result.accessToken) {
        this._token = result.accessToken;
        localStorage.setItem('sf_token', result.accessToken);
        if (result.refreshToken) {
          this._refreshToken = result.refreshToken;
          localStorage.setItem('sf_refresh_token', result.refreshToken);
        }
      }
      return result;
    },

    getCurrentUser: function() {
      return this._user;
    },

    isLoggedIn: function() {
      return !!this._token && !!this._user;
    },

    hasRole: function(role) {
      if (!this._user) return false;
      var ROLES = {
        super_admin: 100, admin: 80, officer: 60, dealer: 40,
        wholesaler: 35, retailer: 30, farmer: 10
      };
      return (ROLES[this._user.role] || 0) >= (ROLES[role] || 0);
    },

    // ==================== ORDERS ====================

    createOrder: async function(data) {
      var result = await this.apiCall('/v22-order', {
        method: 'POST',
        body: JSON.stringify(Object.assign({ action: 'create' }, data))
      });
      document.dispatchEvent(new CustomEvent('sf:orderCreated', { detail: result }));
      return result;
    },

    getOrders: async function(filter) {
      var params = new URLSearchParams({ action: 'list' });
      if (filter) {
        if (filter.status) params.set('status', filter.status);
        if (filter.page) params.set('page', filter.page);
        if (filter.limit) params.set('limit', filter.limit);
        if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
        if (filter.dateTo) params.set('dateTo', filter.dateTo);
      }
      return this.apiCall('/v22-order?' + params.toString());
    },

    getOrder: async function(orderId) {
      return this.apiCall('/v22-order?action=detail&id=' + orderId);
    },

    updateOrderStatus: async function(id, status, note) {
      var result = await this.apiCall('/v22-order', {
        method: 'POST',
        body: JSON.stringify({ action: 'update', orderId: id, status: status, note: note || '' })
      });
      document.dispatchEvent(new CustomEvent('sf:orderUpdated', { detail: result }));
      return result;
    },

    cancelOrder: async function(id, reason) {
      var result = await this.apiCall('/v22-order', {
        method: 'POST',
        body: JSON.stringify({ action: 'cancel', orderId: id, reason: reason })
      });
      document.dispatchEvent(new CustomEvent('sf:orderCancelled', { detail: result }));
      return result;
    },

    getOrderStats: async function(dealerId) {
      var url = '/v22-order?action=stats';
      if (dealerId) url += '&dealerId=' + dealerId;
      return this.apiCall(url);
    },

    // ==================== PAYMENTS ====================

    createPayment: async function(data) {
      var result = await this.apiCall('/v22-payment', {
        method: 'POST',
        body: JSON.stringify(Object.assign({ action: 'create' }, data))
      });
      document.dispatchEvent(new CustomEvent('sf:paymentCreated', { detail: result }));
      return result;
    },

    verifyPayment: async function(paymentId, providerData) {
      var result = await this.apiCall('/v22-payment', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify', paymentId: paymentId, providerData: providerData || {} })
      });
      document.dispatchEvent(new CustomEvent('sf:paymentVerified', { detail: result }));
      return result;
    },

    refundPayment: async function(paymentId, amount, reason) {
      var result = await this.apiCall('/v22-payment', {
        method: 'POST',
        body: JSON.stringify({ action: 'refund', paymentId: paymentId, amount: amount, reason: reason })
      });
      document.dispatchEvent(new CustomEvent('sf:paymentRefunded', { detail: result }));
      return result;
    },

    getPayments: async function(filter) {
      var params = new URLSearchParams({ action: 'list' });
      if (filter) {
        if (filter.status) params.set('status', filter.status);
        if (filter.provider) params.set('provider', filter.provider);
        if (filter.page) params.set('page', filter.page);
      }
      return this.apiCall('/v22-payment?' + params.toString());
    },

    generateInvoice: async function(orderData) {
      return this.apiCall('/v22-payment', {
        method: 'POST',
        body: JSON.stringify({ action: 'invoice', orderData: orderData })
      });
    },

    // ==================== SHIPPING ====================

    createShipment: async function(data) {
      var result = await this.apiCall('/v22-shipping', {
        method: 'POST',
        body: JSON.stringify(Object.assign({ action: 'create' }, data))
      });
      document.dispatchEvent(new CustomEvent('sf:shipmentCreated', { detail: result }));
      return result;
    },

    trackShipment: async function(trackingNumber) {
      return this.apiCall('/v22-shipping?action=track&tracking=' + encodeURIComponent(trackingNumber));
    },

    getCourierRates: async function(weight, codAmount, area) {
      var params = new URLSearchParams({
        action: 'rates',
        weight: weight,
        codAmount: codAmount,
        area: area
      });
      return this.apiCall('/v22-shipping?' + params.toString());
    },

    getAvailableCouriers: async function(area) {
      return this.apiCall('/v22-shipping?action=couriers&area=' + encodeURIComponent(area));
    },

    // ==================== NOTIFICATIONS ====================

    getNotifications: async function(filter) {
      var params = new URLSearchParams({ action: 'list' });
      if (filter) {
        if (filter.unread) params.set('unread', 'true');
        if (filter.limit) params.set('limit', filter.limit);
        if (filter.type) params.set('type', filter.type);
      }
      return this.apiCall('/v22-notification?' + params.toString());
    },

    markNotificationRead: async function(id) {
      var result = await this.apiCall('/v22-notification', {
        method: 'POST',
        body: JSON.stringify({ action: 'markRead', notificationId: id })
      });
      document.dispatchEvent(new CustomEvent('sf:notificationRead', { detail: { id: id } }));
      return result;
    },

    markAllNotificationsRead: async function() {
      var result = await this.apiCall('/v22-notification', {
        method: 'POST',
        body: JSON.stringify({ action: 'readAll' })
      });
      document.dispatchEvent(new CustomEvent('sf:notificationsCleared'));
      return result;
    },

    getUnreadCount: async function() {
      return this.apiCall('/v22-notification?action=unreadCount');
    },

    updateNotificationPrefs: async function(prefs) {
      return this.apiCall('/v22-notification', {
        method: 'POST',
        body: JSON.stringify({ action: 'updatePrefs', preferences: prefs })
      });
    },

    // ==================== LIVE CHAT ====================

    createChatRoom: async function(participants, type) {
      return this.apiCall('/v22-livechat', {
        method: 'POST',
        body: JSON.stringify({ action: 'createRoom', participants: participants, type: type || 'direct' })
      });
    },

    sendMessage: async function(roomId, content) {
      var result = await this.apiCall('/v22-livechat', {
        method: 'POST',
        body: JSON.stringify({ action: 'send', roomId: roomId, content: content })
      });
      document.dispatchEvent(new CustomEvent('sf:messageSent', { detail: result }));
      return result;
    },

    getMessages: async function(roomId, limit, before) {
      var params = new URLSearchParams({ action: 'messages', roomId: roomId });
      if (limit) params.set('limit', limit);
      if (before) params.set('before', before);
      return this.apiCall('/v22-livechat?' + params.toString());
    },

    markMessageRead: async function(roomId, messageId) {
      return this.apiCall('/v22-livechat', {
        method: 'POST',
        body: JSON.stringify({ action: 'markRead', roomId: roomId, messageId: messageId })
      });
    },

    setTyping: async function(roomId, isTyping) {
      return this.apiCall('/v22-livechat', {
        method: 'POST',
        body: JSON.stringify({ action: 'typing', roomId: roomId, isTyping: isTyping })
      });
    },

    getUserRooms: async function() {
      return this.apiCall('/v22-livechat?action=rooms');
    },

    searchMessages: async function(roomId, query) {
      return this.apiCall('/v22-livechat?action=search&roomId=' + roomId + '&q=' + encodeURIComponent(query));
    },

    // ==================== ANALYTICS ====================

    getDashboard: async function() {
      return this._cached('dashboard', 60000, function() {
        return SFEnterprise.apiCall('/v22-analytics?action=dashboard');
      });
    },

    getAnalytics: async function(type, period) {
      var params = new URLSearchParams({ action: type || 'dashboard' });
      if (period) params.set('period', period);
      var cacheKey = 'analytics_' + type + '_' + (period || '');
      return this._cached(cacheKey, 300000, function() {
        return SFEnterprise.apiCall('/v22-analytics?' + params.toString());
      });
    },

    getSalesAnalytics: async function(period) {
      return this.getAnalytics('sales', period);
    },

    getUserAnalytics: async function() {
      return this.getAnalytics('users');
    },

    getProductAnalytics: async function() {
      return this.getAnalytics('products');
    },

    getRevenueAnalytics: async function(startDate, endDate) {
      var params = new URLSearchParams({ action: 'revenue' });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      return this.apiCall('/v22-analytics?' + params.toString());
    },

    getCropAnalytics: async function() {
      return this.getAnalytics('crops');
    },

    trackEvent: async function(type, data) {
      return this.apiCall('/v22-analytics', {
        method: 'POST',
        body: JSON.stringify({ action: 'track', type: type, data: data })
      });
    },

    exportAnalytics: async function(type, format) {
      return this.apiCall('/v22-analytics?action=export&type=' + (type || 'order') + '&format=' + (format || 'json'));
    },

    // ==================== AI INSIGHTS ====================

    getInsights: async function(type, data) {
      var payload = Object.assign({ action: type }, data || {});
      return this.apiCall('/v22-insights', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    predictDemand: async function(productHistory, days) {
      return this.getInsights('predictDemand', { productHistory: productHistory, days: days });
    },

    predictDiseaseRisk: async function(crop, season, weather) {
      return this.getInsights('predictDiseaseRisk', { crop: crop, season: season, weather: weather });
    },

    predictCropYield: async function(crop, acreage, conditions) {
      return this.getInsights('predictCropYield', { crop: crop, acreage: acreage, conditions: conditions });
    },

    predictCropPrice: async function(crop, history) {
      return this.getInsights('predictCropPrice', { crop: crop, history: history });
    },

    assessWeatherRisk: async function(weatherForecast) {
      return this.getInsights('assessWeatherRisk', { weatherForecast: weatherForecast });
    },

    predictBusinessGrowth: async function(salesHistory) {
      return this.getInsights('predictBusinessGrowth', { salesHistory: salesHistory });
    },

    // ==================== CACHING ====================

    _cached: function(key, ttl, fetcher) {
      var now = Date.now();
      if (this._cache[key] && this._cacheExpiry[key] > now) {
        return Promise.resolve(this._cache[key]);
      }
      var self = this;
      return fetcher().then(function(result) {
        self._cache[key] = result;
        self._cacheExpiry[key] = now + ttl;
        return result;
      });
    },

    clearCache: function(key) {
      if (key) {
        delete this._cache[key];
        delete this._cacheExpiry[key];
      } else {
        this._cache = {};
        this._cacheExpiry = {};
      }
    },

    // ==================== API CALLS ====================

    apiCall: async function(endpoint, options) {
      var url = API_BASE + endpoint;
      var config = {
        method: (options && options.method) || 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (this._token) {
        config.headers['Authorization'] = 'Bearer ' + this._token;
      }

      if (options) {
        if (options.body) config.body = options.body;
        if (options.headers) {
          for (var k in options.headers) {
            config.headers[k] = options.headers[k];
          }
        }
      }

      try {
        var response = await fetch(url, config);

        if (response.status === 401 && this._refreshToken) {
          try {
            await this.refreshToken();
            config.headers['Authorization'] = 'Bearer ' + this._token;
            response = await fetch(url, config);
          } catch (refreshErr) {
            await this.logout();
            document.dispatchEvent(new CustomEvent('sf:sessionExpired'));
            throw new Error('Session expired');
          }
        }

        if (response.status === 429) {
          var retryAfter = response.headers.get('Retry-After') || 30;
          document.dispatchEvent(new CustomEvent('sf:rateLimited', { detail: { retryAfter: retryAfter } }));
          throw new Error('Rate limited. Retry after ' + retryAfter + 's');
        }

        var contentType = response.headers.get('Content-Type') || '';
        var result;
        if (contentType.includes('application/json')) {
          result = await response.json();
        } else {
          result = await response.text();
        }

        if (!response.ok) {
          var error = new Error((result && result.error) || 'API Error');
          error.status = response.status;
          error.code = result && result.code;
          throw error;
        }

        return result;
      } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          document.dispatchEvent(new CustomEvent('sf:networkError', { detail: { endpoint: endpoint } }));
        }
        throw err;
      }
    },

    // ==================== DASHBOARD RENDERING ====================

    createEnterpriseDashboard: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;

      var self = this;

      container.innerHTML = '<div class="sf-dashboard-loading">Loading Enterprise Dashboard...</div>';

      Promise.all([
        self.getDashboard(),
        self.getSalesAnalytics('month'),
        self.getUserAnalytics(),
        self.getOrderStats()
      ]).then(function(results) {
        var dashboard = results[0] || {};
        var sales = results[1] || {};
        var users = results[2] || {};
        var orderStats = results[3] || {};

        container.innerHTML =
          '<div class="sf-enterprise-dashboard">' +
            '<div class="sf-dash-header">' +
              '<h2>SF AI Enterprise Dashboard</h2>' +
              '<span class="sf-dash-version">V22.0.0</span>' +
            '</div>' +

            '<div class="sf-stats-grid">' +
              self._statCard('Total Revenue', '৳' + self._formatNumber(dashboard.totalRevenue || 0), 'revenue', 'sf-green') +
              self._statCard('Total Orders', self._formatNumber(dashboard.totalOrders || 0), 'orders', 'sf-blue') +
              self._statCard('Total Users', self._formatNumber(dashboard.totalUsers || 0), 'users', 'sf-purple') +
              self._statCard('Total Products', self._formatNumber(dashboard.totalProducts || 0), 'products', 'sf-orange') +
              self._statCard('Pending Orders', dashboard.pendingOrders || 0, 'pending', 'sf-yellow') +
              self._statCard('Low Stock Items', dashboard.lowStockItems || 0, 'stock', 'sf-red') +
              self._statCard("Today's Orders", dashboard.todayOrders || 0, 'today-orders', 'sf-teal') +
              self._statCard("Today's Revenue", '৳' + self._formatNumber(dashboard.todayRevenue || 0), 'today-revenue', 'sf-green') +
            '</div>' +

            '<div class="sf-dash-section">' +
              '<h3>Sales Overview</h3>' +
              '<div class="sf-sales-summary">' +
                '<div class="sf-sales-item"><span>Total Sales</span><strong>৳' + self._formatNumber(sales.totalSales || 0) + '</strong></div>' +
                '<div class="sf-sales-item"><span>Total Orders</span><strong>' + (sales.totalOrders || 0) + '</strong></div>' +
                '<div class="sf-sales-item"><span>Avg Order Value</span><strong>৳' + self._formatNumber(sales.averageOrderValue || 0) + '</strong></div>' +
                '<div class="sf-sales-item"><span>Conversion Rate</span><strong>' + (sales.conversionRate || 0) + '%</strong></div>' +
              '</div>' +
            '</div>' +

            '<div class="sf-dash-section">' +
              '<h3>User Statistics</h3>' +
              '<div class="sf-user-stats">' +
                '<div class="sf-stat-row"><span>Total Users</span><strong>' + (users.totalUsers || 0) + '</strong></div>' +
                '<div class="sf-stat-row"><span>Active Users</span><strong>' + (users.activeUsers || 0) + '</strong></div>' +
                '<div class="sf-stat-row"><span>New Users (30d)</span><strong>' + (users.newUsers || 0) + '</strong></div>' +
                '<div class="sf-stat-row"><span>Returning Users</span><strong>' + (users.returningUsers || 0) + '</strong></div>' +
              '</div>' +
            '</div>' +

            '<div class="sf-dash-section">' +
              '<h3>Top Products</h3>' +
              '<div class="sf-top-products" id="sf-top-products"></div>' +
            '</div>' +
          '</div>';

        // Render top products
        var topProductsEl = document.getElementById('sf-top-products');
        if (topProductsEl && sales.topProducts && sales.topProducts.length > 0) {
          topProductsEl.innerHTML = sales.topProducts.map(function(p, i) {
            return '<div class="sf-product-row">' +
              '<span class="sf-rank">#' + (i + 1) + '</span>' +
              '<span class="sf-name">' + self._escapeHtml(p.name) + '</span>' +
              '<span class="sf-count">' + p.count + ' orders</span>' +
            '</div>';
          }).join('');
        } else if (topProductsEl) {
          topProductsEl.innerHTML = '<p class="sf-empty">No product data yet</p>';
        }
      }).catch(function(err) {
        container.innerHTML = '<div class="sf-dashboard-error">' +
          '<h3>Dashboard Error</h3>' +
          '<p>' + self._escapeHtml(err.message) + '</p>' +
          '<button onclick="SFEnterprise.createEnterpriseDashboard(\'' + containerId + '\')">Retry</button>' +
        '</div>';
      });
    },

    // ==================== HELPERS ====================

    _statCard: function(label, value, type, colorClass) {
      return '<div class="sf-stat-card ' + (colorClass || '') + '">' +
        '<div class="sf-stat-label">' + label + '</div>' +
        '<div class="sf-stat-value">' + value + '</div>' +
      '</div>';
    },

    _formatNumber: function(num) {
      if (num === null || num === undefined) return '0';
      if (typeof num !== 'number') num = parseFloat(num) || 0;
      return num.toLocaleString('bn-BD');
    },

    _escapeHtml: function(str) {
      if (!str) return '';
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    // ==================== EVENT BUS ====================

    on: function(event, callback) {
      document.addEventListener('sf:' + event, callback);
    },

    off: function(event, callback) {
      document.removeEventListener('sf:' + event, callback);
    },

    emit: function(event, detail) {
      document.dispatchEvent(new CustomEvent('sf:' + event, { detail: detail }));
    }
  };

  // Expose globally
  window.SFEnterprise = SFEnterprise;
  window.SFV22 = SFEnterprise;

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { SFEnterprise.init(); });
  } else {
    SFEnterprise.init();
  }
})();
