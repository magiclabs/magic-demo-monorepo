// Helper function to convert BigInt values to strings for JSON serialization
export const formatPayload = (
  payload: string | object | []
): string | object | [] => {
  if (typeof payload === "bigint") {
    return String(payload + "n");
  }
  if (Array.isArray(payload)) {
    return payload.map(formatPayload);
  }
  if (payload !== null && typeof payload === "object") {
    const result: Record<string, string | object | []> = {};
    for (const key of Object.keys(payload)) {
      result[key] = formatPayload(payload[key as keyof typeof payload]);
    }
    return result;
  }
  return payload;
};
