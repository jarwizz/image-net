using Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Endpoints;

public static class SearchEndpoints
{
    public static void MapSearchEndpoints(this WebApplication app)
    {
        app.MapGet("/search", async (
            [FromQuery] string? q,
            [FromQuery] int? limit,
            ImageNetRepository repo,
            ILoggerFactory lf) =>
        {
            var log = lf.CreateLogger("search");
            try
            {
                var term = q ?? string.Empty;
                var take = Math.Clamp(limit ?? 50, 1, 500);
                var rows = await repo.SearchAsync(term, take);
                return Results.Ok(rows);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Error in /search");
                return Results.Problem("Internal error; check API logs.");
            }
        });
    }
}
