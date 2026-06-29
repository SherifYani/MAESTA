/**
 * @file index.jsx
 * @description Component to handle screen sharing visualization and control.
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React from 'react';
import { Monitor, X } from 'lucide-react';
import styles from './ScreenShare.module.css';

/**
 * Screen sharing view component.
 * @param {Object} props - The component props.
 * @param {MediaStream} [props.stream] - The shared screen media stream.
 * @param {boolean} props.isSharing - Whether screen sharing is active.
 * @param {function} props.onStopSharing - Handler to stop screen sharing.
 * @returns {JSX.Element|null} The rendered component or null if not sharing.
 */
const ScreenShare = ({ stream, isSharing, onStopSharing }) => {
    if (!isSharing && !stream) return null;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {stream ? (
                    <div className={styles.streamPlaceholder}>
                        {/* <video ref={videoRef} autoPlay playsInline className={styles.video} /> */}
                        <div className={styles.mockContent}>
                            <Monitor size={48} className={styles.icon} />
                            <span>Shared Screen Content</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <Monitor size={64} />
                        <p>You are sharing your screen</p>
                        <button onClick={onStopSharing} className={styles.stopButton}>
                            Stop Sharing
                        </button>
                    </div>
                )}
            </div>
            {stream && (
                <button className={styles.closeButton} onClick={onStopSharing}>
                    <X size={20} />
                </button>
            )}
        </div>
    );
};

export default ScreenShare;
