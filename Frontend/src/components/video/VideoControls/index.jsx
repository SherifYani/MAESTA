import React from 'react';
import {
    mic, MicOff, Video, VideoOff, PhoneMissed,
    MonitorUp, MoreVertical, Settings, Mic
} from 'lucide-react';
import styles from './VideoControls.module.css';

const VideoControls = ({
    isMuted,
    isVideoOff,
    isSharing,
    onToggleMic,
    onToggleVideo,
    onEndCall,
    onToggleShare
}) => {
    return (
        <div className={styles.container}>
            <button
                className={`${styles.button} ${isMuted ? styles.danger : ''}`}
                onClick={onToggleMic}
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
                className={`${styles.button} ${isVideoOff ? styles.danger : ''}`}
                onClick={onToggleVideo}
                title={isVideoOff ? "Start Video" : "Stop Video"}
            >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button
                className={`${styles.button} ${isSharing ? styles.active : ''}`}
                onClick={onToggleShare}
                title="Share Screen"
            >
                <MonitorUp size={20} />
            </button>

            <button
                className={`${styles.button} ${styles.endCall}`}
                onClick={onEndCall}
                title="Leave Call"
            >
                <PhoneMissed size={24} />
            </button>

            <button className={styles.button} title="Settings">
                <Settings size={20} />
            </button>
        </div>
    );
};

export default VideoControls;
