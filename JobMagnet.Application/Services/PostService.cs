using JobMagnet.Application.DTOs.Community;
using JobMagnet.Application.Interfaces;
using JobMagnet.Domain.Entities;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobMagnet.Application.Services
{
    public class PostService : IPostService
    {
        private readonly JobMagnetDbContext _context;

        public PostService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PostDto>> GetFeedAsync(int userId, int page = 1, int limit = 10)
        {
            var posts = await _context.CommunityPosts
                .Include(p => p.User)
                .Where(p => !p.IsDeleted)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var postDtos = new List<PostDto>();

            foreach (var post in posts)
            {
                var likesCount = await _context.Favorites
                    .CountAsync(f => f.EntityType == "Post" && f.EntityId == post.CommunityPostId && !f.IsDeleted);
                
                var commentsCount = await _context.CommunityReplies
                    .CountAsync(r => r.PostId == post.CommunityPostId && !r.IsDeleted);

                var isLikedByMe = await _context.Favorites
                    .AnyAsync(f => f.UserId == userId && f.EntityType == "Post" && f.EntityId == post.CommunityPostId && !f.IsDeleted);

                postDtos.Add(MapToDto(post, likesCount, commentsCount, isLikedByMe));
            }

            return postDtos;
        }

        public async Task<PostDto> GetPostDetailsAsync(int userId, int postId)
        {
            var post = await _context.CommunityPosts
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.CommunityPostId == postId && !p.IsDeleted);

            if (post == null) throw new KeyNotFoundException("Post not found");

            var likesCount = await _context.Favorites
                .CountAsync(f => f.EntityType == "Post" && f.EntityId == post.CommunityPostId && !f.IsDeleted);
            
            var commentsCount = await _context.CommunityReplies
                .CountAsync(r => r.PostId == post.CommunityPostId && !r.IsDeleted);

            var isLikedByMe = await _context.Favorites
                .AnyAsync(f => f.UserId == userId && f.EntityType == "Post" && f.EntityId == post.CommunityPostId && !f.IsDeleted);

            return MapToDto(post, likesCount, commentsCount, isLikedByMe);
        }

        public async Task<PostDto> CreatePostAsync(int userId, CreatePostRequest request)
        {
            var post = new CommunityPost
            {
                PostedByUserId = userId,
                Title = request.Title,
                Content = request.Content,
                PostType = request.PostType ?? "Discussion",
                CreatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false
            };

            _context.CommunityPosts.Add(post);
            await _context.SaveChangesAsync();

            // Load user for mapping
            await _context.Entry(post).Reference(p => p.User).LoadAsync();

            return MapToDto(post, 0, 0, false);
        }

        public async Task DeletePostAsync(int userId, int postId)
        {
            var post = await _context.CommunityPosts
                .FirstOrDefaultAsync(p => p.CommunityPostId == postId && p.PostedByUserId == userId);

            if (post == null) throw new KeyNotFoundException("Post not found or unauthorized");

            post.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ToggleLikePostAsync(int userId, int postId)
        {
            var existingLike = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.EntityType == "Post" && f.EntityId == postId);

            if (existingLike != null)
            {
                if (existingLike.IsDeleted)
                {
                    existingLike.IsDeleted = false;
                    existingLike.SavedAt = DateTimeOffset.UtcNow;
                    await _context.SaveChangesAsync();
                    return true; // Liked
                }
                else
                {
                    existingLike.IsDeleted = true;
                    await _context.SaveChangesAsync();
                    return false; // Unliked
                }
            }

            var newLike = new Favorite
            {
                UserId = userId,
                EntityType = "Post",
                EntityId = postId,
                SavedAt = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false
            };

            _context.Favorites.Add(newLike);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CommentDto> AddCommentAsync(int userId, int postId, CreateCommentRequest request)
        {
            var comment = new CommunityReply
            {
                PostId = postId,
                UserId = userId,
                Content = request.Content,
                CreatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false
            };

            _context.CommunityReplies.Add(comment);
            await _context.SaveChangesAsync();

            await _context.Entry(comment).Reference(r => r.User).LoadAsync();

            return MapCommentToDto(comment);
        }

        public async Task<IEnumerable<CommentDto>> GetPostCommentsAsync(int postId)
        {
            return await _context.CommunityReplies
                .Include(r => r.User)
                .Where(r => r.PostId == postId && !r.IsDeleted)
                .OrderBy(r => r.CreatedAt)
                .Select(r => MapCommentToDto(r))
                .ToListAsync();
        }

        public async Task ReportPostAsync(int userId, int postId, string reason, string details)
        {
            var report = new Report
            {
                ReportedBy = userId,
                EntityType = "Post",
                EntityId = postId,
                Reason = reason,
                Details = details,
                Status = "Pending",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
        }

        private static PostDto MapToDto(CommunityPost post, int likes, int comments, bool isLiked) => new()
        {
            CommunityPostId = post.CommunityPostId,
            AuthorId = post.PostedByUserId,
            AuthorName = post.User != null ? $"{post.User.FirstName} {post.User.LastName}" : "Unknown",
            AuthorProfilePicture = post.User?.ProfilePictureUrl,
            Title = post.Title,
            Content = post.Content,
            PostType = post.PostType,
            LikesCount = likes,
            CommentsCount = comments,
            IsLikedByMe = isLiked,
            CreatedAt = post.CreatedAt
        };

        private static CommentDto MapCommentToDto(CommunityReply reply) => new()
        {
            CommunityReplyId = reply.CommunityReplyId,
            PostId = reply.PostId,
            UserId = reply.UserId,
            UserName = reply.User != null ? $"{reply.User.FirstName} {reply.User.LastName}" : "Unknown",
            UserProfilePicture = reply.User?.ProfilePictureUrl,
            Content = reply.Content,
            CreatedAt = reply.CreatedAt
        };
    }
}
