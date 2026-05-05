"use client";

import TrollBox from "@/components/brainPage/TrollBox";
import MinimalFooter from "@/components/modules/Footer";
import Header from "@/components/modules/Header";
import Loader from "@/components/modules/Loader";
import TokenList from "@/components/modules/tokenList";
import { fetchEventsAndPools } from "@/services/fetchEventsAndPools";
import { fetchLatestBlock } from "@/services/fetchLatestBlock";
import { fetchPastEvents } from "@/services/fetchPastEvents";
import { fetchPriceData } from "@/services/fetchPriceData";
import { BrainEvent, state, TokenData } from "@/store";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";

const Page: React.FC = () => {
  const snap = useSnapshot(state);
  //fetches all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          !state.activatedBrains.length ||
          !state.basedaiData ||
          !state.pepecoinData
        ) {
          const { latestBlock } = await fetchLatestBlock();
          const historicalBlock = Number(latestBlock) - 10678633;

          const allEvents = await fetchEventsAndPools();
          console.log("FLOW", allEvents);
          state.activatedBrains = allEvents;

          const ethereum = await fetchPriceData("ethereum", 1);

          if (ethereum && ethereum.length > 0) {
            state.ethereumData = ethereum[ethereum.length - 1];
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (snap.activatedBrains.length === 0) {
    return <Loader />;
  }

  return (
    <>
      <div className="mainContent">
        <Header
          basedaiData={snap.basedaiData}
          pepecoinData={snap.pepecoinData}
        />
        <div className="col-xl-12 col-xxl-12">
          <TokenList
            hasData={true}
            activatedBrains={snap.activatedBrains as BrainEvent[]}
          />
        </div>
        <MinimalFooter />
      </div>
    </>
  );
};

export default Page;
