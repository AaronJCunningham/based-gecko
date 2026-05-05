"use client";

import React from "react";
import { snapshot } from "valtio";
import { BrainEvent, state } from "@/store";

interface Transaction {
  type: string;
  priceETH?: string;
  volumeETH?: number;
  price?: string;
  volume?: string;
  trader: string;
}

interface TransactionTableProps {
  brainid: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ brainid }) => {
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

  if (recentTransactions.length === 0) {
    return (
      <div className="p-2 w-full text-gray-400 text-sm">Data not available</div>
    );
  }

  return (
    <div className="p-2 w-full">
      <h2 className="text-lg font-bold mb-3 text-gray-300">Transactions</h2>
      <div className="overflow-y-auto max-h-80">
        <table className="table-auto w-full text-xs">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-2 text-left text-gray-400 font-medium">
                Type
              </th>
              <th className="py-2 px-2 text-left text-gray-400 font-medium">
                Price
              </th>
              <th className="py-2 px-2 text-left text-gray-400 font-medium">
                Volume
              </th>
              <th className="py-2 px-2 text-left text-gray-400 font-medium">
                Trader
              </th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.slice(-50).map((tx, index) => (
              <tr
                key={index}
                className="border-b border-gray-800 hover:bg-gray-900"
              >
                <td
                  className={`py-1 px-2 ${
                    tx.type === "Buy" ? "text-emerald-400" : "text-rose-500"
                  }`}
                >
                  {tx.type}
                </td>
                <td className="py-1 px-2 text-gray-300">
                  {state.ethereumData?.price
                    ? "$" +
                      (Number(tx.priceETH) * state.ethereumData.price).toFixed(
                        2
                      )
                    : "N/A"}
                </td>
                <td className="py-1 px-2 text-gray-300">
                  {state.ethereumData?.price
                    ? "$" +
                      (Number(tx.volumeETH) * state.ethereumData.price).toFixed(
                        2
                      )
                    : "N/A"}
                </td>
                <td className="py-1 px-2">
                  <a
                    href={`https://etherscan.io/address/${tx.trader}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {tx.trader}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
