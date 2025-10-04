using Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Endpoints;

public static class ChildrenEndpoints
{
    public static void MapChildrenEndpoints(this WebApplication app)
    {
        app.MapGet("/children", async (
            [FromQuery] string parent,
            [FromQuery] int? limit,
            [FromQuery] int? offset,
            ImageNetRepository repo,
            ILoggerFactory lf) =>
        {
            var log = lf.CreateLogger("children");
            try
            {
                var take = Math.Clamp(limit ?? 50, 1, 500);
                var skip = Math.Max(offset ?? 0, 0);

                // validate parent exists (optional but nice)
                var node = await repo.GetNodeAsync(parent);
                if (node is null) return Results.NotFound(new { error = "parent not found" });

                var rows = await repo.GetDirectChildrenAsync(parent, take, skip);

                var children = rows.Select(r => new {
                    name        = r.name,
                    label       = r.name.Split(" > ").Last(),
                    size        = r.size,
                    path        = r.name,
                    hasChildren = r.hasChildren
                });

                return Results.Ok(new {
                    parent,
                    limit = take,
                    offset = skip,
                    count = rows.Count,
                    children
                });
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Error in /children");
                return Results.Problem("Internal error; check API logs.");
            }
        });
    }
}
