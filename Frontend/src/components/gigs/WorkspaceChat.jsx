/**
 * @file WorkspaceChat.jsx
 * @description Real-time chat interface for gig workspaces with file attachments and responsive design
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-05
 */



import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Send, Paperclip, Search, File, User } from 'lucide-react';
import styles from './WorkspaceChat.module.css';

/**
 * Workspace chat component for real-time communication in gig collaborations.
 * @param {Object} props - Component props
 * @param {string|number} props.gigId - Unique identifier for the gig
 * @param {string|number} props.userId - Current user's unique identifier
 * @param {Array} props.participants - Array of chat participants
 * @param {Array} props.messages - Initial chat messages
 * @param {Function} props.onSendMessage - Callback function when a message is sent
 * @param {Function} props.onFileUpload - Callback function for file uploads
 * @returns {JSX.Element} Rendered chat interface component
 */
const WorkspaceChat = ({
    gigId,
    userId,
    participants = [],
    messages = [],
    onSendMessage,
    onFileUpload,
}) => {
    // State management with descriptive names
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [chatHistory, setChatHistory] = useState(messages);
    const [isUploading, setIsUploading] = useState(false);

    // Refs for DOM access
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    /**
     * Scrolls to the bottom of the chat when new messages are added
     */
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    /**
     * Syncs local chat history with incoming messages prop
     */
    useEffect(() => {
        setChatHistory(messages);
    }, [messages]);

    /**
     * Scrolls to bottom when chat history changes
     */
    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, scrollToBottom]);

    /**
     * Handles sending a new message
     * @returns {void}
     */
    const handleSend = () => {
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now().toString(),
            text: newMessage.trim(),
            senderId: userId,
            timestamp: new Date().toISOString(),
            attachments: [],
            status: 'sending',
        };

        // Optimistic UI update
        setChatHistory((prev) => [...prev, message]);
        onSendMessage(gigId, message);
        setNewMessage('');
    };

    /**
     * Handles file upload trigger
     * @returns {void}
     */
    const handleFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    /**
     * Handles file selection for upload
     * @param {React.ChangeEvent<HTMLInputElement>} event - File input change event
     */
    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0 || !onFileUpload) return;

        setIsUploading(true);
        try {
            await onFileUpload(gigId, files);
        } catch (error) {
            console.error('File upload failed:', error);
        } finally {
            setIsUploading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    /**
     * Handles keyboard shortcuts for message sending
     * @param {React.KeyboardEvent<HTMLTextAreaElement>} event - Keyboard event
     */
    const handleKeyPress = (event) => {
        // Send on Enter (without Shift)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    /**
     * Filters messages based on search term
     */
    const filteredMessages = chatHistory.filter((message) =>
        message.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * Gets participant name by ID
     * @param {string|number} id - Participant ID
     * @returns {string} Participant name or 'Unknown'
     */
    const getSenderName = (id) => {
        const participant = participants.find((p) => p.id === id);
        return participant ? participant.name : 'Unknown';
    };

    /**
     * Gets participant avatar or initials
     * @param {string|number} id - Participant ID
     * @returns {string} Avatar initials
     */
    const getAvatarInitials = (id) => {
        const participant = participants.find((p) => p.id === id);
        if (!participant) return '?';
        return participant.name.charAt(0).toUpperCase();
    };

    /**
     * Formats ISO timestamp to readable time
     * @param {string} isoString - ISO timestamp string
     * @returns {string} Formatted time (e.g., "14:30")
     */
    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={styles.container}>
            {/* Chat Header */}
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>Workspace Chat</h1>
                    <span className={styles.participantCount}>
                        <User size={14} className={styles.participantIcon} />
                        {participants.length} member{participants.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className={styles.headerActions}>
                    <div className={styles.searchContainer}>
                        <Search size={16} className={styles.searchIcon} aria-label="Search messages" />
                        <input
                            type="search"
                            className={styles.searchInput}
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search chat messages"
                        />
                    </div>
                </div>
            </header>

            {/* Messages List */}
            <div
                className={styles.messageList}
                ref={scrollRef}
                role="log"
                aria-label="Chat messages"
            >
                {filteredMessages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>
                            {searchTerm ? 'No messages match your search' : 'No messages yet'}
                        </p>
                    </div>
                ) : (
                    filteredMessages.map((message) => {
                        const isOwnMessage = message.senderId === userId;

                        return (
                            <article
                                key={message.id}
                                className={`${styles.messageRow} ${isOwnMessage ? styles.messageRowOwn : ''
                                    }`}
                                aria-label={`Message from ${getSenderName(message.senderId)}`}
                            >
                                {/* Avatar for others' messages */}
                                {!isOwnMessage && (
                                    <div className={styles.avatar} aria-hidden="true">
                                        {getAvatarInitials(message.senderId)}
                                    </div>
                                )}

                                <div className={styles.messageContent}>
                                    {/* Sender name for others' messages */}
                                    {!isOwnMessage && (
                                        <span className={styles.senderName}>
                                            {getSenderName(message.senderId)}
                                        </span>
                                    )}

                                    {/* Message bubble */}
                                    <div
                                        className={`${styles.messageBubble} ${isOwnMessage ? styles.messageBubbleOwn : ''
                                            }`}
                                    >
                                        <p className={styles.messageText}>{message.text}</p>

                                        {/* File attachments */}
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className={styles.attachments}>
                                                {message.attachments.map((attachment) => (
                                                    <div key={attachment.id} className={styles.attachment}>
                                                        <File size={14} className={styles.attachmentIcon} />
                                                        <span className={styles.attachmentName}>
                                                            {attachment.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamp and status */}
                                    <div className={styles.messageMeta}>
                                        <time className={styles.timestamp} dateTime={message.timestamp}>
                                            {formatTime(message.timestamp)}
                                        </time>
                                        {isOwnMessage && message.status && (
                                            <span className={`${styles.status} ${styles[message.status]}`}>
                                                {message.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {/* Message Input Area */}
            <div className={styles.inputArea}>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.fileInput}
                    onChange={handleFileChange}
                    multiple
                    aria-label="Attach files"
                />

                {/* File upload button */}
                <button
                    type="button"
                    className={styles.attachButton}
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    aria-label="Attach file"
                    title="Attach file"
                >
                    {isUploading ? (
                        <span className={styles.uploadingSpinner} aria-label="Uploading..." />
                    ) : (
                        <Paperclip size={20} aria-hidden="true" />
                    )}
                </button>

                {/* Message input */}
                <div className={styles.inputContainer}>
                    <textarea
                        className={styles.messageInput}
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        aria-label="Message input"
                        disabled={isUploading}
                    />
                    <div className={styles.inputHint}>
                        Press Enter to send, Shift+Enter for new line
                    </div>
                </div>

                {/* Send button */}
                <button
                    type="button"
                    className={styles.sendButton}
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isUploading}
                    aria-label="Send message"
                    title="Send message"
                >
                    <Send size={20} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

WorkspaceChat.propTypes = {
    gigId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string,
        })
    ),
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            text: PropTypes.string.isRequired,
            senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            timestamp: PropTypes.string.isRequired,
            attachments: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string,
                    name: PropTypes.string,
                    url: PropTypes.string,
                    type: PropTypes.string,
                })
            ),
            status: PropTypes.oneOf(['sent', 'delivered', 'read', 'sending', 'error']),
        })
    ),
    onSendMessage: PropTypes.func.isRequired,
    onFileUpload: PropTypes.func,
};

WorkspaceChat.defaultProps = {
    participants: [],
    messages: [],
    onFileUpload: null,
};

export default WorkspaceChat;