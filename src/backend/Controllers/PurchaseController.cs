namespace backend.Controllers;

using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Mappers;
using backend.Models;
using backend.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

[ApiController]
[Route("api/[controller]")]
public class PurchaseController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TransactionLogService _transactionLogService;

    public PurchaseController(AppDbContext db, TransactionLogService transactionLogService)
    {
        _db = db;
        _transactionLogService = transactionLogService;
    }

    [HttpGet("all-purchases")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GetPurchaseDto>>> GetAll()
    {
        var userId = User.GetUserId();

        var result = await _db.Purchases
                .AsNoTracking() // better for read-only queries
                //.OrderByDescending(p => p.Timestamp)
                .Select(p => new GetPurchaseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    BuyerName = p.Buyer.Name + " " + p.Buyer.Surname,
                    CoPayers = p.CoPayers.Select(cp => new UserDto
                    {
                        Id = cp.User.Id,
                        Name = cp.User.Name,
                        Surname = cp.User.Surname,
                        AccountNumber = cp.User.AccountNumber,
                        Email = cp.User.Email,
                        RoleCode = cp.User.Role.Code
                    }).ToList(),
                    Timestamp = p.Timestamp,
                    ShopName = p.Shop,
                    PriceInCents = p.PriceInCents,
                    BuyerPays = p.BuyerPays
                })
                .ToListAsync();

        return Ok(result);
    }

    [HttpGet("my-purchases")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GetPurchaseDto>>> GetMy()
    {
        var userId = User.GetUserId();

        var result = await _db.Purchases
                .AsNoTracking() // better for read-only queries
                //.OrderByDescending(p => p.Timestamp)
                .Where(p => p.Buyer.Id == userId)
                .Select(p => new GetPurchaseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    BuyerName = p.Buyer.Name + " " + p.Buyer.Surname,
                    CoPayers = p.CoPayers.Select(cp => new UserDto
                    {
                        Id = cp.User.Id,
                        Name = cp.User.Name,
                        Surname = cp.User.Surname,
                        AccountNumber = cp.User.AccountNumber,
                        Email = cp.User.Email,
                        RoleCode = cp.User.Role.Code
                    }).ToList(),
                    Timestamp = p.Timestamp,
                    ShopName = p.Shop,
                    PriceInCents = p.PriceInCents,
                    BuyerPays = p.BuyerPays
                })
                .ToListAsync();

        return Ok(result);
    }

    [HttpPost("add-purchase")]
    [Authorize]
    public async Task<ActionResult<GetPurchaseDto>> Add([FromBody] PostPurchaseDto dto, CancellationToken ct)
    {
        if (!IsValidPurchase(dto)) return BadRequest("Invalid purchase data.");

        var authUserId = User.GetUserId();

        if (dto.BuyerId != authUserId)
            return Forbid();

        var buyer = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.BuyerId, ct);
        if (buyer == null)
            return BadRequest($"Buyer with given ID does not exist.");

        // Load co-payers
        var coPayers = await _db.Users
            .Where(u => dto.CoPayerIds.Contains(u.Id) && u.Id != dto.BuyerId)
            .ToListAsync(ct);

        // Mapping using mapper
        var purchase = PurchaseMapper.ToEntity(dto, buyer, coPayers);

        using var transactionScope = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            // Adds purchase to the database
            _db.Purchases.Add(purchase);

            // Creates needed transactions to this purchase
            await _transactionLogService.AddPurchaseTxAsync(purchase, ct);

            await _db.SaveChangesAsync(ct);
            await transactionScope.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            await transactionScope.RollbackAsync(ct);
            return BadRequest(ex.Message);
        }

        // Reload purchase with all related data for DTO mapping
        var savedPurchase = await _db.Purchases
            .Include(p => p.Buyer)
            .Include(p => p.CoPayers)
                .ThenInclude(cp => cp.User)
                    .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(p => p.Id == purchase.Id, ct);

        if (savedPurchase == null)
            return NotFound("Purchase not found after save.");

        // Return newly saved purchase as DTO (outside transaction)
        return Ok(PurchaseMapper.ToGetDto(savedPurchase));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var authUserId = User.GetUserId();

        var purchase = await _db.Purchases
            .Include(p => p.Buyer)
            .Include(p => p.CoPayers)
                .ThenInclude(cp => cp.User)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (purchase == null)
            return NotFound();

        if (purchase.Buyer.Id != authUserId)
            return Forbid();

        // Creates transaction log for removing purchase
        try
        {
            await _transactionLogService.RemovePurchaseTxAsync(id, ct);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }

        _db.Purchases.Remove(purchase);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpPut("update")]
    [Authorize]
    public async Task<ActionResult<GetPurchaseDto>> Update([FromBody] PostPurchaseDto dto, CancellationToken ct)
    {
        var authUserId = User.GetUserId();

        if (dto.BuyerId != authUserId)
            return Forbid();

        if (dto == null || dto.Id == 0 || !IsValidPurchase(dto))
            return BadRequest("Invalid purchase data.");

        // Select purchase
        var purchase = await _db.Purchases
            .Include(p => p.Buyer)
            .Include(p => p.Items)
            .Include(p => p.CoPayers)
                .ThenInclude(cp => cp.User)
            .FirstOrDefaultAsync(p => p.Id == dto.Id);

        if (purchase == null)
            return NotFound("Purchase not found.");

        // Create a deep copy for comparison
        var oldPurchase = PurchaseMapper.ToRawDto(purchase);

        if (oldPurchase == null)
            return NotFound("Cannot copy purchase.");


        /* 
		 *	Basic fields update
		 */
        purchase.Name = dto.Name;
        purchase.Timestamp = dto.Timestamp;
        purchase.Shop = dto.ShopName;
        purchase.PriceInCents = PurchaseMapper.CalculatePriceFromItems(dto);
        purchase.BuyerPays = dto.BuyerPays;

        /*
		 *	Items update
		 */
        var existingItems = purchase.Items.ToList();

        // List IDs from DTO
        var newItemIds = dto.Items.Select(i => i.Id).ToHashSet();

        // Delete removed items
        foreach (var item in existingItems)
        {
            if (!newItemIds.Contains(item.Id))
            {
                _db.Items.Remove(item);
            }
        }

        // Update and add new items
        foreach (var dtoItem in dto.Items)
        {
            var existing = existingItems.FirstOrDefault(i => i.Id == dtoItem.Id);

            if (existing != null)
            {
                // Update existing
                existing.Name = dtoItem.Name;
                existing.PricePerPiece = dtoItem.PriceInCents;
                existing.Quantity = dtoItem.Quantity;
            }
            else
            {
                // Add new
                purchase.Items.Add(new Item
                {
                    Name = dtoItem.Name,
                    PricePerPiece = dtoItem.PriceInCents,
                    Quantity = dtoItem.Quantity,
                    PurchaseId = purchase.Id
                });
            }
        }

        /*
		 *	CoPayers update
		 */

        // Load coPayers
        var newCoPayers = await _db.Users
            .Where(u => dto.CoPayerIds.Contains(u.Id) && u.Id != dto.BuyerId)
            .ToListAsync(ct);

        var existingCoPayers = purchase.CoPayerUsers;

        // Add new coPayers
        foreach (var ncp in newCoPayers)
        {
            if (!existingCoPayers.Any(ocp => ocp.Id == ncp.Id))
            {
                purchase.CoPayers.Add(new CoPayer
                {
                    UserId = ncp.Id,
                    User = ncp
                });
            }
        }

        // Remove old coPayers
        foreach (var ecp in existingCoPayers)
        {
            if (!newCoPayers.Any(ncp => ncp.Id == ecp.Id))
            {
                var toRemove = purchase.CoPayers.FirstOrDefault(cp => cp.UserId == ecp.Id);
                if (toRemove != null)
                {
                    purchase.CoPayers.Remove(toRemove);
                    //_db.CoPayers.Remove(toRemove); // cascade
                }
            }
        }

        /*
		 *	Transactions update
		 */
        // Creates transaction log for updating purchase
        using var transactionScope = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            // Group ID
            Guid guid = Guid.NewGuid();

            // Updates transaction logs - remove old and add new coPayers
            await _transactionLogService.UpdatePurchaseCoPayersInTxAsync(oldPurchase, purchase, ct, guid);

            await _db.SaveChangesAsync(ct);
            await transactionScope.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            await transactionScope.RollbackAsync(ct);
            return BadRequest(ex.Message);
        }

        // Reload purchase with all related data for DTO mapping
        var savedPurchase = await _db.Purchases
            .Include(p => p.Buyer)
            .Include(p => p.CoPayers)
                .ThenInclude(cp => cp.User)
                    .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(p => p.Id == purchase.Id, ct);

        if (savedPurchase == null)
            return NotFound("Purchase not found after update.");

        // Return newly saved purchase as DTO
        return Ok(PurchaseMapper.ToGetDto(savedPurchase));
    }

    private bool IsValidPurchase(PostPurchaseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || PurchaseMapper.CalculatePriceFromItems(dto) <= 0 || dto.BuyerId <= 0)
            return false;
        if (dto.CoPayerIds == null || !dto.CoPayerIds.Any())
            return false;
        if (dto.Items == null || !dto.Items.Any())
            return false;


        return true;
    }


}
