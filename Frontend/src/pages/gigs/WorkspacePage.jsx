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
import { Button, LoadingSpinner } from '../../components/common';
import WorkspaceChat from '../../components/gigs/WorkspaceChat';
import MilestoneTracker from '../../components/gigs/MilestoneTracker';
import FileUpload from '../../components/gigs/FileUpload';
import VideoCallUI from '../../components/video/VideoCallUI';
import { Video } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import styles from './WorkspacePage.module.css';

const WorkspacePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { workspace, fetchWorkspace, isLoading } = useGig();
    const { user } = useRole(); // Need actual user object for chat
    const { isClient } = useRole();

    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

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
            <PageContainer size="xl" className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </PageContainer>
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
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <PageContainer size="xl" className={styles.headerContent}>
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
                </PageContainer>
            </header>

            <PageContainer as="main" size="xl" className={styles.main}>
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
            </PageContainer>
        </div>
    );
};

export default WorkspacePage;
