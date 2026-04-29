/**
 * @file FloatingAssistantIcon.jsx
 * @description Floating AI assistant icon button that opens the chat window (FR-201.1)
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./FloatingAssistantIcon.module.css";

/**
 * Floating AI assistant icon button component
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Function to call when the button is clicked
 * @param {boolean} props.isOpen - Whether the chat window is open
 * @param {boolean} props.hasUnreadMessages - Whether there are unread messages
 * @returns {JSX.Element} Rendered floating icon component
 */
const FloatingAssistantIcon = ({ onClick, isOpen, hasUnreadMessages = false }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [theme, setTheme] = useState("light");

    /**
     * Detects the current theme from the document
     */
    const checkTheme = useCallback(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "dark" : "light");
    }, []);

    /**
     * Initializes theme detection and sets up observers
     */
    useEffect(() => {
        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, [checkTheme]);

    /**
     * Handles button click with animation
     */
    const handleClick = () => {
        setIsAnimating(true);
        onClick?.();
        setTimeout(() => setIsAnimating(false), 300);
    };

    /**
     * Determines icon source based on theme
     * @returns {string} Icon image source
     */
    const getIconSource = () => {
        return theme === "dark"
            ? "/MAESTA_chat_icon.png"
            : "/MAESTA_chat_icon.png"; // Using same icon for both themes as specified
    };

    return (
        <button
            className={`${styles.button} ${isOpen ? styles.open : ""} ${isAnimating ? styles.animating : ""
                }`}
            onClick={handleClick}
            aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
            aria-expanded={isOpen}
            aria-controls="chat-window"
        >
            {isOpen ? (
                <span className={styles.closeIcon} aria-hidden="true">
                    ×
                </span>
            ) : (
                <>
                    <img
                        src={getIconSource()}
                        alt="AI Assistant"
                        className={styles.icon}
                        width="40"
                        height="40"
                        loading="eager"
                    />
                    {hasUnreadMessages && (
                        <span className={styles.badge} aria-label="Unread messages">
                            !
                        </span>
                    )}
                </>
            )}

            {/* Pulse animation for unread messages */}
            {hasUnreadMessages && !isOpen && (
                <span className={styles.pulse} aria-hidden="true"></span>
            )}
        </button>
    );
};

FloatingAssistantIcon.propTypes = {
    onClick: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    hasUnreadMessages: PropTypes.bool,
};

FloatingAssistantIcon.defaultProps = {
    hasUnreadMessages: false,
};

export default FloatingAssistantIcon;