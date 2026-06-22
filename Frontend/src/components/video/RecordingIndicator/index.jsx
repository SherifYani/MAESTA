/**
 * @file index.jsx
 * @description Visual indicator for active call recording with a timer.
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React, { useState, useEffect } from 'react';
import styles from './RecordingIndicator.module.css';

/**
 * Recording status indicator component.
 * @param {Object} props - The component props.
 * @param {boolean} [props.isRecording=false] - Whether recording is active.
 * @returns {JSX.Element|null} The rendered indicator or null.
 */
const RecordingIndicator = ({ isRecording = false }) => {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } else {
            setTimer(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isRecording) return null;

    return (
        <div className={styles.container}>
            <div className={styles.dot}></div>
            <span className={styles.text}>REC</span>
            <span className={styles.timer}>{formatTime(timer)}</span>
        </div>
    );
};

export default RecordingIndicator;
