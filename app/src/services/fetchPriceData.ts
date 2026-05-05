import { PriceData } from "@/store";

export async function fetchPriceData(
  coinSymbol: string,
  days: number
): Promise<PriceData[] | null> {
  try {
    const response = await fetch(
      `/api/get-price-data?coinSymbol=${coinSymbol}&days=${days}`
    );
    if (!response.ok) return null;

    const data = await response.json();

    if (data.prices && data.market_caps) {
      const combinedData = data.prices.map(
        ([timestamp, price]: [number, number], index: number) => ({
          time: new Date(timestamp).toISOString(),
          price,
          marketCap: data.market_caps[index][1],
        })
      ) as PriceData[];
      return combinedData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching price data:", error);
    return null;
  }
}
