import http from"node:http";
import process from"node:process";
import{WebSocketServer,WebSocket}from"ws";
import{RoomStore}from"./src/RoomStore.js";

const HOST=process.env.HOST||"127.0.0.1",PORT=Math.max(1,Math.min(65535,Number(process.env.PORT)||8787)),store=new RoomStore(),clients=new Set();
const DEFAULT_ORIGINS=[/^https:\/\/[a-z0-9-]+\.github\.io$/i,/^https?:\/\/localhost(?::\d+)?$/i,/^https?:\/\/127\.0\.0\.1(?::\d+)?$/i];
function originAllowed(origin){const configured=String(process.env.ALLOWED_ORIGINS??"").trim();if(configured==="*")return true;if(configured){return configured.split(",").map(value=>value.trim()).filter(Boolean).some(value=>origin===value)}return !origin||origin==="null"||DEFAULT_ORIGINS.some(pattern=>pattern.test(origin))}
function reply(socket,message){if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify(message))}
function fail(socket,result){reply(socket,{type:"error",code:result.code??"REQUEST_FAILED",message:result.message??"処理に失敗しました"})}

const server=http.createServer((request,response)=>{
 if(request.url==="/health"){response.writeHead(200,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});response.end(JSON.stringify({ok:true,service:"ABYSS DOMINION CO-OP SERVER",protocol:"1.4.0",rooms:store.rooms.size,expeditions:[...store.rooms.values()].filter(room=>room.phase==="expedition").length,battles:[...store.rooms.values()].filter(room=>room.expedition?.battle).length,raids:[...store.rooms.values()].filter(room=>room.phase==="raid").length,trades:store.trade.trades.size,players:[...store.sessions.values()].filter(session=>session.connected).length,time:new Date().toISOString()}));return}
 response.writeHead(200,{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"});response.end("ABYSS DOMINION CO-OP SERVER\nWebSocket endpoint: /party\nHealth check: /health\n");
});
const wss=new WebSocketServer({noServer:true,maxPayload:16*1024,perMessageDeflate:false});
server.on("upgrade",(request,socket,head)=>{
 let pathname;try{pathname=new URL(request.url,"http://localhost").pathname}catch{socket.destroy();return}if(pathname!=="/party"||!originAllowed(request.headers.origin)){socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");socket.destroy();return}wss.handleUpgrade(request,socket,head,websocket=>wss.emit("connection",websocket,request));
});
wss.on("connection",socket=>{
 clients.add(socket);socket.isAlive=true;socket.rate={started:Date.now(),count:0};socket.on("pong",()=>socket.isAlive=true);
 socket.on("message",raw=>{
  const now=Date.now();if(now-socket.rate.started>=1000)socket.rate={started:now,count:0};if(++socket.rate.count>40){socket.close(1008,"rate limit");return}
  let message;try{message=JSON.parse(raw.toString())}catch{return fail(socket,{code:"BAD_JSON",message:"通信データを読み取れません"})}if(!message||typeof message.type!=="string")return;
 if(message.type==="hello"){const result=store.hello(socket,message);if(!result.ok)return fail(socket,result);reply(socket,{type:"helloAck",playerId:result.playerId,resumeToken:result.resumeToken,resumed:result.resumed,room:result.room});store.deliverPendingRewards(socket.session);return}
  const session=socket.session;if(!session)return fail(socket,{code:"NOT_READY",message:"先に接続処理を完了してください"});let result={ok:false,code:"UNKNOWN_MESSAGE",message:"未対応の通信です"};
  if(message.type==="createRoom")result=store.createRoom(session);
  else if(message.type==="joinRoom")result=store.joinRoom(session,message.roomId);
  else if(message.type==="leaveRoom")result=store.leaveRoom(session);
  else if(message.type==="move")result=store.move(session,message.position);
  else if(message.type==="profile")result=store.updateProfile(session,message.profile);
  else if(message.type==="social")result=store.social(session,message);
  else if(message.type==="setReady")result=store.setReady(session,message.ready);
  else if(message.type==="setFloor")result=store.setFloor(session,message.floor);
  else if(message.type==="startExpedition")result=store.startExpedition(session);
  else if(message.type==="expeditionMove")result=store.moveExpedition(session,message.position);
  else if(message.type==="battleAction")result=store.submitBattleAction(session,message.action??message);
  else if(message.type==="battleSpeed")result=store.setBattleSpeed(session,message.speed);
  else if(message.type==="requestReturn")result=store.requestReturn(session);
  else if(message.type==="completeExpedition")result=store.completeExpedition(session);
  else if(message.type==="startRaid")result=store.startRaid(session);
  else if(message.type==="raidAction")result=store.submitRaidAction(session,message.action??message);
  else if(message.type==="raidSpeed")result=store.setRaidSpeed(session,message.speed);
  else if(message.type==="tradeRequest")result=store.requestTrade(session,message.targetId);
  else if(message.type==="tradeRespond")result=store.respondTrade(session,message.tradeId,message.accepted);
  else if(message.type==="tradeOffer")result=store.offerTrade(session,message.tradeId,message.asset);
  else if(message.type==="tradeReady")result=store.readyTrade(session,message.tradeId,message.ready);
  else if(message.type==="tradeConfirm")result=store.confirmTrade(session,message.tradeId);
  else if(message.type==="tradeCancel")result=store.cancelTrade(session,message.tradeId);
  else if(message.type==="tradeAck")result=store.ackTrade(session,message.tradeId,message.success!==false);
  else if(message.type==="rewardAck")result=store.ackReward(session,message.rewardId);
  else if(message.type==="ping"){reply(socket,{type:"pong",at:now});return}
  if(!result.ok)fail(socket,result);
 });
 socket.on("close",()=>{clients.delete(socket);store.disconnect(socket.session)});socket.on("error",()=>{});
});
const battleClock=setInterval(()=>store.advanceBattles(),250);battleClock.unref?.();
const heartbeat=setInterval(()=>{store.pruneExpired();for(const socket of clients){if(socket.isAlive===false){socket.terminate();continue}socket.isAlive=false;socket.ping()}},10_000);heartbeat.unref?.();
server.listen(PORT,HOST,()=>{console.log(`\nABYSS DOMINION CO-OP SERVER`);console.log(`Local: http://${HOST}:${PORT}`);console.log(`Health: http://${HOST}:${PORT}/health`);console.log(`Online plaza, exploration, raid and secure trading are ready (up to 4 players).\n`)});
function shutdown(){clearInterval(battleClock);clearInterval(heartbeat);for(const socket of clients)try{socket.close(1001,"server shutdown")}catch{};server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),1500).unref()}
process.on("SIGINT",shutdown);process.on("SIGTERM",shutdown);
export{server,store};
