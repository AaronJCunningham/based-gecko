export async function fetchLatestBlock(): Promise<{ latestBlock: number }> {
  try {
    const response = await fetch("/api/get-latest-block");
    if (!response.ok) {
      throw new Error("Failed to fetch latest block number");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching latest block number:", error);
    return { latestBlock: 0 };
  }
}
