import React, { useState, useEffect } from "react";
import Link from "next/link";
import { isMobile } from "react-device-detect";
import SVGLogo from "../svg/SVGLogo";
import { useSnapshot } from "valtio";
import { useTokenBalances } from "@/hooks/useTokenBalance";
import { PriceData, state } from "@/store";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface HeaderProps {
  basedaiData: PriceData | null;
  pepecoinData: PriceData | null;
}

const Header: React.FC<HeaderProps> = ({ basedaiData, pepecoinData }) => {
  const API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://braingecko-server-production-47f2.up.railway.app";

  const snap = useSnapshot(state);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWalletAddress(localStorage.getItem("wallet_address") || "");
    setUsername(localStorage.getItem("username") || "");
  }, []);

  const { tokenBalances, totalBalance, isLoading, tokenFlags } =
    useTokenBalances(walletAddress);

  useEffect(() => {
    const updateSupabase = async () => {
      console.log("FLOW useEffect", tokenFlags, tokenBalances);
      await fetch(`${API_URL}/api/update-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          totaltokens: totalBalance,
          token_combo: tokenFlags,
          basedai_balance: tokenBalances[0]?.balance || "0",
          pepecoin_balance: tokenBalances[1]?.balance || "0",
          bcred_balance: tokenBalances[2]?.balance || "0",
        }),
      });
    };

    updateSupabase();
  }, [
    walletAddress,
    isConnecting,
    snap.walletAddress,
    totalBalance,
    tokenFlags,
    success,
    tokenBalances,
  ]);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0].toLowerCase(); // Normalize the wallet address to lowercase

      const message = `Welcome to BrainGecko!\nClick to sign in and accept the terms of service.\nThis request will not trigger a blockchain transaction or cost any gas fees.\nWallet address:\n${account}`;
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account,
          signature,
          message,
          totaltokens: totalBalance,
        }),
      });

      const data = await response.json();
      console.log("data login", data);

      if (data.success) {
        localStorage.setItem("wallet_address", account);
        localStorage.setItem("username", data.profile.username);
        state.walletAddress = account;
        state.username = data.profile.username;
        setWalletAddress(account);
        setTimeout(() => {
          setSuccess(true);
        }, 1000);
        // Trigger immediate token balance update
      } else {
        console.error("Failed to verify signature:", data.error);
      }
    } catch (error) {
      console.error("Failed to connect to MetaMask:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("username");
    state.walletAddress = "";
    state.username = "";
  };

  return (
    <header className="flex items-center bg-gray-950 text-cyan-400 w-full border-b border-cyan-400 p-4">
      <Link href="/">
        <div
          className="flex items-center space-x-3 pl-3 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <SVGLogo width={20} height={20} />
          <h1
            className="text-cyan-400 text-xl leading-none opacity-90 animate-flicker translate-y-[1px] press-start pl-2"
            style={{
              animationDuration: isHovered ? "0.4s" : "4s",
              animationTimingFunction: "ease",
              animationIterationCount: "infinite",
              textShadow: "0px 0px 8px rgb(0, 255, 255)",
            }}
          >
            BrainGecko
          </h1>
        </div>
      </Link>
      {!isMobile && (
        <div className="flex items-center space-x-4 ml-auto">
          <button
            onClick={snap.walletAddress ? logout : connectMetaMask}
            disabled={isConnecting}
            className="ml-4 px-4 py-1 text-sm font-semibold border border-cyan-500 text-cyan-500 rounded hover:bg-cyan-500 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClient
              ? isConnecting
                ? "Connecting..."
                : snap.walletAddress
                ? `Logout | ${snap.username || walletAddress.slice(0, 10)}`
                : "Connect MetaMask"
              : "Loading..."}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
