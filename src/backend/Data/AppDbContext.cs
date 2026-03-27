namespace backend.Data;

using backend.Models;

using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<PendingUser> PendingUsers { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<CoPayer> CoPayers { get; set; }
    public DbSet<TransactionLog> TransactionLogs { get; set; }
    public DbSet<TransactionType> TransactionTypes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ------------------------------------------------------------
        // 1) Purchase -> Buyer (User)  [1:N]
        // Convention would handle this (BuyerId + nav Buyer + nav PurchasesBought).
        // We explicitly set DeleteBehavior.Restrict so that when deleting a User,
        // EF doesn't attempt cascade through multiple tables (SQLite has limitations).
        // ------------------------------------------------------------
        modelBuilder.Entity<Purchase>()
            .HasOne(p => p.Buyer)
            .WithMany(u => u.PurchasesBought)
            .HasForeignKey(p => p.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        // ------------------------------------------------------------
        // 2) CoPayer join:   Purchase *..* User
        // Convention: PurchaseId + UserId + navs would suffice; but we'll add index
        // and prevent duplicates (User cannot be twice in the same purchase).
        // ------------------------------------------------------------
        // Create composite primary key from PurchaseId and UserId.
        modelBuilder.Entity<CoPayer>()
            .HasKey(cp => new { cp.PurchaseId, cp.UserId });

        modelBuilder.Entity<CoPayer>()
            .HasOne(cp => cp.Purchase)
            .WithMany(p => p.CoPayers)
            .HasForeignKey(cp => cp.PurchaseId)
            .OnDelete(DeleteBehavior.Cascade); // delete Purchase -> delete CoPayers

        modelBuilder.Entity<CoPayer>()
            .HasOne(cp => cp.User)
            .WithMany(u => u.CoPayerIn)
            .HasForeignKey(cp => cp.UserId)
            .OnDelete(DeleteBehavior.Restrict); // don't delete user automatically

        // ------------------------------------------------------------
        // 3) TransactionLog -> TransactionType  [M:1 Lookup]
        // ------------------------------------------------------------
        modelBuilder.Entity<TransactionLog>()
            .HasOne(t => t.TransactionType)
            .WithMany(tt => tt.TransactionLogs)
            .HasForeignKey(t => t.TransactionTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // ------------------------------------------------------------
        // 4) TransactionLog -> FromUser, ToUser   (twice to the same entity)
        // Convention confused? Better to be explicit.
        // ------------------------------------------------------------
        modelBuilder.Entity<TransactionLog>()
            .HasOne(t => t.FromUser)
            .WithMany(u => u.TransactionsSent)
            .HasForeignKey(t => t.FromUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TransactionLog>()
            .HasOne(t => t.ToUser)
            .WithMany(u => u.TransactionsReceived)
            .HasForeignKey(t => t.ToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // ------------------------------------------------------------
        // 5) TransactionLog -> Purchase (optional)
        // ------------------------------------------------------------
        modelBuilder.Entity<TransactionLog>()
            .HasOne(t => t.Purchase)
            .WithMany() // don't want back collection; or .WithMany(p => p.TransactionLogs) if adding nav
            .HasForeignKey(t => t.PurchaseId)
            .OnDelete(DeleteBehavior.SetNull);

        // ------------------------------------------------------------
        // 6) Item -> Purchase  [1:N]
        // Convention would handle this; for demonstration we leave it to EF.
        // ------------------------------------------------------------

        // ------------------------------------------------------------
        // 7) Role -> User  [1:N]
        // ------------------------------------------------------------
        modelBuilder.Entity<Role>()
            .HasMany(r => r.Users)
            .WithOne(u => u.Role)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // ------------------------------------------------------------
        // SEED: TransactionType lookup (static data)
        // IMPORTANT: No runtime calculations; only constants.
        // ------------------------------------------------------------
        modelBuilder.Entity<TransactionType>().HasData(
            new TransactionType { Id = 1, Code = Config.TransactionTypeCodes.ADD_PURCHASE, DisplayName = "Přidání nákupu" },
            new TransactionType { Id = 2, Code = Config.TransactionTypeCodes.ADD_SETTLEMENT, DisplayName = "Přidání platby" },
            new TransactionType { Id = 3, Code = Config.TransactionTypeCodes.REMOVE_PURCHASE, DisplayName = "Zrušení nákupu" },
            new TransactionType { Id = 4, Code = Config.TransactionTypeCodes.PENDING_SETTLEMENT, DisplayName = "Čekající platba" }
        );

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Code = Config.RoleCodes.ADMIN, DisplayName = "Administrátor" },
            new Role { Id = 2, Code = Config.RoleCodes.USER, DisplayName = "Uživatel" }
        );
    }
}
