using System;

namespace JobMagnet.Application.DTOs.General
{
    public class PublicStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalJobs { get; set; }
        public int TotalCompanies { get; set; }
        public int SuccessfulPlacements { get; set; }
    }

    public class PublicCompanyDto
    {
        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public string? Description { get; set; }
        public string? Website { get; set; }
        public string? Industry { get; set; }
        public int OpenJobsCount { get; set; }
    }

    public class AutocompleteDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CategoryDto
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public int JobsCount { get; set; }
    }
}
