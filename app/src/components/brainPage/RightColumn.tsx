// components/RightColumn.tsx
"use client";

import React from "react";
import TrollBox from "./TrollBox";

const RightColumn: React.FC = () => {
  return (
    <div className="col-span-3 p-1 rounded-md grid grid-rows-[50%_50%] h-full">
      {/* Top Component - Empty for now */}
      <div className="h-full">
        <h2 className="text-xl font-semibold mb-4">Coming Soon...</h2>
      </div>

      {/* TrollBox Component - Takes remaining height */}
    </div>
  );
};

export default RightColumn;
