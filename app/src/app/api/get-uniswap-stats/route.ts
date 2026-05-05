import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Missing required parameter: address" },
      { status: 400 }
    );
  }

  try {
    // In production this would compute real-time stats from Uniswap pool contracts:
    // reserves, liquidity depth, 24h volume from swap events, transaction count
    // Using static demo data for portfolio demonstration
    const filePath = path.join(process.cwd(), "public", "mock", "events.json");
    const events = JSON.parse(await readFile(filePath, "utf-8"));

    const event = events.find(
      (e: any) => e.brainAddress === address || e.pairAddress === address
    );

    if (!event?.stats) {
      return NextResponse.json(
        { error: "No stats found for this address" },
        { status: 404 }
      );
    }

    return NextResponse.json(event.stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
