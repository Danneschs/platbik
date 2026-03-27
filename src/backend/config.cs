public static class Config
{
    public enum CurrencyCodes
    {
        CZK,
        EUR
    }

    // Supported currency codes as strings (for validation)
    private static readonly HashSet<string> SUPPORTED_CURRENCIES = new() { "CZK", "EUR" };

    // Currency Code to Symbol Mapper
    private static readonly Dictionary<CurrencyCodes, string> CURRENCY_SYMBOLS = new()
    {
        { CurrencyCodes.CZK, "Kč" },
        { CurrencyCodes.EUR, "€" },
    };

    // Parse currency from environment variable or use default
    private static CurrencyCodes ParseCurrencyCode(string? currencyArg)
    {
        if (string.IsNullOrWhiteSpace(currencyArg))
            return CurrencyCodes.CZK; // Default

        currencyArg = currencyArg.Trim().ToUpper();
        
        if (!SUPPORTED_CURRENCIES.Contains(currencyArg))
            return CurrencyCodes.CZK; // Fallback to default if unsupported

        return Enum.Parse<CurrencyCodes>(currencyArg);
    }

    // This will be set from Program.cs
    private static CurrencyCodes? _currencyCode;
    public static CurrencyCodes CURRENCY_CODE
    {
        get => _currencyCode ?? CurrencyCodes.CZK;
        set => _currencyCode = value;
    }

    public static string CURRENCY_FORMAT => CURRENCY_SYMBOLS[CURRENCY_CODE];
    
    public const string PRODUCT_DOMAIN = ""; // If CORS is set in production, set this to the production frontend domain
    public const string DEV_DOMAIN = "http://localhost:5173";

    // Initialize from environment or command line args
    public static void Initialize(string? currencyArg)
    {
        CURRENCY_CODE = ParseCurrencyCode(currencyArg);
    }

    // Transaction Type Codes
    public static class TransactionTypeCodes
    {
        public const string ADD_PURCHASE = "add_purchase";
        public const string ADD_SETTLEMENT = "add_settlement";
        public const string REMOVE_PURCHASE = "remove_purchase";
        public const string PENDING_SETTLEMENT = "pending_settlement";
    }

    // Role Codes
    public static class RoleCodes
    {
        public const string ADMIN = "admin";
        public const string USER = "user";
    }
}