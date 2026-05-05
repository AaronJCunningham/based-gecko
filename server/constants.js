require("dotenv").config();

const ALCHEMY_URL = "https://eth-mainnet.g.alchemy.com/v2/";
const CONTRACT_ADDRESS = "0xB0974F12C7BA2f1dC31f2C2545B71Ef1998815a4";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const DEXTOOLS_API_KEY = process.env.DEXTOOLS_API_KEY;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

module.exports = {
  ALCHEMY_URL,
  CONTRACT_ADDRESS,
  ALCHEMY_API_KEY,
  COINGECKO_API_KEY,
  DEXTOOLS_API_KEY,
  SUPABASE_KEY,
};
