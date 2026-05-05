const fetch = require("node-fetch");
const { DEXTOOLS_API_KEY } = require("./constants");
require("dotenv").config();

const DEXTOOLS_BASE_URL = "https://api.dextools.io/v1";

async function getChartDataFromDEXTools(tokenAddress) {
  try {
    if (!DEXTOOLS_API_KEY) {
      throw new Error("Missing DEXTOOLS_API_KEY in .env file");
    }

    const url = `${DEXTOOLS_BASE_URL}/pair?chain=eth&address=${tokenAddress}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": DEXTOOLS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`DEXTools API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.pair) {
      throw new Error("Invalid data from DEXTools API");
    }

    const { address, priceUsd, volume24h, liquidity, baseToken, quoteToken } =
      data.pair;

    return {
      pairAddress: address,
      priceInUsd: priceUsd,
      volume24h,
      liquidity,
      baseToken: baseToken.name,
      quoteToken: quoteToken.name,
    };
  } catch (error) {
    console.error("Error fetching chart data from DEXTools:", error);
    return null;
  }
}

module.exports = { getChartDataFromDEXTools };
