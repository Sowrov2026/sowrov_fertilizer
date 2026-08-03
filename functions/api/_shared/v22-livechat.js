// V22 Live Chat System
// Cloudflare Pages ES Module

const rooms = new Map();
const messages = new Map();
const typingUsers = new Map();

function createRoom(participants, type = 'direct') {
    const idArr = new Uint8Array(16);
    crypto.getRandomValues(idArr);
    const room = {
        id: Array.from(idArr, b => b.toString(16).padStart(2, '0')).join(''),
        participants,
        type,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastMessage: null,
    };
    rooms.set(room.id, room);
    messages.set(room.id, []);
    return room;
}

function sendMessage(roomId, senderId, content) {
    const room = rooms.get(roomId);
    if (!room) return null;
    const idArr = new Uint8Array(16);
    crypto.getRandomValues(idArr);
    const message = {
        id: Array.from(idArr, b => b.toString(16).padStart(2, '0')).join(''),
        roomId,
        senderId,
        content: content.text || '',
        type: content.type || 'text',
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

function getMessages(roomId, limit = 50, before = null) {
    let msgs = messages.get(roomId) || [];
    if (before) {
        const idx = msgs.findIndex(m => m.id === before);
        if (idx > 0) msgs = msgs.slice(0, idx);
    }
    return msgs.slice(-limit);
}

function markRead(roomId, messageId, userId) {
    const msgs = messages.get(roomId) || [];
    const msg = msgs.find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(userId)) {
        msg.readBy.push(userId);
        if (msg.readBy.length > 1) msg.status = 'read';
    }
    return msg;
}

function setTyping(roomId, userId, isTyping) {
    if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Map());
    const roomTyping = typingUsers.get(roomId);
    if (isTyping) roomTyping.set(userId, Date.now());
    else roomTyping.delete(userId);
}

function getTypingUsers(roomId) {
    const roomTyping = typingUsers.get(roomId) || new Map();
    const now = Date.now();
    const typing = [];
    roomTyping.forEach((timestamp, userId) => {
        if (now - timestamp < 5000) typing.push(userId);
    });
    return typing;
}

function getUserRooms(userId) {
    const userRooms = [];
    rooms.forEach(room => { if (room.participants.includes(userId)) userRooms.push(room); });
    return userRooms;
}

function getRoom(roomId) { return rooms.get(roomId) || null; }
function updateRoom(roomId, data) {
    const room = rooms.get(roomId);
    if (!room) return null;
    Object.assign(room, data);
    return room;
}
function deleteRoom(roomId) { rooms.delete(roomId); messages.delete(roomId); typingUsers.delete(roomId); }
function searchMessages(roomId, query) {
    const msgs = messages.get(roomId) || [];
    return msgs.filter(m => m.content.toLowerCase().includes(query.toLowerCase()));
}

export { createRoom, sendMessage, getMessages, markRead, setTyping, getTypingUsers, getUserRooms, getRoom, updateRoom, deleteRoom, searchMessages };
