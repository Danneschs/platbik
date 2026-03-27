namespace backend.Services;

using backend.Data;
using backend.Models;
using backend.DTOs;
using backend.Mappers;

using Microsoft.EntityFrameworkCore;


public class TransactionLogService
{
	private readonly AppDbContext _db;

	public TransactionLogService(AppDbContext db)
	{
		_db = db;
	}

	public async Task AddPurchaseTxAsync(Purchase purchase, CancellationToken ct, Guid? guid = null)
	{
		bool isUpdatePurchase = guid != null ? true : false;

		var transactionType = await _db.TransactionTypes
			.FirstOrDefaultAsync(t => t.Code == Config.TransactionTypeCodes.ADD_PURCHASE, ct);

		if (transactionType == null)
			throw new InvalidOperationException($"TransactionType '{Config.TransactionTypeCodes.ADD_PURCHASE}' not found.");

		int pricePerPersonInCents;

		if (purchase.BuyerPays)
		{
			pricePerPersonInCents = purchase.PriceInCents / (purchase.CoPayerUsers.Count + 1); // +1 for the buyer
		}
		else
		{
			pricePerPersonInCents = purchase.PriceInCents / purchase.CoPayerUsers.Count;
		}

		// Creates new transaction logs from buyer to every co-payer
		foreach (var cp in purchase.CoPayerUsers) {

			var tx = new TransactionLog
				{
				TransactionType = transactionType,
				Amount = pricePerPersonInCents, // in cents
				Timestamp = DateTimeOffset.UtcNow,
				Note = 
				isUpdatePurchase
				? 	
				$"Kupující {purchase.Buyer.Name} {purchase.Buyer.Surname} nakoupil pro {cp.Name} {cp.Surname} za {pricePerPersonInCents/100.00} {Config.CURRENCY_FORMAT} (úprava nákupu)" 
				:
				$"Kupující {purchase.Buyer.Name} {purchase.Buyer.Surname} nakoupil pro {cp.Name} {cp.Surname} za {pricePerPersonInCents/100.00} {Config.CURRENCY_FORMAT}",
				Purchase = purchase,
				FromUser = purchase.Buyer,
				ToUser = cp,
				GroupId = guid
			};
	
			_db.TransactionLogs.Add(tx);
		}
	}

	/**
	 * If we have ID
	 */
	public async Task RemovePurchaseTxAsync(int purchaseId, CancellationToken ct, Guid? guid = null)
	{

		var purchase = await _db.Purchases
			.Include(p => p.Buyer)
			.Include(p => p.Items)
			.Include(p => p.CoPayers)
			.ThenInclude(cp => cp.User)
			.FirstOrDefaultAsync(p => p.Id == purchaseId, ct);

		if (purchase == null)
			throw new InvalidOperationException("Purchase not found.");


		await RemovePurchaseTxAsync(purchase, ct, guid);
	}


	/**
	 *	If we have whole Purchase object
	 */
	public async Task RemovePurchaseTxAsync(Purchase purchase, CancellationToken ct, Guid? guid = null)
	{
		await RemovePurchaseTxAsync(PurchaseMapper.ToRawDto(purchase), ct, guid);
	}

	public async Task RemovePurchaseTxAsync(RawPurchaseDto rawPurchaseDto, CancellationToken ct, Guid? guid = null)
	{
		var transactionType = await _db.TransactionTypes
			.FirstOrDefaultAsync(t => t.Code == Config.TransactionTypeCodes.REMOVE_PURCHASE, ct);

		if (transactionType == null)
			throw new InvalidOperationException($"TransactionType '{Config.TransactionTypeCodes.REMOVE_PURCHASE}' not found.");

		int pricePerPersonInCents;

		if (rawPurchaseDto.BuyerPays)
		{
			pricePerPersonInCents = rawPurchaseDto.PriceInCents / (rawPurchaseDto.CoPayers.Count + 1); // +1 for the buyer
		}
		else
		{
			pricePerPersonInCents = rawPurchaseDto.PriceInCents / (rawPurchaseDto.CoPayers.Count);
		}


		// Creates the same transaction as adding purchase, but with "remove_purchase" type
		foreach (var cp in rawPurchaseDto.CoPayerUsers)
		{
			bool isUpdatePurchase = guid != null ? true : false;
			var tx = new TransactionLog
			{
				TransactionType = transactionType,
				Amount = pricePerPersonInCents, // in cents
				Timestamp = DateTimeOffset.UtcNow,
				Note =
				isUpdatePurchase
				?
				$"Kupující {rawPurchaseDto.Buyer.Name} {rawPurchaseDto.Buyer.Surname} zrušil nákup pro {cp.Name} {cp.Surname} za {pricePerPersonInCents / 100.00} {Config.CURRENCY_FORMAT} (úprava nákupu)"
				:
				$"Kupující {rawPurchaseDto.Buyer.Name} {rawPurchaseDto.Buyer.Surname} zrušil nákup pro {cp.Name} {cp.Surname} za {pricePerPersonInCents / 100.00} {Config.CURRENCY_FORMAT}",
				Purchase = rawPurchaseDto.PurchaseReference,
				FromUser = rawPurchaseDto.Buyer,
				ToUser = cp,
				GroupId = guid
			};

			_db.TransactionLogs.Add(tx);
		}
	}

	public async Task UpdatePurchaseCoPayersInTxAsync(RawPurchaseDto oldPurchase, Purchase newPurchase, CancellationToken ct, Guid? guid = null)
	{
		var oldCoPayerUsers = oldPurchase.CoPayerUsers;
		var newCoPayerUsers = newPurchase.CoPayerUsers;

		if (oldCoPayerUsers == null || newCoPayerUsers == null) {
			return;
		}

		// If oldCoPayerUsers and newCoPayerUsers contain the same user Ids, return
		if (oldCoPayerUsers.Count == newCoPayerUsers.Count &&
			!oldCoPayerUsers.ExceptBy(newCoPayerUsers.Select(u => u.Id), u => u.Id).Any() &&
			!newCoPayerUsers.ExceptBy(oldCoPayerUsers.Select(u => u.Id), u => u.Id).Any() &&
			oldPurchase.BuyerPays == newPurchase.BuyerPays &&
			oldPurchase.PriceInCents == newPurchase.PriceInCents)
		{
			return;
		}

		await RemovePurchaseTxAsync(oldPurchase, ct, guid);
		await AddPurchaseTxAsync(newPurchase, ct, guid);
	}

}
