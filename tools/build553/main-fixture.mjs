import {readFile} from 'node:fs/promises';
import {partyURL550} from './party-fixture.mjs';
export async function mainFixture550(){const url=new URL('../../online-server/src/RaceCoordinator451.js',import.meta.url),source=await readFile(url,'utf8'),party=await partyURL550();const transformed=source.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g,(_,names,path)=>{
 if(path.startsWith('node:'))return `import {${names}} from '${path}';`;
 if(path.endsWith('PartyCoordinator462.js'))return `import {${names}} from '${party}';`;
 if(['RicochetCoordinator550.js','CartCoordinator543.js','AtomicSnapshot540.js'].some(x=>path.endsWith(x)))return `import {${names}} from '${new URL(path,url).href}';`;
 return names.split(',').map(x=>{const local=x.trim().split(/\s+as\s+/).at(-1);const value=local==='raceSpecies451'?'id=>({id,name:id})':local==='canonicalRaceIdentity455'?'id=>id':local==='crystalBalance474'?'n=>Number.isFinite(n)?n:null':local==='bond459'?'()=>0':local==='racePool455'?'[]':/^handle/.test(local)?'()=>false':/For\d+$/.test(local)?'()=>null':local==='RACE451'?'{}':'()=>{}';return `const ${local}=${value};`}).join('\n');});return import('data:text/javascript;base64,'+Buffer.from(transformed).toString('base64'))}
