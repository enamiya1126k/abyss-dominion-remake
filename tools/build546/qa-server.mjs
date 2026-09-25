import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const baseline=process.env.BASELINE546??resolve(root,'../baseline545');
const runtime=process.env.RUNTIME546??resolve(root,'../runtime546');
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Build546 · cart visual verification</title>
<style>@font-face{font-family:'Noto Sans JP';src:url('/qa/font.ttf')}html,body{margin:0;background:#102e27;font:14px 'Noto Sans JP',sans-serif}button,input{font:inherit}</style>
<link rel="stylesheet" href="/src/Styles/build543-cart.css"><link rel="stylesheet" href="/src/Styles/build544-cart.css"><link rel="stylesheet" href="/src/Styles/build545-minigames.css">
<script type="importmap">{"imports":{"/src/sugoroku/Wallet474.js":"/qa/unused-wallet.js"}}</script>
<main id="app"></main><script type="module" src="/tools/build546/preview.mjs"></script></html>`;
// The unrelated board-game wallet is not present in the recovered cart patches.
// It is never executed by this play-screen fixture, and is never packaged as code.
const unused=`export function prepareEntry474(){throw Error('Board-game wallet is outside this visual fixture')}`;
export const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost'),p=decodeURIComponent(u.pathname);
 try{
  if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
  if(p==='/preview.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
  if(p==='/qa/unused-wallet.js'){res.setHeader('Content-Type','text/javascript');res.end(unused);return}
  const path=p==='/qa/font.ttf'?resolve(runtime,'NotoSansJP.ttf'):resolve(p.startsWith('/before/')?baseline:root,p.replace(/^\/before\//,'/').slice(1));
  if(![root,baseline,runtime].some(base=>path.startsWith(base+'/'))){res.writeHead(403);res.end();return}
  const bytes=await readFile(path);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.ttf':'font/ttf','.json':'application/json'})[extname(path)]??'application/octet-stream');res.end(bytes);
 }catch{res.writeHead(404);res.end(p)}
});
server.listen(8546,'127.0.0.1',()=>console.log('cart visual QA ready :8546'));
