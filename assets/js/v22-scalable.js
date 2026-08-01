// V22 Scalability Utilities
export const SFScalable = {
    init() {
        this.cache = new Map();
        this.queues = new Map();
        this.scheduledJobs = new Map();
        this.pendingRequests = new Map();
        this.maxCacheSize = 1000;
        this.maxQueueSize = 100;
        this.cleanupInterval = 300000; // 5 minutes
        
        setInterval(() => this.clearExpiredCache(), this.cleanupInterval);
        
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.processAllQueues());
            window.addEventListener('error', (e) => this.handleGlobalError(e));
        }
    },
    
    lazyLoad(path) {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') {
                reject(new Error('Lazy loading not supported in this environment'));
                return;
            }
            
            const script = document.createElement('script');
            script.src = path;
            script.async = true;
            script.onload = () => resolve(window[path.split('/').pop().replace('.js', '')]);
            script.onerror = () => reject(new Error(`Failed to load: ${path}`));
            document.head.appendChild(script);
        });
    },
    
    async loadChunk(chunkId) {
        try {
            const response = await fetch(`/chunks/${chunkId}.js`);
            if (!response.ok) throw new Error(`Chunk ${chunkId} not found`);
            
            const code = await response.text();
            const module = new Function('exports', 'require', code);
            const exports = {};
            module(exports, {});
            return exports;
        } catch (error) {
            console.error(`Failed to load chunk ${chunkId}:`, error);
            return null;
        }
    },
    
    cache(key, data, ttl = 300000) {
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldestCache();
        }
        
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl,
            created: Date.now()
        });
        
        return true;
    },
    
    getCached(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    },
    
    evictOldestCache() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, item] of this.cache) {
            if (item.created < oldestTime) {
                oldestTime = item.created;
                oldestKey = key;
            }
        }
        
        if (oldestKey) this.cache.delete(oldestKey);
    },
    
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, item] of this.cache) {
            if (now > item.expires) {
                this.cache.delete(key);
            }
        }
    },
    
    enqueue(queueName, job) {
        if (!this.queues.has(queueName)) {
            this.queues.set(queueName, []);
        }
        
        const queue = this.queues.get(queueName);
        if (queue.length >= this.maxQueueSize) {
            console.warn(`Queue ${queueName} is full, job rejected`);
            return false;
        }
        
        queue.push({
            ...job,
            id: this.generateId(),
            enqueuedAt: Date.now(),
            status: 'pending'
        });
        
        this.processQueue(queueName);
        return true;
    },
    
    dequeue(queueName) {
        const queue = this.queues.get(queueName);
        if (!queue || queue.length === 0) return null;
        
        return queue.shift();
    },
    
    async processQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (!queue) return;
        
        const processing = queue.filter(job => job.status === 'processing');
        if (processing.length >= 3) return; // Max concurrent
        
        const job = this.dequeue(queueName);
        if (!job) return;
        
        job.status = 'processing';
        try {
            if (typeof job.handler === 'function') {
                await job.handler(job.data);
            }
            job.status = 'completed';
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            
            if (job.retries < 3) {
                job.retries = (job.retries || 0) + 1;
                queue.push(job);
            }
        }
    },
    
    processAllQueues() {
        for (const queueName of this.queues.keys()) {
            this.processQueue(queueName);
        }
    },
    
    scheduleJob(job) {
        const jobId = this.generateId();
        const scheduledJob = {
            ...job,
            id: jobId,
            scheduledAt: Date.now(),
            status: 'scheduled'
        };
        
        this.scheduledJobs.set(jobId, scheduledJob);
        
        if (job.delay) {
            setTimeout(() => this.executeJob(jobId), job.delay);
        } else if (job.cron) {
            this.scheduleCronJob(jobId, job.cron);
        }
        
        return jobId;
    },
    
    executeJob(jobId) {
        const job = this.scheduledJobs.get(jobId);
        if (!job || job.status !== 'scheduled') return;
        
        job.status = 'running';
        try {
            if (typeof job.handler === 'function') {
                job.handler(job.data);
            }
            job.status = 'completed';
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
        }
    },
    
    scheduleCronJob(jobId, cronExpression) {
        // Simple cron implementation for minutes/hours
        const parts = cronExpression.split(' ');
        const interval = this.parseCronInterval(parts);
        
        if (interval > 0) {
            setInterval(() => this.executeJob(jobId), interval);
        }
    },
    
    parseCronInterval(parts) {
        if (parts[0] === '*') return 60000; // Every minute
        if (parts[0].includes('/')) {
            const step = parseInt(parts[0].split('/')[1]);
            return step * 60000;
        }
        return 3600000; // Default hourly
    },
    
    cancelJob(jobId) {
        const job = this.scheduledJobs.get(jobId);
        if (job) {
            job.status = 'cancelled';
            this.scheduledJobs.delete(jobId);
            return true;
        }
        return false;
    },
    
    checkMemory() {
        if (typeof performance !== 'undefined' && performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
    },
    
    cleanupMemory() {
        this.clearExpiredCache();
        
        for (const [key, job] of this.scheduledJobs) {
            if (job.status === 'completed' || job.status === 'failed') {
                this.scheduledJobs.delete(key);
            }
        }
        
        for (const [name, queue] of this.queues) {
            const failedJobs = queue.filter(job => job.status === 'failed');
            failedJobs.forEach(job => {
                const index = queue.indexOf(job);
                if (index > -1) queue.splice(index, 1);
            });
        }
    },
    
    prefetch(urls) {
        if (typeof document === 'undefined') return;
        
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    },
    
    async batchRequests(requests) {
        const batchSize = 5;
        const results = [];
        
        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(
                batch.map(req => this.executeRequest(req))
            );
            results.push(...batchResults);
        }
        
        return results;
    },
    
    async executeRequest(req) {
        const cacheKey = `${req.method || 'GET'}:${req.url}`;
        const cached = this.getCached(cacheKey);
        
        if (cached) return cached;
        
        const response = await fetch(req.url, {
            method: req.method || 'GET',
            headers: req.headers || {},
            body: req.body ? JSON.stringify(req.body) : undefined
        });
        
        const data = await response.json();
        this.cache(cacheKey, data, req.ttl || 60000);
        
        return data;
    },
    
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    handleGlobalError(event) {
        console.error('Global error:', event.error);
        this.cleanupMemory();
    },
    
    getStats() {
        return {
            cacheSize: this.cache.size,
            queueSizes: Object.fromEntries(
                Array.from(this.queues.entries()).map(([name, queue]) => [name, queue.length])
            ),
            scheduledJobs: this.scheduledJobs.size,
            memory: this.checkMemory()
        };
    }
};