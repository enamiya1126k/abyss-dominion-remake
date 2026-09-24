import {route500,missilePoint500} from './Motion500.js';
export function validStroke541(path){return Array.isArray(path)&&path.length>0&&path.length<=32&&path.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1)&&path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0)<=1.42;}
export function touches541(path,q,r=.06){for(let i=0;i<path.length;i++){const a=path[i],b=path[Math.min(i+1,path.length-1)],dx=b.x-a.x,dy=(b.y-a.y)*1.4,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*1.4*dy)/d)):0;if(Math.hypot(a.x+dx*t-q.x,(a.y+(b.y-a.y)*t-q.y)*1.4)<=r)return true}return false;}
export function stroke541(g,p,path,at,{progress,hit,intercept,event}){
 if(!validStroke541(path)||g.phase!=='playing'||at<p.nextFireAt||at>=g.endAt)return false;
 p.nextFireAt=at+320;p.strokes541=(p.strokes541??0)+1;p.lastAction={id:(p.lastAction?.id??0)+1,at,lane:p.lane,burst:false};
 const enemies=g.enemies.filter(e=>touches541(path,route500(e,progress(e,at)),e.kind===3?.13:.064)||touches541(path,route500(e,progress(e,Math.max(e.spawnAt,at-220))),e.kind===3?.13:.064)).slice(0,6);
 for(const e of enemies)hit(g,p,e,1,at,false);
 for(const m of [...g.missiles])if(touches541(path,missilePoint500(m,at),.055))intercept(g,p,m.id,at);
 p.bestSweep541=Math.max(p.bestSweep541??0,enemies.length);event(g,'sweep541',at,{seat:p.seat,count:enemies.length,path});return true;
}
export function rally541(g,p,at,event){
 if(g.rally541){if(g.rally541.seats.includes(p.seat)||at>=g.rally541.until)return false;g.rally541.seats.push(p.seat);event(g,'join541',at,{seat:p.seat});return true;}
 if(g.netEnergy<g.netMax||at<g.netUntil)return false;
 g.netEnergy=0;g.rally541={at,until:at+1800,seats:[p.seat],leader:p.seat};event(g,'rally541',at,{seat:p.seat});return true;
}
export function teamTick541(g,at,{hit,intercept,event}){
 if(!g.rules541)return;
 if(at-(g.lastCatch541??0)>2200)g.combo541=0;
 const rally=g.rally541;if(!rally)return;
 for(const p of g.players)if((p.ai||p.auto)&&at-rally.at>450+p.seat*150&&!rally.seats.includes(p.seat))rally.seats.push(p.seat);
 if(at<rally.until&&rally.seats.length<4)return;
 const n=rally.seats.length,p=g.players[rally.leader],damage=[0,3,4,6,8][n],heal=[0,0,3,5,8][n];
 g.rally541=null;g.netUntil=at+2200;g.megaCount++;g.hp=Math.min(100,g.hp+heal);p.bursts++;
 for(const seat of rally.seats)g.players[seat].lastAction={id:(g.players[seat].lastAction?.id??0)+1,at,lane:seat,burst:true};
 event(g,'mega',at,{seat:p.seat,seats:rally.seats,strength541:n,heal541:heal});
 for(const m of [...g.missiles])intercept(g,p,m.id,at,true);
 for(const e of [...g.enemies])hit(g,p,e,damage,at,true);
}
