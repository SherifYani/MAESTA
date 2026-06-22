/**
 * @file ChatInterface.jsx
 * @description Main chat interface integrating conversation list, message history, and input (FR-601.1)
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 * @fix Aligned with user-centric ChatContext: selectConversation(userId), real DTO field names
 *      (userName, userProfilePicture, chatId). Wired sendTypingIndicator on keystroke.
 *      MessageBubble.isOwn now uses user.id from AuthContext instead of hardcoded string.
 *
 * @requires ./ChatList
 * @requires ./MessageBubble
 * @requires ./TypingIndicator
 * @requires ./ReadReceipt
 * @requires ./FileUploader
 * @requires ../../context/ChatContext
 * @requires ../../context/AuthContext
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, ArrowLeft } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatList from './ChatList';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import FileUploader from './FileUploader';
import styles from './ChatInterface.module.css';

/**
 * ChatInterface component - Main chat interface with conversations and messages
 * @returns {JSX.Element} Rendered chat interface
 */
const ChatInterface = () => {
    const {
        conversations = [],
        activeConversation,
        messages = [],
        loading,
        isUserTyping,
        selectConversation,
        sendMessage,
        sendTypingIndicator,
    } = useChat();
    const { user } = useAuth();

    const [messageInput, setMessageInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showMobileList, setShowMobileList] = useState(true);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    /**
     * Scroll to bottom of messages
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    /**
     * Handle conversation selection — pass the other user's ID (user-centric API)
     * @param {string} otherUserId - userId of the other participant
     */
    const handleSelectConversation = (otherUserId) => {
        selectConversation(otherUserId);
        setShowMobileList(false);
    };

    /**
     * Handle message send
     */
    const handleSendMessage = async () => {
        if (!messageInput.trim() && !selectedFile) return;
        if (!activeConversation) return;

        try {
            const attachmentText = selectedFile?.url ? `\n${selectedFile.url}` : '';
            await sendMessage(`${messageInput.trim()}${attachmentText}`.trim());
            setMessageInput('');
            setSelectedFile(null);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    /**
     * Handle key press in input
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    /**
     * Handle file selection
     * @param {Object} uploadedFile - Uploaded file metadata
     */
    const handleFileSelect = (uploadedFile) => {
        setSelectedFile(uploadedFile);
    };

    /**
     * Handle file remove
     */
    const handleFileRemove = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Handle back button on mobile
     */
    const handleBackToList = () => {
        setShowMobileList(true);
    };

    // Show typing indicator for the person we are chatting with
    const remoteIsTyping = activeConversation ? isUserTyping?.(activeConversation.userId) : false;

    return (
        <div className={styles.container}>
            {/* Conversations List */}
            <div className={`${styles.listPanel} ${showMobileList ? styles.showMobile : styles.hideMobile}`}>
                <ChatList
                    conversations={conversations}
                    activeConversationUserId={activeConversation?.userId}
                    onSelectConversation={handleSelectConversation}
                />
            </div>

            {/* Chat Area */}
            <div className={`${styles.chatPanel} ${!showMobileList ? styles.showMobile : styles.hideMobile}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <header className={styles.chatHeader}>
                            <button
                                className={styles.backButton}
                                onClick={handleBackToList}
                                aria-label="Back to conversations"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div className={styles.chatInfo}>
                                <img
                                    src={activeConversation.userProfilePicture || '/default-avatar.png'}
                                    alt={`${activeConversation.userName} avatar`}
                                    className={styles.avatar}
                                    width="40"
                                    height="40"
                                />
                                <div className={styles.details}>
                                    <h2 className={styles.name}>{activeConversation.userName}</h2>
                                </div>
                            </div>

                            <div className={styles.headerActions}>
                                {/* Additional header actions can go here */}
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className={styles.messagesContainer}>
                            <div className={styles.messagesList} role="list" aria-label="Messages">
                                {loading ? (
                                    <div className={styles.loadingState}>
                                        <p>Loading messages...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <MessageBubble
                                            key={message.chatId || message.id}
                                            message={message}
                                            isOwn={message.senderId === user?.id}
                                        />
                                    ))
                                )}

                                {remoteIsTyping && (
                                    <div className={styles.typingContainer}>
                                        <TypingIndicator />
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className={styles.inputContainer}>
                            {/* File Preview */}
                            {selectedFile && (
                                <div className={styles.filePreview}>
                                    <div className={styles.fileInfo}>
                                        <Paperclip size={16} />
                                        <span className={styles.fileName}>{selectedFile.name}</span>
                                    </div>
                                    <button
                                        className={styles.removeFile}
                                        onClick={handleFileRemove}
                                        aria-label="Remove file"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className={styles.inputWrapper}>
                                {/* File Upload Button */}
                                <label className={styles.attachButton} htmlFor="file-upload">
                                    <Paperclip size={20} />
                                    <span className="sr-only">Attach file</span>
                                </label>
                                <FileUploader
                                    onUpload={handleFileSelect}
                                    disabled={loading}
                                />

                                {/* Text Input */}
                                <textarea
                                    className={styles.messageInput}
                                    value={messageInput}
                                    onChange={(e) => {
                                        setMessageInput(e.target.value);
                                        // Notify remote user we are typing
                                        sendTypingIndicator?.(e.target.value.length > 0);
                                    }}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    rows={1}
                                    aria-label="Message input"
                                />

                                {/* Send Button */}
                                <button
                                    className={styles.sendButton}
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim() && !selectedFile}
                                    aria-label="Send message"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.noConversation}>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
