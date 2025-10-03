using Api.Data;
using Api.Domain;

namespace Api.Endpoints;

public static class TreeEndpoints
{
    public static void MapTreeEndpoints(this WebApplication app)
    {
        app.MapGet("/tree", async (HttpRequest req, ImageNetRepository repo, ILoggerFactory lf) =>
        {
            var log = lf.CreateLogger("tree");
            try
            {
                var prefix = req.Query["prefix"].ToString() ?? "";
                var prefixSegs = string.IsNullOrEmpty(prefix) ? Array.Empty<string>() : prefix.Split(Constants.Separator);
                var likePrefix = string.IsNullOrEmpty(prefix) ? "" : prefix + Constants.Separator;

                var rows = await repo.GetRowsForPrefixAsync(prefix);

                if (rows.Count == 0)
                    return Results.Ok(new { name = "", path = prefix, size = 0, children = Array.Empty<object>() });

                (string path, int size) rootRow =
                    string.IsNullOrEmpty(prefix)
                    ? rows.First(r => !r.path.Contains(Constants.Separator))
                    : rows.First(r => r.path == prefix);

                var rootName = rootRow.path.Split(Constants.Separator).Last();

                var (rootSum, rootCnt) = await repo.AggregateForAsync(rootRow.path);
                var rootEffective = Metrics.EffectiveSize(rootSum, rootCnt);

                var children = new List<object>();
                foreach (var (path, size) in rows)
                {
                    var segs = path.Split(Constants.Separator);
                    var isDirectChild = string.IsNullOrEmpty(prefix)
                        ? segs.Length == 2
                        : path.StartsWith(likePrefix) && segs.Length == prefixSegs.Length + 1;
                    if (!isDirectChild) continue;

                    var hasKids = rows.Any(r => r.path.StartsWith(path + Constants.Separator));

                    var (sum, cnt) = await repo.AggregateForAsync(path);
                    var effective = Metrics.EffectiveSize(sum, cnt);

                    children.Add(new { name = segs[^1], size = effective, path, hasChildren = hasKids });
                }

                var ordered = children.OrderBy(c => ((dynamic)c).name).ToList();

                return Results.Ok(new
                {
                    name = rootName,
                    size = rootEffective,
                    path = rootRow.path,
                    children = ordered
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
