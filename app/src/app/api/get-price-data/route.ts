import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coinSymbol = searchParams.get("coinSymbol") || "basedai";
  const days = searchParams.get("days") || "30";

  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  const url = `https://pro-api.coingecko.com/api/v3/coins/${coinSymbol}/market_chart?vs_currency=usd&days=${days}&interval=daily`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-cg-pro-api-key": apiKey,
      } as HeadersInit, // Ensure the correct type
    });

    if (response.ok) {
      const data = await response.json();

      return NextResponse.json({
        prices: data.prices,
        market_caps: data.market_caps,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch data from CoinGecko" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    return NextResponse.json(
      { error: "Network error occurred" },
      { status: 500 }
    );
  }
}
