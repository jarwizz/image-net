using Api.Data;

namespace Api.Endpoints;

public static class SearchEndpoints
{
    public static void MapSearchEndpoints(this WebApplication app)
    {
        app.MapGet("/search", async (HttpRequest req, ImageNetRepository repo, ILoggerFactory lf) =>
        {
            var log = lf.CreateLogger("search");
            try
            {
                var q = req.Query["q"].ToString() ?? "";
                var limit = 25;
                _ = int.TryParse(req.Query["limit"], out limit);
                limit = Math.Clamp(limit, 1, 100);

                var results = await repo.SearchAsync(q, limit);
                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Error in /search");
                return Results.Problem("Internal error; check API logs.");
            }
        });
    }
}
