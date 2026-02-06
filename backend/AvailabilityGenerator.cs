namespace TutorBackend;

public static class AvailabilityGenerator
{
    public static IReadOnlyList<AvailabilityInsert> Generate(
        Guid teacherId,
        DateTime startDateUtc,
        int days,
        int slotsPerDay,
        int slotMinutes
    )
    {
        if (days <= 0) return Array.Empty<AvailabilityInsert>();
        if (slotsPerDay <= 0) return Array.Empty<AvailabilityInsert>();
        if (slotMinutes <= 0) slotMinutes = 60;

        var slots = new List<AvailabilityInsert>();
        var baseDate = startDateUtc.Kind == DateTimeKind.Utc ? startDateUtc.Date : startDateUtc.ToUniversalTime().Date;

        for (var day = 0; day < days; day++)
        {
            var date = baseDate.AddDays(day);
            for (var slotIndex = 0; slotIndex < slotsPerDay; slotIndex++)
            {
                var startHour = 9 + (slotIndex * 2);
                var start = new DateTime(date.Year, date.Month, date.Day, startHour, 0, 0, DateTimeKind.Utc);
                var end = start.AddMinutes(slotMinutes);
                slots.Add(new AvailabilityInsert(teacherId, start, end));
            }
        }

        return slots;
    }
}

public sealed record AvailabilityInsert(Guid teacher_id, DateTime start_at, DateTime end_at);

