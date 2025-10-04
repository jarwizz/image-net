using System.Linq;
using Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Endpoints;

public static class TreeCompatEndpoints
{
    public static void MapTreeCompatEndpoints(this WebApplication app)
    {
        app.MapGet("/tree", async (
            [FromQuery] string? prefix,
            [FromQuery] int? depth,    // accepted but not used (hierarchy is fixed)
            [FromQuery] int? limit,
            [FromQuery] int? offset,
            ImageNetRepository repo,
            ILoggerFactory lf) =>
        {
            var log = lf.CreateLogger("tree");
            try
            {
                var p      = (prefix ?? string.Empty).Trim();
                var take   = Math.Clamp(limit  ?? 50, 1, 500);
                var skip   = Math.Max(offset ?? 0, 0);

                // 1) resolve the node (root if prefix empty)
                var node = await repo.GetNodeAsync(p);
                if (node is null)
                    return Results.NotFound(new { error = "path not found" });

                var (nodeName, nodeSize) = node.Value;

                // 2) get direct children (paged)
                var children = await repo.GetDirectChildrenAsync(nodeName, take, skip);

                // 3) shape for FE (opened node NOT included)
                var childDtos = children
                    .Select(c => new
                    {
                        name        = c.name,   // full path
                        size        = c.size,   // descendants count for that node
                        path        = c.name,   // FE expects 'path'
                        hasChildren = c.hasChildren
                    })
                    .ToList();

                // header shows THIS node’s own size (not sum of children)
                return Results.Ok(new
                {
                    name     = nodeName.Split(" > ").Last(), // display label
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
