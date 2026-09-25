import {line537} from './Map537.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const opened=h=>h.seals.filter(s=>s.done).length>=(h.required??3);
const gates=h=>h.exits??[h.exit];
const asGoal=(o,kind)=>({id:o.id,x:o.x,y:o.y,name:o.name,key:kind+':'+o.id,kind});
// Public objectives, room alarms and the bot's own visible observations only.
// No hidden hider coordinates, identities or seal progress enter this planner.
function hunterGoal(g,p){
 const h=g.heist541,b=p.brain,at=g.elapsed;b.visits559??={};b.searched559??={};
 const seals=h.seals.filter(s=>!s.done),alarms=opened(h)?[]:seals.filter(s=>(s.alarmUntil??0)>at&&(b.searched559[s.id]??0)<=at);
 const alerted=alarms.sort((a,b)=>dist(a,p)-dist(b,p))[0];
 if(alerted){
  if(b.alarmSeal559!==alerted.id){b.alarmSeal559=alerted.id;b.alarmArrived559=null;}
  if(dist(p,alerted)<210)b.alarmArrived559??=at;
  if(b.alarmArrived559==null||at-b.alarmArrived559<3800)return asGoal(alerted,'alarm');
  b.searched559[alerted.id]=at+6500;b.alarmSeal559=null;
 }
 const targets=opened(h)?gates(h).map(o=>asGoal(o,'gate')):seals.map(o=>asGoal(o,'seal'));
 if(!targets.length)return null;
 const previous=targets.find(o=>o.key===b.patrolKey559);
 if(previous&&dist(p,previous)>200&&at<(b.patrolUntil559??0))return previous;
 if(previous)b.visits559[previous.key]=at;
 const score=o=>dist(p,o)+Math.max(0,24000-(at-(b.visits559[o.key]??-30000)))*.17;
 const target=targets.sort((a,b)=>score(a)-score(b))[0];b.patrolKey559=target.key;b.patrolUntil559=at+16000;return target;
}
function hiderGoal(g,p){
 const h=g.heist541,b=p.brain,king=g.players[g.hunterSeat],at=g.elapsed;
 if(dist(p,king)<=950&&line537(g.map,p,king))b.hunterSeen559={x:king.x,y:king.y,at};
 const enemy=b.hunterSeen559&&at-b.hunterSeen559.at<10000?b.hunterSeen559:null;
 const danger=o=>enemy?Math.max(0,900-dist(enemy,o))*5:0;
 if(!opened(h)&&g.players.some(q=>!q.hunter&&!q.alive&&!q.rescued541)&&dist(p,h.cage)<1000&&(!enemy||dist(enemy,h.cage)>550))return asGoal(h.cage,'rescue');
 const remaining=h.seals.filter(s=>!s.done),list=opened(h)?gates(h).map(o=>asGoal(o,'gate')):remaining.map(o=>asGoal(o,'seal'));
 const others=g.players.filter(q=>q!==p&&!q.hunter&&q.alive);
 const score=o=>dist(p,o)+danger(o)+(o.kind==='seal'?others.filter(q=>dist(q,o)<dist(p,o)-100).length*700:0)-(b.hiderGoal559===o.key?160:0);
 const target=list.sort((a,b)=>score(a)-score(b))[0]??null;b.hiderGoal559=target?.key;return target;
}
export function objective559(g,p){if(!g.heist541)return null;return p.hunter?hunterGoal(g,p):hiderGoal(g,p)}
export function alarmTarget559(g,p,visible){
 if(opened(g.heist541))return null;
 const alarms=g.heist541.seals.filter(s=>!s.done&&(s.alarmUntil??0)>g.elapsed&&dist(p,s)<460);
 if(!alarms.length)return null;
 // Decoys and ordinary furniture remain plausible candidates.
 return visible.filter(o=>!o.checked&&alarms.some(s=>dist(o,s)<230)).sort((a,b)=>dist(a,p)-dist(b,p))[0]??null;
}
