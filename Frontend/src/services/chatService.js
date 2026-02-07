/**
 * @file chatService.js
 * @description Chat/messaging services - handles conversations, messages, and real-time communication
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';

const chatService = {
    // ==================== Conversations ====================

    // Get all conversations
    getConversations: async () => {
        try {
            const response = await ApiService.get('/api/chat/conversations');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get conversation by ID
    getConversationById: async (conversationId) => {
        try {
            const response = await ApiService.get(`/api/chat/conversations/${conversationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Start new conversation
    startConversation: async (recipientId, initialMessage = null) => {
        try {
            const response = await ApiService.post('/api/chat/conversations', {
                recipientId,
                message: initialMessage
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete conversation
    deleteConversation: async (conversationId) => {
        try {
            const response = await ApiService.delete(`/api/chat/conversations/${conversationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Archive conversation
    archiveConversation: async (conversationId) => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${conversationId}/archive`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Unarchive conversation
    unarchiveConversation: async (conversationId) => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${conversationId}/unarchive`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get archived conversations
    getArchivedConversations: async () => {
        try {
            const response = await ApiService.get('/api/chat/conversations/archived');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Messages ====================

    // Get messages in conversation
    getMessages: async (conversationId, page = 1, limit = 50) => {
        try {
            const response = await ApiService.get(
                `/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Send message
    sendMessage: async (conversationId, messageData) => {
        try {
            const response = await ApiService.post(
                `/api/chat/conversations/${conversationId}/messages`,
                messageData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Send message with attachment
    sendMessageWithAttachment: async (conversationId, message, file) => {
        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('attachment', file);

            const response = await ApiService.post(
                `/api/chat/conversations/${conversationId}/messages`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Edit message
    editMessage: async (messageId, newContent) => {
        try {
            const response = await ApiService.put(`/api/chat/messages/${messageId}`, {
                content: newContent
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete message
    deleteMessage: async (messageId) => {
        try {
            const response = await ApiService.delete(`/api/chat/messages/${messageId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark message as read
    markAsRead: async (conversationId) => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${conversationId}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Typing Indicators ====================

    // Send typing indicator
    sendTypingIndicator: async (conversationId) => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${conversationId}/typing`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Search ====================

    // Search messages
    searchMessages: async (query) => {
        try {
            const response = await ApiService.get(`/api/chat/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Search within conversation
    searchInConversation: async (conversationId, query) => {
        try {
            const response = await ApiService.get(
                `/api/chat/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Blocking ====================

    // Block user
    blockUser: async (userId) => {
        try {
            const response = await ApiService.post(`/api/chat/block/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Unblock user
    unblockUser: async (userId) => {
        try {
            const response = await ApiService.delete(`/api/chat/block/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get blocked users
    getBlockedUsers: async () => {
        try {
            const response = await ApiService.get('/api/chat/blocked');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Unread Count ====================

    // Get unread messages count
    getUnreadCount: async () => {
        try {
            const response = await ApiService.get('/api/chat/unread-count');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Report ====================

    // Report message
    reportMessage: async (messageId, reason) => {
        try {
            const response = await ApiService.post(`/api/chat/messages/${messageId}/report`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Report conversation
    reportConversation: async (conversationId, reason) => {
        try {
            const response = await ApiService.post(`/api/chat/conversations/${conversationId}/report`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default chatService;
