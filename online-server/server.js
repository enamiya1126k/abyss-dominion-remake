import http from"node:http";
import process from"node:process";
import{WebSocketServer,WebSocket}from"ws";
import{RoomStore}from"./src/RoomStore.js";

const HOST=process.env.HOST||"127.0.0.1",PORT=Math.max(1,Math.min(65535,Number(process.env.PORT)||8787)),store=new RoomStore({battleReconnectActionGraceMs:2500,friendStateFile:process.env.FRIEND_STATE_FILE||"./data/friends.json",guildStateFile:process.env.GUILD_STATE_FILE||"./data/guilds.json",powerRankingStateFile:process.env.POWER_RANKING_STATE_FILE||"./data/power-rankings.json",settlementStateFile:process.env.SETTLEMENT_STATE_FILE||"./data/settlements.json"}),clients=new Set();
const DEFAULT_ORIGINS=[/^https:\/\/[a-z0-9-]+\.github\.io$/i,/^https?:\/\/localhost(?::\d+)?$/i,/^https?:\/\/127\.0\.0\.1(?::\d+)?$/i];
const BACKGROUND_REQUESTS=new Set(["ping","powerRankingPresence","powerSnapshotSubmit","powerRankingList","powerRankingProfile","powerRankingRewardAck","setConnectionMode","rewardAck","expeditionVitalsAck","hostWorldDeltaAck","battleDefeatedAck","expeditionResultAck","tradeAck"]);
function originAllowed(origin){const configured=String(process.env.ALLOWED_ORIGINS??"").trim();if(configured==="*")return true;if(configured){return configured.split(",").map(value=>value.trim()).filter(Boolean).some(value=>origin===value)}return !origin||origin==="null"||DEFAULT_ORIGINS.some(pattern=>pattern.test(origin))}
function reply(socket,message){if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify(message))}
function fail(socket,result){const requestId=typeof result?.requestId==="string"&&/^[a-zA-Z0-9:_-]{8,96}$/.test(result.requestId)?result.requestId:null,tradeId=typeof result?.tradeId==="string"?result.tradeId.slice(0,160):null,offerRequestId=typeof result?.offerRequestId==="string"&&/^[a-zA-Z0-9:_-]{8,96}$/.test(result.offerRequestId)?result.offerRequestId:null,hasOfferRevision=Object.prototype.hasOwnProperty.call(result??{},"offerRevision"),offerRevision=Math.max(0,Math.floor(Number(result?.offerRevision)||0));reply(socket,{type:"error",code:result.code??"REQUEST_FAILED",message:result.message??"処理に失敗しました",...(requestId?{requestId}:{}),...(tradeId?{tradeId}:{}),...(offerRequestId?{offerRequestId}:{}),...(hasOfferRevision?{offerRevision}:{}),...(result?.trade?.tradeId?{trade:result.trade}:{})})}

const server=http.createServer((request,response)=>{
	 if(request.url==="/health"){const weekly=store.raid.weeklyState(),settlementJournal=store.settlementStatus(),persistence={friends:store.friends.persistenceHealthy(),guilds:store.guilds.persistenceHealthy(),ranking:store.powerRanking.persistenceHealthy(),settlements:store.settlementPersistenceHealthy()},healthy=persistence.friends&&persistence.guilds&&persistence.ranking&&persistence.settlements;response.writeHead(healthy?200:503,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});response.end(JSON.stringify({ok:healthy,service:"ABYSS DOMINION CO-OP SERVER",protocol:"1.17.0",persistence,settlementJournal,weeklyRaid:{weekId:weekly.weekId,bossId:weekly.boss.id,modifierId:weekly.modifier.id,endsAt:weekly.endsAt},rooms:store.rooms.size,guilds:store.guilds.guilds.size,powerRankingRecords:store.powerRanking.recordCount(),expeditions:[...store.rooms.values()].filter(room=>room.phase==="expedition").length,battles:[...store.rooms.values()].filter(room=>room.expedition?.battle).length,raids:[...store.rooms.values()].filter(room=>room.phase==="raid").length,teamBattles:[...store.rooms.values()].filter(room=>room.phase==="team").length,resonanceMazes:0,activeHallGames:[...store.rooms.values()].filter(room=>store.hallMinigames.active(room)).length,recoveryOutboxes:store.recoveryOutboxes.size,tradeRecoveries:store.trade.recoveryStatus(),players:[...store.sessions.values()].filter(session=>session.connected).length,time:new Date().toISOString()}));return}
 response.writeHead(200,{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"});response.end("ABYSS DOMINION CO-OP SERVER\nWebSocket endpoint: /party\nHealth check: /health\n");
});
const wss=new WebSocketServer({noServer:true,maxPayload:128*1024,perMessageDeflate:false});
server.on("upgrade",(request,socket,head)=>{
 let pathname;try{pathname=new URL(request.url,"http://localhost").pathname}catch{socket.destroy();return}if(pathname!=="/party"||!originAllowed(request.headers.origin)){socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");socket.destroy();return}wss.handleUpgrade(request,socket,head,websocket=>wss.emit("connection",websocket,request));
});
wss.on("connection",socket=>{
 clients.add(socket);socket.isAlive=true;socket.rate={started:Date.now(),count:0};socket.on("pong",()=>socket.isAlive=true);
 socket.on("message",raw=>{
  const now=Date.now();if(now-socket.rate.started>=1000)socket.rate={started:now,count:0};if(++socket.rate.count>40){socket.close(1008,"rate limit");return}
  let message;try{message=JSON.parse(raw.toString())}catch{return fail(socket,{code:"BAD_JSON",message:"通信データを読み取れません"})}if(!message||typeof message.type!=="string")return;
	 if(message.type==="hello"){if(socket.session)return fail(socket,{code:"ALREADY_READY",message:"この接続では開始処理が完了しています"});if(message.protocol!=="1.17.0")return fail(socket,{code:"PROTOCOL_MISMATCH",message:"ゲームとオンラインサーバーのバージョンが一致しません"});const result=store.hello(socket,message);if(!result.ok)return fail(socket,result);const pendingExpeditionResult=Boolean(socket.session?.pendingMessages?.some(entry=>entry?.type==="expeditionResult"));reply(socket,{type:"helloAck",protocol:"1.17.0",capabilities:{roomListingsV1:true,adventurerTavernV1:true,friendsV1:true,guildsV1:true,guildPartyRecruitmentV1:true,guildActivityHistoryV1:true,guildPlansV1:true,guildPlanGatheringV1:true,guildPlanRemindersV1:true,settlementJournalV1:true,onlineSafetyV1:true,expeditionResultsV1:true,hostWorldReceiptsV1:true,battleRecordsV1:true,fullResetRaidV1:true,battleRosterV1:true,battleAutoV1:true,powerRankingsV1:true,powerRankingPresenceV1:true,powerRankingRewardsV1:true,backgroundConnectionV1:true,tradeOfferReceiptsV1:true},playerId:result.playerId,resumeToken:result.resumeToken,resumed:result.resumed,recovered:Boolean(result.recovered),backgroundOnly:Boolean(result.backgroundOnly),resumableRoom:Boolean(result.resumableRoom),room:result.room,friendState:result.friendState,guildState:result.guildState,activeTradeIds:store.trade.protectedTradeIdsFor(result.playerId),pendingExpeditionResult});if(!store.deliverPendingRewards(socket.session)){fail(socket,{code:"SETTLEMENT_PERSISTENCE",message:"保留中の受取を安全に確認できません。サーバーの保存先を確認してください"});return}if(!store.deliverPendingPowerRankingRewards(socket.session)){fail(socket,{code:"POWER_RANKING_PERSISTENCE",message:"週間ランキング報酬を安全に確認できません。サーバーの保存先を確認してください"});return}reply(socket,{type:"recoveryComplete",orphanedExpedition:Boolean(!result.resumableRoom&&!pendingExpeditionResult)});return}
  const session=socket.session;if(!session)return fail(socket,{code:"NOT_READY",message:"先に接続処理を完了してください"});if(session.connection!==socket){try{socket.close(4001,"superseded connection")}catch{}return}if(!["ping","listRoomListings","powerRankingPresence"].includes(message.type))store.markSessionActivity(session);let result={ok:false,code:"UNKNOWN_MESSAGE",message:"未対応の通信です"};
  if(session.backgroundOnly&&!BACKGROUND_REQUESTS.has(message.type))return fail(socket,{code:"BACKGROUND_ONLY",message:"オンライン画面を開いてから操作してください",requestId:message.requestId});
  if(message.type==="powerRankingPresence"){result=store.touchPowerRankingPresence(session);if(!result.ok)fail(socket,result);return}
  if(message.type==="setConnectionMode"){result=store.setConnectionMode(session,message);if(!result.ok)fail(socket,result);else reply(socket,result.message);return}
  if(message.type==="powerSnapshotSubmit"){result=store.submitPowerSnapshot(session,message);if(!result.ok)fail(socket,{...result,requestId:message.requestId});else reply(socket,result.message);return}
  if(message.type==="powerRankingList"){result=store.powerRankingList(session,message);if(!result.ok)fail(socket,{...result,requestId:message.requestId});else reply(socket,result.message);return}
  if(message.type==="powerRankingProfile"){result=store.powerRankingProfile(session,message);if(!result.ok)fail(socket,{...result,requestId:message.requestId});else reply(socket,result.message);return}
  if(message.type==="powerRankingRewardAck"){result=store.ackPowerRankingReward(session,message);if(!result.ok)fail(socket,result);else reply(socket,result.message);return}
  if(message.type==="listRoomListings"){result=store.listRoomListings(session,message);if(!result.ok)fail(socket,result);else reply(socket,result.message);return}
  if(message.type==="friendList"){result=store.friendState(session);if(!result.ok)fail(socket,result);else reply(socket,{type:"friendState",state:result.state});return}
  if(message.type==="guildList"){result=store.guildState(session);if(!result.ok)fail(socket,result);else reply(socket,{type:"guildState",state:result.state});return}
  if(message.type==="guildLookup"){result=store.lookupGuild(session,message.guildId);if(!result.ok)fail(socket,result);else reply(socket,{type:"guildLookupResult",guild:result.guild});return}
  if(message.type==="friendRequest")result=store.requestFriend(session,message.targetId);
  else if(message.type==="friendRespond")result=store.respondFriend(session,message.targetId,message.accepted);
  else if(message.type==="friendRemove")result=store.removeFriend(session,message.targetId);
  else if(message.type==="friendBlock")result=store.blockFriend(session,message.targetId);
  else if(message.type==="friendUnblock")result=store.unblockFriend(session,message.targetId);
  else if(message.type==="friendMute")result=store.muteFriend(session,message.targetId);
  else if(message.type==="friendUnmute")result=store.unmuteFriend(session,message.targetId);
  else if(message.type==="friendRoomInvite")result=store.inviteFriend(session,message.targetId);
  else if(message.type==="friendInviteRespond")result=store.respondFriendInvite(session,message.inviteId,message.accepted);
  else if(message.type==="guildCreate")result=store.createGuild(session,message);
  else if(message.type==="guildApply")result=store.applyGuild(session,message.guildId);
  else if(message.type==="guildApplicationRespond")result=store.respondGuildApplication(session,message.targetId,message.accepted===true);
  else if(message.type==="guildInvite")result=store.inviteGuild(session,message.targetId);
  else if(message.type==="guildInviteRespond")result=store.respondGuildInvite(session,message.inviteId,message.accepted===true);
  else if(message.type==="guildSetRole")result=store.setGuildRole(session,message.targetId,message.role);
  else if(message.type==="guildTransfer")result=store.transferGuild(session,message.targetId);
  else if(message.type==="guildKick")result=store.kickGuild(session,message.targetId);
  else if(message.type==="guildLeave")result=store.leaveGuild(session);
  else if(message.type==="guildDisband")result=store.disbandGuild(session,message.name);
  else if(message.type==="guildCheckIn")result=store.checkInGuild(session);
  else if(message.type==="guildChat")result=store.guildChat(session,message.text);
  else if(message.type==="guildPlanCreate")result=store.createGuildPlan(session,message);
  else if(message.type==="guildPlanRespond")result=store.respondGuildPlan(session,message.planId,message.status);
  else if(message.type==="guildPlanCancel")result=store.cancelGuildPlan(session,message.planId);
  else if(message.type==="guildPlanGather")result=store.gatherGuildPlan(session,message.planId);
  else if(message.type==="guildRecruitmentCreate")result=store.createGuildRecruitment(session,message);
  else if(message.type==="guildRecruitmentClose")result=store.closeGuildRecruitment(session,message.recruitmentId);
  else if(message.type==="guildRecruitmentJoin")result=store.joinGuildRecruitment(session,message.recruitmentId);
  else if(message.type==="createRoom")result=store.createRoom(session,message);
  else if(message.type==="joinRoom")result=store.joinRoom(session,message.roomId);
  else if(message.type==="setRoomListing")result=store.setRoomListing(session,message);
  else if(message.type==="joinListedRoom")result=store.joinListedRoom(session,message);
  else if(message.type==="quickJoin")result=store.quickJoin(session,message);
  else if(message.type==="removeRoomMember")result=store.removeRoomMember(session,message.targetId);
  else if(message.type==="leaveRoom")result=store.leaveRoom(session);
  else if(message.type==="profile")result=store.updateProfile(session,message.profile);
  else if(message.type==="expeditionProfileSync")result=store.expeditionProfileSync(session,message.profile);
  else if(message.type==="move")result=store.move(session,message.position);
  else if(message.type==="setReady")result=store.setReady(session,message.ready);
  else if(message.type==="setFloor")result=store.setFloor(session,message.floor);
  else if(message.type==="startExpedition")result=store.startExpedition(session,message);
  else if(message.type==="expeditionMove")result=store.moveExpedition(session,message.position);
	  else if(message.type==="expeditionInteract")result=store.expeditionInteract(session,message);
	  else if(message.type==="expeditionPing")result=store.expeditionPing(session,message);
	  else if(message.type==="rareMerchantClaim")result=store.rareMerchantClaim(session,message);
	  else if(message.type==="social")result=store.social(session,message);
	  else if(message.type==="focusTarget")result=store.focusTarget(session,message);
	  else if(message.type==="battleCheer")result=store.battleCheer(session,message);
  else if(message.type==="battleAction")result=store.submitBattleAction(session,message.action??message);
  else if(message.type==="battleAuto")result=store.setBattleAuto(session,message);
  else if(message.type==="battleSpeed")result=store.setBattleSpeed(session,message.speed);
  else if(message.type==="requestReturn")result=store.requestReturn(session);
  else if(message.type==="completeExpedition")result=store.completeExpedition(session);
  else if(message.type==="startRaid")result=store.startRaid(session,message);
	  else if(message.type==="raidAction")result=store.submitRaidAction(session,message.action??message);
	  else if(message.type==="raidSpeed")result=store.setRaidSpeed(session,message.speed);
	  else if(message.type==="teamSide")result=store.setTeamSide(session,message.side);
	  else if(message.type==="teamReady")result=store.setTeamReady(session,message.ready);
	  else if(message.type==="teamSettings")result=store.setTeamSettings(session,message);
	  else if(message.type==="teamSwapSides")result=store.swapTeamSides(session);
	  else if(message.type==="startTeamBattle")result=store.startTeamBattle(session);
	  else if(message.type==="teamAction")result=store.submitTeamAction(session,message.action??message);
	  else if(message.type==="teamSpeed")result=store.setTeamSpeed(session,message.speed);
	  else if(message.type==="startResonance")result=store.startResonance(session);
	  else if(message.type==="resonanceMove")result=store.moveResonance(session,message);
	  else if(message.type==="resonanceAction")result=store.resonanceAction(session,message);
  else if(message.type==="tradeInvite")result=store.requestTrade(session,message.targetId);
  else if(message.type==="tradeAccept")result=store.respondTrade(session,message.tradeId,message.accepted);
  else if(message.type==="tradeOffer")result=message.requestId==null?store.offerTrade(session,message.tradeId,message.asset,null):typeof message.requestId==="string"&&/^[a-zA-Z0-9:_-]{8,96}$/.test(message.requestId.trim())?store.offerTrade(session,message.tradeId,message.asset,message.requestId.trim()):{ok:false,code:"TRADE_REQUEST_ID",message:"交換操作IDが不正です",tradeId:String(message.tradeId??"").slice(0,160)};
  else if(message.type==="tradeReady")result=store.readyTrade(session,message.tradeId,message.ready);
  else if(message.type==="tradeConfirm")result=store.confirmTrade(session,message.tradeId);
  else if(message.type==="tradeCancel")result=store.cancelTrade(session,message.tradeId);
  else if(message.type==="tradeAck")result=store.ackTrade(session,message.tradeId,message.success);
  else if(message.type==="chat")result=store.chat(session,message);
  else if(message.type==="rewardAck")result=store.ackReward(session,message.rewardId);
  else if(message.type==="expeditionVitalsAck")result=store.ackExpeditionVitals(session,message.mutationId);
  else if(message.type==="hostWorldDeltaAck")result=store.ackHostWorldDelta(session,message.mutationId);
  else if(message.type==="battleDefeatedAck")result=store.ackBattleDefeated(session,message.eventId);
  else if(message.type==="expeditionResultAck")result=store.ackExpeditionResult(session,message.resultId);
  else if(message.type==="resetWeeklyRaidForFullReset"){result=store.resetWeeklyRaidForFullReset(session,message);if(!result.ok)fail(socket,result);else reply(socket,{type:"weeklyRaidResetAck",requestId:result.requestId,weekId:result.weekId,duplicate:Boolean(result.duplicate),removed:result.removed??null});return}
  else if(message.type==="ping"){reply(socket,{type:"pong",at:now});return}
  if(!result.ok)fail(socket,result);
 });
 socket.on("close",()=>{clients.delete(socket);store.disconnect(socket.session,socket)});socket.on("error",()=>{});
});
const battleClock=setInterval(()=>store.advanceBattles(),250);battleClock.unref?.();
const heartbeat=setInterval(()=>{store.pruneExpired();for(const socket of clients){if(socket.isAlive===false){socket.terminate();continue}socket.isAlive=false;socket.ping()}},10_000);heartbeat.unref?.();
let powerRankingRolloverTimer=null;
function schedulePowerRankingRollover(retry=false){if(powerRankingRolloverTimer)clearTimeout(powerRankingRolloverTimer);const now=Date.now(),target=store.powerRanking.nextRolloverAt(),delay=retry?60_000:Math.max(250,Math.min(7*24*60*60_000,target-now+100));powerRankingRolloverTimer=setTimeout(()=>{const ok=store.rollPowerRankingSeason(Date.now());if(!ok)console.error("Power ranking weekly rollover could not be persisted; retrying in 60 seconds");schedulePowerRankingRollover(!ok)},delay);powerRankingRolloverTimer.unref?.()}
schedulePowerRankingRollover();
server.listen(PORT,HOST,()=>{console.log(`\nABYSS DOMINION CO-OP SERVER`);console.log(`Local: http://${HOST}:${PORT}`);console.log(`Health: http://${HOST}:${PORT}/health`);console.log(`Online home, exploration, raid, free team battle and chat are ready (up to 4 players).\n`)});
function shutdown(){clearInterval(battleClock);clearInterval(heartbeat);if(powerRankingRolloverTimer)clearTimeout(powerRankingRolloverTimer);for(const socket of clients)try{socket.close(1001,"server shutdown")}catch{};server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),1500).unref()}
process.on("SIGINT",shutdown);process.on("SIGTERM",shutdown);
export{server,store};
