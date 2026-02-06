namespace TutorBackend;

public sealed class AdminKeyFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var options = context.HttpContext.RequestServices.GetRequiredService<AdminAuthOptions>();
        if (string.IsNullOrWhiteSpace(options.AdminApiKey))
        {
            return Results.Problem("ADMIN_API_KEY is not configured on the backend.", statusCode: 500);
        }

        if (!context.HttpContext.Request.Headers.TryGetValue("X-Admin-Key", out var headerValue))
        {
            return Results.Unauthorized();
        }

        if (!string.Equals(headerValue.ToString(), options.AdminApiKey, StringComparison.Ordinal))
        {
            return Results.Unauthorized();
        }

        return await next(context);
    }
}

