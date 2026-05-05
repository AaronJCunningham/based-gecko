const { COINGECKO_API_KEY } = require("./constants");

const BASE_URL = "https://pro-api.coingecko.com/api/v3";

const fetchCoingeckoData = async (tokenAddresses) => {
  try {
    const prices = {};
    for (const address of tokenAddresses) {
      const marketData = await fetch(
        `${BASE_URL}/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=eth&include_market_cap=true&include_24hr_vol=true`,
        {
          headers: {
            "x-cg-pro-api-key": COINGECKO_API_KEY,
          },
        }
      ).then((res) => res.json());

      const [historicalData, trades] = await Promise.all([
        fetch(
          `${BASE_URL}/coins/ethereum/contract/${address}/market_chart/?vs_currency=eth&days=30`,
          {
            headers: {
              "x-cg-pro-api-key": COINGECKO_API_KEY,
            },
          }
        ),
        fetch(
          `${BASE_URL}/coins/ethereum/contract/${address}/transfers?page=1`,
          {
            headers: {
              "x-cg-pro-api-key": COINGECKO_API_KEY,
            },
          }
        ),
      ]).then((responses) => Promise.all(responses.map((r) => r.json())));

      console.log("Historical Data:", historicalData);
      console.log("Trades:", trades);

      const dailyPrices = historicalData.prices
        .filter((_, index) => index % 24 === 0)
        .slice(0, 30);

      const recentTransactions = trades
        .map((trade) => ({
          priceETH: marketData[address.toLowerCase()].eth,
          trader: trade.to_address,
          type: trade.transfer_type,
          volumeETH: trade.total_value,
        }))
        .slice(0, 50);

      if (marketData[address.toLowerCase()]) {
        const current = marketData[address.toLowerCase()];

        prices[address] = {
          pairAddress: null,
          priceHistory: dailyPrices.map(([timestamp, price]) => ({
            timestamp: new Date(timestamp).toISOString(),
            priceInEth: price,
          })),
          version: "coingecko",
          stats: {
            priceETH: current.eth.toFixed(6),
            marketCapETH: current.eth_market_cap?.toFixed(2) || "0",
            liquidityETH: "0",
            volumeETH: current.eth_24h_vol?.toFixed(2) || "0",
            txs: recentTransactions.length,
            recentTransactions,
          },
        };
      }
    }
    return prices;
  } catch (error) {
    console.error("Error fetching from CoinGecko:", error);
    return null;
  }
};

module.exports = { fetchCoingeckoData };
