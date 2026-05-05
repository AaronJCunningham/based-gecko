import React from "react";

const MinimalFooter: React.FC = () => {
  return (
    <footer className="bg-[#030712] text-gray-300 py-2 pb-6 mb-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          Brought to you by{" "}
          <a
            href="https://getbased.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            BASEDAI
          </a>{" "}
          and{" "}
          <a
            href="https://www.pepecoin.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-gray-200 transition-colors"
          >
            PEPECOIN
          </a>
        </p>
      </div>
    </footer>
  );
};

export default MinimalFooter;
