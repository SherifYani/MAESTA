/**
 * @file useVideoCall.js
 * @description Local video call state for the workspace call UI.
 */

import { useState, useCallback } from 'react';

export const useVideoCall = () => {
    const [localParticipant, setLocalParticipant] = useState({
        id: 'local',
        name: 'You',
        isMuted: false,
        isVideoOff: false,
        isSpeaking: false,
        avatarUrl: null
    });

    const [isSharing, setIsSharing] = useState(false);
    const [isRecording] = useState(false);

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
        window.history.back();
    }, []);

    return {
        localParticipant,
        participants: [],
        isSharing,
        isRecording,
        toggleMic,
        toggleVideo,
        toggleShare,
        endCall
    };
};

export default useVideoCall;
