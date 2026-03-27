namespace backend.Controllers;

using backend.Data;
using backend.Extensions;
using backend.DTOs;
using backend.Mappers;
using backend.Models;
using backend.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class TransactionLogController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly CommitmentService _commitmentService;

    public TransactionLogController(AppDbContext db, CommitmentService commitmentService)
    {
        _db = db;
        _commitmentService = commitmentService;
    }


    [HttpGet("logs-between-users")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GetTransactionLogDto>>> GetLogsBetweenUsers([FromQuery] int userId1, [FromQuery] int userId2)
    {
        var currentUserId = User.GetUserId();

        if (userId1 != currentUserId && userId2 != currentUserId)
            return Forbid();

        var ttPendingSettlement = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.PENDING_SETTLEMENT);

        if (ttPendingSettlement == null)
            return BadRequest("Transaction type not found.");

        var logs = await _db.TransactionLogs
            .Include(tl => tl.TransactionType)
            .Include(tl => tl.FromUser)
            .Include(tl => tl.ToUser)
            .Where(tl =>
                ((tl.FromUserId == userId1 && tl.ToUserId == userId2) ||
                (tl.FromUserId == userId2 && tl.ToUserId == userId1)) &&
                (tl.TransactionTypeId != ttPendingSettlement.Id))
            //.OrderByDescending(tl => tl.Timestamp)
            .Select(tx => TransactionLogMapper.ToGetDto(tx))
            .ToListAsync();

        return Ok(logs);
    }

    [HttpPost("settle")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<CommitmentDto>>> AddSettlement([FromBody] PostTransactionLogDto dto)
    {
        var authUserId = User.GetUserId();

        // Find users by name (or you may want to use IDs instead)
        var FromUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.FromUserId);
        var ToUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.ToUserId);

        if (FromUser == null || ToUser == null)
            return BadRequest("User(s) not found.");

        if (ToUser.Id != authUserId)
            return Forbid();

        // Validate input
        if (dto == null || dto.AmountInCents <= 0 || dto.FromUserId == 0 || dto.ToUserId == 0)
            return BadRequest("Invalid data.");

        // Find a default TransactionType (or set a fixed one)
        var addSettlementType = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.ADD_SETTLEMENT);
        var pendingSettlementType = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.PENDING_SETTLEMENT);

        if (addSettlementType == null || pendingSettlementType == null)
            return BadRequest("Transaction type not found.");

        var pendingSettlementLog = await _db.TransactionLogs
            .Where(tx => tx.FromUserId == dto.FromUserId && tx.ToUserId == dto.ToUserId && tx.TransactionTypeId == pendingSettlementType.Id)
            .OrderByDescending(tx => tx.Id)
            .FirstOrDefaultAsync();
        
        if (pendingSettlementLog == null)
            return Unauthorized("Debtor did not set the debt as paid.");
        
        var settlementLog = await _db.TransactionLogs
            .FirstOrDefaultAsync(tx => tx.FromUserId == dto.FromUserId 
                && tx.ToUserId == dto.ToUserId 
                && tx.TransactionTypeId == addSettlementType.Id 
                && tx.GroupId == pendingSettlementLog.GroupId);
        
        if (settlementLog != null)
            return Unauthorized("This debt has already been settled.");


        var log = new TransactionLog
        {
            FromUserId = dto.FromUserId,
            ToUserId = dto.ToUserId,
            Amount = dto.AmountInCents,
            Timestamp = DateTimeOffset.UtcNow,
            TransactionTypeId = addSettlementType.Id,
            GroupId = pendingSettlementLog.GroupId,
            Note = $"Kupující {FromUser.Name} {FromUser.Surname} zaplatil {ToUser.Name} {ToUser.Surname} hodnotu {dto.AmountInCents / 100.00} {Config.CURRENCY_FORMAT}"
        };

        _db.TransactionLogs.Add(log);
        await _db.SaveChangesAsync();

        try
        {
            var newCommitments = await _commitmentService.GetCommitmentsForUser(authUserId);
            return Ok(newCommitments);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("my-notifications")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetMyNotifications()
    {
        var currentUserId = User.GetUserId();

        var notifications = await _db.TransactionLogs
            .Include(tl => tl.FromUser)
            .Include(tl => tl.ToUser)
            .Include(tl => tl.TransactionType)
            .Where(tl => tl.ToUserId == currentUserId) // && tl.TransactionType.Code == "add_settlement"
            .Select(g => new NotificationDto
            {
                Id = g.Id,
                Type = g.TransactionType.Code,
                Header = g.TransactionType.DisplayName,
                Text = $"Od {g.FromUser.Name} {g.FromUser.Surname} za {g.Amount / 100.00} {Config.CURRENCY_FORMAT}",
                Timestamp = g.Timestamp,
                IsRead = g.IsRead,
            })
            //.OrderByDescending(s => s.Timestamp)
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPost("mark-as-read/{id}")]
    [Authorize]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var currentUserId = User.GetUserId();

        var log = await _db.TransactionLogs.FirstOrDefaultAsync(tl => tl.Id == id && tl.ToUserId == currentUserId);
        if (log == null)
        {
            return NotFound("Transaction log not found.");
        }
        log.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("pending-settle")]
    [Authorize]
    public async Task<IActionResult> CreatePendingSettlement([FromBody] PostTransactionLogDto dto)
    {
        var currentUserId = User.GetUserId();

        // Find users by name (or you may want to use IDs instead)
        var FromUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.FromUserId);
        var ToUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.ToUserId);


        var transactionType = await _db.TransactionTypes.FirstOrDefaultAsync(tt => tt.Code == Config.TransactionTypeCodes.PENDING_SETTLEMENT);

        if (FromUser == null || ToUser == null || transactionType == null)
            return BadRequest("User(s) or transaction type not found.");

        if (FromUser.Id != currentUserId)
            return Forbid();

        var guid = Guid.NewGuid();

        var log = new TransactionLog
        {
            FromUserId = dto.FromUserId,
            ToUserId = dto.ToUserId,
            Amount = dto.AmountInCents,
            Timestamp = DateTimeOffset.UtcNow,
            TransactionTypeId = transactionType.Id,
            GroupId = guid,
            Note = $"Kupující {FromUser.Name} {FromUser.Surname} označil uživateli {ToUser.Name} {ToUser.Surname} hodnotu {dto.AmountInCents / 100.00} {Config.CURRENCY_FORMAT} jako zaplacenou"
        };

        _db.TransactionLogs.Add(log);
        await _db.SaveChangesAsync();
        return Ok();
    }

}
