namespace JobMagnet.Application.DTOs.Payment
{
    public class DepositRequest
    {
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }

    public class WithdrawRequest
    {
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string AccountDetails { get; set; } = string.Empty;
    }

    public class PaymentTransactionDto
    {
        public int TransactionId { get; set; }
        public decimal Amount { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class WalletBalanceDto
    {
        public decimal Balance { get; set; }
        public decimal PendingBalance { get; set; }
        public string Currency { get; set; } = "USD";
    }

    public class EscrowDepositRequest
    {
        public int ProjectId { get; set; }
        public decimal Amount { get; set; }
    }

    public class EscrowReleaseRequest
    {
        public int EscrowTransactionId { get; set; }
    }

    public class EscrowRefundRequest
    {
        public int EscrowTransactionId { get; set; }
        public string? Reason { get; set; }
    }

    public class EscrowTransactionDto
    {
        public int EscrowTransactionId { get; set; }
        public int ProjectId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class SubscribePlanRequest
    {
        public string PlanName { get; set; } = string.Empty;
        public int Months { get; set; } = 1;
    }

    public class SubscriptionDto
    {
        public int SubscriptionId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public DateTimeOffset ExpiresAt { get; set; }
        public bool IsActive { get; set; }
    }
}
