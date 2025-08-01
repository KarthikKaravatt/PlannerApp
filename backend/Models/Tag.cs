using System.ComponentModel.DataAnnotations;
using backend.Utilities;

namespace backend.Models;

public class Tag()
{
    //default is white
    public Colour Colour = new(100, 0, 0);

    [StringLength(256)] public string Name = "";

    public Tag(string name, Colour colour) : this()
    {
        Name = name;
        Colour = colour;
    }

    [Key] public Guid Id { get; set; } = Guid.CreateVersion7();
}