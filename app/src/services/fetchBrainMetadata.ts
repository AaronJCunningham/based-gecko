import { state } from "@/store";

const fetchBrainMetadata = async (tokenId: number) => {
  try {
    // In production this would query the BasedAI smart contract via ethers.js
    // for on-chain metadata (name, ticker, owner, activation status)
    const response = await fetch("/mock/metadata.json");
    if (!response.ok) return null;

    const allMetadata = await response.json();
    const metadata = allMetadata[tokenId.toString()];
    if (!metadata) return null;

    state.brainMetadata.name = metadata.name;
    state.brainMetadata.ticker = metadata.ticker;
    state.brainMetadata.metaDataUrl = metadata.metaDataUrl;
    state.brainMetadata.imageUrl = metadata.imageUrl;
    state.brainMetadata.owner = metadata.owner;
    state.brainMetadata.isActivated = metadata.isActivated;
    state.brainMetadata.tokensClaimed = metadata.tokensClaimed;

    return { tokenId, ...metadata };
  } catch (error) {
    console.error(`Error fetching metadata for Node ${tokenId}:`, error);
    return null;
  }
};

export default fetchBrainMetadata;
