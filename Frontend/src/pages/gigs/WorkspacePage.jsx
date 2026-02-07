/**
 * @file WorkspacePage.jsx
 * @description Collaborative workspace for managing active gigs with chat and milestones
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGig } from '../../context/GigContext';
import { useRole } from '../../hooks/useRole';
import { Button, LoadingSpinner, Alert } from '../../components/common';
import WorkspaceChat from '../../components/gigs/WorkspaceChat';
import MilestoneTracker from '../../components/gigs/MilestoneTracker';
import FileUpload from '../../components/gigs/FileUpload';
import VideoCallUI from '../../components/video/VideoCallUI';
import { Video, Calendar, Paperclip, MessageSquare } from 'lucide-react';
import styles from './WorkspacePage.module.css';

const WorkspacePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { workspace, fetchWorkspace, isLoading, error } = useGig();
    const { user } = useRole(); // Need actual user object for chat
    const { isClient, isFreelancer } = useRole();

    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview'); // overview, files, milestones

    useEffect(() => {
        if (id) {
            fetchWorkspace(id);
        }
    }, [id, fetchWorkspace]);

    const handleSendMessage = (gigId, message) => {
        console.log('Sending message:', message);
        // Integrate with backend socket/api
    };

    const handleMilestoneUpdate = (milestoneId, newStatus) => {
        console.log('Update milestone:', milestoneId, newStatus);
        // Update via context/api
    };

    const handleFileUpload = (files) => {
        console.log('Uploaded files:', files);
        // Upload logic
    };

    if (isLoading || !workspace) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (isVideoCallOpen) {
        return (
            <div className={styles.videoContainer}>
                <Button
                    variant="secondary"
                    className={styles.closeVideoButton}
                    onClick={() => setIsVideoCallOpen(false)}
                >
                    Exit Call
                </Button>
                <VideoCallUI isHost={isClient()} roomId={id} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>{workspace.title}</h1>
                        <span className={styles.statusBadge}>In Progress</span>
                    </div>
                    <div className={styles.headerActions}>
                        <Button
                            variant="primary"
                            className={styles.videoButton}
                            onClick={() => setIsVideoCallOpen(true)}
                        >
                            <Video size={16} /> Join Video Call
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(`/gigs/${id}`)}>
                            Gig Details
                        </Button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.layout}>
                    <div className={styles.leftPanel}>
                        <div className={styles.sectionHeader}>
                            <h3>Milestones</h3>
                            <button onClick={() => navigate(`/gigs/${id}/manage`)} className={styles.manageLink}>Manage</button>
                        </div>
                        <MilestoneTracker
                            milestones={workspace.milestones || []}
                            onUpdate={handleMilestoneUpdate}
                            canEdit={isClient()} // Or specific logic
                            role={isClient() ? 'client' : 'freelancer'}
                        />

                        <div className={styles.filesSection}>
                            <h3>Files</h3>
                            <FileUpload onUpload={handleFileUpload} existingFiles={workspace.files || []} />
                        </div>
                    </div>

                    <div className={styles.rightPanel}>
                        <WorkspaceChat
                            gigId={id}
                            userId={user?.id || 'current-user'}
                            participants={workspace.participants || []}
                            messages={workspace.messages || []}
                            onSendMessage={handleSendMessage}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WorkspacePage;
