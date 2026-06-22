import ApiService from './ApiService';

const communityService = {
    getFeed: async (page = 1, limit = 10) => {
        const response = await ApiService.get('/api/posts', { params: { page, limit } });
        return response.data;
    },

    getPostById: async (postId) => {
        const response = await ApiService.get(`/api/posts/${postId}`);
        return response.data;
    },

    createPost: async (postData) => {
        const response = await ApiService.post('/api/posts', postData);
        return response.data;
    },

    deletePost: async (postId) => {
        const response = await ApiService.delete(`/api/posts/${postId}`);
        return response.data;
    },

    toggleLike: async (postId) => {
        const response = await ApiService.post(`/api/posts/${postId}/like`);
        return response.data;
    },

    getComments: async (postId) => {
        const response = await ApiService.get(`/api/posts/${postId}/comments`);
        return response.data;
    },

    addComment: async (postId, content) => {
        const response = await ApiService.post(`/api/posts/${postId}/comments`, { content });
        return response.data;
    },

    reportPost: async (postId, reason, details = '') => {
        const response = await ApiService.post(`/api/posts/${postId}/report`, { reason, details });
        return response.data;
    }
};

export default communityService;
