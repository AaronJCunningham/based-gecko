import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function GET() {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY; // Secure server-side variable
  if (!alchemyApiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const provider = new ethers.JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
  );

  try {
    const latestBlock = await provider.getBlockNumber();
    console.log("latest block", latestBlock);
    return NextResponse.json({ latestBlock });
  } catch (error) {
    console.error("Error fetching latest block number:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest block number" },
      { status: 500 }
    );
  }
}
