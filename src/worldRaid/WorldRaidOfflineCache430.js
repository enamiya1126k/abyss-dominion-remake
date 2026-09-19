import {onlineAvatarVisual,onlineMagicCircleArt} from '../ui/screens/OnlinePartyScreen.js';
import {monsterVisual} from '../ui/MonsterVisual.js';
import {raidSpriteBase} from '../core/RaidPresentation.js';
export async function prepareOfflineCache430(){
 if(typeof navigator==='undefined'||!navigator.serviceWorker)return {reload:false};
 const registration=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('オフライン保存の準備ができません。再読み込みしてお試しください。')),8000);navigator.serviceWorker.ready.then(r=>{clearTimeout(timer);resolve(r);},reject);});
 if(!registration.active?.scriptURL?.includes('world-raid-offline477-sw.js'))throw new Error('画面を再読み込みしてから挑戦権を取得してください。');
 const response=await fetch('./world-raid-offline477-assets.json',{cache:'no-store'});if(!response.ok)throw new Error('オフライン用データを取得できません。');const urls=await response.json();
 return new Promise((resolve,reject)=>{
  const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(new Error('オフライン用データの保存がタイムアウトしました。再試行してください。'));},120000);
  channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();event.data?.ok?resolve({reload:true}):reject(new Error('オフライン用データを保存できません。接続・空き容量を確認してください。'));};
  registration.active.postMessage({type:'prepareWorldRaid430',urls},[channel.port2]);
 });
}
export function warmTicketImages430(ticket){
 if(typeof window==='undefined')return;
 const urls=new Set(),walk=value=>{if(typeof value==='string'&&value.startsWith('./assets/')){if(/\.(png|webp|gif|jpe?g|svg)$/.test(value))urls.add(value);else for(const frame of ['idle1','idle2','idle3','attack','damage','down']){urls.add(value+'/'+frame+'.png');urls.add(value+'-'+frame+'.png');}}else if(value&&typeof value==='object')for(const v of Object.values(value))walk(v);};walk(ticket.initialRoom);
 let html='';const raid=ticket.initialRoom?.raid;
 if(raid){for(const player of Object.values(raid.players)){
  for(const frame of ['idle1','idle2','idle3','attack','damage','down'])html+=onlineAvatarVisual(player,{frame});html+=onlineMagicCircleArt(player,{className:'battle-magic-circle'});
 }for(const enemy of [raid.boss,...raid.minions])for(const frame of ['idle1','idle2','idle3','attack','damage','down'])html+=monsterVisual({...enemy,customVisualBase:raidSpriteBase(enemy.id)??enemy.visualBase,customVisualAsset:enemy.heroAsset},'魔',{frame});}
 for(const match of html.matchAll(/(?:src=["']|url\(['"]?)([^"')]+)["')]/g)){const url=match[1].replaceAll('&amp;','&');if(url.startsWith('./assets/'))urls.add(url);}
 for(const url of urls){const img=new Image();img.src=url;}
}
