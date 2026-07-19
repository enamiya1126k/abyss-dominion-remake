import{SaveService}from"./services/SaveService.js?v=0.8.0-alpha.2.1";
import{SPECIES}from"./data/species.js";
import{HomeScreen}from"./ui/screens/HomeScreen.js";
import{MonsterListScreen}from"./ui/screens/MonsterListScreen.js";
import{MonsterDetailScreen}from"./ui/screens/MonsterDetailScreen.js";
import{SettingsScreen}from"./ui/screens/SettingsScreen.js";
import{ExploreScreen}from"./ui/screens/ExploreScreen.js";
import{BattleScreen}from"./ui/screens/BattleScreen.js";
import{Modal}from"./ui/components/Modal.js";
import{createMonster,displayName,calculatedStats,TRAITS,expNeedFor}from"./models/Monster.js";
import{createEquipment,equipmentPower}from"./models/Equipment.js";
import{receiveEquipment,takeFromStorage,equipmentSellPrice,slotLabel}from"./services/EquipmentStorage.js?v=0.8.0-alpha.2.1";
import{RARITY_ORDER,equipmentStatLabel}from"./data/equipment.js";
import{EquipmentScreen}from"./ui/screens/EquipmentScreen.js?v=0.8.0-alpha.2.1";
import{ShopScreen}from"./ui/screens/ShopScreen.js";
import{maxMp,learnedSkills,skillById,canUseSkill,skillDamage}from"./battle/SkillSystem.js";
import{ENEMY_ACTIONS,createEnemyBattleState,chooseEnemyAction,enemyDamageMultiplier,enemyHealAmount,enemyAttackMultiplier}from"./battle/EnemyAI.js";
import{createBattleRulesState,cooldownRemaining,setSkillCooldown,tickCooldowns,addBattleLog,applyEnemyStatus,processEnemyStatuses}from"./battle/BattleRules.js";
import{buildTurnQueue,currentTurnEntry,currentAlly,currentEnemy,aliveEnemies,selectedEnemy,advanceQueue,queueFinished,skipInvalidEntries}from"./battle/TurnSystem.js";

const TILE=48,COLS=31,ROWS=31,app=document.getElementById("app"),save=new SaveService();
let screen="home",selected=null,equipmentTarget=null,game=null,battle=null,snapshot=null,activeEnemy=null,navigationOrigin="home";
function topModal(){const mods=document.querySelectorAll(".game-modal");return mods[mods.length-1]??null}
function topModalButton(){return topModal()?.querySelector("#closeGameModal")??null}
function closeTopModal(){topModal()?.remove()}
function showToast(text){document.querySelector(".game-toast")?.remove();const el=document.createElement("div");el.className="game-toast";el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1400)}
document.addEventListener("click",e=>{const b=e.target.closest?.("[data-modal-dismiss]");if(!b)return;const modal=b.closest(".game-modal");modal?.remove();if(game?.paused&&!document.querySelector(".game-modal"))game.paused=false});
// Mobile game controls: prevent accidental selection/callout/zoom while preserving scrolling.
document.addEventListener("contextmenu",e=>{if(!e.target.closest("input,textarea"))e.preventDefault()});
document.addEventListener("selectstart",e=>{if(!e.target.closest("input,textarea"))e.preventDefault()});
let lastTouchEnd=0;document.addEventListener("touchend",e=>{const now=Date.now();if(now-lastTouchEnd<320&&!e.target.closest("input,textarea"))e.preventDefault();lastTouchEnd=now},{passive:false});

class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66;if(p.x<l)this.x+=(p.x-l)/this.z*.12;if(p.x>r)this.x+=(p.x-r)/this.z*.12;if(p.y<t)this.y+=(p.y-t)/this.z*.12;if(p.y>b)this.y+=(p.y-b)/this.z*.12}clamp(w){const edge=30,mw=w.cols*TILE*this.z,mh=w.rows*TILE*this.z,ml=this.c.width/2-this.x*this.z,mt=this.c.height/2-this.y*this.z,minX=edge-(ml+mw),maxX=this.c.width-edge-ml,minY=edge-(mt+mh),maxY=this.c.height-edge-mt;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-ml:Math.max(minX,Math.min(maxX,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-mt:Math.max(minY,Math.min(maxY,this.oy))}}
function normalizeEquipmentState(){
 save.state.equipment??=[];save.state.reserveEquipment??=[];save.state.bossEquipmentVault??=[];save.state.settings??={};
 save.state.settings.equipmentSort??="rarity";save.state.settings.equipmentSlot??="weapon";save.state.settings.equipmentStorage??="inventory";
 save.state.gacha??={firstTenUsed:false,lastDailyKey:null};save.state.rest??={lastFreeKey:null};
 const byId=new Map(save.state.equipment.map(i=>[i.id,i]));
 save.state.equipment.forEach(i=>i.equippedBy=null);
 save.state.monsters.forEach(m=>{
  m.traitId??="steady";
  const slots={weaponRight:null,weaponLeft:null,armorBody:null,armorSupport:null,accessoryNeck:null,accessoryFinger:null};
  const old=m.equipment??{};
  slots.weaponRight=old.weaponRight??old.weapon??null;slots.weaponLeft=old.weaponLeft??null;
  slots.armorBody=old.armorBody??old.armor??null;slots.armorSupport=old.armorSupport??null;
  slots.accessoryNeck=old.accessoryNeck??old.accessory??null;slots.accessoryFinger=old.accessoryFinger??null;
  const seen=new Set();
  for(const key of Object.keys(slots)){
   const id=slots[key];const item=id?byId.get(id):null;
   if(!item||seen.has(id)){slots[key]=null;continue}
   seen.add(id);item.equippedBy=m.id;
  }
  m.equipment=slots;
  const natural=calculatedStats(m);if(m.currentHp==null||!Number.isFinite(m.currentHp))m.currentHp=natural.hp;if(m.currentMp==null||!Number.isFinite(m.currentMp))m.currentMp=maxMp(m);
  const counts={},stats={};Object.values(m.equipment).forEach(id=>{const item=byId.get(id);if(!item)return;const mult=1+(item.plus??0)*.08;Object.entries(item.stats??{}).forEach(([k,v])=>stats[k]=(stats[k]??0)+Math.round(v*mult));if(item.series)counts[item.series]=(counts[item.series]??0)+1});m._equipmentStats=stats;m._seriesCounts=counts;
 });
}
function render(){normalizeEquipmentState();if(screen==="home"){app.innerHTML=HomeScreen(save.state);bindHome()}else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state);bindList()}else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m,save.state);bindDetail(m)}else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}else if(screen==="equipment"){equipmentTarget??=save.state.party[0];app.innerHTML=EquipmentScreen(save.state,equipmentTarget,{home:navigationOrigin==="home"});bindEquipment()}else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}}
function go(s){screen=s;render()}
function bindHome(){document.getElementById("openMonsters").onclick=()=>go("monsters");document.getElementById("editHomeParty")?.addEventListener("click",openHomePartyEditor);document.getElementById("openRest")?.addEventListener("click",openRest);document.getElementById("openGacha")?.addEventListener("click",openGacha);document.getElementById("openSettings").onclick=()=>go("settings");document.getElementById("openExplore").onclick=()=>{const max=save.state.player.maxFloor;app.insertAdjacentHTML("beforeend",Modal("探索開始",`<p>再開する階層を選択</p><input id="floorSelect" type="number" min="1" max="${max}" value="${max}"><p class="muted">1〜${max}階。宝箱は一度開けたものは復活しません。</p>`,`出発`));const modal=topModal(),button=modal.querySelector("#closeGameModal");button.onclick=()=>{const f=Math.max(1,Math.min(max,Number(modal.querySelector("#floorSelect").value)||max));save.state.player.currentFloor=f;save.state.player.inRun=true;save.save();snapshot=null;modal.remove();go("explore")}};document.getElementById("openEquipment").onclick=()=>go("equipment");detailButtons()}
function bindList(){document.getElementById("backHome").onclick=()=>go("home");const input=document.getElementById("monsterSearch");input.oninput=()=>document.querySelectorAll(".monster-card").forEach(c=>{const m=save.state.monsters.find(x=>x.id===c.querySelector("[data-monster-id]").dataset.monsterId),q=input.value.trim();c.style.display=m.nickname.includes(q)||SPECIES[m.speciesId].name.includes(q)?"grid":"none"});detailButtons()}
function detailButtons(){document.querySelectorAll("[data-monster-id]").forEach(b=>b.onclick=()=>{selected=b.dataset.monsterId;go("detail")})}
function bindDetail(m){document.getElementById("backMonsters").onclick=()=>go("monsters");document.getElementById("releaseMonster")?.addEventListener("click",()=>releaseMonster(m));document.getElementById("toggleFavorite").onclick=()=>{m.favorite=!m.favorite;save.save();render()};document.getElementById("saveNickname").onclick=()=>{const v=document.getElementById("nicknameInput").value.trim();if(v)m.nickname=v.slice(0,12);save.save();render()};document.querySelectorAll("[data-color-id]").forEach(b=>b.onclick=()=>{m.colorId=b.dataset.colorId;save.save();render()})}
function bindSettings(){document.getElementById("backHome").onclick=()=>go("home");document.getElementById("toggleAuto").onclick=()=>{save.state.settings.autoBattle=!save.state.settings.autoBattle;save.save();render()};document.getElementById("toggleMinimap").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();render()};document.getElementById("resetTutorials")?.addEventListener("click",()=>{save.state.settings.tutorialSeen={};save.save();alert("1〜5階のチュートリアルを再表示します")});document.getElementById("resetSave").onclick=()=>{if(confirm("初期化する？")){save.reset();snapshot=null;go("home")}}}


function bindEquipment(){
 document.getElementById("backEquipmentHome").onclick=()=>{const target=navigationOrigin;navigationOrigin="home";go(target)};
 document.getElementById("equipmentTarget").onchange=e=>{equipmentTarget=e.target.value;render()};
 document.getElementById("equipmentSort").onchange=e=>{save.state.settings.equipmentSort=e.target.value;save.save();render()};
 document.querySelectorAll("[data-equipment-slot]").forEach(b=>b.onclick=()=>{save.state.settings.equipmentSlot=b.dataset.equipmentSlot;save.save();render()});
 document.querySelectorAll("[data-equipment-storage]").forEach(b=>b.onclick=()=>{if(b.disabled)return;save.state.settings.equipmentStorage=b.dataset.equipmentStorage;save.save();render()});
 document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equipItem(b.dataset.equip,b.dataset.target,b.dataset.subslot));document.getElementById("autoEquipOne")?.addEventListener("click",()=>{autoEquipMonster(equipmentTarget);save.save();render()});document.getElementById("autoEquipParty")?.addEventListener("click",()=>{save.state.party.forEach(autoEquipMonster);save.save();render()});
 document.querySelectorAll("[data-unequip]").forEach(b=>b.onclick=()=>unequipItem(b.dataset.unequip));
 document.querySelectorAll("[data-favorite-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.favoriteEquipment);if(!i)return;i.favorite=!i.favorite;save.save();render()});
 document.querySelectorAll("[data-lock-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.lockEquipment);if(!i)return;i.locked=!i.locked;save.save();render()});
 document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>sellItem(b.dataset.sell));
 document.querySelectorAll("[data-enhance-equipment]").forEach(b=>b.onclick=()=>enhanceEquipment(b.dataset.enhanceEquipment));
 document.getElementById("bulkSellEquipment")?.addEventListener("click",bulkSellEquipment);
 document.querySelectorAll("[data-take-equipment]").forEach(b=>b.onclick=()=>{const result=takeFromStorage(save.state,b.dataset.takeEquipment,b.dataset.storage);if(!result.ok)return alert(result.message);save.save();render()});
}

function preserveVitals(monster,beforeStats,beforeMp){
 const oldHpMax=Math.max(1,beforeStats.hp),oldMpMax=Math.max(1,beforeMp);
 const hpWasZero=(monster.currentHp??oldHpMax)<=0,mpWasZero=(monster.currentMp??oldMpMax)<=0;
 normalizeEquipmentState();
 const afterStats=calculatedStats(monster),afterMp=maxMp(monster);
 if(hpWasZero)monster.currentHp=0;
 else monster.currentHp=Math.max(1,Math.min(afterStats.hp,Math.round((monster.currentHp??oldHpMax)/oldHpMax*afterStats.hp)));
 if(mpWasZero)monster.currentMp=0;
 else monster.currentMp=Math.max(0,Math.min(afterMp,Math.round((monster.currentMp??oldMpMax)/oldMpMax*afterMp)));
}
function togglePartyMember(id){
 const has=save.state.party.includes(id),m=save.state.monsters.find(x=>x.id===id);
 if(has&&save.state.party.length<=1)return alert("最低1体必要");
 if(!has&&save.state.party.length>=4)return alert("編成は4体まで");
 if(has){
  const beforeStats=m?calculatedStats(m):null,beforeMp=m?maxMp(m):1;
  Object.values(m?.equipment??{}).forEach(itemId=>{const item=save.state.equipment.find(i=>i.id===itemId);if(item)item.equippedBy=null});
  if(m){m.equipment={weaponRight:null,weaponLeft:null,armorBody:null,armorSupport:null,accessoryNeck:null,accessoryFinger:null};preserveVitals(m,beforeStats,beforeMp)}
  save.state.party=save.state.party.filter(x=>x!==id)
 }else save.state.party.push(id);
 save.save()
}
function openHomePartyEditor(){
 const body=`<p class="muted">タップで出撃／控えを切り替え。出撃は1〜4体。</p><div class="party-editor">${save.state.monsters.map(m=>`<button data-home-party-toggle="${m.id}" class="${save.state.party.includes(m.id)?"selected":""}"><span>${SPECIES[m.speciesId].emoji}</span><b>${displayName(m)}</b><small>${save.state.party.includes(m.id)?"出撃中":"控え"} Lv.${m.level}</small></button>`).join("")}</div>`;
 app.insertAdjacentHTML("beforeend",Modal("パーティー編成",body,"確定"));
 document.querySelectorAll("[data-home-party-toggle]").forEach(b=>b.onclick=()=>{togglePartyMember(b.dataset.homePartyToggle);document.querySelector(".game-modal").remove();openHomePartyEditor()});
 topModalButton().onclick=()=>{document.querySelector(".game-modal").remove();render()}
}
function equipItem(itemId,monsterId,subslot){const item=save.state.equipment.find(i=>i.id===itemId),monster=save.state.monsters.find(m=>m.id===monsterId);if(!item||!monster||!subslot)return;if(!save.state.party.includes(monsterId))return alert("控えモンスターには装備できません。");const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster);if(item.equippedBy){const old=save.state.monsters.find(m=>m.id===item.equippedBy);if(old)for(const key of Object.keys(old.equipment??{}))if(old.equipment[key]===item.id)old.equipment[key]=null}const prior=monster.equipment[subslot];if(prior){const oldItem=save.state.equipment.find(i=>i.id===prior);if(oldItem)oldItem.equippedBy=null}monster.equipment[subslot]=item.id;item.equippedBy=monster.id;preserveVitals(monster,beforeStats,beforeMp);save.save();render()}
function autoEquipMonster(monsterId){const monster=save.state.monsters.find(m=>m.id===monsterId);if(!monster||!save.state.party.includes(monsterId))return;const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster),pairs=[["weaponRight","weapon"],["armorBody","armor"],["accessoryNeck","accessory"],["armorSupport","armor"],["accessoryFinger","accessory"],["weaponLeft","weapon"]];for(const [subslot,slot] of pairs){const unlock={armorSupport:25,accessoryFinger:50,weaponLeft:100}[subslot]??1;if(monster.level<unlock)continue;const candidates=save.state.equipment.filter(i=>i.slot===slot&&(!i.equippedBy||i.equippedBy===monsterId)&&!Object.values(monster.equipment??{}).includes(i.id)).sort((a,b)=>equipmentPower(b)-equipmentPower(a));const best=candidates[0];if(!best)continue;const currentId=monster.equipment[subslot],current=save.state.equipment.find(i=>i.id===currentId);if(current&&equipmentPower(current)>=equipmentPower(best))continue;if(current)current.equippedBy=null;monster.equipment[subslot]=best.id;best.equippedBy=monsterId}preserveVitals(monster,beforeStats,beforeMp)}
function unequipItem(itemId){const item=save.state.equipment.find(i=>i.id===itemId);if(!item?.equippedBy)return;const monster=save.state.monsters.find(m=>m.id===item.equippedBy);if(!monster){item.equippedBy=null;save.save();return render()}const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster);for(const key of Object.keys(monster.equipment??{}))if(monster.equipment[key]===item.id)monster.equipment[key]=null;item.equippedBy=null;preserveVitals(monster,beforeStats,beforeMp);save.save();render()}
function sellItem(itemId){
 const item=save.state.equipment.find(i=>i.id===itemId);
 if(!item||item.equippedBy||item.locked)return alert(item?.locked?"ロック中は売却できない":"装備中は売却できない");
 const price=equipmentSellPrice(item);
 if(!confirm(`${item.name}を${price}Gで売却する？`))return;
 save.state.equipment=save.state.equipment.filter(i=>i.id!==itemId);save.state.player.gold+=price;save.save();render();
}

function localDayKey(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
function partyRecoveryNeed(){return save.state.party.reduce((total,id)=>{const m=save.state.monsters.find(x=>x.id===id);if(!m)return total;const st=calculatedStats(m),mp=maxMp(m),hpMissing=Math.max(0,st.hp-(m.currentHp??st.hp)),mpMissing=Math.max(0,mp-(m.currentMp??mp)),ailments=(m.statuses?.length??0)+(m.ailments?.length??0)+(m.status?1:0);return total+hpMissing+mpMissing+ailments*100},0)}
function healParty(){save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id);if(!m)return;m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);m.statuses=[];m.status=null;m.ailments=[]})}
function openRest(){const key=localDayKey(),free=save.state.rest.lastFreeKey!==key,need=partyRecoveryNeed(),cost=Math.max(0,need*5);if(need<=0){app.insertAdjacentHTML("beforeend",Modal("💤 もう元気だよ！","<p>出撃メンバーは全員、HP・MPともに満タンで状態異常もありません。</p>","閉じる"));topModalButton().onclick=closeTopModal;return}app.insertAdjacentHTML("beforeend",Modal("🛏️ 深淵の休息",`<p>出撃メンバーのHP・MP・状態異常を完全回復します。</p><div class="rest-price"><b>${free?"本日1回 無料":`${cost.toLocaleString()}G`}</b><small>回復必要量 ${need.toLocaleString()} / 所持 ${save.state.player.gold.toLocaleString()}G</small></div>`,free?"無料で休む":`${cost.toLocaleString()}Gで休む`));const modal=topModal();modal.querySelector("#closeGameModal").onclick=()=>{if(!free&&save.state.player.gold<cost)return alert("GOLDが足りない");if(!confirm(free?"本日の無料休息を使いますか？":`${cost.toLocaleString()}Gで休息しますか？`))return;if(free)save.state.rest.lastFreeKey=key;else save.state.player.gold-=cost;healParty();save.save();modal.remove();render()}}
function rarityRoll(mode="normal") {const r=Math.random();if(mode==="guaranteed")return r<.08?"LR":r<.32?"SSR":"SR";if(r<.002)return"LR";if(r<.03)return"SSR";if(r<.15)return"SR";if(r<.48)return"R";return"N"}
function summonOne({guaranteedMonster=false,guaranteedRare=false}={}){const isMonster=guaranteedMonster||Math.random()<.30,rarity=rarityRoll(guaranteedRare?"guaranteed":"normal");if(isMonster){const pool=Object.values(SPECIES).filter(s=>s.rarity!=="LR"&&!(s.race==="dragon"&&rarity!=="SSR"&&rarity!=="LR")),speciesId=pool[Math.floor(Math.random()*pool.length)].id,stars={N:1,R:1,SR:2,SSR:3,LR:4}[rarity],m=createMonster(speciesId,{stars,nickname:SPECIES[speciesId].name});m.summonRarity=rarity;save.state.monsters.push(m);return{type:"monster",rarity,name:displayName(m),icon:SPECIES[speciesId].emoji,item:m}}const slot=["weapon","armor","accessory"][Math.floor(Math.random()*3)],item=createEquipment(slot,{rarity});receiveEquipment(save.state,item);return{type:"equipment",rarity,name:item.name,icon:{weapon:"⚔️",armor:"🛡️",accessory:"💍"}[slot],item}}
function openGacha(){const key=localDayKey(),daily=save.state.gacha.lastDailyKey!==key,first=!save.state.gacha.firstTenUsed;const body=`<div class="gacha-menu">${first?'<button data-gacha="first"><b>初回限定 無料10連</b><small>SR以上モンスター1体確定</small></button>':''}<button data-gacha="daily" ${daily?'':'disabled'}><b>1日1回 無料召喚</b><small>${daily?'本日分を引けます':'本日分は召喚済み'}</small></button><button data-gacha="single"><b>単発召喚　💎5</b><small>モンスター30% / 装備70%</small></button><button data-gacha="ten"><b>10連召喚　💎45</b><small>最後の1枠はSR以上</small></button></div>`;app.insertAdjacentHTML("beforeend",Modal("🔮 深淵召喚",body,"閉じる"));document.querySelectorAll("[data-gacha]").forEach(b=>b.onclick=()=>performGacha(b.dataset.gacha));topModalButton().onclick=()=>{const mods=document.querySelectorAll(".game-modal");mods[mods.length-1]?.remove()}}
function performGacha(type){let count=1,cost=0;if(type==="first"){if(save.state.gacha.firstTenUsed)return;count=10;save.state.gacha.firstTenUsed=true}else if(type==="daily"){const key=localDayKey();if(save.state.gacha.lastDailyKey===key)return;save.state.gacha.lastDailyKey=key}else if(type==="single")cost=5;else if(type==="ten"){cost=45;count=10}if(save.state.player.crystals<cost)return alert("魔晶石が足りない");save.state.player.crystals-=cost;const results=[];for(let i=0;i<count;i++){const last=i===count-1;results.push(summonOne({guaranteedMonster:type==="first"&&last,guaranteedRare:(type==="first"||type==="ten")&&last}))}save.save();document.querySelector(".game-modal")?.remove();app.insertAdjacentHTML("beforeend",Modal("召喚結果",`<div class="gacha-results">${results.map(r=>`<div class="rarity-${r.rarity}"><span>${r.icon}</span><b>[${r.rarity}] ${r.name}</b><small>${r.type==="monster"?"モンスター":"装備"} NEW</small></div>`).join("")}</div>${type==="first"?'<p class="muted">編成から新しい仲間を出撃させよう。</p>':''}`,"ホームへ"));topModalButton().onclick=()=>{document.querySelector(".game-modal").remove();render()}}
function enhanceEquipment(id){const item=save.state.equipment.find(i=>i.id===id);if(!item||item.plus>=10)return;const rarityCost={N:80,R:140,SR:260,SSR:480,LR:900}[item.rarity],cost=rarityCost*(item.plus+1);if(save.state.player.gold<cost)return alert(`強化には${cost}G必要`);if(!confirm(`${item.name}を +${item.plus+1}へ強化する？\n費用 ${cost}G`))return;save.state.player.gold-=cost;item.plus++;save.save();render()}
function bulkSellEquipment(){const targets=save.state.equipment.filter(i=>!i.equippedBy&&!i.locked&&!i.favorite&&["N","R"].includes(i.rarity));if(!targets.length)return alert("売却対象がありません");const total=targets.reduce((n,i)=>n+equipmentSellPrice(i),0);if(!confirm(`${targets.length}個を一括売却して ${total}G獲得する？`))return;const ids=new Set(targets.map(i=>i.id));save.state.equipment=save.state.equipment.filter(i=>!ids.has(i.id));save.state.player.gold+=total;save.save();render()}
function releaseMonster(m){if(save.state.party.includes(m.id))return alert("出撃中のモンスターは解放できません");if(m.favorite||m.locked)return alert("お気に入り・ロック中は解放できません");if(save.state.monsters.length<=1)return alert("最後の1体は解放できません");if(!confirm(`${displayName(m)}を解放する？\n魂として魔晶石1個を獲得します。`))return;Object.values(m.equipment??{}).forEach(id=>{const i=save.state.equipment.find(x=>x.id===id);if(i)i.equippedBy=null});save.state.monsters=save.state.monsters.filter(x=>x.id!==m.id);save.state.player.crystals++;save.save();go("monsters")}
function partySynergy(){const counts={};save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean).forEach(m=>{const e=SPECIES[m.speciesId].element??"neutral";counts[e]=(counts[e]??0)+1});const [element,count]=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]??[null,0];if(count<3)return null;const effects={fire:{name:"🔥 火の共鳴",atk:count>=4?.30:.20},water:{name:"💧 水の共鳴",regen:count>=4?.05:.03},dark:{name:"🌑 闇の共鳴",crit:count>=4?20:15},light:{name:"✨ 光の共鳴",def:count>=4?.20:.12},poison:{name:"☠️ 毒の共鳴",atk:count>=4?.18:.10}};return effects[element]?{element,count,...effects[element]}:null}
function clearPartySynergy(){save.state.monsters.forEach(m=>delete m._synergy)}
function bindShop(){
 save.state.shop??={};
 if(save.state.shop.discount==null){
  const roll=Math.random();
  save.state.shop.discount=roll<.01?90:roll<.04?70:roll<.10?50:roll<.24?30:roll<.48?10:0;
  save.save()
 }
 document.getElementById("leaveShop").onclick=()=>{save.state.shop.discount=null;save.save();go("explore")};
 document.querySelectorAll("[data-shop-menu]").forEach(b=>b.onclick=()=>openShopMenu(b.dataset.shopMenu));
}
function shopPrice(base){const d=save.state.shop?.discount??0;return Math.max(1,Math.floor(base*(1-d/100)))}
function openShopMenu(type){
 if(type==="bed")return buyShopItem("bed",180);
 const items=type==="herb"?[
  ["potions","❤️","単体回復薬","HP100回復",160],
  ["partyPotions","💚","全体回復薬","全員HP50回復",520],
  ["statusCures","🩹","状態異常回復・単体","単体の異常解除",300],
  ["partyStatusCures","💨","状態異常回復・全体","全員の異常解除",980],
  ["fullHeals","✨","完全回復薬・単体","HP・MP・異常を全回復",1800],
  ["partyFullHeals","🌟","完全回復薬・全体","全員を完全回復",6500]
 ]:type==="capture"?[
  ["captureCrystals","💎","捕獲結晶","標準捕獲結晶",420],
  ["captureCrystals","💠","捕獲結晶 3個","まとめ買い",1150]
 ]:[
  ["gear-normal","🪵","通常装備召喚","N〜SR中心",900],
  ["gear-advanced","🟣","上級装備召喚","R〜SSR中心",3200],
  ["gear-mythic","🌈","神話装備召喚","SR以上確定",12000]
 ];
 const title=type==="herb"?"🌿 薬草屋":type==="capture"?"💎 捕獲商人":`🎰 装備召喚 ${save.state.shop.discount?`${save.state.shop.discount}%OFF`:""}`;
 const body=`<div class="shop-list">${items.map(([id,icon,name,desc,base])=>{const price=type==="gear"?shopPrice(base):base;return`<button data-shop-buy="${id}" data-shop-price="${price}"><span>${icon}</span><b>${name}</b><small>${desc}</small><em>${price}G</em></button>`}).join("")}</div>`;
 app.insertAdjacentHTML("beforeend",Modal(title,body,"閉じる"));
 document.querySelectorAll("[data-shop-buy]").forEach(b=>b.onclick=()=>buyShopItem(b.dataset.shopBuy,Number(b.dataset.shopPrice)));
 topModalButton().onclick=closeTopModal
}
function buyShopItem(type,cost){
 if(save.state.player.gold<cost)return purchaseResult("購入失敗","GOLDが足りない。");
 save.state.player.gold-=cost;save.state.records.purchases++;
 let title="",body="";
 if(type==="bed"){
  const before=save.state.party.reduce((n,id)=>{const m=save.state.monsters.find(x=>x.id===id);return n+(m.currentHp??calculatedStats(m).hp)},0);
  save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id);m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m)});
  const after=save.state.party.reduce((n,id)=>n+calculatedStats(save.state.monsters.find(x=>x.id===id)).hp,0);
  title="全回復！";body=`パーティーHP ${before} → ${after}`
 }else if(type.startsWith("gear-")){
  const rarity=type==="gear-mythic"?(Math.random()<.15?"LR":"SSR"):type==="gear-advanced"?(Math.random()<.16?"SSR":Math.random()<.55?"SR":"R"):undefined;
  const item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],rarity?{rarity}:{}),receipt=equipmentReceipt(item);
  title=`[${item.rarity}] ${item.name}`;body=`${slotLabel(item.slot)} / ${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}<br>${receipt.message}`
 }else{
  const amount=type==="captureCrystals"&&cost>500?3:1;
  save.state.inventory[type]=(save.state.inventory[type]??0)+amount;
  title="購入完了";body=`${amount}個購入／所持数 ${save.state.inventory[type]}`
 }
 save.save();document.querySelector(".game-modal")?.remove();render();purchaseResult(title,body)
}
function equipmentReceipt(item,options={}){
 const result=receiveEquipment(save.state,item,options);
 return{...result,item,label:`[${item.rarity}] ${item.name}`,slot:slotLabel(item.slot)}
}
function equipmentReceiptText(receipt){
 if(receipt.location==="inventory")return`${receipt.label}（${receipt.slot}）を獲得`;
 if(receipt.location==="reserve")return`${receipt.label}<br>${receipt.message}`;
 if(receipt.location==="bossVault")return`${receipt.label}<br>${receipt.message}`;
 return`${receipt.label}<br>${receipt.message}`;
}
function purchaseResult(title,body){
 app.insertAdjacentHTML("beforeend",Modal(title,`<div class="reward-icon">✨</div><p>${body}</p>`));
 topModalButton().onclick=closeTopModal;
}
function createInputState(){return{pts:new Map(),last:null,pinch:null,drag:false,tap:0}}
function seeded(seed){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296}}
function floorSeed(floor){const seeds=save.state.player.floorSeeds;seeds[floor]??=Math.floor(Math.random()*2147483647);save.save();return seeds[floor]}
function floorConfig(floor,rng){
 const tier=Math.min(9,Math.floor((floor-1)/10));
 const min=11+Math.min(8,tier),max=Math.min(31,17+tier*2);
 let cols=(min+Math.floor(rng()*(max-min+1)))|1,rows=(min+Math.floor(rng()*(max-min+1)))|1;
 const roll=rng();
 const shape=roll<.66?"cave":roll<.78?"maze":roll<.88?"open":roll<.94?"square":"ring";
 if(shape==="open"){cols=Math.max(cols,19);rows=Math.max(rows,19)}
 if(shape==="square"){const s=(Math.min(cols,rows)|1);cols=s;rows=s}
 return{cols,rows,shape}
}
function maze(){
 const floor=save.state.player.currentFloor,rng=seeded(floorSeed(floor));
 if(floor%10===0){
  const cols=15,rows=23,tiles=Array.from({length:rows},()=>Array(cols).fill(1)),cx=Math.floor(cols/2);
  for(let y=2;y<rows-2;y++)for(let x=cx-1;x<=cx+1;x++)tiles[y][x]=0;
  for(let y=2;y<=7;y++)for(let x=2;x<cols-2;x++)tiles[y][x]=0;
  const start={x:cx,y:rows-3},boss={x:cx,y:5,active:true},exit={x:cx,y:2};
  return{cols,rows,shape:"bossCorridor",tiles,start,exit,shop:null,boss,chests:[],treasureRoom:false,steps:0,nextEncounter:999999,encountering:false}
 }
 const cfg=floorConfig(floor,rng),{cols,rows,shape}=cfg;
 let tiles=Array.from({length:rows},()=>Array(cols).fill(1));
 const inside=(x,y)=>x>0&&y>0&&x<cols-1&&y<rows-1;
 const carveBlob=(x,y,r=1)=>{for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)if(inside(x+xx,y+yy)&&xx*xx+yy*yy<=r*r+r)tiles[y+yy][x+xx]=0};
 const center={x:Math.floor(cols/2),y:Math.floor(rows/2)};
 if(shape==="open"||shape==="square"){
  const margin=shape==="square"?2:1+Math.floor(rng()*3);
  for(let y=margin;y<rows-margin;y++)for(let x=margin;x<cols-margin;x++)tiles[y][x]=0;
  const holes=Math.floor(cols*rows*(shape==="open"?.035:.018));
  for(let i=0;i<holes;i++){const x=2+Math.floor(rng()*(cols-4)),y=2+Math.floor(rng()*(rows-4));if(rng()<.7)tiles[y][x]=1}
 }else if(shape==="ring"){
  for(let y=2;y<rows-2;y++)for(let x=2;x<cols-2;x++){const dx=(x-center.x)/(cols*.42),dy=(y-center.y)/(rows*.42),d=dx*dx+dy*dy;if(d<1&&d>.22)tiles[y][x]=0}
  carveBlob(center.x,2,2);carveBlob(center.x,rows-3,2)
 }else if(shape==="maze"){
  function carve(x,y){tiles[y][x]=0;for(const[dx,dy]of[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>rng()-.5)){const nx=x+dx,ny=y+dy;if(inside(nx,ny)&&tiles[ny][nx]){tiles[y+dy/2][x+dx/2]=0;carve(nx,ny)}}}
  carve(1,1);
  for(let i=0;i<Math.floor(cols*rows/45);i++){const x=1+Math.floor(rng()*(cols-2)),y=1+Math.floor(rng()*(rows-2));if(!tiles[y][x])carveBlob(x,y,rng()>.75?2:1)}
 }else{
  let x=center.x,y=center.y;carveBlob(x,y,2);const target=Math.floor(cols*rows*(.38+rng()*.18));let guard=target*25;
  while(tiles.flat().filter(v=>v===0).length<target&&guard-->0){const d=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(rng()*4)];x=Math.max(2,Math.min(cols-3,x+d[0]));y=Math.max(2,Math.min(rows-3,y+d[1]));carveBlob(x,y,rng()<.08?2:rng()<.32?1:0)}
  const rooms=2+Math.floor(rng()*5);
  for(let i=0;i<rooms;i++){const tx=2+Math.floor(rng()*(cols-4)),ty=2+Math.floor(rng()*(rows-4));carveBlob(tx,ty,1+Math.floor(rng()*3));while(x!==tx||y!==ty){if(rng()<.5&&x!==tx)x+=Math.sign(tx-x);else if(y!==ty)y+=Math.sign(ty-y);else x+=Math.sign(tx-x);carveBlob(x,y,rng()<.25?1:0)}}
 }
 const cells=[];for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(!tiles[y][x])cells.push({x,y});
 if(cells.length<2){tiles[1][1]=0;tiles[rows-2][cols-2]=0;cells.push({x:1,y:1},{x:cols-2,y:rows-2})}
 const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y),startCell=cells[Math.floor(rng()*cells.length)],exit=cells.reduce((a,c)=>distance(c,startCell)>distance(a,startCell)?c:a,cells[0]);
 const reserved=c=>distance(c,startCell)<=4||distance(c,exit)<=4,candidates=cells.filter(c=>!reserved(c)),used=new Set([`${startCell.x},${startCell.y}`,`${exit.x},${exit.y}`]);
 const pick=()=>{const available=candidates.filter(c=>!used.has(`${c.x},${c.y}`)),pool=available.length?available:candidates.length?candidates:cells,p={...pool[Math.floor(rng()*pool.length)]};used.add(`${p.x},${p.y}`);return p};
 const opened=save.state.player.openedChests[floor]??[],chests=[],treasureRoom=rng()<.025,count=treasureRoom?6+Math.floor(rng()*3):(rng()<.16?0:rng()<.72?1:2);
 for(let i=0;i<count;i++){const roll=rng(),kind=treasureRoom?(roll>.55?"radiant":"cabinet"):roll>.96?"radiant":roll>.78?"cabinet":roll>.25?"box":"apple",locked=kind==="radiant"&&rng()<.45,mimic=treasureRoom&&rng()<.5,emoji=mimic?"🧰":locked?"🔒":{apple:"🪎",box:"📦",cabinet:"🗃️",radiant:"✨📦"}[kind],p=pick();chests.push({...p,id:`${floor}-${i}`,kind,emoji,locked,mimic,open:opened.includes(`${floor}-${i}`)})}
 const shopChance=floor%10===0?.35:.09,shop=rng()<shopChance?{...pick(),active:true}:null;if(shop)save.state.player.nextShopFloor=floor+3+Math.floor(rng()*8);
 const boss=floor%10===0?{...pick(),active:true}:null;
 return{cols,rows,shape,tiles,start:startCell,exit:{...exit},shop,boss,chests,treasureRoom,steps:0,nextEncounter:10+Math.floor(rng()*23),encountering:false}
}
function currentSnapshot(){game.world.encountering=false;game.player.path=[];game.player.p=0;game.player.rx=game.player.x;game.player.ry=game.player.y;return{world:game.world,player:game.player,cameraData:{x:game.camera.x,y:game.camera.y,z:game.camera.z,ox:game.camera.ox,oy:game.camera.oy,manual:game.camera.manual}}}
function bindExplore(){
 const canvas=document.getElementById("gameCanvas"),r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
 canvas.width=r.width*d;canvas.height=r.height*d;
 const mini=document.getElementById("miniMap");mini.width=132*d;mini.height=132*d;
 game=snapshot??{world:maze(),player:null,camera:null,paused:false,running:true,input:createInputState()};
 game.input=createInputState();game.player??=new Entity(game.world.start.x,game.world.start.y);game.world.encountering=false;game.player.path=[];game.player.p=0;
 if(!Number.isFinite(game.player.x)||!Number.isFinite(game.player.y)){game.player.x=game.world.start.x;game.player.y=game.world.start.y}
 game.player.rx=game.player.x;game.player.ry=game.player.y;game.camera=new Camera(canvas);
 if(snapshot?.cameraData)Object.assign(game.camera,snapshot.cameraData);else game.camera.reset(game.player.x*TILE,game.player.y*TILE);
 game.camera.clamp(game.world);game.ctx=canvas.getContext("2d");game.running=true;game.paused=false;bindInput(canvas);game.last=performance.now();requestAnimationFrame(loop);
 bindMovableMapToggle();bindExploreMonsterLongPress();showFloorTutorial();
 document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world)};
 document.getElementById("pauseParty").onclick=openPartyEditor;
 document.getElementById("fieldEquipment").onclick=()=>{snapshot=currentSnapshot();stopGame();navigationOrigin="explore";go("equipment")};
 document.getElementById("pauseItems").onclick=openFieldItems;
 document.getElementById("returnHome").onclick=()=>{if(confirm(`${save.state.player.currentFloor}階から帰還する？\n次回は到達済みの階を選んで再開できます。`)){stopGame();snapshot=null;save.state.player.inRun=false;save.save();go("home")}}
}
function showFloorTutorial(){
 const floor=save.state.player.currentFloor;if(floor<1||floor>5||save.state.settings.tutorialSeen?.[floor])return;
 const tutorials={1:["戦闘の基本","まずは歩いて敵と遭遇しよう。『たたかう』『スキル』『ガード』を使い分け、スライムLv.1を倒して最初のレベルを上げよう。"],2:["捕獲","敵はHPを減らすほど捕獲しやすくなる。捕獲結晶には限りがあるので、欲しい相手を弱らせてから使おう。"],3:["編成","捕まえた仲間は『編成』から出撃できる。最大4体まで。倒れた仲間にはEXPが入らず、生存者へ再分配される。"],4:["装備","武器・防具・アクセで能力が変わる。『装備』の自動装備も使えるが、役割に合わせた手動調整も強力。"],5:["複数の敵","この階から敵が2体で現れることがある。敵をタップして攻撃対象を変更し、危険な相手から倒そう。"]};
 const [title,body]=tutorials[floor];game.paused=true;setTimeout(()=>{app.insertAdjacentHTML("beforeend",Modal(`${floor}階チュートリアル：${title}`,`<p>${body}</p><p class="muted">この説明は初回だけ表示され、設定から再確認できます。</p>`,`探索開始`));topModalButton().onclick=()=>{save.state.settings.tutorialSeen[floor]=true;save.save();document.querySelector(".game-modal").remove();game.paused=false}},120)
}
function exploreMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const st=calculatedStats(m),need=expNeed(m),remain=Math.max(0,need-m.exp),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");app.insertAdjacentHTML("beforeend",Modal(`${SPECIES[m.speciesId].emoji} ${displayName(m)}`,`<div class="explore-detail"><p><b>Lv.${m.level}　★${m.stars}　+${m.plus}</b></p><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${SPECIES[m.speciesId].race}族 / ${SPECIES[m.speciesId].role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p><b>EXP ${m.exp.toLocaleString()} / ${need.toLocaleString()}</b><br><small>次のレベルまであと ${remain.toLocaleString()}</small></p><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,`閉じる`));topModalButton().onclick=()=>{const mods=document.querySelectorAll(".game-modal");mods[mods.length-1]?.remove()}}
function bindExploreMonsterLongPress(){document.querySelectorAll("[data-explore-monster]").forEach(el=>el.onclick=()=>exploreMonsterDetail(el.dataset.exploreMonster))}
function bindMovableMapToggle(){const b=document.getElementById("miniMapToggle"),stage=document.querySelector(".explore-stage");if(!b||!stage)return;let timer=null,drag=false,offset={x:0,y:0};const place=e=>{const r=stage.getBoundingClientRect(),br=b.getBoundingClientRect(),x=Math.max(4,Math.min(r.width-br.width-4,e.clientX-r.left-offset.x)),y=Math.max(4,Math.min(r.height-br.height-4,e.clientY-r.top-offset.y));b.style.left=`${x}px`;b.style.top=`${y}px`;b.style.right="auto";save.state.settings.mapTogglePosition={x:Math.round(x),y:Math.round(y)}};b.onpointerdown=e=>{const br=b.getBoundingClientRect();offset={x:e.clientX-br.left,y:e.clientY-br.top};timer=setTimeout(()=>{drag=true;navigator.vibrate?.(20);b.classList.add("dragging");b.setPointerCapture?.(e.pointerId)},420)};b.onpointermove=e=>{if(drag)place(e)};b.onpointerup=e=>{clearTimeout(timer);if(drag){place(e);save.save();drag=false;b.classList.remove("dragging");return}save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();b.textContent=save.state.settings.minimapVisible?"MAP ON":"MAP OFF"};b.onpointercancel=()=>{clearTimeout(timer);drag=false;b.classList.remove("dragging")}}
function itemCount(type){return save.state.inventory[type]??0}
function openFieldItems(){
 game.paused=true;const items=[["potions","❤️","単体回復","HP100回復"],["partyPotions","💚","全体回復","全員HP50回復"],["statusCures","🩹","状態異常回復・単体","単体の状態異常を解除"],["partyStatusCures","💨","状態異常回復・全体","全員の状態異常を解除"],["fullHeals","✨","全回復＋異常回復・単体","単体を完全回復"],["partyFullHeals","🌟","全回復＋異常回復・全体","全員を完全回復"]],targets=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);let targetId=targets[0]?.id;
 const body=`<p class="muted">タップで使用対象を選択／長押しで詳細</p><div class="modal-party-vitals selectable">${targets.map((m,i)=>{const st=calculatedStats(m);return`<button class="${i===0?"selected":""}" data-field-target="${m.id}"><b>${displayName(m)} Lv.${m.level}</b><small>HP ${m.currentHp??st.hp}/${st.hp}　MP ${m.currentMp??maxMp(m)}/${maxMp(m)}</small></button>`}).join("")}</div><div class="field-item-grid">${items.filter(([id])=>itemCount(id)>0).map(([id,icon,name,desc])=>`<button data-field-item="${id}"><span>${icon}</span><b>${name}</b><small>${desc}</small><em>×${itemCount(id)}</em></button>`).join("")||'<div class="empty">使用できるアイテムを持っていません</div>'}</div>`;
 app.insertAdjacentHTML("beforeend",Modal("持ち物",body,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-field-target]").forEach(el=>{let timer,moved=false;const cancel=()=>{clearTimeout(timer);timer=null};el.onpointerdown=()=>{moved=false;timer=setTimeout(()=>{timer=null;exploreMonsterDetail(el.dataset.fieldTarget)},520)};el.onpointermove=()=>moved=true;el.onpointerup=()=>{if(timer&&!moved){cancel();targetId=el.dataset.fieldTarget;modal.querySelectorAll("[data-field-target]").forEach(x=>x.classList.toggle("selected",x===el))}else cancel()};el.onpointercancel=cancel});modal.querySelectorAll("[data-field-item]").forEach(b=>b.onclick=()=>useFieldItem(b.dataset.fieldItem,targetId));modal.querySelector("#closeGameModal").onclick=()=>{modal.remove();game.paused=false}
}
function clearAilments(m){m.statuses=[];m.status=null;m.ailments=[]}
function useFieldItem(type,targetId){if(itemCount(type)<=0)return;const target=save.state.monsters.find(m=>m.id===targetId),party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean),single=["potions","statusCures","fullHeals"].includes(type);if(single&&!target)return;const list=single?[target]:party;if(single&&target.currentHp<=0)return alert("戦闘不能の仲間には使用できません");const hasAilment=m=>(m.statuses?.length??0)||(m.ailments?.length??0)||m.status;const usable=type==="potions"?target.currentHp<calculatedStats(target).hp:type==="partyPotions"?list.some(m=>m.currentHp>0&&m.currentHp<calculatedStats(m).hp):type==="statusCures"?hasAilment(target):type==="partyStatusCures"?list.some(hasAilment):type==="fullHeals"?(target.currentHp<calculatedStats(target).hp||target.currentMp<maxMp(target)||hasAilment(target)):list.some(m=>m.currentHp>0&&(m.currentHp<calculatedStats(m).hp||m.currentMp<maxMp(m)||hasAilment(m)));if(!usable)return alert("もう元気だよ！");if(type==="potions")target.currentHp=Math.min(calculatedStats(target).hp,target.currentHp+100);if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>m.currentHp=Math.min(calculatedStats(m).hp,m.currentHp+50));if(type==="statusCures"||type==="partyStatusCures")list.forEach(clearAilments);if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});save.state.inventory[type]--;save.save();closeTopModal();snapshot=currentSnapshot();stopGame();render()}
function openPartyEditor(){game.paused=true;const body=`<p class="muted">その場で自由に編成できます。捕獲直後の仲間もすぐ使用可能。</p><div class="party-editor">${save.state.monsters.map(m=>`<button data-party-toggle="${m.id}" class="${save.state.party.includes(m.id)?"selected":""}"><span>${SPECIES[m.speciesId].emoji}</span><b>${displayName(m)}</b><small>Lv.${m.level}</small></button>`).join("")}</div>`;app.insertAdjacentHTML("beforeend",Modal("フィールド編成",body,"閉じる"));document.querySelectorAll("[data-party-toggle]").forEach(b=>b.onclick=()=>{togglePartyMember(b.dataset.partyToggle);document.querySelector(".game-modal").remove();openPartyEditor()});topModalButton().onclick=()=>{document.querySelector(".game-modal").remove();snapshot=currentSnapshot();stopGame();render()}}
function enemyLevelForFloor(floor){const band=Math.floor((floor-1)/10),base=band*10+1,jumps=[0,0,1,2,3,5,7,9],variance=jumps[Math.floor(Math.random()*jumps.length)]-(Math.random()<.28?Math.floor(Math.random()*4):0),milestone=floor%50===1&&floor>1?8:floor%25===1&&floor>1?4:0;return Math.max(1,base+Math.floor((floor-1)%10*.58)+variance+milestone)}
function speciesPoolForFloor(floor){
 const entries=Object.values(SPECIES).filter(s=>s.minFloor<=floor&&s.minFloor>=Math.max(1,floor-42));
 const safe=entries.filter(s=>floor>=s.minFloor);
 return safe.length?safe:[SPECIES.slime]
}
function randomEnemy(){const floor=save.state.player.currentFloor;if(floor===1)return{speciesId:"slime",level:1,boss:false,equipped:false,gear:null};if(floor>=2&&Math.random()<.006)return{speciesId:"baby_slime",level:Math.max(1,enemyLevelForFloor(floor)),boss:false,equipped:false,gear:null,rareExp:true};const pool=speciesPoolForFloor(floor).filter(s=>s.id!=="baby_slime"),picked=pool[Math.floor(Math.random()*pool.length)],speciesId=picked.id,equipped=floor>=6&&Math.random()<.11,gear=equipped?createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]):null;return{speciesId,level:enemyLevelForFloor(floor),boss:false,equipped,gear}}
function randomEnemyGroup(){const floor=save.state.player.currentFloor;if(floor<=4)return[randomEnemy()];let count=1,r=Math.random();if(floor<10){if(r<.12)count=2}else if(floor<50){if(r<.03)count=3;else if(r<.25)count=2}else{if(r<.08)count=3;else if(r<.35)count=2}return Array.from({length:count},randomEnemy)}
function floorBossEnemy(){const floor=save.state.player.currentFloor,pool=speciesPoolForFloor(Math.max(floor,10)).filter(s=>s.minFloor<=floor);const speciesId=(pool[Math.floor(seeded(floorSeed(floor)+991)()*pool.length)]??SPECIES.slime).id;const cycle=Math.floor(floor/10);return{speciesId,level:Math.max(20,cycle*20+5+Math.floor(Math.random()*6)),boss:true}}
function loop(now){
 if(!game?.running)return;
 const dt=Math.min(.05,(now-game.last)/1000||0);game.last=now;
 if(!game.paused)update(dt);
 if(!game?.running)return;
 draw();
 requestAnimationFrame(loop)
}
async function beginEncounter(enemyOverride=null){
 if(!game?.running||game.world.encountering)return;
 game.world.encountering=true;
 game.player.path=[];
 game.paused=true;
 const canvas=document.getElementById("gameCanvas");
 const stage=document.querySelector(".explore-stage");
 if(canvas)canvas.classList.add("encounter-shake");
 const fx=document.createElement("div");
 fx.className="encounter-transition";
 fx.innerHTML='<div class="encounter-vortex"></div><div class="encounter-flash"></div>';
 (stage??document.body).appendChild(fx);
 await wait(430);
 fx.classList.add("is-pulling");
 if(canvas)canvas.classList.add("encounter-pull");
 await wait(920);
 fx.classList.add("is-dark");
 await wait(350);
 if(!game)return;
 activeEnemy=enemyOverride??randomEnemyGroup();
 snapshot=currentSnapshot();
 stopGame();
 startBattle(activeEnemy);
 setTimeout(()=>fx.remove(),500)
}
function update(dt){
 if(game.world.encountering)return;
 if(game.player.move(dt,7.5)){
  game.world.steps++;
  for(const c of game.world.chests)if(!c.open&&c.x===game.player.x&&c.y===game.player.y){openChest(c);return}
  if(game.world.boss&&game.player.x===game.world.boss.x&&game.player.y===game.world.boss.y){
   game.player.path=[];game.paused=true;const floor=save.state.player.currentFloor,lines=["ここまで辿り着いたか。だが、ここから先は通さん。","幾度来ようと同じこと。力の差を刻んでやる。","その覚悟、本物かどうか試してやろう。","この階層で朽ちるがいい。","よく来た。ワシを越えられると思うなら、剣を取れ。"];const bossInfo=floorBossEnemy(),name=SPECIES[bossInfo.speciesId].name;app.insertAdjacentHTML("beforeend",Modal(`第${floor}階層の支配者`, `<p>${lines[Math.floor(Math.random()*lines.length)]}</p><p><b>${name} Lv.${bossInfo.level}</b></p>`,"戦う"));const modal=topModal();modal.querySelector("#closeGameModal").onclick=()=>{modal.remove();game.paused=false;beginEncounter(bossInfo)};return
  }
  if(game.world.shop&&game.player.x===game.world.shop.x&&game.player.y===game.world.shop.y){
   stopGame();
   snapshot=currentSnapshot();
   save.state.player.nextShopFloor=save.state.player.currentFloor+3+Math.floor(Math.random()*5);
   save.save();screen="shop";render();return
  }
  if(game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){
   if(save.state.player.currentFloor%10===0&&game.world.boss){
    game.player.path=[];game.paused=true;app.insertAdjacentHTML("beforeend",Modal("まだ先へは進めない","<p>この階層の支配者が道を封じている。</p>","戻る"));const modal=topModal();modal.querySelector("#closeGameModal").onclick=()=>{modal.remove();game.paused=false};return
   }
   stopGame();snapshot=null;save.state.player.currentFloor++;
   save.state.player.maxFloor=Math.max(save.state.player.maxFloor,save.state.player.currentFloor);
   save.save();go("explore");return
  }
  if(game.world.steps>=game.world.nextEncounter){
   game.world.steps=0;
   game.world.nextEncounter=8+Math.floor(Math.random()*24);
   beginEncounter();return
  }
 }
 game.camera.follow(game.player.rx*TILE,game.player.ry*TILE);
 game.camera.clamp(game.world)
}
function openChest(c){const floor=save.state.player.currentFloor;if(c.locked&&(save.state.inventory.abyssKeys??0)<=0){game.player.path=[];return pauseModal("🔒 鍵付き宝箱","<p>深淵の鍵が必要だ。</p><p class="muted">鍵は強敵やごく稀な敵ドロップから入手できます。</p>")}if(c.locked)save.state.inventory.abyssKeys--;c.open=true;save.state.player.openedChests[floor]??=[];if(!save.state.player.openedChests[floor].includes(c.id))save.state.player.openedChests[floor].push(c.id);save.state.records.chests++;if(c.mimic){save.save();game.player.path=[];pauseModal("！？","<p>宝箱が牙を剥いた！</p>");setTimeout(()=>{closeTopModal();game.paused=false;beginEncounter({speciesId:"mimic",level:Math.max(enemyLevelForFloor(floor)+12,Math.round(floor*1.5)),boss:false,equipped:true,gear:createEquipment("accessory",{rarity:"SR"})})},650);return}let title="宝箱",body="";if(c.kind==="apple"){save.state.inventory.potions++;title="🪎 深淵の果実";body="回復薬を1個獲得"}else if(c.kind==="box"){if(Math.random()<.5){const gold=80+floor*12;save.state.player.gold+=gold;const keyDrop=defeated.some(e=>!e.boss&&Math.random()<.002)||(firstBoss&&floor%50===0);if(keyDrop)save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;body=`${gold}Gを獲得`}else{const item=createEquipment("weapon"),receipt=equipmentReceipt(item);body=equipmentReceiptText(receipt)}}else{const rarity=c.locked?(Math.random()<.25?"LR":"SSR"):c.kind==="radiant"?(Math.random()<.35?"LR":"SSR"):(Math.random()<.35?"SSR":"SR"),item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],{rarity}),receipt=equipmentReceipt(item);title=c.locked?"🔓 鍵付き宝箱":c.kind==="radiant"?"✨ 輝く宝箱":"🗃️ 古い収納箱";body=`${equipmentReceiptText(receipt)}<br>${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}`}save.save();pauseModal(title,body)}
function draw(){const c=game.ctx,w=game.world;c.fillStyle="#120c18";c.fillRect(0,0,game.canvas.width,game.canvas.height);for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){const p=game.camera.world(x*TILE,y*TILE),s=TILE*game.camera.z;c.fillStyle=w.tiles[y][x]?"#21182a":"#6a4a7f";c.fillRect(p.x,p.y,s+1,s+1)}emoji(w.exit,"🕳️");if(w.shop)emoji(w.shop,"🚪");if(w.boss)emoji(w.boss,"👹",true);w.chests.forEach(x=>!x.open&&emoji(x,x.emoji,x.kind==="radiant"));emoji({x:game.player.rx,y:game.player.ry},"😈",true);drawMini()}
function emoji(o,t,glow=false){const p=game.camera.world(o.x*TILE,o.y*TILE),pulse=glow?1+Math.sin(performance.now()/170)*.12:1;game.ctx.save();if(glow){game.ctx.shadowColor="#ffe36f";game.ctx.shadowBlur=18}game.ctx.font=`${28*game.camera.z*pulse}px sans-serif`;game.ctx.textAlign="center";game.ctx.fillText(t,p.x+TILE*game.camera.z/2,p.y+TILE*game.camera.z/2);game.ctx.restore()}
function drawMini(){
 const m=document.getElementById("miniMap");
 if(!m||!game?.running)return;
 const w=game.world;
 if(!save.state.settings.minimapVisible){m.style.opacity=0;return}
 m.style.opacity=1;
 const c=m.getContext("2d"),cell=Math.min(m.width/w.cols,m.height/w.rows),ox=(m.width-w.cols*cell)/2,oy=(m.height-w.rows*cell)/2;
 c.fillStyle="#130c18";c.fillRect(0,0,m.width,m.height);
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){
  c.fillStyle=w.tiles[y][x]?"#24192d":"#b178d0";
  c.fillRect(ox+x*cell,oy+y*cell,cell,cell)
 }
 c.fillStyle="#ff5d66";c.fillRect(ox+w.exit.x*cell,oy+w.exit.y*cell,cell,cell);
 c.fillStyle="#5dff82";c.fillRect(ox+game.player.x*cell,oy+game.player.y*cell,cell,cell)
}
function path(w,s,g){
 const goalIsExit=g.x===w.exit.x&&g.y===w.exit.y;
 const walk=(x,y)=>{
  if(x<0||y<0||x>=w.cols||y>=w.rows||w.tiles[y][x])return false;
  if(!goalIsExit&&x===w.exit.x&&y===w.exit.y)return false;
  return true
 };
 const key=p=>p.x+","+p.y;
 if(!walk(g.x,g.y))return[];
 const q=[{x:s.x,y:s.y}],seen=new Set([key(s)]),prev=new Map();
 while(q.length){
  const c=q.shift();
  if(c.x===g.x&&c.y===g.y)break;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const n={x:c.x+dx,y:c.y+dy},k=key(n);
   if(walk(n.x,n.y)&&!seen.has(k)){seen.add(k);prev.set(k,c);q.push(n)}
  }
 }
 if(!seen.has(key(g)))return[];
 const out=[];let cur=g;
 while(cur.x!==s.x||cur.y!==s.y){out.unshift(cur);cur=prev.get(key(cur));if(!cur)return[]}
 return out
}
function bindInput(c){game.canvas=c;if(!game.input||!(game.input.pts instanceof Map))game.input=createInputState();const i=game.input;i.pts.clear();i.pinch=null;i.drag=false;const scalePoint=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*(c.width/r.width),y:(e.clientY-r.top)*(c.height/r.height)}};const finish=e=>{i.pts.delete(e.pointerId);if(i.pts.size<2)i.pinch=null;if(!i.pts.size)i.drag=false};c.onpointerdown=e=>{if(game.paused)return;c.setPointerCapture?.(e.pointerId);const q=scalePoint(e);i.pts.set(e.pointerId,{...q,sx:q.x,sy:q.y});if(i.pts.size===2){const [a,b]=[...i.pts.values()];i.pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:game.camera.z};i.drag=true}};c.onpointermove=e=>{const p=i.pts.get(e.pointerId);if(!p||game.paused)return;const q=scalePoint(e),dx=q.x-p.x,dy=q.y-p.y;p.x=q.x;p.y=q.y;if(i.pts.size>=2){const [a,b]=[...i.pts.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);if(!i.pinch)i.pinch={distance:dist,zoom:game.camera.z};const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},before=game.camera.screen(center.x,center.y);game.camera.z=Math.max(.45,Math.min(2.25,i.pinch.zoom*dist/Math.max(1,i.pinch.distance)));const after=game.camera.world(before.x,before.y);game.camera.ox+=center.x-after.x;game.camera.oy+=center.y-after.y;game.camera.manual=true;game.camera.clamp(game.world);i.drag=true;return}if(Math.hypot(p.x-p.sx,p.y-p.sy)>7)i.drag=true;if(i.drag){game.camera.pan(dx,dy);game.camera.clamp(game.world)}};c.onpointerup=e=>{const p=i.pts.get(e.pointerId),wasMulti=i.pinch,drag=i.drag;finish(e);if(!p||drag||wasMulti||game.paused)return;const q=scalePoint(e),w=game.camera.screen(q.x,q.y),g={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)};game.player.setPath(path(game.world,game.player,g))};c.onpointercancel=c.onlostpointercapture=finish}
function stopGame(){if(!game)return;game.running=false;const c=game.canvas;if(c)c.onpointerdown=c.onpointermove=c.onpointerup=c.onpointercancel=c.onlostpointercapture=null}
function pauseModal(title,body){game.paused=true;app.insertAdjacentHTML("beforeend",Modal(title,body));topModalButton().onclick=()=>{document.querySelector(".game-modal").remove();game.paused=false}}


function battleSpeed(){return save.state.settings.battleSpeed??1}
function wait(ms){return new Promise(r=>setTimeout(r,Math.max(55,ms/battleSpeed())))}
function battleTarget(target){
 if(target==="enemy")return document.querySelector(".enemy-combatant.targeted")??document.querySelector(".enemy-combatant");if(String(target).startsWith("enemy-"))return document.getElementById(`enemy-${target}`);
 if(target==="party")return document.querySelector(".battle-party");
 return document.getElementById(`ally-${target}`);
}
async function animateAttack(from,skill=false){
 const el=battleTarget(from);if(!el)return;
 el.classList.remove("fx-lunge","fx-skill-lunge");void el.offsetWidth;
 el.classList.add(skill?"fx-skill-lunge":"fx-lunge");
 await wait(skill?300:220);
 el.classList.remove("fx-lunge","fx-skill-lunge");
}
async function animateHit(target,critical=false){
 const el=battleTarget(target);if(!el)return;
 el.classList.remove("fx-hit","fx-critical-hit");void el.offsetWidth;
 el.classList.add(critical?"fx-critical-hit":"fx-hit");
 await wait(260);
 el.classList.remove("fx-hit","fx-critical-hit");
}
async function animateDefeat(target,captured=false){
 const el=battleTarget(target);if(!el)return;
 el.classList.add(captured?"fx-captured":"fx-defeat");
 await wait(500);
}
async function floatText(text,target,type){
 const layer=document.getElementById("battleFxLayer"),el=battleTarget(target);
 if(!layer||!el)return;
 const lr=layer.getBoundingClientRect(),r=el.getBoundingClientRect(),n=document.createElement("div");
 n.className=`floating-number ${type}`;n.textContent=text;
 n.style.left=`${r.left-lr.left+r.width/2}px`;n.style.top=`${r.top-lr.top+r.height*.35}px`;
 layer.appendChild(n);await wait(560);n.remove();
}
function makeBattleEnemy(e,index=0){const sp=SPECIES[e.speciesId],enemy=createEnemyBattleState(sp,e,save.state.player.currentFloor);enemy.id=`enemy-${Date.now()}-${index}-${Math.random().toString(36).slice(2,7)}`;if(e.equipped&&e.gear){enemy.gear=e.gear;enemy.name=`⚔️ ${enemy.name}`;enemy.atk+=e.gear.stats.atk??0;enemy.def+=e.gear.stats.def??0;enemy.spd+=e.gear.stats.spd??0;enemy.maxHp+=e.gear.stats.hp??0;enemy.hp=enemy.maxHp}return enemy}
function saveBattleCheckpoint(){if(!battle)return;save.state.activeBattle={floor:save.state.player.currentFloor,enemies:battle.enemies,turn:battle.turn,turnQueue:battle.turnQueue,queueIndex:battle.queueIndex,targetEnemyId:battle.targetEnemyId,auto:battle.auto,guards:battle.guards,cooldowns:battle.cooldowns,enemyStatuses:battle.enemyStatuses,log:battle.log};save.save()}
function clearBattleCheckpoint(){delete save.state.activeBattle;save.save()}
function resumeSavedBattle(){const data=save.state.activeBattle;if(!data?.enemies?.length)return false;const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);if(!party.length)return false;save.state.player.currentFloor=data.floor??save.state.player.currentFloor;battle={...data,party,species:SPECIES,busy:false,skillMenu:false,itemMenu:false,enemy:data.enemies[0],...createBattleRulesState(party),cooldowns:data.cooldowns??{},enemyStatuses:data.enemyStatuses??{},log:data.log??[]};battle.turnQueue=data.turnQueue??[];battle.queueIndex=data.queueIndex??0;battle.targetEnemyId=data.targetEnemyId??aliveEnemies(battle)[0]?.id??null;screen="explore";renderBattle();setTimeout(()=>continueBattleFlow(),250);return true}
function startBattle(encounter){const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean),synergy=partySynergy();party.forEach(m=>{m._synergy=synergy?{atk:synergy.atk??0,def:synergy.def??0,spd:synergy.spd??0,crit:synergy.crit??0}:{};const hp=calculatedStats(m).hp,mp=maxMp(m);if(m.currentHp==null)m.currentHp=hp;if(m.currentMp==null)m.currentMp=mp;m.currentHp=Math.min(m.currentHp,hp);m.currentMp=Math.min(m.currentMp,mp)});const entries=Array.isArray(encounter)?encounter:[encounter],enemies=entries.map(makeBattleEnemy);battle={enemies,enemy:enemies[0],targetEnemyId:enemies[0]?.id,party,species:SPECIES,turn:1,busy:false,auto:save.state.settings.autoBattle,guards:{},skillMenu:false,itemMenu:false,...createBattleRulesState(party)};buildTurnQueue(battle);if(synergy)addBattleLog(battle,`${synergy.name}が発動！`);addBattleLog(battle,`行動順：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);saveBattleCheckpoint();renderBattle();setTimeout(()=>continueBattleFlow(),360/battleSpeed())}
function actor(){return currentAlly(battle)}
function renderBattle(){document.querySelector(".battle-screen")?.remove();app.insertAdjacentHTML("beforeend",BattleScreen(battle,save.state.inventory,save.state.settings));document.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>command(b.dataset.command));document.querySelectorAll("[data-skill-id]").forEach(b=>b.onclick=()=>command("skill",b.dataset.skillId));document.querySelectorAll("[data-battle-item]").forEach(b=>b.onclick=()=>openBattleItemTarget(b.dataset.battleItem));document.querySelectorAll("[data-battle-detail]").forEach(b=>b.onclick=()=>showBattleMonsterDetail(b.dataset.battleDetail));document.querySelectorAll("[data-enemy-target]").forEach(b=>b.onclick=()=>{if(battle.busy)return;battle.targetEnemyId=b.dataset.enemyTarget;renderBattle()});document.querySelector(".battle-arena")?.addEventListener("click",e=>{if(!battle.auto||e.target.closest("button,.combatant"))return;battle.auto=false;save.state.settings.autoBattle=false;saveBattleCheckpoint();showToast("手動操作へ切り替えました");renderBattle()});const closeSkill=document.getElementById("closeSkillMenu");if(closeSkill)closeSkill.onclick=()=>{battle.skillMenu=false;renderBattle()};const closeItem=document.getElementById("closeItemMenu");if(closeItem)closeItem.onclick=()=>{battle.itemMenu=false;renderBattle()};document.getElementById("battleSpeed").onclick=()=>{const sp=battleSpeed();save.state.settings.battleSpeed=sp===1?2:sp===2?4:1;save.save();renderBattle()};document.getElementById("toggleBattleAuto").onclick=()=>{battle.auto=!battle.auto;save.state.settings.autoBattle=battle.auto;save.save();renderBattle();if(battle.auto&&!battle.busy)continueBattleFlow()};document.getElementById("escapeBattle").onclick=async()=>{if(battle.busy||currentTurnEntry(battle)?.type!=="ally")return;battle.busy=true;if(Math.random()<.65){clearBattleCheckpoint();document.querySelector(".battle-screen").remove();activeEnemy=null;screen="explore";render()}else{addBattleLog(battle,"逃走に失敗した");await floatText("逃走失敗","party","miss");battle.busy=false;await finishCurrentAction()}}}
function openBattleItemTarget(type){if((save.state.inventory[type]??0)<=0)return;const single=["potions","statusCures","fullHeals"].includes(type);if(!single)return useBattleItem(type,null);const cards=battle.party.map(m=>{const st=calculatedStats(m);return`<button data-battle-item-target="${m.id}" ${m.currentHp<=0?"disabled":""}><b>${displayName(m)} Lv.${m.level}</b><small>HP ${m.currentHp}/${st.hp}　MP ${m.currentMp}/${maxMp(m)}</small></button>`}).join("");app.insertAdjacentHTML("beforeend",Modal("使用対象を選択",`<div class="modal-party-vitals selectable">${cards}</div>`,`やめる`));const modal=topModal();modal.querySelectorAll("[data-battle-item-target]").forEach(b=>b.onclick=()=>{modal.remove();useBattleItem(type,b.dataset.battleItemTarget)});modal.querySelector("#closeGameModal").onclick=()=>modal.remove()}
async function useBattleItem(type,targetId){if(battle.busy)return;const a=actor();if(!a)return;const party=battle.party,target=party.find(m=>m.id===targetId),single=["potions","statusCures","fullHeals"].includes(type),list=single?[target]:party;if(single&&!target)return;if(single&&target.currentHp<=0)return alert("戦闘不能の仲間には使用できません");const hasAilment=m=>(m.statuses?.length??0)||(m.ailments?.length??0)||m.status;const usable=type==="potions"?target.currentHp<calculatedStats(target).hp:type==="partyPotions"?list.some(m=>m.currentHp>0&&m.currentHp<calculatedStats(m).hp):type==="statusCures"?hasAilment(target):type==="partyStatusCures"?list.some(hasAilment):type==="fullHeals"?(target.currentHp<calculatedStats(target).hp||target.currentMp<maxMp(target)||hasAilment(target)):list.some(m=>m.currentHp>0&&(m.currentHp<calculatedStats(m).hp||m.currentMp<maxMp(m)||hasAilment(m)));if(!usable)return alert("もう元気だよ！");battle.busy=true;battle.itemMenu=false;save.state.inventory[type]--;if(type==="potions")target.currentHp=Math.min(calculatedStats(target).hp,target.currentHp+100);if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>m.currentHp=Math.min(calculatedStats(m).hp,m.currentHp+50));if(type==="statusCures"||type==="partyStatusCures")list.forEach(clearAilments);if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});addBattleLog(battle,`${displayName(a)}：アイテム使用`);saveBattleCheckpoint();renderBattle();await wait(220/battleSpeed());battle.busy=false;await finishCurrentAction()}
function showBattleMonsterDetail(id){
 const m=battle.party.find(x=>x.id===id);if(!m)return;const st=calculatedStats(m),need=expNeed(m),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");
 app.insertAdjacentHTML("beforeend",Modal(`${SPECIES[m.speciesId].emoji} ${displayName(m)}`,`<div class="battle-detail"><p><b>Lv.${m.level} ★${m.stars} +${m.plus}</b></p><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${SPECIES[m.speciesId].race}族 / ${SPECIES[m.speciesId].role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p>EXP ${m.exp}/${need}</p><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/need*100)}%"></i></div><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,"閉じる"));topModalButton().onclick=closeTopModal
}
async function command(type,skillId=null){
 if(battle.busy)return;
 const entry=currentTurnEntry(battle),a=actor();
 if(entry?.type!=="ally"||!a)return;
 battle.busy=true;
 const s=calculatedStats(a),e=selectedEnemy(battle);if(!e){battle.busy=false;return win(false,null)};battle.enemy=e;

 if(type==="attack"){
  addBattleLog(battle,`${displayName(a)}：たたかう`);await animateAttack(a.id);
  if(Math.random()<.06)await floatText("MISS",e.id,"miss");
  else{
   const critical=Math.random()<Math.min(.35,.08+(s.spd??0)*.005);
   const base=Math.max(1,Math.floor(s.atk*(.9+Math.random()*.2)-e.def*.4));
   const raw=critical?Math.floor(base*1.7):base,d=Math.max(1,Math.floor(raw*enemyDamageMultiplier(e)));e.hp=Math.max(0,e.hp-d);
   await animateHit(e.id,critical);await floatText(`${critical?"CRITICAL ":""}-${d}`,e.id,critical?"critical":"damage");
  }
 }

 if(type==="skill"&&!skillId){battle.busy=false;battle.skillMenu=true;renderBattle();return}

 if(type==="skill"&&skillId){
  const skill=skillById(skillId),cd=cooldownRemaining(battle,a.id,skillId);
  if(!learnedSkills(a).some(x=>x.id===skillId)||!canUseSkill(a,skill,cd)){battle.busy=false;return alert(cd>0?`あと${cd}ラウンド使用できない`:"MPが足りない")}
  a.currentMp-=skill.mp;setSkillCooldown(battle,a.id,skill);battle.skillMenu=false;addBattleLog(battle,`${displayName(a)}：${skill.name}`);
  if(skill.type==="selfHeal"){
   const h=Math.max(1,Math.floor(s.hp*skill.heal));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal");
  }else if(skill.type==="allHeal"){
   const healed=[];battle.party.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp,h=Math.max(1,Math.floor(max*skill.heal)),before=m.currentHp;m.currentHp=Math.min(max,m.currentHp+h);healed.push(m.currentHp-before)});
   await floatText(`全体 +${Math.max(...healed)}`,"party","heal");
  }else{
   await animateAttack(a.id,true);const hits=skill.hits??1;let total=0;
   for(let i=0;i<hits&&e.hp>0;i++){
    const critical=Math.random()<Math.min(.45,.1+(skill.critBonus??0)+(s.spd??0)*.004),raw=skillDamage(s,e,skill,critical),d=Math.max(1,Math.floor(raw*enemyDamageMultiplier(e)));
    e.hp=Math.max(0,e.hp-d);total+=d;await animateHit(e.id,critical);await floatText(`${critical?"CRITICAL ":""}-${d}`,e.id,critical?"critical":"skill")
   }
   if(skill.type==="drain"){const h=Math.max(1,Math.floor(total*skill.drain));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal")}
   if(skill.status&&e.hp>0&&Math.random()<skill.status.chance){applyEnemyStatus(battle,skill.status,e.id);addBattleLog(battle,`${e.name}は${skill.status.name}状態になった`);await floatText(skill.status.name,e.id,skill.status.id)}
  }
 }

 if(type==="guard"){
  battle.guards[a.id]=true;addBattleLog(battle,`${displayName(a)}：ガード`);await floatText("GUARD",a.id,"guard")
 }

 if(type==="item"){battle.busy=false;battle.auto=false;save.state.settings.autoBattle=false;battle.itemMenu=true;save.save();renderBattle();return}

 if(type==="capture"){
  if(e.boss){const floor=save.state.player.currentFloor,defeated=(save.state.player.bossKills[floor]??0)>0;if(!defeated){battle.busy=false;return alert("初回の階層ボスは捕獲できません。まず撃破してください。")}}
  if(save.state.inventory.captureCrystals<=0){battle.busy=false;return alert("捕獲結晶がない")}
  save.state.inventory.captureCrystals--;addBattleLog(battle,"捕獲を試みた");
  const chance=e.boss?Math.max(.01,Math.min(.05,.01+(1-e.hp/e.maxHp)*.04)):Math.max(.08,Math.min(.88,.2+(1-e.hp/e.maxHp)*.55+(Math.max(...battle.party.map(m=>m.level+m.stars*2+m.plus))-e.level)*.012));
  await floatText(`捕獲 ${Math.round(chance*100)}%`,e.id,"capture");await wait(500);
  if(Math.random()<chance){const m=createMonster(e.speciesId,{level:e.level});save.state.monsters.push(m);save.state.records.captures++;e.captured=true;e.hp=0;save.save();await animateDefeat(e.id,true);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(true,m);addBattleLog(battle,`${e.name}を捕獲した`)}
 }

 saveBattleCheckpoint();renderBattle();await wait(260/battleSpeed());
 if(e.hp<=0){await animateDefeat(e.id);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(false,null)}
 battle.busy=false;
 await finishCurrentAction();
}
function chooseEnemyTarget(){
 const alive=battle.party.filter(monster=>monster.currentHp>0);
 if(!alive.length)return null;
 const guarded=alive.filter(monster=>battle.guards[monster.id]);
 if(guarded.length&&Math.random()<.45)return guarded[Math.floor(Math.random()*guarded.length)];
 return alive[Math.floor(Math.random()*alive.length)];
}
async function enemyTurn(){
 if(battle.busy)return;
 const entry=currentTurnEntry(battle);
 if(entry?.type!=="enemy")return continueBattleFlow();
 const target=chooseEnemyTarget();if(!target)return lose();
 battle.busy=true;
 const e=currentEnemy(battle);if(!e){battle.busy=false;return finishCurrentAction()}battle.enemy=e;const action=chooseEnemyAction(e);addBattleLog(battle,`${e.name}：${e.intent}`);

 if(action===ENEMY_ACTIONS.guard){
  await floatText("GUARD",e.id,"guard");
 }else if(action===ENEMY_ACTIONS.charge){
  await floatText("CHARGE",e.id,"charge");
 }else if(action===ENEMY_ACTIONS.heal){
  const h=enemyHealAmount(e);e.hp=Math.min(e.maxHp,e.hp+h);await floatText(`+${h}`,e.id,"heal");
 }else if(action===ENEMY_ACTIONS.enrage){
  e.atk=Math.floor(e.atk*1.18);e.def=Math.floor(e.def*1.08);await floatText("ENRAGE",e.id,"enrage");await animateHit(e.id,true);
 }else{
  const s=calculatedStats(target);await animateAttack(e.id,action===ENEMY_ACTIONS.power);
  if(action!==ENEMY_ACTIONS.power&&Math.random()<.05)await floatText("MISS",target.id,"miss");
  else{
   const guard=Boolean(battle.guards[target.id]),critical=Math.random()<(e.enraged?.13:.08),multiplier=enemyAttackMultiplier(e,action);
   let d=Math.max(1,Math.floor((e.atk-s.def*.45)*multiplier*(guard?.45:1)));if(critical)d=Math.floor(d*1.55);
   target.currentHp=Math.max(0,target.currentHp-d);
   addBattleLog(battle,`${displayName(target)}に${d}ダメージ`);
   await animateHit(target.id,critical);await floatText(`${action===ENEMY_ACTIONS.power?"強撃 ":""}${critical?"CRITICAL ":""}-${d}`,target.id,critical?"critical":"enemy");
   if(target.currentHp<=0)await animateDefeat(target.id);
  }
 }

 saveBattleCheckpoint();renderBattle();await wait(300/battleSpeed());
 battle.busy=false;
 if(!battle.party.some(m=>m.currentHp>0))return lose();
 await finishCurrentAction();
}
async function finishCurrentAction(){
 advanceQueue(battle);
 if(queueFinished(battle))return endRound();
 renderBattle();
 await wait(180/battleSpeed());
 return continueBattleFlow();
}
async function endRound(){
 battle.busy=true;
 const statusResults=processEnemyStatuses(battle);
 for(const result of statusResults){addBattleLog(battle,`${result.enemy.name}に${result.name} ${result.damage}ダメージ`);renderBattle();await floatText(`-${result.damage}`,result.enemy.id,result.id)}
 tickCooldowns(battle);
 battle.guards={};
 for(const e of(battle.enemies??[]).filter(x=>x.hp<=0))await animateDefeat(e.id);if(!aliveEnemies(battle).length)return win(false,null)
 if(!battle.party.some(m=>m.currentHp>0))return lose();
 battle.turn++;
 buildTurnQueue(battle);
 addBattleLog(battle,`ROUND ${battle.turn}：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 battle.busy=false;saveBattleCheckpoint();renderBattle();
 await wait(260/battleSpeed());
 return continueBattleFlow();
}
async function continueBattleFlow(){
 if(!battle||battle.busy)return;
 skipInvalidEntries(battle);
 if(queueFinished(battle))return endRound();
 const entry=currentTurnEntry(battle);
 renderBattle();
 if(entry?.type==="enemy")return enemyTurn();
 if(entry?.type==="ally"&&battle.auto){await wait(220/battleSpeed());return command("attack")}
}
function expNeed(m){return expNeedFor(m)}
function win(caught,m){
 const defeated=(battle.enemies??[battle.enemy]).filter(Boolean),floor=save.state.player.currentFloor,boss=defeated.find(e=>e.boss),firstBoss=!!boss&&!save.state.player.bossRewards[floor];
 const gold=defeated.reduce((sum,e)=>sum+(e.boss?(firstBoss?80+e.level*14:28+e.level*7):16+e.level*5),0);
 save.state.player.gold+=gold;
 save.state.records.kills+=defeated.filter(e=>!e.captured).length;
 const baseGain=defeated.reduce((sum,e)=>{
  if(e.boss)return sum+(firstBoss?Math.round(110+e.level*28):Math.round(24+e.level*8));
  if(e.rareExp)return sum+Math.round(100+e.level*22);
  const difficulty=(e.gear?1.35:1)*(e.level>floor+4?1.2:1);
  return sum+Math.max(6,Math.round((10+e.level*4.4)*difficulty))
 },0);
 const totalExp=baseGain*battle.party.length;
 const survivors=battle.party.filter(monster=>monster.currentHp>0);
 const share=survivors.length?Math.floor(totalExp/survivors.length):0;
 let remainder=survivors.length?totalExp%survivors.length:0;

 const progress=battle.party.map(monster=>{
  const alive=monster.currentHp>0;
  const before={level:monster.level,exp:monster.exp,need:expNeed(monster),stats:{...calculatedStats(monster)},hp:monster.currentHp,mp:monster.currentMp};
  const gain=alive?share+(remainder-->0?1:0):0;
  monster.exp+=gain;
  let levels=0;

  while(monster.exp>=expNeed(monster)){
   monster.exp-=expNeed(monster);
   monster.level++;
   levels++;
   monster.currentHp=calculatedStats(monster).hp;
   monster.currentMp=Math.min(maxMp(monster),monster.currentMp+2);
  }

  return{ x:monster,before,gain,levels,need:expNeed(monster),alive,afterStats:{...calculatedStats(monster)} };
 });

 let drop=null,dropReceipt=null;
 const geared=defeated.find(e=>e.gear);
 if(geared&&Math.random()<.18){drop={...geared.gear,id:crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,equippedBy:null,createdAt:new Date().toISOString()};dropReceipt=equipmentReceipt(drop)}else if(Math.random()<.12){drop=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]);dropReceipt=equipmentReceipt(drop)}

 clearPartySynergy();clearBattleCheckpoint();
 activeEnemy=null;
 document.querySelector(".battle-screen")?.remove();

 const result=`<div class="victory-title">VICTORY</div><div class="reward-summary"><b>+${gold}G</b><small>総EXP ${totalExp} / 生存 ${survivors.length}体で分配${firstBoss?"・初回ボス撃破ボーナス":""}</small>${drop?`<b>[${drop.rarity}] ${drop.name}（${slotLabel(drop.slot)}）</b><small>${dropReceipt.message}</small>`:""}${keyDrop?`<b>🗝️ 深淵の鍵を獲得</b>`:""}${caught?`<b>${m.nickname}を捕獲！</b>`:""}</div><div class="exp-results compact">${progress.map(p=>{const hpMax=p.afterStats.hp,mpMax=maxMp(p.x),remaining=Math.max(0,p.need-p.x.exp),diff=k=>p.afterStats[k]-(p.before.stats[k]??0);return`<div class="${p.alive?"":"exp-defeated"} ${p.levels?"level-up-card":""}"><span>${SPECIES[p.x.speciesId].emoji}</span><section><b>${displayName(p.x)} ${p.levels?`Lv.${p.before.level} → Lv.${p.x.level} <em>LEVEL UP!</em>`:`Lv.${p.x.level}`}</b><div class="result-vitals"><small>HP ${p.x.currentHp}/${hpMax}</small><small>MP ${p.x.currentMp}/${mpMax}</small><small>${p.alive?`次まであと${remaining}EXP`:"戦闘不能：EXP 0"}</small></div><i class="result-exp"><u style="width:${Math.min(100,p.x.exp/p.need*100)}%"></u></i>${p.levels?`<div class="level-gains"><span>HP ${p.before.stats.hp} → ${p.afterStats.hp} <strong>+${diff("hp")}</strong></span><span>ATK ${p.before.stats.atk} → ${p.afterStats.atk} <strong>+${diff("atk")}</strong></span><span>DEF ${p.before.stats.def} → ${p.afterStats.def} <strong>+${diff("def")}</strong></span><span>SPD ${p.before.stats.spd} → ${p.afterStats.spd} <strong>+${diff("spd")}</strong></span></div>`:""}</section></div>`}).join("")}</div>`;

 if(boss){battle.enemy=boss;save.state.player.bossKills[floor]=(save.state.player.bossKills[floor]??0)+1;if(snapshot?.world)snapshot.world.boss=null;if(firstBoss)return showBossRewards(result)}
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"戦闘結果",result,"探索へ"));
 topModalButton().onclick=()=>{
  document.querySelector(".game-modal").remove();
  screen="explore";
  render();
 };
}
function showBossRewards(result){const floor=save.state.player.currentFloor,species=battle.enemy.speciesId,sp=SPECIES[species],weapon=createEquipment("weapon",{rarity:"LR"});weapon.name=`${sp.name}の王装`;const options=[{id:"weapon",icon:"⚔️",title:weapon.name,desc:`限定LR武器 / ${Object.entries(weapon.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" ")}`},{id:"boss",icon:sp.emoji,title:`${sp.name}を仲間にする`,desc:`Lv.${battle.enemy.level}のボス個体`},{id:"crystal",icon:"💎",title:`魔晶石 ×${80+floor*4}`,desc:"育成・ガチャ用の大量資源"},{id:"supply",icon:"🗃️",title:"深淵遠征セット",desc:`捕獲結晶×${5+Math.floor(floor/10)} / 回復薬×5`}];app.insertAdjacentHTML("beforeend",`<div class="game-modal"><div class="game-modal-card boss-reward"><div>${result}</div><h2>運命の4択</h2><p class="muted">中身を見て、ひとつだけ選択。選び直しはできません。</p><div class="boss-reward-grid">${options.map(o=>`<button data-boss-reward="${o.id}"><span>${o.icon}</span><b>${o.title}</b><small>${o.desc}</small></button>`).join("")}</div></div></div>`);document.querySelectorAll("[data-boss-reward]").forEach(b=>b.onclick=()=>{if(!confirm(`${b.querySelector("b").textContent}を選ぶ？\nこの階の他の報酬は入手できません。`))return;const id=b.dataset.bossReward;if(id==="weapon")receiveEquipment(save.state,weapon,{bossReward:true});if(id==="boss")save.state.monsters.push(createMonster(species,{level:battle.enemy.level,stars:3,nickname:`覇 ${sp.name}`}));if(id==="crystal")save.state.player.crystals+=80+floor*4;if(id==="supply"){save.state.inventory.captureCrystals+=5+Math.floor(floor/10);save.state.inventory.potions+=5}save.state.player.bossRewards[floor]=id;save.save();document.querySelector(".game-modal").remove();screen="explore";render()})}

function lose(){
 clearPartySynergy();const lost=Math.floor(save.state.player.gold*.25);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;
 battle.party.forEach(m=>{m.currentHp=1;m.currentMp=0;clearAilments(m)});clearBattleCheckpoint();snapshot=null;document.querySelector(".battle-screen")?.remove();alert(`全滅！ ${lost}G失った`);go("home")
}
if(!resumeSavedBattle())render();
