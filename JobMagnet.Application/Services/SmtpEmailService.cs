using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using JobMagnet.Application.Interfaces;
using JobMagnet.Application.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JobMagnet.Application.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly SmtpOptions _smtpOptions;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IOptions<SmtpOptions> smtpOptions, ILogger<SmtpEmailService> logger)
        {
            _smtpOptions = smtpOptions.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            try
            {
                using var client = new SmtpClient(_smtpOptions.Host, _smtpOptions.Port)
                {
                    Credentials = new NetworkCredential(_smtpOptions.Username, _smtpOptions.Password),
                    EnableSsl = _smtpOptions.EnableSsl
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_smtpOptions.FromEmail, _smtpOptions.FromName),
                    Subject = subject,
                    Body = htmlMessage,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                _logger.LogInformation($"Sending email to {toEmail} with subject: {subject}");
                await client.SendMailAsync(mailMessage);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error sending email to {toEmail}");
                // Handle/Log appropriately
            }
        }
    }
}
