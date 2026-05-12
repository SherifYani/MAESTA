using JobMagnet.Application.DTOs.Payment;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly JobMagnetDbContext _context;

        public PaymentService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<WalletBalanceDto> GetMyBalanceAsync(int userId)
        {
            var wallet = await GetOrCreateWalletAsync(userId);
            return new WalletBalanceDto
            {
                Balance = wallet.Balance,
                PendingBalance = 0, // removed from entity
                Currency = wallet.Currency ?? "USD"
            };
        }

        public async Task<IEnumerable<PaymentTransactionDto>> GetMyTransactionsAsync(int userId, int page = 1, int limit = 20)
        {
            var wallet = await GetOrCreateWalletAsync(userId);

            return await _context.Transactions
                .AsNoTracking()
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(t => new PaymentTransactionDto
                {
                    TransactionId = t.TransactionId,
                    Amount = t.Amount,
                    TransactionType = t.Type,
                    Status = t.Status ?? "",
                    Description = t.Description,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<PaymentTransactionDto> ProcessDepositAsync(int userId, DepositRequest request)
        {
            var wallet = await GetOrCreateWalletAsync(userId);

            // Simulation of payment gateway integration
            var transaction = new Domain.Entities.Transaction
            {
                UserId = userId,
                Amount = request.Amount,
                Type = "Deposit",
                Status = "Completed",
                Description = $"Deposit via {request.PaymentMethod}",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Transactions.Add(transaction);
            wallet.Balance += request.Amount; // In reality, wait for webhook
            wallet.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new PaymentTransactionDto
            {
                TransactionId = transaction.TransactionId,
                Amount = transaction.Amount,
                TransactionType = transaction.Type,
                Status = transaction.Status,
                Description = transaction.Description,
                CreatedAt = transaction.CreatedAt
            };
        }

        public async Task<PaymentTransactionDto> RequestWithdrawalAsync(int userId, WithdrawRequest request)
        {
            var wallet = await GetOrCreateWalletAsync(userId);

            if (wallet.Balance < request.Amount)
                throw new InvalidOperationException("Insufficient balance");

            wallet.Balance -= request.Amount;
            
            var withdrawal = new Domain.Entities.WithdrawalRequest
            {
                UserId = userId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                Status = "Pending",
                RequestedAt = DateTimeOffset.UtcNow
            };

            var transaction = new Domain.Entities.Transaction
            {
                UserId = userId,
                Amount = -request.Amount,
                Type = "Withdrawal",
                Status = "Pending",
                Description = $"Withdrawal request via {request.PaymentMethod}",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.WithdrawalRequests.Add(withdrawal);
            _context.Transactions.Add(transaction);
            wallet.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new PaymentTransactionDto
            {
                TransactionId = transaction.TransactionId,
                Amount = transaction.Amount,
                TransactionType = transaction.Type,
                Status = transaction.Status,
                Description = transaction.Description,
                CreatedAt = transaction.CreatedAt
            };
        }

        public async Task<EscrowTransactionDto> DepositToEscrowAsync(int clientId, EscrowDepositRequest request)
        {
            var wallet = await GetOrCreateWalletAsync(clientId);
            if (wallet.Balance < request.Amount)
                throw new InvalidOperationException("Insufficient balance for escrow deposit");

            wallet.Balance -= request.Amount;
            wallet.UpdatedAt = DateTimeOffset.UtcNow;

            var escrow = new Domain.Entities.EscrowTransaction
            {
                ProjectId = request.ProjectId,
                FreelancerUserId = 0, // Will be set or linked via Project/Proposal
                Amount = request.Amount,
                FeeAmount = 0, // To be calculated based on platform rules
                Currency = wallet.Currency,
                Status = "Held",
                CreatedAt = DateTimeOffset.UtcNow
            };

            var transaction = new Domain.Entities.Transaction
            {
                UserId = clientId,
                Amount = -request.Amount,
                Type = "Payment",
                Status = "Completed",
                Description = $"Escrow deposit for Project {request.ProjectId}",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.EscrowTransactions.Add(escrow);
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new EscrowTransactionDto
            {
                EscrowTransactionId = escrow.EscrowTransactionId,
                ProjectId = escrow.ProjectId,
                Amount = escrow.Amount,
                Status = escrow.Status,
                CreatedAt = escrow.CreatedAt
            };
        }

        public async Task<EscrowTransactionDto> ReleaseEscrowAsync(int employerId, int contractId)
        {
            var escrow = await _context.EscrowTransactions
                .Include(e => e.Project)
                .FirstOrDefaultAsync(e => e.ProjectId == contractId && e.Status == "Held" && !e.IsDeleted);

            if (escrow == null) throw new KeyNotFoundException("Escrow transaction not found for this contract");

            // Basic authorization: Only the project owner can release escrow
            if (escrow.Project?.OwnerUserId != employerId)
                throw new UnauthorizedAccessException("Not authorized to release this escrow");

            escrow.Status = "Released";
            escrow.UpdatedAt = DateTimeOffset.UtcNow;

            var freelancerWallet = await GetOrCreateWalletAsync(escrow.FreelancerUserId);
            freelancerWallet.Balance += escrow.Amount;
            freelancerWallet.UpdatedAt = DateTimeOffset.UtcNow;

            var transaction = new Domain.Entities.Transaction
            {
                UserId = escrow.FreelancerUserId,
                Amount = escrow.Amount,
                Type = "Deposit",
                Status = "Completed",
                Description = $"Payment received for Contract {contractId}",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new EscrowTransactionDto
            {
                EscrowTransactionId = escrow.EscrowTransactionId,
                ProjectId = escrow.ProjectId,
                Amount = escrow.Amount,
                Status = escrow.Status,
                CreatedAt = escrow.CreatedAt
            };
        }

        public async Task<EscrowTransactionDto> RefundEscrowAsync(int adminId, int contractId)
        {
            var escrow = await _context.EscrowTransactions
                .FirstOrDefaultAsync(e => e.ProjectId == contractId && e.Status == "Held" && !e.IsDeleted);

            if (escrow == null) throw new KeyNotFoundException("Escrow transaction not found for this contract");

            escrow.Status = "Refunded";
            escrow.UpdatedAt = DateTimeOffset.UtcNow;

            var clientId = _context.Projects.Where(p => p.ProjectId == escrow.ProjectId).Select(p => p.OwnerUserId).FirstOrDefault();
            var clientWallet = await GetOrCreateWalletAsync(clientId);
            clientWallet.Balance += escrow.Amount;
            clientWallet.UpdatedAt = DateTimeOffset.UtcNow;

            var transaction = new Domain.Entities.Transaction
            {
                UserId = clientId,
                Amount = escrow.Amount,
                Type = "Refund",
                Status = "Completed",
                Description = $"Escrow refund for Contract {contractId}",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new EscrowTransactionDto
            {
                EscrowTransactionId = escrow.EscrowTransactionId,
                ProjectId = escrow.ProjectId,
                Amount = escrow.Amount,
                Status = escrow.Status,
                CreatedAt = escrow.CreatedAt
            };
        }

        public async Task<SubscriptionDto> GetCurrentSubscriptionAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .Where(s => s.UserId == userId && s.IsActive && s.EndDate > DateTimeOffset.UtcNow)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            if (subscription == null) return null!;

            return new SubscriptionDto
            {
                SubscriptionId = subscription.SubscriptionId,
                PlanName = subscription.PlanName,
                ExpiresAt = subscription.EndDate,
                IsActive = subscription.IsActive
            };
        }

        public async Task<SubscriptionDto> SubscribeToPlanAsync(int userId, SubscribePlanRequest request)
        {
            var wallet = await GetOrCreateWalletAsync(userId);
            decimal price = request.PlanName.ToLower() switch
            {
                "premium" => 29.99m * request.Months,
                "business" => 99.99m * request.Months,
                _ => throw new ArgumentException("Invalid plan name")
            };

            if (wallet.Balance < price)
                throw new InvalidOperationException("Insufficient balance for subscription");

            wallet.Balance -= price;
            wallet.UpdatedAt = DateTimeOffset.UtcNow;

            var subscription = new Domain.Entities.Subscription
            {
                UserId = userId,
                PlanName = request.PlanName,
                Price = price,
                Currency = wallet.Currency ?? "USD",
                StartDate = DateTimeOffset.UtcNow,
                EndDate = DateTimeOffset.UtcNow.AddMonths(request.Months),
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var transaction = new Domain.Entities.Transaction
            {
                UserId = userId,
                Amount = -price,
                Type = "Payment",
                Status = "Completed",
                Description = $"Subscription to {request.PlanName} for {request.Months} months",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Subscriptions.Add(subscription);
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new SubscriptionDto
            {
                SubscriptionId = subscription.SubscriptionId,
                PlanName = subscription.PlanName,
                ExpiresAt = subscription.EndDate,
                IsActive = subscription.IsActive
            };
        }

        private async Task<Domain.Entities.UserWallet> GetOrCreateWalletAsync(int userId)
        {
            var wallet = await _context.UserWallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet == null)
            {
                wallet = new Domain.Entities.UserWallet { UserId = userId, Balance = 0, Currency = "USD" };
                _context.UserWallets.Add(wallet);
                await _context.SaveChangesAsync();
            }
            return wallet;
        }
        public async Task<IEnumerable<object>> GetPaymentMethodsAsync(int userId)
        {
            return await _context.PaymentMethods
                .Where(m => m.UserId == userId)
                .Select(m => new { m.PaymentMethodId, m.Provider, m.AccountIdentifier, m.IsDefault })
                .ToListAsync();
        }

        public async Task<object> AddPaymentMethodAsync(int userId, object request)
        {
            // Simulated parsing of request
            var method = new Domain.Entities.PaymentMethod
            {
                UserId = userId,
                Provider = "Visa",
                AccountIdentifier = "**** 4444",
                IsDefault = true
            };
            _context.PaymentMethods.Add(method);
            await _context.SaveChangesAsync();
            return method;
        }

        public async Task DeletePaymentMethodAsync(int userId, int methodId)
        {
            var method = await _context.PaymentMethods.FirstOrDefaultAsync(m => m.PaymentMethodId == methodId && m.UserId == userId);
            if (method != null)
            {
                _context.PaymentMethods.Remove(method);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<object>> GetBankAccountsAsync(int userId)
        {
            return await _context.BankAccounts
                .Where(b => b.UserId == userId)
                .Select(b => new { b.BankAccountId, b.BankName, b.AccountNumber, b.IsVerified })
                .ToListAsync();
        }

        public async Task<object> AddBankAccountAsync(int userId, object request)
        {
            var account = new Domain.Entities.BankAccount
            {
                UserId = userId,
                BankName = "Example Bank",
                AccountNumber = "ACCOUNT-123",
                IsVerified = false
            };
            _context.BankAccounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<double> CalculateFeeAsync(double amount, string type)
        {
            // Simple logic: 5% for payments, 0 for deposits/withdrawals
            double rate = type.ToLower() switch
            {
                "payment" => 0.05,
                "escrow" => 0.05,
                _ => 0
            };
            return await Task.FromResult(amount * rate);
        }
    }
}
