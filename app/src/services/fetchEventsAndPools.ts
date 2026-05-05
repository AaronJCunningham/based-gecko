import { BrainEvent, BrainStats } from "@/store";

type EventData = {
  0: string;
  1: string;
  hasLiquidity: boolean;
  pairAddress: string;
  chartData: {
    pairAddress?: string;
    priceHistory?: { timestamp: string; priceInEth: number }[];
  };
  stats?: { stats?: BrainStats };
};

const HTTP_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://braingecko-server-production-47f2.up.railway.app";

export async function fetchEventsAndPools(): Promise<BrainEvent[]> {
  try {
    const response = await fetch(`${HTTP_API_URL}/api/events`);
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    const data: EventData[] = await response.json();

    const mappedData: BrainEvent[] = data.map(
      ({ 0: key1, 1: key2, hasLiquidity, pairAddress, chartData, stats }) => ({
        brainNumber: key1,
        brainAddress: key2,
        hasLiquidity: hasLiquidity || false,
        pairAddress: pairAddress || null,
        chartData: chartData || {},
        stats: stats || { stats: undefined },
      })
    );

    return mappedData;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
