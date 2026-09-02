const CAMPAIGN_FLOOR_MAX = 100;

function campaignFloor(value) {
  return Math.max(1, Math.min(CAMPAIGN_FLOOR_MAX, Math.floor(Number(value) || 1)));
}

function cleanBosses(boss, bosses) {
  const source = Array.isArray(bosses) && bosses.length ? bosses : boss ? [boss] : [];
  const seen = new Set(), result = [];
  for (const entry of source) {
    if (!entry || typeof entry !== "object") continue;
    const id = String(entry.endgameBossId ?? entry.floorBossCatalogId ?? entry.id ?? entry.speciesId ?? "").slice(0, 100);
    if (!id || seen.has(id)) continue;
    seen.add(id); result.push({ ...entry, id });
  }
  return result;
}

export function campaignTrophyFragmentsPerLock(floor, boss = {}) {
  const id = String(boss?.endgameBossId ?? boss?.floorBossCatalogId ?? boss?.id ?? "");
  const faction = String(boss?.faction ?? "");
  if (faction === "tenGod" || id.startsWith("ten_")) return 10;
  if (faction === "abyss" || id.startsWith("abyss_")) return 5;
  const current = campaignFloor(floor);
  return current <= 30 ? 4 : current <= 60 ? 5 : 6;
}

export function campaignTrophyFragmentAwards({ floor, boss = null, bosses = [], fragmentPacks = 1 } = {}) {
  const current = campaignFloor(floor), packs = Math.max(0, Math.min(3, Math.floor(Number(fragmentPacks) || 0)));
  if (!packs) return [];
  const profiles = cleanBosses(boss, bosses);
  if (!profiles.length) profiles.push({ id: `floor-${current}`, name: "階層支配者" });
  return profiles.map(profile => ({
    id: profile.id,
    name: String(profile.name ?? profile.title ?? "階層支配者").slice(0, 100),
    amount: campaignTrophyFragmentsPerLock(current, profile) * packs,
    perLock: campaignTrophyFragmentsPerLock(current, profile),
    packs,
    boss: { ...profile },
  }));
}
