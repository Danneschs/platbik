using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class TransactionLog
{
	public int Id { get; set; }

	// Lookup na TransactionType
	public int TransactionTypeId { get; set; }
	public TransactionType TransactionType { get; set; } = default!;

	public int Amount { get; set; } // v centech
	public DateTimeOffset Timestamp { get; set; }
	public string? Note { get; set; }

	// FK na Purchase (m��e b�t null � settlement bez konkr�tn�ho n�kupu)
	public int? PurchaseId { get; set; }
	public Purchase? Purchase { get; set; }

	// Od koho komu
	public int FromUserId { get; set; }
	public User FromUser { get; set; } = default!;

	public int ToUserId { get; set; }
	public User ToUser { get; set; } = default!;

	public Guid? GroupId { get; set; } // pokud m� skupiny; jinak pry�
	public bool IsRead { get; set; } = false; // notifikace (ne)p�e�tena
}

