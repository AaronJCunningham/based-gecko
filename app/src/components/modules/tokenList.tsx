"use client";

import React, { useState, useEffect, useRef } from "react";
import TokenTrendChart from "./TokenTrendChart";
import { formatBigNumber, formatNumber } from "@/util/formatBigNumber";
import SVGDownTriangle from "../svg/SVGDownTriangle";
import SVGUpTriangle from "../svg/SVGUpTriangle";
import Link from "next/link";
import { BrainEvent, PriceHistoryEntry, state, TokenData } from "@/store";
import SVGLogo from "../svg/SVGLogo";
import { useSnapshot } from "valtio";
import { FiCopy } from "react-icons/fi";
import LaunchPoolModal from "./LaunchPoolModal";

interface TokenListProps {
  hasData: boolean;
  activatedBrains: BrainEvent[];
}

const TokenList: React.FC<TokenListProps> = ({ hasData, activatedBrains }) => {
  const snap = useSnapshot(state);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalBrainId, setModalBrainId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleLaunchClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    brainId: string,
    tokenAddress: string
  ) => {
    event.preventDefault();
    setAddress(tokenAddress);
    setModalMessage(`Want to launch Brain${brainId}'s liquidity pool?`);
    setShowModal(true);
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TokenData | "";
    direction: "ascending" | "descending";
  }>({
    key: "",
    direction: "ascending",
  });
  const tokensPerPage = 100;
  const latestDataRef = useRef<TokenData[]>([]);

  useEffect(() => {
    console.log("activated", activatedBrains);
    const mockDataTemplate = {
      mcap: 33410160,
      twentyFourHourVolume: 5172765.35,
      tokenSevenDayData: {
        tokenDayData: [
          { date: "2024-12-01", priceUSD: "41.0" },
          { date: "2024-12-02", priceUSD: "60.21" },
          { date: "2024-12-03", priceUSD: "70.1" },
          { date: "2024-12-04", priceUSD: "4.39" },
        ],
      },
    };

    const mockData = activatedBrains.map((brain) => {
      const brainPriceETH = brain.stats?.stats?.priceETH ?? 0;
      const ethPrice = state.ethereumData?.price ?? 0;
      const price = brainPriceETH && ethPrice ? brainPriceETH * ethPrice : 0;
      const priceETH = brainPriceETH;
      let priceHistory: PriceHistoryEntry[] = [];
      const hasLiquidity = !!brain.hasLiquidity;

      if (hasLiquidity && brain.chartData?.priceHistory?.length) {
        priceHistory = brain.chartData.priceHistory;
      }

      const todayPrice = priceHistory[0]?.priceInEth * 1000;
      const yesterdayPrice = priceHistory[1]?.priceInEth * 1000;
      const sevenDaysAgoPrice = priceHistory[7]?.priceInEth * 1000;

      const priceChange24Hour = yesterdayPrice
        ? +(((todayPrice - yesterdayPrice) / yesterdayPrice) * 100).toFixed(2)
        : 0;

      const priceChange7Day = sevenDaysAgoPrice
        ? +(
            ((todayPrice - sevenDaysAgoPrice) / sevenDaysAgoPrice) *
            100
          ).toFixed(2)
        : 0;

      const getMarketCap = (brain: BrainEvent) => {
        return (brain.stats?.stats?.marketCapETH ?? 0) * (state.ethereumData?.price ?? 0);
      };

      return {
        nftId: brain.brainNumber.toString(),
        address: brain.brainAddress,
        buyUrl: `https://app.uniswap.org/explore/tokens/ethereum/${brain.brainAddress}`,
        price: price,
        priceETH: priceETH,
        priceChange1Hour:
          priceHistory.length > 1
            ? +(
                ((priceHistory[priceHistory.length - 1]?.priceInEth -
                  priceHistory[priceHistory.length - 2]?.priceInEth) /
                  priceHistory[priceHistory.length - 2]?.priceInEth) *
                100
              ).toFixed(2)
            : 0,
        priceChange24Hour, // ✅ Now calculated from real price data
        priceChange7Day, // ✅ Now calculated from real price data
        mcap:
          brain.stats?.stats?.marketCapETH && state.ethereumData?.price
            ? Number(getMarketCap(brain).toFixed(2)).toLocaleString()
            : "N/A",
        twentyFourHourVolume: 44,

        tokenSevenDayData: {
          tokenDayData: priceHistory.length
            ? priceHistory.map((entry) => ({
                date: entry.timestamp.split("T")[0],
                priceUSD: (entry.priceInEth * 1000).toFixed(2),
              }))
            : mockDataTemplate.tokenSevenDayData.tokenDayData,
        },
        hasLiquidity,
      };
    });

    console.log("mock", mockData);
    setTokens(mockData as TokenData[]);
  }, [activatedBrains, snap.ethereumData?.price]);

  const sortTokens = (key: keyof TokenData) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedTokens = [...tokens].sort((a, b) => {
      const valA = parseFloat(a[key] as unknown as string) || 0;
      const valB = parseFloat(b[key] as unknown as string) || 0;
      return direction === "ascending" ? valA - valB : valB - valA;
    });
    setTokens(sortedTokens);
  };

  const getSortIndicator = (key: keyof TokenData) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    }
    return null;
  };

  return (
    <>
      <LaunchPoolModal
        showModal={showModal}
        setShowModal={setShowModal}
        address={address}
        modalMessage={modalMessage}
      />

      <div className="bg-gray-950 text-white min-h-screen p-2 mb-5">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-[1200px] overflow-x-auto">
            {tokens.length > 0 && (
              <table className="table-auto w-full text-left border-collapse text-xs">
                <thead className="text-gray-300">
                  <tr>
                    <th className="py-3 px- border-b border-gray-700 text-center">
                      #
                    </th>
                    <th
                      className="py-2 px-2 border-b border-gray-700 cursor-pointer"
                      onClick={() => sortTokens("nftId")}
                    >
                      Name {getSortIndicator("nftId")}
                    </th>
                    <th
                      className="py-2 px-2 border-b border-gray-700 text-center cursor-pointer"
                      onClick={() => sortTokens("price")}
                    >
                      Price {getSortIndicator("price")}
                    </th>
                    <th
                      className="py-2 px-2 border-b border-gray-700 text-center cursor-pointer"
                      onClick={() => sortTokens("price")}
                    >
                      Price ETH {getSortIndicator("price")}
                    </th>

                    <th
                      className="py-2 px-2 border-b border-gray-700 text-center cursor-pointer"
                      onClick={() => sortTokens("priceChange24Hour")}
                    >
                      24hr % {getSortIndicator("priceChange24Hour")}
                    </th>
                    <th
                      className="py-2 px-2 border-b border-gray-700 text-center cursor-pointer"
                      onClick={() => sortTokens("priceChange7Day")}
                    >
                      7d % {getSortIndicator("priceChange7Day")}
                    </th>
                    <th
                      className="py-2 px-2 border-b border-gray-700 text-center cursor-pointer"
                      onClick={() => sortTokens("mcap")}
                    >
                      Market Cap {getSortIndicator("mcap")}
                    </th>

                    <th className="py-2 px-2 border-b border-gray-700 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-700 hover:bg-gray-800 ${
                        index % 2 === 1 ? "bg-gray-950" : "bg-gray-900"
                      }`}
                    >
                      <td className="py-1 px-2 text-center">{index + 1}</td>
                      <td className="py-1 px-2 truncate">
                        <div className="flex items-center space-x-2">
                          {token.nftId === "PEPECOIN" ? (
                            <img
                              src="/pepecoin.png"
                              className="w-3 h-3"
                              alt="pepecoin"
                            />
                          ) : (
                            <SVGLogo className="w-3 h-3" />
                          )}
                          <Link href={`/${token.nftId}`}>
                            <span className="font-medium text-cyan-500 hover:text-white">
                              {token.nftId === "BASEDAI"
                                ? "BASEDAI"
                                : token.nftId === "PEPECOIN"
                                ? "PEPECOIN"
                                : token.nftId === "BCRED"
                                ? "BCRED"
                                : `BRAIN${token.nftId}`}
                            </span>
                          </Link>
                        </div>
                      </td>

                      {token.hasLiquidity ? (
                        <>
                          <td className="py-1 px-2 text-center">
                            {token.price !== undefined
                              ? `$${token.price.toFixed(2)}`
                              : "N/A"}
                          </td>
                          <td className="py-1 px-2 text-center">
                            {token.priceETH !== undefined
                              ? `E${token.priceETH}`
                              : "N/A"}
                          </td>
                          <td className="py-1 px-2 text-center">
                            <span
                              className={
                                token.priceChange24Hour
                                  ? token.priceChange24Hour > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                  : ""
                              }
                            >
                              {token.priceChange24Hour !== undefined
                                ? `${token.priceChange24Hour}%`
                                : "N/A"}
                            </span>
                          </td>
                          <td className="py-1 px-2 text-center">
                            <span
                              className={
                                token.priceChange7Day
                                  ? token.priceChange7Day > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                  : ""
                              }
                            >
                              {token.priceChange7Day !== undefined
                                ? `${token.priceChange7Day}%`
                                : "N/A"}
                            </span>
                          </td>
                          <td className="py-1 px-2 text-center">
                            {token.mcap !== undefined
                              ? `$${formatNumber(token.mcap)}`
                              : "N/A"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-1 px-2 text-center">N/A</td>
                          <td className="py-1 px-2 text-center">N/A</td>
                          <td className="py-1 px-2 text-center">N/A</td>
                          <td className="py-1 px-2 text-center">N/A</td>
                          <td className="py-1 px-2 text-center">N/A</td>
                        </>
                      )}
                      <td className="py-1 px-2 text-center flex justify-center items-center">
                        {token.hasLiquidity ? (
                          <a
                            href={token.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-cyan-500 text-black text-xs px-2 py-1 rounded hover:bg-cyan-400 w-[55px] flex justify-center items-center"
                          >
                            Buy
                          </a>
                        ) : (
                          <button
                            onClick={(e) =>
                              handleLaunchClick(
                                e as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
                                token.nftId,
                                token.address ?? ""
                              )
                            }
                            className="bg-cyan-500 text-black text-xs px-2 py-1 rounded hover:bg-cyan-400 w-[55px] flex justify-center items-center"
                          >
                            Launch
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenList;
