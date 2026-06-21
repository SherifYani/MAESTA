/**
 * @file VideoCallUI.jsx
 * @description UI for video calls in a workspace
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from 'lucide-react';
import styles from './VideoCallUI.module.css'; // Assuming you might create this or use inline styles for now given the request context

const VideoCallUI = ({ isHost, roomId, onEndCall }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                <div className={styles.participant}>
                    <div className={styles.avatar}>You ({isHost ? 'Host' : 'Guest'})</div>
                    <div className={styles.controls}>
                        {isMuted && <MicOff size={16} />}
                        {isVideoOff && <VideoOff size={16} />}
                    </div>
                </div>
                <div className={styles.participant}>
                    <div className={styles.placeholder}>Waiting for workspace participant connection...</div>
                </div>
            </div>

            <div className={styles.toolbar}>
                <button
                    className={`${styles.button} ${isMuted ? styles.active : ''}`}
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </button>
                <button
                    className={`${styles.button} ${isVideoOff ? styles.active : ''}`}
                    onClick={() => setIsVideoOff(!isVideoOff)}
                >
                    {isVideoOff ? <VideoOff /> : <Video />}
                </button>
                <button className={styles.button}>
                    <Monitor />
                </button>
                <button className={`${styles.button} ${styles.endCall}`} onClick={onEndCall}>
                    <PhoneOff />
                </button>
            </div>
        </div>
    );
};

VideoCallUI.propTypes = {
    isHost: PropTypes.bool,
    roomId: PropTypes.string.isRequired,
    onEndCall: PropTypes.func
};

export default VideoCallUI;
