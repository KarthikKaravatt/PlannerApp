namespace backend;


public record Task(string Label, bool Completed, DateTimeOffset DueDate, uint OrderIndex, Guid Id = new());

public record TaskRequest(string Label, bool Completed, DateTimeOffset DueDate);

