/**
 * @file FileUpload.jsx
 * @description Enhanced reusable file upload component with drag & drop and strict file type validation
 * @author Sherif Talaat
 * @version 2.2.0
 * @date 24-10-2025
 */

import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import "../styles/form-components.css";

/**
 * FileUpload Component
 * @description Renders a styled file upload input with drag & drop, icon support, and strict file type validation
 * @param {Object} props - The component props
 * @param {string} props.label - Upload button label text
 * @param {string} props.accept - Accepted file types (e.g., "image/*", ".pdf,.doc")
 * @param {Function} props.onChange - File change event handler
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.supportedFormats - Text showing supported formats
 * @param {boolean} props.multiple - Whether to allow multiple file selection
 * @param {boolean} props.isLoading - Loading state from parent
 * @param {string} props.fileType - Explicit file type restriction: 'image' or 'document'
 * @returns {JSX.Element} The rendered file upload component
 */
function FileUpload({
    label,
    accept,
    onChange,
    icon = "fa-solid fa-cloud-arrow-up",
    supportedFormats = "PNG, JPG, PDF (Max. 5MB)",
    multiple = false,
    isLoading = false,
    fileType = "auto" // 'auto', 'image', or 'document'
}) {
    const [file, setFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    // Determine file type restriction based on props
    const getFileTypeRestriction = () => {
        if (fileType !== "auto") return fileType;

        // Auto-detect from accept prop
        if (accept?.includes("image/*") || accept?.match(/\.(jpg|jpeg|png|gif|svg|webp)/i)) {
            return "image";
        } else if (accept?.includes("application/pdf") || accept?.match(/\.(pdf|doc|docx)/i)) {
            return "document";
        }
        return "any"; // No restriction
    };

    /**
     * Validates file type based on restriction
     * @param {File} file - The file to validate
     * @returns {boolean} Whether the file is valid
     */
    const validateFileType = (file) => {
        const restriction = getFileTypeRestriction();

        if (restriction === "any") return true;

        if (restriction === "image") {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                setError("Please upload an image file (PNG, JPG, SVG, etc.)");
                return false;
            }
        } else if (restriction === "document") {
            const isDocument = file.type.includes('pdf') ||
                file.type.includes('document') ||
                file.type.includes('msword') ||
                file.name.toLowerCase().endsWith('.pdf') ||
                file.name.toLowerCase().endsWith('.doc') ||
                file.name.toLowerCase().endsWith('.docx');
            if (!isDocument) {
                setError("Please upload a document file (PDF, DOC, DOCX, etc.)");
                return false;
            }
        }

        setError("");
        return true;
    };

    /**
     * Handles file input change event
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
     */
    const handleFileChange = (e) => {
        const files = e.target.files;
        processFiles(files);
    };

    /**
     * Processes selected files with validation
     * @param {FileList} files - The selected files
     */
    const processFiles = (files) => {
        if (files && files.length > 0) {
            if (multiple) {
                const validFiles = Array.from(files).filter(validateFileType);
                if (validFiles.length > 0) {
                    onChange(validFiles);
                }
            } else {
                const selectedFile = files[0];
                if (validateFileType(selectedFile)) {
                    setFile(selectedFile);
                    onChange(selectedFile);
                }
            }
        }
    };

    /**
     * Handles click on the upload area
     */
    const handleUploadClick = () => {
        if (fileInputRef.current && !isLoading) {
            fileInputRef.current.click();
        }
    };

    /**
     * Handles drag over event
     */
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) {
            setIsDragOver(true);
        }
    }, [isLoading]);

    /**
     * Handles drag leave event
     */
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    /**
     * Handles drop event
     */
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (!isLoading) {
            const files = e.dataTransfer.files;
            processFiles(files);
        }
    }, [isLoading, multiple, onChange]);

    /**
     * Handles keyboard navigation
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleUploadClick();
        }
    };

    /**
     * Clears selected file
     */
    const handleClearFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setError("");
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Handles change file action
     */
    const handleChangeFile = (e) => {
        e.stopPropagation();
        handleUploadClick();
    };

    // Format file size for display
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get file icon based on file type
    const getFileIcon = () => {
        if (!file) return "fa-solid fa-file";

        const fileType = file.type;
        if (fileType.startsWith('image/')) return "fa-solid fa-file-image";
        if (fileType.includes('pdf')) return "fa-solid fa-file-pdf";
        if (fileType.includes('document') || fileType.includes('word')) return "fa-solid fa-file-word";
        return "fa-solid fa-file";
    };

    // Get appropriate icon based on file type restriction
    const getUploadIcon = () => {
        const restriction = getFileTypeRestriction();
        if (restriction === "image") return "fa-solid fa-image";
        if (restriction === "document") return "fa-solid fa-file-lines";
        return icon;
    };

    return (
        <div className="file-upload__container">
            <div
                className={`file-upload__wrapper ${file ? 'has-file' : ''} ${isLoading ? 'loading' : ''} ${isDragOver ? 'drag-over' : ''} ${error ? 'has-error' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="file-upload__input"
                    multiple={multiple}
                    disabled={isLoading}
                />

                {file ? (
                    // File Preview State
                    <div className="file-upload__preview">
                        <div className="file-upload__preview-info">
                            <i className={`${getFileIcon()} file-upload__preview-icon`} />
                            <div className="file-upload__preview-details">
                                <span className="file-upload__preview-name">{file.name}</span>
                                <span className="file-upload__preview-size">{formatFileSize(file.size)}</span>
                            </div>
                        </div>
                        <div className="file-upload__preview-actions">
                            <button
                                type="button"
                                className="file-upload__preview-action"
                                onClick={handleChangeFile}
                            >
                                Change
                            </button>
                            <button
                                type="button"
                                className="file-upload__preview-action file-upload__preview-action--remove"
                                onClick={handleClearFile}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    // Upload State
                    <div
                        className="file-upload__label"
                        onClick={handleUploadClick}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                        role="button"
                        aria-label={label}
                        aria-disabled={isLoading}
                    >
                        {isLoading ? (
                            <i className="fa-solid fa-spinner fa-spin file-upload__icon" />
                        ) : (
                            <i className={`${getUploadIcon()} file-upload__icon`} />
                        )}
                        <span className="file-upload__text">
                            {isLoading ? 'Uploading...' : label}
                        </span>
                        <div className="file-upload__formats">
                            {supportedFormats}
                        </div>
                        {error && (
                            <div className="file-upload__error">
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

FileUpload.propTypes = {
    label: PropTypes.string.isRequired,
    accept: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    icon: PropTypes.string,
    supportedFormats: PropTypes.string,
    multiple: PropTypes.bool,
    isLoading: PropTypes.bool,
    fileType: PropTypes.oneOf(['auto', 'image', 'document']),
};

FileUpload.defaultProps = {
    accept: undefined,
    icon: "fa-solid fa-cloud-arrow-up",
    supportedFormats: "PNG, JPG, PDF (Max. 5MB)",
    multiple: false,
    isLoading: false,
    fileType: 'auto',
};

export default FileUpload;