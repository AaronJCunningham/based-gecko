"use client";

import React from "react";
import { state } from "@/store";
import { useSnapshot } from "valtio";
import TradingData from "./TradingData";
import BrainMetadata from "./BrainMetadata";

interface LeftColumnProps {
  brainid: string;
  uniswapStats: any; // Add type here for Uniswap stats
}

const LeftColumn: React.FC<LeftColumnProps> = ({ brainid, uniswapStats }) => {
  const snap = useSnapshot(state);
  const metadata = useSnapshot(state).brainMetadata;
  const brainDetails = snap.activatedBrains.find(
    (brain) => brain.brainNumber.toString() === brainid
  );

  return (
    <div className="col-span-3 p-4 rounded-md">
      <TradingData brainid={brainid} />

      {/* Single line separator */}
      <div className="w-full h-[1px] bg-white opacity-25 mb-8" />

      <BrainMetadata
        brainDetails={brainDetails}
        metadata={metadata}
        brainid={brainid}
      />
    </div>
  );
};

export default LeftColumn;
