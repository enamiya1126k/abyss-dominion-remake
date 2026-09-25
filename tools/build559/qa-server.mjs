// Local QA harness: production party/main/hide coordinators and private frames.
// The controls under /qa only exist here, never in the shipped application.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {room559} from './fixture.mjs';
import {clientURL551,presentationURL551} from './client-fixture.mjs';
const ws=await import(process.env.PLAYWRIGHT_WS_MODULE),WebSocketServer=ws.WebSocketServer??ws.default?.wsServer;
const root=resolve(fileURLToPath(new URL('../../',import.meta.url))),font=process.env.QA_FONT_PATH??resolve(root,'../runtime548/NotoSansJP.ttf'),sockets=new Map();
let room,paused=true;
const send=(id,m)=>{const s=sockets.get(id);if(s?.readyState===1)s.send(JSON.stringify(m))};
function reset(options={}){let ready=false;room=room559({...options,send:(id,m)=>{if(ready)send(id,m)}});ready=true;paused=true;room.push();return room.saved.id}
reset();const timer=setInterval(()=>{if(!paused)room.advance(50)},50);
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ABYSS · Build559</title><style>@font-face{font-family:'Noto Sans JP';src:url('/qa/font.ttf')}html,body{margin:0;background:#0b2c23;color:#fff0d2;font:14px 'Noto Sans JP',sans-serif}button,input{font:inherit}</style><link rel="stylesheet" href="/src/Styles/build536-hide.css"><link rel="stylesheet" href="/src/Styles/build541-trio.css"><link rel="stylesheet" href="/src/Styles/build559-hide.css"><script type="importmap">{"imports":{"/src/sugoroku/Wallet474.js":"/qa/unused-wallet.js"}}</script><main id="app"></main><script type="module" src="/tools/build559/preview.mjs"></script></html>`;
const server=http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p.startsWith('/qa/')&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body||'{}');let out={ok:true};
 if(p==='/qa/reset')out={id:reset(data)};
 if(p==='/qa/state')out=room.game;
 if(p==='/qa/pause')paused=!!data.value;
 if(p==='/qa/advance'){room.advance(data.ms);room.push()}
 if(p==='/qa/position'){for(const value of data.players??[]){Object.assign(room.game.players[value.seat],value);room.c.hideRuntime536?.get(room.game.id)?.inputs.delete(room.game.players[value.seat].playerId)}room.push()}
 if(p==='/qa/unlock'){for(const id of data.ids??[])Object.assign(room.game.heist541.seals[id],{done:true,progress:8000});room.push()}
 if(p==='/qa/deadline'){room.game.endAt=room.now+50;room.advance(50);room.push()}
 if(p==='/qa/messages')out=room.messages.slice(-100);
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(out));return}
 if(p==='/preview.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
 if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
 if(p==='/qa/client.js'){res.setHeader('Content-Type','text/javascript');res.end("export {RaceClient451} from '"+await clientURL551({browser:true})+"';");return}
 if(p==='/qa/presentation.js'){res.setHeader('Content-Type','text/javascript');res.end("export {raceDomSignature452} from '"+await presentationURL551({browser:true})+"';");return}
 if(p==='/qa/unused-wallet.js'){res.setHeader('Content-Type','text/javascript');res.end("export function prepareEntry474(){throw Error('Unrelated wallet outside fixture')}");return}
 const path=p==='/qa/font.ttf'?font:resolve(root,p.slice(1));if(path!==font&&!path.startsWith(root+'/')){res.writeHead(403);res.end();return}const bytes=await readFile(path);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf'})[extname(path)]??'application/octet-stream');res.end(bytes);
 }catch(e){res.writeHead(404);res.end(String(e))}});
const wss=new WebSocketServer({server});wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://localhost').searchParams.get('self')??'p0';sockets.set(id,socket);const session=room.sessions.get(id);if(!session){socket.close();return}session.connected=true;room.c.push(session);socket.on('message',b=>{try{room.c.handle(room.sessions.get(id),JSON.parse(b))}catch(e){send(id,{type:'raceError451',message:e.message})}});socket.on('close',()=>{if(sockets.get(id)===socket){sockets.delete(id);room.sessions.get(id).connected=false}})});
server.listen(8559,'127.0.0.1',()=>console.log('hide559 QA ready'));process.on('SIGTERM',()=>{clearInterval(timer);wss.close();server.close();process.exit()});
