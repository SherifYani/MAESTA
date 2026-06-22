/**
 * @file ChatPage.jsx
 * @description Chat page wrapper component with context providers
 * @author Sherif Talaat
 * @date 2026-02-07
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 * 
 * @requires ../components/chat/ChatInterface
 * @requires ../context/ChatContext
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatProvider, useChat } from '../../context/ChatContext';
import ChatInterface from '../../components/chat/ChatInterface';
import { PageContainer } from '../../components/layout';
import styles from './ChatPage.module.css';

/**
 * Chat page content component
 * @returns {JSX.Element} Rendered chat page content
 */
const ChatPageContent = () => {
    const { userId } = useParams();
    const { selectConversation } = useChat();

    // Select conversation from URL parameter if provided
    useEffect(() => {
        if (userId) {
            selectConversation(userId);
        }
    }, [userId, selectConversation]);

    return (
        <PageContainer className={styles.container} size="full">
            <ChatInterface />
        </PageContainer>
    );
};

/**
 * Chat page component with providers
 * @returns {JSX.Element} Rendered chat page
 */
const ChatPage = () => {
    return (
        <ChatProvider>
            <ChatPageContent />
        </ChatProvider>
    );
};

export default ChatPage;
