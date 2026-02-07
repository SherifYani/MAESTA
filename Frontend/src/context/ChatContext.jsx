/**
 * @file ChatContext.jsx
 * @description Chat context - manages messaging and conversation state globally
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext({});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load conversations when user is authenticated
    useEffect(() => {
        if (user) {
            loadConversations();
            loadUnreadCount();
        } else {
            setConversations([]);
            setActiveConversation(null);
            setMessages([]);
            setUnreadCount(0);
        }
    }, [user]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (err) {
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const data = await chatService.getUnreadCount();
            setUnreadCount(data.count || 0);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    };

    const selectConversation = useCallback(async (conversationId) => {
        try {
            setLoading(true);
            const conversation = await chatService.getConversationById(conversationId);
            setActiveConversation(conversation);

            const messagesData = await chatService.getMessages(conversationId);
            setMessages(messagesData);

            // Mark as read
            await chatService.markAsRead(conversationId);
            loadUnreadCount();
        } catch (err) {
            setError(err.message || 'Failed to load conversation');
        } finally {
            setLoading(false);
        }
    }, []);

    const startConversation = async (recipientId, initialMessage = null) => {
        try {
            setError(null);
            const conversation = await chatService.startConversation(recipientId, initialMessage);
            setConversations(prev => [conversation, ...prev]);
            setActiveConversation(conversation);
            return conversation;
        } catch (err) {
            setError(err.message || 'Failed to start conversation');
            throw err;
        }
    };

    const sendMessage = async (content, attachment = null) => {
        if (!activeConversation) return;

        try {
            setError(null);
            let newMessage;

            if (attachment) {
                newMessage = await chatService.sendMessageWithAttachment(
                    activeConversation.id,
                    content,
                    attachment
                );
            } else {
                newMessage = await chatService.sendMessage(activeConversation.id, { content });
            }

            setMessages(prev => [...prev, newMessage]);

            // Update conversation in list
            setConversations(prev => prev.map(conv =>
                conv.id === activeConversation.id
                    ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
                    : conv
            ));

            return newMessage;
        } catch (err) {
            setError(err.message || 'Failed to send message');
            throw err;
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await chatService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (err) {
            setError(err.message || 'Failed to delete message');
            throw err;
        }
    };

    const archiveConversation = async (conversationId) => {
        try {
            await chatService.archiveConversation(conversationId);
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));
            if (activeConversation?.id === conversationId) {
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

    const blockUser = async (userId) => {
        try {
            await chatService.blockUser(userId);
        } catch (err) {
            setError(err.message || 'Failed to block user');
            throw err;
        }
    };

    const value = {
        conversations,
        activeConversation,
        messages,
        unreadCount,
        loading,
        error,
        loadConversations,
        selectConversation,
        startConversation,
        sendMessage,
        deleteMessage,
        archiveConversation,
        searchMessages,
        blockUser,
        setActiveConversation,
        setError
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;
