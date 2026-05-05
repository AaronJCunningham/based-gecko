import { NextResponse } from "next/server";
import { ethers, EventLog } from "ethers";
import { ALCHEMY_URL, CONTRACT_ADDRESS } from "@/constants";
import ABI from "@/config/abi.json";

interface EventArg {
  0: string;
  1: string;
  [key: string]: any;
}

interface EventWithLiquidity extends EventArg {
  hasLiquidity: boolean;
}

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
];

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
];

const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function checkLiquidity(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string
): Promise<boolean> {
  try {
    const factory = new ethers.Contract(
      UNISWAP_V2_FACTORY,
      FACTORY_ABI,
      provider
    );

    const pairAddress = await factory.getPair(tokenAddress, WETH);

    if (pairAddress === ethers.ZeroAddress) {
      return false;
    }

    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const [reserves, token0] = await Promise.all([
      pair.getReserves(),
      pair.token0(),
    ]);

    const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
    const tokenReserve = isToken0 ? reserves[0] : reserves[1];
    const wethReserve = isToken0 ? reserves[1] : reserves[0];

    return Number(wethReserve) > 0 && Number(tokenReserve) > 0;
  } catch (error) {
    console.error(`Error checking liquidity for ${tokenAddress}:`, error);
    return false;
  }
}

export async function GET(request: Request) {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const provider = new ethers.JsonRpcProvider(`${ALCHEMY_URL}${alchemyApiKey}`);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  const { searchParams } = new URL(request.url);
  const eventName = searchParams.get("eventName");
  const fromBlock = searchParams.get("fromBlock");
  const toBlock = searchParams.get("toBlock");

  if (!eventName || !fromBlock || !toBlock) {
    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  }

  try {
    const filter = contract.filters[eventName]();
    const events = await contract.queryFilter(
      filter,
      Number(fromBlock),
      toBlock === "latest" ? "latest" : Number(toBlock)
    );

    const eventArgs = events
      .map((event): Record<string, any> | null => {
        if ("args" in event) {
          const args = (event as EventLog).args;
          const formattedArgs = Object.fromEntries(
            Object.entries(args).map(([key, value]) => [
              key,
              typeof value === "bigint" ? value.toString() : value,
            ])
          );
          return formattedArgs;
        }
        return null;
      })
      .filter((event): event is Record<string, any> => event !== null);

    const eventsWithLiquidity = await Promise.all(
      eventArgs.map(async (event): Promise<EventWithLiquidity> => {
        const defaultResult: EventWithLiquidity = {
          0: event[0] || "",
          1: event[1] || "",
          hasLiquidity: false,
        };

        if (!event[1]) {
          return defaultResult;
        }

        const hasLiquidity = await checkLiquidity(provider, event[1]);
        return {
          ...event,
          0: event[0],
          1: event[1],
          hasLiquidity,
        };
      })
    );

    return NextResponse.json({ events: eventsWithLiquidity });
  } catch (error) {
    console.error(`Error fetching ${eventName} events:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${eventName} events` },
      { status: 500 }
    );
  }
}
