using System;

namespace JobMagnet.Application.DTOs.Community
{
    public class PostDto
    {
        public int CommunityPostId { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorProfilePicture { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? PostType { get; set; }
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
        public bool IsLikedByMe { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class CreatePostRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? PostType { get; set; }
    }

    public class CommentDto
    {
        public int CommunityReplyId { get; set; }
        public int PostId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserProfilePicture { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class CreateCommentRequest
    {
        public string Content { get; set; } = string.Empty;
    }

    public class ReportPostRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string? Details { get; set; }
    }
}
