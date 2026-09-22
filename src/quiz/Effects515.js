// Visual timeline only. Deadlines, coordinates, answers and scoring stay in Rules513.
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n)};
export function effects515(g,at,{height=320,pawnHeight=52,reduced=false}={}){
 const elapsed=Math.max(0,at-g.phaseAt),remaining=Math.max(0,(g.deadline??at)-at),question=g.phase==='question',reveal=g.phase==='reveal',closed=g.phase==='lock'||reveal||question&&remaining===0;
 const closeElapsed=g.phase==='lock'?elapsed:question?Math.max(0,at-g.deadline):reveal?650+elapsed:0;
 // Clearance stays at least one full sprite plus 10px through the last visible "1".
 const clearance=.1*height+pawnHeight+10,open=-Math.max(.55*height,clearance+20),hold=-clearance,approach=question?clamp(elapsed/11000):0;
 const landing=closed?clamp(closeElapsed/140):0,impact=closed?clamp((closeElapsed-140)/620):0,impactActive=closed&&closeElapsed>=140&&closeElapsed<760;
 const survivors=g.players.filter(p=>p.alive).length,nextFloor=reveal&&survivors>1&&g.round<20;
 const ascent=reveal&&nextFloor?ease((elapsed-2600)/3000):0,incoming=reveal&&nextFloor?ease((elapsed-4050)/1550):0,arriving=nextFloor&&elapsed>=4050;
 const pulse=question&&remaining>0&&remaining<=3000?1-clamp((1000-(remaining%1000||1000))/250):0;
 return{closed,landing,impact,impactActive,wallPx:closed?(reduced?0:hold*(1-landing*landing)+ascent*height*1.3):reduced?open:open+(hold-open)*approach,
  dust:!reduced&&impactActive,shake:!reduced&&impactActive?Math.sin(closeElapsed*.115)*(1-impact)*5:0,
  bigCount:question&&remaining>0&&remaining<=3000?Math.ceil(remaining/1000):null,pulse:reduced?0:pulse,
  ascent:reduced?0:ascent,nextFloor,arriving:arriving&&!reduced,incoming:reduced?0:incoming,newFloorPx:(incoming-1)*height*1.15,newWallPx:open-(1-incoming)*height*1.15,
  magma:reveal&&g.reveal?.rows.some(r=>r.wasAlive&&!r.correct)&&elapsed>=1300&&elapsed<3600,
  animate:!reduced&&(reveal&&nextFloor&&elapsed<6100||g.phase==='lock'&&elapsed<760||question&&remaining===0&&closeElapsed<760)
 };
}
