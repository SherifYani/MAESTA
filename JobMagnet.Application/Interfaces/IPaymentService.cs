using JobMagnet.Application.DTOs.Payment;

namespace JobMagnet.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<WalletBalanceDto> GetMyBalanceAsync(int userId);
        Task<IEnumerable<PaymentTransactionDto>> GetMyTransactionsAsync(int userId, int page, int limit);
        Task<PaymentTransactionDto> ProcessDepositAsync(int userId, DepositRequest request);
        Task<PaymentTransactionDto> RequestWithdrawalAsync(int userId, WithdrawRequest request);
        
        // Escrow & Subscriptions
        Task<EscrowTransactionDto> DepositToEscrowAsync(int clientId, EscrowDepositRequest request);
        Task<EscrowTransactionDto> ReleaseEscrowAsync(int employerId, int contractId);
        Task<EscrowTransactionDto> RefundEscrowAsync(int adminId, int contractId);
        Task<SubscriptionDto> SubscribeToPlanAsync(int userId, SubscribePlanRequest request);
        Task<SubscriptionDto> GetCurrentSubscriptionAsync(int userId);

        // Payment Methods
        Task<IEnumerable<object>> GetPaymentMethodsAsync(int userId);
        Task<object> AddPaymentMethodAsync(int userId, object request);
        Task DeletePaymentMethodAsync(int userId, int methodId);

        // Bank Accounts
        Task<IEnumerable<object>> GetBankAccountsAsync(int userId);
        Task<object> AddBankAccountAsync(int userId, object request);

        Task<double> CalculateFeeAsync(double amount, string type);
    }
}
