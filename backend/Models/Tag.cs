using System.ComponentModel.DataAnnotations;
using backend.Utilities;

namespace backend.Models;

public class Tag()
{
    //default is white
    public Colour Colour { get; set; } = new Colour(100, 0, 0);

    [StringLength(256)] public string Name { get; set; } = "";
    [Key] public Guid Id { get; init; } = Guid.CreateVersion7();
    public ICollection<Task> Tasks { get; set; } = new List<Task>();

    public Tag(string name, Colour colour) : this()
    {
        Name = name;
        Colour = colour;
    }

    public Tag(string name) : this()
    {
        Name = name;
        // Use default colour
    }
}