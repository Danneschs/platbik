namespace backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

using backend.Extensions;
using backend.DTOs;
using Microsoft.Extensions.Caching.Memory;

[ApiController]
[Route("api/[controller]")]
public class ExchangeRateController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;

    public ExchangeRateController(IMemoryCache cache, IHttpClientFactory httpClientFactory)
    {
        _cache = cache;
        _httpClient = httpClientFactory.CreateClient();
    }

    private const int CacheExpirationHours = 24;

    [HttpGet("current-rate")]
    [Authorize]
    public async Task<IActionResult> GetMonthlyRates()
    {
        var currency = Config.CURRENCY_CODE;
        if (currency == Config.CurrencyCodes.CZK)
            return BadRequest("CZK currency does not require exchange rate.");

        // Cache key – unique per currency
        var cacheKey = $"cnb-rate-{currency}";

        // Try to get from cache first
        if (_cache.TryGetValue(cacheKey, out ExchangeRateDto? cached))
        {
            return Ok(cached);
        }

        try
        {
            // Not in cache -- fetch from API
            var now = DateTime.UtcNow;
            var yearMonth = now.ToString("yyyy-MM");

            var response = await _httpClient.GetAsync(
                $"https://api.cnb.cz/cnbapi/exrates/daily-currency-month?currency={currency}&yearMonth={yearMonth}"
            );

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Failed to fetch exchange rates from CNB.");

            var json = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());
            
            if (!json.TryGetProperty("rates", out var rates))
                return NotFound("Exchange rate data not found in API response.");

            var ratesArray = rates.EnumerateArray().ToList();
            if (ratesArray.Count == 0)
            {
                // Handle empty month (e.g., early January) -- try previous month
                var previousMonth = now.AddMonths(-1).ToString("yyyy-MM");
                response = await _httpClient.GetAsync(
                    $"https://api.cnb.cz/cnbapi/exrates/daily-currency-month?currency={currency}&yearMonth={previousMonth}"
                );

                if (!response.IsSuccessStatusCode)
                    return NotFound("No exchange rates available for current or previous month.");

                json = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());
                if (!json.TryGetProperty("rates", out rates))
                    return NotFound("Exchange rate data not found.");

                ratesArray = rates.EnumerateArray().ToList();
                if (ratesArray.Count == 0)
                    return NotFound("No exchange rates available.");
            }

            var last = ratesArray.Last();
            var rate = last.GetProperty("rate").GetDecimal();
            var date = last.GetProperty("validFor").GetString();

            var result = new ExchangeRateDto
            {
                Rate = rate,
                Date = date ?? string.Empty
            };

            // Cache for 24 hours
            _cache.Set(cacheKey, result,
                new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromHours(CacheExpirationHours)));

            return Ok(result);
        }
        catch (JsonException ex)
        {
            return StatusCode(500, $"Failed to parse exchange rate data: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching exchange rates: {ex.Message}");
        }
    }
}
