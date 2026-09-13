import {ROYAL_ITEM_KEYS} from './RoyalChamberSystem.js';
import {createSignatureEquipment} from './SignatureWeaponSystem.js';
import {receiveEquipment} from '../services/EquipmentStorage.js';

export const ROYAL_HEROES434=Object.freeze({
 myth_enami:{name:'えなみ',greeting:'お？ 僕とたたかう？ それとも、ちょっと話していく？',talk:'これで僕をうまく使いこなしてくれよ。次の一手は、君に任せる。まかセロリ！',again:'力を出す順番も大事やで。君の部隊なら、まだできることがあるはず。'},
 myth_yori:{name:'より',greeting:'おっと〜！ また来たんか。腕試しでもしていく？',talk:'これ、育成に使ってや。強くなった分は、次の手合わせで見せてもらうで！',again:'よし、今日はどんな作戦や？ 拳だけやなく、仲間の動きも見とくで。'},
 myth_hide:{name:'ひで',greeting:'来てくれたんだね。次の作戦、一緒に確かめようか。',talk:'部隊を育てるために用意したんだ。僕の術式も、君の作戦に組み込んでみて。',again:'前の戦いで気づいたことはある？ 僕にも教えて。次の術式を考えたい。'},
 myth_rion:{name:'りおん',greeting:'いらっしゃい。今日は話か、それとも手合わせか？',talk:'これは先行投資や。部隊を強くして、次の旅の話を持って帰ってきてくれよ！',again:'今日の取り分は、手合わせで得る経験やな。さあ、いこうぜ！'}
});
const copy=x=>JSON.parse(JSON.stringify(x));
export function royalVisits434(state){state.campaign100??={};const c=state.campaign100;c.royalVisits434??={version:1,gifts:{},victories:{},serial:0};const p=c.royalVisits434;p.gifts??={};p.victories??={};return p;}
export function royalHeroAvailable434(state,id){return Boolean(ROYAL_HEROES434[id]&&state.campaign100?.finalCompleted===true);}
export function claimRoyalGift434(state,id){
 if(!royalHeroAvailable434(state,id)||state.activeBattle||state.campaign100.royal360?.attempt||royalVisits434(state).attempt)return {ok:false};
 const p=royalVisits434(state);if(p.gifts[id])return{ok:true,first:false,amount:0};
 state.inventory??={};state.inventory.experienceItemsUltra=Math.max(0,Number(state.inventory.experienceItemsUltra)||0)+3;p.gifts[id]=true;return{ok:true,first:true,amount:3};
}
export function beginRoyalSolo434(state,id){
 if(!royalHeroAvailable434(state,id)||state.activeBattle||state.player?.inRun||state.campaign100.royal360?.attempt)return{ok:false};
 const p=royalVisits434(state),party=(state.party??[]).map(id=>(state.monsters??[]).find(m=>m.id===id)).filter(Boolean);
 if(p.attempt||party.length!==4||new Set(party.map(m=>m.id)).size!==4)return{ok:false};
 p.serial=Math.max(0,Math.floor(Number(p.serial)||0))+1;
 p.attempt={id:`royal-solo434:${p.serial}`,heroId:id,partyIds:party.map(m=>m.id),vitals:Object.fromEntries(party.map(m=>[m.id,{hp:m.currentHp,mp:m.currentMp,ailments:copy(m.ailments??{})}])),items:Object.fromEntries(ROYAL_ITEM_KEYS.map(k=>[k,Number(state.inventory?.[k])||0])),gold:Number(state.player.gold)||0};
 return{ok:true,...copy(p.attempt)};
}
export function royalSoloCheckpoint434(state,data){
 const a=state.campaign100?.royalVisits434?.attempt;
 return Boolean(a&&royalHeroAvailable434(state,a.heroId)&&data?.specialBattleType==='royalSolo434'&&data.battleId===a.id&&data.enemies?.length===1&&data.enemies[0].campaignHeroId===a.heroId&&a.partyIds.every((id,i)=>state.party?.[i]===id&&(state.monsters??[]).some(m=>m.id===id)));
}
export function settleRoyalSolo434(state,{id,won=false,abandoned=false}={}){
 const p=royalVisits434(state),a=p.attempt;
 if(!a||a.id!==id)return{ok:false,duplicate:p.receipt?.id===id};
 const first=Boolean(won&&!p.victories[a.heroId]);let reward=null;
 if(first){const item=createSignatureEquipment(a.heroId,0);if(!item)return{ok:false};item.id=`royal434:${a.heroId}:first-weapon`;item.level=1000;item.plus=0;item.obtainedMethod='royalSolo434';item.equippedBy=null;
 const received=receiveEquipment(state,item,{bossReward:true});reward={name:item.name,level:1000,plus:0,location:received.location,message:received.message};
 state.codex??={};state.codex.equipment??={};state.codex.equipment[item.name]=(Number(state.codex.equipment[item.name])||0)+1;p.victories[a.heroId]=true;}
 state.inventory??={};Object.assign(state.inventory,a.items);state.player.gold=a.gold;
 state.party=[...a.partyIds];for(const m of state.monsters??[]){const v=a.vitals[m.id];if(v){m.currentHp=v.hp;m.currentMp=v.mp;m.ailments=copy(v.ailments);}}
 if(state.activeBattle?.battleId===a.id)delete state.activeBattle;
 state.player.inRun=false;p.attempt=null;p.receipt={id:a.id,heroId:a.heroId,won:Boolean(won),first,reward,abandoned};return{ok:true,...p.receipt};
}
