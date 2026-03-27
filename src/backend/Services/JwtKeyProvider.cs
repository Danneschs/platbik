public class JwtKeyProvider : IJwtKeyProvider
{
    public string Key { get; }

    public JwtKeyProvider(string key)
    {
        Key = key;
    }
}