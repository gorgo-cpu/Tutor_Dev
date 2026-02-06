using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TutorBackend;

public sealed class SupabaseAdminClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _http;

    public SupabaseAdminClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<Profile?> GetProfileAsync(Guid userId, CancellationToken ct)
    {
        var url =
            $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(userId.ToString())}&select=id,email,display_name,role,requested_role";
        using var resp = await _http.GetAsync(url, ct);
        await EnsureSuccess(resp, ct);

        var rows = await resp.Content.ReadFromJsonAsync<List<Profile>>(JsonOptions, ct);
        return rows?.FirstOrDefault();
    }

    public async Task<Profile> AdminSetRoleAsync(Guid userId, string role, CancellationToken ct)
    {
        var payload = new { user_id = userId, new_role = role };
        using var resp = await _http.PostAsJsonAsync("/rest/v1/rpc/admin_set_role", payload, JsonOptions, ct);
        await EnsureSuccess(resp, ct);

        return await ReadProfileAsync(resp, ct);
    }

    public async Task PatchProfileAsync(Guid userId, object patch, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(new HttpMethod("PATCH"),
            $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(userId.ToString())}");
        req.Headers.TryAddWithoutValidation("Prefer", "return=minimal");
        req.Content = JsonContent.Create(patch, options: JsonOptions);

        using var resp = await _http.SendAsync(req, ct);
        await EnsureSuccess(resp, ct);
    }

    public async Task<IReadOnlyList<AvailabilityRow>> InsertAvailabilityAsync(IReadOnlyList<AvailabilityInsert> slots, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, "/rest/v1/teacher_availability");
        req.Headers.TryAddWithoutValidation("Prefer", "return=representation");
        req.Content = JsonContent.Create(slots, options: JsonOptions);

        using var resp = await _http.SendAsync(req, ct);
        await EnsureSuccess(resp, ct);

        var rows = await resp.Content.ReadFromJsonAsync<List<AvailabilityRow>>(JsonOptions, ct);
        return rows is not null ? rows : Array.Empty<AvailabilityRow>();
    }

    public async Task InsertParentStudentAsync(Guid parentId, Guid studentId, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, "/rest/v1/parent_students");
        req.Headers.TryAddWithoutValidation("Prefer", "return=minimal");
        req.Content = JsonContent.Create(new { parent_id = parentId, student_id = studentId }, options: JsonOptions);

        using var resp = await _http.SendAsync(req, ct);
        await EnsureSuccess(resp, ct);
    }

    private static async Task<Profile> ReadProfileAsync(HttpResponseMessage response, CancellationToken ct)
    {
        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        var root = doc.RootElement;

        if (root.ValueKind == JsonValueKind.Array)
        {
            if (root.GetArrayLength() == 0) throw new InvalidOperationException("Supabase returned an empty result.");
            return root[0].Deserialize<Profile>(JsonOptions) ?? throw new InvalidOperationException("Invalid profile payload.");
        }

        return root.Deserialize<Profile>(JsonOptions) ?? throw new InvalidOperationException("Invalid profile payload.");
    }

    private static async Task EnsureSuccess(HttpResponseMessage resp, CancellationToken ct)
    {
        if (resp.IsSuccessStatusCode) return;
        var body = await resp.Content.ReadAsStringAsync(ct);
        throw new InvalidOperationException($"Supabase request failed ({(int)resp.StatusCode}): {body}");
    }
}

public sealed record Profile(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("display_name")] string? DisplayName,
    [property: JsonPropertyName("role")] string? Role,
    [property: JsonPropertyName("requested_role")] string? RequestedRole
);

public sealed record AvailabilityRow(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("teacher_id")] Guid TeacherId,
    [property: JsonPropertyName("start_at")] DateTime StartAt,
    [property: JsonPropertyName("end_at")] DateTime EndAt,
    [property: JsonPropertyName("is_booked")] bool IsBooked
);
