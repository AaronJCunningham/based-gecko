import { describe, it, expect, beforeEach } from "vitest";
import { state, BrainEvent } from "@/store";

describe("Valtio Store", () => {
  beforeEach(() => {
    state.activatedBrains = [];
    state.ethereumData = null;
    state.basedaiData = null;
    state.pepecoinData = null;
  });

  it("initializes with empty activated brains", () => {
    expect(state.activatedBrains).toEqual([]);
  });

  it("initializes with null price data", () => {
    expect(state.ethereumData).toBeNull();
    expect(state.basedaiData).toBeNull();
    expect(state.pepecoinData).toBeNull();
  });

  it("allows setting activated brains", () => {
    const mockBrain: BrainEvent = {
      brainNumber: "1",
      brainAddress: "0x123",
      hasLiquidity: true,
      pairAddress: "0xabc",
      stats: { stats: { priceETH: 0.001, marketCapETH: 100, recentTransactions: [] } },
    };

    state.activatedBrains = [mockBrain];
    expect(state.activatedBrains).toHaveLength(1);
    expect(state.activatedBrains[0].brainNumber).toBe("1");
    expect(state.activatedBrains[0].stats.stats?.priceETH).toBe(0.001);
  });

  it("allows setting ethereum price data", () => {
    state.ethereumData = { time: Date.now(), marketCap: 1000000, price: 2500 };
    expect(state.ethereumData.price).toBe(2500);
  });

  it("initializes brain metadata with defaults", () => {
    expect(state.brainMetadata.avatar).toBe("");
    expect(state.brainMetadata.isActivated).toBe(false);
  });
});
