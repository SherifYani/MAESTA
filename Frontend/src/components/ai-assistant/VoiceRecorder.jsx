/**
 * @file VoiceRecorder.jsx
 * @description Speech-to-Text (STT) voice recorder component
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./VoiceRecorder.module.css";

/**
 * Speech-to-Text voice recorder component
 * @param {Object} props - Component props
 * @param {Function} props.onResult - Callback for speech recognition result
 * @param {Function} props.onError - Callback for speech recognition errors
 * @param {boolean} props.isRecording - Whether recording is in progress
 * @param {Function} props.setIsRecording - Function to set recording state
 * @param {boolean} props.disabled - Whether the recorder is disabled
 * @returns {JSX.Element} Rendered voice recorder component
 */
const VoiceRecorder = ({
    onResult,
    onError,
    isRecording,
    setIsRecording,
    disabled,
}) => {
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);

    /**
     * Initializes speech recognition
     */
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US"; // Changed from Arabic to English

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (onResult) {
                    onResult(transcript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                if (onError) {
                    onError(event.error);
                }
                if (setIsRecording) {
                    setIsRecording(false);
                }
            };

            recognitionRef.current.onend = () => {
                if (setIsRecording) {
                    setIsRecording(false);
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onResult, onError, setIsRecording]);

    /**
     * Toggles recording state
     */
    const toggleRecording = useCallback(() => {
        if (!isSupported || disabled) return;

        if (isRecording) {
            recognitionRef.current?.stop();
            if (setIsRecording) {
                setIsRecording(false);
            }
        } else {
            try {
                recognitionRef.current?.start();
                if (setIsRecording) {
                    setIsRecording(true);
                }
            } catch (error) {
                if (onError) {
                    onError(error.message);
                }
            }
        }
    }, [isSupported, disabled, isRecording, setIsRecording, onError]);

    if (!isSupported) {
        return null;
    }

    return (
        <button
            type="button"
            className={`${styles.button} ${isRecording ? styles.recording : ""}`}
            onClick={toggleRecording}
            disabled={disabled}
            title={isRecording ? "Stop recording" : "Start recording"}
            aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
            aria-pressed={isRecording}
        >
            {isRecording ? (
                <div className={styles.indicator} aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            ) : (
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.icon}
                    aria-hidden="true"
                >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
            )}
        </button>
    );
};

VoiceRecorder.propTypes = {
    onResult: PropTypes.func,
    onError: PropTypes.func,
    isRecording: PropTypes.bool,
    setIsRecording: PropTypes.func,
    disabled: PropTypes.bool,
};

VoiceRecorder.defaultProps = {
    onResult: null,
    onError: null,
    isRecording: false,
    setIsRecording: null,
    disabled: false,
};

export default VoiceRecorder;