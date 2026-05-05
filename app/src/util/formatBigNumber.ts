export function formatBigNumber(value: number | string): string {
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(number)) return "N/A";
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const formatNumber = (value: string | number): string => {
  // Remove any commas from the string
  const cleanValue =
    typeof value === "string" ? value.replace(/,/g, "") : value;

  const num = Number(cleanValue);

  if (isNaN(num)) return "N/A";

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }

  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }

  if (num < 1_000) {
    return num.toFixed(2);
  }

  return num.toLocaleString();
};
