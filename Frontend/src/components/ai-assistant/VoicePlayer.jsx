/**
 * @file VoicePlayer.jsx
 * @description Text-to-Speech (TTS) voice player component
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./VoicePlayer.module.css";

/**
 * Text-to-Speech voice player component
 * @param {Object} props - Component props
 * @param {string} props.text - Text content to convert to speech
 * @param {boolean} props.autoPlay - Whether to automatically play the text
 * @returns {JSX.Element} Rendered voice player component
 */
const VoicePlayer = ({ text, autoPlay = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const utteranceRef = useRef(null);

    /**
     * Checks browser support for speech synthesis
     */
    useEffect(() => {
        if ("speechSynthesis" in window) {
            setIsSupported(true);
        }

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    /**
     * Automatically plays text when autoPlay is enabled
     */
    useEffect(() => {
        if (autoPlay && isSupported && text) {
            playText();
        }
    }, [text, autoPlay, isSupported]);

    /**
     * Plays the text using the Web Speech API
     */
    const playText = useCallback(() => {
        if (!isSupported || !text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Configure voice settings
        utterance.lang = "en-US"; // Changed from Arabic to English
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find an English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(
            (voice) => voice.lang.startsWith("en") && voice.name.includes("English")
        );
        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported, text]);

    /**
     * Stops the currently playing speech
     */
    const stopPlaying = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }, []);

    /**
     * Toggles play/pause state
     */
    const togglePlay = useCallback(() => {
        if (isPlaying) {
            stopPlaying();
        } else {
            playText();
        }
    }, [isPlaying, playText, stopPlaying]);

    if (!isSupported) {
        return null;
    }

    return (
        <button
            type="button"
            className={`${styles.button} ${isPlaying ? styles.playing : ""}`}
            onClick={togglePlay}
            title={isPlaying ? "Stop" : "Listen"}
            aria-label={isPlaying ? "Stop audio playback" : "Play audio"}
            aria-pressed={isPlaying}
            disabled={!text}
        >
            {isPlaying ? (
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.icon}
                    aria-hidden="true"
                >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
            ) : (
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.icon}
                    aria-hidden="true"
                >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
            )}
        </button>
    );
};

VoicePlayer.propTypes = {
    text: PropTypes.string.isRequired,
    autoPlay: PropTypes.bool,
};

VoicePlayer.defaultProps = {
    autoPlay: false,
};

export default VoicePlayer;