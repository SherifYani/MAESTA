using JobMagnet.Application.Interfaces;
using System.Threading.Tasks;

namespace JobMagnet.Application.Services
{
    public class AiService : IAiService
    {
        // In a real implementation, this would integrate with OpenAI, Gemini, or a local model.
        // For now, we provide a structured simulation.

        public async Task<string> ChatWithAiAsync(int userId, string prompt)
        {
            await Task.Delay(500); // Simulate network latency
            
            if (prompt.ToLower().Contains("job") || prompt.ToLower().Contains("وظيفة"))
            {
                return "I can help you find jobs! Try searching for 'Developer' or 'Graphic Designer' in the jobs section.";
            }

            return $"AI Response to: '{prompt}'. This is an AI-powered assistant designed to help you with job searches and profile optimization.";
        }

        public async Task<string> GenerateJobDescriptionAsync(string title, string requirements)
        {
            await Task.Delay(800);
            return $@"## Job Description for {title}

### Requirements:
{requirements}

### About the Role:
We are looking for a highly motivated {title} to join our team. The ideal candidate will be responsible for delivering high-quality results and collaborating with cross-functional teams.

### Benefits:
- Competitive Salary
- Remote Work Options
- Health Insurance";
        }

        public async Task<string> AnalyzeResumeAsync(string resumeText)
        {
            await Task.Delay(600);
            return "Resume Analysis: Your profile looks strong in C# and .NET. Consider adding more details about your experience with cloud technologies like Azure or AWS to attract more employers.";
        }

        public async Task<object> ParseResumeAsync(string fileUrl)
        {
            await Task.Delay(1000);
            return new
            {
                FullName = "John Doe",
                Email = "john.doe@example.com",
                Skills = new[] { "C#", ".NET Core", "React", "SQL Server" },
                ExperienceYears = 5,
                Education = "Bachelor of Computer Science"
            };
        }

        public async Task<int> MatchResumeJobAsync(string resumeText, int jobId)
        {
            await Task.Delay(400);
            // Simulated matching logic
            return resumeText.Length % 100 > 70 ? 85 : 45;
        }

        public async Task<IEnumerable<object>> RecommendJobsAsync(int userId)
        {
            await Task.Delay(500);
            return new[]
            {
                new { JobId = 1, Title = "Senior .NET Developer", MatchScore = 95 },
                new { JobId = 2, Title = "Full Stack Engineer", MatchScore = 88 }
            };
        }
    }
}
