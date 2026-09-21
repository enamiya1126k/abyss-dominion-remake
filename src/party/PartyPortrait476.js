import{emptyColorAttrs500}from'./PartyColorUI499.js';
import{color499}from'./PartyColors499.js';
import{memberAttrs485}from'./PartyMember485.js';
// The lounge portrait is SLOT1, independent of the pawn chosen for a mini game.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function slotOne476(state){return (state?.monsters??[]).find(m=>m.id===state?.party?.[0])??null}
export function partyFloor476(c){
 const members=c.state?.party?.members??[];
 return `<div class="party-portal-floor476" aria-label="参加者のSLOT1の魔物">${Array.from({length:4},(_,i)=>{
  const m=members[i],local=m?.playerId===c.transport.selfId?slotOne476(c.save?.state):null;
  const species=m?.portrait476?.speciesId??(local?.raceSpeciesId??local?.endgameBossId??local?.speciesId);
  return `<div class="party-summon476 ${m?'is-occupied':'is-empty'} ${m&&!m.connected?'is-offline':''}" ${m?memberAttrs485(c,m):emptyColorAttrs500(c,i)} style="--seat476:${color499(m?.color499??c.state?.party?.aiColors500?.[i],i).hex}"><i class="party-diamond476" aria-hidden="true"></i>${m?`<span class="party-monster476">${species&&c.sgMonster463?c.sgMonster463(species):'<span class="party-no-monster476">✧</span>'}</span><b title="${esc(m.name)}">${esc(m.name)}</b><small>${!m.connected?'再接続待ち':m.atHome?'ホーム滞在中':species?'SLOT1':'SLOT1未設定'}</small>`:'<small>募集中</small>'}</div>`;
 }).join('')}</div>`;
}
