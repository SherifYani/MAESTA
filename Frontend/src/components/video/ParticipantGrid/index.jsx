/**
 * @file index.jsx
 * @description Renders a responsive grid of video participants.
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React from 'react';
import VideoParticipant from '../VideoParticipant';
import styles from './ParticipantGrid.module.css';

/**
 * Grid layout for displaying multiple video participants.
 * Adaptive layout based on screen size and participant count.
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.participants - List of remote participants.
 * @param {Object} props.localParticipant - Local user's participant data.
 * @returns {JSX.Element} The rendered grid.
 */
const ParticipantGrid = ({ participants, localParticipant }) => {
    const totalParticipants = participants.length + (localParticipant ? 1 : 0);

    // Calculate grid class based on count for dynamic sizing if needed,
    // but CSS grid handles most well.

    return (
        <div className={styles.grid} data-count={totalParticipants}>
            {/* Local Participant usually first or separate depending on UI design. 
          Here rendering in grid for simplicity unless pinned. */}
            {localParticipant && (
                <div className={styles.gridItem}>
                    <VideoParticipant participant={localParticipant} isLocal={true} />
                </div>
            )}

            {participants.map((participant) => (
                <div key={participant.id} className={styles.gridItem}>
                    <VideoParticipant participant={participant} />
                </div>
            ))}
        </div>
    );
};

export default ParticipantGrid;
