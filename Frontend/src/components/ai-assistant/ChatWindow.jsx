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
import { Settings, Trash2, X, FileText, Search, Lightbulb, BookOpen } from "lucide-react";
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
            content: "أهلاً! أنا مساعد MAESTA الذكي. اسألني عن المنصة، الوظائف، السيرة الذاتية، أو التحضير للمقابلات.",
            timestamp: new Date(),
            sourceType: "System",
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [conversationId, setConversationId] = useState(() => localStorage.getItem("maesta_chat_session_id") || null);
    const [useRag, setUseRag] = useState(() => localStorage.getItem("maesta_chat_use_rag") !== "false");
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
            const response = await aiAssistantService.sendChatMessage(text, conversationId, { useRag });

            if (response.conversationId) {
                setConversationId(response.conversationId);
                localStorage.setItem("maesta_chat_session_id", response.conversationId);
            }

            const assistantMessage = {
                id: Date.now() + 1,
                type: "assistant",
                content: response.answer || response.response || "No answer returned.",
                timestamp: new Date(),
                suggestions: response.suggestions,
                sourceType: response.sourceType,
                sources: response.sources,
                ragEnabled: response.ragEnabled,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                type: "assistant",
                content: error.message || "تعذر الاتصال بالشات بوت. تأكد أن Flask chatbot يعمل على localhost:5000 وأن API key مضبوط.",
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
                content: "تم مسح المحادثة. أقدر أساعدك في إيه؟",
                timestamp: new Date(),
                sourceType: "System",
            },
        ]);
        setConversationId(null);
        localStorage.removeItem("maesta_chat_session_id");
    };

    const handleToggleRag = () => {
        const nextValue = !useRag;
        setUseRag(nextValue);
        localStorage.setItem("maesta_chat_use_rag", String(nextValue));
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
                <AssistantSettings
                    onClose={() => setShowSettings(false)}
                    useRag={useRag}
                    onToggleRag={handleToggleRag}
                />
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
                    className={useRag ? styles.quickActionActive : ""}
                    onClick={handleToggleRag}
                    aria-label="Toggle document search"
                >
                    <BookOpen size={16} aria-hidden="true" /> {useRag ? "Documents On" : "Documents Off"}
                </button>
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
