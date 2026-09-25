// Exercise the production party router. Other games and wallet rewards are
// outside this fixture; their adapters throw if accidentally reached.
import {readFile} from 'node:fs/promises';
export async function partyURL550(){const url=new URL('../../online-server/src/PartyCoordinator462.js',import.meta.url),source=await readFile(url,'utf8'),allowed=['HideCoordinator536.js','RicochetCoordinator550.js','CartCoordinator543.js','PartyColors499.js','PartyGames462.js'];const transformed=source.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g,(_,names,path)=>{
 if(path==='node:crypto')return `import {${names}} from 'node:crypto';`;
 if(allowed.some(x=>path.endsWith(x)))return `import {${names}} from '${new URL(path,url).href}';`;
 return names.split(',').map(x=>{const local=x.trim().split(/\s+as\s+/).at(-1);return `const ${local}=${local==='crystalBalance474'?'n=>n??0':local==='minimumFee474'?'()=>0':['cancelEntries474','refundEntry474'].includes(local)?'()=>{}':`()=>{throw Error('Unrelated adapter: ${local}')}`};`}).join('\n');
 });return 'data:text/javascript;base64,'+Buffer.from(transformed).toString('base64')}

export async function partyFixture550(){return import(await partyURL550())}
