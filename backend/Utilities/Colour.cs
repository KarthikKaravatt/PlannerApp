namespace backend.Utilities;

public record struct Colour(float L, float C, float H)
{
    public float L { get; } = L is > 100 or < 0 ? throw new ArgumentException("Invalid L value") : L;
    public float C { get; } = C < 0 ? throw new ArgumentException("Invalid C value") : C;
    public float H { get; } = H < 0 ? throw new ArgumentException("Invalid H value") : H;
};