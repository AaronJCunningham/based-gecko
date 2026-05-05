"use client";
import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useSnapshot } from "valtio";
import Draggable from "react-draggable";
import { state } from "@/store";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import gsap from "gsap";
import { isMobile } from "react-device-detect";
import { formatNumber } from "@/util/formatBigNumber";

interface ChatMessage {
  user: string;
  message: string;
  totaltokens?: string;
  token_combo?: string;
}

const TrollBox = () => {
  const snap = useSnapshot(state);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [boxWidth, setBoxWidth] = useState("400px");
  const [topStreakUser, setTopStreakUser] = useState<string | null>(null);
  const [topStreakCount, setTopStreakCount] = useState<number | null>(null);

  const [topBasedaiUser, setTopBasedaiUser] = useState<string | null>(null);
  const [topBasedaiBalance, setTopBasedaiBalance] = useState<number | null>(
    null
  );

  const [topPepecoinUser, setTopPepecoinUser] = useState<string | null>(null);
  const [topPepecoinBalance, setTopPepecoinBalance] = useState<number | null>(
    null
  );

  const [topBcredUser, setTopBcredUser] = useState<string | null>(null);
  const [topBcredBalance, setTopBcredBalance] = useState<number | null>(null);
  const [heightOption, setHeightOption] = useState("normal");

  const [topTotalTokenUser, setTopTotalTokenUser] = useState<string | null>(
    null
  );
  const [topTotalTokenBalance, setTopTotalTokenBalance] = useState<
    number | null
  >(null);

  const [placeholder, setPlaceholder] = useState("Awaiting input...");
  const nodeRef = useRef(null);
  const dragHandleRef = useRef(null);

  const API_URL =
    process.env.NODE_ENV === "development"
      ? "ws://localhost:3001"
      : "wss://braingecko-server-production-47f2.up.railway.app";
  const HTTP_API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://braingecko-server-production-47f2.up.railway.app";

  const generateGuestUsername = () =>
    `Based${Math.floor(Math.random() * 9000) + 1000}`;

  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("username") || generateGuestUsername();
    }
    return generateGuestUsername();
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socket = useRef<Socket | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const connectSocket = (currentUsername: string) => {
    if (socket.current) {
      socket.current.disconnect();
    }

    socket.current = io(API_URL);

    socket.current.on("connect", () => {
      console.log("SOCKET: Connected as", currentUsername);
    });

    socket.current.on("chat", (data) => {
      console.log("SOCKET: Message received", data);
      setMessages(data.chatArray);
    });

    socket.current.on("disconnect", () => {
      console.log("SOCKET: Disconnected from server");
    });
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${HTTP_API_URL}/api/leaderboard`);
        const data = await response.json();
        console.log("names", data);
        console.log("FLOW DATAA", data);
        if (data.success) {
          setTopStreakUser(data.topStreak?.username || "Based1337");
          setTopStreakCount(data.topStreak?.streak_count || 42);

          setTopTotalTokenUser(data.topHolder?.username || "BasedWhale");
          setTopTotalTokenBalance(data.topHolder?.totaltokens || 1000000);

          setTopBasedaiUser(data.topBasedaiHolder?.username || "BasedBot");
          setTopBasedaiBalance(
            data.topBasedaiHolder?.basedai_balance || 500000
          );

          setTopPepecoinUser(data.topPepecoinHolder?.username || "PepeKing");
          setTopPepecoinBalance(
            data.topPepecoinHolder?.pepecoin_balance || 750000
          );

          setTopBcredUser(data.topBcredHolder?.username || "BrainLord");
          setTopBcredBalance(data.topBcredHolder?.bcred_balance || 250000);
        } else {
          console.error("Failed to fetch leaderboard:", data.error);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    connectSocket(username);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [username]); // Reconnect when username changes

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        height: snap.isCollapsed
          ? 0
          : heightOption === "normal"
          ? "290px"
          : "450",
        duration: 0.3,
        ease: "power2.inOut",
      });
    }
  }, [snap.isCollapsed, heightOption]);

  const biggestWhale = React.useMemo(() => {
    if (!messages.length) return null;
    const maxTokens = Math.max(...messages.map((m) => Number(m.totaltokens)));
    return messages.find(
      (msg) =>
        msg.token_combo === "111" && Number(msg.totaltokens) === maxTokens
    );
  }, [messages]);

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUsername.trim()) return;

    const newUsername = tempUsername.trim();
    state.username = newUsername; // Update global state
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
    setShowModal(false);
    setTempUsername("");

    const walletAddress = state.walletAddress;
    if (!walletAddress) return;

    try {
      const response = await fetch(
        "https://braingecko-server-production-47f2.up.railway.app/api/update-username",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: walletAddress,
            username: newUsername,
          }),
        }
      );

      const data = await response.json();
      console.log("Update Username Response:", data);

      if (!data.success) {
        console.error("Failed to update username in Supabase:", data.error);
      } else {
        console.log("Username updated successfully in Supabase.");
      }
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const storedUsername =
        localStorage.getItem("username") ||
        `Based${Math.floor(Math.random() * 9000) + 1000}`;

      const newMessage = {
        user: storedUsername,
        message: inputMessage,
      };

      console.log("SOCKET: Sending message", newMessage);
      socket.current?.emit("chat", newMessage);
      setInputMessage("");
    }
  };

  const handleButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    state.isCollapsed = !snap.isCollapsed;
  };

  const handleSettingsClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setShowModal(!showModal);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBoxWidth(isMobile ? "98vw" : "400px");
    }
  }, []);

  return (
    <Draggable
      nodeRef={nodeRef}
      axis="x"
      handle=".handle"
      disabled={isMobile}
      bounds={{
        left: 0,
        right:
          typeof window !== "undefined"
            ? window.innerWidth - (isMobile ? 330 : 400)
            : 0,
      }}
      defaultPosition={{ x: state.position.x, y: 0 }}
      onDrag={(e, data) => {
        state.position.x = data.x;
      }}
    >
      <div
        ref={nodeRef}
        style={{
          position: "fixed",
          bottom: 0,
          width: boxWidth,
          backgroundColor: "#030712",
          color: "#fff",
          borderRadius: "10px 10px 0 0",
          zIndex: 9999,
          boxShadow: "0px 0px 10px rgba(0, 255, 255, 0.3)",
          border: "1px solid rgba(0, 255, 255, 0.2)",
        }}
      >
        <div
          ref={dragHandleRef}
          className="handle"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 10px",
            borderBottom: "1px solid #333",
            cursor: "move",
          }}
        >
          <span
            style={{ fontWeight: 300, fontSize: "0.7rem", color: "#00FFFF" }}
            className="press-start pl-2 translate-y-[2px]"
          >
            Basedbox
          </span>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={handleSettingsClick}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "8px",
              }}
            >
              <IoSettingsSharp size={14} />
            </button>
            <button
              onClick={handleButtonClick}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              {snap.isCollapsed ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
        {showModal && (
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "0",
              backgroundColor: "#030712",
              padding: "10px",
              border: "1px solid rgba(0, 255, 255, 0.2)",
              borderRadius: "3px",
              zIndex: 10000,
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "#ccc",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "0px 0px 5px rgba(0, 255, 255, 0.3)",
            }}
          >
            <form onSubmit={handleUsernameChange}>
              <input
                type="text"
                maxLength={9}
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="New username"
                style={{
                  backgroundColor: "#030712",
                  color: "#00FFFF",
                  border: "1px solid #444",
                  padding: "5px",
                  fontSize: "0.75rem",
                  borderRadius: "2px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                }}
              />
              <button
                type="submit"
                style={{
                  marginLeft: "5px",
                  backgroundColor: "#00FFFF",
                  color: "#000",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                }}
              >
                Save
              </button>
            </form>

            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "5px",
                backgroundColor: "#030712",
                borderRadius: "2px",
                border: "1px solid #444",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="radio"
                  name="trollbox-size"
                  value="normal"
                  checked={heightOption === "normal"}
                  onChange={() => setHeightOption("normal")}
                  style={{
                    appearance: "none",
                    width: "12px",
                    height: "12px",
                    border: "1px solid #888",
                    borderRadius: "50%",
                    backgroundColor:
                      heightOption === "normal" ? "#00FFFF" : "transparent",
                    cursor: "pointer",
                  }}
                />
                <span style={{ color: "#ccc" }}>Normal</span>
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="radio"
                  name="trollbox-size"
                  value="large"
                  checked={heightOption === "large"}
                  onChange={() => setHeightOption("large")}
                  style={{
                    appearance: "none",
                    width: "12px",
                    height: "12px",
                    border: "1px solid #888",
                    borderRadius: "50%",
                    backgroundColor:
                      heightOption === "large" ? "#00FFFF" : "transparent",
                    cursor: "pointer",
                  }}
                />
                <span style={{ color: "#ccc" }}>Large</span>
              </label>
            </div>
          </div>
        )}

        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexDirection: "column",
            height: snap.isCollapsed
              ? 0
              : heightOption === "normal"
              ? "290px"
              : "450px",
            overflow: "hidden",
          }}
        >
          <div className="p-2 border-b border-[rgba(0,255,255,0.1)] bg-[rgba(0,0,0,0.3)] font-mono tracking-wide">
            <div className="flex items-center gap-1 text-[0.7rem] text-gray-500">
              <span>TOP HOLDERS - LAST 24 HOURS</span>
            </div>
            <div className="flex flex-col">
              <div className="grid grid-cols-2 text-[0.7rem] text-gray-500">
                <div className="flex items-center gap-1">
                  <span title="Top Holder of all 3 tokens">🐋:</span>
                  <span className="text-[#00FFFF]">
                    {topTotalTokenUser} |{" "}
                    {topTotalTokenBalance && formatNumber(topTotalTokenBalance)}
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-start pl-1/2">
                  <span title="Top BASEDAI Holder">🤖:</span>
                  <span className="text-[#00FFFF]">
                    {topBasedaiUser} |{" "}
                    {topBasedaiBalance && formatNumber(topBasedaiBalance)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 text-[0.7rem] text-gray-500 ">
                <div className="flex items-center gap-1">
                  <span title="Top PEPECOIN holder">🐸:</span>
                  <span className="text-[#00FFFF]">
                    {topPepecoinUser} |{" "}
                    {topPepecoinBalance && formatNumber(topPepecoinBalance)}
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-start pl-1/2 w-full">
                  <span title="Top BCRED holder">🧠:</span>
                  <span className="text-[#00FFFF]">
                    {topBcredUser} |{" "}
                    {topBcredBalance && formatNumber(topBcredBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-[0.7rem] text-gray-500">
              <div className="flex justify-start">
                <span title="Top Chat daily streak">
                  HOT DAILY STREAK:{" "}
                  <span className="text-[#00FFFF]">
                    {topStreakUser || "..."} [{topStreakCount || 0}{" "}
                    {topStreakCount === 1 ? "day" : "days"}]
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "10px",
              backgroundColor: "#000",
              fontFamily: "monospace",
              boxShadow: "inset 0 0 10px rgba(0, 255, 255, 0.1)",
            }}
            ref={messagesContainerRef}
          >
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: "6px" }}>
                <div
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: "4px",
                    padding: "8px",
                    border: "1px solid #333",
                  }}
                >
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    <span style={{ color: "#00FFFF", fontSize: "0.7rem" }}>
                      {msg.token_combo === "111" && "🐋"}
                      {msg.token_combo === "100" && "🤖"}
                      {msg.token_combo === "010" && "🐸"}
                      {msg.token_combo === "001" && "🧠"}
                      {msg.token_combo === "110" && "💪"}
                      {msg.token_combo === "101" && "🤠"}
                      {msg.token_combo === "011" && "😘"} {msg.user}{" "}
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        opacity: 0.9,
                        fontSize: "0.8rem",
                      }}
                    >
                      {msg.message}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSendMessage}
            style={{
              display: "flex",
              borderTop: "1px solid #333",
              padding: "2px",
              position: "sticky",
              bottom: 0,
              backgroundColor: "#030712",
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1,
                padding: "5px",
                border: "none",
                outline: "none",
                backgroundColor: "#111",
                fontSize: "0.8rem",
                color: "#fff",
                borderRadius: "5px",
              }}
            />
            <button
              type="submit"
              style={{
                marginLeft: "5px",
                marginRight: "10px",
                backgroundColor: "#00FFFF",
                color: "#000",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </Draggable>
  );
};

export default TrollBox;
