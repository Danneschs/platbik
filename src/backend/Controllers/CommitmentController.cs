namespace backend.Controllers;

using backend.DTOs;
using backend.Extensions;
using backend.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
public class CommitmentController : ControllerBase
{
    private readonly CommitmentService _commitmentService;

    public CommitmentController(CommitmentService commitmentService)
    {
        _commitmentService = commitmentService;
    }

    [HttpGet("all-commitments")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<CommitmentDto>>> GetCommitments()
    {
        var currentUserId = User.GetUserId();

        try
        {
            var commitments = await _commitmentService.GetCommitmentsForUser(currentUserId);
            return Ok(commitments);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
