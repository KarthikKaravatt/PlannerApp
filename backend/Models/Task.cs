
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class TaskComparer : IComparer<Task>
{
    public int Compare(Task? a, Task? b)
    {
        if (a == null) return 0;
        if (b == null) return 0;
        return (int)a.OrderIndex - (int)b.OrderIndex;
        
    }
}
public class Task()
{
    [StringLength(256)] public string Label { get; set; } = "";
    public bool Completed { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public uint OrderIndex { get; set; }
    
    public Guid Id { get; init; }
    
    
    public Guid TaskListId { get; set; }
    public ICollection<Tag> Tags = new List<Tag>();
    public Task(string label, bool completed, DateTimeOffset? dueDate, uint orderIndex, Guid id, Guid taskListId) : this()
    {
        Label = label;
        Completed = completed;
        DueDate = dueDate;
        OrderIndex = orderIndex;
        Id = id;
        TaskListId = taskListId;
    }
    public Task(string label, bool completed, DateTimeOffset? dueDate, uint orderIndex, Guid taskListId) : this()
    {
        Label = label;
        Completed = completed;
        DueDate = dueDate;
        OrderIndex = orderIndex;
        Id = Guid.CreateVersion7(); 
        TaskListId = taskListId;
    }

};




