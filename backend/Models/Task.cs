using Microsoft.VisualBasic;

namespace backend;


public class Task()
{
    public string Label { get; set; }
    public bool Completed { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public uint OrderIndex { get; set; }
    public Guid Id { get; set; }

    public Task(string label, bool completed, DateTimeOffset? dueDate, uint orderIndex, Guid id) : this()
    {
        Label = label;
        Completed = completed;
        DueDate = dueDate;
        OrderIndex = orderIndex;
        Id = id;
    }
    public Task(string label, bool completed, DateTimeOffset? dueDate, uint orderIndex) : this()
    {
        Label = label;
        Completed = completed;
        DueDate = dueDate;
        OrderIndex = orderIndex;
        Id = Guid.CreateVersion7();
    }

};




