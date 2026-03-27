namespace backend.Controllers;

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{

    public ConfigController(){}


    [HttpGet("currency-format")]
    public ActionResult<ConfigDto> GetCurrencyFormat()
    {
        return Ok(new ConfigDto{ CurrencyFormat = Config.CURRENCY_FORMAT });
    }

}
