using backend.Utilities;

namespace backend.Models;

public record TaskRequest(string Label, bool Completed, DateTimeOffset? DueDate);

public record TagRequest(string Name, Colour Colour);
public record TaskPayLoad(Guid Id, string Label, bool Completed, DateTimeOffset? DueDate);
public record UpdateTaskPayLoad(string Label, DateTimeOffset? DueDate);

public record MoveTaskRequest(Guid TargetTaskId,string Pos);
public record TaskListRequest(string Name);

public record TaskListPayload(Guid Id, string Name);
public record TaskListUpdateRequest(string Name);

public record TaskListMoveRequest(Guid TargetId, string Position);