import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve(new URL('../../',import.meta.url).pathname);
const css=['build539-tetra'];
export const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>@font-face{font-family:QA;src:url('/qa-font.ttf')}body{margin:0;font-family:QA,sans-serif}.sg-monster{display:inline-block;width:40px;height:40px;background:url('/assets/bomb542/players.webp') 0 0/200% 200%}</style>${css.map(s=>'<link rel="stylesheet" href="/src/Styles/'+s+'.css">').join('')}<main id="root"></main><script type="module">
import * as T from '/src/tetra/Rules539.js';import * as V from '/src/tetra/View539.js';import {route} from '/tools/build570/scenario.mjs';
const scenario=route(T);window.rawGame=scenario.g;window.c={root:document.querySelector('#root'),state:{tetra:null},transport:{selfId:'p0'},offset:rawGame.serverAt-Date.now(),ready:()=>true,connected:()=>true,raw:()=>true,sgMonster463:()=>'<i class="sg-monster"></i>'};
window.show=phase=>{V.tetraBefore539(c);rawGame.phase=phase;c.state.tetra=T.publicTetra539(rawGame,'p0');c.root.innerHTML=V.tetraView539(c);V.tetraAfter539(c);};
show('play');window.ready=true;
</script></html>`;
export function createServer(){return http.createServer(async(req,res)=>{
  try{
    const p=new URL(req.url,'http://local').pathname;
    if(p==='/'){res.setHeader('Content-Type','text/html');return res.end(html);}
    if(p==='/favicon.ico'){res.writeHead(204);return res.end();}
    // Only the outside party lobby is isolated; game UI, art, input and physics are production code.
    if(p==='/src/party/PartyView462.js'){res.setHeader('Content-Type','text/javascript');return res.end('export const partySeats462=()=>"";');}
    const file=p==='/qa-font.ttf'?process.env.QA_FONT:resolve(root,p.slice(1));
    if(p!=='/qa-font.ttf'&&!file.startsWith(root+'/'))throw Error('bad path');
    const bytes=await readFile(file);res.setHeader('Content-Type',{'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.svg':'image/svg+xml'}[extname(file)]??'application/octet-stream');res.end(bytes);
  }catch(e){res.writeHead(404);res.end(String(e));}
});}
if(process.argv.includes('--serve'))createServer().listen(8570,'127.0.0.1',()=>console.log('http://127.0.0.1:8570'));
