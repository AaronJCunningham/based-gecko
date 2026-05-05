const { Server } = require("socket.io");
const { supabase } = require("./supabase");
const fs = require("fs");
const path = require("path");

const badWordsPath = path.join(__dirname, "badwords.json");
const badWords = JSON.parse(fs.readFileSync(badWordsPath, "utf8"));

function containsLink(message) {
  const linkPattern =
    /(?:https?:\/\/|www\.)|(?:\b[a-zA-Z0-9.-]+\.(?:com|net|org|io|xyz|gov|edu|co|info|biz|tv|cc|us|uk|de|fr|au|jp|cn|ru|br|es|it|nl|eu|ch|se|no|fi|dk|pl|mx|za|be|at|hk|sg|nz|vn|tr|th|kr|id|cz|ar|my|pt|ph|gr|tw|hu|ro|ie|bg|sk|lt|hr|si|rs|ua|ee|lv|is|cl|by|mt|cy|lu|mc|sm|ad|li|va)\b)/gi;
  return linkPattern.test(message);
}

function censorMessage(message) {
  return message
    .split(" ")
    .map((word) =>
      badWords.includes(word.toLowerCase()) ? "*".repeat(word.length) : word
    )
    .join(" ");
}

// Attach WebSockets to the existing API server
function startWebSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "https://braingecko2.vercel.app"],
      methods: ["GET", "POST"],
    },
  });

  let chatHistory = [];

  io.on("connection", (socket) => {
    console.log("SOCKET: Client connected");
    socket.emit("chat", { chatArray: chatHistory });

    socket.on("chat", async (data) => {
      data.message = censorMessage(data.message);
      if (containsLink(data.message)) return;

      const { user } = data;
      const today = new Date().toISOString().split("T")[0];

      const { data: profile } = await supabase
        .from("profiles")
        .select("streak_count, last_streak_date, totaltokens, token_combo")
        .eq("username", user)
        .single();

      if (profile) {
        let streakCount = profile.streak_count || 0;
        let lastStreakDate = profile.last_streak_date;

        await supabase
          .from("profiles")
          .update({ last_active: new Date().toISOString() })
          .eq("username", user);

        if (lastStreakDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          streakCount = lastStreakDate === yesterdayStr ? streakCount + 1 : 1;
          await supabase
            .from("profiles")
            .update({
              streak_count: streakCount,
              last_streak_date: today,
              last_active: new Date().toISOString(),
            })
            .eq("username", user);
        }

        data.totaltokens = profile.totaltokens;
        data.token_combo = profile.token_combo;
      }
      console.log(data);
      chatHistory.push(data);
      if (chatHistory.length > 200) chatHistory.shift();
      io.emit("chat", { chatArray: chatHistory });
    });

    socket.on("disconnect", () => {
      console.log("SOCKET: Client disconnected");
    });
  });

  console.log(`WebSocket Server attached to API server`);
}

module.exports = { startWebSocketServer };
