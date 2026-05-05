const { ethers } = require("ethers");

const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const POOL_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
  "function liquidity() external view returns (uint128)",
];

const V2_PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
];

const TOKEN_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

async function getStats(tokenAddress, provider, knownPair = null) {
  try {
    if (knownPair) {
      const pair = new ethers.Contract(knownPair, V2_PAIR_ABI, provider);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        TOKEN_ABI,
        provider
      );

      const [token0, decimals, totalSupply, reserves] = await Promise.all([
        pair.token0(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        pair.getReserves(),
      ]);

      const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
      const [reserve0, reserve1] = [Number(reserves[0]), Number(reserves[1])];
      const price = isToken0 ? reserve1 / reserve0 : reserve0 / reserve1;

      const currentBlock = await provider.getBlockNumber();
      const swapTopic = ethers.id(
        "Swap(address,uint256,uint256,uint256,uint256,address)"
      );

      const logs = await provider.getLogs({
        address: knownPair,
        fromBlock: currentBlock - 7200,
        toBlock: currentBlock,
        topics: [swapTopic],
      });

      const iface = new ethers.Interface(V2_PAIR_ABI);
      const recentTransactions = logs
        .map((log) => {
          try {
            const event = iface.parseLog(log);
            if (!event) return null;
            const { sender, amount0In, amount1In, amount0Out, amount1Out, to } =
              event.args;

            const amount0 = Number(amount0Out) - Number(amount0In);
            const amount1 = Number(amount1Out) - Number(amount1In);
            const isBuy = isToken0 ? amount0 > 0 : amount1 > 0;
            const wethAmount = Math.abs(isToken0 ? amount1 : amount0);
            const tokenAmount = Math.abs(isToken0 ? amount0 : amount1);
            const tradePrice = wethAmount / tokenAmount;

            return {
              type: isBuy ? "Buy" : "Sell",
              priceETH: tradePrice,
              volumeETH: Number(ethers.formatEther(wethAmount.toString())),
              trader: isBuy ? to : sender,
            };
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean);

      const volumeETH = recentTransactions.reduce(
        (acc, tx) => acc + tx.volumeETH,
        0
      );
      const marketCapETH =
        Number(ethers.formatUnits(totalSupply, decimals)) * price;

      return {
        stats: {
          priceETH: price.toFixed(6),
          marketCapETH: marketCapETH.toFixed(2),
          liquidityETH: (isToken0 ? reserve1 : reserve0).toFixed(2),
          volumeETH: volumeETH.toFixed(2),
          txs: recentTransactions.length,
          recentTransactions,
        },
      };
    }

    // (Uniswap V3 logic below remains untouched.)
    const factory = new ethers.Contract(
      UNISWAP_V3_FACTORY,
      ["function getPool(address,address,uint24) view returns (address)"],
      provider
    );

    const fees = [500, 3000, 10000];
    let poolAddress = null;

    for (const fee of fees) {
      const address = await factory.getPool(tokenAddress, WETH, fee);
      if (address !== ethers.ZeroAddress) {
        poolAddress = address;
        break;
      }
    }

    if (!poolAddress) {
      return { error: "Pool not found" };
    }

    const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      provider
    );

    const [decimals, totalSupply, slot0] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.totalSupply(),
      pool.slot0(),
    ]);

    const currentBlock = await provider.getBlockNumber();
    const logs = await provider.getLogs({
      address: poolAddress,
      fromBlock: currentBlock - 7200,
      toBlock: currentBlock,
      topics: [
        ethers.id("Swap(address,address,int256,int256,uint160,uint128,int24)"),
      ],
    });

    const iface = new ethers.Interface(POOL_ABI);
    let lastPrice = 0;

    const recentTransactions = logs
      .map((log) => {
        try {
          const event = iface.parseLog(log);
          if (!event) return null;
          const { sender, recipient, amount0, amount1 } = event.args;
          const isBuy = Number(amount0) < 0;
          const wethAmount = Math.abs(Number(amount1));
          const tradePrice = wethAmount / Math.abs(Number(amount0));
          lastPrice = tradePrice;

          return {
            type: isBuy ? "Buy" : "Sell",
            priceETH: tradePrice,
            volumeETH: Number(ethers.formatEther(wethAmount.toString())),
            trader: isBuy ? recipient : sender,
          };
        } catch (error) {
          console.error("Failed to parse log:", error);
          return null;
        }
      })
      .filter(Boolean);

    const volumeETH = recentTransactions.reduce(
      (acc, tx) => acc + tx.volumeETH,
      0
    );
    const marketCapETH =
      Number(ethers.formatUnits(totalSupply, decimals)) * lastPrice;
    const sqrtPriceX96 = Number(slot0[0]);
    const price = Math.pow(sqrtPriceX96 / 2 ** 96, 2);

    return {
      stats: {
        priceETH: price.toFixed(6),
        marketCapETH: marketCapETH.toFixed(2),
        liquidityETH: "0",
        volumeETH: volumeETH.toFixed(2),
        txs: recentTransactions.length,
        recentTransactions,
      },
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { error: "Failed to fetch data" };
  }
}

module.exports = { getStats };
