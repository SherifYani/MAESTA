/**
 * @file useVideoCall.js
 * @description Custom hook to manage video call state, participants, and interactions.
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook to manage video call logic.
 * @returns {Object} Video call state and control functions.
 */
export const useVideoCall = () => {
    const [localParticipant, setLocalParticipant] = useState({
        id: 'local',
        name: 'You',
        isMuted: false,
        isVideoOff: false,
        isSpeaking: true,
        avatarUrl: null
    });

    const [participants, setParticipants] = useState([
        { id: '1', name: 'Alice Smith', isMuted: true, isVideoOff: false, isSpeaking: false, avatarUrl: null },
        { id: '2', name: 'Bob Johnson', isMuted: false, isVideoOff: true, isSpeaking: false, avatarUrl: null },
        { id: '3', name: 'Charlie Davis', isMuted: false, isVideoOff: false, isSpeaking: true, avatarUrl: null }
    ]);

    const [isSharing, setIsSharing] = useState(false);
    const [isRecording] = useState(true); // Demo: recording on start

    const toggleMic = useCallback(() => {
        setLocalParticipant(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }, []);

    const toggleVideo = useCallback(() => {
        setLocalParticipant(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
    }, []);

    const toggleShare = useCallback(() => {
        setIsSharing(prev => !prev);
    }, []);

    const endCall = useCallback(() => {
        console.log('Ending call...');
        // Real logic would be cleanup and navigation
        alert('Call Ended (Demo)');
    }, []);

    // Mock speaking detection or network events
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly toggle speaking for a remote participant
            setParticipants(prev => prev.map(p => ({
                ...p,
                isSpeaking: Math.random() > 0.7
            })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return {
        localParticipant,
        participants,
        isSharing,
        isRecording,
        toggleMic,
        toggleVideo,
        toggleShare,
        endCall
    };
};

export default useVideoCall;
