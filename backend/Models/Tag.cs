using System.ComponentModel.DataAnnotations;
using backend.Utilities;

namespace backend.Models;

public class Tag()
{
    [Key]
    public  Guid Id { get; set; }= Guid.CreateVersion7();
    [StringLength(256)] 
    public string Name="";
    //default is white
    public Colour Colour = new Colour(100, 0, 0);
    public Tag(string name, Colour colour) : this()
    {
        Name = name;
        Colour = colour;
    }
}