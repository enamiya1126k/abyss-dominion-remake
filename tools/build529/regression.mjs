// Run prior invariants with only the intentionally changed wire/cooldown constants
// adapted. Missing base-game catalogs are supplied by catalog-fixture.mjs.
import {readFile,writeFile,unlink}from'node:fs/promises';import{spawnSync}from'node:child_process';
const generated=[];let failed=false;
try{for(const name of ['build520-tower','build521-tower']){const src=new URL('../../tests/'+name+'.test.mjs',import.meta.url),dst=new URL('../../tests/'+name+'.qa529.test.mjs',import.meta.url);let s=await readFile(src,'utf8');s=s.replaceAll('towerVersion517:4','towerVersion517:5').replaceAll('g.rules517,4','g.rules517,5').replaceAll('publicTower517(g).rules517,4','publicTower517(g).rules517,5');if(name==='build520-tower')s=s.replaceAll('15000','10000').replaceAll('14999','9999').replaceAll('30000','20000').replaceAll('15 seconds','10 seconds');await writeFile(dst,s);generated.push(dst)}
 const files=['build529-tower','build529-race','build519-ai','build518-tower','build528-party','build456-race-action','build457-race-cockpit','build458-race-ux','build460-race-camera','build461-race-follow','build462-party-race'].map(n=>new URL('../../tests/'+n+'.test.mjs',import.meta.url).pathname);
 const result=spawnSync(process.execPath,['--import',new URL('./catalog-fixture.mjs',import.meta.url).pathname,'--test','--test-name-pattern=^(?!native canvas)',...files,...generated.map(f=>f.pathname)],{stdio:'inherit',timeout:60000});failed=result.status!==0;
}finally{for(const f of generated)await unlink(f)}process.exitCode=failed?1:0;
