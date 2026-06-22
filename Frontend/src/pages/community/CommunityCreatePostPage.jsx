import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import { Button, Input } from '../../components/common';
import { ArrowLeft } from 'lucide-react';

const CommunityCreatePostPage = () => {
    const navigate = useNavigate();
    const { createPost, isLoading } = useCommunity();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        postType: 'general'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) return;
        try {
            const result = await createPost(formData);
            navigate(`/community/${result?.communityPostId || result?.id}`);
        } catch (err) {
            console.error('Failed to create post:', err);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
            <Button
                variant="ghost"
                onClick={() => navigate('/community')}
                style={{ marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={18} /> Back to Community
            </Button>

            <h1 style={{ marginBottom: '2rem' }}>Create New Post</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Post title..."
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Content</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="What's on your mind?"
                        rows={8}
                        required
                        style={{
                            width: '100%', padding: '0.75rem', borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)', fontSize: '1rem',
                            resize: 'vertical', fontFamily: 'inherit'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Post Type</label>
                    <select
                        value={formData.postType}
                        onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                        style={{
                            width: '100%', padding: '0.75rem', borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)', fontSize: '1rem'
                        }}
                    >
                        <option value="general">General</option>
                        <option value="question">Question</option>
                        <option value="discussion">Discussion</option>
                        <option value="announcement">Announcement</option>
                        <option value="tip">Tip / Advice</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => navigate('/community')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || !formData.title.trim() || !formData.content.trim()}>
                        {isLoading ? 'Posting...' : 'Create Post'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CommunityCreatePostPage;
