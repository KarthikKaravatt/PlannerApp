namespace backend.Models;

public record TaskRequest(string Label, bool Completed, DateTimeOffset? DueDate);

public record TaskPayLoad(Guid Id, string Label, bool Completed, DateTimeOffset? DueDate);

public record MoveTaskRequest( string Pos);