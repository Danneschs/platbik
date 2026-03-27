using backend.DTOs;
using backend.Models;

namespace backend.Mappers;

public static class TransactionLogMapper
{
	public static GetTransactionLogDto ToGetDto(TransactionLog log)
	{
		return new GetTransactionLogDto
		{
			Id = log.Id,
			Date = log.Timestamp,
			Type = log.TransactionType.DisplayName,
			FromName = $"{log.FromUser.Name} {log.FromUser.Surname}",
			ToName = $"{log.ToUser.Name} {log.ToUser.Surname}",
			Amount = log.Amount,
			Description = log.Note
		};
	}

}
