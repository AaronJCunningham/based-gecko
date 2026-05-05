import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventName = searchParams.get("eventName");
  const fromBlock = searchParams.get("fromBlock");
  const toBlock = searchParams.get("toBlock");

  if (!eventName || !fromBlock || !toBlock) {
    return NextResponse.json(
      { error: "Missing required parameters: eventName, fromBlock, toBlock" },
      { status: 400 }
    );
  }

  try {
    // In production this would query Alchemy for contract events between blocks
    // Using static demo data for portfolio demonstration
    const filePath = path.join(process.cwd(), "public", "mock", "events.json");
    const data = JSON.parse(await readFile(filePath, "utf-8"));

    const events = data.map((event: any) => ({
      0: event.brainNumber,
      1: event.brainAddress,
      hasLiquidity: event.hasLiquidity,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch events for ${eventName}` },
      { status: 500 }
    );
  }
}
