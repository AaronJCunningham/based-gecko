export async function fetchUniswapStats(contractAddress: string) {
  const url = `/api/get-uniswap-stats?address=${contractAddress}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Uniswap stats:", error);
    throw error;
  }
}
