const { ethers } = require("ethers");

const UNISWAP_V2_GRAPH =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

async function getPairInfo(pairAddress) {
  try {
    if (!pairAddress) {
      return { hasPair: false, error: "Missing pair address" };
    }

    const query = `
      {
        pairs(where: { id: "${pairAddress.toLowerCase()}" }) {
          id
          token0Price
          token1Price
          volumeUSD
          reserve0
          reserve1
          totalSupply
          txCount
        }
      }
    `;

    const response = await fetch(UNISWAP_V2_GRAPH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!data.data.pairs.length) {
      return { hasPair: false };
    }

    const pair = data.data.pairs[0];

    return {
      hasPair: true,
      pairAddress,
      currentPrice: pair.token1Price,
      volume24h: pair.volumeUSD,
      liquidityETH: pair.reserve1,
      trades: pair.txCount,
    };
  } catch (error) {
    console.error("Error fetching pair info:", error);
    return { hasPair: false, error: error.message };
  }
}

module.exports = { getPairInfo };
