// Historical patch archives omit these base-game modules. Only missing modules
// receive minimal local test fixtures; never included as production replacements.
import {registerHooks} from 'node:module';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export const speciesSource=`export const SPECIES=Object.fromEntries(['slime','goblin','wolf','skeleton','ember_gecko','glacier_queen','myth_rion','myth_yori','myth_hide','myth_enami','ten_time',...Array.from({length:80},(_,i)=>'qa_species_'+i)].map((id,i)=>[id,{id,name:id,race:'獣',rarity:'N'}]));`;
export const heroSource='export const ENDGAME_CHARACTERS={};export const canonicalEndgameId=id=>id;';
export const visualSource=`export function monsterVisual(m,icon,opts={}){const color=({slime:'#5bbde8',wolf:'#bfcddd',goblin:'#99bd4c',skeleton:'#f6e5bf'})[m.speciesId]??'#bf88df';return '<svg class="'+(opts.className??'')+' qa-portrait" viewBox="0 0 64 64" aria-label="QA portrait placeholder"><path d="M10 45 Q10 15 20 20 L20 8 L30 18 L43 9 L43 20 Q57 20 56 43 Q58 57 34 57 Q9 57 10 45Z" fill="'+color+'" stroke="#152c32" stroke-width="2"/><ellipse cx="25" cy="36" rx="4" ry="6" fill="#193343"/><ellipse cx="42" cy="36" rx="4" ry="6" fill="#193343"/><path d="M25 47 Q33 54 41 46" fill="none" stroke="#193343" stroke-width="2"/></svg>'}export function setMonsterVisualFrame(){}`;
export const monsterSource='export const expNeedFor=()=>100,totalExperience=()=>0,applyTotalExperience=()=>{};';
const fixtures={'/src/data/species.js':speciesSource,'/src/data/endgameCharacters.js':heroSource,'/src/ui/MonsterVisual.js':visualSource,'/src/models/Monster.js':monsterSource};
registerHooks({resolve(specifier,context,next){const url=new URL(specifier,context.parentURL??import.meta.url);if(url.protocol==='file:'&&!existsSync(fileURLToPath(url))){const key=Object.keys(fixtures).find(k=>url.pathname.endsWith(k));if(key)return{url:'data:text/javascript,'+encodeURIComponent(fixtures[key]),shortCircuit:true}}return next(specifier,context)}});
