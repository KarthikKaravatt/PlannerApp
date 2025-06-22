using System.Security.Cryptography.X509Certificates;

namespace backend.Models;

public class TaskList
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required uint OrderIndex { get; set; }
    public ICollection<Task> Tasks { get; set; } = new List<Task>();

    public TaskList(string name, ICollection<Task> tasks, uint orderIndex, Guid id)
    {
        Name = name;
        OrderIndex = orderIndex;
        Id = id;
        Tasks = tasks;
    }
    public TaskList() 
    {
        Id = Guid.CreateVersion7(); 
    }
    
}

