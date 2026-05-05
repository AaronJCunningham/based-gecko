type EventData = { 0: string; 1: string; hasLiquidity: boolean };
type MappedData = {
  brainNumber: string;
  brainAddress: string;
  hasLiquidity: boolean;
};

export async function fetchPastEvents(
  eventName: string,
  fromBlock: number,
  toBlock: string
): Promise<MappedData[]> {
  try {
    const response = await fetch(
      `/api/get-past-events?eventName=${encodeURIComponent(
        eventName
      )}&fromBlock=${fromBlock}&toBlock=${toBlock}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch events for ${eventName}`);
    }
    const data = await response.json();
    const mappedData: MappedData[] = data.events.map(
      ({ 0: key1, 1: key2, hasLiquidity }: EventData) => ({
        brainNumber: key1,
        brainAddress: key2,
        hasLiquidity: hasLiquidity || false,
      })
    );
    return mappedData;
  } catch (error) {
    console.error(`Error fetching events for ${eventName}:`, error);
    return [];
  }
}
