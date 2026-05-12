/**
 * @file ChatContext.jsx
 * @description Chat context — manages messaging, conversations, and SignalR real-time state.
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI) — aligned with user-centric ChatController + ChatHub
 * @last-modified-date 2026-04-29
 *
 * Backend API shape (user-centric, not conversation-centric):
 *   GET  api/chat/conversations          → ChatConversationDto[]
 *     { userId, userName, userProfilePicture, lastMessage, unreadCount }
 *   GET  api/chat/messages/{otherUserId} → ChatMessageDto[]
 *     { chatId, senderId, senderName, receiverId, content, isRead, createdAt }
 *   POST api/chat/messages               → { receiverId, content }
 *   PUT  api/chat/messages/{senderId}/read
 *
 * SignalR Hub: /hubs/chat
 *   Server→Client events: "ReceiveMessage", "UserTyping"
 **/

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import chatService from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext({});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    // activeConversation = a ChatConversationDto { userId, userName, userProfilePicture, ... }
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const hubRef = useRef(null);

    // ── SignalR Hub Management ────────────────────────────────────────────────

    const connectHub = useCallback(async () => {
        if (hubRef.current) return; // already connected
        try {
            const connection = await chatService.connectHub(
                // ReceiveMessage: append incoming message to state
                (senderId, message) => {
                    setMessages(prev => [...prev, message]);
                    // bump unread count in conversation list
                    setConversations(prev => prev.map(conv =>
                        conv.userId === senderId
                            ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1, lastMessage: message }
                            : conv
                    ));
                },
                // UserTyping indicator
                (senderId, isTyping) => {
                    setTypingUsers(prev => ({ ...prev, [senderId]: isTyping }));
                }
            );
            hubRef.current = connection;
        } catch (err) {
            console.error('[ChatContext] SignalR connect failed:', err);
        }
    }, []);

    const disconnectHub = useCallback(async () => {
        if (!hubRef.current) return;
        try {
            await chatService.disconnectHub();
        } catch {}
        hubRef.current = null;
    }, []);

    // Connect hub when user logs in, disconnect on logout
    useEffect(() => {
        if (user) {
            loadConversations();
            connectHub();
        } else {
            disconnectHub();
            setConversations([]);
            setActiveConversation(null);
            setMessages([]);
            setTypingUsers({});
        }
        return () => { disconnectHub(); };
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── REST API Methods ──────────────────────────────────────────────────────

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await chatService.getConversations();
            // data is ChatConversationDto[]
            setConversations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Select a conversation by otherUserId (user-centric API).
     * Fetches messages from GET api/chat/messages/{otherUserId}
     * and marks them as read via PUT api/chat/messages/{otherUserId}/read.
     */
    const selectConversation = useCallback(async (otherUserId) => {
        try {
            setLoading(true);
            // Find the conversation DTO from local state
            const conv = conversations.find(c => c.userId === otherUserId);
            setActiveConversation(conv || { userId: otherUserId });

            // Fetch messages with this user
            const data = await chatService.getMessages(otherUserId);
            setMessages(Array.isArray(data) ? data : []);

            // Mark as read
            await chatService.markAsRead(otherUserId);

            // Reset unread count in conversation list
            setConversations(prev => prev.map(c =>
                c.userId === otherUserId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (err) {
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [conversations]);

    /**
     * Send a message to the active conversation's user.
     * Uses SignalR hub if connected, falls back to REST.
     */
    const sendMessage = async (content) => {
        if (!activeConversation) return;
        const receiverId = activeConversation.userId;

        try {
            setError(null);
            let newMessage;

            if (hubRef.current) {
                // Real-time via SignalR
                await chatService.sendHubMessage(receiverId, content);
                // Optimistically add message (server will echo it back via ReceiveMessage)
                newMessage = {
                    chatId: Date.now(),
                    senderId: user?.id,
                    senderName: user?.name,
                    receiverId,
                    content,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                };
            } else {
                // Fallback to REST: POST api/chat/messages
                newMessage = await chatService.sendMessage(receiverId, content);
            }

            setMessages(prev => [...prev, newMessage]);
            setConversations(prev => prev.map(conv =>
                conv.userId === receiverId
                    ? { ...conv, lastMessage: newMessage }
                    : conv
            ));
            return newMessage;
        } catch (err) {
            setError(err.message || 'Failed to send message');
            throw err;
        }
    };

    /** Send typing indicator via hub */
    const sendTypingIndicator = async (isTyping) => {
        if (!activeConversation || !hubRef.current) return;
        try {
            await chatService.sendHubTyping(activeConversation.userId, isTyping);
        } catch {}
    };

    const deleteMessage = async (messageId) => {
        try {
            await chatService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => (msg.chatId || msg.id) !== messageId));
        } catch (err) {
            setError(err.message || 'Failed to delete message');
            throw err;
        }
    };

    const archiveConversation = async (otherUserId) => {
        try {
            await chatService.archiveConversation(otherUserId);
            setConversations(prev => prev.filter(conv => conv.userId !== otherUserId));
            if (activeConversation?.userId === otherUserId) {
                setActiveConversation(null);
                setMessages([]);
            }
        } catch (err) {
            setError(err.message || 'Failed to archive conversation');
            throw err;
        }
    };

    const searchMessages = async (query) => {
        try {
            return await chatService.searchMessages(query);
        } catch (err) {
            setError(err.message || 'Search failed');
            throw err;
        }
    };

    const blockUser = async (userId, reason) => {
        try {
            await chatService.blockUser(userId, reason);
        } catch (err) {
            setError(err.message || 'Failed to block user');
            throw err;
        }
    };

    /** Computed: is a specific user typing? */
    const isUserTyping = (userId) => !!typingUsers[userId];

    /** Total unread across all conversations */
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    const value = {
        conversations,
        activeConversation,
        messages,
        typingUsers,
        isUserTyping,
        totalUnread,
        loading,
        error,
        loadConversations,
        selectConversation,
        sendMessage,
        sendTypingIndicator,
        deleteMessage,
        archiveConversation,
        searchMessages,
        blockUser,
        setActiveConversation,
        setError,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;
