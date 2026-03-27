namespace backend.Services;

using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

public class CommitmentService
{
    private readonly AppDbContext _db;

    public CommitmentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CommitmentDto>> GetCommitmentsForUser(int currentUserId)
    {
        var ttPendingSettlement = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.PENDING_SETTLEMENT);
        var ttAddPurchase = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.ADD_PURCHASE);
        var ttAddSettlement = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.ADD_SETTLEMENT);
        var ttRemovePurchase = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.REMOVE_PURCHASE);

        if (ttPendingSettlement == null || ttAddPurchase == null || ttAddSettlement == null || ttRemovePurchase == null)
            throw new InvalidOperationException("One or more required transaction types not found.");

        // Calculate net commitments between users
        var netCommitments = (await _db.TransactionLogs
            // Step 1: select transactions where current user is a participant
            .Where(t => t.TransactionType != null
                        && (t.FromUserId == currentUserId || t.ToUserId == currentUserId)
                        && t.FromUserId != t.ToUserId
                        && t.TransactionTypeId != ttPendingSettlement.Id)
            // Step 2: convert each transaction to directional value from current user's perspective
            .Select(t => new
            {
                OtherUserId = t.FromUserId == currentUserId ? t.ToUserId : t.FromUserId,
                OtherUserName = t.FromUserId == currentUserId ? t.ToUser!.Name : t.FromUser!.Name,
                OtherUserSurname = t.FromUserId == currentUserId ? t.ToUser!.Surname : t.FromUser!.Surname,

                Amount =
                        t.TransactionTypeId == ttAddPurchase.Id
                            ? (t.FromUserId == currentUserId ? -t.Amount : +t.Amount)
                        : t.TransactionTypeId == ttRemovePurchase.Id
                            ? (t.FromUserId == currentUserId ? +t.Amount : -t.Amount)
                        : t.TransactionTypeId == ttAddSettlement.Id
                            ? (t.FromUserId == currentUserId ? -t.Amount : +t.Amount)
                        : 0
            })
            .ToListAsync())
            // Step 3: group transactions by the other user
            .GroupBy(x => new { x.OtherUserId, x.OtherUserName, x.OtherUserSurname })
            // Step 4: sum amounts and create DTO
            .Select(g =>
            {
                var sum = g.Sum(x => x.Amount);
                return new CommitmentDto
                {
                    FromUserId = sum > 0 ? currentUserId : g.Key.OtherUserId,
                    ToUserId = sum > 0 ? g.Key.OtherUserId : currentUserId,
                    TotalInCents = Math.Abs(sum),
                    ToName = g.Key.OtherUserName + " " + g.Key.OtherUserSurname,
                    State = sum > 0 ? "debt" : sum < 0 ? "claim" : "even"
                };
            })
            .ToList();

        return netCommitments;
    }
}
