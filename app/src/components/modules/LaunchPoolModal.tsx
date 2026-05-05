import { useState } from "react";
import { FiCopy } from "react-icons/fi";

// components/LaunchPoolModal.tsx
interface LaunchPoolModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  address: string;
  modalMessage: string;
}

const LaunchPoolModal: React.FC<LaunchPoolModalProps> = ({
  showModal,
  setShowModal,
  address,
  modalMessage,
}) => {
  const [copied, setCopied] = useState(false);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#030712] border border-[rgba(0,255,255,0.2)] p-4 rounded shadow-lg max-w-md">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-cyan-500 text-sm">{modalMessage}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-300 text-sm">1. Copy token address:</p>
            <div className="flex items-center">
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-cyan-500 truncate"
              >
                {address.slice(0, 15)}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="ml-2 text-sm text-cyan-400 hover:text-cyan-300"
              >
                <FiCopy className="h-4 w-4" />
              </button>
              {copied && (
                <span className="ml-2 text-xs text-cyan-400">Copied!</span>
              )}
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            2. Head to Uniswap and paste it as the pair next to ETH.
          </p>
          <p className="text-gray-300 text-sm">
            3. Continue with the rest of the instructions from Uniswap.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-3 py-1 text-gray-400 text-xs hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                window.open(
                  "https://app.uniswap.org/positions/create/v4",
                  "_blank"
                );
                setShowModal(false);
              }}
              className="bg-[#00FFFF] text-black px-3 py-1 rounded text-xs"
            >
              Go to Uniswap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchPoolModal;
