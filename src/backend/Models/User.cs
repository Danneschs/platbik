using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Index(nameof(Email), IsUnique = true)]
public class User
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Email { get; set; } = default!;

    [MaxLength(100)]
    public string Name { get; set; } = default!;

    [MaxLength(100)]
    public string Surname { get; set; } = default!;

    [MaxLength(50)]
    public string AccountNumber { get; set; } = default!;

    public string PasswordHash { get; set; } = default!;

    public DateTimeOffset CreatedAt { get; set; } = DateTime.UtcNow;

    // FK na role
    public int RoleId { get; set; }
    public virtual Role Role { get; set; } = default!;

    // --- Navigace ---
    // N�kupy, kde je tento user kupuj�c� (Buyer)
    [InverseProperty(nameof(Purchase.Buyer))]
    public ICollection<Purchase> PurchasesBought { get; set; } = new List<Purchase>();

    // CoPayer join z�znamy, kde je user spolup�isp�vatel
    [InverseProperty(nameof(CoPayer.User))]
    public ICollection<CoPayer> CoPayerIn { get; set; } = new List<CoPayer>();

    // Transakce, kde je user odes�latel / p��jemce
    [InverseProperty(nameof(TransactionLog.FromUser))]
    public ICollection<TransactionLog> TransactionsSent { get; set; } = new List<TransactionLog>();

    [InverseProperty(nameof(TransactionLog.ToUser))]
    public ICollection<TransactionLog> TransactionsReceived { get; set; } = new List<TransactionLog>();
}

