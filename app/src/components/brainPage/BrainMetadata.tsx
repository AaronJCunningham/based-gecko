// components/BrainMetadata.tsx
import React, { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";

interface BrainMetadataProps {
  brainDetails: any; // Replace with proper type from your store
  metadata: any; // Replace with proper type from your store
  brainid: string;
}

const BrainMetadata: React.FC<BrainMetadataProps> = ({
  brainDetails,
  metadata,
  brainid,
}) => {
  const [isValidImage, setIsValidImage] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (brainDetails?.brainAddress) {
      navigator.clipboard.writeText(brainDetails.brainAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (metadata.imageUrl) {
      const img = new Image();
      img.src = metadata.imageUrl;
      img.onload = () => setIsValidImage(true);
      img.onerror = () => setIsValidImage(false);
    }
  }, [metadata.imageUrl]);

  if (brainid === "BASEDAI") {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">BASEDAI</h2>
        <div className="text-sm text-gray-500">
          <a
            href="https://getbased.ai"
            className="text-cyan-500 hover:text-white"
          >
            BasedAI
          </a>{" "}
          (BASEDAI) stands out as a decentralized AI platform that leverages
          blockchain technology to revolutionize the way AI models are owned and
          participated in. Central to its ecosystem are Brain Credits, digital
          tokens that facilitate ownership and engagement within the platform.
          This innovative approach allows users to have a stake in AI models,
          promoting a more inclusive and decentralized AI development process.
        </div>
      </div>
    );
  }

  if (brainid === "PEPECOIN") {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">PepeCoin</h2>
        <div className="text-sm text-gray-500">
          PepeCoin, created by pioneers and visionaries in 2016, introduces an
          entertaining OS-style app ecosystem that seamlessly integrates DeFi,
          games, unique NFT experiences, and cutting-edge memetics.
        </div>
      </div>
    );
  }

  if (brainid === "BCRED") {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">BCRED</h2>
        <div className="text-sm text-gray-500">
          Brain Credit's (BCRED) allow users to participate in fractionalized
          brain ownership.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Brain Details</h2>
      {brainDetails ? (
        <div
          className="font-light grid gap-x-3 gap-y-2"
          style={{ gridTemplateColumns: "max-content 1fr" }}
        >
          <div className="text-sm text-cyan-400">Brain ID:</div>
          <div className="text-sm text-white">{brainDetails.brainNumber}</div>

          <div className="text-sm text-cyan-400">Address:</div>
          <div className="flex items-center overflow-hidden">
            <span className="truncate text-sm text-white flex-grow overflow-hidden">
              <a
                href={`https://etherscan.io/address/${brainDetails.brainAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white break-words  hover:text-cyan-300"
              >
                {brainDetails.brainAddress}
              </a>
            </span>
            <button
              onClick={handleCopy}
              className="ml-2 text-sm text-cyan-400 hover:text-cyan-300 flex-shrink-0"
              title="Copy address to clipboard"
            >
              <FiCopy className="h-4 w-4" />
            </button>
            {copied && (
              <span className="ml-2 text-xs text-cyan-400">Copied!</span>
            )}
          </div>

          <div className="text-sm text-cyan-400">Name:</div>
          <div className="overflow-hidden break-words">
            {metadata.name ? (
              <span className="text-sm text-white break-words">
                {metadata.name}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Not Set</span>
            )}
          </div>

          <div className="text-sm text-cyan-400">Ticker:</div>
          <div className="overflow-hidden break-words">
            {metadata.ticker ? (
              <span className="text-sm text-white break-words">
                {metadata.ticker}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Not Set</span>
            )}
          </div>

          <div className="text-sm text-cyan-400">Metadata:</div>
          <div className="overflow-hidden break-words">
            {metadata.metaDataUrl ? (
              <a
                href={metadata.metaDataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white break-words"
              >
                {metadata.metaDataUrl}
              </a>
            ) : (
              <span className="text-sm text-gray-500">Not Set</span>
            )}
          </div>

          {isValidImage && (
            <div className="w-full max-w-full overflow-hidden rounded-md pt-4">
              <img
                src={metadata.imageUrl}
                alt="Brain Image"
                className="w-full h-auto object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No details available for this Brain ID.
        </p>
      )}
    </div>
  );
};

export default BrainMetadata;
