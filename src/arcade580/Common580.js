import {assignColors499} from '../party/PartyColors499.js';

export const STEP580=25;
export function random580(g){let n=g.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;g.seed=n>>>0||580;return g.seed/4294967296;}
export function event580(g,type,data={}){g.events.push({id:++g.eventId,type,at:g.lastAt,...data});g.events=g.events.slice(-48);}
export function make580(game,{id,code,partyId,hostId,members,now=0}){return {id,code,game,rules580:1,partyId462:partyId,hostId,members:structuredClone(members),createdAt:now,updatedAt:now,serverAt:now,lastAt:now,phase:'lobby',revision:0,round:1,players:[],events:[],eventId:0,results:[],winnerIds:[]};}
export function players580(g){
 const species=['slime','goblin','wolf','skeleton'],names=['欲ばりスライム','ひらめきゴブリン','より','ホネホネ'];
 g.players=g.members.filter(m=>!m.departed).map((m,seat)=>({playerId:m.playerId,name:m.name,seat,ai:!!m.ai,color499:m.color499,speciesId:m.choice?.speciesId??'slime'}));
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:'AI-'+g.id+'-'+seat,name:names[seat],seat,ai:true,speciesId:species[seat]});}
 assignColors499(g.players,g.aiColors500??{});
 for(const p of g.players)Object.assign(p,{score:0,lastSeq:0,auto:p.ai});
}
export function finish580(g){
 const order=[...g.players].sort((a,b)=>b.score-a.score||a.seat-b.seat);
 g.results=order.map(p=>({seat:p.seat,playerId:p.playerId,score:p.score,rank:1+order.filter(q=>q.score>p.score).length}));
 g.winnerIds=g.results.filter(p=>p.rank===1).map(p=>p.playerId);g.phase='result';g.phaseAt=g.lastAt;event580(g,'finish');
}
export function publicBase580(g){return {id:g.id,code:g.code,game:g.game,rules580:1,hostId:g.hostId,phase:g.phase,phaseAt:g.phaseAt,round:g.round,revision:g.revision,serverAt:g.lastAt,startAt:g.startAt,deadline:g.deadline,results:g.results,winnerIds:g.winnerIds,migrationNote:g.migrationNote,members:g.members.map(({playerId,name,choice,color499,departed})=>({playerId,name,color499,departed,choice:choice?{id:choice.id,speciesId:choice.speciesId}:null})),events:g.events.map(e=>({...e}))};}
export const signature580=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
// A restored process resumes the saved simulation; it never spends a whole offline gap.
export function resume580(g,now,inputs,keys,playerKeys=[]){if(now-g.lastAt<=1000)return;const delta=now-g.lastAt-STEP580;for(const key of keys)if(Number.isFinite(g[key])&&g[key]>0)g[key]+=delta;for(const p of g.players)for(const key of playerKeys)if(Number.isFinite(p[key])&&p[key]>0)p[key]+=delta;for(const e of g.events)e.at+=delta;g.lastAt+=delta;inputs.clear();}
