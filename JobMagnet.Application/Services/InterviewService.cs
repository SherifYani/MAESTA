using JobMagnet.Application.DTOs.Interview;
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
    public class InterviewService : IInterviewService
    {
        private readonly JobMagnetDbContext _context;
        private readonly INotificationService _notificationService;

        public InterviewService(JobMagnetDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<InterviewDto> ScheduleInterviewAsync(int employerUserId, ScheduleInterviewRequest request)
        {
            var application = await _context.JobApplications
                .Include(a => a.Job)
                .Include(a => a.JobSeeker)
                .FirstOrDefaultAsync(a => a.JobApplicationId == request.JobApplicationId);

            if (application == null) throw new KeyNotFoundException("Application not found");
            
            // Basic security: Ensure employer owns the job
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId);
            if (employer == null || application.Job?.PostedByUserId != employerUserId)
                throw new UnauthorizedAccessException("You are not authorized to schedule interviews for this job");

            var interview = new Interview
            {
                JobApplicationId = request.JobApplicationId,
                EmployerId = employer.EmployerId,
                JobSeekerId = application.JobSeekerId,
                Title = request.Title,
                Description = request.Description,
                ScheduledAt = request.ScheduledAt,
                DurationMinutes = request.DurationMinutes,
                MeetingLink = request.MeetingLink,
                Location = request.Location,
                Status = "Scheduled",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Interviews.Add(interview);
            
            // Update application status
            application.Status = "Interviewed";
            
            await _context.SaveChangesAsync();

            // Notify Job Seeker
            if (application.JobSeeker != null)
            {
                await _notificationService.CreateNotificationAsync(application.JobSeeker.UserId, "New Interview Scheduled", $"You have a new interview for {application.Job?.Title}: {request.Title}", "Interview", "/dashboard/applications");
            }

            return await GetInterviewByIdAsync(employerUserId, interview.InterviewId);
        }

        public async Task<InterviewDto> UpdateStatusAsync(int userId, int interviewId, UpdateInterviewStatusRequest request)
        {
            var interview = await _context.Interviews
                .Include(i => i.Employer)
                .Include(i => i.JobSeeker)
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId && !i.IsDeleted);

            if (interview == null) throw new KeyNotFoundException("Interview not found");

            // Authorization: Either Employer or JobSeeker can update status (e.g. Accept/Reject by JobSeeker, Complete by Employer)
            // For simplicity, we check if userId matches either
            var isEmployer = interview.Employer?.UserId == userId;
            var isJobSeeker = interview.JobSeeker?.UserId == userId;

            if (!isEmployer && !isJobSeeker) throw new UnauthorizedAccessException("Not authorized");

            interview.Status = request.Status;
            interview.UpdatedAt = DateTimeOffset.UtcNow;
            interview.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            // Notify other party
            var targetUserId = isEmployer ? interview.JobSeeker!.UserId : interview.Employer!.UserId;
            var targetUrl = isEmployer ? "/dashboard/applications" : "/dashboard/interviews";
            await _notificationService.CreateNotificationAsync(targetUserId, "Interview Status Updated", $"The status of your interview '{interview.Title}' has been changed to {request.Status}", "Interview", targetUrl);

            return await GetInterviewByIdAsync(userId, interviewId);
        }

        public async Task<InterviewDto> RescheduleAsync(int userId, int interviewId, RescheduleInterviewRequest request)
        {
            var interview = await _context.Interviews
                .Include(i => i.Employer)
                .Include(i => i.JobSeeker)
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId && !i.IsDeleted);

            if (interview == null) throw new KeyNotFoundException("Interview not found");

            if (interview.Employer?.UserId != userId && interview.JobSeeker?.UserId != userId)
                throw new UnauthorizedAccessException("Not authorized");

            interview.ScheduledAt = request.NewScheduledAt;
            interview.Status = "Rescheduled";
            interview.UpdatedAt = DateTimeOffset.UtcNow;
            interview.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            var isEmployer = interview.Employer?.UserId == userId;
            var targetUserId = isEmployer ? interview.JobSeeker!.UserId : interview.Employer!.UserId;
            var targetUrl = isEmployer ? "/dashboard/applications" : "/dashboard/interviews";
            await _notificationService.CreateNotificationAsync(targetUserId, "Interview Rescheduled", $"Your interview '{interview.Title}' has been rescheduled to {request.NewScheduledAt}", "Interview", targetUrl);

            return await GetInterviewByIdAsync(userId, interviewId);
        }

        public async Task<InterviewDto> GetInterviewByIdAsync(int userId, int interviewId)
        {
            var interview = await _context.Interviews
                .Include(i => i.Employer).ThenInclude(e => e!.User)
                .Include(i => i.JobSeeker).ThenInclude(js => js!.User)
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId && !i.IsDeleted);

            if (interview == null) throw new KeyNotFoundException("Interview not found");

            if (interview.Employer?.UserId != userId && interview.JobSeeker?.UserId != userId)
                throw new UnauthorizedAccessException("Not authorized");

            return MapToDto(interview);
        }

        public async Task<IEnumerable<InterviewDto>> GetMyInterviewsAsync(int userId, string role, int page = 1, int limit = 20)
        {
            IQueryable<Interview> query = _context.Interviews
                .Include(i => i.Employer).ThenInclude(e => e!.User)
                .Include(i => i.JobSeeker).ThenInclude(js => js!.User)
                .Where(i => !i.IsDeleted);

            if (role == "Employer")
            {
                query = query.Where(i => i.Employer!.UserId == userId);
            }
            else
            {
                query = query.Where(i => i.JobSeeker!.UserId == userId);
            }

            return await query
                .OrderByDescending(i => i.ScheduledAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(i => MapToDto(i))
                .ToListAsync();
        }

        public async Task DeleteInterviewAsync(int employerUserId, int interviewId)
        {
            var interview = await _context.Interviews
                .Include(i => i.Employer)
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId && i.Employer!.UserId == employerUserId);

            if (interview == null) throw new KeyNotFoundException("Interview not found or unauthorized");

            interview.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        private static InterviewDto MapToDto(Interview i) => new()
        {
            InterviewId = i.InterviewId,
            JobApplicationId = i.JobApplicationId,
            EmployerId = i.EmployerId,
            EmployerName = i.Employer?.User != null ? $"{i.Employer.User.FirstName} {i.Employer.User.LastName}" : "Unknown",
            JobSeekerId = i.JobSeekerId,
            JobSeekerName = i.JobSeeker?.User != null ? $"{i.JobSeeker.User.FirstName} {i.JobSeeker.User.LastName}" : "Unknown",
            Title = i.Title,
            Description = i.Description,
            ScheduledAt = i.ScheduledAt,
            DurationMinutes = i.DurationMinutes,
            MeetingLink = i.MeetingLink,
            Location = i.Location,
            Status = i.Status,
            CreatedAt = i.CreatedAt
        };

        public async Task<IEnumerable<AvailableSlotDto>> GetAvailableSlotsAsync(int userId, DateTime? from = null, DateTime? to = null)
        {
            var fromDate = from ?? DateTimeOffset.UtcNow;
            var toDate = to ?? fromDate.AddDays(14);

            var existingInterviews = await _context.Interviews
                .Where(i => (i.EmployerId == userId || i.JobSeekerId == userId)
                         && i.Status != "Cancelled" && i.Status != "Rejected")
                .ToListAsync();

            var slots = new List<AvailableSlotDto>();
            var currentTime = fromDate.DateTime.Date.AddHours(9); // 9 AM local

            while (currentTime < toDate)
            {
                // Skip weekends
                if (currentTime.DayOfWeek != DayOfWeek.Saturday && currentTime.DayOfWeek != DayOfWeek.Sunday)
                {
                    if (currentTime.Hour < 17) // 5 PM
                    {
                        var slotEnd = currentTime.AddMinutes(30);
                        var slotDateTime = new DateTimeOffset(currentTime, TimeSpan.Zero); // UTC

                        var hasConflict = existingInterviews.Any(i =>
                            i.Status != "Cancelled" && i.Status != "Rejected" &&
                            slotDateTime < i.ScheduledAt && slotEnd > i.ScheduledAt.UtcDateTime
                        );

                        slots.Add(new AvailableSlotDto
                        {
                            Time = currentTime.ToString("HH:mm"),
                            DateTime = slotDateTime,
                            DurationMinutes = 30,
                            Available = !hasConflict
                        });

                        currentTime = slotEnd;
                    }
                    else
                    {
                        currentTime = currentTime.AddDays(1).Date.AddHours(9);
                    }
                }
                else
                {
                    currentTime = currentTime.AddDays(1).Date.AddHours(9);
                }
            }

            return slots;
        }
    }
}
