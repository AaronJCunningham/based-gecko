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
    // In production this would query Uniswap pair reserves across historical blocks
    // to compute price history from on-chain data
    // Using static demo data for portfolio demonstration
    const filePath = path.join(process.cwd(), "public", "mock", "events.json");
    const events = JSON.parse(await readFile(filePath, "utf-8"));

    const event = events.find(
      (e: any) => e.brainAddress === address || e.pairAddress === address
    );

    if (!event?.chartData) {
      return NextResponse.json(
        { error: "No chart data found for this address" },
        { status: 404 }
      );
    }

    return NextResponse.json(event.chartData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
