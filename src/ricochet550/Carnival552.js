import {ARENA555,layout555,rotorContact555} from './Arena555.js';
export const CARNIVAL552=Object.freeze({height:ARENA555.height,chainWindow:1800,feverHits:100,feverMs:7000,rotorY:ARENA555.rotorY,rotorHalf:ARENA555.rotorHalf,rotorRadius:ARENA555.rotorRadius,rotorOmega:0,jackpotRestMs:4500});
export const GEM_COLORS552=['#ff7990','#7adfff','#a0ffc5'];
export const carnivalLayout552=layout555;
export function initCarnival552(g){g.carnival552={startedAt:g.simAt,pot:2500,wins:0,heat:0,feverUntil:0,lockUntil:0};for(const p of g.players)Object.assign(p,{gems552:0,jackpots552:0,bestCombo552:0});}
export const fever552=g=>!!g.carnival552&&g.simAt<g.carnival552.feverUntil;
export const chainMultiplier552=p=>1+Math.min(4,Math.floor((p.combo??0)/3))*.15;
export const rotorAngle552=(g,at=g.simAt)=>{const r=g.carnival552?.rotor555;return r?r.angle+r.omega*Math.max(0,Math.min(60,at-g.simAt))/1000:0;};
export function tickCarnival552(){}
export function collectGem555(g,p,gem,event){const before=p.gems552;p.gems552|=1<<gem;if(before!==p.gems552)event(g,'gem',{seat:p.seat,gem,x:p.x,y:p.y,text:['赤','青','緑'][gem]+'を獲得'});if(before!==7&&p.gems552===7)event(g,'ready',{seat:p.seat,x:p.x,y:p.y,text:'３色そろった！ 上の王冠へ！'});}
export function pinHit552(g,p,b,{event,award}){const c=g.carnival552;if(b.kind==='gem'){collectGem555(g,p,b.gem,event);c.pot=Math.min(5000,c.pot+15);}
 if(b.kind==='crown'&&p.gems552===7&&g.simAt>=c.lockUntil){const value=c.pot;p.gems552=0;p.jackpots552++;c.wins++;c.lockUntil=g.simAt+CARNIVAL552.jackpotRestMs;c.pot=2500;award(g,p,value,'jackpot',b.x,b.y);return;}
 award(g,p,b.value*(1+.25*(p.parts?.spark??0)),'pin',b.x,b.y,{gem:b.gem,bumper:b.id});if(b.kind==='bell'){p.burstCharge553=Math.min(100,p.burstCharge553+10);event(g,'bell',{seat:p.seat,x:b.x,y:b.y});}
}
export const rotorContact552=rotorContact555;
export function comboHit552(g,p,event){p.bestCombo552=Math.max(p.bestCombo552??0,p.combo);if(p.combo===6||p.combo===12)event(g,'combo',{seat:p.seat,x:p.x,y:p.y,count:p.combo,text:p.combo+'連鎖！'});}
export function affinity552(p,id){return(p.parts?.[id]??0)>0?'重ねて強化':({spring:'一撃を強く',echo:'壁から狙う',cell:'衝突を力に',crown:'王冠の大当たり',mirror:'反射を伸ばす',spark:'ピンで稼ぐ'}[id]??'新しい能力');}
