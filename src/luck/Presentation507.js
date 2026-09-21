import{LUCK507,ITEMS507}from'./Rules507.js';
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x);
export const itemById507=id=>ITEMS507.find(x=>x.id===id)??ITEMS507[0];
export function luckSignature507(g){if(!g||['lobby','result'].includes(g.phase))return g;return{id:g.id,phase:'play',players:g.players.map(p=>({playerId:p.playerId,seat:p.seat,name:p.name,ai:p.ai,choice:p.choice,color499:p.color499}))}}
export function raceFrame507(g,at,reduced=false){
 const event=g.event,run=g.phase==='run',t=run?(reduced?1:clamp((at-g.phaseAt)/LUCK507.runMs)):['settle','result'].includes(g.phase)?1:0;
 const camera=ease(t),domain=event?event.fromMax+(event.toMax-event.fromMax)*camera:g.scaleMax??80;
 return g.players.map(p=>{
  const row=event?.rows.find(r=>r.playerId===p.playerId),id=row?.item??'walk';let k=t,y=0,angle=0,scale=1,opacity=1;
  if(id==='rocket'||id==='meteor')k=ease(clamp((t-.12)/.78));else if(id==='spring')k=ease(clamp((t-.12)/.76));else if(id==='banana')k=ease(clamp((t-.2)/.6));else k=ease(t);
  const distance=row?row.from+(row.to-row.from)*k:p.distance,x=12+76*Math.max(0,Math.min(1,distance/domain));
  if(run&&!reduced&&t<1){
   if(id==='rocket'||id==='meteor'){y=-30*Math.sin(Math.PI*clamp((t-.1)/.9));angle=-12*Math.sin(Math.PI*t)}
   else if(id==='spring'){y=-62*Math.abs(Math.sin(Math.PI*clamp((t-.12)/.76)));angle=12*Math.sin(2*Math.PI*t)}
   else if(id==='banana'){angle=-300*Math.sin(Math.PI*clamp((t-.15)/.75));y=-14*Math.sin(Math.PI*t)}
   else if(id==='pit'){const sink=Math.sin(Math.PI*t);y=22*sink;scale=1-.72*sink;opacity=1-.7*sink}
   else{y=-Math.abs(Math.sin(t*Math.PI*(id==='dash'?18:10)))*5;angle=Math.sin(t*24)*3}
  }
  return{seat:p.seat,playerId:p.playerId,x,distance:Math.round(distance),y,angle,scale,opacity,item:id,tile:itemById507(id).tile,prop:run&&t>.08&&t<.93,trail:run&&!reduced&&['rocket','meteor','dash'].includes(id)&&t>.13&&t<.9};
 });
}
export function banner507(g,selfId,at){
 if(g.phase==='countdown')return{label:'運を、味方につけろ。',sub:'箱をひとつ。あとは運まかせ。',count:at<g.startAt-3000?'READY':String(Math.max(1,Math.ceil((g.startAt-at)/1000)))};
 if(g.phase==='choose'){const me=g.players.find(p=>p.playerId===selfId);return{label:!me?'みんなの運を見届けよう':me.locked?'全員そろったら、開封！':'運命の箱を、ひとつ。',sub:!me?'観戦中 · 次のレースから参加':me.locked?'選択済み · どれが出るかな？':'見た目も確率も、3つとも同じ。',count:null}}
 if(g.phase==='reveal')return{label:'いっせーので、オープン！',sub:'',count:null};
 const rise=g.event?.rows.find(r=>r.beforeRank===4&&r.afterRank===1);
 return{label:rise?'最下位から、まくった！':g.phase==='settle'?(g.round===8?'フィニッシュ！':'まだまだ、分からない。'):g.event?.rows.some(r=>r.item==='meteor')?'流星ロケット、発射！':'さあ、どうなる！？',sub:g.phase==='settle'&&g.round<8?'次の箱で、またひっくり返る。':'',count:null};
}
export const delta507=n=>(n>0?'+':'')+n+'m';
// A static selection only changes once a second; motion ends at a final exact frame.
export function paintKey507(g,at,ready,pending,reduced){const age=at-g.phaseAt,live=!reduced&&g.phase==='run'&&age>=0&&age<LUCK507.runMs;return[g.id,g.revision,g.phase,g.round,g.phaseAt,g.ownBox,ready,pending?.box??'',g.phase==='choose'?Math.ceil(Math.max(0,g.deadline-at)/1000):g.phase==='countdown'?Math.ceil(Math.max(0,g.startAt-at)/1000):'',live?Math.floor(age/32):g.phase==='run'?'end':'static',reduced].join(':')}
