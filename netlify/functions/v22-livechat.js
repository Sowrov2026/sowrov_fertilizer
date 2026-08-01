// V22 Live Chat System
// Real-time messaging with typing indicators, read receipts, media sharing

const crypto = require('crypto');

// Chat rooms
const rooms = new Map();
const messages = new Map();
const typingUsers = new Map();

// Create chat room
function createRoom(participants, type = 'direct') {
    const room = {
        id: crypto.randomBytes(16).toString('hex'),
        participants,
        type, // direct, group, support
        status: 'active',
        createdAt: new Date().toISOString(),
        lastMessage: null,
    };
    rooms.set(room.id, room);
    messages.set(room.id, []);
    return room;
}

// Send message
function sendMessage(roomId, senderId, content) {
    const room = rooms.get(roomId);
    if (!room) return null;
    
    const message = {
        id: crypto.randomBytes(16).toString('hex'),
        roomId,
        senderId,
        content: content.text || '',
        type: content.type || 'text', // text, image, voice, file
        imageUrl: content.imageUrl || null,
        voiceUrl: content.voiceUrl || null,
        fileUrl: content.fileUrl || null,
        status: 'sent',
        readBy: [senderId],
        createdAt: new Date().toISOString(),
    };
    
    messages.get(roomId).push(message);
    room.lastMessage = message;
    
    return message;
}

// Get messages
function getMessages(roomId, limit = 50, before = null) {
    let msgs = messages.get(roomId) || [];
    if (before) {
        const idx = msgs.findIndex(m => m.id === before);
        if (idx > 0) msgs = msgs.slice(0, idx);
    }
    return msgs.slice(-limit);
}

// Mark message as read
function markRead(roomId, messageId, userId) {
    const msgs = messages.get(roomId) || [];
    const msg = msgs.find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(userId)) {
        msg.readBy.push(userId);
        if (msg.readBy.length > 1) {
            msg.status = 'read';
        }
    }
    return msg;
}

// Typing indicator
function setTyping(roomId, userId, isTyping) {
    if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Map());
    const roomTyping = typingUsers.get(roomId);
    if (isTyping) {
        roomTyping.set(userId, Date.now());
    } else {
        roomTyping.delete(userId);
    }
}

// Get typing users
function getTypingUsers(roomId) {
    const roomTyping = typingUsers.get(roomId) || new Map();
    const now = Date.now();
    const typing = [];
    roomTyping.forEach((timestamp, userId) => {
        if (now - timestamp < 5000) { // 5 second timeout
            typing.push(userId);
        }
    });
    return typing;
}

// Get user rooms
function getUserRooms(userId) {
    const userRooms = [];
    rooms.forEach((room) => {
        if (room.participants.includes(userId)) {
            userRooms.push(room);
        }
    });
    return userRooms;
}

// Get room
function getRoom(roomId) {
    return rooms.get(roomId) || null;
}

// Update room
function updateRoom(roomId, data) {
    const room = rooms.get(roomId);
    if (!room) return null;
    Object.assign(room, data);
    return room;
}

// Delete room
function deleteRoom(roomId) {
    rooms.delete(roomId);
    messages.delete(roomId);
    typingUsers.delete(roomId);
}

// Search messages
function searchMessages(roomId, query) {
    const msgs = messages.get(roomId) || [];
    return msgs.filter(m => 
        m.content.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = {
    createRoom,
    sendMessage,
    getMessages,
    markRead,
    setTyping,
    getTypingUsers,
    getUserRooms,
    getRoom,
    updateRoom,
    deleteRoom,
    searchMessages,
};
