/**
 * @file ChatWindow.jsx
 * @description AI Assistant chat window component (FR-201.2)
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Settings, Trash2, X, FileText, Search, Lightbulb } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import AssistantSettings from "./AssistantSettings";
import aiAssistantService from "../../services/aiAssistantService";
import styles from "./ChatWindow.module.css";

/**
 * AI Assistant chat window component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the chat window is open
 * @param {Function} props.onClose - Function to close the chat window
 * @returns {JSX.Element} Rendered chat window component
 */
const ChatWindow = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "assistant",
            content: "Hello! I'm the MAESTA platform smart assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    /**
     * Scrolls to the bottom of the messages container
     */
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    /**
     * Scrolls to bottom when messages change
     */
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    /**
     * Sends a message to the AI assistant
     * @async
     * @param {string} text - Message text to send
     * @param {boolean} isVoice - Whether the message is from voice input
     * @returns {Promise<void>}
     */
    const handleSendMessage = async (text, isVoice = false) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: "user",
            content: text,
            timestamp: new Date(),
            isVoice,
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            // Send to AI service
            const response = await aiAssistantService.sendChatMessage(text, conversationId);

            // Update conversation ID if new
            if (response.conversationId) {
                setConversationId(response.conversationId);
            }

            // Add assistant response
            const assistantMessage = {
                id: Date.now() + 1,
                type: "assistant",
                content: response.response || response.message,
                timestamp: new Date(),
                suggestions: response.suggestions,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                type: "assistant",
                content: "Sorry, an error occurred while processing your request. Please try again.",
                timestamp: new Date(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    /**
     * Handles suggestion click from chat messages
     * @param {string} suggestion - Suggestion text to send
     */
    const handleSuggestionClick = useCallback((suggestion) => {
        handleSendMessage(suggestion);
    }, [handleSendMessage]);

    /**
     * Clears the chat conversation
     */
    const handleClearChat = () => {
        setMessages([
            {
                id: Date.now(),
                type: "assistant",
                content: "Chat cleared. How can I help you?",
                timestamp: new Date(),
            },
        ]);
        setConversationId(null);
    };

    /**
     * Handles quick action button clicks
     * @param {string} action - Action type
     */
    const handleQuickAction = (action) => {
        const actionMessages = {
            resume: "Help me build my resume",
            jobs: "Search for suitable jobs for me",
            tips: "Interview tips",
        };
        handleSendMessage(actionMessages[action]);
    };

    // Handle escape key to close chat
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscapeKey);
        return () => document.removeEventListener("keydown", handleEscapeKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.window} role="dialog" aria-label="AI Assistant Chat">
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <img
                        src="/MAESTA_chat_icon.png"
                        alt="AI Assistant"
                        className={styles.headerIcon}
                        width="40"
                        height="40"
                    />
                    <div>
                        <h3 className={styles.headerTitle}>Smart Assistant</h3>
                        <span className={styles.status} aria-live="polite">
                            {isTyping ? "Typing..." : "Online"}
                        </span>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.iconButton}
                        onClick={() => setShowSettings(!showSettings)}
                        title="Settings"
                        aria-label="Open settings"
                    >
                        <Settings size={18} aria-hidden="true" />
                    </button>
                    <button
                        className={styles.iconButton}
                        onClick={handleClearChat}
                        title="Clear chat"
                        aria-label="Clear chat conversation"
                    >
                        <Trash2 size={18} aria-hidden="true" />
                    </button>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        title="Close chat"
                        aria-label="Close chat window"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>
            </header>

            {showSettings && (
                <AssistantSettings onClose={() => setShowSettings(false)} />
            )}

            <div className={styles.messages} role="log" aria-live="polite" aria-relevant="additions">
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        onSuggestionClick={handleSuggestionClick}
                    />
                ))}

                {isTyping && (
                    <div className={styles.typing} aria-label="Assistant is typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            <div className={styles.quickActions} role="group" aria-label="Quick actions">
                <button
                    onClick={() => handleQuickAction("resume")}
                    aria-label="Build resume"
                >
                    <FileText size={16} aria-hidden="true" /> Build Resume
                </button>
                <button
                    onClick={() => handleQuickAction("jobs")}
                    aria-label="Search jobs"
                >
                    <Search size={16} aria-hidden="true" /> Job Search
                </button>
                <button
                    onClick={() => handleQuickAction("tips")}
                    aria-label="Interview tips"
                >
                    <Lightbulb size={16} aria-hidden="true" /> Interview Tips
                </button>
            </div>

            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
    );
};

ChatWindow.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ChatWindow;