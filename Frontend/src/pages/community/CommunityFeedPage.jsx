import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import { Button, LoadingSpinner, Pagination, Input } from '../../components/common';
import { MessageSquare, Heart, Plus, Search } from 'lucide-react';

const CommunityFeedPage = () => {
    const navigate = useNavigate();
    const { posts, isLoading, error, fetchFeed, toggleLike, page, totalPages } = useCommunity();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFeed(1, 10);
    }, [fetchFeed]);

    const handlePageChange = (newPage) => {
        fetchFeed(newPage, 10);
    };

    const filteredPosts = searchTerm
        ? posts.filter(p =>
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.content?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : posts;

    if (isLoading) return <LoadingSpinner />;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Community</h1>
                <Button onClick={() => navigate('/community/new')}>
                    <Plus size={18} /> New Post
                </Button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={18} />}
                />
            </div>

            {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}

            {filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                    <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No posts yet. Be the first to share!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredPosts.map(post => (
                        <div
                            key={post.communityPostId || post.id}
                            onClick={() => navigate(`/community/${post.communityPostId || post.id}`)}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s',
                                background: 'var(--color-surface)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--color-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1rem', fontWeight: 'bold'
                                }}>
                                    {post.authorName?.[0] || 'U'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{post.authorName || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                    </div>
                                </div>
                                {post.postType && (
                                    <span style={{
                                        marginLeft: 'auto', padding: '0.25rem 0.75rem',
                                        borderRadius: '12px', fontSize: '0.75rem',
                                        background: 'var(--color-primary-light)', color: 'var(--color-primary)'
                                    }}>
                                        {post.postType}
                                    </span>
                                )}
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem' }}>{post.title}</h3>
                            <p style={{ margin: '0 0 1rem', color: 'var(--color-text-secondary)' }}>
                                {post.content?.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Heart size={16} fill={post.isLikedByMe ? 'var(--color-danger)' : 'none'} />
                                    {post.likesCount || 0}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <MessageSquare size={16} />
                                    {post.commentsCount || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div style={{ marginTop: '2rem' }}>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default CommunityFeedPage;
