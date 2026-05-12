using JobMagnet.Application.DTOs.Interview;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IInterviewService
    {
        Task<InterviewDto> ScheduleInterviewAsync(int employerId, ScheduleInterviewRequest request);
        Task<InterviewDto> UpdateStatusAsync(int userId, int interviewId, UpdateInterviewStatusRequest request);
        Task<InterviewDto> RescheduleAsync(int userId, int interviewId, RescheduleInterviewRequest request);
        Task<InterviewDto> GetInterviewByIdAsync(int userId, int interviewId);
        Task<IEnumerable<InterviewDto>> GetMyInterviewsAsync(int userId, string role, int page = 1, int limit = 20);
        Task DeleteInterviewAsync(int employerId, int interviewId);
    }
}
