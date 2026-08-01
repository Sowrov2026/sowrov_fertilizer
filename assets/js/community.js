const POSTS_KEY = 'sf_community_posts';
const COMMENTS_KEY = 'sf_community_comments';

const CATEGORIES = {
    question: 'প্রশ্ন',
    experience: 'অভিজ্ঞতা',
    tip: 'টিপস',
    news: 'সংবাদ',
    emergency: 'জরুরি'
};

const STATUS = {
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    REPORTED: 'reported'
};

function generateId() {
    return 'post_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

function generateCommentId() {
    return 'cmt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

function loadPosts() {
    try {
        const raw = localStorage.getItem(POSTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function savePosts(posts) {
    try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    } catch (e) {
        console.error('পোস্ট সংরক্ষণে ত্রুটি:', e);
    }
}

function loadComments() {
    try {
        const raw = localStorage.getItem(COMMENTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveComments(comments) {
    try {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    } catch (e) {
        console.error('কমেন্ট সংরক্ষণে ত্রুটি:', e);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function timeAgoBn(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'এইমাত্র';
    if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} দিন আগে`;
    return `${Math.floor(diff / 604800)} সপ্তাহ আগে`;
}

function renderPostCard(post, showActions = false) {
    const catLabel = CATEGORIES[post.category] || post.category;
    const catClass = `sf-cat-${post.category || 'question'}`;
    const likeCount = (post.likes || []).length;
    const commentCount = (post.comments || []).length;
    let html = `<div class="sf-post-card" data-id="${post.id}">`;
    html += '<div class="sf-post-header">';
    html += `<span class="sf-post-category ${catClass}">${catLabel}</span>`;
    if (post.status === STATUS.REPORTED) html += '<span class="sf-post-flagged">রিপোর্ট করা হয়েছে</span>';
    if (post.status === STATUS.HIDDEN) html += '<span class="sf-post-hidden">লুকানো</span>';
    html += `<span class="sf-post-time">${timeAgoBn(post.createdAt)}</span>`;
    html += '</div>';
    html += `<h3 class="sf-post-title">${escapeHtml(post.title)}</h3>`;
    html += `<p class="sf-post-excerpt">${escapeHtml((post.content || '').substring(0, 200))}${(post.content || '').length > 200 ? '...' : ''}</p>`;
    if (post.images && post.images.length > 0) {
        html += '<div class="sf-post-images">';
        post.images.slice(0, 3).forEach(img => {
            html += `<img src="${escapeHtml(img)}" alt="পোস্ট ছবি" class="sf-post-thumb">`;
        });
        if (post.images.length > 3) html += `<span class="sf-more-images">+${post.images.length - 3}</span>`;
        html += '</div>';
    }
    if (post.tags && post.tags.length > 0) {
        html += '<div class="sf-post-tags">';
        post.tags.forEach(tag => { html += `<span class="sf-tag">${escapeHtml(tag)}</span>`; });
        html += '</div>';
    }
    html += '<div class="sf-post-footer">';
    html += `<span class="sf-post-author">✍️ ${escapeHtml(post.authorName || 'অজ্ঞাত')}</span>`;
    html += `<button class="sf-action-btn sf-like-btn" data-id="${post.id}">👍 ${likeCount}</button>`;
    html += `<button class="sf-action-btn sf-comment-btn" data-id="${post.id}">💬 ${commentCount}</button>`;
    if (showActions) {
        html += `<button class="sf-action-btn sf-edit-btn" data-id="${post.id}">✏️ সম্পাদনা</button>`;
        html += `<button class="sf-action-btn sf-delete-btn" data-id="${post.id}">🗑️ মুছুন</button>`;
    }
    html += '</div></div>';
    return html;
}

function renderComment(comment) {
    let html = `<div class="sf-comment" data-id="${comment.id}">`;
    html += '<div class="sf-comment-header">';
    html += `<span class="sf-comment-author">${escapeHtml(comment.authorName || 'অজ্ঞাত')}</span>`;
    html += `<span class="sf-comment-time">${timeAgoBn(comment.createdAt)}</span>`;
    html += '</div>';
    html += `<p class="sf-comment-content">${escapeHtml(comment.content)}</p>`;
    html += '</div>';
    return html;
}

export const SFCommunity = {
    init() {
        if (!localStorage.getItem(POSTS_KEY)) localStorage.setItem(POSTS_KEY, '[]');
        if (!localStorage.getItem(COMMENTS_KEY)) localStorage.setItem(COMMENTS_KEY, '[]');
    },

    createPost(data) {
        const posts = loadPosts();
        const post = {
            id: generateId(),
            title: data.title || '',
            content: data.content || '',
            images: data.images || [],
            category: data.category || 'question',
            tags: data.tags || [],
            authorId: data.authorId || null,
            authorName: data.authorName || 'অজ্ঞাত',
            status: STATUS.ACTIVE,
            likes: [],
            comments: [],
            reports: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        posts.push(post);
        savePosts(posts);
        return post;
    },

    updatePost(id, data) {
        const posts = loadPosts();
        const idx = posts.findIndex(p => p.id === id);
        if (idx === -1) return null;
        posts[idx] = { ...posts[idx], ...data, updatedAt: new Date().toISOString() };
        savePosts(posts);
        return posts[idx];
    },

    deletePost(id) {
        const posts = loadPosts();
        const filtered = posts.filter(p => p.id !== id);
        if (filtered.length === posts.length) return false;
        savePosts(filtered);
        const comments = loadComments();
        saveComments(comments.filter(c => c.postId !== id));
        return true;
    },

    getPost(id) {
        return loadPosts().find(p => p.id === id) || null;
    },

    getPosts(filter = {}) {
        let posts = loadPosts();
        if (filter.category) posts = posts.filter(p => p.category === filter.category);
        if (filter.tag) posts = posts.filter(p => (p.tags || []).includes(filter.tag));
        if (filter.author) posts = posts.filter(p => p.authorId === filter.author || p.authorName === filter.author);
        if (filter.status) posts = posts.filter(p => p.status === filter.status);
        posts = posts.filter(p => p.status !== STATUS.HIDDEN || filter.includeHidden);
        switch (filter.sort) {
            case 'oldest': posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'popular': posts.sort((a, b) => (b.likes || []).length - (a.likes || []).length); break;
            case 'most_commented': posts.sort((a, b) => (b.comments || []).length - (a.comments || []).length); break;
            case 'recent': default: posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        }
        if (filter.limit) posts = posts.slice(0, filter.limit);
        return posts;
    },

    likePost(postId, userId) {
        const posts = loadPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return false;
        if (!post.likes) post.likes = [];
        if (post.likes.includes(userId)) return false;
        post.likes.push(userId);
        savePosts(posts);
        return true;
    },

    unlikePost(postId, userId) {
        const posts = loadPosts();
        const post = posts.find(p => p.id === postId);
        if (!post || !post.likes) return false;
        const idx = post.likes.indexOf(userId);
        if (idx === -1) return false;
        post.likes.splice(idx, 1);
        savePosts(posts);
        return true;
    },

    addComment(postId, comment) {
        const posts = loadPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return null;
        const newComment = {
            id: generateCommentId(),
            postId,
            content: comment.content || '',
            authorId: comment.authorId || null,
            authorName: comment.authorName || 'অজ্ঞাত',
            createdAt: new Date().toISOString()
        };
        if (!post.comments) post.comments = [];
        post.comments.push(newComment.id);
        savePosts(posts);
        const comments = loadComments();
        comments.push(newComment);
        saveComments(comments);
        return newComment;
    },

    deleteComment(postId, commentId) {
        const posts = loadPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return false;
        if (post.comments) post.comments = post.comments.filter(id => id !== commentId);
        savePosts(posts);
        const comments = loadComments();
        saveComments(comments.filter(c => c.id !== commentId));
        return true;
    },

    reportPost(postId, reason) {
        const posts = loadPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return false;
        if (!post.reports) post.reports = [];
        post.reports.push({ reason, date: new Date().toISOString() });
        if (post.reports.length >= 3) post.status = STATUS.REPORTED;
        savePosts(posts);
        return true;
    },

    hidePost(postId) {
        const posts = loadPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return false;
        post.status = STATUS.HIDDEN;
        savePosts(posts);
        return true;
    },

    getReportedPosts() {
        return loadPosts().filter(p => p.status === STATUS.REPORTED || (p.reports && p.reports.length > 0));
    },

    searchPosts(query) {
        if (!query) return [];
        const q = query.toLowerCase();
        return loadPosts().filter(p => {
            if (p.status === STATUS.HIDDEN) return false;
            const searchable = `${p.title} ${p.content} ${(p.tags || []).join(' ')}`.toLowerCase();
            return searchable.includes(q);
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getTrendingPosts() {
        const posts = loadPosts().filter(p => p.status !== STATUS.HIDDEN);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recent = posts.filter(p => new Date(p.createdAt) >= oneWeekAgo);
        return recent.sort((a, b) => {
            const scoreA = (a.likes || []).length * 2 + (a.comments || []).length;
            const scoreB = (b.likes || []).length * 2 + (b.comments || []).length;
            return scoreB - scoreA;
        }).slice(0, 10);
    },

    getRecentPosts() {
        return loadPosts()
            .filter(p => p.status !== STATUS.HIDDEN)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20);
    },

    getUserPosts(userId) {
        return loadPosts().filter(p => p.authorId === userId && p.status !== STATUS.HIDDEN)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getUserReputation(userId) {
        const posts = loadPosts().filter(p => p.authorId === userId);
        const totalLikes = posts.reduce((s, p) => s + (p.likes || []).length, 0);
        const totalComments = posts.reduce((s, p) => s + (p.comments || []).length, 0);
        const postCount = posts.length;
        return {
            userId,
            postCount,
            totalLikes,
            totalComments,
            reputation: postCount * 5 + totalLikes * 2 + totalComments
        };
    },

    createForumHome(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const recent = this.getRecentPosts();
        const trending = this.getTrendingPosts();
        let html = '<div class="sf-forum-home">';
        html += '<div class="sf-forum-header">';
        html += '<h2>🌾 কৃষক কমিউনিটি ফোরাম</h2>';
        html += '<button class="sf-btn sf-btn-primary" id="sf-new-post-btn">নতুন পোস্ট লিখুন</button>';
        html += '</div>';
        html += '<div class="sf-forum-search">';
        html += '<input type="text" id="sf-forum-search-input" placeholder="পোস্ট খুঁজুন..." class="sf-search-input">';
        html += '<button class="sf-btn" id="sf-forum-search-btn">🔍 খুঁজুন</button>';
        html += '</div>';
        html += '<div class="sf-forum-categories">';
        html += '<button class="sf-cat-btn sf-cat-active" data-cat="all">সকল</button>';
        Object.entries(CATEGORIES).forEach(([key, label]) => {
            html += `<button class="sf-cat-btn" data-cat="${key}">${label}</button>`;
        });
        html += '</div>';
        html += '<div class="sf-forum-body">';
        html += '<div class="sf-forum-main">';
        html += '<h3>সাম্প্রতিক পোস্ট</h3>';
        if (recent.length === 0) {
            html += '<p class="sf-empty">কোনো পোস্ট নেই। প্রথম পোস্ট লিখুন!</p>';
        } else {
            html += '<div id="sf-post-list">';
            recent.forEach(post => { html += renderPostCard(post); });
            html += '</div>';
        }
        html += '</div>';
        html += '<div class="sf-forum-sidebar">';
        html += '<div class="sf-trending-panel">';
        html += '<h3>🔥 জনপ্রিয় পোস্ট</h3>';
        if (trending.length === 0) {
            html += '<p>কোনো জনপ্রিয় পোস্ট নেই।</p>';
        } else {
            trending.slice(0, 5).forEach((post, i) => {
                html += `<div class="sf-trending-item" data-id="${post.id}">`;
                html += `<span class="sf-trending-rank">${i + 1}</span>`;
                html += `<span class="sf-trending-title">${escapeHtml(post.title)}</span>`;
                html += `<span class="sf-trending-likes">👍 ${(post.likes || []).length}</span>`;
                html += '</div>';
            });
        }
        html += '</div></div>';
        html += '</div></div>';
        container.innerHTML = html;
        this._bindForumEvents(container);
    },

    _bindForumEvents(container) {
        container.querySelector('#sf-new-post-btn')?.addEventListener('click', () => {
            this.createPostForm(container.id);
        });
        container.querySelector('#sf-forum-search-btn')?.addEventListener('click', () => {
            const q = container.querySelector('#sf-forum-search-input').value.trim();
            if (q) {
                const results = this.searchPosts(q);
                this.createPostList(container.id, { searchResults: results });
            }
        });
        container.querySelector('#sf-forum-search-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') container.querySelector('#sf-forum-search-btn').click();
        });
        container.querySelectorAll('.sf-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.sf-cat-btn').forEach(b => b.classList.remove('sf-cat-active'));
                btn.classList.add('sf-cat-active');
                const cat = btn.dataset.cat;
                const filter = cat === 'all' ? {} : { category: cat };
                this.createPostList(container.id, filter);
            });
        });
        container.querySelectorAll('.sf-post-title, .sf-trending-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset?.id || el.closest('.sf-post-card')?.dataset?.id;
                if (id) this.createPostDetail(container.id, id);
            });
        });
        container.querySelectorAll('.sf-like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const userId = localStorage.getItem('sf_current_user_id') || 'guest';
                const post = this.getPost(id);
                if (post && (post.likes || []).includes(userId)) {
                    this.unlikePost(id, userId);
                } else {
                    this.likePost(id, userId);
                }
                this.createForumHome(container.id);
            });
        });
        container.querySelectorAll('.sf-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.createPostDetail(container.id, id);
            });
        });
    },

    createPostList(containerId, filter = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const posts = filter.searchResults || this.getPosts(filter);
        let html = '<div class="sf-post-list-view">';
        html += '<div class="sf-list-header">';
        html += '<button class="sf-btn sf-back-btn" id="sf-back-forum">← ফিরে যান</button>';
        const catLabel = filter.category ? CATEGORIES[filter.category] : 'সকল পোস্ট';
        html += `<h3>${catLabel}</h3>`;
        html += '</div>';
        if (posts.length === 0) {
            html += '<p class="sf-empty">কোনো পোস্ট পাওয়া যায়নি।</p>';
        } else {
            html += '<div class="sf-posts-grid">';
            posts.forEach(post => { html += renderPostCard(post); });
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
        container.querySelector('#sf-back-forum')?.addEventListener('click', () => {
            this.createForumHome(containerId);
        });
        this._bindPostEvents(container, containerId);
    },

    createPostDetail(containerId, postId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const post = this.getPost(postId);
        if (!post) { container.innerHTML = '<p>পোস্ট পাওয়া যায়নি।</p>'; return; }
        const comments = loadComments().filter(c => (post.comments || []).includes(c.id));
        const catLabel = CATEGORIES[post.category] || post.category;
        let html = '<div class="sf-post-detail">';
        html += '<div class="sf-detail-header">';
        html += '<button class="sf-btn sf-back-btn" id="sf-back-from-detail">← ফিরে যান</button>';
        html += '</div>';
        html += '<div class="sf-post-full">';
        html += `<span class="sf-post-category sf-cat-${post.category}">${catLabel}</span>`;
        html += `<h2>${escapeHtml(post.title)}</h2>`;
        html += '<div class="sf-post-meta">';
        html += `<span>✍️ ${escapeHtml(post.authorName || 'অজ্ঞাত')}</span>`;
        html += `<span>📅 ${timeAgoBn(post.createdAt)}</span>`;
        html += `<span>👍 ${(post.likes || []).length} লাইক</span>`;
        html += '</div>';
        html += `<div class="sf-post-body">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>`;
        if (post.images && post.images.length > 0) {
            html += '<div class="sf-post-images-full">';
            post.images.forEach(img => { html += `<img src="${escapeHtml(img)}" alt="পোস্ট ছবি" class="sf-post-image-full">`; });
            html += '</div>';
        }
        if (post.tags && post.tags.length > 0) {
            html += '<div class="sf-post-tags">';
            post.tags.forEach(tag => { html += `<span class="sf-tag">${escapeHtml(tag)}</span>`; });
            html += '</div>';
        }
        const userId = localStorage.getItem('sf_current_user_id') || 'guest';
        const liked = (post.likes || []).includes(userId);
        html += '<div class="sf-post-actions">';
        html += `<button class="sf-btn ${liked ? 'sf-btn-liked' : ''}" id="sf-detail-like">👍 ${liked ? 'লাইক করা হয়েছে' : 'লাইক'} (${(post.likes || []).length})</button>`;
        html += `<button class="sf-btn sf-btn-warning" id="sf-detail-report">⚠️ রিপোর্ট</button>`;
        html += '</div></div>';
        html += '<div class="sf-comments-section">';
        html += `<h3>কমেন্ট (${comments.length})</h3>`;
        html += '<div class="sf-comment-form">';
        html += '<textarea id="sf-comment-input" class="sf-textarea" placeholder="আপনার কমেন্ট লিখুন..." rows="3"></textarea>';
        html += '<button class="sf-btn sf-btn-primary" id="sf-submit-comment">কমেন্ট পোস্ট করুন</button>';
        html += '</div>';
        html += '<div class="sf-comments-list">';
        if (comments.length === 0) {
            html += '<p class="sf-empty">কোনো কমেন্ট নেই।</p>';
        } else {
            comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            comments.forEach(c => { html += renderComment(c); });
        }
        html += '</div></div></div>';
        container.innerHTML = html;
        container.querySelector('#sf-back-from-detail')?.addEventListener('click', () => {
            this.createForumHome(containerId);
        });
        container.querySelector('#sf-detail-like')?.addEventListener('click', () => {
            if (liked) { this.unlikePost(postId, userId); } else { this.likePost(postId, userId); }
            this.createPostDetail(containerId, postId);
        });
        container.querySelector('#sf-detail-report')?.addEventListener('click', () => {
            const reason = prompt('রিপোর্টের কারণ লিখুন:');
            if (reason) {
                this.reportPost(postId, reason);
                alert('রিপোর্ট জমা হয়েছে।');
            }
        });
        container.querySelector('#sf-submit-comment')?.addEventListener('click', () => {
            const input = container.querySelector('#sf-comment-input');
            const content = input.value.trim();
            if (!content) { alert('কমেন্ট লিখুন।'); return; }
            const authorName = localStorage.getItem('sf_current_user_name') || 'অজ্ঞাত';
            this.addComment(postId, { content, authorId: userId, authorName });
            input.value = '';
            this.createPostDetail(containerId, postId);
        });
    },

    createPostForm(containerId, editData = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const isEdit = !!editData;
        let html = '<div class="sf-post-form-view">';
        html += '<div class="sf-form-header">';
        html += '<button class="sf-btn sf-back-btn" id="sf-back-from-form">← ফিরে যান</button>';
        html += `<h3>${isEdit ? 'পোস্ট সম্পাদনা করুন' : 'নতুন পোস্ট লিখুন'}</h3>`;
        html += '</div>';
        html += '<form id="sf-post-form" class="sf-form">';
        html += '<div class="sf-form-group">';
        html += '<label>শিরোনাম *</label>';
        html += `<input type="text" id="sf-post-title" class="sf-input" value="${escapeHtml(editData?.title || '')}" required placeholder="পোস্টের শিরোনাম লিখুন">`;
        html += '</div>';
        html += '<div class="sf-form-group">';
        html += '<label>বিষয় *</label>';
        html += '<select id="sf-post-category" class="sf-select">';
        Object.entries(CATEGORIES).forEach(([key, label]) => {
            const sel = editData?.category === key ? 'selected' : '';
            html += `<option value="${key}" ${sel}>${label}</option>`;
        });
        html += '</select></div>';
        html += '<div class="sf-form-group">';
        html += '<label>বিস্তারিত লিখুন *</label>';
        html += `<textarea id="sf-post-content" class="sf-textarea" rows="8" required placeholder="আপনার অভিজ্ঞতা, প্রশ্ন বা তথ্য লিখুন...">${escapeHtml(editData?.content || '')}</textarea>`;
        html += '</div>';
        html += '<div class="sf-form-group">';
        html += '<label>ট্যাগ (কমা দিয়ে আলাদা করুন)</label>';
        html += `<input type="text" id="sf-post-tags" class="sf-input" value="${escapeHtml((editData?.tags || []).join(', '))" placeholder="যেমন: ধান, সার, পেস্টিসাইড">`;
        html += '</div>';
        html += '<div class="sf-form-group">';
        html += '<label>ছবি URL (ঐচ্ছিক, কমা দিয়ে আলাদা করুন)</label>';
        html += `<input type="text" id="sf-post-images" class="sf-input" value="${escapeHtml((editData?.images || []).join(', '))" placeholder="ছবির URL লিখুন">`;
        html += '</div>';
        html += '<div class="sf-form-actions">';
        html += `<button type="submit" class="sf-btn sf-btn-primary">${isEdit ? 'আপডেট করুন' : 'পোস্ট করুন'}</button>`;
        html += '<button type="button" class="sf-btn" id="sf-cancel-post">বাতিল</button>';
        html += '</div></form></div>';
        container.innerHTML = html;
        container.querySelector('#sf-back-from-form')?.addEventListener('click', () => {
            this.createForumHome(containerId);
        });
        container.querySelector('#sf-cancel-post')?.addEventListener('click', () => {
            this.createForumHome(containerId);
        });
        container.querySelector('#sf-post-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = container.querySelector('#sf-post-title').value.trim();
            const content = container.querySelector('#sf-post-content').value.trim();
            const category = container.querySelector('#sf-post-category').value;
            const tagsStr = container.querySelector('#sf-post-tags').value.trim();
            const imagesStr = container.querySelector('#sf-post-images').value.trim();
            if (!title || !content) { alert('শিরোনাম এবং বিস্তারিত আবশ্যক।'); return; }
            const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
            const images = imagesStr ? imagesStr.split(',').map(u => u.trim()).filter(Boolean) : [];
            const authorId = localStorage.getItem('sf_current_user_id') || 'guest';
            const authorName = localStorage.getItem('sf_current_user_name') || 'অজ্ঞাত';
            if (isEdit) {
                this.updatePost(editData.id, { title, content, category, tags, images });
            } else {
                this.createPost({ title, content, category, tags, images, authorId, authorName });
            }
            this.createForumHome(containerId);
        });
    },

    createCommentSection(containerId, postId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const post = this.getPost(postId);
        if (!post) return;
        const comments = loadComments().filter(c => (post.comments || []).includes(c.id));
        let html = '<div class="sf-comment-section">';
        html += '<div class="sf-comment-form">';
        html += '<textarea id="sf-comment-input" class="sf-textarea" placeholder="কমেন্ট লিখুন..." rows="3"></textarea>';
        html += '<button class="sf-btn sf-btn-primary" id="sf-submit-comment">পোস্ট করুন</button>';
        html += '</div>';
        html += '<div class="sf-comments-list">';
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        comments.forEach(c => { html += renderComment(c); });
        if (comments.length === 0) html += '<p class="sf-empty">কোনো কমেন্ট নেই।</p>';
        html += '</div></div>';
        container.innerHTML = html;
        const userId = localStorage.getItem('sf_current_user_id') || 'guest';
        const authorName = localStorage.getItem('sf_current_user_name') || 'অজ্ঞাত';
        container.querySelector('#sf-submit-comment')?.addEventListener('click', () => {
            const input = container.querySelector('#sf-comment-input');
            const content = input.value.trim();
            if (!content) { alert('কমেন্ট লিখুন।'); return; }
            this.addComment(postId, { content, authorId: userId, authorName });
            input.value = '';
            this.createCommentSection(containerId, postId);
        });
        container.querySelectorAll('.sf-delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cid = btn.dataset.id;
                this.deleteComment(postId, cid);
                this.createCommentSection(containerId, postId);
            });
        });
    },

    createTrendingPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const trending = this.getTrendingPosts();
        let html = '<div class="sf-trending-panel-full">';
        html += '<h3>🔥 জনপ্রিয় পোস্ট</h3>';
        if (trending.length === 0) {
            html += '<p class="sf-empty">কোনো জনপ্রিয় পোস্ট নেই।</p>';
        } else {
            html += '<div class="sf-trending-list">';
            trending.forEach((post, i) => {
                const catLabel = CATEGORIES[post.category] || post.category;
                html += `<div class="sf-trending-full-item" data-id="${post.id}">`;
                html += `<span class="sf-trending-rank-lg">${i + 1}</span>`;
                html += '<div class="sf-trending-info">';
                html += `<span class="sf-trending-cat">${catLabel}</span>`;
                html += `<span class="sf-trending-title-lg">${escapeHtml(post.title)}</span>`;
                html += `<span class="sf-trending-stats">👍 ${(post.likes || []).length} | 💬 ${(post.comments || []).length}</span>`;
                html += '</div></div>';
            });
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
        container.querySelectorAll('.sf-trending-full-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                this.createPostDetail(containerId, id);
            });
        });
    },

    exportPosts(filter, format) {
        const posts = this.getPosts(filter);
        let content, filename, mimeType;
        if (format === 'json') {
            content = JSON.stringify(posts, null, 2);
            filename = 'sf_community_posts.json';
            mimeType = 'application/json;charset=utf-8';
        } else {
            const headers = ['শিরোনাম', 'বিষয়', 'বিস্তারিত', 'লেখক', 'তারিখ', 'লাইক', 'কমেন্ট'];
            const rows = [headers.join(',')];
            posts.forEach(p => {
                const row = [
                    `"${(p.title || '').replace(/"/g, '""')}"`,
                    CATEGORIES[p.category] || p.category,
                    `"${(p.content || '').replace(/"/g, '""')}"`,
                    `"${(p.authorName || '').replace(/"/g, '""')}"`,
                    p.createdAt,
                    (p.likes || []).length,
                    (p.comments || []).length
                ];
                rows.push(row.join(','));
            });
            content = rows.join('\n');
            filename = 'sf_community_posts.csv';
            mimeType = 'text/csv;charset=utf-8';
        }
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    _bindPostEvents(container, containerId) {
        container.querySelectorAll('.sf-post-title').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.closest('.sf-post-card')?.dataset?.id;
                if (id) this.createPostDetail(containerId, id);
            });
        });
        container.querySelectorAll('.sf-like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const userId = localStorage.getItem('sf_current_user_id') || 'guest';
                const post = this.getPost(id);
                if (post && (post.likes || []).includes(userId)) {
                    this.unlikePost(id, userId);
                } else {
                    this.likePost(id, userId);
                }
                this.createPostList(containerId, {});
            });
        });
        container.querySelectorAll('.sf-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.createPostDetail(containerId, id);
            });
        });
    }
};
