export function convertBigIntToString<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    if (typeof obj === "bigint") {
      return obj.toString() as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertBigIntToString(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = convertBigIntToString(value);
  }

  return result as T;
}
