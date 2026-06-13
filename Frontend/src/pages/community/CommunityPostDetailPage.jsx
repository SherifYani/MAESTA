import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import { Button, LoadingSpinner, Input } from '../../components/common';
import { Heart, MessageSquare, ArrowLeft, Flag, Trash2 } from 'lucide-react';

const CommunityPostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const {
        currentPost, comments, isLoading, error,
        fetchPostById, fetchComments, toggleLike, addComment, deletePost, reportPost
    } = useCommunity();
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (postId) {
            fetchPostById(postId);
            fetchComments(postId);
        }
    }, [postId, fetchPostById, fetchComments]);

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            await addComment(postId, commentText);
            setCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await deletePost(postId);
            navigate('/community');
        }
    };

    const handleReport = async () => {
        const reason = prompt('Reason for reporting this post:');
        if (reason) {
            await reportPost(postId, reason);
            alert('Post reported. Thank you.');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    if (error) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-error)' }}>
            <p>{error}</p>
            <Button onClick={() => navigate('/community')}>Back to Community</Button>
        </div>
    );

    if (!currentPost) return null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <Button
                variant="ghost"
                onClick={() => navigate('/community')}
                style={{ marginBottom: '1rem' }}
            >
                <ArrowLeft size={18} /> Back to Community
            </Button>

            <div style={{
                padding: '2rem', borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'var(--color-primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 'bold'
                    }}>
                        {currentPost.authorName?.[0] || 'U'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{currentPost.authorName || 'Unknown'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            {currentPost.createdAt ? new Date(currentPost.createdAt).toLocaleString() : ''}
                        </div>
                    </div>
                    {currentPost.postType && (
                        <span style={{
                            marginLeft: 'auto', padding: '0.25rem 0.75rem',
                            borderRadius: '12px', fontSize: '0.75rem',
                            background: 'var(--color-primary-light)', color: 'var(--color-primary)'
                        }}>
                            {currentPost.postType}
                        </span>
                    )}
                </div>

                <h1 style={{ margin: '0 0 1rem' }}>{currentPost.title}</h1>
                <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)' }}>
                    {currentPost.content}
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <Button
                        variant="ghost"
                        onClick={() => toggleLike(currentPost.communityPostId || currentPost.id)}
                    >
                        <Heart size={18} fill={currentPost.isLikedByMe ? 'var(--color-danger)' : 'none'} />
                        {currentPost.likesCount || 0}
                    </Button>
                    <Button variant="ghost">
                        <MessageSquare size={18} />
                        {currentPost.commentsCount || 0}
                    </Button>
                    <Button variant="ghost" onClick={handleReport} style={{ marginLeft: 'auto' }}>
                        <Flag size={18} /> Report
                    </Button>
                    <Button variant="ghost" onClick={handleDelete}>
                        <Trash2 size={18} /> Delete
                    </Button>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Comments ({comments?.length || 0})</h2>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                    <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        style={{ flex: 1 }}
                    />
                    <Button onClick={handleAddComment} disabled={submitting || !commentText.trim()}>
                        {submitting ? 'Posting...' : 'Post'}
                    </Button>
                </div>

                {(!comments || comments.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                        <MessageSquare size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {comments.map((comment) => (
                            <div key={comment.communityReplyId || comment.id} style={{
                                padding: '1rem', borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'var(--color-primary)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 'bold'
                                    }}>
                                        {comment.userName?.[0] || 'U'}
                                    </div>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{comment.userName || 'Unknown'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPostDetailPage;
