namespace TutorBackend;

public sealed record ApproveRoleRequest(string UserId, string? Role);

public sealed record SeedTeachersRequest(IReadOnlyList<TeacherSeed> Teachers);

public sealed record TeacherSeed(string UserId, string? DisplayName, string[]? Subjects);

public sealed record SeedAvailabilityRequest(
    string TeacherId,
    int? Days,
    int? SlotsPerDay,
    int? SlotMinutes,
    DateTime? StartDateUtc
);

public sealed record LinkParentStudentRequest(string ParentId, string StudentId);

