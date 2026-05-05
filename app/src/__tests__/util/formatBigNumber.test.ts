import { describe, it, expect } from "vitest";
import { formatBigNumber, formatNumber } from "@/util/formatBigNumber";

describe("formatBigNumber", () => {
  it("formats a number with two decimal places", () => {
    expect(formatBigNumber(1234.5)).toBe("1,234.50");
  });

  it("formats a string number", () => {
    expect(formatBigNumber("5678.123")).toBe("5,678.12");
  });

  it("returns N/A for NaN input", () => {
    expect(formatBigNumber("abc")).toBe("N/A");
    expect(formatBigNumber(NaN)).toBe("N/A");
  });

  it("formats zero correctly", () => {
    expect(formatBigNumber(0)).toBe("0.00");
  });
});

describe("formatNumber", () => {
  it("formats millions with M suffix", () => {
    expect(formatNumber(1500000)).toBe("1.50M");
    expect(formatNumber("2,000,000")).toBe("2.00M");
  });

  it("formats thousands with K suffix", () => {
    expect(formatNumber(1500)).toBe("1.50K");
    expect(formatNumber("50,000")).toBe("50.00K");
  });

  it("formats numbers below 1000 with two decimals", () => {
    expect(formatNumber(42)).toBe("42.00");
    expect(formatNumber(999.99)).toBe("999.99");
    expect(formatNumber(500)).toBe("500.00");
  });

  it("returns N/A for invalid input", () => {
    expect(formatNumber("invalid")).toBe("N/A");
  });
});
