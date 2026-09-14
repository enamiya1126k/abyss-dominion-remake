// Store only display identifiers, never the private combat roster or statistics.
export function raidPortrait439(profile){
 const m=profile?.battleRoster?.[0]??profile;if(!m)return null;
 const id=v=>/^[A-Za-z0-9_-]{1,80}$/.test(String(v??''))?String(v):null;
 if(!id(m.speciesId))return null;
 return {speciesId:id(m.speciesId),visualSpeciesId:id(m.visualSpeciesId),endgameBossId:id(m.endgameBossId),floorBossCatalogId:id(m.floorBossCatalogId),name:String(m.monsterName??m.name??'仲間').slice(0,40)};
}
