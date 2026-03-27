namespace backend.Mappers;

using backend.DTOs;
using backend.Models;

public static class PurchaseMapper
{
	public static Purchase ToEntity(PostPurchaseDto dto, User buyer, List<User> coPayers)
	{
		var purchase = new Purchase
		{
			Name = dto.Name.Trim(),
			BuyerId = dto.BuyerId,
			Buyer = buyer,
			Timestamp = dto.Timestamp.ToUniversalTime(),
			Shop = dto.ShopName.Trim(),
			PriceInCents = CalculatePriceFromItems(dto),
			BuyerPays = dto.BuyerPays, // Default to true if not specified
		};

		// Items
		if (dto.Items?.Count > 0)
		{
			foreach (var itemDto in dto.Items)
			{
				purchase.Items.Add(new Item
				{
					Name = itemDto.Name.Trim(),
					Quantity = itemDto.Quantity,
					PricePerPiece = itemDto.PriceInCents
				});
			}
		}

		// CoPayers
		AddCoPayers(purchase, coPayers);

		return purchase;
	}

	private static void AddCoPayers(Purchase purchase, List<User> coPayers)
	{
		foreach (var coUser in coPayers)
		{
			if (!purchase.CoPayers.Any(cp => cp.UserId == coUser.Id))
			{
				purchase.CoPayers.Add(new CoPayer
				{
					UserId = coUser.Id,
					User = coUser
				});
			}
		}
	}

	public static PostPurchaseDto ToPostDto(Purchase p)
	{
		return new PostPurchaseDto
		{
			Id = p.Id,
			Name = p.Name,
			BuyerId = p.BuyerId,
			CoPayerIds = p.CoPayers.Select(cp => cp.UserId).ToList(),
			Timestamp = p.Timestamp,
			ShopName = p.Shop,
			Items = p.Items.Select(i => new ItemDto
			{
				Name = i.Name,
				Quantity = i.Quantity,
				PriceInCents = i.PricePerPiece
			}).ToList(),
			BuyerPays = p.BuyerPays
		};
	}

	public static int CalculatePriceFromItems(PostPurchaseDto dto)
    {
        int validPrice = 0;
        foreach (var item in dto.Items)
        {
            validPrice += item.PriceInCents * item.Quantity;
        }
        return validPrice;
    }

	public static RawPurchaseDto ToRawDto(Purchase p)
	{
		return new RawPurchaseDto
		{
			Id = p.Id,
			Name = p.Name,
			PriceInCents = p.PriceInCents,
			BuyerPays = p.BuyerPays,
			Timestamp = p.Timestamp,
			Shop = p.Shop,
			BuyerId = p.BuyerId,
			Buyer = p.Buyer, // Reference is fine since we're not modifying
							 // Copy collections if needed for comparison
			Items = p.Items.Select(i => new Item
			{
				Id = i.Id,
				Name = i.Name,
				Quantity = i.Quantity,
				PricePerPiece = i.PricePerPiece,
				PurchaseId = i.PurchaseId
			}).ToList(),
			CoPayers = p.CoPayers.Select(cp => new CoPayer
			{
				UserId = cp.UserId,
				User = cp.User // Reference is fine since we're not modifying
			}).ToList(),
			PurchaseReference = p
		};
	}

	public static GetPurchaseDto ToGetDto(Purchase p)
	{
		return new GetPurchaseDto
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
		};
	}
}
