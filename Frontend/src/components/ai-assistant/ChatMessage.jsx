/**
 * @file ChatMessage.jsx
 * @description Individual chat message component with support for text and suggestions
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React from "react";
import PropTypes from "prop-types";
import VoicePlayer from "./VoicePlayer";
import styles from "./ChatMessage.module.css";

/**
 * Chat message component for displaying individual messages
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object containing content and metadata
 * @param {Function} props.onSuggestionClick - Function to call when a suggestion is clicked
 * @returns {JSX.Element} Rendered chat message component
 */
const ChatMessage = ({ message, onSuggestionClick }) => {
    const { type, content, timestamp, isVoice, suggestions, isError } = message;
    const isAssistant = type === "assistant";

    /**
     * Formats timestamp to localized time string
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted time string
     */
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    /**
     * Handles suggestion button click
     * @param {string} suggestion - Selected suggestion text
     */
    const handleSuggestionClick = (suggestion) => {
        if (onSuggestionClick) {
            onSuggestionClick(suggestion);
        }
    };

    return (
        <div
            className={`${styles.wrapper} ${isAssistant ? styles.assistant : styles.user
                }`}
            role="listitem"
            aria-label={`${isAssistant ? "Assistant" : "User"} message`}
        >
            {isAssistant && (
                <div className={styles.avatar}>
                    <img
                        src="/MAESTA_chat_icon.png"
                        alt="AI Assistant"
                        width="36"
                        height="36"
                        loading="lazy"
                    />
                </div>
            )}

            <div className={styles.content}>
                <div
                    className={`${styles.bubble} ${isError ? styles.error : ""}`}
                    role={isError ? "alert" : "none"}
                >
                    <p className={styles.text}>{content}</p>

                    {isAssistant && !isError && (
                        <VoicePlayer text={content} aria-label="Play message audio" />
                    )}
                </div>

                {suggestions && suggestions.length > 0 && (
                    <div className={styles.suggestions} role="group" aria-label="Quick reply suggestions">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={`suggestion-${index}`}
                                className={styles.suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                aria-label={`Reply with: ${suggestion}`}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                <time
                    className={styles.timestamp}
                    dateTime={new Date(timestamp).toISOString()}
                >
                    {isVoice && "🎤 "}
                    {formatTime(timestamp)}
                </time>
            </div>
        </div>
    );
};

ChatMessage.propTypes = {
    message: PropTypes.shape({
        type: PropTypes.oneOf(["assistant", "user"]).isRequired,
        content: PropTypes.string.isRequired,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        isVoice: PropTypes.bool,
        suggestions: PropTypes.arrayOf(PropTypes.string),
        isError: PropTypes.bool,
    }).isRequired,
    onSuggestionClick: PropTypes.func,
};

ChatMessage.defaultProps = {
    onSuggestionClick: null,
};

export default ChatMessage;