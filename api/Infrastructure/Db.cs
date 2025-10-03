using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Api.Infrastructure;

public static class Db
{
    public static void AddPostgres(this IServiceCollection services, IConfiguration _)
    {
        var cs = BuildConnectionString();

        var dsBuilder = new NpgsqlDataSourceBuilder(cs);
        var dataSource = dsBuilder.Build();

        services.AddSingleton(dataSource);
    }

    public static string BuildConnectionString()
    {
        var env = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (string.IsNullOrWhiteSpace(env))
            return "Host=db;Port=5432;Username=postgres;Password=postgres;Database=imagenet";

        env = env.Trim();
        if (!env.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
            return env;

        var uri = new Uri(env);
        var db = uri.AbsolutePath.Trim('/');
        var userInfo = uri.UserInfo.Split(':', 2);
        var user = Uri.UnescapeDataString(userInfo[0]);
        var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var host = uri.Host;
        var port = uri.IsDefaultPort ? 5432 : uri.Port;

        return $"Host={host};Port={port};Username={user};Password={pass};Database={db}";
    }
}
