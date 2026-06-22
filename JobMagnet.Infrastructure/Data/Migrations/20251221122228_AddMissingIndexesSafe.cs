using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobMagnet.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingIndexesSafe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.Sql(@"
IF COL_LENGTH(N'[dbo].[CommunityReplies]', N'PostId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_PostId' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    CREATE INDEX [IX_CommunityReply_PostId] ON [dbo].[CommunityReplies]([PostId]);

IF COL_LENGTH(N'[dbo].[CommunityReplies]', N'UserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_UserId' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    CREATE INDEX [IX_CommunityReply_UserId] ON [dbo].[CommunityReplies]([UserId]);

IF COL_LENGTH(N'[dbo].[CommunityReplies]', N'IsDeleted') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    CREATE INDEX [IX_CommunityReply_IsDeleted] ON [dbo].[CommunityReplies]([IsDeleted]);

IF COL_LENGTH(N'[dbo].[CommunityReplies]', N'CreatedAt') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    CREATE INDEX [IX_CommunityReply_CreatedAt] ON [dbo].[CommunityReplies]([CreatedAt]);
");

            migrationBuilder.Sql(@"
IF COL_LENGTH(N'[dbo].[Proposals]', N'ProjectId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_ProjectId' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    CREATE INDEX [IX_Proposal_ProjectId] ON [dbo].[Proposals]([ProjectId]);

IF COL_LENGTH(N'[dbo].[Proposals]', N'FreelancerUserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_FreelancerUserId' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    CREATE INDEX [IX_Proposal_FreelancerUserId] ON [dbo].[Proposals]([FreelancerUserId]);

IF COL_LENGTH(N'[dbo].[Proposals]', N'Status') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_Status' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    CREATE INDEX [IX_Proposal_Status] ON [dbo].[Proposals]([Status]);

IF COL_LENGTH(N'[dbo].[Proposals]', N'IsDeleted') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    CREATE INDEX [IX_Proposal_IsDeleted] ON [dbo].[Proposals]([IsDeleted]);

IF COL_LENGTH(N'[dbo].[Proposals]', N'ProjectId') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Proposals]', N'Status') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Proposals]', N'IsDeleted') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_ProjectId_Status_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    CREATE INDEX [IX_Proposal_ProjectId_Status_IsDeleted] ON [dbo].[Proposals]([ProjectId], [Status], [IsDeleted]);

IF COL_LENGTH(N'[dbo].[Proposals]', N'SentAt') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_SentAt' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    CREATE INDEX [IX_Proposal_SentAt] ON [dbo].[Proposals]([SentAt]);

IF COL_LENGTH(N'[dbo].[Proposals]', N'ProposedAmount') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_ProposedAmount' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    CREATE INDEX [IX_Proposal_ProposedAmount] ON [dbo].[Proposals]([ProposedAmount]);
");

            migrationBuilder.Sql(@"
IF COL_LENGTH(N'[dbo].[Payments]', N'UserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_UserId' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    CREATE INDEX [IX_Payment_UserId] ON [dbo].[Payments]([UserId]);

IF COL_LENGTH(N'[dbo].[Payments]', N'PaymentProvider') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_PaymentProvider' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    CREATE INDEX [IX_Payment_PaymentProvider] ON [dbo].[Payments]([PaymentProvider]);

IF COL_LENGTH(N'[dbo].[Payments]', N'Status') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_Status' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    CREATE INDEX [IX_Payment_Status] ON [dbo].[Payments]([Status]);

IF COL_LENGTH(N'[dbo].[Payments]', N'Currency') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_Currency' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    CREATE INDEX [IX_Payment_Currency] ON [dbo].[Payments]([Currency]);

IF COL_LENGTH(N'[dbo].[Payments]', N'CreatedAt') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    CREATE INDEX [IX_Payment_CreatedAt] ON [dbo].[Payments]([CreatedAt]);

IF COL_LENGTH(N'[dbo].[Payments]', N'UserId') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Payments]', N'Status') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Payments]', N'CreatedAt') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_UserId_Status_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    CREATE INDEX [IX_Payment_UserId_Status_CreatedAt] ON [dbo].[Payments]([UserId], [Status], [CreatedAt]);

IF COL_LENGTH(N'[dbo].[Payments]', N'TransactionId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_TransactionId' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    CREATE INDEX [IX_Payment_TransactionId] ON [dbo].[Payments]([TransactionId]);
");

            migrationBuilder.Sql(@"
IF COL_LENGTH(N'[dbo].[Transactions]', N'UserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_UserId' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    CREATE INDEX [IX_Transaction_UserId] ON [dbo].[Transactions]([UserId]);

IF COL_LENGTH(N'[dbo].[Transactions]', N'Type') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_Type' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    CREATE INDEX [IX_Transaction_Type] ON [dbo].[Transactions]([Type]);

IF COL_LENGTH(N'[dbo].[Transactions]', N'Status') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_Status' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    CREATE INDEX [IX_Transaction_Status] ON [dbo].[Transactions]([Status]);

IF COL_LENGTH(N'[dbo].[Transactions]', N'CreatedAt') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    CREATE INDEX [IX_Transaction_CreatedAt] ON [dbo].[Transactions]([CreatedAt]);

IF COL_LENGTH(N'[dbo].[Transactions]', N'UserId') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Transactions]', N'Status') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Transactions]', N'CreatedAt') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_UserId_Status_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    CREATE INDEX [IX_Transaction_UserId_Status_CreatedAt] ON [dbo].[Transactions]([UserId], [Status], [CreatedAt]);
");

            migrationBuilder.Sql(@"
IF COL_LENGTH(N'[dbo].[SavedFreelancers]', N'UserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SavedFreelancer_UserId' AND object_id = OBJECT_ID(N'[dbo].[SavedFreelancers]'))
    CREATE INDEX [IX_SavedFreelancer_UserId] ON [dbo].[SavedFreelancers]([UserId]);

IF COL_LENGTH(N'[dbo].[SavedFreelancers]', N'FreelancerUserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SavedFreelancer_FreelancerUserId' AND object_id = OBJECT_ID(N'[dbo].[SavedFreelancers]'))
    CREATE INDEX [IX_SavedFreelancer_FreelancerUserId] ON [dbo].[SavedFreelancers]([FreelancerUserId]);

IF COL_LENGTH(N'[dbo].[SavedFreelancers]', N'UserId') IS NOT NULL
AND COL_LENGTH(N'[dbo].[SavedFreelancers]', N'FreelancerUserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SavedFreelancer_UserId_FreelancerUserId_Unique' AND object_id = OBJECT_ID(N'[dbo].[SavedFreelancers]'))
    CREATE UNIQUE INDEX [IX_SavedFreelancer_UserId_FreelancerUserId_Unique] ON [dbo].[SavedFreelancers]([UserId], [FreelancerUserId]);
");

            migrationBuilder.Sql(@"
IF COL_LENGTH(N'[dbo].[Reviews]', N'ReviewerId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_ReviewerId' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    CREATE INDEX [IX_Review_ReviewerId] ON [dbo].[Reviews]([ReviewerId]);

IF COL_LENGTH(N'[dbo].[Reviews]', N'TargetUserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_TargetUserId' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    CREATE INDEX [IX_Review_TargetUserId] ON [dbo].[Reviews]([TargetUserId]);

IF COL_LENGTH(N'[dbo].[Reviews]', N'ContextEntityId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_ContextEntityId' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    CREATE INDEX [IX_Review_ContextEntityId] ON [dbo].[Reviews]([ContextEntityId]);

IF COL_LENGTH(N'[dbo].[Reviews]', N'RatingValue') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_RatingValue' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    CREATE INDEX [IX_Review_RatingValue] ON [dbo].[Reviews]([RatingValue]);

IF COL_LENGTH(N'[dbo].[Reviews]', N'IsDeleted') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    CREATE INDEX [IX_Review_IsDeleted] ON [dbo].[Reviews]([IsDeleted]);

IF COL_LENGTH(N'[dbo].[Reviews]', N'TargetUserId') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Reviews]', N'IsDeleted') IS NOT NULL
AND COL_LENGTH(N'[dbo].[Reviews]', N'RatingValue') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_TargetUserId_IsDeleted_RatingValue' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    CREATE INDEX [IX_Review_TargetUserId_IsDeleted_RatingValue] ON [dbo].[Reviews]([TargetUserId], [IsDeleted], [RatingValue]);

IF COL_LENGTH(N'[dbo].[Reviews]', N'CreatedAt') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    CREATE INDEX [IX_Review_CreatedAt] ON [dbo].[Reviews]([CreatedAt]);
");

            migrationBuilder.Sql(@"
IF COL_LENGTH(N'[dbo].[Ratings]', N'UserId') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Rating_UserId' AND object_id = OBJECT_ID(N'[dbo].[Ratings]'))
    CREATE INDEX [IX_Rating_UserId] ON [dbo].[Ratings]([UserId]);

IF COL_LENGTH(N'[dbo].[Ratings]', N'AverageRating') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Rating_AverageRating' AND object_id = OBJECT_ID(N'[dbo].[Ratings]'))
    CREATE INDEX [IX_Rating_AverageRating] ON [dbo].[Ratings]([AverageRating]);

IF COL_LENGTH(N'[dbo].[Ratings]', N'TotalReviews') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Rating_TotalReviews' AND object_id = OBJECT_ID(N'[dbo].[Ratings]'))
    CREATE INDEX [IX_Rating_TotalReviews] ON [dbo].[Ratings]([TotalReviews]);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_PostId' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    DROP INDEX [IX_CommunityReply_PostId] ON [dbo].[CommunityReplies];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_UserId' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    DROP INDEX [IX_CommunityReply_UserId] ON [dbo].[CommunityReplies];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    DROP INDEX [IX_CommunityReply_IsDeleted] ON [dbo].[CommunityReplies];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CommunityReply_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[CommunityReplies]'))
    DROP INDEX [IX_CommunityReply_CreatedAt] ON [dbo].[CommunityReplies];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_ProjectId' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    DROP INDEX [IX_Proposal_ProjectId] ON [dbo].[Proposals];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_FreelancerUserId' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    DROP INDEX [IX_Proposal_FreelancerUserId] ON [dbo].[Proposals];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_Status' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    DROP INDEX [IX_Proposal_Status] ON [dbo].[Proposals];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    DROP INDEX [IX_Proposal_IsDeleted] ON [dbo].[Proposals];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_ProjectId_Status_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    DROP INDEX [IX_Proposal_ProjectId_Status_IsDeleted] ON [dbo].[Proposals];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_SentAt' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    DROP INDEX [IX_Proposal_SentAt] ON [dbo].[Proposals];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Proposal_ProposedAmount' AND object_id = OBJECT_ID(N'[dbo].[Proposals]'))
    DROP INDEX [IX_Proposal_ProposedAmount] ON [dbo].[Proposals];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_UserId' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    DROP INDEX [IX_Payment_UserId] ON [dbo].[Payments];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_PaymentProvider' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    DROP INDEX [IX_Payment_PaymentProvider] ON [dbo].[Payments];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_Status' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    DROP INDEX [IX_Payment_Status] ON [dbo].[Payments];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_Currency' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    DROP INDEX [IX_Payment_Currency] ON [dbo].[Payments];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    DROP INDEX [IX_Payment_CreatedAt] ON [dbo].[Payments];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_UserId_Status_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    DROP INDEX [IX_Payment_UserId_Status_CreatedAt] ON [dbo].[Payments];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payment_TransactionId' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
    DROP INDEX [IX_Payment_TransactionId] ON [dbo].[Payments];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_UserId' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    DROP INDEX [IX_Transaction_UserId] ON [dbo].[Transactions];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_Type' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    DROP INDEX [IX_Transaction_Type] ON [dbo].[Transactions];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_Status' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    DROP INDEX [IX_Transaction_Status] ON [dbo].[Transactions];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    DROP INDEX [IX_Transaction_CreatedAt] ON [dbo].[Transactions];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaction_UserId_Status_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
    DROP INDEX [IX_Transaction_UserId_Status_CreatedAt] ON [dbo].[Transactions];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SavedFreelancer_UserId' AND object_id = OBJECT_ID(N'[dbo].[SavedFreelancers]'))
    DROP INDEX [IX_SavedFreelancer_UserId] ON [dbo].[SavedFreelancers];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SavedFreelancer_FreelancerUserId' AND object_id = OBJECT_ID(N'[dbo].[SavedFreelancers]'))
    DROP INDEX [IX_SavedFreelancer_FreelancerUserId] ON [dbo].[SavedFreelancers];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SavedFreelancer_UserId_FreelancerUserId_Unique' AND object_id = OBJECT_ID(N'[dbo].[SavedFreelancers]'))
    DROP INDEX [IX_SavedFreelancer_UserId_FreelancerUserId_Unique] ON [dbo].[SavedFreelancers];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_ReviewerId' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    DROP INDEX [IX_Review_ReviewerId] ON [dbo].[Reviews];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_TargetUserId' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    DROP INDEX [IX_Review_TargetUserId] ON [dbo].[Reviews];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_ContextEntityId' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    DROP INDEX [IX_Review_ContextEntityId] ON [dbo].[Reviews];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_RatingValue' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    DROP INDEX [IX_Review_RatingValue] ON [dbo].[Reviews];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_IsDeleted' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    DROP INDEX [IX_Review_IsDeleted] ON [dbo].[Reviews];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_TargetUserId_IsDeleted_RatingValue' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    DROP INDEX [IX_Review_TargetUserId_IsDeleted_RatingValue] ON [dbo].[Reviews];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Review_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Reviews]'))
    DROP INDEX [IX_Review_CreatedAt] ON [dbo].[Reviews];
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Rating_UserId' AND object_id = OBJECT_ID(N'[dbo].[Ratings]'))
    DROP INDEX [IX_Rating_UserId] ON [dbo].[Ratings];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Rating_AverageRating' AND object_id = OBJECT_ID(N'[dbo].[Ratings]'))
    DROP INDEX [IX_Rating_AverageRating] ON [dbo].[Ratings];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Rating_TotalReviews' AND object_id = OBJECT_ID(N'[dbo].[Ratings]'))
    DROP INDEX [IX_Rating_TotalReviews] ON [dbo].[Ratings];
");
        }
    }
}
