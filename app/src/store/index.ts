import { proxy } from "valtio";

export type PriceHistoryEntry = {
  timestamp: string;
  priceInEth: number;
};

export interface BrainStats {
  priceETH: number;
  marketCapETH: number;
  liquidityETH?: number;
  volumeETH?: number;
  txs?: number;
  recentTransactions?: Array<{
    type: string;
    priceETH?: string;
    volumeETH?: number;
    price?: string;
    volume?: string;
    trader: string;
  }>;
}

export interface BrainEvent {
  brainNumber: string;
  brainAddress: string;
  hasLiquidity: boolean;
  pairAddress: string | null;
  chartData?: {
    pairAddress?: string;
    priceHistory?: Array<{ timestamp: string; priceInEth: number }>;
  };
  stats: { stats?: BrainStats };
}

export interface TokenData {
  date: string;
  priceUSD: string;
  nftId: string;
  price?: number;
  priceETH: number;
  priceChange1Hour?: number;
  priceChange24Hour?: number;
  priceChange7Day?: number;
  mcap?: string;
  volume?: number;
  twentyFourHourVolume?: number;
  tokenSevenDayData?: {
    tokenDayData: Array<{ date: string; priceUSD: string }>;
  };
  address?: string;
  buyUrl?: string;
  hasLiquidity?: boolean;
  chartData?: {
    pairAddress?: string;
    priceHistory?: Array<{ timestamp: string; priceInEth: number }>;
  };
}

export interface PriceData {
  time: number;
  marketCap: number;
  price: number;
}

export interface BrainMetadata {
  avatar: string;
  owner: string;
  name: string;
  ticker: string;
  metaDataUrl: string;
  imageUrl: string;
  isActivated: boolean;
  tokensClaimed: boolean;
}

export interface State {
  activatedBrains: BrainEvent[];
  basedaiData: PriceData | null;
  pepecoinData: PriceData | null;
  ethereumData: PriceData | null;
  brainMetadata: BrainMetadata;
  position: { x: number };
  isCollapsed: boolean;
  whale: boolean;
  username: string;
  walletAddress: string;
}

export const state = proxy<State>({
  activatedBrains: [],
  basedaiData: null,
  pepecoinData: null,
  ethereumData: null,
  brainMetadata: {
    avatar: "",
    owner: "",
    name: "",
    ticker: "",
    metaDataUrl: "",
    imageUrl: "",
    isActivated: false,
    tokensClaimed: false,
  },
  position: { x: 0 },
  isCollapsed: true,
  whale: false,
  username:
    typeof window !== "undefined" ? localStorage.getItem("username") || "" : "",
  walletAddress:
    typeof window !== "undefined"
      ? localStorage.getItem("wallet_address") || ""
      : "",
});
