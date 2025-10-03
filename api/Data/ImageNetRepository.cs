using Api.Domain;
using Npgsql;

namespace Api.Data;

public record SearchRow(string Name, int Size);

public class ImageNetRepository
{
    private readonly NpgsqlDataSource _ds;

    public ImageNetRepository(NpgsqlDataSource ds) => _ds = ds;

    public async Task<List<(string path, int size)>> GetRowsForPrefixAsync(string prefix)
    {
        var likePrefix = string.IsNullOrEmpty(prefix) ? "" : prefix + Constants.Separator;

        const string sql = @"
            select path, size
            from imagenet_paths
            where (@pref = '' and position(@sep in path) = 0)
               or path = @pref
               or path like (@prefLike || '%')
            order by path;
        ";

        await using var conn = await _ds.OpenConnectionAsync();
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("pref", prefix);
        cmd.Parameters.AddWithValue("prefLike", likePrefix);
        cmd.Parameters.AddWithValue("sep", Constants.Separator);

        var rows = new List<(string path, int size)>();
        await using var rdr = await cmd.ExecuteReaderAsync();
        while (await rdr.ReadAsync())
            rows.Add((rdr.GetString(0), rdr.GetInt32(1)));

        return rows;
    }

    public async Task<(long sumSize, long totalNodes)> AggregateForAsync(string path)
    {
        const string sql = @"
          select coalesce(sum(size),0) as sum_size, count(*) as total_nodes
          from imagenet_paths
          where path = @p or path like @p || ' > %';
        ";

        await using var conn = await _ds.OpenConnectionAsync();
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("p", path);

        await using var rdr = await cmd.ExecuteReaderAsync();
        await rdr.ReadAsync();
        var sum = rdr.GetInt64(0);
        var cnt = rdr.GetInt64(1);
        return (sum, cnt);
    }

    public async Task<List<SearchRow>> SearchAsync(string q, int limit)
    {
        const string sql = @"
            select path as name, size
            from imagenet_paths
            where (@q = '' or path ilike '%' || @q || '%')
            order by path
            limit @limit;
        ";

        await using var conn = await _ds.OpenConnectionAsync();
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("q", q);
        cmd.Parameters.AddWithValue("limit", limit);

        var list = new List<SearchRow>();
        await using var rdr = await cmd.ExecuteReaderAsync();
        while (await rdr.ReadAsync())
            list.Add(new SearchRow(rdr.GetString(0), rdr.GetInt32(1)));

        return list;
    }
}
