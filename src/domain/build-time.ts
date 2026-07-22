export function getBuildTimestamp(): string {
  const configuredDate = process.env.SOURCE_DATE_EPOCH;
  if (!configuredDate) return new Date().toISOString();

  const epochMilliseconds = Number(configuredDate) * 1000;
  if (!Number.isFinite(epochMilliseconds)) {
    throw new Error("SOURCE_DATE_EPOCH must be a Unix timestamp");
  }

  return new Date(epochMilliseconds).toISOString();
}
