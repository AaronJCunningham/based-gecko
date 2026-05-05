import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In production this would call Alchemy's eth_blockNumber RPC
    // Using static demo data for portfolio demonstration
    return NextResponse.json({ latestBlock: 21630000 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch latest block" },
      { status: 500 }
    );
  }
}
