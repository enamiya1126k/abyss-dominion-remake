// Freeze the existing combat dependency graph so an issued ticket can always
// be replayed with the same rules, even after future game updates.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const root=process.cwd(),destination='src/worldRaid/runtime443',seen=new Map();
function visit(name){
 if(seen.has(name))return;let source=fs.readFileSync(name,'utf8');const original=source;
 if(name==='online-server/src/WorldRaidStore428.js')source="import {WORLD_RAID_HP440} from '../../src/worldRaid/WorldRaidBalance440.js';\nimport {WEEKLY_RAID_BOSSES} from './WeeklyRaidCatalog.js';\n"+source.slice(source.indexOf('export const WORLD_RAID_RULES428'),source.indexOf('export function createWorldRaidState428'));
 if(name==='online-server/src/RaidCoordinator.js')source=source.replace('import{randomBytes}from"node:crypto";','let tokenSerial430=0;const randomBytes=()=>({toString:()=>`offline-${++tokenSerial430}`});');
 if(/from\s*['"]node:/.test(source))throw new Error('Non-portable dependency: '+name);
 const dependencies=[...source.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)].map(m=>path.posix.normalize(path.posix.join(path.posix.dirname(name),m[1].split('?')[0])));
 seen.set(name,{sha256:createHash('sha256').update(original).digest('hex'),dependencies});
 const out=path.join(destination,name);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,source);
 dependencies.forEach(visit);
}
visit('online-server/src/WorldRaidBattle428.js');
for(const name of ['WorldRaidRules432','WorldRaidLimit437','WorldRaidSpeed438'])visit('src/worldRaid/'+name+'.js');
fs.writeFileSync('tools/build443/runtime-sources.json',JSON.stringify(Object.fromEntries(seen),null,2)+'\n');
console.log('Frozen native combat modules:',seen.size);
