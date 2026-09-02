export const ONLINE_CAMPAIGN_FLOOR_MIN = 1;
export const ONLINE_CAMPAIGN_FLOOR_MAX = 100;

export function campaignFloorToLegacyDepth(floor) {
  const campaignFloor = Math.max(ONLINE_CAMPAIGN_FLOOR_MIN, Math.min(ONLINE_CAMPAIGN_FLOOR_MAX, Math.floor(Number(floor) || 1)));
  return campaignFloor * 10;
}
