/**
 * @file MessageBubble.jsx
 * @description Single message bubble with support for text, media, and read status
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { FileText, Download } from "lucide-react";
import ReadReceipt from "./ReadReceipt";
import styles from "./MessageBubble.module.css";

/**
 * Message bubble component for displaying individual messages
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object containing content and metadata
 * @param {boolean} props.isOwn - Whether the message is from the current user
 * @returns {JSX.Element} Rendered message bubble component
 */
const MessageBubble = ({ message, isOwn }) => {
    const { type, content, timestamp, status, mediaUrl, fileName, fileSize } = message;

    /**
     * Formats file size to human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size string
     */
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }, []);

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
     * Renders content based on message type
     * @returns {JSX.Element} Rendered content
     */
    const renderContent = () => {
        switch (type) {
            case "image":
                return (
                    <div className={styles.media}>
                        <img
                            src={mediaUrl}
                            alt={content || "Shared image"}
                            className={styles.image}
                            loading="lazy"
                            width="300"
                            height="200"
                        />
                        {content && <p className={styles.caption}>{content}</p>}
                    </div>
                );

            case "file":
                return (
                    <div className={styles.file}>
                        <div className={styles.fileIcon} aria-hidden="true">
                            <FileText size={24} />
                        </div>
                        <div className={styles.fileInfo}>
                            <span className={styles.fileName}>{fileName}</span>
                            <span className={styles.fileSize}>{formatFileSize(fileSize)}</span>
                        </div>
                        <a
                            href={mediaUrl}
                            download={fileName}
                            className={styles.download}
                            aria-label={`Download ${fileName}`}
                        >
                            <Download size={18} aria-hidden="true" />
                        </a>
                    </div>
                );

            case "text":
            default:
                return <p className={styles.text}>{content}</p>;
        }
    };

    return (
        <div
            className={`${styles.container} ${isOwn ? styles.own : styles.other}`}
            role="listitem"
            aria-label={`Message from ${isOwn ? "You" : "Other"}, ${type} type`}
        >
            <div className={styles.bubble}>
                {renderContent()}
                <div className={styles.footer}>
                    <time className={styles.timestamp} dateTime={new Date(timestamp).toISOString()}>
                        {formatTime(timestamp)}
                    </time>
                    {isOwn && <ReadReceipt status={status} aria-label={`Message status: ${status}`} />}
                </div>
            </div>
        </div>
    );
};

MessageBubble.propTypes = {
    message: PropTypes.shape({
        type: PropTypes.oneOf(["text", "image", "file"]).isRequired,
        content: PropTypes.string,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        status: PropTypes.oneOf(["sent", "delivered", "read"]),
        mediaUrl: PropTypes.string,
        fileName: PropTypes.string,
        fileSize: PropTypes.number,
    }).isRequired,
    isOwn: PropTypes.bool.isRequired,
};

export default MessageBubble;