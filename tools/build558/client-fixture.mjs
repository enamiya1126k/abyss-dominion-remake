// Real client receive/renderConnection and DOM signature. Unrelated game modules
// are absent from this partial checkout; only those dependencies are stubbed.
import {readFile} from 'node:fs/promises';
const data=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
export async function presentationURL551({browser=false}={}){const url=new URL('../../src/race/RacePresentation452.js',import.meta.url),source=await readFile(url,'utf8');return data(source.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g,(_,names,path)=>(path.endsWith('ricochet550/Rules550.js')||path.endsWith('cart/Rules543.js'))?`import {${names}} from '${browser?new URL(path,'http://127.0.0.1:8558/src/race/RacePresentation452.js').href:new URL(path,url).href}';`:names.split(',').map(x=>`const ${x.trim().split(/\s+as\s+/).at(-1)}=()=>null;`).join('\n')))}
export async function clientURL551({browser=false}={}){const url=new URL('../../src/race/RaceClient451.js',import.meta.url),source=await readFile(url,'utf8'),presentation=await presentationURL551({browser});return data(source.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g,(_,names,path)=>{
 if(path.endsWith('RacePresentation452.js'))return `import {${names}} from '${presentation}';`;
 if(path.endsWith('cart/View543.js')&&browser)return `import {${names}} from 'http://127.0.0.1:8558/src/cart/View543.js';`;
 if(path.endsWith('ricochet550/View550.js')&&browser)return `import {${names}} from 'http://127.0.0.1:8558/src/ricochet550/View550.js';`;
 return names.split(',').map(x=>`const ${x.trim().split(/\s+as\s+/).at(-1)}=()=>null;`).join('\n');}))}
