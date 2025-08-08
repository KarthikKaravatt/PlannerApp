namespace backend.Utilities;

public record Colour(float L, float C, float H)
{
    public float L { get; set; } = L is > 100 or < 0 ? throw new ArgumentException("Invalid L value") : L;
    public float C { get; set; } = C < 0 ? throw new ArgumentException("Invalid C value") : C;
    public float H { get; set; } = H < 0 ? throw new ArgumentException("Invalid H value") : H;
}