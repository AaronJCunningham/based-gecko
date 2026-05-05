export async function fetchUniswapChart(
  contractAddress: string,
  days: number = 30
) {
  const url = `/api/get-uniswap-chart?address=${contractAddress}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chart data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Uniswap chart:", error);
    throw error;
  }
}
