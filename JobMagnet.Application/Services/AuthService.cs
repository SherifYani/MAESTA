using JobMagnet.Application.DTOs.Auth;
using JobMagnet.Application.Interfaces;
using JobMagnet.Application.Settings;
using JobMagnet.Core.Interfaces;
using JobMagnet.Domain.Entities;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JobMagnet.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly JobMagnetDbContext _context;
        private readonly ILogger<AuthService> _logger;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;
        private readonly IPlatformSettingsService _platformSettingsService;
        private readonly JwtOptions _jwtOptions;

        public AuthService(
            JobMagnetDbContext context,
            ILogger<AuthService> logger,
            IJwtTokenService jwtTokenService,
            IPasswordHasher passwordHasher,
            IEmailService emailService,
            IPlatformSettingsService platformSettingsService,
            IOptions<JwtOptions> jwtOptions)
        {
            _context = context;
            _logger = logger;
            _jwtTokenService = jwtTokenService;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
            _platformSettingsService = platformSettingsService;
            _jwtOptions = jwtOptions.Value;
        }

        private string GenerateOtpCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        public async Task<AuthResponse> RegisterStep1Async(RegisterStep1Request request, string? ipAddress = null)
        {
            if (!await _platformSettingsService.GetBoolAsync("allowRegistrations", true))
                throw new InvalidOperationException("New registrations are currently disabled.");

            var normalizedEmail = request.Email.Trim();
            if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
                throw new ArgumentException("Email already exists");

            var user = new User
            {
                Email = normalizedEmail,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone,
                ProfilePictureUrl = string.IsNullOrWhiteSpace(request.ProfilePictureUrl) ? null : request.ProfilePictureUrl,
                LinkedInUrl = string.IsNullOrWhiteSpace(request.LinkedInUrl) ? null : request.LinkedInUrl,
                Gender = string.IsNullOrWhiteSpace(request.Gender) ? null : request.Gender,
                DateOfBirth = request.DateOfBirth,
                Country = string.IsNullOrWhiteSpace(request.Country) ? null : request.Country,
                City = string.IsNullOrWhiteSpace(request.City) ? null : request.City,
                UserType = null,
                RegistrationStatus = "PendingStep2",
                IsActive = true,
                IsEmailVerified = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var (accessToken, accessTokenExpiresAt) = _jwtTokenService.CreateAccessToken(user);
            var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
            var refreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

            var refreshToken = new RefreshToken
            {
                UserId = user.UserId,
                Token = refreshTokenValue,
                CreatedAt = DateTimeOffset.UtcNow,
                ExpiresAt = refreshTokenExpiresAt,
                CreatedByIp = ipAddress
            };

            _context.RefreshTokens.Add(refreshToken);

            // Generate Email OTP
            var otpCode = GenerateOtpCode();
            var otp = new UserOtp
            {
                UserId = user.UserId,
                Code = otpCode,
                Type = OtpType.EmailVerification,
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30)
            };
            _context.UserOtps.Add(otp);

            await _context.SaveChangesAsync();

            // Send Email
            await _emailService.SendEmailAsync(
                user.Email,
                "Verify Your Email - Job Magnet",
                $"<p>Welcome to Job Magnet! Your verification code is: <strong>{otpCode}</strong></p><p>This code expires in 30 minutes.</p>");

            _logger.LogInformation($"User registered: {user.Email} (OTP generated)");

            return new AuthResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                UserType = user.UserType,
                RegistrationStatus = user.RegistrationStatus,
                AccessToken = accessToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshToken = refreshTokenValue,
                RefreshTokenExpiresAt = refreshTokenExpiresAt,
                RequiresTwoFactor = false
            };
        }

        public async Task<RegisterStep2Response> RegisterStep2Async(int userId, RegisterStep2Request request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (user.RegistrationStatus != "PendingStep2")
                throw new InvalidOperationException("Registration step 2 is not allowed for current status");

            var selectedUserType = request.UserType.Trim();

            user.UserType = selectedUserType;
            var requiresApproval = await _platformSettingsService.GetBoolAsync("requireUserApproval", true);
            user.RegistrationStatus = requiresApproval ? "PendingApproval" : "Approved";

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == selectedUserType);
            if (role == null)
            {
                role = new Role
                {
                    RoleName = selectedUserType,
                    CreatedAt = DateTimeOffset.UtcNow,
                    IsDeleted = false
                };

                _context.Roles.Add(role);
                await _context.SaveChangesAsync();
            }

            var hasUserRole = await _context.UserRoles.AnyAsync(ur => ur.UserId == user.UserId && ur.RoleId == role.RoleId);
            if (!hasUserRole)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId,
                    AssignedAt = DateTimeOffset.UtcNow,
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }

            Employer? employerEntity = null;

            switch (selectedUserType)
            {
                case "Freelancer":
                    if (!await _context.Freelancers.AnyAsync(f => f.UserId == user.UserId))
                    {
                        _context.Freelancers.Add(new Freelancer
                        {
                            UserId = user.UserId,
                            ProfessionalTitle = request.ProfessionalTitle,
                            ExperienceYears = request.ExperienceYears,
                            HourlyRate = request.HourlyRate,
                            Currency = request.Currency,
                            PortfolioUrl = request.PortfolioUrl,
                            Bio = request.Bio,
                            DocumentVerificationUrl = request.DocumentVerificationUrl,
                            TotalCompletedProjects = 0,
                            IsVerified = false,
                            IsDeleted = false,
                            CreatedAt = DateTimeOffset.UtcNow
                        });
                    }
                    break;

                case "Employer":
                    employerEntity = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == user.UserId);
                    if (employerEntity == null)
                    {
                        employerEntity = new Employer
                        {
                            UserId = user.UserId,
                            IsVerified = false,
                            VerificationRequestedAt = DateTimeOffset.UtcNow,
                            CreatedAt = DateTimeOffset.UtcNow,
                            IsDeleted = false
                        };
                        _context.Employers.Add(employerEntity);
                    }

                    if (!string.IsNullOrWhiteSpace(request.BusinessEmail))
                        employerEntity.BusinessEmail = request.BusinessEmail;
                    if (!string.IsNullOrWhiteSpace(request.NationalId))
                        employerEntity.NationalId = request.NationalId;
                    if (!string.IsNullOrWhiteSpace(request.TaxNumber))
                        employerEntity.TaxNumber = request.TaxNumber;
                    if (!string.IsNullOrWhiteSpace(request.ContactPerson))
                        employerEntity.ContactPerson = request.ContactPerson;
                    if (!string.IsNullOrWhiteSpace(request.ContactPhone))
                        employerEntity.ContactPhone = request.ContactPhone;

                    employerEntity.UpdatedAt = DateTimeOffset.UtcNow;
                    break;

                case "JobSeeker":
                    var jobSeekerEntity = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == user.UserId);
                    if (jobSeekerEntity == null)
                    {
                        jobSeekerEntity = new JobSeeker
                        {
                            UserId = user.UserId,
                            IsVerified = false,
                            IsDeleted = false,
                            CreatedAt = DateTimeOffset.UtcNow
                        };
                        _context.JobSeekers.Add(jobSeekerEntity);
                    }

                    if (!string.IsNullOrWhiteSpace(request.CVUrl))
                        jobSeekerEntity.CVUrl = request.CVUrl;
                    if (!string.IsNullOrWhiteSpace(request.ProfessionalTitle))
                        jobSeekerEntity.ProfessionalTitle = request.ProfessionalTitle;
                    if (request.ExperienceYears.HasValue)
                        jobSeekerEntity.ExperienceYears = request.ExperienceYears;
                    if (!string.IsNullOrWhiteSpace(request.PreferredJobType))
                        jobSeekerEntity.PreferredJobType = request.PreferredJobType;
                    if (!string.IsNullOrWhiteSpace(request.Bio))
                        jobSeekerEntity.Bio = request.Bio;

                    jobSeekerEntity.UpdatedAt = DateTimeOffset.UtcNow;
                    break;

                case "Client":
                    if (!await _context.Clients.AnyAsync(c => c.UserId == user.UserId))
                    {
                        _context.Clients.Add(new Client
                        {
                            UserId = user.UserId,
                            LegalName = request.LegalName,
                            ContactPhone = request.ContactPhone,
                            Address = request.Address,
                            Website = request.Website,
                            IdentityDocumentUrl = request.IdentityDocumentUrl,
                            IsVerified = false,
                            IsDeleted = false,
                            CreatedAt = DateTimeOffset.UtcNow
                        });
                    }
                    break;

                default:
                    throw new ArgumentException("Invalid user type");
            }

            await _context.SaveChangesAsync();

            if (selectedUserType == "Employer")
            {
                var employer = employerEntity ?? await _context.Employers.FirstOrDefaultAsync(e => e.UserId == user.UserId);
                if (employer != null)
                {
                    var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId);
                    if (company == null)
                    {
                        company = new Company
                        {
                            EmployerId = employer.EmployerId,
                            CompanyName = string.IsNullOrWhiteSpace(request.CompanyName) ? "New Company" : request.CompanyName.Trim(),
                            CreatedAt = DateTimeOffset.UtcNow,
                            IsDeleted = false,
                            IsVerified = false
                        };
                        _context.Companies.Add(company);
                    }

                    if (!string.IsNullOrWhiteSpace(request.CompanyName))
                        company.CompanyName = request.CompanyName.Trim();
                    if (!string.IsNullOrWhiteSpace(request.CompanyDescription))
                        company.Description = request.CompanyDescription;
                    if (!string.IsNullOrWhiteSpace(request.CompanyIndustry))
                        company.Industry = request.CompanyIndustry;
                    if (!string.IsNullOrWhiteSpace(request.CompanySize))
                        company.CompanySize = request.CompanySize;
                    if (request.FoundedYear.HasValue)
                        company.FoundedYear = request.FoundedYear;
                    if (!string.IsNullOrWhiteSpace(request.CompanyCountry))
                        company.Country = request.CompanyCountry;
                    if (!string.IsNullOrWhiteSpace(request.CompanyCity))
                        company.City = request.CompanyCity;
                    if (!string.IsNullOrWhiteSpace(request.CompanyAddress))
                        company.Address = request.CompanyAddress;
                    if (!string.IsNullOrWhiteSpace(request.CompanyWebsite))
                        company.Website = request.CompanyWebsite;
                    if (!string.IsNullOrWhiteSpace(request.CommercialRegistrationNumber))
                        company.CommercialRegistrationNumber = request.CommercialRegistrationNumber;
                    if (!string.IsNullOrWhiteSpace(request.CommercialRegistrationFileUrl))
                        company.CommercialRegistrationFileUrl = request.CommercialRegistrationFileUrl;
                    if (!string.IsNullOrWhiteSpace(request.CompanyLogoUrl))
                        company.LogoUrl = request.CompanyLogoUrl;

                    company.UpdatedAt = DateTimeOffset.UtcNow;

                    await _context.SaveChangesAsync();
                }
            }

            return new RegisterStep2Response
            {
                Message = "Registration step 2 completed. Awaiting admin approval.",
                UserId = user.UserId,
                UserType = user.UserType,
                RegistrationStatus = user.RegistrationStatus
            };
        }

        public async Task VerifyEmailAsync(VerifyEmailRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim());
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (user.IsEmailVerified)
                throw new InvalidOperationException("Email is already verified");

            var otp = await _context.UserOtps
                .Where(o => o.UserId == user.UserId && o.Type == OtpType.EmailVerification && !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != request.Code)
                throw new ArgumentException("Invalid verification code");

            if (otp.ExpiresAt < DateTimeOffset.UtcNow)
                throw new ArgumentException("Verification code expired");

            otp.IsUsed = true;
            user.IsEmailVerified = true;
            await _context.SaveChangesAsync();
        }

        public async Task ResendVerificationAsync(ResendVerificationRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim());
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (user.IsEmailVerified)
                throw new InvalidOperationException("Email is already verified");

            var otpCode = GenerateOtpCode();
            var otp = new UserOtp
            {
                UserId = user.UserId,
                Code = otpCode,
                Type = OtpType.EmailVerification,
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30)
            };

            // Invalidating previous verification codes
            var existingOtps = await _context.UserOtps
                .Where(o => o.UserId == user.UserId && o.Type == OtpType.EmailVerification && !o.IsUsed)
                .ToListAsync();
            foreach (var existing in existingOtps) existing.IsUsed = true;

            _context.UserOtps.Add(otp);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email,
                "Verify Your Email - Job Magnet",
                $"<p>Your new verification code is: <strong>{otpCode}</strong></p><p>This code expires in 30 minutes.</p>");
        }

        public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim());
            if (user == null) return; // Silent return for security

            var otpCode = GenerateOtpCode();
            var otp = new UserOtp
            {
                UserId = user.UserId,
                Code = otpCode,
                Type = OtpType.PasswordReset,
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15)
            };

            var existingOtps = await _context.UserOtps
                .Where(o => o.UserId == user.UserId && o.Type == OtpType.PasswordReset && !o.IsUsed)
                .ToListAsync();
            foreach (var existing in existingOtps) existing.IsUsed = true;

            _context.UserOtps.Add(otp);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email,
                "Password Reset - Job Magnet",
                $"<p>Your password reset code is: <strong>{otpCode}</strong></p><p>This code expires in 15 minutes.</p>");
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim());
            if (user == null)
                throw new KeyNotFoundException("User not found");

            var otp = await _context.UserOtps
                .Where(o => o.UserId == user.UserId && o.Type == OtpType.PasswordReset && !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != request.Code)
                throw new ArgumentException("Invalid reset code");

            if (otp.ExpiresAt < DateTimeOffset.UtcNow)
                throw new ArgumentException("Reset code expired");

            otp.IsUsed = true;
            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
        }

        public async Task<Enable2faResponse> Enable2faAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            if (user.TwoFactorEnabled)
                return new Enable2faResponse { Success = false, Message = "2FA is already enabled." };

            user.TwoFactorEnabled = true;
            await _context.SaveChangesAsync();

            return new Enable2faResponse { Success = true, Message = "2FA enabled successfully via Email." };
        }

        public async Task Disable2faAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            user.TwoFactorEnabled = false;
            await _context.SaveChangesAsync();
        }

        public async Task<AuthResponse> Verify2faAsync(Verify2faRequest request, string? ipAddress = null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim());
            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or code");

            var otp = await _context.UserOtps
                .Where(o => o.UserId == user.UserId && o.Type == OtpType.TwoFactorAuth && !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != request.Code)
                throw new UnauthorizedAccessException("Invalid 2FA code");

            if (otp.ExpiresAt < DateTimeOffset.UtcNow)
            {
                otp.IsUsed = true;
                await _context.SaveChangesAsync();
                throw new UnauthorizedAccessException("2FA code expired");
            }

            otp.IsUsed = true;
            
            // Generate tokens
            var roles = await GetUserRolesAsync(user.UserId);
            var (accessToken, accessTokenExpiresAt) = _jwtTokenService.CreateAccessToken(user, roles);
            var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
            var refreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

            var refreshToken = new RefreshToken
            {
                UserId = user.UserId,
                Token = refreshTokenValue,
                CreatedAt = DateTimeOffset.UtcNow,
                ExpiresAt = refreshTokenExpiresAt,
                CreatedByIp = ipAddress
            };

            _context.RefreshTokens.Add(refreshToken);
            user.LastLoginAt = DateTimeOffset.UtcNow;
            user.FailedLoginAttempts = 0;
            
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                UserType = user.UserType,
                RegistrationStatus = user.RegistrationStatus,
                AccessToken = accessToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshToken = refreshTokenValue,
                RefreshTokenExpiresAt = refreshTokenExpiresAt,
                RequiresTwoFactor = false
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress = null)
        {
            var normalizedEmail = request.Email.Trim();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("User account is inactive");

            if (user.IsDeleted)
                throw new UnauthorizedAccessException("User account is deleted");

            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                user.FailedLoginAttempts++;
                await _context.SaveChangesAsync();
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            if (user.TwoFactorEnabled)
            {
                var otpCode = GenerateOtpCode();
                
                // Invalidate old 2FA otps
                var existingOtps = await _context.UserOtps
                    .Where(o => o.UserId == user.UserId && o.Type == OtpType.TwoFactorAuth && !o.IsUsed)
                    .ToListAsync();
                foreach (var existing in existingOtps) existing.IsUsed = true;

                var otp = new UserOtp
                {
                    UserId = user.UserId,
                    Code = otpCode,
                    Type = OtpType.TwoFactorAuth,
                    ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
                };

                _context.UserOtps.Add(otp);
                await _context.SaveChangesAsync();

                await _emailService.SendEmailAsync(
                    user.Email,
                    "Login Code (2FA) - Job Magnet",
                    $"<p>Your two-factor authentication code is: <strong>{otpCode}</strong></p><p>This code expires in 5 minutes.</p>");

                return new AuthResponse
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    UserType = user.UserType,
                    RegistrationStatus = user.RegistrationStatus,
                    RequiresTwoFactor = true
                };
            }

            user.FailedLoginAttempts = 0;
            var roles = await GetUserRolesAsync(user.UserId);
            var (accessToken, accessTokenExpiresAt) = _jwtTokenService.CreateAccessToken(user, roles);
            var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
            var refreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

            var refreshToken = new RefreshToken
            {
                UserId = user.UserId,
                Token = refreshTokenValue,
                CreatedAt = DateTimeOffset.UtcNow,
                ExpiresAt = refreshTokenExpiresAt,
                CreatedByIp = ipAddress
            };

            _context.RefreshTokens.Add(refreshToken);

            user.LastLoginAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User logged in: {user.Email}");

            return new AuthResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                UserType = user.UserType,
                RegistrationStatus = user.RegistrationStatus,
                AccessToken = accessToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshToken = refreshTokenValue,
                RefreshTokenExpiresAt = refreshTokenExpiresAt
            };
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshRequest request, string? ipAddress = null)
        {
            var existing = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

            if (existing == null)
                throw new UnauthorizedAccessException("Invalid refresh token");

            if (existing.RevokedAt != null)
                throw new UnauthorizedAccessException("Refresh token was revoked");

            if (existing.ExpiresAt <= DateTimeOffset.UtcNow)
                throw new UnauthorizedAccessException("Refresh token expired");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == existing.UserId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (!user.IsActive || user.IsDeleted)
                throw new UnauthorizedAccessException("User is inactive");

            var roles = await GetUserRolesAsync(user.UserId);
            var (accessToken, accessTokenExpiresAt) = _jwtTokenService.CreateAccessToken(user, roles);
            var newRefreshTokenValue = _jwtTokenService.GenerateRefreshToken();
            var newRefreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

            existing.RevokedAt = DateTimeOffset.UtcNow;
            existing.ReplacedByToken = newRefreshTokenValue;
            existing.ReasonRevoked = "Replaced";

            var newRefreshToken = new RefreshToken
            {
                UserId = user.UserId,
                Token = newRefreshTokenValue,
                CreatedAt = DateTimeOffset.UtcNow,
                ExpiresAt = newRefreshTokenExpiresAt,
                CreatedByIp = ipAddress
            };

            _context.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                UserType = user.UserType,
                RegistrationStatus = user.RegistrationStatus,
                AccessToken = accessToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshToken = newRefreshTokenValue,
                RefreshTokenExpiresAt = newRefreshTokenExpiresAt
            };
        }

        public async Task LogoutAsync(int userId, string refreshToken)
        {
            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId);

            if (token == null)
                throw new UnauthorizedAccessException("Invalid refresh token");

            if (token.RevokedAt == null)
            {
                token.RevokedAt = DateTimeOffset.UtcNow;
                token.ReasonRevoked = "Logout";
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> LogoutAllAsync(int userId)
        {
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTimeOffset.UtcNow)
                .ToListAsync();

            foreach (var rt in activeTokens)
            {
                rt.RevokedAt = DateTimeOffset.UtcNow;
                rt.ReasonRevoked = "LogoutAll";
            }

            await _context.SaveChangesAsync();
            return activeTokens.Count;
        }

        public async Task<CurrentUserResponse> GetCurrentUserProfileAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            var userRoles = await GetUserRolesAsync(user.UserId);

            var jobSeeker = await _context.JobSeekers
                .AsNoTracking()
                .FirstOrDefaultAsync(js => js.UserId == user.UserId && !js.IsDeleted);

            var employer = await _context.Employers
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == user.UserId && !e.IsDeleted);

            Company? company = null;
            if (employer != null)
            {
                company = await _context.Companies
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId && !c.IsDeleted);
            }

            return new CurrentUserResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserType = user.UserType,
                RegistrationStatus = user.RegistrationStatus,
                IsActive = user.IsActive,
                Roles = userRoles,
                JobSeekerProfile = jobSeeker == null ? null : new JobSeekerProfileDto
                {
                    JobSeekerId = jobSeeker.JobSeekerId,
                    UserId = jobSeeker.UserId,
                    CvUrl = jobSeeker.CVUrl,
                    ProfessionalTitle = jobSeeker.ProfessionalTitle,
                    ExperienceYears = jobSeeker.ExperienceYears,
                    PreferredJobType = jobSeeker.PreferredJobType,
                    Bio = jobSeeker.Bio,
                    IsVerified = jobSeeker.IsVerified,
                    LastActiveAt = jobSeeker.LastActiveAt,
                    CreatedAt = jobSeeker.CreatedAt,
                    UpdatedAt = jobSeeker.UpdatedAt
                },
                EmployerProfile = employer == null ? null : new EmployerProfileDto
                {
                    EmployerId = employer.EmployerId,
                    UserId = employer.UserId,
                    BusinessEmail = employer.BusinessEmail,
                    NationalId = employer.NationalId,
                    TaxNumber = employer.TaxNumber,
                    ContactPerson = employer.ContactPerson,
                    ContactPhone = employer.ContactPhone,
                    IsVerified = employer.IsVerified,
                    VerificationRequestedAt = employer.VerificationRequestedAt,
                    CreatedAt = employer.CreatedAt,
                    UpdatedAt = employer.UpdatedAt,
                    Company = company == null ? null : new CompanyProfileDto
                    {
                        CompanyId = company.CompanyId,
                        EmployerId = company.EmployerId,
                        CompanyName = company.CompanyName,
                        Description = company.Description,
                        Industry = company.Industry,
                        CompanySize = company.CompanySize,
                        FoundedYear = company.FoundedYear,
                        Country = company.Country,
                        City = company.City,
                        Address = company.Address,
                        Website = company.Website,
                        CommercialRegistrationNumber = company.CommercialRegistrationNumber,
                        CommercialRegistrationFileUrl = company.CommercialRegistrationFileUrl,
                        LogoUrl = company.LogoUrl,
                        IsVerified = company.IsVerified,
                        CreatedAt = company.CreatedAt,
                        UpdatedAt = company.UpdatedAt
                    }
                }
            };
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Current password is incorrect");
            }

            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = userId;

            await _context.SaveChangesAsync();
        }

        public async Task<List<SessionResponse>> GetActiveSessionsAsync(int userId, string currentToken)
        {
            var sessions = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTimeOffset.UtcNow)
                .OrderByDescending(rt => rt.CreatedAt)
                .Select(rt => new SessionResponse
                {
                    TokenId = rt.TokenId,
                    TokenSnippet = rt.Token.Length > 10 ? rt.Token.Substring(rt.Token.Length - 10) : rt.Token,
                    CreatedAt = rt.CreatedAt,
                    ExpiresAt = rt.ExpiresAt,
                    CreatedByIp = rt.CreatedByIp,
                    IsCurrentSession = rt.Token == currentToken
                })
                .ToListAsync();

            return sessions;
        }

        public async Task DeleteAccountAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            user.IsDeleted = true;
            user.IsActive = false;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = userId;

            // Revoke all tokens
            await LogoutAllAsync(userId);

            await _context.SaveChangesAsync();
        }

        private async Task<List<string>> GetUserRolesAsync(int userId)
        {
            return await (from ur in _context.UserRoles
                          join r in _context.Roles on ur.RoleId equals r.RoleId
                          where ur.UserId == userId
                          select r.RoleName)
                .ToListAsync();
        }

        public async Task<AuthResponse> LoginGoogleAsync(string token, string? ipAddress = null)
        {
            _logger.LogInformation("Simulated Google Login for token: {Token}", token);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == "google-user@example.com");
            if (user == null) throw new UnauthorizedAccessException("Social account not found. Please register first.");
            return await LoginInternalAsync(user, ipAddress);
        }

        public async Task<AuthResponse> LoginLinkedInAsync(string token, string? ipAddress = null)
        {
            _logger.LogInformation("Simulated LinkedIn Login for token: {Token}", token);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == "linkedin-user@example.com");
            if (user == null) throw new UnauthorizedAccessException("Social account not found. Please register first.");
            return await LoginInternalAsync(user, ipAddress);
        }

        private async Task<AuthResponse> LoginInternalAsync(User user, string? ipAddress)
        {
            var roles = await GetUserRolesAsync(user.UserId);
            var (accessToken, accessTokenExpiresAt) = _jwtTokenService.CreateAccessToken(user, roles);
            var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
            var refreshToken = new RefreshToken
            {
                UserId = user.UserId,
                Token = refreshTokenValue,
                CreatedAt = DateTimeOffset.UtcNow,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays),
                CreatedByIp = ipAddress
            };
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return new AuthResponse { UserId = user.UserId, Email = user.Email, AccessToken = accessToken, AccessTokenExpiresAt = accessTokenExpiresAt, RefreshToken = refreshTokenValue };
        }
    }
}
