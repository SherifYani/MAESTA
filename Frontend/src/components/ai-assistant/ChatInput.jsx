/**
 * @file ChatInput.jsx
 * @description Chat input component with text and voice input support
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Send } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import styles from "./ChatInput.module.css";

/**
 * Chat input component with text and voice input support
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Function to call when sending a message
 * @param {boolean} props.disabled - Whether the input is disabled
 * @returns {JSX.Element} Rendered chat input component
 */
const ChatInput = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const inputRef = useRef(null);

    /**
     * Handles form submission
     * @param {Event} e - Form submit event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSendMessage(text, false);
            setText("");
        }
    };

    /**
     * Handles keydown events for the textarea
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    /**
     * Handles voice recording result
     * @param {string} transcript - Transcribed voice text
     */
    const handleVoiceResult = (transcript) => {
        if (transcript.trim()) {
            onSendMessage(transcript, true);
        }
        setIsRecording(false);
    };

    /**
     * Handles voice recording errors
     * @param {Error} error - Voice recording error
     */
    const handleVoiceError = (error) => {
        console.error("Voice recording error:", error);
        setIsRecording(false);
    };

    /**
     * Auto-resizes textarea based on content
     */
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            const newHeight = Math.min(inputRef.current.scrollHeight, 120);
            inputRef.current.style.height = `${newHeight}px`;
        }
    }, [text]);

    return (
        <form
            className={styles.container}
            onSubmit={handleSubmit}
            aria-label="Chat input"
        >
            <div className={styles.wrapper}>
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    disabled={disabled || isRecording}
                    rows={1}
                    className={styles.input}
                    aria-label="Chat message input"
                    aria-disabled={disabled || isRecording}
                    aria-describedby={disabled ? "chat-input-disabled" : undefined}
                />
                <div className={styles.actions}>
                    <VoiceRecorder
                        onResult={handleVoiceResult}
                        onError={handleVoiceError}
                        isRecording={isRecording}
                        setIsRecording={setIsRecording}
                        disabled={disabled}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={disabled || !text.trim() || isRecording}
                        aria-label="Send message"
                        aria-disabled={disabled || !text.trim() || isRecording}
                    >
                        <Send size={20} aria-hidden="true" />
                    </button>
                </div>
            </div>
            {disabled && (
                <div id="chat-input-disabled" className="visually-hidden">
                    Chat input is currently disabled
                </div>
            )}
        </form>
    );
};

ChatInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

ChatInput.defaultProps = {
    disabled: false,
};

export default ChatInput;