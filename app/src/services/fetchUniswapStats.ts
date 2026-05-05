export async function fetchUniswapStats(contractAddress: string) {
  const baseUrl = "/api/get-uniswap-stats";
  const url = `${baseUrl}?address=${contractAddress}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Uniswap stats:", error);
    throw error;
  }
}
