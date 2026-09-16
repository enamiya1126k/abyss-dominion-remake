import{SPECIES}from'../data/species.js';
import{ENDGAME_CHARACTERS,canonicalEndgameId}from'../data/endgameCharacters.js';
export function raceSpecies451(id){if(SPECIES[id])return SPECIES[id];const hero=ENDGAME_CHARACTERS[canonicalEndgameId(id)];return hero?{...hero,rarity:hero.faction==='tenGod'?'十神':'深淵'}:null}
export function ownedRaceIdentity451(monster){const special=canonicalEndgameId(monster.endgameBossId??'');return ENDGAME_CHARACTERS[special]?special:monster.speciesId}
