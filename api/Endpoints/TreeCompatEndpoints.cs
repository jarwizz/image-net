using Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Endpoints;

public static class TreeCompatEndpoints
{
    public static void MapTreeCompatEndpoints(this WebApplication app)
    {
        app.MapGet("/tree", async (
            [FromQuery] string? prefix,
            [FromQuery] int? depth,
            [FromQuery] int? limit,
            [FromQuery] int? offset,
            ImageNetRepository repo,
            ILoggerFactory lf) =>
        {
            var log = lf.CreateLogger("tree");
            try
            {
                var p    = (prefix ?? string.Empty).Trim();
                var take = Math.Clamp(limit  ?? 50, 1, 500);
                var skip = Math.Max(offset ?? 0, 0);

                var node = await repo.GetNodeAsync(p);
                if (node is null)
                    return Results.NotFound(new { error = "path not found" });

                var (nodeName, nodeSize) = node.Value;
                var children = await repo.GetDirectChildrenAsync(nodeName, take, skip);
                var childDtos = children
                    .Select(c => new
                    {
                        c.name,
                        c.size,
                        path = c.name,
                        c.hasChildren
                    })
                    .ToList();

                return Results.Ok(new
                {
                    name     = nodeName.Split(" > ").Last(),
                    size     = nodeSize,
                    path     = nodeName,
                    children = childDtos
                });
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Error in /tree");
                return Results.Problem("Internal error; check API logs.");
            }
        });
    }
}
