/**
 * @file chatService.js
 * @description Chat/messaging services — REST calls verified against ChatController.cs and SignalR ChatHub.cs.
 *              Falls back to mock data when the backend is unavailable.
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2026-04-29
 *
 * REAL REST ROUTES (ChatController [Route("api/[controller]")]):
 *   GET    api/chat/conversations               → get all my conversations
 *   GET    api/chat/messages/{otherUserId}       → get messages with a user
 *   POST   api/chat/messages                    → send message { receiverId, content, ... }
 *   PUT    api/chat/messages/{senderId}/read     → mark messages from sender as read
 *   DELETE api/chat/messages/{messageId}        → delete a message
 *   POST   api/chat/block                       → { userId, reason? }
 *   POST   api/chat/conversations/{otherUserId}/report  → { reason, details? }
 *   GET    api/chat/search?q=                   → search messages
 *   POST   api/chat/conversations/{otherUserId}/archive
 *   POST   api/chat/conversations/{otherUserId}/unarchive
 *   POST   api/chat/conversations/{otherUserId}/typing?isTyping=bool
 *
 * SIGNALR HUB: /hubs/chat
 *   Connect with ?access_token=<JWT>
 *   Client → Server: SendMessage(receiverId, message)
 *   Client → Server: SendTypingIndicator(receiverId, isTyping)
 *   Server → Client: "ReceiveMessage" (senderId, message)
 *   Server → Client: "UserTyping" (senderId, isTyping)
 */

import ApiService from './ApiService';
import { tokenService } from '../lib/token-service';
import { isNetworkError, MOCK_CONVERSATIONS, MOCK_MESSAGES } from './mockData';

// ─── SignalR Hub Connection ───────────────────────────────────────────────────
// Lazy-loaded to avoid loading @microsoft/signalr at app startup
let hubConnection = null;

/**
 * Build and start the SignalR chat hub connection.
 * Returns the active HubConnection instance.
 */
const getHubConnection = async () => {
    if (hubConnection) return hubConnection;

    // Dynamically import to code-split SignalR library
    const { HubConnectionBuilder, LogLevel } = await import('@microsoft/signalr');

    const token = tokenService.getToken();
    const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5024';

    hubConnection = new HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/chat`, {
            // Pass JWT via query string (backend supports this via OnMessageReceived event)
            accessTokenFactory: () => token || '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

    await hubConnection.start();
    return hubConnection;
};

/**
 * Stop and destroy the hub connection (call on logout).
 */
const disconnectHub = async () => {
    if (hubConnection) {
        await hubConnection.stop();
        hubConnection = null;
    }
};

// ─── REST API Methods ─────────────────────────────────────────────────────────
const chatService = {

    // ─── Conversations ────────────────────────────────────────────────────────

    /**
     * Get all conversations for the current user.
     */
    getConversations: async () => {
        try {
            const response = await ApiService.get('/api/chat/conversations');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] getConversations — mock fallback');
                return MOCK_CONVERSATIONS;
            }
            throw error;
        }
    },

    /**
     * Get chat messages exchanged with a specific user.
     * @param {number} otherUserId
     */
    getMessages: async (otherUserId) => {
        try {
            const response = await ApiService.get(`/api/chat/messages/${otherUserId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] getMessages — mock fallback');
                return MOCK_MESSAGES;
            }
            throw error;
        }
    },

    /**
     * Send a message to a user.
     * Backend expects a SendMessageRequest DTO.
     * @param {Object} messageData - { receiverId, content, attachmentUrl? }
     */
    sendMessage: async (messageData) => {
        try {
            const response = await ApiService.post('/api/chat/messages', messageData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] sendMessage — mock fallback');
                return {
                    id: `msg-mock-${Date.now()}`,
                    ...messageData,
                    sentAt: new Date().toISOString(),
                    isOwn: true,
                };
            }
            throw error;
        }
    },

    sendMessageToUser: async (receiverId, content) => {
        try {
            const response = await ApiService.post('/api/chat/messages', { receiverId, content });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] sendMessageToUser — mock fallback');
                return {
                    id: `msg-mock-${Date.now()}`,
                    receiverId,
                    content,
                    sentAt: new Date().toISOString(),
                    isOwn: true,
                };
            }
            throw error;
        }
    },

    /**
     * Mark all messages from a sender as read.
     * @param {number} senderId
     */
    markMessagesAsRead: async (senderId) => {
        try {
            const response = await ApiService.put(`/api/chat/messages/${senderId}/read`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] markMessagesAsRead — mock fallback');
                return { message: 'Messages marked as read (mock).' };
            }
            throw error;
        }
    },

    markAsRead: async (senderId) => {
        try {
            const response = await ApiService.put(`/api/chat/messages/${senderId}/read`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] markAsRead — mock fallback');
                return { message: 'Messages marked as read (mock).' };
            }
            throw error;
        }
    },

    /**
     * Delete a message by ID.
     * @param {number} messageId
     */
    deleteMessage: async (messageId) => {
        try {
            const response = await ApiService.delete(`/api/chat/messages/${messageId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] deleteMessage — mock fallback');
                return { message: 'Message deleted (mock).' };
            }
            throw error;
        }
    },

    // ─── Conversation Management ──────────────────────────────────────────────

    /**
     * Archive a conversation with another user.
     * @param {number} otherUserId
     */
    archiveConversation: async (otherUserId) => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${otherUserId}/archive`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] archiveConversation — mock fallback');
                return { message: 'Conversation archived (mock).' };
            }
            throw error;
        }
    },

    /**
     * Unarchive a conversation with another user.
     * @param {number} otherUserId
     */
    unarchiveConversation: async (otherUserId) => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${otherUserId}/unarchive`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] unarchiveConversation — mock fallback');
                return { message: 'Conversation unarchived (mock).' };
            }
            throw error;
        }
    },

    /**
     * Report a conversation.
     * @param {number} otherUserId
     * @param {string} reason
     * @param {string} [details]
     */
    reportConversation: async (otherUserId, reason, details = '') => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${otherUserId}/report`, { reason, details });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] reportConversation — mock fallback');
                return { message: 'Conversation reported (mock).' };
            }
            throw error;
        }
    },

    /**
     * Update typing status in a conversation.
     * @param {number} otherUserId
     * @param {boolean} isTyping
     */
    sendTypingIndicator: async (otherUserId, isTyping) => {
        try {
            const response = await ApiService.post(
                `/api/chat/conversations/${otherUserId}/typing`,
                {},
                { params: { isTyping } }
            );
            return response.data;
        } catch {
            // Swallow errors silently — typing indicators are best-effort
        }
    },

    // ─── Search ───────────────────────────────────────────────────────────────

    /**
     * Search across all messages.
     * @param {string} query
     */
    searchMessages: async (query) => {
        try {
            const response = await ApiService.get('/api/chat/search', { params: { q: query } });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] searchMessages — mock fallback');
                const lc = query.toLowerCase();
                return MOCK_MESSAGES.filter(m => m.content.toLowerCase().includes(lc));
            }
            throw error;
        }
    },

    // ─── Blocking ─────────────────────────────────────────────────────────────

    /**
     * Block a user.
     * @param {number} userId
     * @param {string} [reason]
     */
    blockUser: async (userId, reason = '') => {
        try {
            const response = await ApiService.post('/api/chat/block', { userId, reason });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] blockUser — mock fallback');
                return { message: 'User blocked (mock).' };
            }
            throw error;
        }
    },

    /**
     * Get list of users blocked by the current user.
     * @returns {Promise<Array>} - Array of blocked users with their details
     */
    getBlockedUsers: async () => {
        try {
            const response = await ApiService.get('/api/chat/blocked');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[chatService] getBlockedUsers — mock fallback');
                return [];
            }
            throw error;
        }
    },

    // ─── SignalR Real-Time ─────────────────────────────────────────────────────

    /**
     * Connect to the SignalR chat hub and register event handlers.
     * When the backend is offline this will gracefully fail and the app
     * continues in mock/offline mode.
     * @param {Function} onMessage   - called when a new message arrives: (senderId, message) => void
     * @param {Function} onTyping    - called on typing indicator: (senderId, isTyping) => void
     */
    connectHub: async (onMessage, onTyping) => {
        try {
            const hub = await getHubConnection();
            hub.on('ReceiveMessage', onMessage);
            hub.on('UserTyping', onTyping);
            return hub;
        } catch (error) {
            console.warn('[chatService] connectHub — backend unavailable, real-time chat disabled.');
            return null;
        }
    },

    /**
     * Send a real-time message via SignalR (bypasses REST for instant delivery).
     * @param {string} receiverId
     * @param {string} message
     */
    sendHubMessage: async (receiverId, message) => {
        try {
            const hub = await getHubConnection();
            await hub.invoke('SendMessage', String(receiverId), message);
        } catch (error) {
            console.warn('[chatService] sendHubMessage — hub unavailable (mock mode).');
        }
    },

    /**
     * Send a real-time typing indicator via SignalR.
     * @param {string} receiverId
     * @param {boolean} isTyping
     */
    sendHubTyping: async (receiverId, isTyping) => {
        try {
            const hub = await getHubConnection();
            await hub.invoke('SendTypingIndicator', String(receiverId), isTyping);
        } catch {
            // Swallow silently — typing indicator is best-effort
        }
    },

    /**
     * Disconnect from the SignalR hub (call on logout).
     */
    disconnectHub,
};

export default chatService;
