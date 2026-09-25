import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/cart/Rules543.js';
import {parking557,GOLD557,PARKING557} from '../src/cart/Parking557.js';
const parked=y=>({y,x:0,vx:0,vy:0,launched:true,fallenAt:null});
function game(round=1){const g=R.makeCart543({id:'557',code:'X',partyId:'P',hostId:'p0',now:0,members:[0,1,2,3].map(i=>({playerId:'p'+i,name:'P'+i,choice:{speciesId:'slime'}}))});R.startCart543(g,0,557);Object.assign(g,{phase:'play',round,courseId556:'market',roundAt:0,lastAt:0,multiplier:round===5?2:1});g.players.forEach((p,i)=>Object.assign(p,parked([27.48,28.72,29.07,29.4199][i]),{x:(i-1.5)*1.8}));return g}
const finish=g=>{for(let i=0;i<80&&g.phase==='play';i++)R.advanceCart543(g,g.lastAt+25);return g};
test('gold and progressively riskier stops pay 140, 146, 173 and 200 with no score cliff',()=>{
 assert.deepEqual([27.48,28.72,29.07,29.4199].map(y=>R.score543(parked(y))),[140,146,173,200]);
 assert.equal(parking557(parked(28.72)).kind,'gold');assert.equal(parking557(parked(28.7201)).kind,'edge');
 assert.equal(parking557(parked(28.72)).bonus,50);assert.equal(parking557(parked(29.07)).bonus,75);assert.equal(parking557(parked(29.4199)).bonus,100);
});
test('every safe stopping position is monotonic, integral and capped at 200',()=>{let last=0;for(let i=0;i<294200;i++){const y=i/10000,points=R.score543(parked(y));assert(Number.isInteger(points));assert(points>=last,`score drops at ${y}`);assert(points<=200);last=points}assert.equal(last,200)});
test('gold requires full entry; the edge uses the same cart front as the fall boundary',()=>{
 assert.equal(parking557(parked(GOLD557.from+PARKING557.radius-1e-5)).bonus,0);assert.equal(parking557(parked(GOLD557.from+PARKING557.radius)).bonus,50);
 for(const y of [R.CART543.edge-R.CART543.radius,30,31]){assert.equal(parking557(parked(y)).bonus,0);assert.equal(R.score543(parked(y)),0)}
});
test('moving, waiting and fallen carts cannot claim a parking bonus',()=>{for(const patch of [{vx:.06},{vy:-1},{launched:false},{fallenAt:0}])assert.equal(parking557({...parked(29.3),...patch}).bonus,0);assert.equal(R.score543({...parked(29.3),fallenAt:0}),0);assert.equal(R.score543({...parked(29.3),launched:false}),0)});
test('a gentle push past the brink loses the entire round, not just its bonus',()=>{const g=game(),p=g.players[3];g.players=[p];assert.equal(R.score543(p),200);p.vy=.35;for(let i=0;i<12;i++){g.elapsed+=25;R.physics543(g)}assert(p.fallenAt!=null);assert.equal(R.score543(p),0);assert.equal(p.falls,1)});
test('a cart pushed back from an edge stop receives only its new final location score',()=>{const g=game(),p=g.players[2];g.players=[p];assert.equal(R.score543(p),173);p.vy=-1;for(let i=0;i<60;i++){g.elapsed+=25;R.physics543(g)}assert(p.y<29.07);assert(R.score543(p)<173);const points=R.score543(p);assert.equal(R.score543(p),points);assert.equal(p.score,0)});
test('round settlement stores the full breakdown once; only the final round doubles it',()=>{for(const round of [1,5]){const g=finish(game(round)),m=round===5?2:1;assert.equal(g.phase,round===5?'result':'intermission');assert.deepEqual(g.roundResults.map(p=>p.points),[140,146,173,200].map(n=>n*m));for(const r of g.roundResults){assert.equal(r.bonus,r.goldBonus557+r.edgeBonus557);assert.equal(r.points,(r.base+r.bonus)*m)}assert.deepEqual(g.players.map(p=>p.edgeParks557??0),[0,0,1,1]);assert.deepEqual(g.players.map(p=>p.perfects),[1,1,0,0]);const before=g.players.map(p=>p.score);R.advanceCart543(g,g.lastAt+500);assert.deepEqual(g.players.map(p=>p.score),before);if(round===5){assert.equal(g.results[0].seat,3);assert.equal(g.results[0].score,400)}}});
test('a time-limit stop agrees with displayed score and restoring a save cannot change the award',()=>{const g=game();Object.assign(g,{roundAt:0,lastAt:R.CART543.roundTime-25});g.players.forEach(p=>p.vx=.1);const copy=structuredClone(g);R.advanceCart543(g,R.CART543.roundTime);R.advanceCart543(copy,R.CART543.roundTime);assert.deepEqual(g,copy);assert.equal(g.phase,'intermission');for(const p of g.players)assert.equal(p.roundScore,R.score543(p))});
