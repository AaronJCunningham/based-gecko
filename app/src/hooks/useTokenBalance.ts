import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { state } from "@/store";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

interface TokenInfo {
  address: string;
  balance: string;
  symbol: string;
}

export function useTokenBalances(walletAddress: string | undefined) {
  const [tokenBalances, setTokenBalances] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState<string>("0");
  const [tokenFlags, setTokenFlags] = useState<string>("000");

  const TOKEN_ADDRESSES = [
    "0x44971ABF0251958492FeE97dA3e5C5adA88B9185",
    "0xA9E8aCf069C58aEc8825542845Fd754e41a9489A",
    "0x7f89f674b7d264944027e78e5f58eb2bbbb7cfa3",
  ];

  useEffect(() => {
    const fetchBalances = async () => {
      if (!walletAddress || !window.ethereum) return;

      setIsLoading(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        const balances: TokenInfo[] = [];
        let total = 0;

        for (const tokenAddress of TOKEN_ADDRESSES) {
          const contract = new Contract(tokenAddress, ERC20_ABI, provider);
          const [balance, decimals, symbol] = await Promise.all([
            contract.balanceOf(walletAddress),
            contract.decimals(),
            contract.symbol(),
          ]);

          const formattedBalance = parseFloat(formatUnits(balance, decimals));
          total += formattedBalance;

          balances.push({
            address: tokenAddress,
            balance: formattedBalance.toLocaleString(undefined, {
              maximumFractionDigits: 4,
            }),
            symbol,
          });
        }

        setTokenBalances(balances);
        setTotalBalance(total.toFixed(4));

        const flags = balances
          .map((token) => (parseFloat(token.balance) > 0 ? "1" : "0"))
          .join("");
        setTokenFlags(flags);

        const holdsAllTokens = balances.every(
          (token) => parseFloat(token.balance) > 0
        );
        state.whale = holdsAllTokens;
        console.log("Updated Whale Status:", holdsAllTokens);
      } catch (error) {
        console.error("Error fetching token balances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [walletAddress]);

  return { tokenBalances, totalBalance, isLoading, tokenFlags };
}
