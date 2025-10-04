using Api.Endpoints;
using Api.Infrastructure;
using Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddPostgres(builder.Configuration);
builder.Services.AddSingleton<ImageNetRepository>();

var app = builder.Build();
app.UseCors();

app.MapHealthEndpoints();
app.MapSearchEndpoints();
app.MapTreeCompatEndpoints();

app.MapGet("/ping", () => "pong");

app.Run();
