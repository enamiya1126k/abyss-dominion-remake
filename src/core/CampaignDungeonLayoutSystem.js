import { roomAttributesForFloor, roomCountForRandom } from "./Campaign100System.js";
import { requiredCampaignBossSectionCount } from "./CampaignBossWorldSystem.js";
import { generateSectionDungeon } from "./DungeonSectionSystem.js";

/**
 * Canonical campaign floor layout used by both local and online exploration.
 *
 * The random calls in this function are deliberately shared. Given the same
 * floor seed, boss list and shape history, both modes receive the exact same
 * section count, attributes, topology, room silhouettes and portals.
 */
export function createCampaignDungeonLayout({
  floor = 1,
  bossIds = [],
  random = Math.random,
  recentSignatures = [],
} = {}) {
  const value = Math.max(1, Math.floor(Number(floor) || 1));
  const requested = roomCountForRandom(random);
  const roomCount = requiredCampaignBossSectionCount(value, bossIds, requested);
  const attributes = roomAttributesForFloor(value, roomCount, random);
  const layout = generateSectionDungeon({ count: roomCount, attributes, random, recentSignatures });
  return {
    ...layout,
    layoutVersion: 318,
    roomAttributes: layout.sections.map(section => ({ id: section.id, attribute: section.attribute })),
  };
}
