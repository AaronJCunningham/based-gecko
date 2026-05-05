"use client";

import React, { useState } from "react";
import { snapshot } from "valtio";
import { BrainEvent, BrainStats, state } from "@/store";
import { formatNumber } from "@/util/formatBigNumber";
import { FiCopy } from "react-icons/fi";
import LaunchPoolModal from "../modules/LaunchPoolModal";

interface TradingDataProps {
  brainid: string;
}

const TradingData: React.FC<TradingDataProps> = ({ brainid }) => {
  const snap = snapshot(state);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [address, setAddress] = useState("");

  // Find the brain data based on brainid
  const brainData = state.activatedBrains.find(
    (brain) => brain.brainNumber.toString() === brainid
  ) as BrainEvent | undefined;
  const stats = brainData?.stats?.stats;
  const poolAddress = brainData?.chartData?.pairAddress;

  const ethPrice = state.ethereumData?.price ?? 0;

  const priceUSD =
    stats && stats.priceETH && ethPrice
      ? (stats.priceETH * ethPrice).toFixed(2)
      : "N/A";

  const priceETH = stats?.priceETH || "N/A";

  const marketCap =
    stats && stats.marketCapETH && ethPrice
      ? (stats.marketCapETH * ethPrice).toFixed(2)
      : "N/A";

  const transactions = stats?.txs ? stats.txs : "N/A";

  const liquidity =
    stats?.liquidityETH && state.ethereumData?.price
      ? (Number(stats.liquidityETH) * state.ethereumData.price).toFixed(2)
      : "N/A";

  const volumeUSD =
    stats?.volumeETH && ethPrice
      ? stats.volumeETH === 0
        ? "N/A"
        : `$${(stats.volumeETH * ethPrice).toFixed(2)}`
      : "N/A";

  const calculateTotalVolume = (
    transactions: BrainStats["recentTransactions"],
    ethPrice: number
  ): { totalVolume: number; totalTransactions: number } => {
    const totalVolume =
      (transactions?.reduce((sum, tx) => sum + (tx.volumeETH || 0), 0) ?? 0) *
      ethPrice;

    const totalTransactions = transactions?.length || 0;

    return {
      totalVolume,
      totalTransactions,
    };
  };

  const { totalVolume, totalTransactions } = calculateTotalVolume(
    stats?.recentTransactions,
    state.ethereumData?.price || 0
  );

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setAddress(brainData?.brainAddress || "");
    setModalMessage(`Want to launch Brain${brainid}'s liquidity pool?`);
    setShowModal(true);
  };
  return (
    <>
      <LaunchPoolModal
        showModal={showModal}
        setShowModal={setShowModal}
        address={address}
        modalMessage={modalMessage}
      />

      <div className="mb-6">
        {/* Price Section */}

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="border border-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Price USD</div>
            <div className="text-lg font-bold text-white">
              {"$" + formatNumber(priceUSD)}
            </div>
          </div>
          <div className="border border-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Price ETH</div>
            <div className="text-lg font-bold text-white">{priceETH}</div>
          </div>
        </div>

        {/* Market Cap and Liquidity */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="border border-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Mkt Cap</div>
            <div className="text-sm text-white">
              {"$" + formatNumber(marketCap)}
            </div>
          </div>
          <div className="border border-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Volume 24 Hour</div>
            <div className="text-sm text-white">
              {formatNumber(totalVolume)}
            </div>
          </div>
        </div>
        {/* Market Cap and Liquidity */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="border border-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Transactions</div>
            <div className="text-sm text-white">{transactions}</div>
          </div>
          <div className="flex items-center h-[55px] justify-center border border-gray-700 rounded-md p-2 bg-cyan-500 text-black hover:bg-black hover:text-cyan-500 transition-colors duration-300">
            <a
              href={
                brainData?.hasLiquidity
                  ? `https://app.uniswap.org/explore/tokens/ethereum/${brainData?.brainAddress}`
                  : "https://app.uniswap.org/positions/create/v4"
              }
              onClick={!brainData?.hasLiquidity ? handleLaunchClick : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center"
            >
              {brainData?.hasLiquidity ? "Buy" : "Launch"}
            </a>
          </div>
        </div>
        <div>
          <div className="flex items-center  m-1 mt-5">
            {poolAddress ? (
              <>
                <p className="text-white text-sm truncate flex-grow">
                  Pool address{" "}
                  <a
                    href={`https://etherscan.io/address/${poolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="truncate hover:text-cyan-500">
                      {poolAddress}
                    </span>
                  </a>
                </p>
                <button
                  onClick={() => handleCopy(poolAddress as string)}
                  className="ml-2 text-sm text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                  title="Copy address to clipboard"
                >
                  <FiCopy className="h-4 w-4" />
                </button>
                {copied && (
                  <span className="ml-2 text-xs text-cyan-400">Copied!</span>
                )}
              </>
            ) : (
              <p className="text-white">No Active Pool</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TradingData;
