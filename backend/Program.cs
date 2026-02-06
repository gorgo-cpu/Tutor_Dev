using TutorBackend;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddSingleton(new AdminAuthOptions
{
    AdminApiKey = builder.Configuration["ADMIN_API_KEY"] ?? string.Empty
});

var supabaseUrl = builder.Configuration["SUPABASE_URL"];
var supabaseServiceRoleKey = builder.Configuration["SUPABASE_SERVICE_ROLE_KEY"];

if (!string.IsNullOrWhiteSpace(supabaseUrl) && !string.IsNullOrWhiteSpace(supabaseServiceRoleKey))
{
    builder.Services.AddHttpClient<SupabaseAdminClient>(client =>
    {
        client.BaseAddress = new Uri(supabaseUrl);
        client.DefaultRequestHeaders.Add("apikey", supabaseServiceRoleKey);
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", supabaseServiceRoleKey);
    });
}

var app = builder.Build();

app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

var admin = app.MapGroup("/admin");
admin.AddEndpointFilter<AdminKeyFilter>();

admin.MapPost("/approve-role", async (ApproveRoleRequest request, SupabaseAdminClient supabase, CancellationToken ct) =>
{
    if (!Guid.TryParse(request.UserId, out var userId))
        return Results.BadRequest(new { error = "Invalid userId" });

    var profile = await supabase.GetProfileAsync(userId, ct);
    if (profile is null) return Results.NotFound(new { error = "Profile not found" });

    var targetRole = !string.IsNullOrWhiteSpace(request.Role) ? request.Role : profile.RequestedRole;
    if (string.IsNullOrWhiteSpace(targetRole))
        return Results.BadRequest(new { error = "No role provided and requested_role is empty" });

    var updated = await supabase.AdminSetRoleAsync(userId, targetRole, ct);
    return Results.Ok(updated);
});

admin.MapPost("/seed-teachers", async (SeedTeachersRequest request, SupabaseAdminClient supabase, CancellationToken ct) =>
{
    var results = new List<object>();

    foreach (var teacher in request.Teachers)
    {
        if (!Guid.TryParse(teacher.UserId, out var teacherId))
            return Results.BadRequest(new { error = $"Invalid teacher userId: {teacher.UserId}" });

        var updated = await supabase.AdminSetRoleAsync(teacherId, "teacher", ct);
        if (teacher.DisplayName is not null || teacher.Subjects is not null)
        {
            await supabase.PatchProfileAsync(teacherId, new
            {
                display_name = teacher.DisplayName,
                subjects = teacher.Subjects
            }, ct);
        }

        results.Add(new { id = updated.Id, role = updated.Role });
    }

    return Results.Ok(results);
});

admin.MapPost("/seed-availability", async (SeedAvailabilityRequest request, SupabaseAdminClient supabase, CancellationToken ct) =>
{
    if (!Guid.TryParse(request.TeacherId, out var teacherId))
        return Results.BadRequest(new { error = "Invalid teacherId" });

    var slotMinutes = request.SlotMinutes ?? 60;
    var days = request.Days ?? 5;
    var slotsPerDay = request.SlotsPerDay ?? 2;

    var startDate = request.StartDateUtc?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);
    var slots = AvailabilityGenerator.Generate(teacherId, startDate, days, slotsPerDay, slotMinutes);

    var inserted = await supabase.InsertAvailabilityAsync(slots, ct);
    return Results.Ok(inserted);
});

admin.MapPost("/link-parent-student", async (LinkParentStudentRequest request, SupabaseAdminClient supabase, CancellationToken ct) =>
{
    if (!Guid.TryParse(request.ParentId, out var parentId))
        return Results.BadRequest(new { error = "Invalid parentId" });
    if (!Guid.TryParse(request.StudentId, out var studentId))
        return Results.BadRequest(new { error = "Invalid studentId" });

    await supabase.InsertParentStudentAsync(parentId, studentId, ct);
    return Results.Ok(new { status = "linked" });
});

app.Run();
