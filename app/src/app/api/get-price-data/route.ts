import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coinSymbol = searchParams.get("coinSymbol");
  const days = searchParams.get("days");

  if (!coinSymbol) {
    return NextResponse.json(
      { error: "Missing required parameter: coinSymbol" },
      { status: 400 }
    );
  }

  try {
    // In production this would call CoinGecko's /coins/{id}/market_chart endpoint
    // Using static demo data for portfolio demonstration
    const filePath = path.join(process.cwd(), "public", "mock", "price-data.json");
    const allData = JSON.parse(await readFile(filePath, "utf-8"));
    const coinData = allData[coinSymbol];

    if (!coinData) {
      return NextResponse.json(
        { error: `No price data found for ${coinSymbol}` },
        { status: 404 }
      );
    }

    // Return in CoinGecko API format
    return NextResponse.json({
      prices: [[coinData.time, coinData.price]],
      market_caps: [[coinData.time, coinData.marketCap]],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch price data" },
      { status: 500 }
    );
  }
}
