/**
 * @file ChatList.jsx
 * @description List of active conversations with search and filtering (FR-601.2)
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 * @fix Aligned with real ChatConversationDto fields: userId, userName, userProfilePicture,
 *      lastMessage.content, lastMessage.createdAt. Prop renamed to activeConversationUserId.
 */



import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Plus, Search, Image, Paperclip } from "lucide-react";
import styles from "./ChatList.module.css";

/**
 * Chat list component displaying active conversations with search and filtering
 * @param {Object} props - Component props
 * @param {Array} props.conversations - Array of ChatConversationDto objects
 * @param {string} props.activeConversationUserId - Currently active conversation's user ID
 * @param {Function} props.onSelectConversation - Callback receiving otherUserId when selected
 * @param {Function} props.onSearch - Callback for search functionality
 * @returns {JSX.Element} Rendered chat list component
 */
const ChatList = ({ conversations, activeConversationUserId, onSelectConversation, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all"); // 'all', 'unread', 'archived'

    /**
     * Handles search input changes
     * @param {Event} e - Input change event
     */
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) {
            onSearch(value);
        }
    }, [onSearch]);

    /**
     * Applies filters to conversation list
     * @returns {Array} Filtered conversations
     */
    const getFilteredConversations = useCallback(() => {
        return conversations.filter((conv) => {
            // Use real DTO fields: userName, lastMessage.content
            const name = conv.userName || conv.name || '';
            const lastText = conv.lastMessage?.content || conv.lastMessage?.text || '';
            const matchesSearch =
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lastText.toLowerCase().includes(searchTerm.toLowerCase());

            if (filter === "unread") return matchesSearch && conv.unreadCount > 0;
            if (filter === "archived") return matchesSearch && conv.isArchived;
            return matchesSearch && !conv.isArchived;
        });
    }, [conversations, searchTerm, filter]);

    /**
     * Formats timestamp to localized time string
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted time string
     */
    const formatTime = useCallback((date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }, []);

    /**
     * Renders message preview based on message type
     * @param {Object} message - Message object
     * @returns {JSX.Element} Message preview element
     */
    const renderMessagePreview = useCallback((message) => {
        if (!message) return "No messages";
        // Real DTO has 'content' field, not 'text'
        return message.content || message.text || "No messages";
    }, []);

    const filteredConversations = getFilteredConversations();

    return (
        <div className={styles.container} role="complementary" aria-label="Conversations list">
            <header className={styles.header}>
                <h2 className={styles.title}>Conversations</h2>
                <div className={styles.actions}>
                    <button
                        className={styles.newChatButton}
                        title="New conversation"
                        aria-label="Start new conversation"
                    >
                        <Plus size={20} aria-hidden="true" />
                    </button>
                </div>
            </header>

            <div className={styles.search}>
                <span className={styles.searchIcon} aria-hidden="true">
                    <Search size={18} />
                </span>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                    aria-label="Search conversations"
                />
            </div>

            <div className={styles.filters} role="tablist" aria-label="Conversation filters">
                <button
                    className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
                    onClick={() => setFilter("all")}
                    role="tab"
                    aria-selected={filter === "all"}
                    aria-controls="conversations-list"
                >
                    All
                </button>
                <button
                    className={`${styles.filterButton} ${filter === "unread" ? styles.active : ""}`}
                    onClick={() => setFilter("unread")}
                    role="tab"
                    aria-selected={filter === "unread"}
                    aria-controls="conversations-list"
                >
                    Unread
                </button>
                <button
                    className={`${styles.filterButton} ${filter === "archived" ? styles.active : ""}`}
                    onClick={() => setFilter("archived")}
                    role="tab"
                    aria-selected={filter === "archived"}
                    aria-controls="conversations-list"
                >
                    Archived
                </button>
            </div>

            <div
                className={styles.list}
                id="conversations-list"
                role="tabpanel"
                aria-label="Filtered conversations"
            >
                {filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv.userId || conv.id}
                            className={`${styles.item} ${activeConversationUserId === conv.userId ? styles.active : ""} ${conv.unreadCount > 0 ? styles.unread : ""
                                }`}
                            onClick={() => onSelectConversation(conv.userId || conv.id)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => e.key === "Enter" && onSelectConversation(conv.userId || conv.id)}
                            aria-label={`Conversation with ${conv.userName || conv.name}, ${conv.unreadCount || 0} unread messages`}
                            aria-current={activeConversationUserId === conv.userId ? "true" : "false"}
                        >
                            <div className={styles.avatarContainer}>
                                <img
                                    src={conv.userProfilePicture || conv.avatar || "/default-avatar.png"}
                                    alt={`${conv.userName || conv.name} avatar`}
                                    className={styles.avatar}
                                    width="48"
                                    height="48"
                                    loading="lazy"
                                />
                            </div>

                            <div className={styles.info}>
                                <div className={styles.topRow}>
                                    <span className={styles.name}>{conv.userName || conv.name}</span>
                                    <time className={styles.time} dateTime={new Date(conv.lastMessage?.createdAt || Date.now()).toISOString()}>
                                        {conv.lastMessage ? formatTime(conv.lastMessage.createdAt || conv.lastMessage.timestamp) : ""}
                                    </time>
                                </div>

                                <div className={styles.bottomRow}>
                                    <p className={styles.preview}>
                                        {renderMessagePreview(conv.lastMessage)}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className={styles.unreadBadge} aria-label={`${conv.unreadCount} unread messages`}>
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <p>No conversations found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

ChatList.propTypes = {
    conversations: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,      // ChatConversationDto.userId
            userName: PropTypes.string.isRequired,     // ChatConversationDto.userName
            userProfilePicture: PropTypes.string,      // ChatConversationDto.userProfilePicture
            unreadCount: PropTypes.number,
            lastMessage: PropTypes.shape({
                content: PropTypes.string,             // ChatMessageDto.content
                createdAt: PropTypes.string,           // ChatMessageDto.createdAt
            }),
        })
    ).isRequired,
    activeConversationUserId: PropTypes.string,
    onSelectConversation: PropTypes.func.isRequired,
    onSearch: PropTypes.func,
};

ChatList.defaultProps = {
    activeConversationUserId: null,
    onSearch: null,
};

export default ChatList;