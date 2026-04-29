/**
 * @file ChatList.jsx
 * @description List of active conversations with search and filtering (FR-601.2)
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Plus, Search, Image, Paperclip } from "lucide-react";
import styles from "./ChatList.module.css";

/**
 * Chat list component displaying active conversations with search and filtering
 * @param {Object} props - Component props
 * @param {Array} props.conversations - Array of conversation objects
 * @param {string} props.activeConversationId - Currently active conversation ID
 * @param {Function} props.onSelectConversation - Callback when a conversation is selected
 * @param {Function} props.onSearch - Callback for search functionality
 * @returns {JSX.Element} Rendered chat list component
 */
const ChatList = ({ conversations, activeConversationId, onSelectConversation, onSearch }) => {
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
            const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase());

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

        switch (message.type) {
            case "image":
                return (
                    <span className={styles.iconPreview}>
                        <Image size={14} aria-hidden="true" /> Image
                    </span>
                );
            case "file":
                return (
                    <span className={styles.iconPreview}>
                        <Paperclip size={14} aria-hidden="true" /> Attachment
                    </span>
                );
            default:
                return message.text || "No messages";
        }
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
                            key={conv.id}
                            className={`${styles.item} ${activeConversationId === conv.id ? styles.active : ""} ${conv.unreadCount > 0 ? styles.unread : ""
                                }`}
                            onClick={() => onSelectConversation(conv.id)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => e.key === "Enter" && onSelectConversation(conv.id)}
                            aria-label={`Conversation with ${conv.name}, ${conv.unreadCount} unread messages, last message ${conv.lastMessage?.text || "none"}`}
                            aria-current={activeConversationId === conv.id ? "true" : "false"}
                        >
                            <div className={styles.avatarContainer}>
                                <img
                                    src={conv.avatar || "/default-avatar.png"}
                                    alt={`${conv.name} avatar`}
                                    className={styles.avatar}
                                    width="48"
                                    height="48"
                                    loading="lazy"
                                />
                                {conv.isOnline && (
                                    <span className={styles.onlineIndicator} aria-label="Online"></span>
                                )}
                            </div>

                            <div className={styles.info}>
                                <div className={styles.topRow}>
                                    <span className={styles.name}>{conv.name}</span>
                                    <time className={styles.time} dateTime={new Date(conv.lastMessage?.timestamp || Date.now()).toISOString()}>
                                        {conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : ""}
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
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string,
            isOnline: PropTypes.bool,
            isArchived: PropTypes.bool,
            unreadCount: PropTypes.number,
            lastMessage: PropTypes.shape({
                text: PropTypes.string,
                type: PropTypes.oneOf(["text", "image", "file"]),
                timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
            }),
        })
    ).isRequired,
    activeConversationId: PropTypes.string,
    onSelectConversation: PropTypes.func.isRequired,
    onSearch: PropTypes.func,
};

ChatList.defaultProps = {
    activeConversationId: null,
    onSearch: null,
};

export default ChatList;