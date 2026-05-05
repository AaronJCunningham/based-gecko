import React from "react";

const SVGUpTriangle: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 ${className || ""}`}
      fill="currentColor" // Use fill for solid color
      viewBox="0 0 24 24"
    >
      <path d="M5 15l7-7 7 7" />
    </svg>
  );
};

export default SVGUpTriangle;
