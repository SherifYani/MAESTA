using JobMagnet.Application.Interfaces;
using JobMagnet.Application.Services;
using JobMagnet.Application.Settings;
using JobMagnet.Core.Interfaces;
using JobMagnet.Infrastructure.Data;
using JobMagnet.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Minio;
using System.Text;
using Microsoft.AspNetCore.SignalR;
using JobMagnet.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// ─── DbContext ────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<JobMagnetDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── Email Settings ───────────────────────────────────────────────────────────
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailService, JobMagnet.Application.Services.SmtpEmailService>();

// ─── File Storage (MinIO or Local) ───────────────────────────────────────────
builder.Services.AddHttpContextAccessor();
var storageProvider = builder.Configuration.GetValue<string>("Storage:Provider") ?? "Minio";
if (storageProvider.Equals("Local", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddScoped<IStorageService>(sp =>
    {
        var env = sp.GetRequiredService<IWebHostEnvironment>();
        var httpAccessor = sp.GetRequiredService<IHttpContextAccessor>();
        var baseUrl = builder.Configuration.GetValue<string>("Storage:LocalBaseUrl") ?? "";
        return new LocalStorageService(env, httpAccessor, baseUrl);
    });
}
else
{
    builder.Services.Configure<MinioOptions>(builder.Configuration.GetSection("Minio"));
    var minioOptions = builder.Configuration.GetSection("Minio").Get<MinioOptions>();
    if (minioOptions is not null)
    {
        builder.Services.AddMinio(configureClient => configureClient
            .WithEndpoint(minioOptions.Endpoint)
            .WithCredentials(minioOptions.AccessKey, minioOptions.SecretKey)
            .WithSSL(minioOptions.UseSSL)
            .Build());
        builder.Services.AddScoped<IStorageService, MinioStorageService>();
    }
}

// ─── JWT Options ─────────────────────────────────────────────────────────────
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;

// ─── Authentication (JWT Bearer) ─────────────────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtOptions.Issuer,
            ValidAudience            = jwtOptions.Audience,
            IssuerSigningKey         = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ClockSkew                = TimeSpan.Zero
        };

        // Support for SignalR Authentication via Query String
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ─── Application Services ────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IJobSeekerService, JobSeekerService>();
builder.Services.AddScoped<IFreelancerService, FreelancerService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IGigService, GigService>();
builder.Services.AddScoped<IContractService, ContractService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IRealTimeService, SignalRRealTimeService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IInterviewService, InterviewService>();
builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<IGeneralService, GeneralService>();

// ─── SignalR & Controllers ───────────────────────────────────────────────────
builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddHostedService<SystemMaintenanceService>();

// ─── Swagger / OpenAPI ────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title   = "JobMagnet API",
        Version = "v1"
    });

    // إضافة دعم JWT Bearer في Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.ApiKey,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "أدخل التوكن بالصيغة التالية: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Fix for duplicate schema names in different namespaces
    c.CustomSchemaIds(type => type.FullName);
});

// ─── CORS (اختياري - عدّل حسب الـ Frontend URL) ──────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

var app = builder.Build();

// ─── Pipeline ─────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "JobMagnet API v1");
        c.RoutePrefix = string.Empty; // Swagger على الـ root URL
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
