/**
 * @file index.jsx
 * @description Displays an individual video participant's feed, including avatar, name, and status icons.
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React from 'react';
import { Mic, MicOff, User } from 'lucide-react';
import styles from './VideoParticipant.module.css';

/**
 * Component to display a single participant in the video call.
 * @param {Object} props - The component props.
 * @param {Object} props.participant - The participant data.
 * @param {string} props.participant.name - Participant's display name.
 * @param {boolean} props.participant.isMuted - Whether the participant is muted.
 * @param {boolean} props.participant.isVideoOff - Whether the participant's camera is off.
 * @param {boolean} props.participant.isSpeaking - Whether the participant is currently speaking.
 * @param {string} [props.participant.avatarUrl] - URL of the participant's avatar.
 * @param {boolean} [props.isLocal=false] - Whether this is the local user.
 * @returns {JSX.Element} The rendered participant component.
 */
const VideoParticipant = ({ participant, isLocal = false }) => {
    const { name, isMuted, isVideoOff, isSpeaking, avatarUrl } = participant;

    return (
        <div className={`${styles.container} ${isSpeaking ? styles.speaking : ''} ${isLocal ? styles.local : ''}`}>
            {isVideoOff ? (
                <div className={styles.avatarContainer}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className={styles.avatar} />
                    ) : (
                        <div className={styles.placeholderAvatar}>
                            <User size={48} />
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.videoPlaceholder}>
                    {/* Real implementation would use <video> tag here */}
                    <span className={styles.debugText}>Video Feed: {name}</span>
                </div>
            )}

            <div className={styles.infoBar}>
                <span className={styles.name}>{name} {isLocal && '(You)'}</span>
                <div className={styles.statusIcons}>
                    {isMuted ? (
                        <MicOff size={16} className={styles.iconMuted} />
                    ) : (
                        <Mic size={16} className={styles.iconUnmuted} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoParticipant;
