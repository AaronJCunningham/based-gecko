export async function fetchUniswapChart(
  contractAddress: string,
  days: number = 30
) {
  const baseUrl = "/api/get-uniswap-chart";
  const url = `${baseUrl}?address=${contractAddress}`; // Changed from contract to address

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chart data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Uniswap chart:", error);
    throw error;
  }
}
