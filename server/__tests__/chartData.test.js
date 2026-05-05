const { getChartData } = require("../chartData");

describe("chartData", () => {
  it("exports getChartData as a function", () => {
    expect(typeof getChartData).toBe("function");
  });

  it("handles invalid pair address gracefully", async () => {
    // getChartData should not throw when given a zero address
    // (it will fail to connect but should handle the error)
    const result = await getChartData("0x0000000000000000000000000000000000000000");
    // Returns undefined or error object on failure (no live RPC)
    expect(result === undefined || result === null || typeof result === "object").toBe(true);
  }, 15000);
});
