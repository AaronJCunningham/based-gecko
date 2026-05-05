"use client";

import React from "react";
import TransactionTable from "./TransactionTable";
import TradingChart from "./TradingChart";
import Scene from "../webgl/Scene";
import { BrainEvent, state } from "@/store";
import Link from "next/link";

interface Transaction {
  type: string;
  priceETH?: string;
  volumeETH?: number;
  price?: string;
  volume?: string;
  trader: string;
}

interface BrainData {
  priceHistory: Array<{ timestamp: string; priceInEth: number }>;
}

interface MiddleChartProps {
  brainid: string;

  isMobile: boolean;
}

const MiddleChart: React.FC<MiddleChartProps> = ({
  brainid,

  isMobile,
}) => {
  const brainData = state.activatedBrains.find(
    (brain) => brain.brainNumber.toString() === brainid
  ) as BrainEvent | undefined;

  const stats = brainData?.stats?.stats;

  console.log("stats trad", brainid, stats);
  const recentTransactions: Transaction[] = Array.isArray(
    stats?.recentTransactions
  )
    ? stats.recentTransactions
    : [];

  if (
    !brainData?.chartData?.priceHistory ||
    brainData.chartData.priceHistory.length === 0
  ) {
    return <Scene />;
  }

  return (
    <div className="col-span-9 p-2 pt-0 rounded-md line-left line-right h-screen">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 pt-4">
          <Link
            href="/"
            className="text-white hover:text-cyan-300 text-lg font-semibold"
          >
            TOKENS
          </Link>
          <span className="text-gray-500">&gt;</span>
          <p className="text-lg font-semibold">
            {brainid === "BASEDAI"
              ? "BASEDAI"
              : brainid === "PEPECOIN"
              ? "PEPECOIN"
              : brainid === "BCRED"
              ? "BCRED"
              : brainid}
          </p>
        </div>
        <div className="flex-grow">
          <TradingChart key={brainid} isMobile={isMobile} brainid={brainid} />
        </div>
        <div className="h-[40%]">
          <TransactionTable brainid={brainid} />
        </div>
      </div>
    </div>
  );
};

export default MiddleChart;
