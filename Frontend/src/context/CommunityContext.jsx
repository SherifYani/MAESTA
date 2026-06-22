import React, { createContext, useContext, useReducer, useCallback } from 'react';
import communityService from '../services/communityService';

const initialState = {
    posts: [],
    currentPost: null,
    comments: [],
    isLoading: false,
    error: null,
    page: 1,
    totalPages: 1
};

const CommunityContext = createContext();

const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_POSTS: 'SET_POSTS',
    SET_CURRENT_POST: 'SET_CURRENT_POST',
    SET_COMMENTS: 'SET_COMMENTS',
    ADD_POST: 'ADD_POST',
    DELETE_POST: 'DELETE_POST',
    TOGGLE_LIKE: 'TOGGLE_LIKE',
    ADD_COMMENT: 'ADD_COMMENT',
    SET_PAGINATION: 'SET_PAGINATION'
};

const communityReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, isLoading: action.payload };
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, isLoading: false };
        case ACTIONS.SET_POSTS:
            return { ...state, posts: action.payload, isLoading: false };
        case ACTIONS.SET_CURRENT_POST:
            return { ...state, currentPost: action.payload, isLoading: false };
        case ACTIONS.SET_COMMENTS:
            return { ...state, comments: action.payload };
        case ACTIONS.ADD_POST:
            return { ...state, posts: [action.payload, ...state.posts] };
        case ACTIONS.DELETE_POST:
            return { ...state, posts: state.posts.filter(p => p.communityPostId !== action.payload) };
        case ACTIONS.TOGGLE_LIKE:
            return {
                ...state,
                posts: state.posts.map(p =>
                    p.communityPostId === action.payload.postId
                        ? { ...p, isLikedByMe: !p.isLikedByMe, likesCount: p.likesCount + (p.isLikedByMe ? -1 : 1) }
                        : p
                ),
                currentPost: state.currentPost?.communityPostId === action.payload.postId
                    ? { ...state.currentPost, isLikedByMe: !state.currentPost.isLikedByMe, likesCount: state.currentPost.likesCount + (state.currentPost.isLikedByMe ? -1 : 1) }
                    : state.currentPost
            };
        case ACTIONS.ADD_COMMENT:
            return { ...state, comments: [...state.comments, action.payload] };
        case ACTIONS.SET_PAGINATION:
            return { ...state, page: action.payload.page, totalPages: action.payload.totalPages };
        default:
            return state;
    }
};

export const CommunityProvider = ({ children }) => {
    const [state, dispatch] = useReducer(communityReducer, initialState);

    const fetchFeed = useCallback(async (page = 1, limit = 10) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const data = await communityService.getFeed(page, limit);
            const posts = data?.items || data?.data || data || [];
            dispatch({ type: ACTIONS.SET_POSTS, payload: posts });
            dispatch({ type: ACTIONS.SET_PAGINATION, payload: {
                page: data?.page || page,
                totalPages: data?.totalPages || Math.ceil((data?.totalCount || posts.length) / limit) || 1
            }});
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    const fetchPostById = useCallback(async (postId) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const data = await communityService.getPostById(postId);
            dispatch({ type: ACTIONS.SET_CURRENT_POST, payload: data });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    const createPost = useCallback(async (postData) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const data = await communityService.createPost(postData);
            dispatch({ type: ACTIONS.ADD_POST, payload: data });
            return data;
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
            throw err;
        }
    }, []);

    const deletePost = useCallback(async (postId) => {
        try {
            await communityService.deletePost(postId);
            dispatch({ type: ACTIONS.DELETE_POST, payload: postId });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    const toggleLike = useCallback(async (postId) => {
        try {
            const data = await communityService.toggleLike(postId);
            dispatch({ type: ACTIONS.TOGGLE_LIKE, payload: { postId, liked: data.liked } });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    const fetchComments = useCallback(async (postId) => {
        try {
            const data = await communityService.getComments(postId);
            dispatch({ type: ACTIONS.SET_COMMENTS, payload: data || [] });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    const addComment = useCallback(async (postId, content) => {
        try {
            const data = await communityService.addComment(postId, content);
            dispatch({ type: ACTIONS.ADD_COMMENT, payload: data });
            return data;
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
            throw err;
        }
    }, []);

    const reportPost = useCallback(async (postId, reason, details) => {
        try {
            await communityService.reportPost(postId, reason, details);
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    const value = {
        ...state,
        fetchFeed,
        fetchPostById,
        createPost,
        deletePost,
        toggleLike,
        fetchComments,
        addComment,
        reportPost
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
};

export const useCommunity = () => {
    const context = useContext(CommunityContext);
    if (!context) throw new Error('useCommunity must be used within CommunityProvider');
    return context;
};

export default CommunityContext;
