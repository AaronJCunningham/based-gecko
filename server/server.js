const { ethers } = require("ethers");
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const http = require("http");
const { supabase } = require("./supabase");

const { startWebSocketServer } = require("./websocket");

const { getChartData } = require("./chartData");
const { getStats } = require("./getStats");
const abi = require("./abi.json");

const {
  ALCHEMY_URL,
  CONTRACT_ADDRESS,
  ALCHEMY_API_KEY,
} = require("./constants");

const app = express();
app.use(
  cors({
    origin: [
      "https://braingecko2.vercel.app",
      "http://localhost:3000",
      "https://www.getbased.ai",
      "https://getbased.ai",
      /^https:\/\/.*\.vercel\.app$/,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

const apiServer = http.createServer(app);
const API_PORT = process.env.API_PORT || 3001;

let cachedData = [];

if (!ALCHEMY_API_KEY) {
  throw new Error("Missing Alchemy API key in .env");
}

// ethers v6: define ADDRESS_ZERO manually
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
const provider = new ethers.WebSocketProvider(
  `wss://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

// Replace your existing DEXES and PAIRS definitions with these
const DEXES = {
  UNISWAP_V2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  SUSHISWAP: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
};

const PAIRS = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
};

// Add this constant
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const UNISWAP_V3_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];
// Usage:
const PEPECOIN = "0xA9E8aCf069C58aEc8825542845Fd754e41a9489A";
const PEPECOIN_PAIR = "0xddd23787a6b80a794d952f5fb036d0b31a8e6aff";

const BASEDAI = "0x44971ABF0251958492FeE97dA3e5C5adA88B9185";
const BASEDAI_PAIR = "0x8d58e202016122aae65be55694dbce1b810b4072";

// Replace your checkLiquidity function with the new one
async function checkLiquidity(tokenAddress) {
  try {
    // Hardcoded known pairs
    const knownPairs = {
      "0x44971ABF0251958492FeE97dA3e5C5adA88B9185":
        "0x8d58e202016122aae65be55694dbce1b810b4072",
      "0xA9E8aCf069C58aEc8825542845Fd754e41a9489A":
        "0xddd23787a6b80a794d952f5fb036d0b31a8e6aff",
      "0x7f89f674b7d264944027e78e5f58eb2bbbb7cfa3":
        "0x593974aCcc0EC830d8Ce24E12f4629f05315C4BA",
    };

    // Check if this is a known token
    if (knownPairs[tokenAddress]) {
      return { hasLiquidity: true, pairAddress: knownPairs[tokenAddress] };
    }

    // For all other tokens, check V3 pools
    // console.log("Checking token:", tokenAddress);
    const v3Factory = new ethers.Contract(
      UNISWAP_V3_FACTORY,
      UNISWAP_V3_FACTORY_ABI,
      provider
    );

    const fees = [500, 3000, 10000];
    for (const [pairName, pairAddress] of Object.entries(PAIRS)) {
      const [tokenA, tokenB] = [tokenAddress, pairAddress].sort((a, b) =>
        a.toLowerCase() > b.toLowerCase() ? 1 : -1
      );

      for (const fee of fees) {
        const poolAddress = await v3Factory.getPool(tokenA, tokenB, fee);
        // console.log(`V3 pool with ${pairName} (${fee}): ${poolAddress}`);

        if (poolAddress !== ADDRESS_ZERO) {
          return { hasLiquidity: true, pairAddress: poolAddress };
        }
      }
    }

    return { hasLiquidity: false, pairAddress: null };
  } catch (error) {
    console.error(`Error checking liquidity for ${tokenAddress}:`, error);
    return { hasLiquidity: false, pairAddress: null };
  }
}

async function getTokenData(token, pair, name) {
  const chartData = await getChartData(token, provider, pair);
  const stats = await getStats(token, provider, pair);

  return {
    0: name,
    1: token,
    hasLiquidity: true,
    pairAddress: pair,
    chartData,
    stats,
  };
}

async function getPepecoinStakedBrainTokens() {
  try {
    const contract = new ethers.Contract(
      "0xB0974F12C7BA2f1dC31f2C2545B71Ef1998815a4",
      [`event BrainMinted(uint256 nftId, address brainFather)`],
      provider
    );

    // Get the transaction data for stakePepecoin method signature
    const stakePepecoinSig = ethers.id("stakePepecoin(uint256)").slice(0, 10);

    // Fetch events
    const events = await provider.getLogs({
      address: "0xB0974F12C7BA2f1dC31f2C2545B71Ef1998815a4",
      topics: [ethers.id("BrainMinted(uint256,address)")],
      fromBlock: 0,
      toBlock: "latest",
    });

    // Filter events based on transaction method
    const pepecoinStakedBrains = [];

    for (const event of events) {
      const tx = await provider.getTransaction(event.transactionHash);

      if (tx.data.startsWith(stakePepecoinSig)) {
        const parsedEvent = contract.interface.parseLog(event);
        const tokenId = parsedEvent.args[0]?.toString();
        pepecoinStakedBrains.push(tokenId);

        // console.log(`Pepecoin Staked Brain Token:`, {
        //   tokenId,
        //   brainFather: parsedEvent.args[1],
        //   transactionHash: event.transactionHash,
        // });
      }
    }

    return pepecoinStakedBrains;
  } catch (error) {
    console.error("Error fetching Pepecoin staked Brain tokens:", error);
    return [];
  }
}

async function fetchAndProcessEvents() {
  console.log("✅ Starting BCRED price fetch...");

  try {
    const pepecoinStakedBrains = await getPepecoinStakedBrainTokens();
    console.log("📌 Pepecoin staked brain token IDs:", pepecoinStakedBrains);

    const filter = contract.filters.BrainTokenActivated();
    const events = await contract.queryFilter(filter, 0, "latest");
    console.log(`📌 Total BrainTokenActivated events: ${events.length}`);

    const stakePepecoinSig = ethers.id("stakePepecoin(uint256)").slice(0, 10);

    const eventArgs = await Promise.all(
      events.map(async (event) => {
        const args = event.args;
        const tx = await event.getTransaction();
        const methodId = tx.data.slice(0, 10);

        if (pepecoinStakedBrains.includes(args[0]?.toString())) return null;

        return args
          ? {
              0: args[0]?.toString(),
              1: args[1]?.toString(),
            }
          : null;
      })
    ).then((events) =>
      events.filter((event) => event !== null && !event.isStaked)
    );

    eventArgs.unshift({
      0: "BCRED",
      1: "0x7f89f674b7d264944027e78e5f58eb2bbbb7cfa3",
    });

    console.log("📌 Final token list (including BCRED):", eventArgs);

    const eventsWithData = [];

    console.log("🔄 Fetching PEPECOIN data...");
    const pepecoinData = await getTokenData(
      PEPECOIN,
      PEPECOIN_PAIR,
      "PEPECOIN"
    );
    console.log("✅ PEPECOIN data:", pepecoinData);

    console.log("🔄 Fetching BASEDAI data...");
    const basedaiData = await getTokenData(BASEDAI, BASEDAI_PAIR, "BASEDAI");
    console.log("✅ BASEDAI data:", basedaiData);

    eventsWithData.push(pepecoinData, basedaiData);

    for (const event of eventArgs) {
      if (!event[1]) continue;

      const label = event[0] || "UNKNOWN";
      console.log(`🔍 Processing token: ${label} (${event[1]})`);

      const { hasLiquidity, pairAddress } = await checkLiquidity(event[1]);
      console.log(`   ↳ Liquidity: ${hasLiquidity}, Pair: ${pairAddress}`);

      let chartData = {};
      let stats = {};

      if (hasLiquidity) {
        [chartData, stats] = await Promise.all([
          getChartData(event[1], provider, pairAddress),
          getStats(event[1], provider, pairAddress),
        ]);

        console.log(`   ↳ Chart data for ${label}:`, chartData);
        console.log(`   ↳ Stats for ${label}:`, stats);
      } else {
        console.log(`   ⚠️ No liquidity found for ${label}`);
      }

      eventsWithData.push({
        ...event,
        hasLiquidity,
        pairAddress,
        chartData,
        stats,
      });

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log("📦 Compiling final event data...");

    const specialTokens = eventsWithData.filter(
      (item) =>
        item[0] === "BCRED" || item[0] === "BASEDAI" || item[0] === "PEPECOIN"
    );

    const regularBrains = eventsWithData.filter(
      (item) =>
        item[0] !== "BCRED" && item[0] !== "BASEDAI" && item[0] !== "PEPECOIN"
    );

    regularBrains.sort((a, b) => {
      const numA = parseInt(a.brainNumber || 0);
      const numB = parseInt(b.brainNumber || 0);
      return numA - numB;
    });

    cachedData = [...specialTokens, ...regularBrains];

    console.log("✅ Final cachedData sample:", cachedData.slice(0, 3));
    console.log("✅ Event processing complete.");
  } catch (error) {
    console.error("❌ Error fetching and processing events:", error);
  }
}

cron.schedule("*/20 * * * *", fetchAndProcessEvents);
fetchAndProcessEvents();

app.get("/api/events", (req, res) => {
  res.json(
    cachedData.length ? cachedData : { error: "Data not available yet." }
  );
});

app.get("/api/bcred", (req, res) => {
  const bcredData = cachedData.find((item) => item[0] === "BCRED");
  res.json(bcredData || { error: "BCRED data not available" });
});

app.post("/api/auth/verify", async (req, res) => {
  const { address, signature, message, totaltokens } = req.body;
  try {
    const signerAddress = ethers
      .verifyMessage(message, signature)
      .toLowerCase();
    const today = new Date().toISOString().split("T")[0];

    let { data: profile, error } = await supabase
      .from("profiles")
      .select("wallet_address, username, streak_count, last_streak_date")
      .eq("wallet_address", signerAddress)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    let streakCount = profile?.streak_count || 0;
    let lastStreakDate = profile?.last_streak_date;
    let username = profile?.username;

    if (!username) {
      username = `Based${Math.floor(Math.random() * 900) + 100}`;
    }

    if (lastStreakDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastStreakDate === yesterdayStr) {
        streakCount += 1;
      } else if (lastStreakDate !== today) {
        streakCount = 1;
      }
    } else {
      streakCount = 1;
    }

    const { data: updatedProfile, error: upsertError } = await supabase
      .from("profiles")
      .upsert({
        wallet_address: signerAddress,
        username: username,
        streak_count: streakCount,
        last_streak_date: today,
        last_active: new Date().toISOString(), // Add this line
      })
      .select()
      .single();

    if (upsertError) throw upsertError;

    return res.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).json({ success: false, error: "Invalid signature" });
  }
});

// Before the update, query the profile to make sure column exists
app.post("/api/update-tokens", async (req, res) => {
  const {
    wallet_address,
    totaltokens,
    token_combo,
    basedai_balance,
    pepecoin_balance,
    bcred_balance,
  } = req.body;

  // Debug query
  const { data, error: queryError } = await supabase
    .from("profiles")
    .select("*")
    .eq("wallet_address", wallet_address)
    .single();

  // console.log("Current profile:", data);

  const { error } = await supabase
    .from("profiles")
    .update({
      totaltokens,
      token_combo,
      basedai_balance,
      pepecoin_balance,
      bcred_balance,
    })
    .eq("wallet_address", wallet_address);

  res.json({ success: !error });
});

app.post("/api/update-username", async (req, res) => {
  let { wallet_address, username } = req.body;
  if (!wallet_address || !username) {
    return res
      .status(400)
      .json({ error: "Missing wallet_address or username" });
  }
  wallet_address = wallet_address.toLowerCase();
  // console.log("Updating username in Supabase:", { wallet_address, username });
  const { data, error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("wallet_address", wallet_address)
    .select();
  if (error) {
    console.error("Supabase update error:", error);
    return res.status(500).json({ error: "Failed to update username" });
  }
  if (!data || data.length === 0) {
    console.error(
      "No rows updated. Profile not found for wallet_address:",
      wallet_address
    );
    return res.status(500).json({ error: "Profile not found" });
  }
  // console.log("Username update successful in Supabase.", data);
  res.json({ success: true });
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const twelveHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const [
      { data: topHolder },
      { data: topStreak },
      { data: topBasedaiHolder },
      { data: topPepecoinHolder },
      { data: topBcredHolder },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("username, totaltokens")
        .gte("last_active", twelveHoursAgo)
        .order("totaltokens", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("profiles")
        .select("username, streak_count")
        .gte("last_active", twelveHoursAgo)
        .order("streak_count", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("profiles")
        .select("username, basedai_balance")
        .gte("last_active", twelveHoursAgo)
        .order("basedai_balance", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("profiles")
        .select("username, pepecoin_balance")
        .gte("last_active", twelveHoursAgo)
        .order("pepecoin_balance", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("profiles")
        .select("username, bcred_balance")
        .gte("last_active", twelveHoursAgo)
        .order("bcred_balance", { ascending: false })
        .limit(1)
        .single(),
    ]);

    console.log(
      "FLOW",
      topHolder,
      topStreak,
      topBasedaiHolder,
      topPepecoinHolder,
      topBcredHolder
    );

    res.json({
      success: true,
      topHolder,
      topStreak,
      topBasedaiHolder,
      topPepecoinHolder,
      topBcredHolder,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

apiServer.listen(API_PORT, () => {
  console.log(`API Server running on port ${API_PORT}`);
});

startWebSocketServer(apiServer);
