namespace backend.Controllers;

using backend.Data;
using backend.DTOs;
using backend.Extensions;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly AppDbContext _db;
    public ItemController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("items-by-purchase/{purchaseId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetItemsByPurchase(int purchaseId)
    {
        var authUserId = User.GetUserId();

        var items = await _db.Items
            .AsNoTracking()
            .Where(i => i.PurchaseId == purchaseId) // filter by purchase
            .Select(i => new ItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Quantity = i.Quantity,
                PriceInCents = i.PricePerPiece
            })
            .ToListAsync();

        if (items == null || items.Count == 0)
        {
            return Ok(new { });
        }

        return Ok(items);
    }
}
