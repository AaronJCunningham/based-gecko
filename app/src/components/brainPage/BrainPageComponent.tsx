"use client";

import { useEffect, useState } from "react";
import Header from "@/components/modules/Header";
import LeftColumn from "./LeftColumn";
import MiddleChart from "./MiddleChart";
import { fetchLatestBlock } from "@/services/fetchLatestBlock";

import { fetchPriceData } from "@/services/fetchPriceData";
import { BrainEvent, state } from "@/store";
import { useSnapshot } from "valtio";
import fetchBrainMetadata from "@/services/fetchBrainMetadata";
import { fetchUniswapStats } from "@/services/fetchUniswapStats";
import { isMobile } from "react-device-detect";
import MobileDetail from "./MobileDetail";
import { fetchEventsAndPools } from "@/services/fetchEventsAndPools";

interface BrainPageComponentProps {
  params: { brainid: string };
}

interface BrainData {
  brainNumber: string;
  brainAddress: string;
}

export default function BrainPageComponent({
  params,
}: BrainPageComponentProps) {
  const snap = useSnapshot(state);

  const [brainData, setBrainData] = useState<BrainEvent | null>(null);
  const [uniswapStats, setUniswapStats] = useState<any>(null); // State for Uniswap stats
  const [isClientMobile, setIsClientMobile] = useState(false);

  useEffect(() => {
    setIsClientMobile(isMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUniswapStats(
          "0x44971ABF0251958492FeE97dA3e5C5adA88B9185"
        );
        setUniswapStats(data); // Save Uniswap stats in state
      } catch (error) {
        console.error("Error fetching Uniswap stats:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchBrainData = async () => {
      try {
        if (
          !state.activatedBrains.length ||
          !state.basedaiData ||
          !state.pepecoinData
        ) {
          const { latestBlock } = await fetchLatestBlock();
          const historicalBlock = Number(latestBlock) - 10678633;

          // Replaced fetchPastEvents with fetchLocalEvents
          const allEvents = await fetchEventsAndPools();
          state.activatedBrains = allEvents;

          const targetBrain = allEvents.find(
            (event) => event.brainNumber == params.brainid
          );
          console.log(targetBrain, allEvents);
          if (targetBrain) {
            setBrainData(targetBrain);
          }

          const basedai = await fetchPriceData("basedai", 1);
          const pepecoin = await fetchPriceData("pepecoin-2", 1);
          const ethereum = await fetchPriceData("ethereum", 1);

          if (basedai && basedai.length > 0) {
            state.basedaiData = basedai[basedai.length - 1];
          }

          if (pepecoin && pepecoin.length > 0) {
            state.pepecoinData = pepecoin[pepecoin.length - 1];
          }
          if (ethereum && ethereum.length > 0) {
            state.ethereumData = ethereum[ethereum.length - 1];
          }
        }
      } catch (error) {
        console.error("Error fetching brain data:", error);
      }
    };

    fetchBrainData();
    if (params.brainid !== "PEPECOIN") {
      fetchBrainMetadata(Number(params.brainid));
    }
  }, [params.brainid]);

  return (
    <div className="h-screen flex flex-col">
      <Header basedaiData={snap.basedaiData} pepecoinData={snap.pepecoinData} />

      {!isClientMobile && (
        <div className="grid grid-cols-12 gap-4 p-1 pt-0 bg-gray-950 text-white h-[calc(100vh-64px)] overflow-hidden">
          <LeftColumn
            brainid={(brainData?.brainNumber ?? params.brainid).toString()}
            uniswapStats={uniswapStats}
          />
          <MiddleChart
            brainid={(brainData?.brainNumber ?? params.brainid).toString()}
            isMobile={isClientMobile}
          />
        </div>
      )}

      {isClientMobile && (
        <div>
          <MobileDetail
            brainid={(brainData?.brainNumber ?? params.brainid).toString()}
            uniswapStats={uniswapStats}
            isMobile={isClientMobile}
          />
        </div>
      )}
    </div>
  );
}
