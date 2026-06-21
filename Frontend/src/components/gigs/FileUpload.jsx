/**
 * @file FileUpload.jsx
 * @description Reusable file upload component with drag-and-drop and progress tracking.
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import PropTypes from 'prop-types';
import {
    UploadCloud,
    File,
    X,
    CheckCircle,
    AlertCircle,
    Trash2
} from 'lucide-react';
import styles from './FileUpload.module.css';

/**
 * File upload component with drag-and-drop and progress tracking.
 * @param {Object} props - Component props.
 * @param {function} props.onUpload - Handler for successful uploads.
 * @param {Array<string>} [props.allowedTypes=['image/*', 'application/pdf']] - Allowed MIME types.
 * @param {number} [props.maxSize=10] - Max file size in MB.
 * @param {number} [props.maxFiles=5] - Max number of files.
 * @param {Array<Object>} [props.existingFiles=[]] - Pre-existing files to display.
 * @param {boolean} [props.disabled=false] - Whether the upload is disabled.
 * @param {string} [props.className=''] - Additional CSS class names.
 * @returns {JSX.Element} The rendered file upload component.
 */
const FileUpload = ({
    onUpload,
    allowedTypes = ['image/*', 'application/pdf'],
    maxSize = 10,
    maxFiles = 5,
    existingFiles = [],
    disabled = false,
    className = ''
}) => {
    // Component state
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState(existingFiles);
    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState([]);

    // Refs
    const inputRef = useRef(null);
    const dropZoneRef = useRef(null);

    /**
     * Updates parent with current file list.
     * @param {Array<File>} fileList - Current list of files.
     * @returns {void}
     */
    const updateParent = useCallback((fileList) => {
        if (onUpload) {
            onUpload(fileList);
        }
    }, [onUpload]);

    /**
     * Handles drag events for the drop zone.
     * @param {React.DragEvent} e - Drag event.
     * @returns {void}
     */
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            // Only set inactive if leaving the drop zone element
            if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
                setDragActive(false);
            }
        }
    }, [disabled]);

    /**
     * Validates a file against allowed types and size limits.
     * @param {File} file - File to validate.
     * @returns {{valid: boolean, error?: string}} Validation result.
     */
    const validateFile = useCallback((file) => {
        // Check file size
        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `File size exceeds ${maxSize}MB limit`
            };
        }

        // Check file type
        const isTypeValid = allowedTypes.some(type => {
            if (type.endsWith('/*')) {
                const baseType = type.split('/')[0];
                return file.type.startsWith(baseType);
            }
            return file.type === type;
        });

        if (!isTypeValid) {
            const allowedTypesString = allowedTypes
                .map(type => type.split('/')[1] || type)
                .join(', ');
            return {
                valid: false,
                error: `File type not allowed. Allowed: ${allowedTypesString}`
            };
        }

        return { valid: true };
    }, [allowedTypes, maxSize]);

    const uploadFile = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucketName', 'gig-files');

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        const response = await ApiService.upload('/api/Files/upload', formData, {
            onUploadProgress: (event) => {
                if (!event.total) return;
                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: Math.round((event.loaded * 100) / event.total)
                }));
            }
        });

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        return {
            ...file,
            name: file.name,
            size: file.size,
            type: file.type,
            url: response.data?.url || response.data?.Url,
            fileName: response.data?.fileName || response.data?.FileName
        };
    }, []);

    /**
     * Processes and validates selected files.
     * @param {FileList} newFiles - Files to process.
     * @returns {void}
     */
    const handleFiles = useCallback(async (newFiles) => {
        if (disabled) return;

        const fileArray = Array.from(newFiles);
        const validFiles = [];
        const newErrors = [];

        if (files.length + fileArray.length > maxFiles) {
            newErrors.push(`Maximum ${maxFiles} files allowed. You have ${files.length} files.`);
            setErrors(newErrors);
            return;
        }

        fileArray.forEach(file => {
            const validation = validateFile(file);
            if (validation.valid) validFiles.push(file);
            else newErrors.push(`${file.name}: ${validation.error}`);
        });

        setErrors(newErrors);

        if (validFiles.length > 0) {
            const uploadedFiles = await Promise.all(validFiles.map(uploadFile));
            const updatedFiles = [...files, ...uploadedFiles];
            setFiles(updatedFiles);
            updateParent(updatedFiles);
        }
    }, [disabled, files, maxFiles, validateFile, uploadFile, updateParent]);

    /**
     * Handles drop event.
     * @param {React.DragEvent} e - Drop event.
     * @returns {void}
     */
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [disabled, handleFiles]);

    /**
     * Handles file input change.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Change event.
     * @returns {void}
     */
    const handleChange = useCallback((e) => {
        if (disabled) return;

        e.preventDefault();

        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);

            // Reset input to allow selecting same file again
            e.target.value = '';
        }
    }, [disabled, handleFiles]);

    /**
     * Removes a file from the list.
     * @param {number} index - Index of file to remove.
     * @returns {void}
     */
    const removeFile = useCallback((index) => {
        if (disabled) return;

        const fileToRemove = files[index];
        const newFiles = files.filter((_, i) => i !== index);

        setFiles(newFiles);
        updateParent(newFiles);

        // Cleanup progress tracking
        if (fileToRemove && fileToRemove.name) {
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[fileToRemove.name];
                return newProgress;
            });
        }
    }, [disabled, files, updateParent]);

    /**
     * Removes all files.
     * @returns {void}
     */
    const removeAllFiles = useCallback(() => {
        if (disabled) return;

        setFiles([]);
        setUploadProgress({});
        updateParent([]);
    }, [disabled, updateParent]);

    /**
     * Triggers file input click.
     * @returns {void}
     */
    const onButtonClick = useCallback(() => {
        if (disabled || !inputRef.current) return;

        inputRef.current.click();
    }, [disabled]);

    /**
     * Formats file size for display.
     * @param {number} bytes - File size in bytes.
     * @returns {string} Formatted file size.
     */
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    /**
     * Gets progress bar color based on progress.
     * @param {number} progress - Upload progress percentage.
     * @returns {string} CSS class for progress bar.
     */
    const getProgressColor = useCallback((progress) => {
        if (progress < 50) return styles.progressLow;
        if (progress < 100) return styles.progressMedium;
        return styles.progressComplete;
    }, []);

    // Sync with existingFiles prop changes
    useEffect(() => {
        setFiles(existingFiles);
    }, [existingFiles]);

    // Calculate total size of all files
    const totalSize = files.reduce((total, file) => total + (file.size || 0), 0);

    return (
        <div
            className={`${styles.container} ${className}`}
            aria-label="File upload area"
        >
            <div
                ref={dropZoneRef}
                className={`${styles.dropzone} ${dragActive ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={disabled ? 'File upload disabled' : 'Click or drag and drop files to upload'}
                aria-disabled={disabled}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onButtonClick();
                    }
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple={maxFiles > 1}
                    onChange={handleChange}
                    className={styles.input}
                    disabled={disabled}
                    accept={allowedTypes.join(',')}
                    aria-label="File upload input"
                />

                <div className={styles.dropContent}>
                    <UploadCloud
                        size={48}
                        className={styles.icon}
                        aria-hidden="true"
                    />
                    <p className={styles.text}>
                        {disabled ? 'Upload disabled' : 'Drag & drop files or'}
                        {!disabled && (
                            <span className={styles.browse}> browse</span>
                        )}
                    </p>
                    <p className={styles.subtext}>
                        {maxFiles > 1 ? `Up to ${maxFiles} files, ` : 'Single file, '}
                        max {maxSize}MB each
                    </p>
                </div>
            </div>

            {errors.length > 0 && (
                <div
                    className={styles.errorContainer}
                    role="alert"
                    aria-live="assertive"
                >
                    <AlertCircle
                        size={16}
                        className={styles.errorIcon}
                        aria-hidden="true"
                    />
                    <ul className={styles.errorList}>
                        {errors.map((error, index) => (
                            <li key={index} className={styles.errorItem}>
                                {error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {files.length > 0 && (
                <div className={styles.fileSection}>
                    <div className={styles.fileHeader}>
                        <h3 className={styles.fileTitle}>
                            Files ({files.length}/{maxFiles})
                        </h3>
                        {files.length > 0 && !disabled && (
                            <button
                                type="button"
                                onClick={removeAllFiles}
                                className={styles.removeAllButton}
                                aria-label="Remove all files"
                            >
                                <Trash2 size={16} aria-hidden="true" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className={styles.totalSize}>
                        Total size: {formatFileSize(totalSize)}
                    </div>

                    <div className={styles.fileList}>
                        {files.map((file, index) => {
                            const progress = uploadProgress[file.name] || 0;
                            const isComplete = progress === 100;
                            const fileSize = file.size ? formatFileSize(file.size) : '';

                            return (
                                <div
                                    key={`${file.name}-${index}`}
                                    className={`${styles.fileItem} ${isComplete ? styles.complete : ''}`}
                                    aria-label={`File: ${file.name}, ${fileSize}, ${isComplete ? 'Upload complete' : 'Uploading'}`}
                                >
                                    <div className={styles.fileInfo}>
                                        <File
                                            size={20}
                                            className={styles.fileIcon}
                                            aria-hidden="true"
                                        />
                                        <div className={styles.fileDetails}>
                                            <span
                                                className={styles.fileName}
                                                title={file.name}
                                            >
                                                {file.name}
                                            </span>
                                            <span className={styles.fileMeta}>
                                                <span className={styles.fileSize}>{fileSize}</span>
                                                {file.type && (
                                                    <span className={styles.fileType}>
                                                        {file.type.split('/')[1]?.toUpperCase() || file.type}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {!disabled && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(index);
                                                }}
                                                className={styles.removeButton}
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <X size={16} aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>

                                    {!isComplete && progress > 0 && (
                                        <div className={styles.progressContainer}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={`${styles.progressFill} ${getProgressColor(progress)}`}
                                                    style={{ width: `${progress}%` }}
                                                    role="progressbar"
                                                    aria-valuenow={progress}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                />
                                            </div>
                                            <span className={styles.progressText}>
                                                {progress}%
                                            </span>
                                        </div>
                                    )}

                                    {isComplete && (
                                        <div
                                            className={styles.status}
                                            aria-label="Upload complete"
                                        >
                                            <CheckCircle
                                                size={16}
                                                className={styles.successIcon}
                                                aria-hidden="true"
                                            />
                                            <span>Ready</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {files.length === 0 && !disabled && (
                <div className={styles.helpText}>
                    <p>Supported formats: {allowedTypes.join(', ')}</p>
                    <p>Maximum file size: {maxSize}MB per file</p>
                </div>
            )}
        </div>
    );
};

FileUpload.propTypes = {
    onUpload: PropTypes.func.isRequired,
    allowedTypes: PropTypes.arrayOf(PropTypes.string),
    maxSize: PropTypes.number,
    maxFiles: PropTypes.number,
    existingFiles: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.instanceOf(File),
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                size: PropTypes.number,
                type: PropTypes.string,
                url: PropTypes.string
            })
        ])
    ),
    disabled: PropTypes.bool,
    className: PropTypes.string
};

export default FileUpload;