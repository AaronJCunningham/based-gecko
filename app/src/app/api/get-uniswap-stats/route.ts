import { NextResponse } from "next/server";
import { ethers } from "ethers";

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
];

const PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)",
];

const TOKEN_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
];

const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export async function GET() {
  try {
    const tokenAddress = "0x44971ABF0251958492FeE97dA3e5C5adA88B9185";
    const provider = new ethers.JsonRpcProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    );

    const factory = new ethers.Contract(
      UNISWAP_V2_FACTORY,
      FACTORY_ABI,
      provider
    );
    const pairAddress = await factory.getPair(tokenAddress, WETH);

    if (pairAddress === ethers.ZeroAddress) {
      return NextResponse.json({ error: "Pair not found" });
    }

    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      provider
    );

    const [symbol, totalSupply, reserves] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.totalSupply(),
      pair.getReserves(),
    ]);

    const token0 = await pair.token0();
    const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();

    const tokenReserve = isToken0 ? reserves[0] : reserves[1];
    const wethReserve = isToken0 ? reserves[1] : reserves[0];

    const priceETH = Number(wethReserve) / Number(tokenReserve);
    const priceUSD = priceETH * 1700;

    const marketCap = (Number(totalSupply) / 1e18) * priceUSD;

    const currentBlock = await provider.getBlockNumber();
    const logs = await provider.getLogs({
      address: pairAddress,
      fromBlock: currentBlock - 6500,
      toBlock: currentBlock,
      topics: [
        ethers.id("Swap(address,uint256,uint256,uint256,uint256,address)"),
      ],
    });

    const iface = new ethers.Interface(PAIR_ABI);

    const recentTransactions = logs
      .map((log) => {
        try {
          const event = iface.parseLog(log);

          // Ensure event is valid
          if (!event) return null;

          const { amount0In, amount1In, amount0Out, amount1Out, sender } =
            event.args;

          const amountIn = isToken0 ? amount0In : amount1In;
          const amountOut = isToken0 ? amount0Out : amount1Out;

          return {
            type: amountIn > 0 ? "Buy" : "Sell",
            price: `$${priceUSD.toFixed(6)}`,
            volume: `${(
              Number(amountIn > 0 ? amountIn : amountOut) / 1e18
            ).toFixed(2)}`,
            trader: sender,
          };
        } catch (error) {
          console.error("Failed to parse log:", error);
          return null;
        }
      })
      .filter(Boolean); // Remove null values

    const volumeUSD = recentTransactions.reduce((acc, tx) => {
      if (tx) {
        return acc + parseFloat(tx.volume) * priceUSD;
      }
      return acc;
    }, 0);

    const txs = recentTransactions.length;

    return NextResponse.json({
      stats: {
        priceUSD: priceUSD.toFixed(6),
        priceETH: priceETH.toFixed(6),
        marketCap: `$${(marketCap / 1000).toFixed(2)}K`,
        liquidity: `$${(
          ((Number(tokenReserve) / 1e18) * priceUSD +
            (Number(wethReserve) / 1e18) * 1700) /
          1000
        ).toFixed(2)}K`,
        volumeUSD: `$${(volumeUSD / 1000).toFixed(2)}K`,
        txs,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error },
      { status: 500 }
    );
  }
}
