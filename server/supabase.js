const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_KEY } = require("./constants");

let supabase;

try {
  supabase = createClient(
    "https://upkndywdvkyakharowls.supabase.co",
    SUPABASE_KEY || "" // Provide default to prevent crash
  );
} catch (error) {
  console.error("Error initializing Supabase:", error);
}

module.exports = { supabase };
