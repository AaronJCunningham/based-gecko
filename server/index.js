const { ethers } = require("ethers");
const { ALCHEMY_API_KEY, ALCHEMY_URL } = require("./constants");

const LINK_TOKEN_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const BCRED_TOKEN_ADDRESS = "0x7f89f674b7d264944027e78e5f58eb2bbbb7cfa3";
const HARDCODED_BCRED_POOL = "0x593974accc0ec830d8ce24e12f4629f05315c4ba";

const V3_POOL_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
];

const ERC20_ABI = [
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function decimals() external view returns (uint8)",
];

console.log(
  `Using Alchemy API Key: ${
    ALCHEMY_API_KEY ? ALCHEMY_API_KEY.substring(0, 5) + "..." : "Missing"
  }`
);

const provider = new ethers.JsonRpcProvider(`${ALCHEMY_URL}${ALCHEMY_API_KEY}`);

async function testAlchemyApiKey() {
  console.log("=== TESTING ALCHEMY API KEY VALIDITY ===");
  try {
    const network = await provider.getNetwork();
    console.log(
      `SUCCESS! Connected to network: ${network.name} (chainId: ${network.chainId})`
    );

    const blockNumber = await provider.getBlockNumber();
    console.log(`SUCCESS! Current block number: ${blockNumber}`);

    console.log("✅ API KEY IS VALID AND WORKING");
    return true;
  } catch (error) {
    console.error("❌ API KEY TEST FAILED:", error.message || error);
    return false;
  }
}

async function getTokenDetails(tokenAddress) {
  console.log(`\n=== GETTING TOKEN DETAILS FOR ${tokenAddress} ===`);

  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider
    );

    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name().catch(() => "Unknown"),
      tokenContract.symbol().catch(() => "Unknown"),
      tokenContract.decimals().catch(() => 18),
    ]);

    console.log(`Token Name: ${name}`);
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Token Decimals: ${decimals}`);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
    };
  } catch (error) {
    console.error(`Error getting token details: ${error.message}`);
    return { address: tokenAddress, error: error.message };
  }
}

async function getHistoricalPriceData(poolAddress, tokenDetails, days = 30) {
  console.log(
    `\n=== GETTING ${days} DAYS OF PRICE DATA FROM POOL ${poolAddress} ===`
  );

  try {
    const poolContract = new ethers.Contract(
      poolAddress,
      V3_POOL_ABI,
      provider
    );

    const [token0, token1] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
    ]);

    const isToken0 =
      tokenDetails.address.toLowerCase() === token0.toLowerCase();
    console.log(
      `Our token (${tokenDetails.symbol}) is ${
        isToken0 ? "token0" : "token1"
      } in the pool`
    );

    const currentBlock = await provider.getBlockNumber();
    console.log(`Current block: ${currentBlock}`);

    const blocksPerDay = 7200;
    const blocks = [];

    for (let i = 0; i < days; i++) {
      const blockNumber = currentBlock - i * blocksPerDay;
      blocks.push(blockNumber);
    }

    console.log(`Will check ${blocks.length} blocks for historical data`);

    const priceHistory = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      try {
        const slot0 = await poolContract.slot0({ blockTag: block });
        const sqrtPriceX96 = slot0[0];

        const base = Number(sqrtPriceX96) / 2 ** 96;
        const rawPrice = base * base;
        const price = isToken0 ? rawPrice : 1 / rawPrice;

        const blockData = await provider.getBlock(block);
        const timestamp = new Date(blockData.timestamp * 1000).toISOString();

        console.log(`Block ${block} (${timestamp}): Price = ${price}`);

        priceHistory.push({
          timestamp,
          block,
          price,
        });

        if (i < blocks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(
          `Error getting price for block ${block}: ${error.message}`
        );
      }
    }

    priceHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log(`Successfully retrieved ${priceHistory.length} price points`);
    return {
      poolAddress,
      token0,
      token1,
      isToken0,
      priceHistory,
    };
  } catch (error) {
    console.error(`Error getting historical price data: ${error.message}`);
    return { error: error.message };
  }
}

async function main() {
  console.log("=== STARTING PRICE HISTORY TEST ===");

  const isKeyValid = await testAlchemyApiKey();
  if (!isKeyValid) {
    console.error("Cannot continue - API key is invalid");
    return { error: "Invalid API key" };
  }

  console.log("\n📊 TESTING LINK TOKEN PRICE HISTORY:");
  const linkDetails = await getTokenDetails(LINK_TOKEN_ADDRESS);
  const linkResult = await getHistoricalPriceData(
    "0xa2107fa8f27aa9da2c2e25c4565dc4c3b2f1ebd0", // Replace with real LINK/WETH pool
    linkDetails,
    7
  );

  console.log("\n📊 TESTING BCRED TOKEN PRICE HISTORY:");
  const bcredDetails = await getTokenDetails(BCRED_TOKEN_ADDRESS);
  const bcredResult = await getHistoricalPriceData(
    HARDCODED_BCRED_POOL,
    bcredDetails,
    7
  );

  console.log("\n=== TEST COMPLETED ===");
  return {
    link: linkResult,
    bcred: bcredResult,
  };
}

main()
  .then((result) => {
    console.log("\n=== FINAL RESULT ===");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("FATAL ERROR:", error);
    process.exit(1);
  });
