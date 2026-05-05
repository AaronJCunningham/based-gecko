"use client";

import React from "react";
import { snapshot } from "valtio";
import { state } from "@/store";
import { BrainEvent, PriceHistoryEntry } from "@/store";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Line,
  ReferenceLine,
  Area,
} from "recharts";

interface TradingChartProps {
  isMobile: boolean;
  brainid: string;
}

interface CandleData {
  time: number;
  displayTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  color: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ isMobile, brainid }) => {
  const snap = snapshot(state);
  console.log("chart", brainid);

  const brainData = state.activatedBrains.find(
    (brain) => brain.brainNumber.toString() === brainid
  ) as BrainEvent | undefined;

  const priceHistory: PriceHistoryEntry[] = brainData?.chartData?.priceHistory
    ? Array.from(brainData.chartData.priceHistory)
    : [];

  if (!brainData || priceHistory.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No Chart Available
      </div>
    );
  }

  const chartData = priceHistory
    .map((entry, index) => {
      const priceMultiplier = snap.ethereumData?.price || 1;
      const price = entry.priceInEth * priceMultiplier;

      // Ensure we have a valid date
      let date = new Date(entry.timestamp);

      // If date is invalid, create a fallback date based on index
      if (isNaN(date.getTime())) {
        date = new Date();
        date.setDate(date.getDate() - (priceHistory.length - index));
      }

      return {
        time: date.getTime(),
        displayTime: date.toLocaleDateString(),
        price: price,
      };
    })
    .sort((a, b) => a.time - b.time);

  // Keep last 60 days of data
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const filteredData = chartData.filter((d) => d.time >= sixtyDaysAgo);

  // Additional check to fix invalid dates
  filteredData.forEach((data) => {
    if (isNaN(new Date(data.time).getTime())) {
      // If date is invalid, set it to a valid date based on its position
      const index = filteredData.indexOf(data);
      const validDate = new Date();
      validDate.setDate(validDate.getDate() - (filteredData.length - index));
      data.time = validDate.getTime();
      data.displayTime = validDate.toLocaleDateString();
    }
  });

  // For domain calculation
  const minPrice = Math.min(...filteredData.map((d) => d.price));
  const maxPrice = Math.max(...filteredData.map((d) => d.price));
  const pricePadding = (maxPrice - minPrice) * 0.1;

  return (
    <div
      className={`flex justify-center w-full ${isMobile ? "pr-4 pt-4" : ""}`}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={filteredData}>
          <XAxis
            dataKey="time"
            tickFormatter={(tick) =>
              new Date(tick).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            stroke="#808080"
            fontSize={10}
          />
          <YAxis
            domain={[minPrice - pricePadding, maxPrice + pricePadding]}
            stroke="#808080"
            tickFormatter={(value) => value.toFixed(2)}
            fontSize={10}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <p className="text-white text-sm">
                      {new Date(data.time).toLocaleDateString()}
                    </p>
                    <p className="text-cyan-300 text-sm">
                      Price: ${data.price.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <CartesianGrid stroke="#202020" />

          {/* Area with gradient below the line */}
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#000000" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke="none"
            fill="url(#colorUv)"
          />

          {/* Closing price line on top */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00ffff"
            dot={false}
            strokeWidth={1.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;
