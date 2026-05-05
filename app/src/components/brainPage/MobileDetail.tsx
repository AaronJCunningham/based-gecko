import React from "react";
import TradingChart from "./TradingChart";
import TransactionTable from "./TransactionTable";
import LeftColumn from "./LeftColumn";
import Link from "next/link";
import { BrainEvent, state } from "@/store";
import Scene from "../webgl/Scene";

interface MobileDetailProps {
  brainid: string;
  uniswapStats: any;
  isMobile: boolean;
}

const MobileDetail: React.FC<MobileDetailProps> = ({
  brainid,
  uniswapStats,
  isMobile,
}) => {
  const brainData = state.activatedBrains.find(
    (brain) => brain.brainNumber.toString() === brainid
  ) as BrainEvent | undefined;

  if (
    !brainData?.chartData?.priceHistory ||
    brainData.chartData.priceHistory.length === 0
  ) {
    return <Scene />;
  }
  return (
    <div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 pt-4 pl-3">
          <Link
            href="/"
            className="text-white hover:text-cyan-300 text-lg font-semibold"
          >
            TOKENS
          </Link>
          <span className="text-gray-500">&gt;</span>
          <p className="text-lg font-semibold text-white">
            {brainid === "BASEDAI"
              ? "BASEDAI"
              : brainid === "PEPECOIN"
              ? "PEPECOIN"
              : brainid === "BCRED"
              ? "BCRED"
              : brainid}
          </p>
        </div>
        <TradingChart key={brainid} isMobile={isMobile} brainid={brainid} />
      </div>
      <div>
        <LeftColumn brainid={brainid} uniswapStats={uniswapStats} />
      </div>
      <div className="h-[40%]">
        <TransactionTable brainid={brainid} />
      </div>
    </div>
  );
};

export default MobileDetail;
