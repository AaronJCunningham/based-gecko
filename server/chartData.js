const { ethers } = require("ethers");

const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const V2_PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];

const POOL_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
];

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;

      // Check if it's a rate limit error (429)
      const isRateLimit = error.info?.error?.code === 429;

      // If max retries reached or not a rate limit error that we want to retry
      if (
        retries > maxRetries ||
        (!isRateLimit && !error.toString().includes("missing revert data"))
      ) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(
        `Rate limit hit. Retrying in ${delay}ms (Attempt ${retries}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function getV2PriceHistory(pair, tokenAddress, provider) {
  // Safely call contract methods with retry
  const callWithRetry = (method, ...args) => {
    return retryWithBackoff(() => method(...args));
  };

  const contract = new ethers.Contract(pair, V2_PAIR_ABI, provider);

  // Get token0 with retry
  const token0 = await callWithRetry(contract.token0.bind(contract));
  const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();

  // Get block number with retry
  const currentBlock = await callWithRetry(
    provider.getBlockNumber.bind(provider)
  );

  // Reduce number of data points to avoid rate limiting
  const blocks = Array.from({ length: 60 }, (_, i) => currentBlock - i * 7200);

  const priceHistory = [];
  for (const block of blocks) {
    try {
      // Increased delay between requests
      await new Promise((r) => setTimeout(r, 1000));

      // Get reserves with retry
      const reserves = await callWithRetry(
        contract.getReserves.bind(contract),
        { blockTag: block }
      );

      const reserve0 = Number(reserves[0]);
      const reserve1 = Number(reserves[1]);

      const price = isToken0 ? reserve1 / reserve0 : reserve0 / reserve1;

      // Get block with retry
      const blockData = await callWithRetry(
        provider.getBlock.bind(provider),
        block
      );

      priceHistory.push({
        timestamp: new Date(blockData.timestamp * 1000).toISOString(),
        priceInEth: price,
      });
    } catch (error) {
      console.error(`Block ${block} error:`, error);
    }
  }

  return priceHistory.filter(Boolean);
}

async function getChartData(tokenAddress, provider, knownV2Pair = null) {
  try {
    // Safely call contract methods with retry
    const callWithRetry = (method, ...args) => {
      return retryWithBackoff(() => method(...args));
    };

    // If we have a known V2 pair, use that
    if (knownV2Pair) {
      const priceHistory = await getV2PriceHistory(
        knownV2Pair,
        tokenAddress,
        provider
      );

      if (
        tokenAddress.toLowerCase() ===
          "0x7f89f674b7d264944027e78e5f58eb2bbbb7cfa3" &&
        priceHistory.length
      ) {
        const latestPrice = priceHistory[priceHistory.length - 1].priceInEth;
        console.log("✅ BCRED price from known pair:", latestPrice);
      }

      return {
        pairAddress: knownV2Pair,
        priceHistory,
      };
    }

    // Otherwise check V3 pools
    const factory = new ethers.Contract(
      UNISWAP_V3_FACTORY,
      FACTORY_ABI,
      provider
    );
    const fees = [500, 3000, 10000];
    let pool = null;
    let poolAddress = null;

    for (const fee of fees) {
      // Add delay between fee checks
      if (fee !== fees[0]) {
        await new Promise((r) => setTimeout(r, 500));
      }

      poolAddress = await callWithRetry(
        factory.getPool.bind(factory),
        tokenAddress,
        WETH,
        fee
      );

      if (poolAddress !== ethers.ZeroAddress) {
        pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
        break;
      }
    }

    if (!pool) return null;

    // Get token0 with retry
    const token0 = await callWithRetry(pool.token0.bind(pool));
    const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();

    // Get block number with retry
    const currentBlock = await callWithRetry(
      provider.getBlockNumber.bind(provider)
    );

    // Reduce number of data points
    const blocks = Array.from(
      { length: 60 }, // Reduced from 30 to 15 points
      (_, i) => currentBlock - i * 7200 // Increased interval
    );

    const priceHistory = [];
    for (const block of blocks) {
      try {
        // Increased delay between requests
        await new Promise((r) => setTimeout(r, 1000));

        // Get slot0 with retry
        const slot0 = await callWithRetry(pool.slot0.bind(pool), {
          blockTag: block,
        });

        const sqrtPriceX96 = Number(slot0[0]);
        const base = sqrtPriceX96 / 2 ** 96;
        const price = base * base;
        const priceInEth = isToken0 ? price : 1 / price;

        // Get block with retry
        const blockData = await callWithRetry(
          provider.getBlock.bind(provider),
          block
        );

        priceHistory.push({
          timestamp: new Date(blockData.timestamp * 1000).toISOString(),
          priceInEth,
        });
      } catch (error) {
        console.error(`Block ${block} error:`, error);
      }
    }

    return {
      pairAddress: poolAddress,
      priceHistory: priceHistory.filter(Boolean),
    };
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return null;
  }
}

module.exports = { getChartData };
