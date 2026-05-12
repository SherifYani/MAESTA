using JobMagnet.Application.DTOs.Community;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IPostService
    {
        Task<IEnumerable<PostDto>> GetFeedAsync(int userId, int page = 1, int limit = 10);
        Task<PostDto> GetPostDetailsAsync(int userId, int postId);
        Task<PostDto> CreatePostAsync(int userId, CreatePostRequest request);
        Task DeletePostAsync(int userId, int postId);
        Task<bool> ToggleLikePostAsync(int userId, int postId);
        Task<CommentDto> AddCommentAsync(int userId, int postId, CreateCommentRequest request);
        Task<IEnumerable<CommentDto>> GetPostCommentsAsync(int postId);
        Task ReportPostAsync(int userId, int postId, string reason, string details);
    }
}
