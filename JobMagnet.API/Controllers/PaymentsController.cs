using JobMagnet.Application.DTOs.Payment;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalanceAsync()
        {
            var result = await _paymentService.GetMyBalanceAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactionsAsync([FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            var result = await _paymentService.GetMyTransactionsAsync(GetUserId(), page, limit);
            return Ok(result);
        }

        [HttpPost("deposit")]
        public async Task<IActionResult> DepositAsync([FromBody] DepositRequest request)
        {
            var result = await _paymentService.ProcessDepositAsync(GetUserId(), request);
            return Ok(result);
        }

        [HttpPost("withdraw")]
        public async Task<IActionResult> WithdrawAsync([FromBody] WithdrawRequest request)
        {
            try
            {
                var result = await _paymentService.RequestWithdrawalAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("escrow/deposit")]
        public async Task<IActionResult> DepositToEscrowAsync([FromBody] EscrowDepositRequest request)
        {
            try
            {
                var result = await _paymentService.DepositToEscrowAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("escrow/release/{contractId:int}")]
        public async Task<IActionResult> ReleaseEscrowAsync(int contractId)
        {
            try
            {
                var result = await _paymentService.ReleaseEscrowAsync(GetUserId(), contractId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("escrow/refund/{contractId:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RefundEscrowAsync(int contractId)
        {
            try
            {
                var result = await _paymentService.RefundEscrowAsync(GetUserId(), contractId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("/api/subscriptions/subscribe")]
        public async Task<IActionResult> SubscribeToPlanAsync([FromBody] SubscribePlanRequest request)
        {
            try
            {
                var result = await _paymentService.SubscribeToPlanAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpGet("/api/subscriptions/current")]
        public async Task<IActionResult> GetCurrentSubscriptionAsync()
        {
            var result = await _paymentService.GetCurrentSubscriptionAsync(GetUserId());
            if (result == null) return NotFound(new { message = "No active subscription" });
            return Ok(result);
        }

        // --- Payment Methods ---
        [HttpGet("methods")]
        public async Task<IActionResult> GetPaymentMethodsAsync()
        {
            var result = await _paymentService.GetPaymentMethodsAsync(GetUserId());
            return Ok(result);
        }

        [HttpPost("methods")]
        public async Task<IActionResult> AddPaymentMethodAsync([FromBody] object request)
        {
            var result = await _paymentService.AddPaymentMethodAsync(GetUserId(), request);
            return Ok(result);
        }

        [HttpDelete("methods/{id:int}")]
        public async Task<IActionResult> DeletePaymentMethodAsync(int id)
        {
            await _paymentService.DeletePaymentMethodAsync(GetUserId(), id);
            return NoContent();
        }

        // --- Bank Accounts ---
        [HttpGet("bank-accounts")]
        public async Task<IActionResult> GetBankAccountsAsync()
        {
            var result = await _paymentService.GetBankAccountsAsync(GetUserId());
            return Ok(result);
        }

        [HttpPost("bank-accounts")]
        public async Task<IActionResult> AddBankAccountAsync([FromBody] object request)
        {
            var result = await _paymentService.AddBankAccountAsync(GetUserId(), request);
            return Ok(result);
        }

        [HttpGet("calculate-fee")]
        public async Task<IActionResult> CalculateFeeAsync([FromQuery] double amount, [FromQuery] string type)
        {
            var fee = await _paymentService.CalculateFeeAsync(amount, type);
            return Ok(new { amount, type, fee });
        }
    }
}
