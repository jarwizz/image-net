namespace Api.Domain;

public static class Metrics
{
    public static int EffectiveSize(long sumSize, long totalNodes)
        => (int)(sumSize > 0 ? sumSize : Math.Max(0, totalNodes - 1));
}
