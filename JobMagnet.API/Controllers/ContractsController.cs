using JobMagnet.Application.DTOs.Contract;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContractsController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractsController(IContractService contractService)
        {
            _contractService = contractService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateContract([FromBody] CreateContractRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var contract = await _contractService.CreateContractAsync(userId, request);
                return CreatedAtAction(nameof(GetContract), new { id = contract.ContractId }, contract);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetContract(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var contract = await _contractService.GetContractByIdAsync(id, userId);
                return Ok(contract);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("my-contracts")]
        public async Task<IActionResult> GetMyContracts()
        {
            var userId = GetCurrentUserId();
            var contracts = await _contractService.GetMyContractsAsync(userId);
            return Ok(contracts);
        }

        [HttpPut("milestones/{milestoneId:int}/status")]
        public async Task<IActionResult> UpdateMilestoneStatus(int milestoneId, [FromBody] string status)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _contractService.UpdateMilestoneStatusAsync(userId, milestoneId, status);
                return Ok(new { message = "Milestone status updated" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("{id:int}/deliver")]
        public async Task<IActionResult> SubmitDelivery(int id, [FromBody] SubmitDeliveryRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _contractService.SubmitDeliveryAsync(userId, id, request);
                return Ok(new { message = "Delivery submitted successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPut("deliveries/{deliveryId:int}/approve")]
        public async Task<IActionResult> ApproveDelivery(int deliveryId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _contractService.ApproveDeliveryAsync(userId, deliveryId);
                return Ok(new { message = "Delivery approved" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Invalid token");
            return id;
        }
    }
}
