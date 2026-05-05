import { ethers } from "ethers";

import { ANKR_RPC, CONTRACT_ADDRESS } from "@/constants";
import { state } from "@/store";

const fetchBrainMetadata = async (tokenId: number) => {
  const provider = new ethers.JsonRpcProvider(ANKR_RPC);
  const contractAddress = CONTRACT_ADDRESS;
  const abi = [
    "function brainMetadata(uint256) view returns (string name, string ticker, string metadataUrl, string imageUrl)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function getBrainERC20Address(uint256 tokenId) view returns (address)",
    "function tokenStakeTime(uint256 tokenId) view returns (uint256)",
    "function metadataProposals(uint256 tokenId, uint256 proposalId) view returns (string name, string ticker, string metadataUrl, string imageUrl, uint256 votesLocked, bool executed)",
    "function tokensClaimed(uint256 tokenId, address contributor) view returns (bool)",
  ];

  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    // Fetch metadata
    const metadata = await contract.brainMetadata(tokenId);
    const { name, ticker, metadataUrl, imageUrl } = metadata;

    // Fetch owner address
    const owner = await contract.ownerOf(tokenId);

    // Fetch ERC20 address to check activation
    const erc20Address = await contract.getBrainERC20Address(tokenId);
    const isActivated = erc20Address !== ethers.ZeroAddress;
    console.log("activated", isActivated);

    // Additional data fetches
    const stakeTime = await contract.tokenStakeTime(tokenId);

    let metadataProposal;
    try {
      metadataProposal = await contract.metadataProposals(tokenId, 0); // Adjust proposalId as needed
    } catch (error) {
      metadataProposal = null;
    }

    let tokensClaimed = false;
    try {
      tokensClaimed = await contract.tokensClaimed(tokenId, owner);
    } catch (error) {
      tokensClaimed = false;
    }

    // Update the Valtio state per field
    if (name) state.brainMetadata.name = name;
    if (ticker) state.brainMetadata.ticker = ticker;
    if (metadataUrl) state.brainMetadata.metaDataUrl = metadataUrl;
    if (imageUrl) state.brainMetadata.imageUrl = imageUrl;
    if (owner) state.brainMetadata.owner = owner;
    if (tokensClaimed) state.brainMetadata.tokensClaimed = tokensClaimed;
    state.brainMetadata.isActivated = isActivated;

    console.log("tokenId", {
      tokenId,
      name,
      ticker,
      metadataUrl,
      imageUrl,
      owner,
      erc20Address,
      isActivated,
      stakeTime,
      metadataProposal,
      tokensClaimed,
    });

    return {
      tokenId,
      name,
      ticker,
      metadataUrl,
      imageUrl,
      owner,
      erc20Address,
      isActivated,
      stakeTime,
      metadataProposal,
      tokensClaimed,
    };
  } catch (error) {
    console.error(`Error fetching metadata for Brain ${tokenId}:`, error);
    return null;
  }
};

export default fetchBrainMetadata;
