using Microsoft.AspNetCore.Identity;

namespace Enxoval.Api;

public static class AuthEndpoints
{
    /// <summary>
    /// Endpoints prontos do Identity em /api/auth: register, login (?useCookies=true),
    /// manage/info (GET: conta logada; POST: trocar senha) etc. Mais o logout, que o Identity não traz.
    /// </summary>
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var auth = app.MapGroup("/api/auth").WithTags("Auth");
        auth.MapIdentityApi<IdentityUser>();
        auth.MapPost("/sair", async (SignInManager<IdentityUser> signIn) =>
        {
            await signIn.SignOutAsync();
            return Results.NoContent();
        }).RequireAuthorization();
    }
}
