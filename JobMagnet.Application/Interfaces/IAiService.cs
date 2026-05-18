using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IAiService
    {
        Task<string> ChatWithAiAsync(int userId, string prompt);
        Task<string> GenerateJobDescriptionAsync(string title, string requirements);
        Task<string> AnalyzeResumeAsync(string resumeText);
        Task<object> ParseResumeAsync(string fileUrl);
        Task<int> MatchResumeJobAsync(string resumeText, int jobId);
        Task<IEnumerable<object>> RecommendJobsAsync(int userId);
    }
}
