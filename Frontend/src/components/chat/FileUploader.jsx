/**
 * @file FileUploader.jsx
 * @description File upload component for chat with progress indicator (FR-601.4)
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Paperclip } from "lucide-react";
import ApiService from "../../services/ApiService";
import styles from "./FileUploader.module.css";

/**
 * File uploader component for chat with progress indicator
 * @param {Object} props - Component props
 * @param {Function} props.onUpload - Callback when file upload is complete
 * @param {boolean} props.disabled - Whether the uploader is disabled
 * @returns {JSX.Element} Rendered file uploader component
 */
const FileUploader = ({ onUpload, disabled }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    /**
     * Triggers the file input click event
     */
    const handleFileClick = useCallback(() => {
        if (fileInputRef.current && !disabled && !isUploading) {
            fileInputRef.current.click();
        }
    }, [disabled, isUploading]);

    /**
     * Handles file selection and upload simulation
     * @param {Event} e - File input change event
     */
    const handleFileChange = useCallback(
        async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file size (10MB limit)
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            if (file.size > MAX_FILE_SIZE) {
                alert("File size is too large. Maximum size is 10MB.");
                return;
            }

            // Validate file type
            const allowedTypes = [
                "image/png",
                "image/jpeg",
                "image/gif",
                "image/webp",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedTypes.includes(file.type)) {
                alert(
                    "Invalid file type. Please upload images, PDFs, or Word documents."
                );
                return;
            }

            setIsUploading(true);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('bucketName', 'documents');

                const response = await ApiService.upload('/api/Files/upload', formData);
                const uploadedFile = {
                    file,
                    name: file.name,
                    url: response.data?.url || response.data?.Url,
                    fileName: response.data?.fileName || response.data?.FileName,
                    bucketName: response.data?.bucketName || response.data?.BucketName,
                };

                clearInterval(interval);
                setProgress(100);

                if (onUpload) {
                    onUpload(uploadedFile);
                }
            } catch (error) {
                console.error("Upload failed:", error);
                alert("File upload failed. Please try again.");
            } finally {
                setTimeout(() => {
                    setIsUploading(false);
                    setProgress(0);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }, 500);
            }
        },
        [onUpload]
    );

    return (
        <div className={styles.container}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className={styles.input}
                accept="image/*,.pdf,.doc,.docx"
                disabled={disabled || isUploading}
                aria-label="Upload file"
                aria-describedby={disabled ? "file-uploader-disabled" : undefined}
            />

            <button
                type="button"
                className={`${styles.button} ${disabled || isUploading ? styles.disabled : ""
                    }`}
                onClick={handleFileClick}
                disabled={disabled || isUploading}
                title="Attach file"
                aria-label="Attach file"
                aria-busy={isUploading}
            >
                {isUploading ? (
                    <div
                        className={styles.progress}
                        style={{ "--progress": `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label="Upload progress"
                    >
                        <span className={styles.progressText}>{progress}%</span>
                    </div>
                ) : (
                    <Paperclip size={20} className={styles.icon} aria-hidden="true" />
                )}
            </button>

            {disabled && (
                <div id="file-uploader-disabled" className="visually-hidden">
                    File uploader is currently disabled
                </div>
            )}
        </div>
    );
};

FileUploader.propTypes = {
    onUpload: PropTypes.func,
    disabled: PropTypes.bool,
};

FileUploader.defaultProps = {
    onUpload: null,
    disabled: false,
};

export default FileUploader;