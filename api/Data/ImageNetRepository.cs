using Npgsql;

namespace Api.Data;

public record SearchRow(string name, int size);

public class ImageNetRepository
{
    private readonly NpgsqlDataSource _ds;
    public ImageNetRepository(NpgsqlDataSource ds) => _ds = ds;

    private const string Sep = " > ";

    private static string DepthExpr(string colOrParam) =>
        $"(array_length(string_to_array({colOrParam}, '{Sep}'), 1) - 1)";

    public async Task<(string name, int size)?> GetNodeAsync(string? prefix)
    {
        const string sqlRoot = @"
            select name, size
            from imagenet_paths
            where position(' > ' in name) = 0
            limit 1;
        ";

        const string sqlByName = @"
            select name, size
            from imagenet_paths
            where name = @p
            limit 1;
        ";

        await using var conn = await _ds.OpenConnectionAsync();
        await using var cmd = new NpgsqlCommand(string.IsNullOrWhiteSpace(prefix) ? sqlRoot : sqlByName, conn);
        if (!string.IsNullOrWhiteSpace(prefix))
            cmd.Parameters.AddWithValue("p", prefix!);

        await using var rdr = await cmd.ExecuteReaderAsync();
        if (await rdr.ReadAsync())
            return (rdr.GetString(0), rdr.GetInt32(1));
        return null;
    }

    public async Task<List<(string name, int size, bool hasChildren)>> GetDirectChildrenAsync(
        string parentPath, int limit, int offset = 0)
    {
        const string sep = " > ";

        const string sql = @"
            select
                name,
                size,
                (size > 0) as has_children
            from imagenet_paths
            where name like @parent || @sep || '%'
            and (array_length(string_to_array(name, @sep), 1) - 1)
                = (array_length(string_to_array(@parent, @sep), 1) - 1) + 1
            order by name
            limit @limit offset @offset;
        ";

        await using var conn = await _ds.OpenConnectionAsync();
        await using var cmd  = new Npgsql.NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("parent", parentPath);
        cmd.Parameters.AddWithValue("sep", sep);
        cmd.Parameters.AddWithValue("limit", limit);
        cmd.Parameters.AddWithValue("offset", offset);

        var rows = new List<(string, int, bool)>();
        await using var rdr = await cmd.ExecuteReaderAsync();
        while (await rdr.ReadAsync())
            rows.Add((rdr.GetString(0), rdr.GetInt32(1), rdr.GetBoolean(2)));
        return rows;
    }

    public async Task<List<SearchRow>> SearchAsync(string q, int limit)
    {
        const string sql = @"
            select name, size
            from imagenet_paths
            where (@q = '' or name ilike '%' || @q || '%')
            order by name
            limit @limit;
        ";

        await using var conn = await _ds.OpenConnectionAsync();
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("q", q ?? string.Empty);
        cmd.Parameters.AddWithValue("limit", limit);

        var list = new List<SearchRow>();
        await using var rdr = await cmd.ExecuteReaderAsync();
        while (await rdr.ReadAsync())
            list.Add(new SearchRow(rdr.GetString(0), rdr.GetInt32(1)));
        return list;
    }
}
