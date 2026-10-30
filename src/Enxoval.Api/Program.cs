using System.Text.Json.Serialization;
using Enxoval.Api;
using Enxoval.Api.Data;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("Enxoval")));
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<ClimaService>(c => c.Timeout = TimeSpan.FromSeconds(15));
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

// T1: conta do casal (e-mail + senha), sessão por cookie.
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
        o.Password.RequiredLength = 8;
        o.Password.RequireDigit = false;
        o.Password.RequireLowercase = false;
        o.Password.RequireUppercase = false;
        o.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<AppDbContext>();
// Hospedado (Dockerfile): chaves que cifram o cookie de login no volume, senão todo deploy desloga todo mundo.
if (builder.Configuration["DataProtection:Pasta"] is { } pastaChaves)
    builder.Services.AddDataProtection().PersistKeysToFileSystem(Directory.CreateDirectory(pastaChaves));
builder.Services.ConfigureApplicationCookie(o =>
{
    o.Cookie.Name = "enxoval.auth";
    // Fora do Development o acesso é sempre HTTPS (o proxy do host repassa em HTTP): cookie só em conexão segura.
    if (!builder.Environment.IsDevelopment()) o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.ExpireTimeSpan = TimeSpan.FromDays(30);
    o.SlidingExpiration = true;
    // API: responder 401/403 em vez de redirecionar para uma página de login.
    o.Events.OnRedirectToLogin = c => { c.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = c => { c.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
});
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<EnxovalAtual>();
builder.Services.AddSingleton<ArmazenamentoFotos>();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    // Enxovais são criados no primeiro login de cada conta (EnxovalAtual).
    await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
    if (app.Configuration.GetValue<bool>("Demo:Ativo")) await DadosDemonstracao.GarantirAsync(scope.ServiceProvider);
}

// JSON inválido (ex.: enum desconhecido) é erro do cliente: 400, não 500.
app.UseExceptionHandler(new ExceptionHandlerOptions
{
    StatusCodeSelector = ex => ex is BadHttpRequestException b ? b.StatusCode : StatusCodes.Status500InternalServerError,
});
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapEndpoints();

app.Run();
