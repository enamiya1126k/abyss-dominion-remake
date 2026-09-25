// GP progression acts through velocity, never by awarding distance or moving a body.
export const MOTOR554=Object.freeze({duration:2600,gateSpacing:96,firstGate:32,travelCharge:.12});
export const nitroActive554=(p,at)=>at<(p.nitroUntil554??0);
export function canNitro554(g,p,at=g.simAt){return !!(g.game==='junkgp'&&g.phase==='play'&&p?.picked&&p.launched&&p.nitro554>=100&&!nitroActive554(p,at)&&at<g.deadline)}
export function initMotor554(g){for(const p of g.players)Object.assign(p,{nitro554:20,nitroUntil554:0,nitroReadyAt554:0,nitroShots554:0,passedGates554:[],gateWins554:0,gateSixes554:0,hotUntil554:0,bestCombo554:0});}
export function gainNitro554(g,p,amount,event){const before=p.nitro554??0;p.nitro554=Math.min(100,before+Math.max(0,amount)*(g.round===g.rounds?1.5:1));if(before<100&&p.nitro554>=100){p.nitroReadyAt554=g.simAt;event(g,'nitroReady',{seat:p.seat,x:p.x,y:p.y,text:'ターボ満タン！ 引き直して噴射！'})}}
export function hitMotor554(g,p,strength,event){p.bestCombo554=Math.max(p.bestCombo554??0,p.combo);if(!nitroActive554(p,g.simAt))gainNitro554(g,p,8+Math.min(8,strength*.16),event);}
export function fireNitro554(g,p,power,angle,{event,limit}){
 if(!canNitro554(g,p)||!Number.isFinite(power)||power<.08||power>1||!Number.isFinite(angle)||Math.abs(angle)>Math.PI)return false;
 const carryX=p.vx,carryY=p.vy,force=(8+34*power*power)*(1+.1*(p.parts.engine??0))/Math.sqrt(p.mass);
 p.vx+=Math.sin(angle)*force;p.vy+=Math.cos(angle)*force;limit(p);p.nitro554=0;p.nitroUntil554=g.simAt+MOTOR554.duration;p.nitroShots554++;p.pulling=false;p.pullKind553=null;
 event(g,'nitro',{seat:p.seat,x:p.x,y:p.y,carryX,carryY,vx:p.vx,vy:p.vy,text:'スクラップターボ！！'});return true;
}
export function gates554(players){const ids=new Set();for(const p of players.length?players:[{y:2}])for(let d=-1;d<=2;d++)ids.add(Math.max(0,Math.floor(p.y/MOTOR554.gateSpacing)+d));return [...ids].sort((a,b)=>a-b).map(id=>({id,y:MOTOR554.firstGate+id*MOTOR554.gateSpacing,left:id%2?'wild':'safe',w:4.2,x:2.8}));}
// Swept forward crossings cover the fastest shot. Each driver claims each gate once,
// even after bouncing backwards or crossing into the other lane on a later shot.
export function crossGates554(g,p,oldX,oldY,{event,random,limit}){
 if(p.y<=oldY)return;
 for(const gate of g.layout.gates??[]){if(oldY>=gate.y||p.y<gate.y||p.passedGates554.includes(gate.id))continue;
  const fraction=(gate.y-oldY)/(p.y-oldY),x=oldX+(p.x-oldX)*fraction,side=x<0?-1:1;
  if(Math.abs(x-side*gate.x)>gate.w/2+p.r*.3)continue;
  p.passedGates554.push(gate.id);p.gateWins554++;const kind=side<0?gate.left:gate.left==='safe'?'wild':'safe';
  const die=kind==='wild'?1+Math.floor(random(g)*6):0,force=kind==='safe'?12:die<=2?4:die<6?16:38;
  p.vy+=force;gainNitro554(g,p,kind==='safe'?25:die===6?100:12,event);limit(p);if(die===6){p.gateSixes554++;p.hotUntil554=g.simAt+2000;}
  event(g,'gate',{seat:p.seat,x:p.x,y:p.y,gate:gate.id,kind,die,force,text:kind==='safe'?'安定加速 ＋ ターボ充填':die===6?'６！ 大暴発 ＋ ターボ満タン！':die<=2?'ギア '+die+' · 小さく点火':'ギア '+die+' · 一気に加速！'});
 }
}
export function shiftMotor554(g,shift){if(g.game!=='junkgp')return;for(const p of g.players)for(const key of ['nitroUntil554','nitroReadyAt554','hotUntil554'])p[key]=(p[key]??0)+shift;}
export function motorAim554(g,p,random){const next=(g.layout.gates??[]).find(b=>b.y>p.y+2&&!p.passedGates554.includes(b.id)),prefer=p.nitro554<55?'safe':'wild';const x=next?(next.left===prefer?-next.x:next.x):(random(g)-.5)*6,dy=next?Math.max(6,next.y-p.y):12;return{angle:Math.max(-1.05,Math.min(1.05,Math.atan2(x-p.x,dy)))+(random(g)-.5)*.18,power:.65+random(g)*.35};}
export function affinity554(p,id){const pairs={rocket:['coil','噴射を重ねる'],coil:['rocket','二段の追い噴射'],armor:['bumper','重量級の押し合い'],bumper:['armor','装甲コンボ'],cell:['turbo','衝突を力に'],turbo:['cell','追突コンボ'],engine:['bank','育つ大出力'],bank:['engine','後半の大出力'],wheels:['spring','反射を伸ばす'],spring:['wheels','滑走コンボ'],hook:['turbo','追いついて追突']};return(p.parts?.[id]??0)>0?'重ねて強化':pairs[id]&&p.parts?.[pairs[id][0]]?pairs[id][1]:id==='dice'?'運を積み込む':'新しい改造';}
