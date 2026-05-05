import { BrainEvent } from "@/store";

export async function fetchEventsAndPools(): Promise<BrainEvent[]> {
  try {
    const response = await fetch("/api/get-past-events?eventName=BrainActivated&fromBlock=0&toBlock=latest");
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    const { events } = await response.json();

    // Enrich with chart data and stats
    const enriched: BrainEvent[] = await Promise.all(
      events.map(async (event: any) => {
        const brainNumber = event[0] || event.brainNumber;
        const brainAddress = event[1] || event.brainAddress;
        const hasLiquidity = event.hasLiquidity || false;

        let chartData = {};
        let stats: BrainEvent["stats"] = { stats: undefined };

        if (hasLiquidity) {
          try {
            const [chartRes, statsRes] = await Promise.all([
              fetch(`/api/get-uniswap-chart?address=${brainAddress}`),
              fetch(`/api/get-uniswap-stats?address=${brainAddress}`),
            ]);

            if (chartRes.ok) chartData = await chartRes.json();
            if (statsRes.ok) stats = await statsRes.json();
          } catch {
            // Continue with empty data if enrichment fails
          }
        }

        return {
          brainNumber,
          brainAddress,
          hasLiquidity,
          pairAddress: chartData && "pairAddress" in chartData ? (chartData as any).pairAddress : null,
          chartData,
          stats,
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
