import { NextResponse } from "next/server";
import { ethers } from "ethers";

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
];

const PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

const TOKEN_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// Previous imports and ABIs remain the same

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

    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const token0 = await pair.token0();
    const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();

    const currentBlock = await provider.getBlockNumber();
    const blocks = Array.from(
      { length: 30 },
      (_, i) => currentBlock - i * 6500
    );

    const priceHistory = [];
    for (const block of blocks) {
      try {
        await new Promise((r) => setTimeout(r, 200)); // Add 200ms delay
        const reserves = await pair.getReserves({ blockTag: block });
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const wethReserve = isToken0 ? reserves[1] : reserves[0];

        priceHistory.push({
          timestamp: new Date(Number(reserves[2]) * 1000).toISOString(),
          priceInEth: Number(wethReserve) / Number(tokenReserve),
        });
      } catch (error) {
        console.error(`Block ${block} error:`, error);
      }
    }

    return NextResponse.json({
      stats: {
        priceHistory: priceHistory.filter(Boolean),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
