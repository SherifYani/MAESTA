/**
 * @file index.jsx
 * @description Main container for the video call experience, orchestrating sub-components.
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React from 'react';
import useVideoCall from './useVideoCall';
import ParticipantGrid from '../ParticipantGrid';
import VideoControls from '../VideoControls';
import ScreenShare from '../ScreenShare';
import RecordingIndicator from '../RecordingIndicator';
import styles from './VideoCallUI.module.css';

/**
 * Main Video Call Interface Component.
 * Orchestrates layout modes (Grid vs. Screen Share) and manages UI overlays.
 * @returns {JSX.Element} The rendered video call interface.
 */
const VideoCallUI = () => {
    const {
        localParticipant,
        participants,
        isSharing,
        isRecording,
        toggleMic,
        toggleVideo,
        toggleShare,
        endCall
    } = useVideoCall();

    return (
        <div className={styles.container}>
            <div className={styles.headerOverlay}>
                <div className={styles.headerLeft}>
                    <span className={styles.callTitle}>Technical Interview: Frontend Lead</span>
                    <RecordingIndicator isRecording={isRecording} />
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.participantCount}>{participants.length + 1} Participants</span>
                </div>
            </div>

            <div className={styles.mainContent}>
                {isSharing ? (
                    <div className={styles.screenShareLayout}>
                        <div className={styles.screenShareArea}>
                            <ScreenShare
                                isSharing={isSharing}
                                onStopSharing={toggleShare}
                            />
                        </div>
                        <div className={styles.sidebarGrid}>
                            <ParticipantGrid
                                participants={participants}
                                localParticipant={localParticipant}
                            />
                        </div>
                    </div>
                ) : (
                    <ParticipantGrid
                        participants={participants}
                        localParticipant={localParticipant}
                    />
                )}
            </div>

            <div className={styles.controlsOverlay}>
                <VideoControls
                    isMuted={localParticipant.isMuted}
                    isVideoOff={localParticipant.isVideoOff}
                    isSharing={isSharing}
                    onToggleMic={toggleMic}
                    onToggleVideo={toggleVideo}
                    onEndCall={endCall}
                    onToggleShare={toggleShare}
                />
            </div>
        </div>
    );
};

export default VideoCallUI;
