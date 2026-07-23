import{SaveService}from"./services/SaveService.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{SPECIES}from"./data/species.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{HomeScreen}from"./ui/screens/HomeScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{MonsterListScreen}from"./ui/screens/MonsterListScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{MonsterDetailScreen}from"./ui/screens/MonsterDetailScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{SettingsScreen}from"./ui/screens/SettingsScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{ExploreScreen}from"./ui/screens/ExploreScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{BattleScreen}from"./ui/screens/BattleScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{Modal}from"./ui/components/Modal.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{createMonster,displayName,calculatedStats,TRAITS,expNeedFor,limitBreakGrowth,affectionBonuses}from"./models/Monster.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{createEquipment,equipmentPower,equipmentStatMultiplier}from"./models/Equipment.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{equipmentExpNeed,equipmentMaterialExp,enhancementMaterialCandidates,consumeEquipmentMaterials,projectEquipmentGrowth}from"./services/EquipmentEnhancement.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{recordWeaponKill,weaponMasteryDamageMultiplier,weaponMasterySummary}from"./services/WeaponMastery.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{normalizeSeriesMastery,recordSeriesBattle,seriesMasteryBonusForMonster,seriesMasterySummary}from"./services/SeriesMastery.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{receiveEquipment,takeFromStorage,equipmentSellPrice,slotLabel}from"./services/EquipmentStorage.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{RARITY_ORDER,equipmentStatLabel}from"./data/equipment.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{EQUIPMENT_SERIES}from"./data/equipmentSeries.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{aggregateAffixes}from"./data/equipmentAffixes.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{EquipmentScreen}from"./ui/screens/EquipmentScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{ShopScreen}from"./ui/screens/ShopScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{SkillScreen}from"./ui/screens/SkillScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{Ending1000Screen}from"./ui/screens/Ending1000Screen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{SecondWorldIntroScreen}from"./ui/screens/SecondWorldIntroScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{worldPresentationForFloor,shouldPlaySecondWorldIntro,markSecondWorldEntered}from"./core/WorldSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{randomEventForFloor,markRandomEventResolved,randomEventCosts}from"./core/SecondWorldEventSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{shouldSpawnSecondWorldElite,createEliteEncounter,applyEliteModifiers,recordEliteEncounter,recordEliteDefeat,eliteRewards}from"./core/SecondWorldEliteSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{shouldPlayTenGodFirstContact,tenGodContactChoices,resolveTenGodFirstContact}from"./core/TenGodContactSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{TenGodContactScreen}from"./ui/screens/TenGodContactScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{maxMp,learnedSkills,allLearnedSkills,equipSkill,skillById,canUseSkill,effectiveSkillMpCost,skillDamage,affixOutgoingDamageMultiplier,chooseAutoSkill,skillProgressFor,recordSkillUse}from"./battle/SkillSystem.js?v=0.9.15-alpha.29-phase10-7-affix-audit";
import{ENEMY_ACTIONS,createEnemyBattleState,chooseEnemyAction,enemyDamageMultiplier,enemyHealAmount,enemyAttackMultiplier,specialActionMultiplier}from"./battle/EnemyAI.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{createBattleRulesState,cooldownRemaining,setSkillCooldown,tickCooldowns,addBattleLog,applyEnemyStatus,processEnemyStatuses,applyBattleEffect,effectValue,hasEffect,clearNegativeAllyEffects,tickBattleEffects,processAllyEffects}from"./battle/BattleRules.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{buildTurnQueue,currentTurnEntry,currentAlly,currentEnemy,aliveEnemies,selectedEnemy,advanceQueue,queueFinished,skipInvalidEntries}from"./battle/TurnSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{dangerConfig}from"./core/DangerSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{bossLevelForFloor}from"./core/EnemyScalingSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{biomeForFloor,biomeProgress,recordBiomeFloor,recordBiomeEncounter,recordBiomeChest,recordBiomeBoss}from"./data/biomes.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{WORLD_MAX_FLOOR,TEAM_BATTLE_UNLOCK_FLOOR,ENDGAME_BOSSES,normalizeEndgameState,dailyTeamAttempts,createTeamBattleEncounter,shouldTriggerEmergency,createEmergencyEncounter,recordEmergencyResult,awardEmergencyFragments,emergencyFragmentStatus,craftEndgameEquipment,endgamePreludeOptions,resolveEndgamePrelude,applyPreludeToEncounter,endgameContractStatus,attemptEndgameContract,hasCleared1000,mark1000FloorCleared,worldRegionForFloor}from"./core/EndgameSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{beginManualExpedition,recordManualFloorClear,claimManualReturn,abandonManualExpedition,idleReturnPreview,claimIdleReturn,RETURN_RARITY_RATES,returnRewardGrade}from"./core/ReturnRewardSystem.js?v=0.9.15-alpha.39-return-rank-drop-rates";

const TILE=48,COLS=31,ROWS=31,app=document.getElementById("app"),save=new SaveService();
let screen="home",selected=null,equipmentTarget=null,skillTarget=null,skillSlotSelection=0,game=null,battle=null,snapshot=null,activeEnemy=null,navigationOrigin="home";
let secondWorldIntroPlaying=false;
let tenGodContactPlaying=false;
let monsterManage={editing:false,selected:new Set()},equipmentManage={editing:false,selected:new Set()};
let partyEditorState={search:"",element:"all",status:"all",sort:"rarity",direction:"desc"};
function topModal(){const mods=document.querySelectorAll(".game-modal");return mods[mods.length-1]??null}
function topModalButton(){return topModal()?.querySelector("[data-modal-primary]")??null}
function closeTopModal(){topModal()?.remove()}
function showToast(text){document.querySelector(".game-toast")?.remove();const el=document.createElement("div");el.className="game-toast";el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1400)}
let lastSaveErrorNotice=0;window.addEventListener("abyss-save-error",event=>{const now=Date.now();if(now-lastSaveErrorNotice<5000)return;lastSaveErrorNotice=now;const quota=Boolean(event.detail?.quota),message=quota?"セーブ容量が上限に達しました。不要な装備やモンスターを整理してください。":"セーブに失敗しました。空き容量を確認して、画面を閉じずに再度操作してください。";showToast("⚠️ "+message);setTimeout(()=>{if(document.querySelector("[data-save-error-modal]"))return;app.insertAdjacentHTML("beforeend",Modal("⚠️ セーブ失敗",`<div data-save-error-modal><p><b>${message}</b></p><p class="muted">直前まで正常に保存されていたデータは維持されています。現在の変更は保存されていない可能性があります。</p></div>`,`確認`));topModalButton().onclick=closeTopModal},50)});
let lastCapacityNotice={save:0,equipment:0,keys:0};window.addEventListener("abyss-save-success",event=>{const now=Date.now(),bytes=Math.max(0,Number(event.detail?.bytes)||0),equipmentTotal=(save.state.equipment?.length??0)+(save.state.reserveEquipment?.length??0)+(save.state.bossEquipmentVault?.length??0),keys=Math.max(0,Number(save.state.inventory?.abyssKeys)||0);save.state.flags??={};save.state.flags.abyssKeyExchangePreviewUnlocked=keys>=250;if(bytes>=4500000&&now-lastCapacityNotice.save>60000){lastCapacityNotice.save=now;showToast("⚠️ セーブ容量が4.5MBを超えています。装備整理を強く推奨します")}else if(bytes>=4000000&&now-lastCapacityNotice.save>60000){lastCapacityNotice.save=now;showToast("⚠️ セーブ容量が4MBを超えました。装備を整理してください")}if(equipmentTotal>=900&&now-lastCapacityNotice.equipment>60000){lastCapacityNotice.equipment=now;showToast("⚠️ 装備が900個以上あります。セーブ保護のため整理してください")}else if(equipmentTotal>=700&&now-lastCapacityNotice.equipment>60000){lastCapacityNotice.equipment=now;showToast("⚠️ 装備が700個以上あります")}if(keys>=500&&now-lastCapacityNotice.keys>60000){lastCapacityNotice.keys=now;showToast("🔑 深淵の鍵がかなり余っています（500個以上）")}else if(keys>=250&&now-lastCapacityNotice.keys>60000){lastCapacityNotice.keys=now;showToast("🔑 深淵の鍵が250個以上あります")}});
async function playSecondWorldIntro(){
 if(secondWorldIntroPlaying||!shouldPlaySecondWorldIntro(save.state))return false;
 secondWorldIntroPlaying=true;stopGame();document.querySelector(".second-world-intro")?.remove();
 app.insertAdjacentHTML("beforeend",SecondWorldIntroScreen());const overlay=document.querySelector(".second-world-intro");if(!overlay){secondWorldIntroPlaying=false;return false}
 requestAnimationFrame(()=>overlay.classList.add("is-visible"));
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));await wait(500);
 for(const line of overlay.querySelectorAll("[data-second-world-line]")){line.classList.add("is-visible");await wait(850)}
 overlay.querySelector("[data-second-world-title]")?.classList.add("is-awakened");await wait(1100);
 const enter=overlay.querySelector("[data-second-world-enter]");enter.classList.add("is-visible");
 await new Promise(resolve=>enter.addEventListener("click",resolve,{once:true}));
 markSecondWorldEntered(save.state);save.save();overlay.classList.add("is-closing");await wait(650);overlay.remove();secondWorldIntroPlaying=false;screen="explore";render();return true;
}


async function playTenGodFirstContact(){
 if(tenGodContactPlaying||!game||!shouldPlayTenGodFirstContact(save.state))return false;
 tenGodContactPlaying=true;game.paused=true;document.querySelector(".ten-god-contact")?.remove();
 app.insertAdjacentHTML("beforeend",TenGodContactScreen(tenGodContactChoices()));
 const overlay=document.querySelector(".ten-god-contact"),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 if(!overlay){tenGodContactPlaying=false;game.paused=false;return false}
 requestAnimationFrame(()=>overlay.classList.add("is-visible"));await wait(500);
 for(const line of overlay.querySelectorAll("[data-ten-god-line]")){line.classList.add("is-visible");await wait(900)}
 overlay.querySelector("[data-ten-god-choices]")?.classList.add("is-visible");
 const choiceId=await new Promise(resolve=>overlay.querySelectorAll("[data-ten-god-choice]").forEach(button=>button.addEventListener("click",()=>resolve(button.dataset.tenGodChoice),{once:true})));
 const result=resolveTenGodFirstContact(save.state,choiceId,{recoverParty:fullyRecoverParty});save.save();
 overlay.classList.add("is-resolved");const content=overlay.querySelector(".ten-god-contact-content");
 content.innerHTML=`<small>CONTACT RECORDED</small><div class="ten-god-contact-sigil">◉</div><p class="ten-god-voice is-visible">${result.message}</p><button type="button" class="primary" data-ten-god-close>探索へ戻る</button>`;
 await new Promise(resolve=>content.querySelector("[data-ten-god-close]").addEventListener("click",resolve,{once:true}));
 overlay.classList.add("is-closing");await wait(600);overlay.remove();tenGodContactPlaying=false;game.paused=false;return true;
}

function secondWorldEventChoiceBody(event){
 const costs=randomEventCosts(event,event.floor);
 const descriptions={
  "buy-key":`ゴールド ${costs.keyGold?.toLocaleString()??0}G`,
  "buy-rest":`魔晶石 ${costs.restCrystals??0}個`,
  "seal":`魔晶石 ${costs.sealCrystals??0}個`
 };
 return`<div class="second-world-event"><div class="second-world-event-icon">${event.icon}</div><p>${event.text}</p><div class="second-world-event-choices">${event.choices.map(choice=>`<button type="button" data-second-world-choice="${choice.id}"><b>${choice.label}</b><small>${descriptions[choice.id]??choice.description}</small></button>`).join("")}</div></div>`;
}
function resolveSecondWorldRandomEvent(event,choice){
 const floor=event.floor,costs=randomEventCosts(event,floor),party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);
 let result="何も起こらなかった。",elite=false;
 if(event.id==="abyss-altar"&&choice==="offer"){let lost=0;party.filter(m=>(m.currentHp??calculatedStats(m).hp)>1).forEach(m=>{const max=calculatedStats(m).hp,damage=Math.max(1,Math.floor(max*.2));m.currentHp=Math.max(1,(m.currentHp??max)-damage);lost+=damage});const gain=2+Math.floor((floor-1000)/250);save.state.player.crystals+=gain;result=`生命力を${lost}失い、魔晶石を${gain}個得た。`}
 else if(event.id==="abyss-altar"&&choice==="pray"){party.filter(m=>(m.currentHp??0)>0).forEach(m=>{const st=calculatedStats(m);m.currentHp=Math.min(st.hp,(m.currentHp??st.hp)+Math.max(1,Math.floor(st.hp*.25)));m.currentMp=Math.min(maxMp(m),(m.currentMp??maxMp(m))+Math.max(1,Math.floor(maxMp(m)*.25)))});result="祭壇の火が揺らぎ、パーティーのHP・MPが回復した。"}
 else if(event.id==="lost-merchant"&&choice==="buy-key"){if(save.state.player.gold<costs.keyGold)return{ok:false,message:`ゴールドが足りない。必要：${costs.keyGold.toLocaleString()}G`};save.state.player.gold-=costs.keyGold;save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;result="顔のない商人から、深淵の鍵を1個受け取った。"}
 else if(event.id==="lost-merchant"&&choice==="buy-rest"){if(save.state.player.crystals<costs.restCrystals)return{ok:false,message:`魔晶石が足りない。必要：${costs.restCrystals}個`};save.state.player.crystals-=costs.restCrystals;party.forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});result="黒い香が燃え尽き、パーティーは完全回復した。"}
 else if(event.id==="abyss-crystal"&&choice==="harvest"){const gain=1+Math.floor(((floor*7)%4));save.state.player.crystals+=gain;result=`深淵結晶から魔晶石を${gain}個採取した。`}
 else if(event.id==="abyss-crystal"&&choice==="break"){const gold=650+Math.floor((floor-1000)*1.5);save.state.player.gold+=gold;if(game)game.world.nextEncounter=Math.min(game.world.nextEncounter,game.world.steps+2);result=`結晶を砕き、${gold.toLocaleString()}Gを得た。遠くで何かが目覚めた……。`}
 else if(event.id==="warped-rift"&&choice==="challenge"){result="裂け目の向こうから、強大な魔物が現れた。";elite=true}
 else if(event.id==="warped-rift"&&choice==="seal"){if(save.state.player.crystals<costs.sealCrystals)return{ok:false,message:`魔晶石が足りない。必要：${costs.sealCrystals}個`};save.state.player.crystals-=costs.sealCrystals;const gold=900+Math.floor((floor-1000)*1.2);save.state.player.gold+=gold;save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;result=`裂け目を封じ、${gold.toLocaleString()}Gと深淵の鍵を1個得た。`}
 markRandomEventResolved(save.state,floor,event.id);save.save();return{ok:true,message:result,elite};
}
function showSecondWorldRandomEvent(){
 const event=randomEventForFloor(save.state,save.state.player.currentFloor);if(!event||!game)return false;
 game.paused=true;app.insertAdjacentHTML("beforeend",Modal(`${event.icon} ${event.title}`,secondWorldEventChoiceBody(event),"立ち去る"));
 const modal=topModal(),finish=(choice="leave")=>{const outcome=resolveSecondWorldRandomEvent(event,choice);if(!outcome.ok){showToast(outcome.message);return}modal.remove();game.paused=false;if(outcome.elite){pauseModal("⚠️ 裂け目の番人",`<p>${outcome.message}</p><p class="muted">通常より強い敵だ。勝利すれば高い報酬が期待できる。</p>`);const warning=topModal();warning.querySelector("[data-modal-primary]").textContent="戦う";warning.querySelector("[data-modal-primary]").onclick=()=>{warning.remove();game.paused=false;beginEncounter(createEliteEncounter({...randomEnemy(),level:enemyLevelForFloor(event.floor)+18,boss:false,equipped:true},event.floor,{forced:true}))};return}pauseModal(event.title,`<p>${outcome.message}</p>`)};
 modal.querySelectorAll("[data-second-world-choice]").forEach(button=>button.onclick=()=>finish(button.dataset.secondWorldChoice));modal.querySelector("[data-modal-primary]").onclick=()=>finish("leave");modal._onDismiss=()=>finish("leave");return true;
}

async function play1000EndingSequence(){
 document.querySelector(".ending1000")?.remove();
 app.insertAdjacentHTML("beforeend",Ending1000Screen());
 const overlay=document.querySelector(".ending1000");if(!overlay)return;
 document.querySelectorAll("audio").forEach(audio=>{try{audio.pause()}catch{}});
 let skipResolve;const skipPromise=new Promise(resolve=>skipResolve=resolve),skip=overlay.querySelector(".ending1000-skip");
 skip.onclick=()=>skipResolve("skip");
 const pause=ms=>Promise.race([new Promise(resolve=>setTimeout(resolve,ms)),skipPromise]);
 requestAnimationFrame(()=>overlay.classList.add("is-visible"));
 await pause(650);
 for(const line of overlay.querySelectorAll("[data-ending-line]")){line.classList.add("is-visible");const result=await pause(1700);if(result==="skip")break}
 if(!overlay.isConnected)return;
 overlay.classList.add("show-credits");
 let result=await pause(9000);
 if(!overlay.isConnected)return;
 overlay.classList.remove("show-credits");overlay.classList.add("show-anomaly");
 if(result!=="skip")await pause(3200);
 save.state.flags??={};save.state.flags.ending1000Played=true;save.save();
 overlay.classList.add("is-closing");await new Promise(resolve=>setTimeout(resolve,650));overlay.remove();
 battle=null;snapshot=null;screen="explore";render();
}
document.addEventListener("click",e=>{const b=e.target.closest?.("[data-modal-dismiss]");if(!b)return;const modal=b.closest(".game-modal");if(typeof modal?._onDismiss==="function"){modal._onDismiss();return}modal?.remove();if(game?.paused&&!document.querySelector(".game-modal"))game.paused=false});
// Mobile game controls: prevent accidental selection/callout/zoom while preserving scrolling.
document.addEventListener("contextmenu",e=>{if(!e.target.closest("input,textarea"))e.preventDefault()});
document.addEventListener("selectstart",e=>{if(!e.target.closest("input,textarea"))e.preventDefault()});
let lastTouchEnd=0;document.addEventListener("touchend",e=>{const now=Date.now();if(now-lastTouchEnd<320&&!e.target.closest("input,textarea"))e.preventDefault();lastTouchEnd=now},{passive:false});

class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66;if(p.x<l)this.x+=(p.x-l)/this.z*.12;if(p.x>r)this.x+=(p.x-r)/this.z*.12;if(p.y<t)this.y+=(p.y-t)/this.z*.12;if(p.y>b)this.y+=(p.y-b)/this.z*.12}clamp(w){const edge=30,mw=w.cols*TILE*this.z,mh=w.rows*TILE*this.z,ml=this.c.width/2-this.x*this.z,mt=this.c.height/2-this.y*this.z,minX=edge-(ml+mw),maxX=this.c.width-edge-ml,minY=edge-(mt+mh),maxY=this.c.height-edge-mt;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-ml:Math.max(minX,Math.min(maxX,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-mt:Math.max(minY,Math.min(maxY,this.oy))}}
normalizeEndgameState(save.state);
function normalizeEquipmentState(){
 save.state.equipment??=[];save.state.reserveEquipment??=[];save.state.bossEquipmentVault??=[];save.state.settings??={};
 save.state.settings.equipmentSort??="rarity";save.state.settings.equipmentSlot??="weapon";save.state.settings.equipmentStorage??="inventory";
 save.state.gacha??={firstTenUsed:false,lastDailyKey:null};save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};save.state.codex.captures??={};save.state.codex.equipment??={};save.state.rest??={lastFreeKey:null};
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
  const counts={},stats={},equippedItems=[];Object.values(m.equipment).forEach(id=>{const item=byId.get(id);if(!item)return;equippedItems.push(item);const mult=equipmentStatMultiplier(item);Object.entries(item.stats??{}).forEach(([k,v])=>stats[k]=(stats[k]??0)+Math.round(v*mult));if(item.series)counts[item.series]=(counts[item.series]??0)+1});
  m._equipmentStats=stats;m._equipmentAffixes=aggregateAffixes(equippedItems);m._seriesCounts=counts;m._seriesMasteryBonus=seriesMasteryBonusForMonster(save.state,counts);
  const natural=calculatedStats(m);if(m.currentHp==null||!Number.isFinite(m.currentHp))m.currentHp=natural.hp;if(m.currentMp==null||!Number.isFinite(m.currentMp))m.currentMp=maxMp(m);
 });
}
function render(){normalizeEquipmentState();document.body.classList.toggle("phase2",hasCleared1000(save.state));if(screen==="home"){app.innerHTML=HomeScreen(save.state);bindHome()}else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state,monsterManage);bindList()}else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m,save.state);bindDetail(m)}else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}else if(screen==="equipment"){if(!save.state.party.includes(equipmentTarget))equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;app.innerHTML=EquipmentScreen(save.state,equipmentTarget,{home:navigationOrigin==="home",...equipmentManage});bindEquipment()}else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}else if(screen==="skills"){skillTarget=save.state.monsters.some(m=>m.id===skillTarget)?skillTarget:(save.state.party[0]??save.state.monsters[0]?.id);app.innerHTML=SkillScreen(save.state,skillTarget);bindSkills()}}
function go(s){screen=s;render()}
function capturePartyVitals(){return Object.fromEntries(save.state.party.map(id=>{const m=save.state.monsters.find(x=>x.id===id);return m?[id,{hp:m.currentHp,mp:m.currentMp,ailments:[...(m.ailments??[])]}]:null}).filter(Boolean))}
function restorePartyVitals(vitals){if(!vitals)return;save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id),v=vitals[id];if(!m||!v)return;m.currentHp=v.hp;m.currentMp=v.mp;m.ailments=[...(v.ailments??[])]})}
function fullyRecoverParty(){save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id);if(!m)return;m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)})}
function openTeamBattle(){const team=dailyTeamAttempts(save.state);if(save.state.player.maxFloor<TEAM_BATTLE_UNLOCK_FLOOR)return alert("100階突破で解放されます");if(team.dailyAttempts>=50)return alert("本日の挑戦回数50回を使い切りました");app.insertAdjacentHTML("beforeend",Modal("⚔️ チームバトル",`<div class="team-battle-intro"><h2>第${team.stage}試練</h2><p>4体対4体。戦闘前に全回復します。</p><p><b>敗北ペナルティなし</b> / 本日 ${team.dailyAttempts}/50戦</p></div>`,`挑戦する`));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();const prior=capturePartyVitals();fullyRecoverParty();team.dailyAttempts++;save.save();startSpecialBattle(createTeamBattleEncounter(save.state),{type:"team",title:`TEAM BATTLE・第${team.stage}試練`,subtitle:"4 VS 4 / 敗北ペナルティなし",priorVitals:prior})}}
function triggerEmergencyEncounter(){
 const event=createEmergencyEncounter(save.state),prior=capturePartyVitals(),options=endgamePreludeOptions(event.boss);fullyRecoverParty();save.save();
 const optionHtml=options.map(option=>`<button data-endgame-prelude="${option.id}"><span>${option.icon}</span><b>${option.title}</b><small>${option.desc}</small></button>`).join("");
 app.insertAdjacentHTML("beforeend",Modal(event.boss.faction==="tenGod"?"――神が降臨しました。":"――深淵反応を検知。",`<div class="emergency-warning ${event.boss.faction}"><div class="warning-icon">${event.boss.icon}</div><small>${event.manifestation.label} / ${event.manifestation.percent}%</small><h2>${event.boss.name}</h2><p>${event.boss.title}</p><p>味方は全回復。逃走不可。敗北ペナルティはありません。</p>${event.rescue?.active?`<div class="emergency-rescue-note"><b>🛡 ${event.rescue.label}</b><small>1000階直後・連敗時の救済補正が適用中。顕現率と眷属数が抑制されています。</small></div>`:""}</div><div class="endgame-prelude-grid">${optionHtml}</div>`,`選択してください`));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");if(primary)primary.disabled=true;
 modal.querySelectorAll("[data-endgame-prelude]").forEach(button=>button.onclick=()=>{const prelude=resolveEndgamePrelude(save.state,event.boss.id,button.dataset.endgamePrelude);applyPreludeToEncounter(event,prelude);save.save();modal.remove();snapshot=currentSnapshot();stopGame();startSpecialBattle(event.enemies,{type:"emergency",title:event.boss.name,subtitle:`${event.manifestation.label}・${prelude.title}`,priorVitals:prior,bossId:event.boss.id,powerPercent:event.manifestation.percent,bonusFragments:prelude.bonusFragments,preludeChoiceId:prelude.id,preludeResultText:prelude.resultText})});
}
function startSpecialBattle(enemies,options={}){startBattle(enemies,{specialBattle:true,specialBattleType:options.type,specialTitle:options.title,specialSubtitle:options.subtitle,priorVitals:options.priorVitals,specialBossId:options.bossId,powerPercent:options.powerPercent,bonusFragments:Math.max(0,Number(options.bonusFragments)||0),preludeChoiceId:options.preludeChoiceId??null,preludeResultText:options.preludeResultText??null})}
function createContractedEndgameMonster(boss,bossId,level,floor){
 const monster=createMonster(boss.speciesId,{nickname:boss.name,title:boss.title,level:Math.max(1,Math.min(9999,Number(level)||Number(floor)||1)),stars:5,rank:4,favorite:true,locked:true,attribute:boss.element??SPECIES[boss.speciesId]?.element,obtainedFloor:Math.max(1,Number(floor)||1),obtainedMethod:"endgameContract",tags:[SPECIES[boss.speciesId]?.race,boss.faction,bossId].filter(Boolean)});
 monster.endgameBossId=bossId;monster.endgameFaction=boss.faction;monster.contractSignature=boss.signature;monster.contractSeriesId=boss.seriesId;monster.isContractedEndgame=true;monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);return monster;
}
function finishSpecialBattle(won){
 const type=battle.specialBattleType,prior=battle.priorVitals,bossId=battle.specialBossId,floor=save.state.player.currentFloor,bonusFragments=Math.max(0,Number(battle.bonusFragments)||0),leader=battle.enemies?.find(enemy=>enemy.endgameBossId===bossId);if(type==="team"){const team=dailyTeamAttempts(save.state);won?(team.totalWins++,team.stage++):team.totalLosses++}
 let fragments=0,contract=null,contractedMonster=null;if(type==="emergency"){recordEmergencyResult(save.state,battle,won);fragments=awardEmergencyFragments(save.state,bossId,won,bonusFragments);if(won){contract=attemptEndgameContract(save.state,bossId,floor);if(contract.success){const duplicate=save.state.monsters.some(monster=>monster.endgameBossId===bossId||monster.isContractedEndgame&&monster.nickname===contract.boss?.name);if(!duplicate){contractedMonster=createContractedEndgameMonster(contract.boss,bossId,leader?.level,floor);save.state.monsters.push(contractedMonster)}}}}
 restorePartyVitals(prior);clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();const boss=bossId?ENDGAME_BOSSES[bossId]:null,status=bossId?emergencyFragmentStatus(save.state,bossId):null,contractStatus=bossId?endgameContractStatus(save.state,bossId,floor):null;
 const fragmentNote=bonusFragments?`<small>選択ボーナス +${bonusFragments}を含む</small>`:"";
 let contractHtml="";if(type==="emergency"&&won&&contract){if(contract.success)contractHtml=`<div class="fragment-reward contract-success"><b>🤝 ${boss.name}との契約成立</b><small>${contractedMonster?"星5・ロック状態で仲間に加入しました。":"すでに仲間にいるため重複加入はありません。"}</small></div>`;else if(contract.attempted)contractHtml=`<div class="fragment-reward"><b>${boss.name}　契約成立率 ${contract.percent}%</b><small>今回は契約を拒まれた。累計欠片 ${contract.totalFragments} / 挑戦 ${contract.attempts}回</small></div>`;else contractHtml=`<div class="fragment-reward"><b>？？？　契約不可</b><small>${contract.reason??"この階層では契約できません。"}</small></div>`}
 const title=won?"SPECIAL VICTORY":"DEFEAT",body=won?`<div class="special-result win"><h2>${boss?boss.name:"チームバトル"}を撃退！</h2><p>${type==="team"?"次の試練が解放されました。":"世界異変を退けました。"}</p>${battle.preludeResultText?`<small>${battle.preludeResultText}</small>`:""}${type==="emergency"?`<div class="fragment-reward"><b>${boss.icon} ${boss.name}の欠片 ×${fragments}</b>${fragmentNote}<small>所持 ${status.count}/${status.required}${status.canCraft?"　製作可能！":""}</small></div>${contractHtml}`:""}</div>`:`<div class="special-result lose"><h2>${boss?boss.name:"第試練"}には届かなかった…</h2><p>所持品・階層・仲間へのペナルティはありません。</p>${type==="emergency"?`<div class="fragment-reward"><b>${boss.icon} ${boss.name}の欠片 ×${fragments}</b>${fragmentNote}<small>敗北しても欠片は必ず残る。所持 ${status.count}/${status.required}</small></div>`:""}</div>`;
 save.save();battle=null;activeEnemy=null;app.insertAdjacentHTML("beforeend",Modal(title,body,type==="team"?"拠点へ戻る":"探索へ戻る"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();if(type==="team"){snapshot=null;go("home")}else{screen="explore";render()}}
}

function openEndgameForge(){
 const rows=Object.values(ENDGAME_BOSSES).map(b=>{const s=emergencyFragmentStatus(save.state,b.id),record=save.state.endgame?.emergency?.records?.[b.id]??{};return`<article class="endgame-forge-card ${b.faction}"><div class="spread"><div><small>${b.faction==="tenGod"?"十神":"深淵"}</small><h3>${b.icon} ${b.name}</h3></div><b>${s.count}/${s.required}</b></div><div class="fragment-meter"><i style="width:${Math.min(100,s.count/s.required*100)}%"></i></div><small>遭遇 ${record.encounters??0} / 討伐 ${record.wins??0} / 製作 ${s.crafted}</small><button data-craft-endgame="${b.id}" ${s.canCraft?"":"disabled"}>${s.canCraft?"最強装備を製作":"欠片を集める"}</button></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("欠片・神装鍛造",`<p class="muted">戦うだけで欠片を獲得。必要数を集めると、武器・防具・アクセのいずれかをランダム製作します。</p><div class="endgame-forge-list">${rows}</div>`,"閉じる"));
 const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=closeTopModal;modal.querySelectorAll("[data-craft-endgame]").forEach(b=>b.onclick=()=>craftEndgameGear(b.dataset.craftEndgame));
}
function craftEndgameGear(bossId){
 const result=craftEndgameEquipment(save.state,bossId);if(!result.ok)return showToast(result.message);
 const received=receiveEquipment(save.state,result.item,{bossReward:true});save.save();closeTopModal();
 app.insertAdjacentHTML("beforeend",Modal("神装顕現",`<div class="crafted-endgame-gear"><div class="warning-icon">${result.boss.icon}</div><small>${result.boss.name}シリーズ</small><h2>[LR] ${result.item.name}</h2><p>${slotLabel(result.item.slot)} / ${Object.entries(result.item.stats).map(([k,v])=>`${equipmentStatLabel(k)} +${v}`).join(" / ")}</p><b>欠片 ${result.spent}個を消費</b><small>${received.message}</small></div>`,`受け取る`));
 topModal().querySelector("[data-modal-primary]").onclick=()=>{closeTopModal();openEndgameForge()};
}

function openWorldRecord(){
 const floor=save.state.player.maxFloor||1;
 const region=floor>=7001?"神域":floor>=3001?"深淵領域":"未知領域";
 app.insertAdjacentHTML("beforeend",Modal("世界の記録",`<div class="world-record-modal"><small class="eyebrow">RECORD I / ${region}</small><h2>地下1000階の向こう側</h2><p>地下1000階。そこは人類が知る世界の終点。</p><p>誰もが、そう信じていた。</p><hr><p>しかし、そのさらに下には──誰にも語られなかった世界が存在する。</p><p class="muted">現在確認された最深部：${floor}階</p></div>`,`閉じる`));
}
function returnRarityTable(){return`<div class="return-rarity-table"><div class="return-rarity-head"><b>装備ドロップ確率</b><small>装備1枠ごとの抽選</small></div>${RETURN_RARITY_RATES.map(row=>`<p class="rarity-${row.rarity}"><span>${row.rarity}</span><b>${row.label}</b></p>`).join("")}</div>`}
function returnGradeBadge(grade){return`<div class="return-grade grade-${grade}"><small>探索評価</small><strong>${grade}</strong></div>`}
function bindHome(){document.getElementById("openIdleReturn")?.addEventListener("click",()=>{const preview=idleReturnPreview(save.state);if(!preview.available)return;const result=claimIdleReturn(save.state);save.save();const minutes=Math.floor(result.elapsedMs/60000),hours=Math.floor(minutes/60),minutePart=minutes%60,timeText=hours>0?`${hours}時間${minutePart}分`:`${minutePart}分`,rarityRank={N:0,R:1,SR:2,SSR:3,LR:4},best=result.equipment.reduce((a,x)=>!a||rarityRank[x.item.rarity]>rarityRank[a.item.rarity]?x:a,null),equipmentRows=result.equipment.length?result.equipment.map(({item,receipt})=>`<div class="return-reward-item rarity-${item.rarity}"><b>${item.rarity} ${item.name}</b><small>${receipt.message}</small></div>`).join(""):'<p class="muted">今回は装備ドロップなし</p>',highlight=best&&["SSR","LR"].includes(best.item.rarity)?`<div class="return-reward-highlight rarity-${best.item.rarity}"><strong>${best.item.rarity} IDLE DROP!</strong><span>${best.item.name}</span></div>`:"";const grade=returnRewardGrade(result.floorUnits,result.equipment);app.insertAdjacentHTML("beforeend",Modal("放置帰還報告",`<div class="return-reward-report idle-return-report">${highlight}${returnGradeBadge(grade)}<div class="idle-return-emblem">🕯️</div><p><span>放置探索時間</span><b>${timeText}</b></p><p><span>探索地点</span><b>${result.expeditionFloor}階層帯</b></p><p><span>換算探索量</span><b>${result.floorUnits}階層分</b></p><p class="return-reward-gold"><span>獲得GOLD</span><b>${result.gold.toLocaleString()}G</b></p><h3>獲得装備 ${result.equipment.length}個</h3><div class="return-reward-items">${equipmentRows}</div>${returnRarityTable()}<small>放置報酬は手動探索の約1/10。装備は2時間ごとに1個、最大4個まで抽選します。</small></div>`,"受け取る"));const modal=topModal(),finish=()=>{modal?.remove();render()};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish});document.getElementById("openMonsters").onclick=()=>go("monsters");document.getElementById("openSkills")?.addEventListener("click",()=>{skillTarget=save.state.party[0]??save.state.monsters[0]?.id;skillSlotSelection=0;go("skills")});document.getElementById("openTeamBattle")?.addEventListener("click",openTeamBattle);document.getElementById("openEndgameForge")?.addEventListener("click",openEndgameForge);document.getElementById("editHomeParty")?.addEventListener("click",openHomePartyEditor);document.querySelectorAll("[data-empty-party]").forEach(b=>b.addEventListener("click",openHomePartyEditor));document.getElementById("openRest")?.addEventListener("click",openRest);document.getElementById("openGacha")?.addEventListener("click",openGacha);document.getElementById("openDeepGacha")?.addEventListener("click",openDeepGacha);document.getElementById("openWorldRecord")?.addEventListener("click",openWorldRecord);document.getElementById("openCodexHub")?.addEventListener("click",openCodexHub);document.getElementById("openMonsterCodex")?.addEventListener("click",()=>openCodex("monster"));document.getElementById("openEquipmentCodex")?.addEventListener("click",()=>openCodex("equipment"));document.getElementById("openSettings").onclick=()=>go("settings");document.getElementById("openExplore").onclick=()=>{const max=Math.min(WORLD_MAX_FLOOR,save.state.player.maxFloor);app.insertAdjacentHTML("beforeend",Modal("探索開始",`<p>再開する階層を選択</p><input id="floorSelect" type="number" min="1" max="${max}" value="${max}"><p class="muted">1〜${max}階。到達済みの階層から再開できます。</p>`,`出発`));const modal=topModal(),button=modal.querySelector("[data-modal-primary]");button.onclick=()=>{const f=Math.max(1,Math.min(max,Number(modal.querySelector("#floorSelect").value)||max));save.state.player.currentFloor=f;save.state.player.inRun=true;beginManualExpedition(save.state,f);save.save();snapshot=null;modal.remove();go("explore")}};document.getElementById("openEquipment").onclick=()=>{equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;navigationOrigin="home";go("equipment")};detailButtons()}

function bindSkills(){
 document.getElementById("backSkillHome")?.addEventListener("click",()=>go("home"));
 document.querySelectorAll("[data-skill-monster]").forEach(button=>button.addEventListener("click",()=>{skillTarget=button.dataset.skillMonster;skillSlotSelection=0;render()}));
 const markSlot=()=>{document.querySelectorAll("[data-skill-slot]").forEach(button=>button.classList.toggle("selected",Number(button.dataset.skillSlot)===skillSlotSelection))};
 document.querySelectorAll("[data-skill-slot]").forEach(button=>button.addEventListener("click",()=>{skillSlotSelection=Number(button.dataset.skillSlot)||0;markSlot();showToast(`SLOT ${skillSlotSelection+1} を選択`)}));
 markSlot();
 document.querySelectorAll("[data-skill-card]").forEach(card=>card.addEventListener("click",()=>{
  if(card.classList.contains("locked"))return showToast("まだ習得していません");
  const monster=save.state.monsters.find(m=>m.id===skillTarget),skillId=card.dataset.skillCard;if(!monster)return;
  if(!allLearnedSkills(monster).some(skill=>skill.id===skillId))return;
  if(!equipSkill(monster,skillId,skillSlotSelection))return;save.save();showToast(`SLOT ${skillSlotSelection+1} に装備`);render();
 }));
}

function bindList(){
 const back=document.getElementById("backHome");if(back)back.onclick=()=>{monsterManage={editing:false,selected:new Set()};go("home")};
 document.getElementById("toggleMonsterEdit")?.addEventListener("click",()=>{monsterManage.editing=!monsterManage.editing;if(!monsterManage.editing)monsterManage.selected.clear();render()});
 const input=document.getElementById("monsterSearch");if(input)input.oninput=()=>{const q=input.value.trim();document.querySelectorAll(".monster-card").forEach(c=>{const trigger=c.querySelector("[data-monster-id],[data-select-monster]");const id=trigger?.dataset.monsterId??trigger?.dataset.selectMonster;const m=id?save.state.monsters.find(x=>x.id===id):null;const species=m?SPECIES[m.speciesId]:null;c.style.display=!q||(m?.nickname??"").includes(q)||(species?.name??"").includes(q)?"grid":"none"})};
 document.querySelectorAll("[data-select-monster]").forEach(c=>c.onchange=()=>{c.checked?monsterManage.selected.add(c.dataset.selectMonster):monsterManage.selected.delete(c.dataset.selectMonster);render()});
 document.querySelectorAll("[data-select-monsters]").forEach(b=>b.onclick=()=>selectMonstersPreset(b.dataset.selectMonsters));
 document.querySelectorAll("[data-quick-equipment]").forEach(b=>b.onclick=e=>{e.stopPropagation();equipmentTarget=b.dataset.quickEquipment;navigationOrigin="monsters";go("equipment")});
 document.querySelectorAll("[data-quick-growth]").forEach(b=>b.onclick=e=>{e.stopPropagation();selected=b.dataset.quickGrowth;go("detail")});
 document.getElementById("releaseSelectedMonsters")?.addEventListener("click",releaseSelectedMonsters);detailButtons()
}

function selectableMonsters(){return save.state.monsters.filter(m=>!save.state.party.includes(m.id)&&!m.favorite&&!m.locked)}
function selectMonstersPreset(mode){const pool=selectableMonsters();if(mode==="none")monsterManage.selected.clear();else{const picks=pool.filter(m=>mode==="all"||mode==="plus0"&&(m.plus??0)===0||mode==="unfavorite"&&!m.favorite||["N","R"].includes(mode)&&(m.summonTier??m.summonRarity??SPECIES[m.speciesId]?.rarity??"N")===mode);picks.forEach(m=>monsterManage.selected.add(m.id))}render()}
function releaseSelectedMonsters(){const targets=selectableMonsters().filter(m=>monsterManage.selected.has(m.id));if(!targets.length)return alert("手放せるモンスターが選択されていません");if(save.state.monsters.length-targets.length<1)return alert("最後の1体は手放せません");if(!confirm(`${targets.length}体を手放します。\n魔晶石 ${targets.length}個を獲得します。`))return;const ids=new Set(targets.map(m=>m.id));targets.forEach(m=>Object.values(m.equipment??{}).forEach(id=>{const i=save.state.equipment.find(x=>x.id===id);if(i)i.equippedBy=null}));save.state.monsters=save.state.monsters.filter(m=>!ids.has(m.id));save.state.player.crystals+=targets.length;monsterManage.selected.clear();save.save();render()}
function detailButtons(){document.querySelectorAll("[data-monster-id]").forEach(b=>b.onclick=()=>{selected=b.dataset.monsterId;go("detail")})}
function bindDetail(m){document.getElementById("backMonsters").onclick=()=>go("monsters");document.querySelectorAll("[data-switch-monster]").forEach(b=>b.onclick=()=>{selected=b.dataset.switchMonster;render();window.scrollTo({top:0,behavior:"smooth"})});document.querySelectorAll("[data-growth-jump]").forEach(b=>b.onclick=()=>{const ids={level:"growthLevelSection",affection:"growthAffectionSection",history:"growthHistorySection"};document.getElementById(ids[b.dataset.growthJump])?.scrollIntoView({behavior:"smooth",block:"start"})});document.getElementById("releaseMonster")?.addEventListener("click",()=>releaseMonster(m));document.getElementById("toggleFavorite").onclick=()=>{m.favorite=!m.favorite;save.save();render()};document.getElementById("saveNickname")?.addEventListener("click",()=>{const v=document.getElementById("nicknameInput").value.trim();if(v)m.nickname=v.slice(0,12);save.save();render()});document.querySelectorAll("[data-color-id]").forEach(b=>b.onclick=()=>{m.colorId=b.dataset.colorId;save.save();render()});document.getElementById("limitBreakButton")?.addEventListener("click",()=>performLimitBreak(m.id,{returnToDetail:true}));document.getElementById("openMonsterEquipment")?.addEventListener("click",()=>{equipmentTarget=m.id;navigationOrigin="detail";go("equipment")})}
function bindSettings(){document.getElementById("backHome").onclick=()=>go("home");document.getElementById("toggleAuto").onclick=()=>{save.state.settings.autoBattle=!save.state.settings.autoBattle;save.save();render()};document.getElementById("toggleMinimap").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();render()};document.getElementById("openTutorialBook")?.addEventListener("click",openTutorialBook);document.getElementById("resetSave").onclick=()=>{if(confirm("初期化する？")){save.reset();snapshot=null;go("home")}}}


function bindEquipment(){
 document.getElementById("backEquipmentHome").onclick=()=>{const target=navigationOrigin;navigationOrigin="home";go(target)};
 document.querySelectorAll("[data-equipment-target]").forEach(b=>b.onclick=()=>{equipmentTarget=b.dataset.equipmentTarget;render()});
 document.getElementById("equipmentSort").onchange=e=>{save.state.settings.equipmentSort=e.target.value;save.save();render()};
 document.querySelectorAll("[data-equipment-slot]").forEach(b=>b.onclick=()=>{save.state.settings.equipmentSlot=b.dataset.equipmentSlot;save.save();render()});
 document.querySelectorAll("[data-equipment-storage]").forEach(b=>b.onclick=()=>{if(b.disabled)return;save.state.settings.equipmentStorage=b.dataset.equipmentStorage;save.save();render()});
 document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equipItem(b.dataset.equip,b.dataset.target,b.dataset.subslot));document.getElementById("autoEquipOne")?.addEventListener("click",()=>{autoEquipMonster(equipmentTarget);save.save();render()});document.getElementById("autoEquipParty")?.addEventListener("click",()=>{save.state.party.forEach(autoEquipMonster);save.save();render()});document.getElementById("unequipOne")?.addEventListener("click",()=>unequipMonsterAll(equipmentTarget));document.getElementById("unequipParty")?.addEventListener("click",()=>{if(!confirm("パーティー全員の装備を解除しますか？"))return;save.state.party.forEach(id=>unequipMonsterAll(id,false));save.save();render()});
 document.querySelectorAll("[data-unequip]").forEach(b=>b.onclick=()=>unequipItem(b.dataset.unequip));
 document.querySelectorAll("[data-favorite-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.favoriteEquipment);if(!i)return;i.favorite=!i.favorite;save.save();render()});
 document.querySelectorAll("[data-lock-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.lockEquipment);if(!i)return;i.locked=!i.locked;save.save();render()});
 document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>sellItem(b.dataset.sell));
 document.querySelectorAll("[data-enhance-equipment]").forEach(b=>b.onclick=()=>enhanceEquipment(b.dataset.enhanceEquipment));
 document.getElementById("bulkSellEquipment")?.addEventListener("click",bulkSellEquipment);
 document.getElementById("toggleEquipmentEdit")?.addEventListener("click",()=>{equipmentManage.editing=!equipmentManage.editing;if(!equipmentManage.editing)equipmentManage.selected.clear();render()});
 document.querySelectorAll("[data-select-equipment-id]").forEach(c=>c.onchange=()=>{c.checked?equipmentManage.selected.add(c.dataset.selectEquipmentId):equipmentManage.selected.delete(c.dataset.selectEquipmentId);render()});
 document.querySelectorAll("[data-select-equipment]").forEach(b=>b.onclick=()=>selectEquipmentPreset(b.dataset.selectEquipment));
 document.getElementById("sellSelectedEquipment")?.addEventListener("click",sellSelectedEquipment);
 document.getElementById("lockSelectedEquipment")?.addEventListener("click",lockSelectedEquipment);
 document.querySelectorAll("[data-take-equipment]").forEach(b=>b.onclick=()=>{const result=takeFromStorage(save.state,b.dataset.takeEquipment,b.dataset.storage);if(!result.ok)return alert(result.message);save.save();render()});
}


function selectableEquipment(){return save.state.equipment.filter(i=>!i.equippedBy&&!i.favorite&&!i.locked)}
function selectEquipmentPreset(mode){const slot=save.state.settings.equipmentSlot??"weapon",pool=selectableEquipment().filter(i=>i.slot===slot);if(mode==="none")equipmentManage.selected.clear();else{const counts={};pool.forEach(i=>counts[i.name]=(counts[i.name]??0)+1);pool.filter(i=>mode==="all"||mode==="plus0"&&(i.plus??0)===0||mode==="duplicate"&&counts[i.name]>1||["N","R"].includes(mode)&&i.rarity===mode).forEach(i=>equipmentManage.selected.add(i.id))}render()}
function sellSelectedEquipment(){const targets=selectableEquipment().filter(i=>equipmentManage.selected.has(i.id));if(!targets.length)return alert("売却できる装備が選択されていません");const total=targets.reduce((n,i)=>n+equipmentSellPrice(i),0);if(!confirm(`${targets.length}個を売却して ${total}G獲得します。`))return;const ids=new Set(targets.map(i=>i.id));save.state.equipment=save.state.equipment.filter(i=>!ids.has(i.id));save.state.player.gold+=total;equipmentManage.selected.clear();save.save();render()}
function lockSelectedEquipment(){const targets=save.state.equipment.filter(i=>equipmentManage.selected.has(i.id)&&!i.equippedBy&&!i.favorite);if(!targets.length)return alert("ロックできる装備が選択されていません");targets.forEach(i=>i.locked=true);equipmentManage.selected.clear();save.save();render()}
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
function rarityValue(rarity){return ({N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9}[rarity]??0)}
function elementLabel(element){return ({all:"全属性",neutral:"無",fire:"火",water:"水",wind:"風",earth:"土",lightning:"雷",light:"光",dark:"闇",poison:"毒",nature:"自然"}[element]??element)}
function monsterVisibleRarity(monster){const rarity=monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N";return !hasCleared1000(save.state)&&["深淵","十神"].includes(rarity)?"？？？":rarity}
function partyEditorMonsters(){
 const q=partyEditorState.search.trim().toLowerCase();
 const list=save.state.monsters.filter(m=>{
  const sp=SPECIES[m.speciesId];
  if(q&&!`${displayName(m)} ${sp.name}`.toLowerCase().includes(q))return false;
  if(partyEditorState.element!=="all"&&sp.element!==partyEditorState.element)return false;
  const active=save.state.party.includes(m.id);
  if(partyEditorState.status==="active"&&!active)return false;
  if(partyEditorState.status==="reserve"&&active)return false;
  if(partyEditorState.status==="favorite"&&!m.favorite)return false;
  return true;
 });
 const get=m=>{const st=calculatedStats(m),sp=SPECIES[m.speciesId];switch(partyEditorState.sort){case"level":return m.level;case"stars":return m.stars??0;case"plus":return m.plus??0;case"affection":return m.affection??0;case"hp":return st.hp;case"atk":return st.atk;case"def":return st.def;case"spd":return st.spd;case"name":return displayName(m);case"obtained":return m.createdAt??m.id;default:return rarityValue(m.summonTier??m.summonRarity??sp.rarity)}};
 return list.sort((a,b)=>{const av=get(a),bv=get(b),cmp=typeof av==="string"?String(av).localeCompare(String(bv),"ja"):av-bv;return partyEditorState.direction==="asc"?cmp:-cmp});
}
function partyEditorBody(mode="home"){
 const current=save.state.party.map((id,i)=>{const m=save.state.monsters.find(x=>x.id===id);return m?`<button data-party-slot="${m.id}"><span>${i+1}</span><b>${SPECIES[m.speciesId].emoji} ${displayName(m)}</b><small>Lv.${m.level}</small></button>`:`<button disabled><span>${i+1}</span><b>空き</b></button>`}).join("");
 const elements=["all","neutral","fire","water","wind","earth","lightning","light","dark","poison","nature"];
 const rows=partyEditorMonsters().map(m=>{const sp=SPECIES[m.speciesId],st=calculatedStats(m),active=save.state.party.includes(m.id),rarity=monsterVisibleRarity(m);return`<article class="party-compare-card ${active?"selected":""}"><button class="party-card-main" data-home-party-toggle="${m.id}"><span class="party-monster-icon">${sp.emoji}</span><div><div class="party-card-title"><b>${displayName(m)}</b></div><small>${rarity} / ${elementLabel(sp.element)} / Lv.${m.level} / +${m.plus??0}</small><small>才能 ${"★".repeat(m.stars??1)}　なつき ${m.affection??0}</small><div class="party-stat-line"><span>HP ${st.hp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div></div></button><button class="party-detail-button" data-party-detail="${m.id}">詳細</button></article>`}).join("")||'<div class="empty">条件に合うモンスターがいません</div>';
 const intro=mode==="field"?"その場で1〜4体を選択できます。捕獲直後の仲間もすぐ使用可能です。":"情報を比較しながら1〜4体を選択できます。";
 return`<p class="muted">${intro}</p><div class="party-current-slots">${current}</div><div class="party-tools"><input id="partySearch" value="${partyEditorState.search}" placeholder="名前で検索"><div class="party-filter-scroll">${elements.map(e=>`<button data-party-element="${e}" class="${partyEditorState.element===e?"active":""}">${elementLabel(e)}</button>`).join("")}</div><div class="party-tool-row"><select id="partyStatus"><option value="all">全員</option><option value="active">出撃中</option><option value="reserve">控え</option><option value="favorite">お気に入り</option></select><select id="partySort"><option value="rarity">レア度</option><option value="level">レベル</option><option value="stars">才能</option><option value="plus">+強化</option><option value="affection">なつき度</option><option value="hp">HP</option><option value="atk">ATK</option><option value="def">DEF</option><option value="spd">SPD</option><option value="obtained">入手順</option><option value="name">名前順</option></select><button id="partyDirection">${partyEditorState.direction==="desc"?"降順 ↓":"昇順 ↑"}</button></div></div><div class="party-compare-list">${rows}</div>`;
}
function bindPartyEditor(modal){
 const search=modal.querySelector("#partySearch");search?.addEventListener("input",e=>{partyEditorState.search=e.target.value;refreshPartyEditor(modal)});
 const status=modal.querySelector("#partyStatus");if(status){status.value=partyEditorState.status;status.onchange=e=>{partyEditorState.status=e.target.value;refreshPartyEditor(modal)}}
 const sort=modal.querySelector("#partySort");if(sort){sort.value=partyEditorState.sort;sort.onchange=e=>{partyEditorState.sort=e.target.value;refreshPartyEditor(modal)}}
 modal.querySelector("#partyDirection")?.addEventListener("click",()=>{partyEditorState.direction=partyEditorState.direction==="desc"?"asc":"desc";refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-party-element]").forEach(b=>b.onclick=()=>{partyEditorState.element=b.dataset.partyElement;refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-home-party-toggle]").forEach(b=>b.onclick=()=>{togglePartyMember(b.dataset.homePartyToggle);refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-party-slot]").forEach(b=>b.onclick=()=>{togglePartyMember(b.dataset.partySlot);refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-party-detail]").forEach(b=>b.onclick=()=>openPartyMonsterDetail(b.dataset.partyDetail));
}
function refreshPartyEditor(modal){const body=modal.querySelector(".game-modal-body");if(!body)return;body.innerHTML=partyEditorBody(modal.dataset.partyEditorMode??"home");bindPartyEditor(modal)}
function formatObtainedDate(value){try{return new Date(value).toLocaleDateString("ja-JP")}catch{return"不明"}}
function limitBreakCandidates(m){return save.state.monsters.filter(x=>x.id!==m.id&&x.speciesId===m.speciesId&&!save.state.party.includes(x.id)&&!x.favorite&&!x.locked)}
function performLimitBreak(id,options={}){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const materials=limitBreakCandidates(m);if(materials.length<2)return alert("限界突破には、控えにいる同名モンスターが2体必要です。\nお気に入り・ロック・出撃中の個体は素材にできません。");const growth=limitBreakGrowth(m.speciesId),before=m.plus??0;if(!confirm(`${displayName(m)}を +${before+1}へ限界突破する？\n\n素材：同名モンスター2体\nLv1基礎補正：HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}`))return;const ids=new Set(materials.slice(0,2).map(x=>x.id));save.state.monsters=save.state.monsters.filter(x=>!ids.has(x.id));m.plus=before+1;save.save();document.querySelectorAll(".game-modal").forEach(x=>x.remove());app.insertAdjacentHTML("beforeend",Modal("✨ LIMIT BREAK ✨",`<div class="limit-break-result"><span>${SPECIES[m.speciesId]?.emoji??"👹"}</span><h2>${displayName(m)}</h2><div><b>+${before}</b><i>→</i><strong>+${m.plus}</strong></div><p>Lv.1基礎値<br>HP +${growth.hp} / ATK +${growth.atk} / DEF +${growth.def} / SPD +${growth.spd}</p></div>`,"育成画面へ"));topModalButton().onclick=()=>{closeTopModal();if(options.returnToDetail){selected=id;screen="detail";render()}else openPartyMonsterDetail(id)}}
function openPartyMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const sp=SPECIES[m.speciesId],st=calculatedStats(m),growth=limitBreakGrowth(m.speciesId),aff=m.affection??0,h=m.history??{},materials=limitBreakCandidates(m).length,friend=aff>=1000?" ❤️ 親友":"";app.insertAdjacentHTML("beforeend",Modal(`${sp.emoji} ${displayName(m)}`,`<div class="codex-detail monster-growth-detail"><p><b>${monsterVisibleRarity(m)} / ${elementLabel(sp.element)} / ${sp.role??"不明"}</b></p><div class="detail-stat-grid"><span>Lv.${m.level}</span><span>才能 ${"★".repeat(m.stars??1)}${"☆".repeat(5-(m.stars??1))}</span><span>限界突破 +${m.plus??0}</span><span>なつき ${aff}/1000${friend}</span><span>HP ${st.hp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div><section class="growth-panel"><b>＋限界突破</b><p>同名2体で＋1・上限なし。Lv1基礎値へ毎回 HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}</p><button id="limitBreakButton" ${materials<2?"disabled":""}>＋${(m.plus??0)+1}へ限界突破（素材 ${materials}/2）</button></section><section class="growth-panel"><b>❤️ なつき度ボーナス</b><p>${aff>=1000?"全段階解放・親友":`現在 ${aff}/1000　次のボーナスまで ${Math.ceil((aff+1)/100)*100-aff}`}</p></section><div class="party-detail-quick-actions"><button id="openGrowthFromPartyDetail">💪 育成画面へ</button><button id="openEquipmentFromPartyDetail">⚔️ 装備を変更</button></div><section class="growth-panel history-panel"><b>📖 このモンスターの歴史</b><p>初獲得：${formatObtainedDate(m.obtainedAt??m.capturedAt)} / ${m.obtainedFloor??1}F / ${m.obtainedMethod==="summon"?"召喚":"捕獲"}<br>冒険 ${h.adventures??0}回 / 戦闘 ${h.battles??0}回 / 勝利 ${h.victories??0}回<br>撃破 ${h.kills??0}体 / ボス撃破 ${h.bossDefeats??0}体 / 最高到達 ${h.highestFloor??m.obtainedFloor??1}F</p></section><p class="muted">種族 ${sp.race??"不明"}<br>特性 ${TRAITS[m.traitId]?.name??"なし"}</p></div>`,"戻る"));const modal=topModal();modal.querySelector("#limitBreakButton")?.addEventListener("click",()=>performLimitBreak(id));modal.querySelector("#openGrowthFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());selected=id;screen="detail";render()});modal.querySelector("#openEquipmentFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());equipmentTarget=id;navigationOrigin="monsters";screen="equipment";render()});topModalButton().onclick=closeTopModal}
function openHomePartyEditor(){app.insertAdjacentHTML("beforeend",Modal("パーティー編成",partyEditorBody("home"),"確定"));const modal=topModal();modal.dataset.partyEditorMode="home";bindPartyEditor(modal);modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();render()}}

function equipItem(itemId,monsterId,subslot){const item=save.state.equipment.find(i=>i.id===itemId),monster=save.state.monsters.find(m=>m.id===monsterId);if(!item||!monster||!subslot)return;if(!save.state.party.includes(monsterId))return alert("控えモンスターには装備できません。");const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster);if(item.equippedBy){const old=save.state.monsters.find(m=>m.id===item.equippedBy);if(old)for(const key of Object.keys(old.equipment??{}))if(old.equipment[key]===item.id)old.equipment[key]=null}const prior=monster.equipment[subslot];if(prior){const oldItem=save.state.equipment.find(i=>i.id===prior);if(oldItem)oldItem.equippedBy=null}monster.equipment[subslot]=item.id;item.equippedBy=monster.id;preserveVitals(monster,beforeStats,beforeMp);save.save();render()}
function autoEquipMonster(monsterId){const monster=save.state.monsters.find(m=>m.id===monsterId);if(!monster||!save.state.party.includes(monsterId))return;const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster),pairs=[["weaponRight","weapon"],["armorBody","armor"],["accessoryNeck","accessory"],["armorSupport","armor"],["accessoryFinger","accessory"],["weaponLeft","weapon"]];for(const [subslot,slot] of pairs){const unlock={armorSupport:25,accessoryFinger:50,weaponLeft:100}[subslot]??1;if(monster.level<unlock)continue;const candidates=save.state.equipment.filter(i=>i.slot===slot&&(!i.equippedBy||i.equippedBy===monsterId)&&!Object.values(monster.equipment??{}).includes(i.id)).sort((a,b)=>equipmentPower(b)-equipmentPower(a));const best=candidates[0];if(!best)continue;const currentId=monster.equipment[subslot],current=save.state.equipment.find(i=>i.id===currentId);if(current&&equipmentPower(current)>=equipmentPower(best))continue;if(current)current.equippedBy=null;monster.equipment[subslot]=best.id;best.equippedBy=monsterId}preserveVitals(monster,beforeStats,beforeMp)}
function unequipItem(itemId){const item=save.state.equipment.find(i=>i.id===itemId);if(!item?.equippedBy)return;const monster=save.state.monsters.find(m=>m.id===item.equippedBy);if(!monster){item.equippedBy=null;save.save();return render()}const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster);for(const key of Object.keys(monster.equipment??{}))if(monster.equipment[key]===item.id)monster.equipment[key]=null;item.equippedBy=null;preserveVitals(monster,beforeStats,beforeMp);save.save();render()}
function unequipMonsterAll(monsterId,confirmFirst=true){const monster=save.state.monsters.find(m=>m.id===monsterId);if(!monster)return;const ids=Object.values(monster.equipment??{}).filter(Boolean);if(!ids.length){if(confirmFirst)alert("解除する装備がありません");return}if(confirmFirst&&!confirm(`${displayName(monster)}の装備をすべて解除しますか？`))return;ids.forEach(id=>{const item=save.state.equipment.find(i=>i.id===id);if(item)item.equippedBy=null});Object.keys(monster.equipment??{}).forEach(k=>monster.equipment[k]=null);save.save();if(confirmFirst)render()}

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
function ensureGold(cost,onReady){const gold=save.state.player.gold??0;if(gold>=cost){onReady();return}const shortage=cost-gold,crystals=Math.ceil(shortage/1000);if((save.state.player.crystals??0)<crystals){alert(`GOLDが不足しています。\n不足：${shortage.toLocaleString()}G\n必要な魔晶石：${crystals}個（所持 ${save.state.player.crystals??0}個）`);return}if(!confirm(`GOLDが不足しています。\n\n魔晶石をGOLDへ変換しますか？\n${crystals}💎 → ${(crystals*1000).toLocaleString()}G\n（1💎 = 1000G）`))return;save.state.player.crystals-=crystals;save.state.player.gold+=crystals*1000;save.save();onReady()}
function openRest(){const key=localDayKey(),free=save.state.rest.lastFreeKey!==key,need=partyRecoveryNeed(),cost=Math.max(0,need*5);if(need<=0){app.insertAdjacentHTML("beforeend",Modal("💤 もう元気だよ！","<p>出撃メンバーは全員、HP・MPともに満タンで状態異常もありません。</p>","閉じる"));topModalButton().onclick=closeTopModal;return}app.insertAdjacentHTML("beforeend",Modal("🛏️ 深淵の休息",`<p>出撃メンバーのHP・MP・状態異常を完全回復します。</p><div class="rest-price"><b>${free?"本日1回 無料":`${cost.toLocaleString()}G`}</b><small>回復必要量 ${need.toLocaleString()} / 所持 ${save.state.player.gold.toLocaleString()}G</small></div>`,free?"無料で休む":`${cost.toLocaleString()}Gで休む`));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{if(!free&&save.state.player.gold<cost){modal.remove();return ensureGold(cost,openRest)}if(!confirm(free?"本日の無料休息を使いますか？":`${cost.toLocaleString()}Gで休息しますか？`))return;if(free)save.state.rest.lastFreeKey=key;else save.state.player.gold-=cost;healParty();save.save();modal.remove();render()}}
function rarityRoll(mode="normal") {const r=Math.random();if(mode==="guaranteed")return r<.08?"LR":r<.32?"SSR":"SR";if(r<.002)return"LR";if(r<.03)return"SSR";if(r<.15)return"SR";if(r<.48)return"R";return"N"}
const SUMMON_RARITY_INFO=[
 {id:"N",name:"ノーマル",note:"基本レア度"},
 {id:"R",name:"レア",note:"通常より希少"},
 {id:"SR",name:"スーパーレア",note:"10連の最後の1枠はSR以上"},
 {id:"SSR",name:"スペシャルスーパーレア",note:"非常に希少"},
 {id:"UR",name:"ウルトラレア",note:"将来の上位レア度"},
 {id:"LR",name:"レジェンドレア",note:"通常の召喚で到達できる最高峰"},
 {id:"神話",name:"神話級",note:"特殊な召喚・攻略報酬向け"},
 {id:"深淵",name:"深淵級",note:"1000階到達後の深淵召喚で解放"},
 {id:"十神",name:"十神",note:"ガチャ排出なし。専用イベント・高難易度限定"}
];
function summonOne({mode="mixed",guaranteedMonster=false,guaranteedEquipment=false,guaranteedRare=false,deep=false}={}){const isMonster=guaranteedMonster||(!guaranteedEquipment&&(mode==="monster"||Math.random()<.30)),rarity=deep?"LR":rarityRoll(guaranteedRare?"guaranteed":"normal");if(isMonster){let pool=Object.values(SPECIES).filter(sp=>sp.rarity!=="十神"&&!sp.isTenGod&&!sp.tags?.includes?.("tenGod"));if(deep)pool=pool.filter(sp=>(sp.minFloor??0)>=70);else pool=pool.filter(sp=>sp.rarity!=="深淵"&&!sp.isAbyss&&!sp.tags?.includes?.("abyss"));if(!pool.length)pool=Object.values(SPECIES).filter(sp=>sp.rarity!=="十神"&&!sp.isTenGod);const speciesId=pool[Math.floor(Math.random()*pool.length)].id,stars=deep?5:({N:1,R:1,SR:2,SSR:3,LR:4}[rarity]??1),m=createMonster(speciesId,{stars,nickname:SPECIES[speciesId].name,obtainedMethod:"summon",obtainedFloor:save.state.player.maxFloor});m.summonRarity=rarity;if(deep)m.summonTier="深淵";save.state.monsters.push(m);save.state.codex.captures[speciesId]=(save.state.codex.captures[speciesId]??0)+1;save.state.codex.encounters[speciesId]=(save.state.codex.encounters[speciesId]??0)+1;return{type:"monster",rarity,displayRarity:deep?"深淵":rarity,name:displayName(m),icon:SPECIES[speciesId].emoji,item:m}}const slot=["weapon","armor","accessory"][Math.floor(Math.random()*3)],item=createEquipment(slot,{rarity});if(deep){item.summonTier="深淵";item.name=`深淵・${item.name}`}receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;return{type:"equipment",rarity,displayRarity:deep?"深淵":rarity,name:item.name,icon:{weapon:"⚔️",armor:"🛡️",accessory:"💍"}[slot],item}}
function rarityGuideHtml(){const unlocked=hasCleared1000(save.state),visible=SUMMON_RARITY_INFO.filter(r=>unlocked||!["深淵","十神"].includes(r.id));return`<div class="rarity-guide">${visible.map((r,i)=>`<div class="rarity-guide-row rarity-guide-${r.id}"><span>${i+1}</span><b>${r.id}</b><strong>${r.name}</strong><small>${r.note}</small></div>`).join("")}</div>${unlocked?'<p class="rarity-guide-note">下に行くほど上位。十神はすべてのガチャから排出されません。</p>':'<p class="rarity-guide-note">下に行くほど上位です。</p>'}` }
function openRarityGuide(){app.insertAdjacentHTML("beforeend",Modal("レア度一覧",rarityGuideHtml(),"閉じる"));topModalButton().onclick=closeTopModal}
function openGacha(){const key=localDayKey(),daily=save.state.gacha.lastDailyKey!==key,first=!save.state.gacha.firstTenUsed;const body=`<div class="gacha-head"><b>召喚を選択</b><div class="gacha-head-actions"><span>💎 ${save.state.player.crystals}</span><button type="button" id="openRarityGuide" class="rarity-help" aria-label="レア度一覧">？</button></div></div><div class="gacha-menu">${first?'<button data-gacha="first"><b>初回限定 無料10連</b><small>SR以上モンスター1体確定</small></button>':''}<button data-gacha="daily" ${daily?'':'disabled'}><b>1日1回 無料召喚</b><small>${daily?'モンスター・装備から抽選':'本日分は召喚済み'}</small></button><button data-gacha="monster-single"><b>🧌 モンスター召喚　💎5</b><small>モンスター100%</small></button><button data-gacha="monster-ten"><b>🧌 モンスター10連　💎45</b><small>最後の1体はSR以上</small></button><button data-gacha="equipment-single"><b>⚔️ 装備召喚　💎5</b><small>武器・防具・装飾品100%</small></button><button data-gacha="equipment-ten"><b>⚔️ 装備10連　💎45</b><small>最後の1枠はSR以上</small></button></div>`;app.insertAdjacentHTML("beforeend",Modal("🔮 召喚の祭壇",body,"閉じる"));document.querySelectorAll("[data-gacha]").forEach(b=>b.onclick=()=>performGacha(b.dataset.gacha));document.getElementById("openRarityGuide")?.addEventListener("click",openRarityGuide);topModalButton().onclick=closeTopModal}
function openDeepGacha(){if(!hasCleared1000(save.state))return alert("深淵召喚は1000階の支配者撃破後に解放されます");const body=`<div class="gacha-head deep"><b>深淵の力を召喚する</b><div class="gacha-head-actions"><span>💎 ${save.state.player.crystals}</span><button type="button" id="openRarityGuide" class="rarity-help">？</button></div></div><div class="gacha-menu deep-gacha-menu"><button data-deep-gacha="monster-single"><b>🌌 深淵モンスター召喚　💎25</b><small>深層モンスターの深淵個体を召喚</small></button><button data-deep-gacha="monster-ten"><b>🌌 深淵モンスター10連　💎225</b><small>10体すべて深淵個体</small></button><button data-deep-gacha="equipment-single"><b>🗡️ 深淵装備召喚　💎25</b><small>深淵の名を冠するLR装備</small></button><button data-deep-gacha="equipment-ten"><b>🗡️ 深淵装備10連　💎225</b><small>10個すべて深淵装備</small></button></div><p class="gacha-footnote">十神は深淵召喚からも排出されません。</p>`;app.insertAdjacentHTML("beforeend",Modal("🌌 深淵召喚",body,"閉じる"));document.querySelectorAll("[data-deep-gacha]").forEach(b=>b.onclick=()=>performDeepGacha(b.dataset.deepGacha));document.getElementById("openRarityGuide")?.addEventListener("click",openRarityGuide);topModalButton().onclick=closeTopModal}
function performGacha(type){let count=1,cost=0,mode="mixed";if(type==="first"){if(save.state.gacha.firstTenUsed)return;count=10;mode="monster";save.state.gacha.firstTenUsed=true}else if(type==="daily"){const key=localDayKey();if(save.state.gacha.lastDailyKey===key)return;save.state.gacha.lastDailyKey=key}else{mode=type.startsWith("monster")?"monster":"equipment";if(type.endsWith("single"))cost=5;else{cost=45;count=10}}if(save.state.player.crystals<cost)return alert("魔晶石が足りない");save.state.player.crystals-=cost;const results=[];for(let i=0;i<count;i++){const last=i===count-1;results.push(summonOne({mode,guaranteedMonster:mode==="monster",guaranteedEquipment:mode==="equipment",guaranteedRare:count===10&&last}))}showSummonResults(results)}
function performDeepGacha(type){const mode=type.startsWith("monster")?"monster":"equipment",count=type.endsWith("ten")?10:1,cost=count===10?225:25;if(save.state.player.crystals<cost)return alert("魔晶石が足りない");save.state.player.crystals-=cost;const results=Array.from({length:count},()=>summonOne({mode,guaranteedMonster:mode==="monster",guaranteedEquipment:mode==="equipment",deep:true}));showSummonResults(results,true)}
function showSummonResults(results,deep=false){save.save();closeTopModal();app.insertAdjacentHTML("beforeend",Modal(deep?"深淵召喚結果":"召喚結果",`<div class="gacha-results">${results.map(r=>`<div class="rarity-${r.rarity} ${r.displayRarity==="深淵"?'rarity-deep':''}"><span>${r.icon}</span><b>[${r.displayRarity??r.rarity}] ${r.name}</b><small>${r.type==="monster"?"モンスター":"装備"} NEW</small></div>`).join("")}</div><p class="muted">残り 💎${save.state.player.crystals}</p>`,"ホームへ"));topModalButton().onclick=()=>{closeTopModal();render()}}
function openCodexHub(){app.insertAdjacentHTML("beforeend",Modal("📖 図鑑",`<div class="codex-hub"><button data-open-codex="monster"><span>📖</span><b>モンスター図鑑</b><small>遭遇・捕獲した魔物を確認</small></button><button data-open-codex="equipment"><span>🗡️</span><b>装備図鑑</b><small>発見した装備を確認</small></button></div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-open-codex]").forEach(b=>b.onclick=()=>{modal.remove();openCodex(b.dataset.openCodex)});modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()}
function codexVisibleRarity(rarity){return !hasCleared1000(save.state)&&["深淵","十神"].includes(rarity)?"？？？":rarity}
function openMonsterCodexDetail(speciesId,seen,index){const sp=SPECIES[speciesId];if(!sp)return;if(!seen){app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} 未遭遇`,`<div class="codex-detail unknown-detail"><div class="codex-detail-icon">❔</div><p>このモンスターの情報はまだ記録されていません。</p></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal;return}const owned=save.state.monsters.filter(m=>m.speciesId===speciesId),captured=save.state.codex.captures[speciesId]??owned.length,base=sp.baseStats??{};app.insertAdjacentHTML("beforeend",Modal(`${sp.emoji} No.${String(index+1).padStart(3,"0")} ${sp.name}`,`<div class="codex-detail"><div class="codex-detail-head"><span>${sp.emoji}</span><div><b>${codexVisibleRarity(sp.rarity)} / ${elementLabel(sp.element)}</b><small>${sp.race??"不明"} / ${sp.role??"不明"}</small></div></div><div class="detail-stat-grid"><span>HP ${base.hp??"-"}</span><span>ATK ${base.atk??"-"}</span><span>DEF ${base.def??"-"}</span><span>SPD ${base.spd??"-"}</span></div><div class="codex-info-list"><p><b>遭遇</b>${save.state.codex.encounters[speciesId]??0}回</p><p><b>捕獲</b>${captured}回</p><p><b>出現階層</b>${sp.minFloor??"?"}階〜</p><p><b>捕獲率</b>${Math.round((sp.captureRate??0)*100)}%</p><p><b>主なスキル</b>${(sp.skills??[]).map(x=>x.name).join("、")||"不明"}</p></div></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal}
function openEquipmentCodexDetail(name){const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],items=all.filter(i=>i.name===name);if(!items.length)return;const best=[...items].sort((a,b)=>(RARITY_ORDER[b.rarity]??0)-(RARITY_ORDER[a.rarity]??0)||(b.plus??0)-(a.plus??0))[0],stats=Object.entries(best.stats??{}).map(([k,v])=>`<span>${equipmentStatLabel(k)} +${v}</span>`).join("");app.insertAdjacentHTML("beforeend",Modal(`${best.slot==="weapon"?"⚔️":best.slot==="armor"?"🛡️":"💍"} ${name}`,`<div class="codex-detail"><p><b>[${codexVisibleRarity(best.rarity)}] ${slotLabel(best.slot)}</b></p><div class="detail-stat-grid">${stats||"<span>能力補正なし</span>"}</div><div class="codex-info-list"><p><b>所持数</b>${items.length}</p><p><b>最高強化</b>+${Math.max(...items.map(i=>i.plus??0))}</p><p><b>シリーズ</b>${best.series??"なし"}</p><p><b>装備規則</b>${best.handedness??"通常"}</p></div></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal}
function openCodex(type){if(type==="monster"){const owned=new Set(save.state.monsters.map(m=>m.speciesId)),sorted=Object.values(SPECIES).sort((a,b)=>(a.minFloor??0)-(b.minFloor??0)),rows=sorted.map((sp,i)=>{const seen=(save.state.codex.encounters[sp.id]??0)>0||owned.has(sp.id),captured=save.state.codex.captures[sp.id]??save.state.monsters.filter(m=>m.speciesId===sp.id).length,rarity=seen?codexVisibleRarity(sp.rarity):"";return`<button class="codex-row ${seen?"":"unknown"}" data-codex-monster="${sp.id}" data-codex-index="${i}" data-codex-seen="${seen?1:0}"><span>${seen?sp.emoji:"❔"}</span><b>No.${String(i+1).padStart(3,"0")} ${seen?sp.name:"？？？？？"}</b><small>${seen?`${rarity} / ${elementLabel(sp.element)} / 遭遇 ${save.state.codex.encounters[sp.id]??0} / 捕獲 ${captured}`:"未遭遇"}</small></button>`}).join("");app.insertAdjacentHTML("beforeend",Modal("📖 モンスター図鑑",`<div class="codex-summary">発見 ${sorted.filter(sp=>(save.state.codex.encounters[sp.id]??0)>0||owned.has(sp.id)).length} / ${sorted.length}</div><div class="codex-list">${rows}</div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-codex-monster]").forEach(b=>b.onclick=()=>openMonsterCodexDetail(b.dataset.codexMonster,b.dataset.codexSeen==="1",Number(b.dataset.codexIndex)))}else{const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],names=[...new Set(all.map(i=>i.name))],rows=names.length?names.map(name=>{const items=all.filter(i=>i.name===name),best=[...items].sort((a,b)=>(RARITY_ORDER[b.rarity]??0)-(RARITY_ORDER[a.rarity]??0))[0];return`<button class="codex-row" data-codex-equipment="${name.replaceAll('"','&quot;')}"><span>${best.slot==="weapon"?"⚔️":best.slot==="armor"?"🛡️":"💍"}</span><b>[${codexVisibleRarity(best.rarity)}] ${name}</b><small>${slotLabel(best.slot)} / 所持 ${items.length}</small></button>`}).join(""):'<div class="empty">まだ装備を発見していません</div>';app.insertAdjacentHTML("beforeend",Modal("🗡️ 装備図鑑",`<div class="codex-summary">発見 ${names.length}種</div><div class="codex-list">${rows}</div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-codex-equipment]").forEach(b=>b.onclick=()=>openEquipmentCodexDetail(b.dataset.codexEquipment))}topModalButton().onclick=closeTopModal}
function enhanceEquipment(id){openEquipmentEnhancement(id)}
function equipmentEnhancementBody(item){
 const materials=enhancementMaterialCandidates(save.state,item.id),level=Math.max(1,item.level??1),need=equipmentExpNeed(level),progress=Math.floor(((item.exp??0)/need)*100);
 const rows=materials.slice(0,120).map(material=>{const exp=equipmentMaterialExp(material,item),same=material.name===item.name;return`<label class="equipment-material-row ${same?"same-name":""}"><input type="checkbox" data-equipment-material="${material.id}"><span><b>[${material.rarity}] ${material.name}</b><small>Lv.${material.level??1}${material.plus?` / +${material.plus}`:""}${same?" / 同名基礎EXP×5":""}${(material.level??1)>1||material.exp?" / 育成EXP100%継承":""}</small></span><strong>+${exp.toLocaleString()} EXP</strong></label>`}).join("")||'<div class="empty">素材にできる装備がありません。<br><small>装備中・お気に入り・ロック中は表示されません。</small></div>';
 const growthRecords=`<section class="equipment-growth-records"><div class="section-label">育成記録</div>${item.slot==="weapon"?weaponMasterySummary(item):""}${item.series?seriesMasterySummary(save.state,item.series):'<p class="growth-record-empty">シリーズ装備ではありません</p>'}</section>`;
 return`<div class="equipment-enhancement"><div class="enhancement-target compact"><div class="enhancement-title-row"><div><small>INFINITE ENHANCEMENT</small><h3>[${item.rarity}] ${item.name}</h3></div><strong>Lv.${level}<small> ∞</small></strong></div><div class="enhancement-status-row infinite"><span>レベル上限なし</span><span>次Lvまで ${(need-(item.exp??0)).toLocaleString()}</span></div><div class="equipment-exp large"><i style="width:${progress}%"></i></div><p>EXP ${(item.exp??0).toLocaleString()} / ${need.toLocaleString()}</p></div>${growthRecords}<section class="equipment-feed-panel"><div class="section-label">素材を選択</div><div class="enhancement-tools"><button data-material-preset="same">同名</button><button data-material-preset="low">N・R</button><button data-material-preset="all">全選択</button><button data-material-preset="none">解除</button></div><div class="enhancement-preview" id="enhancementPreview"><b>素材 0個</b><span>獲得EXP 0</span><small>強化後 Lv.${level}</small></div><p class="muted compact-note">育成済み装備は投入EXPを100%継承。同名ボーナス×5は基礎素材EXPだけに適用され、EXP増殖は起きません。</p><div class="equipment-material-list">${rows}</div><button id="executeEquipmentEnhancement" class="primary sticky-enhance-button" disabled>選択した装備で強化</button></section></div>`
}
function openEquipmentEnhancement(id){
 const item=save.state.equipment.find(i=>i.id===id);if(!item)return;
 app.insertAdjacentHTML("beforeend",Modal("🔨 装備育成",equipmentEnhancementBody(item),"閉じる"));const modal=topModal(),selectedMaterials=new Set();
 const refreshPreview=()=>{const ids=[...selectedMaterials],materials=ids.map(mid=>save.state.equipment.find(i=>i.id===mid)).filter(Boolean),total=materials.reduce((sum,m)=>sum+equipmentMaterialExp(m,item),0),projected=projectEquipmentGrowth(item,total),preview=modal.querySelector("#enhancementPreview"),execute=modal.querySelector("#executeEquipmentEnhancement");if(!preview||!execute)return;preview.innerHTML=`<b>素材 ${materials.length}個</b><span>獲得EXP ${total.toLocaleString()}</span><small>強化後 Lv.${projected.level}${projected.level>item.level?`（+${projected.level-item.level}）`:""} / 上限なし</small>`;execute.disabled=!materials.length};
 modal.querySelectorAll("[data-equipment-material]").forEach(input=>input.onchange=()=>{input.checked?selectedMaterials.add(input.dataset.equipmentMaterial):selectedMaterials.delete(input.dataset.equipmentMaterial);refreshPreview()});
 modal.querySelectorAll("[data-material-preset]").forEach(button=>button.onclick=()=>{const mode=button.dataset.materialPreset;selectedMaterials.clear();modal.querySelectorAll("[data-equipment-material]").forEach(input=>{const material=save.state.equipment.find(i=>i.id===input.dataset.equipmentMaterial),pick=mode==="all"||mode==="same"&&material?.name===item.name||mode==="low"&&["N","R"].includes(material?.rarity);input.checked=pick;if(pick)selectedMaterials.add(input.dataset.equipmentMaterial)});refreshPreview()});
 modal.querySelector("#executeEquipmentEnhancement")?.addEventListener("click",()=>{const ids=[...selectedMaterials];if(!ids.length)return;const materials=ids.map(mid=>save.state.equipment.find(i=>i.id===mid)).filter(Boolean),total=materials.reduce((sum,m)=>sum+equipmentMaterialExp(m,item),0);if(!confirm(`${materials.length}個を素材にしますか？\n獲得EXP ${total.toLocaleString()}\n育成済みEXPは100%引き継がれます。`))return;const beforeOwner=item.equippedBy?save.state.monsters.find(m=>m.id===item.equippedBy):null,beforeStats=beforeOwner?calculatedStats(beforeOwner):null,beforeMp=beforeOwner?maxMp(beforeOwner):null,result=consumeEquipmentMaterials(save.state,item.id,ids);if(!result.ok)return alert(result.message);if(beforeOwner)preserveVitals(beforeOwner,beforeStats,beforeMp);save.save();modal.remove();showToast(result.gained?`${item.name} Lv.${item.level}へ！`:`${result.amount.toLocaleString()} EXP獲得`);render();openEquipmentEnhancement(item.id)});
 modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove();refreshPreview();
}
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
  ["potions","🌿","薬草","単体HP100＋最大HP10%回復",160],
  ["highPotions","🧪","ハイポーション","単体HP300＋最大HP25%回復",480],
  ["partyPotions","💚","全体回復薬","生存者全員HP50＋最大HP7%回復",620],
  ["manaPotions","💧","マナポーション","単体MP30＋最大MP10%回復",240],
  ["highManaPotions","🔷","ハイマナポーション","単体MP100＋最大MP25%回復",680],
  ["partyManaPotions","🌊","全体マナポーション","生存者全員MP30＋最大MP7%回復",900],
  ["fullManaPotions","💠","精霊の雫","単体MP全回復",1200],
  ["partyFullManaPotions","🌀","深淵の霊水","生存者全員MP全回復",3600],
  ["reviveLeaves","🍃","命の葉","HP30%で蘇生",900],
  ["statusCures","🩹","万能薬・単体","単体の異常解除",300],
  ["partyStatusCures","💨","万能薬・全体","全員の異常解除",980],
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
 const body=`<div class="shop-list">${items.map(([id,icon,name,desc,base])=>{const price=type==="gear"?shopPrice(base):base;const owned=type==="gear"?null:(save.state.inventory[id]??0);return`<button data-shop-buy="${id}" data-shop-price="${price}"><span>${icon}</span><b>${name}</b><small>${desc}${owned==null?"":`<br><strong class="shop-owned">所持 ${owned}</strong>`}</small><em>${price}G</em></button>`}).join("")}</div>`;
 app.insertAdjacentHTML("beforeend",Modal(title,body,"閉じる"));
 document.querySelectorAll("[data-shop-buy]").forEach(b=>b.onclick=()=>buyShopItem(b.dataset.shopBuy,Number(b.dataset.shopPrice)));
 topModalButton().onclick=closeTopModal
}
function buyShopItem(type,cost){
 if(save.state.player.gold<cost)return ensureGold(cost,()=>buyShopItem(type,cost));
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
 save.save();closeTopModal();render();purchaseResult(title,body)
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
function currentDanger(){return dangerConfig(save.state.player.dangerLevel??1)}
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
 const opened=save.state.player.openedChests[floor]??[],chests=[],treasureRoom=rng()<Math.min(.12,.035+Math.floor(floor/10)*.002),count=treasureRoom?7+Math.floor(rng()*4):(rng()<.16?0:rng()<.72?1:2);
 for(let i=0;i<count;i++){const roll=rng(),kind=treasureRoom?(roll>.48?"radiant":"cabinet"):roll>.96?"radiant":roll>.78?"cabinet":roll>.25?"box":"apple",locked=kind==="radiant"&&rng()<(treasureRoom?.58:.45),mimic=treasureRoom&&rng()<.5,emoji=mimic?"🧰":locked?"🔒":{apple:"🪎",box:"📦",cabinet:"🗃️",radiant:"✨📦"}[kind],p=pick();chests.push({...p,id:`${floor}-${i}`,kind,emoji,locked,mimic,open:opened.includes(`${floor}-${i}`)})}
 const shopChance=floor%10===0?.35:.09,shop=rng()<shopChance?{...pick(),active:true}:null;if(shop)save.state.player.nextShopFloor=floor+3+Math.floor(rng()*8);
 const boss=floor%10===0?{...pick(),active:true}:null;
 return{cols,rows,shape,tiles,start:startCell,exit:{...exit},shop,boss,chests,treasureRoom,steps:0,nextEncounter:10+Math.floor(rng()*23),encountering:false}
}
function currentSnapshot(){game.world.encountering=false;game.player.path=[];game.player.p=0;game.player.rx=game.player.x;game.player.ry=game.player.y;return{world:game.world,player:game.player,partyTrail:game.partyTrail,cameraData:{x:game.camera.x,y:game.camera.y,z:game.camera.z,ox:game.camera.ox,oy:game.camera.oy,manual:game.camera.manual}}}
function bindExplore(){
 recordBiomeFloor(save.state,save.state.player.currentFloor);save.save();
 if(shouldPlaySecondWorldIntro(save.state)){setTimeout(()=>playSecondWorldIntro(),80);return}
 const canvas=document.getElementById("gameCanvas"),r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
 canvas.width=r.width*d;canvas.height=r.height*d;
 const mini=document.getElementById("miniMap");mini.width=132*d;mini.height=132*d;
 game=snapshot??{world:maze(),player:null,camera:null,paused:false,running:true,input:createInputState()};
 game.input=createInputState();game.player??=new Entity(game.world.start.x,game.world.start.y);game.world.encountering=false;game.player.path=[];game.player.p=0;game.partyTrail=Array.isArray(game.partyTrail)&&game.partyTrail.length?game.partyTrail:[{x:game.player.rx??game.player.x,y:game.player.ry??game.player.y}];
 if(!Number.isFinite(game.player.x)||!Number.isFinite(game.player.y)){game.player.x=game.world.start.x;game.player.y=game.world.start.y}
 game.player.rx=game.player.x;game.player.ry=game.player.y;game.camera=new Camera(canvas);
 if(snapshot?.cameraData)Object.assign(game.camera,snapshot.cameraData);else game.camera.reset(game.player.x*TILE,game.player.y*TILE);
 game.camera.clamp(game.world);game.ctx=canvas.getContext("2d");game.running=true;game.paused=false;bindInput(canvas);game.last=performance.now();requestAnimationFrame(loop);
 bindMovableMapToggle();bindExploreMonsterLongPress();showFloorTutorial();if(shouldPlayTenGodFirstContact(save.state)&&!game.world.treasureRoom)setTimeout(()=>playTenGodFirstContact(),300);else if(save.state.player.currentFloor>=1002&&!game.world.treasureRoom)setTimeout(()=>showSecondWorldRandomEvent(),260);if(game.world.treasureRoom&&!game.world.treasureNoticeShown){game.world.treasureNoticeShown=true;game.paused=true;setTimeout(()=>{pauseModal("💰 宝物庫を発見",`<p>部屋中に宝箱が並んでいる。</p><p class="muted">約半数は強力なミミック。鍵付きの箱には高レア装備が眠る。</p>`);},420)}
 document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world)};
 document.getElementById("pauseParty").onclick=openPartyEditor;
 document.getElementById("resourceHelp")?.addEventListener("click",openResourceHelp);
 document.querySelectorAll("[data-resource-help]").forEach(b=>b.addEventListener("click",openResourceHelp));
 document.getElementById("fieldEquipment").onclick=()=>{snapshot=currentSnapshot();stopGame();navigationOrigin="explore";go("equipment")};
 document.getElementById("pauseItems").onclick=openFieldItems;
 document.getElementById("returnHome").onclick=()=>{
  if(!confirm(`${save.state.player.currentFloor}階から帰還する？\n探索報酬を受け取って拠点へ戻ります。`))return;
  stopGame();snapshot=null;const result=claimManualReturn(save.state);save.state.player.inRun=false;save.save();
  const rarityRank={N:0,R:1,SR:2,SSR:3,LR:4},best=result.equipment.reduce((a,x)=>!a||rarityRank[x.item.rarity]>rarityRank[a.item.rarity]?x:a,null);
  const equipmentRows=result.equipment.length?result.equipment.map(({item,receipt})=>`<div class="return-reward-item rarity-${item.rarity}"><b>${item.rarity} ${item.name}</b><small>${receipt.message}</small></div>`).join(""):'<p class="muted">今回は装備ドロップなし</p>';
  const highlight=best&&["SSR","LR"].includes(best.item.rarity)?`<div class="return-reward-highlight rarity-${best.item.rarity}"><strong>${best.item.rarity} DROP!</strong><span>${best.item.name}</span></div>`:"";
  const grade=returnRewardGrade(result.floorsCleared,result.equipment);app.insertAdjacentHTML("beforeend",Modal("探索帰還報告",`<div class="return-reward-report">${highlight}${returnGradeBadge(grade)}<p><b>${result.startFloor}F → ${result.endFloor}F</b></p><p>踏破階層 <b>${result.floorsCleared}階</b></p><p>獲得GOLD <b>${result.gold.toLocaleString()}G</b></p><h3>獲得装備 ${result.equipment.length}個</h3><div class="return-reward-items">${equipmentRows}</div>${returnRarityTable()}</div>`,"拠点へ戻る"));
  const modal=topModal(),finish=()=>{modal?.remove();go("home")};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;
 }
}
function openResourceHelp(){
 const body=`<div class="resource-help-list"><p><b>現在階層</b><span>探索している階層です。</span></p><p><b>🪙 ゴールド</b><span>ショップ・装備・育成に使用します。</span></p><p><b>💎 魔晶石</b><span>ゴールド変換や召喚など、特別な用途に使用します。</span></p><p><b>📀 捕獲結晶</b><span>弱らせた魔物を捕獲するときに消費します。</span></p><p><b>🔑 深淵の鍵</b><span>鍵付き宝箱を開けるために使用します。</span></p></div>`;
 app.insertAdjacentHTML("beforeend",Modal("アイコン説明",body,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
const FLOOR_TUTORIALS={
 1:{title:"戦闘の基本",body:"まずは歩いて敵と遭遇しよう。『たたかう』『スキル』『ガード』を使い分け、スライムLv.1を倒して最初のレベルを上げよう。"},
 2:{title:"捕獲",body:"敵はHPを減らすほど捕獲しやすくなる。捕獲結晶には限りがあるので、欲しい相手を弱らせてから使おう。"},
 3:{title:"編成",body:"捕まえた仲間は『編成』から出撃できる。最大4体まで。倒れた仲間にはEXPが入らず、生存者へ再分配される。"},
 4:{title:"装備",body:"武器・防具・アクセで能力が変わる。『装備』の自動装備も使えるが、役割に合わせた手動調整も強力。"},
 5:{title:"複数の敵",body:"この階から敵が2体で現れることがある。敵をタップして攻撃対象を変更し、危険な相手から倒そう。"}
};
function showFloorTutorial(){
 const floor=save.state.player.currentFloor,tutorial=FLOOR_TUTORIALS[floor];
 if(!tutorial||save.state.settings.tutorialSeen?.[floor])return;
 // 表示予約の時点で保存する。戦闘後の探索画面再生成でも二重表示されない。
 save.state.settings.tutorialSeen??={};save.state.settings.tutorialSeen[floor]=true;save.save();
 game.paused=true;setTimeout(()=>{
  if(!game?.running)return;
  app.insertAdjacentHTML("beforeend",Modal(`${floor}階チュートリアル：${tutorial.title}`,`<p>${tutorial.body}</p><p class="muted">自動表示はこの1回だけです。設定の「チュートリアル一覧」からいつでも読み返せます。</p>`,`探索開始`));
  topModalButton().onclick=()=>{closeTopModal();if(game)game.paused=false}
 },120)
}
function openTutorialBook(){
 const rows=Object.entries(FLOOR_TUTORIALS).map(([floor,t])=>`<button class="tutorial-book-row" data-tutorial-floor="${floor}"><span>${floor}F</span><div><b>${t.title}</b><small>${t.body}</small></div><em>›</em></button>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("📖 チュートリアル一覧",`<div class="tutorial-book">${rows}</div><p class="muted">ここで読み返しても、自動表示の状態は変更されません。</p>`,`閉じる`));
 const modal=topModal();modal.querySelectorAll("[data-tutorial-floor]").forEach(button=>button.onclick=()=>{const floor=button.dataset.tutorialFloor,t=FLOOR_TUTORIALS[floor];app.insertAdjacentHTML("beforeend",Modal(`${floor}階：${t.title}`,`<p>${t.body}</p>`,`一覧へ戻る`));topModalButton().onclick=closeTopModal});modal.querySelector("[data-modal-primary]").onclick=closeTopModal
}
function exploreMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const st=calculatedStats(m),need=expNeed(m),remain=Math.max(0,need-m.exp),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");app.insertAdjacentHTML("beforeend",Modal(`${SPECIES[m.speciesId].emoji} ${displayName(m)}`,`<div class="explore-detail"><p><b>Lv.${m.level}　★${m.stars}　+${m.plus}</b></p><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${SPECIES[m.speciesId].race}族 / ${SPECIES[m.speciesId].role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p><b>EXP ${m.exp.toLocaleString()} / ${need.toLocaleString()}</b><br><small>次のレベルまであと ${remain.toLocaleString()}</small></p><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,`閉じる`));topModalButton().onclick=()=>{const mods=document.querySelectorAll(".game-modal");mods[mods.length-1]?.remove()}}
function bindExploreMonsterLongPress(){document.querySelectorAll("[data-explore-monster]").forEach(el=>el.onclick=()=>exploreMonsterDetail(el.dataset.exploreMonster))}
function bindMovableMapToggle(){const b=document.getElementById("miniMapToggle"),stage=document.querySelector(".explore-stage");if(!b||!stage)return;let timer=null,drag=false,offset={x:0,y:0};const place=e=>{const r=stage.getBoundingClientRect(),br=b.getBoundingClientRect(),x=Math.max(4,Math.min(r.width-br.width-4,e.clientX-r.left-offset.x)),y=Math.max(4,Math.min(r.height-br.height-4,e.clientY-r.top-offset.y));b.style.left=`${x}px`;b.style.top=`${y}px`;b.style.right="auto";save.state.settings.mapTogglePosition={x:Math.round(x),y:Math.round(y)}};b.onpointerdown=e=>{const br=b.getBoundingClientRect();offset={x:e.clientX-br.left,y:e.clientY-br.top};timer=setTimeout(()=>{drag=true;navigator.vibrate?.(20);b.classList.add("dragging");b.setPointerCapture?.(e.pointerId)},420)};b.onpointermove=e=>{if(drag)place(e)};b.onpointerup=e=>{clearTimeout(timer);if(drag){place(e);save.save();drag=false;b.classList.remove("dragging");return}save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();b.textContent=save.state.settings.minimapVisible?"MAP ON":"MAP OFF"};b.onpointercancel=()=>{clearTimeout(timer);drag=false;b.classList.remove("dragging")}}
function itemCount(type){return save.state.inventory[type]??0}
function openFieldItems(){
 game.paused=true;const items=[["potions","❤️","単体回復","HP100＋最大HP10%回復"],["highPotions","🧪","単体大回復","HP300＋最大HP25%回復"],["partyPotions","💚","全体回復","全員HP50＋最大HP7%回復"],["manaPotions","💧","単体MP回復","MP30＋最大MP10%回復"],["highManaPotions","🔷","単体MP大回復","MP100＋最大MP25%回復"],["partyManaPotions","🌊","全体MP回復","全員MP30＋最大MP7%回復"],["fullManaPotions","💠","単体MP全回復","MPを全回復"],["partyFullManaPotions","🌀","全体MP全回復","全員のMPを全回復"],["statusCures","🩹","状態異常回復・単体","単体の状態異常を解除"],["partyStatusCures","💨","状態異常回復・全体","全員の状態異常を解除"],["fullHeals","✨","全回復＋異常回復・単体","単体を完全回復"],["partyFullHeals","🌟","全回復＋異常回復・全体","全員を完全回復"]],targets=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);let targetId=targets[0]?.id;
 const body=`<p class="muted">タップで使用対象を選択／長押しで詳細</p><div class="modal-party-vitals selectable">${targets.map((m,i)=>{const st=calculatedStats(m);return`<button class="${i===0?"selected":""}" data-field-target="${m.id}"><b>${displayName(m)} Lv.${m.level}</b><small>HP ${m.currentHp??st.hp}/${st.hp}　MP ${m.currentMp??maxMp(m)}/${maxMp(m)}</small></button>`}).join("")}</div><div class="field-item-grid">${items.filter(([id])=>itemCount(id)>0).map(([id,icon,name,desc])=>`<button data-field-item="${id}"><span>${icon}</span><b>${name}</b><small>${desc}</small><em>×${itemCount(id)}</em></button>`).join("")||'<div class="empty">使用できるアイテムを持っていません</div>'}</div>`;
 app.insertAdjacentHTML("beforeend",Modal("持ち物",body,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-field-target]").forEach(el=>{let timer,moved=false;const cancel=()=>{clearTimeout(timer);timer=null};el.onpointerdown=()=>{moved=false;timer=setTimeout(()=>{timer=null;exploreMonsterDetail(el.dataset.fieldTarget)},520)};el.onpointermove=()=>moved=true;el.onpointerup=()=>{if(timer&&!moved){cancel();targetId=el.dataset.fieldTarget;modal.querySelectorAll("[data-field-target]").forEach(x=>x.classList.toggle("selected",x===el))}else cancel()};el.onpointercancel=cancel});modal.querySelectorAll("[data-field-item]").forEach(b=>b.onclick=()=>useFieldItem(b.dataset.fieldItem,targetId));modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();game.paused=false}
}
function clearAilments(m){m.statuses=[];m.status=null;m.ailments=[]}
function scaledRecovery(base,max,rate){return Math.max(1,Math.floor(base+max*rate))}
function useFieldItem(type,targetId){if(itemCount(type)<=0)return;const target=save.state.monsters.find(m=>m.id===targetId),party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean),single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","statusCures","fullHeals"].includes(type);if(single&&!target)return;const list=single?[target]:party;if(single&&target.currentHp<=0)return alert("戦闘不能の仲間には使用できません");const hasAilment=m=>(m.statuses?.length??0)||(m.ailments?.length??0)||m.status;const usable=["potions","highPotions"].includes(type)?target.currentHp<calculatedStats(target).hp:type==="partyPotions"?list.some(m=>m.currentHp>0&&m.currentHp<calculatedStats(m).hp):["manaPotions","highManaPotions","fullManaPotions"].includes(type)?target.currentMp<maxMp(target):["partyManaPotions","partyFullManaPotions"].includes(type)?list.some(m=>m.currentHp>0&&m.currentMp<maxMp(m)):type==="statusCures"?hasAilment(target):type==="partyStatusCures"?list.some(hasAilment):type==="fullHeals"?(target.currentHp<calculatedStats(target).hp||target.currentMp<maxMp(target)||hasAilment(target)):list.some(m=>m.currentHp>0&&(m.currentHp<calculatedStats(m).hp||m.currentMp<maxMp(m)||hasAilment(m)));if(!usable)return alert("もう元気だよ！");if(type==="potions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(100,max,.10))}if(type==="highPotions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(300,max,.25))}if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp;m.currentHp=Math.min(max,m.currentHp+scaledRecovery(50,max,.07))});if(type==="manaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(30,max,.10))}if(type==="highManaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(100,max,.25))}if(type==="partyManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=maxMp(m);m.currentMp=Math.min(max,m.currentMp+scaledRecovery(30,max,.07))});if(type==="fullManaPotions")target.currentMp=maxMp(target);if(type==="partyFullManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>m.currentMp=maxMp(m));if(type==="statusCures"||type==="partyStatusCures")list.forEach(clearAilments);if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});save.state.inventory[type]--;save.save();closeTopModal();snapshot=currentSnapshot();stopGame();render()}
function openPartyEditor(){game.paused=true;app.insertAdjacentHTML("beforeend",Modal("フィールド編成",partyEditorBody("field"),"閉じる"));const modal=topModal();modal.dataset.partyEditorMode="field";bindPartyEditor(modal);const close=()=>{modal.remove();snapshot=currentSnapshot();stopGame();render()};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close}
function enemyLevelForFloor(floor){const band=Math.floor((floor-1)/10),base=band*10+1,jumps=[0,0,1,2,3,5,7,9],variance=jumps[Math.floor(Math.random()*jumps.length)]-(Math.random()<.28?Math.floor(Math.random()*4):0),milestone=floor%50===1&&floor>1?8:floor%25===1&&floor>1?4:0;return Math.max(1,base+Math.floor((floor-1)%10*.58)+variance+milestone)}
function speciesPoolForFloor(floor){
 const biome=biomeForFloor(floor),entries=Object.values(SPECIES).filter(s=>s.minFloor<=floor&&s.minFloor>=Math.max(1,floor-42));
 const safe=entries.filter(s=>floor>=s.minFloor),preferred=safe.filter(sp=>biome.elements.includes(sp.element));
 return preferred.length>=3?[...preferred,...preferred,...safe]:(safe.length?safe:[SPECIES.slime])
}
function randomEnemy(){const floor=save.state.player.currentFloor;if(floor===1)return{speciesId:"slime",level:1,boss:false,equipped:false,gear:null};if(floor>=2&&Math.random()<.006)return{speciesId:"baby_slime",level:Math.max(1,enemyLevelForFloor(floor)),boss:false,equipped:false,gear:null,rareExp:true};const pool=speciesPoolForFloor(floor).filter(s=>s.id!=="baby_slime"),picked=pool[Math.floor(Math.random()*pool.length)],speciesId=picked.id,equipped=floor>=6&&Math.random()<.11,gear=equipped?createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]):null;return{speciesId,level:enemyLevelForFloor(floor),boss:false,equipped,gear}}
function randomEnemyGroup(){const floor=save.state.player.currentFloor;if(floor<=4)return[randomEnemy()];let count=1,r=Math.random();if(floor<10){if(r<.12)count=2}else if(floor<50){if(r<.03)count=3;else if(r<.25)count=2}else{if(r<.08)count=3;else if(r<.35)count=2}const group=Array.from({length:count},randomEnemy);if(group.length===1&&shouldSpawnSecondWorldElite(floor))group[0]=createEliteEncounter(group[0],floor);return group}
function floorBossEnemy(){const floor=save.state.player.currentFloor,pool=speciesPoolForFloor(Math.max(floor,10)).filter(s=>s.minFloor<=floor);const speciesId=(pool[Math.floor(seeded(floorSeed(floor)+991)()*pool.length)]??SPECIES.slime).id;return{speciesId,level:Math.max(14,bossLevelForFloor(floor)),boss:true}}
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
 if(!enemyOverride&&shouldTriggerEmergency(save.state,game.world.steps)){fx.remove();game.world.encountering=false;game.paused=true;triggerEmergencyEncounter();return}
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
   game.player.path=[];game.paused=true;const floor=save.state.player.currentFloor,lines=["ここまで辿り着いたか。だが、ここから先は通さん。","幾度来ようと同じこと。力の差を刻んでやる。","その覚悟、本物かどうか試してやろう。","この階層で朽ちるがいい。","よく来た。ワシを越えられると思うなら、剣を取れ。"];const bossInfo=floorBossEnemy(),name=SPECIES[bossInfo.speciesId].name;app.insertAdjacentHTML("beforeend",Modal(`第${floor}階層の支配者`, `<p>${lines[Math.floor(Math.random()*lines.length)]}</p><p><b>${name} Lv.${bossInfo.level}</b></p>`,"戦う"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();game.paused=false;beginEncounter(bossInfo)};return
  }
  if(game.world.shop&&game.player.x===game.world.shop.x&&game.player.y===game.world.shop.y){
   stopGame();
   snapshot=currentSnapshot();
   save.state.player.nextShopFloor=save.state.player.currentFloor+3+Math.floor(Math.random()*5);
   save.save();screen="shop";render();return
  }
  if(game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){
   if(save.state.player.currentFloor%10===0&&game.world.boss){
    game.player.path=[];game.paused=true;app.insertAdjacentHTML("beforeend",Modal("まだ先へは進めない","<p>この階層の支配者が道を封じている。</p>","戻る"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();game.paused=false};return
   }
   if(save.state.player.currentFloor>=WORLD_MAX_FLOOR){game.player.path=[];game.paused=true;app.insertAdjacentHTML("beforeend",Modal("10000階・最終到達地点","<p>現在実装されている最深部へ到達しました。</p><p class=\"muted\">この先は、まだ閉ざされています。</p>","探索を続ける"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();game.paused=false};return}
   stopGame();snapshot=null;save.state.player.currentFloor++;
   recordManualFloorClear(save.state,save.state.player.currentFloor);
   save.state.player.maxFloor=Math.min(WORLD_MAX_FLOOR,Math.max(save.state.player.maxFloor,save.state.player.currentFloor));
   save.save();if(save.state.player.currentFloor===1001){playSecondWorldIntro();return}go("explore");return
  }
  if(game.world.steps>=game.world.nextEncounter){
   game.world.steps=0;
   game.world.nextEncounter=8+Math.floor(Math.random()*24);
   beginEncounter();return
  }
 }
 updateExplorationPartyTrail();
 game.camera.follow(game.player.rx*TILE,game.player.ry*TILE);
 game.camera.clamp(game.world)
}
function openChest(c){const floor=save.state.player.currentFloor;if(c.locked&&(save.state.inventory.abyssKeys??0)<=0){game.player.path=[];return pauseModal("🔒 鍵付き宝箱",'<p>深淵の鍵が必要だ。</p><p class="muted">鍵は強敵やごく稀な敵ドロップから入手できます。</p>')}if(c.locked)save.state.inventory.abyssKeys--;c.open=true;save.state.player.openedChests[floor]??=[];if(!save.state.player.openedChests[floor].includes(c.id))save.state.player.openedChests[floor].push(c.id);recordBiomeChest(save.state,floor,c.id);save.state.records.chests++;if(c.mimic){save.save();game.player.path=[];pauseModal("！？","<p>宝箱が牙を剥いた！</p>");setTimeout(()=>{closeTopModal();game.paused=false;beginEncounter({speciesId:"mimic",level:Math.max(enemyLevelForFloor(floor)+12,Math.round(floor*1.5)),boss:false,equipped:true,gear:createEquipment("accessory",{rarity:"SR"})})},650);return}let title="宝箱",body="";if(c.kind==="apple"){save.state.inventory.potions++;title="🪎 深淵の果実";body="回復薬を1個獲得"}else if(c.kind==="box"){if(Math.random()<.5){const gold=80+floor*12;save.state.player.gold+=gold;body=`${gold}Gを獲得`}else{const item=createEquipment("weapon"),receipt=equipmentReceipt(item);body=equipmentReceiptText(receipt)}}else{const rarity=c.locked?(Math.random()<.25?"LR":"SSR"):c.kind==="radiant"?(Math.random()<.35?"LR":"SSR"):(Math.random()<.35?"SSR":"SR"),item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],{rarity}),receipt=equipmentReceipt(item);title=c.locked?"🔓 鍵付き宝箱":c.kind==="radiant"?"✨ 輝く宝箱":"🗃️ 古い収納箱";body=`${equipmentReceiptText(receipt)}<br>${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}`}save.save();pauseModal(title,body)}
function explorationPartyMembers(){return(save.state.party??[]).map(id=>save.state.monsters?.find(monster=>monster.id===id)).filter(Boolean)}
function explorationLeaderEmoji(){const leader=explorationPartyMembers()[0];return SPECIES[leader?.speciesId]?.emoji??"😈"}
function updateExplorationPartyTrail(){
 if(!game?.player)return;
 const point={x:game.player.rx,y:game.player.ry};
 game.partyTrail??=[point];
 const latest=game.partyTrail[0];
 if(!latest||Math.hypot(point.x-latest.x,point.y-latest.y)>=.025)game.partyTrail.unshift(point);
 if(game.partyTrail.length>260)game.partyTrail.length=260
}
function explorationFollowerPosition(index){
 const spacing=.78*index,trail=game.partyTrail??[],fallback={x:game.player.rx,y:game.player.ry};
 if(!trail.length)return fallback;
 let remaining=spacing;
 for(let i=0;i<trail.length-1;i++){
  const a=trail[i],b=trail[i+1],segment=Math.hypot(b.x-a.x,b.y-a.y);
  if(segment>=remaining){const ratio=segment?remaining/segment:0;return{x:a.x+(b.x-a.x)*ratio,y:a.y+(b.y-a.y)*ratio}}
  remaining-=segment
 }
 return trail[trail.length-1]??fallback
}
function drawExplorationParty(){
 const members=explorationPartyMembers();
 for(let index=members.length-1;index>=1;index--){const monster=members[index],position=explorationFollowerPosition(index);emoji(position,SPECIES[monster.speciesId]?.emoji??"👾",false,.88)}
 emoji({x:game.player.rx,y:game.player.ry},explorationLeaderEmoji(),true,1)
}
function draw(){const c=game.ctx,w=game.world,palette=worldPresentationForFloor(save.state.player.currentFloor);c.fillStyle=palette.background;c.fillRect(0,0,game.canvas.width,game.canvas.height);for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){const p=game.camera.world(x*TILE,y*TILE),s=TILE*game.camera.z;c.fillStyle=w.tiles[y][x]?palette.wall:palette.floor;c.fillRect(p.x,p.y,s+1,s+1)}emoji(w.exit,"🕳️");if(w.shop)emoji(w.shop,"🚪");if(w.boss)emoji(w.boss,"👹",true);w.chests.forEach(x=>!x.open&&emoji(x,x.emoji,false));drawExplorationParty();drawMini()}
function emoji(o,t,glow=false,scale=1){const p=game.camera.world(o.x*TILE,o.y*TILE),pulse=glow?1+Math.sin(performance.now()/170)*.12:1;game.ctx.save();if(glow){game.ctx.shadowColor="#ffe36f";game.ctx.shadowBlur=18}game.ctx.font=`${28*game.camera.z*pulse*scale}px sans-serif`;game.ctx.textAlign="center";game.ctx.fillText(t,p.x+TILE*game.camera.z/2,p.y+TILE*game.camera.z/2);game.ctx.restore()}
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
function pauseModal(title,body){game.paused=true;app.insertAdjacentHTML("beforeend",Modal(title,body));const modal=topModal(),close=()=>{modal?.remove();if(game&&!document.querySelector(".game-modal"))game.paused=false};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close}


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
function battleFlash(type="hit"){
 const arena=document.querySelector(".battle-arena");if(!arena)return;
 const flash=document.createElement("div");flash.className=`battle-screen-flash ${type}`;arena.appendChild(flash);setTimeout(()=>flash.remove(),420);
}
async function battleBanner(title,subtitle="",type="normal",duration=700){
 const arena=document.querySelector(".battle-arena");if(!arena)return;
 arena.querySelector(".battle-cinematic-banner")?.remove();
 const el=document.createElement("div");el.className=`battle-cinematic-banner ${type}`;el.innerHTML=`<strong>${title}</strong>${subtitle?`<small>${subtitle}</small>`:""}`;arena.appendChild(el);
 await wait(duration);el.classList.add("leaving");await wait(220);el.remove();
}
function burstParticles(target,type="gold",count=12){
 const layer=document.getElementById("battleFxLayer"),el=battleTarget(target);if(!layer||!el)return;
 const lr=layer.getBoundingClientRect(),r=el.getBoundingClientRect();
 for(let i=0;i<count;i++){const p=document.createElement("i");p.className=`fx-particle ${type}`;const angle=Math.PI*2*i/count+(Math.random()-.5)*.35,dist=42+Math.random()*46;p.style.left=`${r.left-lr.left+r.width/2}px`;p.style.top=`${r.top-lr.top+r.height*.42}px`;p.style.setProperty("--dx",`${Math.cos(angle)*dist}px`);p.style.setProperty("--dy",`${Math.sin(angle)*dist}px`);p.style.animationDelay=`${Math.random()*80}ms`;layer.appendChild(p);setTimeout(()=>p.remove(),800)}
}
async function battleIntro(enemies){
 const elite=enemies.find(e=>e.elite);if(elite){battleFlash("danger");await battleBanner("ABYSS ELITE",`${elite.eliteAffixIcon} ${elite.eliteAffixName}・${elite.name}`,"boss",1050);return}
 if(battle?.specialBattle){battleFlash(battle.specialBattleType==="emergency"?"boss":"hit");await battleBanner(battle.specialBattleType==="emergency"?"WORLD ANOMALY":"TEAM BATTLE",battle.specialTitle??"4 VS 4",battle.specialBattleType==="emergency"?"boss":"encounter",1100);return}
 const boss=enemies.find(e=>e.boss);if(boss){battleFlash("boss");await battleBanner("BOSS BATTLE",boss.name,"boss",900)}
 else if(enemies.length>1)await battleBanner("ENEMY PARTY",`${enemies.length}体が立ちはだかった`,"encounter",620);
 else await battleBanner("ENCOUNTER",enemies[0]?.name??"敵が現れた","encounter",520);
}
function makeBattleEnemy(e,index=0){const sp=SPECIES[e.speciesId],danger={stats:1},scaled={...e,level:Math.max(1,e.level??1)},enemy=createEnemyBattleState(sp,scaled,save.state.player.currentFloor);enemy.dangerLevel=e.boss?5:e.speciesId==="mimic"?3:e.equipped?3:((e.level??1)>save.state.player.currentFloor+4?2:1);if(e.nameOverride)enemy.name=e.nameOverride;if(e.statMultiplier){const mult=Number(e.statMultiplier)||1;enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*mult));enemy.hp=enemy.maxHp;enemy.atk=Math.max(1,Math.round(enemy.atk*mult));enemy.def=Math.max(0,Math.round(enemy.def*mult));enemy.spd=Math.max(1,Math.round(enemy.spd*Math.sqrt(mult)))}enemy.endgameBossId=e.endgameBossId??null;enemy.faction=e.faction??null;enemy.powerRate=e.powerRate??null;enemy.manifestationLabel=e.manifestationLabel??null;enemy.endgameSupport=Boolean(e.endgameSupport);enemy.uncapturable=Boolean(e.uncapturable);enemy.id=`enemy-${Date.now()}-${index}-${Math.random().toString(36).slice(2,7)}`;enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*danger.stats));enemy.hp=enemy.maxHp;enemy.atk=Math.max(1,Math.round(enemy.atk*danger.stats));enemy.def=Math.max(0,Math.round(enemy.def*danger.stats));enemy.spd=Math.max(1,Math.round(enemy.spd*(1+(danger.stats-1)*.35)));applyEliteModifiers(enemy,e);if(e.equipped&&e.gear){enemy.gear=e.gear;enemy.name=`⚔️ ${enemy.name}`;enemy.atk+=e.gear.stats.atk??0;enemy.def+=e.gear.stats.def??0;enemy.spd+=e.gear.stats.spd??0;enemy.maxHp+=e.gear.stats.hp??0;enemy.hp=enemy.maxHp}return enemy}
function saveBattleCheckpoint(){if(!battle)return;save.state.activeBattle={floor:save.state.player.currentFloor,enemies:battle.enemies,turn:battle.turn,turnQueue:battle.turnQueue,queueIndex:battle.queueIndex,targetEnemyId:battle.targetEnemyId,auto:battle.auto,escapePending:false,guards:battle.guards,cooldowns:battle.cooldowns,enemyStatuses:battle.enemyStatuses,log:battle.log,specialBattle:battle.specialBattle,specialBattleType:battle.specialBattleType,specialTitle:battle.specialTitle,specialSubtitle:battle.specialSubtitle,priorVitals:battle.priorVitals,specialBossId:battle.specialBossId,powerPercent:battle.powerPercent,bonusFragments:battle.bonusFragments,preludeChoiceId:battle.preludeChoiceId,preludeResultText:battle.preludeResultText};save.save()}
function clearBattleCheckpoint(){delete save.state.activeBattle;save.save()}
function resumeSavedBattle(){const data=save.state.activeBattle;if(!data?.enemies?.length)return false;const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);if(!party.length)return false;save.state.player.currentFloor=data.floor??save.state.player.currentFloor;battle={...data,party,species:SPECIES,busy:false,skillMenu:false,itemMenu:false,enemy:data.enemies[0],...createBattleRulesState(party),cooldowns:data.cooldowns??{},enemyStatuses:data.enemyStatuses??{},allyEffects:data.allyEffects??{},enemyEffects:data.enemyEffects??{},log:data.log??[]};battle.turnQueue=data.turnQueue??[];battle.queueIndex=data.queueIndex??0;battle.targetEnemyId=data.targetEnemyId??aliveEnemies(battle)[0]?.id??null;screen="explore";renderBattle();setTimeout(()=>continueBattleFlow(),250);return true}
function affixValue(monster,id,cap=Infinity){return Math.max(0,Math.min(cap,Number(monster?._equipmentAffixes?.[id]??0)))}
function partyAffixTotal(id,cap=Infinity){return Math.max(0,Math.min(cap,(battle?.party??[]).reduce((sum,m)=>sum+affixValue(m,id),0)))}
function healMultiplier(monster){return 1+affixValue(monster,"healPower",100)/100}
function outgoingLifeSteal(monster){return affixValue(monster,"lifeSteal",30)/100}
function equipmentRegenRate(monster){return affixValue(monster,"regen",20)/100}
function tryUnyielding(monster){const chance=affixValue(monster,"unyielding",60)/100;if(!chance||monster._unyieldingUsed||Math.random()>=chance)return false;monster._unyieldingUsed=true;monster.currentHp=1;return true}
function applyStartMpAffix(monster){const rate=affixValue(monster,"startMp",60)/100;if(!rate)return;monster.currentMp=Math.min(maxMp(monster),Math.max(0,monster.currentMp??0)+Math.floor(maxMp(monster)*rate))}
function affixCriticalChance(stats,base,cap=.85){return Math.min(cap,base+(stats.crit??0)/100)}
function affixExecutionMultiplier(monster,enemy){return enemy?.maxHp>0&&enemy.hp/enemy.maxHp<=.25?1+affixValue(monster,"execution",100)/100:1}
function startBattle(encounter,options={}){const entries=Array.isArray(encounter)?encounter:[encounter];entries.forEach(e=>recordBiomeEncounter(save.state,save.state.player.currentFloor,e.speciesId));const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean),synergy=partySynergy();party.forEach(m=>{m._synergy=synergy?{atk:synergy.atk??0,def:synergy.def??0,spd:synergy.spd??0,crit:synergy.crit??0}:{};m._unyieldingUsed=false;const hp=calculatedStats(m).hp,mp=maxMp(m);if(m.currentHp==null)m.currentHp=hp;if(m.currentMp==null)m.currentMp=mp;m.currentHp=Math.min(m.currentHp,hp);m.currentMp=Math.min(m.currentMp,mp);applyStartMpAffix(m)});entries.forEach(e=>save.state.codex.encounters[e.speciesId]=(save.state.codex.encounters[e.speciesId]??0)+1);save.save();const enemies=entries.map(makeBattleEnemy);enemies.filter(e=>e.elite).forEach(e=>recordEliteEncounter(save.state,e));save.save();battle={enemies,enemy:enemies[0],targetEnemyId:enemies[0]?.id,party,species:SPECIES,turn:1,busy:false,auto:save.state.settings.autoBattle,guards:{},escapePending:false,skillMenu:false,itemMenu:false,...createBattleRulesState(party),...options};buildTurnQueue(battle);if(synergy)addBattleLog(battle,`${synergy.name}が発動！`);addBattleLog(battle,`行動順：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);saveBattleCheckpoint();renderBattle();setTimeout(async()=>{await battleIntro(enemies);continueBattleFlow()},120)}
function actor(){return currentAlly(battle)}
function renderBattle(){document.querySelector(".battle-screen")?.remove();app.insertAdjacentHTML("beforeend",BattleScreen(battle,save.state.inventory,save.state.settings));document.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>command(b.dataset.command));document.querySelectorAll("[data-skill-id]").forEach(b=>b.onclick=()=>command("skill",b.dataset.skillId));document.querySelectorAll("[data-battle-item]").forEach(b=>b.onclick=()=>openBattleItemTarget(b.dataset.battleItem));document.querySelectorAll("[data-battle-detail]").forEach(b=>b.onclick=()=>showBattleMonsterDetail(b.dataset.battleDetail));document.querySelectorAll("[data-enemy-target]").forEach(b=>b.onclick=()=>{if(battle.busy)return;battle.targetEnemyId=b.dataset.enemyTarget;renderBattle()});document.querySelector(".battle-arena")?.addEventListener("click",e=>{if(!battle.auto||e.target.closest("button,.combatant"))return;battle.auto=false;save.state.settings.autoBattle=false;saveBattleCheckpoint();showToast("手動操作へ切り替えました");renderBattle()});const closeSkill=document.getElementById("closeSkillMenu");if(closeSkill)closeSkill.onclick=()=>{battle.skillMenu=false;renderBattle()};const closeItem=document.getElementById("closeItemMenu");if(closeItem)closeItem.onclick=()=>{battle.itemMenu=false;renderBattle()};document.getElementById("battleSpeed").onclick=()=>{const sp=battleSpeed();save.state.settings.battleSpeed=sp===1?2:sp===2?4:1;save.save();renderBattle()};document.getElementById("toggleBattleAuto").onclick=()=>{battle.auto=!battle.auto;save.state.settings.autoBattle=battle.auto;save.save();renderBattle();if(battle.auto&&!battle.busy)continueBattleFlow()};document.getElementById("escapeBattle")?.addEventListener("click",requestEscape)}
async function requestEscape(){
 if(!battle||battle.escapePending||battle.specialBattle)return;
 battle.auto=false;save.state.settings.autoBattle=false;save.save();
 battle.escapePending=true;addBattleLog(battle,battle.busy?"オートを停止。現在の行動後に逃走します":"逃走を試みる");saveBattleCheckpoint();renderBattle();
 if(!battle.busy)await resolveEscape();
}
async function resolveEscape(){
 if(!battle?.escapePending||battle.busy)return false;
 battle.busy=true;battle.escapePending=false;
 if(Math.random()<.65){clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;screen="explore";render();return true}
 addBattleLog(battle,"逃走に失敗した");await floatText("逃走失敗","party","miss");battle.busy=false;saveBattleCheckpoint();renderBattle();return false
}
function openBattleItemTarget(type){if((save.state.inventory[type]??0)<=0)return;const single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","reviveLeaves","statusCures","fullHeals"].includes(type);if(!single)return useBattleItem(type,null);const cards=battle.party.map(m=>{const st=calculatedStats(m);return`<button data-battle-item-target="${m.id}" ${type!=="reviveLeaves"&&m.currentHp<=0?"disabled":type==="reviveLeaves"&&m.currentHp>0?"disabled":""}><b>${displayName(m)} Lv.${m.level}</b><small>HP ${m.currentHp}/${st.hp}　MP ${m.currentMp}/${maxMp(m)}</small></button>`}).join("");app.insertAdjacentHTML("beforeend",Modal("使用対象を選択",`<div class="modal-party-vitals selectable">${cards}</div>`,`やめる`));const modal=topModal();modal.querySelectorAll("[data-battle-item-target]").forEach(b=>b.onclick=()=>{modal.remove();useBattleItem(type,b.dataset.battleItemTarget)});modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()}
async function useBattleItem(type,targetId){
 if(battle.busy)return;const a=actor();if(!a)return;
 const party=battle.party,target=party.find(m=>m.id===targetId),single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","reviveLeaves","statusCures","fullHeals"].includes(type),list=single?[target]:party;
 if(single&&!target)return;
 if(type==="reviveLeaves"&&target.currentHp>0)return alert("戦闘不能の仲間を選んでください");
 if(type!=="reviveLeaves"&&single&&target.currentHp<=0)return alert("戦闘不能の仲間には使用できません");
 const hasAilment=m=>(m.statuses?.length??0)||(m.ailments?.length??0)||m.status;
 const usable=type==="potions"?target.currentHp<calculatedStats(target).hp:type==="highPotions"?target.currentHp<calculatedStats(target).hp:type==="partyPotions"?list.some(m=>m.currentHp>0&&m.currentHp<calculatedStats(m).hp):["manaPotions","highManaPotions","fullManaPotions"].includes(type)?target.currentMp<maxMp(target):["partyManaPotions","partyFullManaPotions"].includes(type)?list.some(m=>m.currentHp>0&&m.currentMp<maxMp(m)):type==="reviveLeaves"?target.currentHp<=0:type==="statusCures"?hasAilment(target):type==="partyStatusCures"?list.some(hasAilment):type==="fullHeals"?(target.currentHp<calculatedStats(target).hp||target.currentMp<maxMp(target)||hasAilment(target)):list.some(m=>m.currentHp>0&&(m.currentHp<calculatedStats(m).hp||m.currentMp<maxMp(m)||hasAilment(m)));
 if(!usable)return alert("今は使用する必要がありません");
 battle.busy=true;battle.itemMenu=false;save.state.inventory[type]--;
 if(type==="potions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(100,max,.10))}
 if(type==="highPotions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(300,max,.25))}
 if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp;m.currentHp=Math.min(max,m.currentHp+scaledRecovery(50,max,.07))});
 if(type==="manaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(30,max,.10))}
 if(type==="highManaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(100,max,.25))}
 if(type==="partyManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=maxMp(m);m.currentMp=Math.min(max,m.currentMp+scaledRecovery(30,max,.07))});
 if(type==="fullManaPotions")target.currentMp=maxMp(target);
 if(type==="partyFullManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>m.currentMp=maxMp(m));
 if(type==="reviveLeaves"){target.currentHp=Math.max(1,Math.floor(calculatedStats(target).hp*.3));target.currentMp=Math.min(maxMp(target),Math.max(0,target.currentMp??0));}
 if(type==="statusCures"||type==="partyStatusCures")list.filter(Boolean).forEach(clearAilments);
 if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});
 addBattleLog(battle,`${displayName(a)}：アイテム使用`);saveBattleCheckpoint();renderBattle();await wait(220/battleSpeed());battle.busy=false;await finishCurrentAction()
}

function showBattleMonsterDetail(id){
 const m=battle.party.find(x=>x.id===id);if(!m)return;const st=calculatedStats(m),need=expNeed(m),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");
 app.insertAdjacentHTML("beforeend",Modal(`${SPECIES[m.speciesId].emoji} ${displayName(m)}`,`<div class="battle-detail"><p><b>Lv.${m.level} ★${m.stars} +${m.plus}</b></p><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${SPECIES[m.speciesId].race}族 / ${SPECIES[m.speciesId].role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p>EXP ${m.exp}/${need}</p><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/need*100)}%"></i></div><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,"閉じる"));topModalButton().onclick=closeTopModal
}
function registerWeaponFinisher(monster,enemy,beforeHp){
 if(!monster||!enemy||beforeHp<=0||enemy.hp>0||enemy.captured||enemy.weaponKillRecorded)return;
 enemy.weaponKillRecorded=true;enemy.defeatedByMonsterId=monster.id;
 recordWeaponKill(save.state,monster.id,enemy)
}
function allyAttackFactor(id){return(1+effectValue(battle,id,"atkUp")-effectValue(battle,id,"atkDown"))}
function allyDefenseFactor(id){return Math.max(.2,1+effectValue(battle,id,"defUp")-effectValue(battle,id,"defDown"))}
function enemyAttackFactor(id){return Math.max(.2,1-effectValue(battle,id,"atkDown","enemy"))}
function enemyDefenseFactor(id){return Math.max(.2,1-effectValue(battle,id,"defDown","enemy"))}
function applySkillEffects(skill,a,e){for(const effect of skill.effects??[]){if(effect.enemy){if(e)applyBattleEffect(battle,e.id,effect,"enemy")}else if(effect.allies){battle.party.filter(m=>m.currentHp>0).forEach(m=>applyBattleEffect(battle,m.id,effect,"ally"))}else applyBattleEffect(battle,a.id,effect,"ally")}}
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
   const critical=Math.random()<affixCriticalChance(s,Math.min(.35,.08+(s.spd??0)*.005));
   const base=Math.max(1,Math.floor(s.atk*(.9+Math.random()*.2)-e.def*.4));
   const critMult=1.7+affixValue(a,"critDamage",150)/100,damageStats={...s,_currentHpRatio:a.currentHp/Math.max(1,s.hp)},raw=(critical?Math.floor(base*critMult):base)*affixOutgoingDamageMultiplier(damageStats,e)*affixExecutionMultiplier(a,e),beforeHp=e.hp,d=Math.max(1,Math.floor(raw*enemyDamageMultiplier(e)*weaponMasteryDamageMultiplier(save.state,a,e)));e.hp=Math.max(0,e.hp-d);registerWeaponFinisher(a,e,beforeHp);const steal=outgoingLifeSteal(a);if(steal){const h=Math.max(1,Math.floor(d*steal));a.currentHp=Math.min(s.hp,a.currentHp+h)}
   await animateHit(e.id,critical);if(critical){battleFlash("critical");burstParticles(e.id,"critical",16)}await floatText(`${critical?"CRITICAL ":""}-${d}`,e.id,critical?"critical":"damage");
  }
 }

 if(type==="skill"&&!skillId){battle.busy=false;battle.skillMenu=true;renderBattle();return}

 if(type==="skill"&&skillId){
  const skill=skillById(skillId),cd=cooldownRemaining(battle,a.id,skillId);
  if(!learnedSkills(a).some(x=>x.id===skillId)||!canUseSkill(a,skill,cd)){battle.busy=false;return alert(cd>0?`あと${cd}ラウンド使用できない`:"MPが足りない")}
  const mpCost=effectiveSkillMpCost(a,skill);a.currentMp=Math.max(0,a.currentMp-mpCost);setSkillCooldown(battle,a.id,skill);battle.skillMenu=false;let skillCompleted=true;addBattleLog(battle,`${displayName(a)}：${skill.name}（MP-${mpCost}）`);await battleBanner(skill.name,skill.description??"","skill",430);
  if(skill.type==="selfHeal"||skill.type==="stance"&&skill.heal){
   const h=Math.max(1,Math.floor(s.hp*(skill.heal??0)*healMultiplier(a)));a.currentHp=Math.min(s.hp,a.currentHp+h);if(h>0)await floatText(`+${h}`,a.id,"heal");applySkillEffects(skill,a,e);
  }else if(skill.type==="allHeal"){
   const healed=[];battle.party.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp,h=Math.max(1,Math.floor(max*skill.heal*healMultiplier(a))),before=m.currentHp;m.currentHp=Math.min(max,m.currentHp+h);healed.push(m.currentHp-before)});
   await floatText(`全体 +${Math.max(...healed)}`,"party","heal");if(skill.cleanse)battle.party.forEach(m=>clearNegativeAllyEffects(battle,m.id));applySkillEffects(skill,a,e);
  }else if(skill.type==="buff"||skill.type==="stance"){applySkillEffects(skill,a,e);if(skill.heal){const targets=skill.target==="味方全体"?battle.party.filter(m=>m.currentHp>0):[a];targets.forEach(m=>{const mx=calculatedStats(m).hp;m.currentHp=Math.min(mx,m.currentHp+Math.floor(mx*skill.heal*healMultiplier(a)))})}await floatText("EFFECT","party","guard");
  }else if(skill.type==="cleanse"){battle.party.forEach(m=>clearNegativeAllyEffects(battle,m.id));await floatText("CLEANSE","party","heal");
  }else if(skill.type==="mpHeal"){battle.party.filter(m=>m.currentHp>0).forEach(m=>m.currentMp=Math.min(maxMp(m),m.currentMp+Math.floor(maxMp(m)*(skill.mpHeal??.2))));await floatText("MP回復","party","heal");
  }else if(skill.type==="revive"){const target=battle.party.filter(m=>m.currentHp<=0).sort((x,y)=>calculatedStats(y).hp-calculatedStats(x).hp)[0];if(target){target.currentHp=Math.max(1,Math.floor(calculatedStats(target).hp*(skill.revive??.35)));await floatText("REVIVE",target.id,"heal")}else{skillCompleted=false;a.currentMp=Math.min(maxMp(a),a.currentMp+mpCost);setSkillCooldown(battle,a.id,{...skill,cooldown:0})}
  }else{
   await animateAttack(a.id,true);const hits=skill.hits??1;let total=0;const skillTargets=skill.allEnemies?aliveEnemies(battle):[e];
   for(const targetEnemy of skillTargets){const e=targetEnemy;for(let i=0;i<hits&&e.hp>0;i++){
    const critical=Math.random()<affixCriticalChance(s,Math.min(.65,.1+(skill.critBonus??0)+(s.spd??0)*.004)),boosted={...s,atk:s.atk*allyAttackFactor(a.id),_currentHpRatio:a.currentHp/Math.max(1,s.hp)},execute=(skill.execute&&e.hp/e.maxHp<=skill.execute)?2:1,raw=skillDamage(boosted,{...e,def:e.def*enemyDefenseFactor(e.id)},skill,critical)*execute*affixExecutionMultiplier(a,e),beforeHp=e.hp,d=Math.max(1,Math.floor(raw*enemyDamageMultiplier(e)*weaponMasteryDamageMultiplier(save.state,a,e)));
    e.hp=Math.max(0,e.hp-d);registerWeaponFinisher(a,e,beforeHp);total+=d;await animateHit(e.id,critical);if(critical){battleFlash("critical");burstParticles(e.id,"critical",14)}await floatText(`${critical?"CRITICAL ":""}-${d}`,e.id,critical?"critical":"skill")
   }
   }
   if(skill.type==="drain"||hasEffect(battle,a.id,"lifeSteal")||outgoingLifeSteal(a)>0){const rate=(skill.drain??0)+effectValue(battle,a.id,"lifeSteal")+outgoingLifeSteal(a),h=Math.max(1,Math.floor(total*Math.min(1.25,rate)));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal")}
   if(skill.status&&e.hp>0&&Math.random()<Math.min(1,skill.status.chance*(1+affixValue(a,"statusChance",100)/100))){applyEnemyStatus(battle,{...skill.status,power:(skill.status.power??0)*(1+affixValue(a,"dotDamage",150)/100),sourceMonsterId:a.id},e.id);addBattleLog(battle,`${e.name}は${skill.status.name}状態になった`);await floatText(skill.status.name,e.id,skill.status.id)}applySkillEffects(skill,a,e)
  }
  if(skillCompleted){const echoChance=affixValue(a,"arcaneEcho",60)/100;if(mpCost>0&&echoChance&&Math.random()<echoChance){a.currentMp=Math.min(maxMp(a),a.currentMp+mpCost);addBattleLog(battle,`${displayName(a)}：MP還元が発動`);await floatText(`MP +${mpCost}`,a.id,"heal")}const beforeMasteryLevel=skillProgressFor(a,skill.id).level,masteryBonus=Math.max(0,Number(a._equipmentAffixes?.skillMasteryGain??0)),mastery=recordSkillUse(a,skill.id,1+masteryBonus/100);if(mastery.level>beforeMasteryLevel){addBattleLog(battle,`${displayName(a)}：${skill.name} 熟練Lv.${mastery.level}へ上昇`);await floatText(`SKILL Lv.${mastery.level}`,a.id,"skill")}}
 }

 if(type==="guard"){
  battle.guards[a.id]=true;addBattleLog(battle,`${displayName(a)}：ガード`);await floatText("GUARD",a.id,"guard")
 }

 if(type==="item"){battle.busy=false;battle.auto=false;save.state.settings.autoBattle=false;battle.itemMenu=true;save.save();renderBattle();return}

 if(type==="capture"){
  if(e.uncapturable){battle.busy=false;return alert("この存在は捕獲できません")}
  if(e.boss){const floor=save.state.player.currentFloor,defeated=(save.state.player.bossKills[floor]??0)>0;if(!defeated){battle.busy=false;return alert("初回の階層ボスは捕獲できません。まず撃破してください。")}}
  if(save.state.inventory.captureCrystals<=0){battle.busy=false;return alert("捕獲結晶がない")}
  save.state.inventory.captureCrystals--;addBattleLog(battle,"捕獲を試みた");
  const captureBonus=affixValue(a,"captureRate",50)/100,chance=e.boss?Math.max(.01,Math.min(.20,(.01+(1-e.hp/e.maxHp)*.04)*currentDanger().bossCapture+captureBonus)):Math.max(.08,Math.min(.95,.2+(1-e.hp/e.maxHp)*.55+(Math.max(...battle.party.map(m=>m.level+m.stars*2+m.plus))-e.level)*.012+captureBonus));
  await floatText(`捕獲 ${Math.round(chance*100)}%`,e.id,"capture");await wait(500);
  if(Math.random()<chance){const m=createMonster(e.speciesId,{level:e.level,isBoss:e.boss,sealedPower:e.boss?{state:"sealed",originalDanger:e.dangerLevel??1,awakening:0}:null,obtainedMethod:"capture",obtainedFloor:save.state.player.currentFloor,nickname:e.boss?`封印 ${SPECIES[e.speciesId].name}`:undefined});save.state.monsters.push(m);save.state.records.captures++;save.state.codex.captures[e.speciesId]=(save.state.codex.captures[e.speciesId]??0)+1;e.captured=true;e.hp=0;save.save();battleFlash("capture");burstParticles(e.id,"capture",22);await battleBanner("CAPTURE!",`${e.name}が仲間になった`,"capture",760);await animateDefeat(e.id,true);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(true,m);addBattleLog(battle,`${e.name}を捕獲した`)}
 }

 saveBattleCheckpoint();renderBattle();await wait(260/battleSpeed());
 if(e.hp<=0){await animateDefeat(e.id);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(false,null)}
 battle.busy=false;
 await finishCurrentAction();
}
function chooseEnemyTarget(enemy=null,mode="normal"){
 const alive=battle.party.filter(monster=>monster.currentHp>0);if(!alive.length)return null;
 const taunters=alive.filter(monster=>hasEffect(battle,monster.id,"taunt"));if(taunters.length)return taunters[Math.floor(Math.random()*taunters.length)];
 const guarded=alive.filter(monster=>battle.guards[monster.id]);if(guarded.length&&Math.random()<.45)return guarded[Math.floor(Math.random()*guarded.length)];
 if(enemy?.endgameBossId){
  if(mode==="weak")return [...alive].sort((a,b)=>(a.currentHp/calculatedStats(a).hp)-(b.currentHp/calculatedStats(b).hp))[0];
  if(mode==="threat")return [...alive].sort((a,b)=>calculatedStats(b).atk-calculatedStats(a).atk)[0];
 }
 return alive[Math.floor(Math.random()*alive.length)];
}
async function dealEnemyHit(e,target,multiplier=1,label="",criticalChance=.08){
 const st=calculatedStats(target),guard=Boolean(battle.guards[target.id]),critical=Math.random()<criticalChance;
 if(Math.random()<Math.min(.60,(st.evasion??0)/100)){addBattleLog(battle,`${displayName(target)}が回避した`);await floatText("DODGE",target.id,"miss");return 0}
 const guardFx=Math.min(.85,effectValue(battle,target.id,"guard")*(1+affixValue(target,"guardPower",100)/100)),vulnerable=effectValue(battle,target.id,"vulnerable"),reduction=Math.min(.75,affixValue(target,"damageReduction",75)/100);let d=Math.max(1,Math.floor((e.atk*enemyAttackFactor(e.id)-st.def*allyDefenseFactor(target.id)*.45)*multiplier*(guard?Math.max(.15,.45-affixValue(target,"guardPower",100)/200):1)*(1-guardFx)*(1+vulnerable)*(1-reduction)));if(critical)d=Math.floor(d*1.55);
 target.currentHp=Math.max(0,target.currentHp-d);if(target.currentHp<=0&&tryUnyielding(target)){addBattleLog(battle,`${displayName(target)}の致死耐性が発動！`);await floatText("UNYIELDING",target.id,"guard")}else addBattleLog(battle,`${displayName(target)}に${d}ダメージ`);
 await animateHit(target.id,critical);if(critical){battleFlash("danger");burstParticles(target.id,"enemy",14)}await floatText(`${label}${critical?"CRITICAL ":""}-${d}`,target.id,critical?"critical":"enemy");
 if(target.currentHp<=0)await animateDefeat(target.id);else if(hasEffect(battle,target.id,"counter")){const cs=calculatedStats(target),counterBoost=1+affixValue(target,"counterDamage",150)/100,counter=Math.max(1,Math.floor((cs.atk*effectValue(battle,target.id,"counter")-e.def*.25)*counterBoost));e.hp=Math.max(0,e.hp-counter);addBattleLog(battle,`${displayName(target)}が${counter}反撃ダメージ`);await floatText(`COUNTER -${counter}`,e.id,"skill")}return d;
}
async function enemyTurn(){
 if(battle.busy)return;const entry=currentTurnEntry(battle);if(entry?.type!=="enemy")return continueBattleFlow();
 battle.busy=true;const e=currentEnemy(battle);if(!e){battle.busy=false;return finishCurrentAction()}battle.enemy=e;const action=chooseEnemyAction(e);addBattleLog(battle,`${e.name}：${e.intent}`);
 if(action===ENEMY_ACTIONS.guard){await floatText("GUARD",e.id,"guard")}
 else if(action===ENEMY_ACTIONS.charge){await floatText("CHARGE",e.id,"charge")}
 else if(action===ENEMY_ACTIONS.heal){const h=enemyHealAmount(e);e.hp=Math.min(e.maxHp,e.hp+h);await floatText(`+${h}`,e.id,"heal")}
 else if(action===ENEMY_ACTIONS.enrage){e.atk=Math.floor(e.atk*1.18);e.def=Math.floor(e.def*1.08);await battleBanner(e.endgameBossId?"AUTHORITY RELEASE":"ENRAGE",e.intent,e.faction==="tenGod"?"boss":"skill",620);await floatText("ENRAGE",e.id,"enrage");await animateHit(e.id,true)}
 else if(action===ENEMY_ACTIONS.divineBarrier){await battleBanner("DIVINE BARRIER","受けるダメージを大幅軽減","boss",650);await floatText("BARRIER",e.id,"guard")}
 else if([ENEMY_ACTIONS.devour,ENEMY_ACTIONS.annihilate,ENEMY_ACTIONS.inferno,ENEMY_ACTIONS.thunderstorm].includes(action)){
  const labels={devour:"無限捕食",annihilate:"死滅の波動",inferno:"神炎・終焉焦土",thunderstorm:"神雷・万象連鎖"};
  await battleBanner(labels[action],e.name,e.faction==="tenGod"?"boss":"skill",720);battleFlash(e.faction==="tenGod"?"boss":"danger");
  const alive=battle.party.filter(m=>m.currentHp>0),base=specialActionMultiplier(action)*(e.enraged?1.25:1);
  if(action===ENEMY_ACTIONS.devour){const target=chooseEnemyTarget(e,"weak"),d=await dealEnemyHit(e,target,base,"捕食 ",.12);const h=Math.max(1,Math.floor(d*.65));e.hp=Math.min(e.maxHp,e.hp+h);await floatText(`+${h}`,e.id,"heal")}
  else if(action===ENEMY_ACTIONS.thunderstorm){for(const target of [...alive].sort(()=>Math.random()-.5).slice(0,Math.min(3,alive.length))){await animateAttack(e.id,true);await dealEnemyHit(e,target,base,"雷撃 ",.22)}}
  else{for(const target of alive){await animateAttack(e.id,true);await dealEnemyHit(e,target,base,action===ENEMY_ACTIONS.inferno?"神炎 ":"死滅 ",action===ENEMY_ACTIONS.inferno?.16:.1)}}
 }else{
  const target=chooseEnemyTarget(e,e.endgameBossId?"threat":"normal");if(!target){battle.busy=false;return lose()};await animateAttack(e.id,action===ENEMY_ACTIONS.power);
  if(action!==ENEMY_ACTIONS.power&&Math.random()<.05)await floatText("MISS",target.id,"miss");else await dealEnemyHit(e,target,enemyAttackMultiplier(e,action),action===ENEMY_ACTIONS.power?"強撃 ":"",e.enraged?.13:.08);
 }
 saveBattleCheckpoint();renderBattle();await wait(300/battleSpeed());battle.busy=false;if(!battle.party.some(m=>m.currentHp>0))return lose();await finishCurrentAction();
}
async function finishCurrentAction(){
 if(battle?.escapePending){battle.busy=false;const escaped=await resolveEscape();if(escaped||!battle)return;if(!battle.escapePending&&battle.busy)return}
 advanceQueue(battle);
 if(queueFinished(battle))return endRound();
 renderBattle();
 await wait(180/battleSpeed());
 return continueBattleFlow();
}
async function endRound(){
 battle.busy=true;
 const statusResults=processEnemyStatuses(battle);
 for(const enemy of(battle.enemies??[]).filter(e=>e.hp>0&&e.eliteRegen>0)){const healed=Math.max(1,Math.floor(enemy.maxHp*enemy.eliteRegen));enemy.hp=Math.min(enemy.maxHp,enemy.hp+healed);addBattleLog(battle,`${enemy.name}は${healed}回復した`);await floatText(`+${healed}`,enemy.id,"heal")}
 for(const result of statusResults){if(result.enemy.hp<=0&&result.sourceMonsterId){const source=battle.party.find(monster=>monster.id===result.sourceMonsterId);registerWeaponFinisher(source,result.enemy,result.beforeHp)}addBattleLog(battle,`${result.enemy.name}に${result.name} ${result.damage}ダメージ`);renderBattle();await floatText(`-${result.damage}`,result.enemy.id,result.id)}
 for(const monster of battle.party.filter(m=>m.currentHp>0)){const rate=equipmentRegenRate(monster);if(rate){const max=calculatedStats(monster).hp,amount=Math.max(1,Math.floor(max*rate)),before=monster.currentHp;monster.currentHp=Math.min(max,monster.currentHp+amount);const healed=monster.currentHp-before;if(healed){addBattleLog(battle,`${displayName(monster)}の装備再生 +${healed}`);await floatText(`+${healed}`,monster.id,"heal")}}}
 const allyResults=processAllyEffects(battle,calculatedStats);for(const result of allyResults){addBattleLog(battle,`${displayName(result.monster)} ${result.kind==="heal"?"回復":"継続ダメージ"} ${result.amount}`);await floatText(`${result.kind==="heal"?"+":"-"}${result.amount}`,result.monster.id,result.kind==="heal"?"heal":result.kind)}
 tickCooldowns(battle);tickBattleEffects(battle);
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
 if(battle.escapePending)return resolveEscape();
 skipInvalidEntries(battle);
 if(queueFinished(battle))return endRound();
 const entry=currentTurnEntry(battle);
 renderBattle();
 if(entry?.type==="enemy")return enemyTurn();
 if(entry?.type==="ally"&&battle.auto){await wait(220/battleSpeed());const a=currentAlly(battle);if(a){a._maxHp=calculatedStats(a).hp;const skill=chooseAutoSkill(a,battle);if(skill)return command("skill",skill.id)}return command("attack")}
}
function expNeed(m){return expNeedFor(m)}
function win(caught,m){
 if(battle?.specialBattle)return finishSpecialBattle(true);
 const defeated=(battle.enemies??[battle.enemy]).filter(Boolean),floor=save.state.player.currentFloor,boss=defeated.find(e=>e.boss),eliteDefeated=defeated.filter(e=>e.elite&&!e.captured),firstBoss=!!boss&&!save.state.player.bossRewards[floor];
 const rewardMult=eliteDefeated.length?1.65:1,goldBonus=partyAffixTotal("goldGain",300)/100;const gold=Math.round(defeated.reduce((sum,e)=>sum+(e.boss?(firstBoss?80+e.level*14:28+e.level*7):16+e.level*5),0)*rewardMult*(1+goldBonus));
 save.state.player.gold+=gold;
 save.state.records.kills+=defeated.filter(e=>!e.captured).length;
 const baseGain=defeated.reduce((sum,e)=>{
  if(e.boss)return sum+(firstBoss?Math.round(110+e.level*28):Math.round(24+e.level*8));
  if(e.rareExp)return sum+Math.round(100+e.level*22);
  const difficulty=(e.gear?1.35:1)*(e.level>floor+4?1.2:1);
  return sum+Math.max(6,Math.round((10+e.level*4.4)*difficulty))
 },0);
 const totalExp=Math.round(baseGain*battle.party.length*rewardMult);
 const crystalRoll=defeated.reduce((sum,e)=>{const chance=e.boss?1:e.speciesId==="mimic"?1:e.gear?.25:.06;if(Math.random()<chance)return sum+(e.boss?20+Math.floor(e.level/10):e.speciesId==="mimic"?3+Math.floor(Math.random()*8):1);return sum},0);if(crystalRoll)save.state.player.crystals+=crystalRoll;
 let eliteBonusGold=0,eliteBonusCrystals=0,eliteKeyDrop=false;for(const elite of eliteDefeated){const reward=eliteRewards(elite,floor);eliteBonusGold+=reward.gold;eliteBonusCrystals+=reward.crystals;eliteKeyDrop=eliteKeyDrop||Math.random()<reward.keyChance;recordEliteDefeat(save.state,elite)}save.state.player.gold+=eliteBonusGold;save.state.player.crystals+=eliteBonusCrystals;
 const keyDrop=eliteKeyDrop||defeated.some(e=>!e.boss&&Math.random()<.002*currentDanger().keyRate)||(firstBoss&&floor%50===0);
 if(keyDrop)save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;
 const survivors=battle.party.filter(monster=>monster.currentHp>0);
 const share=survivors.length?Math.floor(totalExp/survivors.length):0;
 let remainder=survivors.length?totalExp%survivors.length:0;

 const participationKills=defeated.filter(e=>!e.captured).length;
 const seriesMasteryResults=recordSeriesBattle(save.state,battle.party,save.state.equipment,{boss:!!boss});
 battle.party.forEach(monster=>{monster.affection=Math.min(1000,(monster.affection??monster.bond??0)+(boss?5:2));monster.bond=monster.affection;monster.history??={};monster.history.adventures=(monster.history.adventures??0)+1;monster.history.battles=(monster.history.battles??0)+1;monster.history.victories=(monster.history.victories??0)+1;monster.history.kills=(monster.history.kills??0)+participationKills;monster.history.bossDefeats=(monster.history.bossDefeats??0)+(boss?1:0);monster.history.highestFloor=Math.max(monster.history.highestFloor??1,floor);monster.history.lastDeployedAt=new Date().toISOString();monster.history.consecutiveDeployments=(monster.history.consecutiveDeployments??0)+1;monster.history.longestConsecutiveDeployments=Math.max(monster.history.longestConsecutiveDeployments??0,monster.history.consecutiveDeployments);monster.battles=(monster.battles??0)+1;});
 const progress=battle.party.map(monster=>{
  const alive=monster.currentHp>0;
  const before={level:monster.level,exp:monster.exp,need:expNeed(monster),stats:{...calculatedStats(monster)},hp:monster.currentHp,mp:monster.currentMp};
  const personalExpBonus=(affixValue(monster,"expGain",200)+affixValue(monster,"abyssGrowth",200))/100;const gain=alive?Math.round((share+(remainder-->0?1:0))*(1+personalExpBonus)):0;
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
 const dropBonus=partyAffixTotal("dropRate",200)/100,rareBonus=partyAffixTotal("treasureSense",200)/100;
 if(geared&&Math.random()<Math.min(.85,.18*(1+dropBonus))){drop={...geared.gear,id:crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,equippedBy:null,createdAt:new Date().toISOString()};dropReceipt=equipmentReceipt(drop)}else if(Math.random()<Math.min(.75,.12*(1+dropBonus))){const rarityRoll=Math.random(),rarity=rarityRoll<Math.min(.35,.04+rareBonus*.12)?"LR":rarityRoll<Math.min(.70,.18+rareBonus*.22)?"SSR":rarityRoll<.60?"SR":undefined;drop=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],rarity?{rarity}:undefined);dropReceipt=equipmentReceipt(drop)}

 clearPartySynergy();clearBattleCheckpoint();
 activeEnemy=null;
 document.querySelector(".battle-screen")?.remove();

 const victorySubtitle=boss?`👑 ${String(boss.name??SPECIES[boss.speciesId]?.name??"BOSS").replace(/^⚔️\s*/,"")}撃破！`:caught?`${m.nickname}を捕獲！`:"";const result=`<div class="battle-result-cinematic ${boss?"boss-clear":""} ${caught?"capture-clear":""}"><div class="victory-rays"></div><div class="victory-title">${boss?"BOSS DEFEATED":caught?"CAPTURE SUCCESS":"VICTORY"}</div>${victorySubtitle?`<div class="victory-subtitle">${victorySubtitle}</div>`:""}</div><div class="reward-summary cinematic-rewards"><b>🪙 +${gold}G</b>${crystalRoll+eliteBonusCrystals?`<b>💎 +${crystalRoll+eliteBonusCrystals}</b>`:""}${eliteBonusGold?`<b class="elite-reward">🜲 エリート討伐 +${eliteBonusGold.toLocaleString()}G</b>`:""}<small>基礎総EXP ${totalExp} / 生存 ${survivors.length}体で分配${firstBoss?"・初回ボス撃破ボーナス":""}</small>${drop?`<b>[${drop.rarity}] ${drop.name}（${slotLabel(drop.slot)}）</b><small>${dropReceipt.message}</small>`:""}${keyDrop?`<b>🗝️ 深淵の鍵を獲得</b>`:""}${caught?`<b>${m.nickname}を捕獲！</b>`:""}${seriesMasteryResults.length?`<div class="series-mastery-result">${seriesMasteryResults.map(row=>`<small>${row.leveled?"✨ ":""}${EQUIPMENT_SERIES[row.seriesId]?.name??row.seriesId}熟練度 +${row.amount}${row.leveled?`　Lv.${row.after.level} ${row.after.label}へ！`:""}</small>`).join("")}</div>`:""}</div><div class="exp-results compact">${progress.map(p=>{const hpMax=p.afterStats.hp,mpMax=maxMp(p.x),remaining=Math.max(0,p.need-p.x.exp),diff=k=>p.afterStats[k]-(p.before.stats[k]??0);return`<div class="${p.alive?"":"exp-defeated"} ${p.levels?"level-up-card level-up-reveal":""}"><span>${SPECIES[p.x.speciesId].emoji}</span><section><b>${displayName(p.x)} ${p.levels?`Lv.${p.before.level} → Lv.${p.x.level}`:`Lv.${p.x.level}`}</b><div class="result-vitals"><small>HP ${p.x.currentHp}/${hpMax}</small><small>MP ${p.x.currentMp}/${mpMax}</small><small>${p.alive?`次まであと${remaining}EXP`:"戦闘不能：EXP 0"}</small></div><i class="result-exp"><u style="width:${Math.min(100,p.x.exp/p.need*100)}%"></u></i>${p.levels?`<div class="level-gains"><span>HP ${p.before.stats.hp} → ${p.afterStats.hp} <strong>+${diff("hp")}</strong></span><span>ATK ${p.before.stats.atk} → ${p.afterStats.atk} <strong>+${diff("atk")}</strong></span><span>DEF ${p.before.stats.def} → ${p.afterStats.def} <strong>+${diff("def")}</strong></span><span>SPD ${p.before.stats.spd} → ${p.afterStats.spd} <strong>+${diff("spd")}</strong></span></div>`:""}</section></div>`}).join("")}</div>`;

 if(boss){battle.enemy=boss;save.state.player.bossKills[floor]=(save.state.player.bossKills[floor]??0)+1;if(floor===1000)mark1000FloorCleared(save.state);recordBiomeBoss(save.state,floor);if(snapshot?.world)snapshot.world.boss=null;if(firstBoss)return showBossRewards(result)}
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"戦闘結果",result,"探索へ"));
 const resultModal=topModal();let resultClosed=false;
 const returnToExplore=()=>{if(resultClosed)return;resultClosed=true;resultModal?.remove();screen="explore";render()};
 resultModal._onDismiss=returnToExplore;
 resultModal.querySelector("[data-modal-primary]").onclick=returnToExplore;
}
function showBossRewards(result){const floor=save.state.player.currentFloor,species=battle.enemy.speciesId,sp=SPECIES[species],weapon=createEquipment("weapon",{rarity:"LR"});weapon.name=`${sp.name}の王装`;const options=[{id:"weapon",icon:"⚔️",title:weapon.name,desc:`限定LR武器 / ${Object.entries(weapon.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" ")}`},{id:"crystal",icon:"💎",title:`魔晶石 ×${30+floor*2}`,desc:"召喚・育成用の資源"},{id:"supply",icon:"🗃️",title:"深淵遠征セット",desc:`捕獲結晶×${5+Math.floor(floor/10)} / 回復薬×5 / 深淵の鍵×1`}];app.insertAdjacentHTML("beforeend",`<div class="game-modal"><div class="game-modal-card boss-reward"><div>${result}</div><div class="boss-clear-emblem">👑</div><h2 class="boss-choice-title">撃破報酬を選択</h2><p class="muted">中身を見て、ひとつだけ選択。選び直しはできません。</p><div class="boss-reward-grid">${options.map(o=>`<button data-boss-reward="${o.id}"><span>${o.icon}</span><b>${o.title}</b><small>${o.desc}</small></button>`).join("")}</div></div></div>`);document.querySelectorAll("[data-boss-reward]").forEach(b=>b.onclick=()=>{if(!confirm(`${b.querySelector("b").textContent}を選ぶ？\nこの階の他の報酬は入手できません。`))return;const id=b.dataset.bossReward;if(id==="weapon")receiveEquipment(save.state,weapon,{bossReward:true});if(id==="crystal")save.state.player.crystals+=30+floor*2;if(id==="supply"){save.state.inventory.captureCrystals+=5+Math.floor(floor/10);save.state.inventory.potions+=5;save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1}const playEnding=floor===1000&&!save.state.flags?.ending1000Played;save.state.player.bossRewards[floor]=id;save.save();closeTopModal();if(playEnding){play1000EndingSequence();return}screen="explore";render()})}

function lose(){
 if(battle?.specialBattle)return finishSpecialBattle(false);
 clearPartySynergy();const lost=Math.floor(save.state.player.gold*.25);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;abandonManualExpedition(save.state);
 battle.party.forEach(m=>{m.currentHp=1;m.currentMp=0;clearAilments(m)});clearBattleCheckpoint();snapshot=null;document.querySelector(".battle-screen")?.remove();
 app.insertAdjacentHTML("beforeend",Modal("DEFEAT",`<div class="defeat-cinematic"><div class="defeat-mark">☠</div><h2>深淵に敗れた…</h2><p><b>${lost}G</b>を失い、${save.state.player.checkpoint}Fの拠点へ帰還します。</p><small>仲間はHP1で救出されました。</small></div>`,"拠点へ戻る"));
 const modal=topModal(),returnHome=()=>{modal?.remove();battle=null;go("home")};modal._onDismiss=returnHome;modal.querySelector("[data-modal-primary]").onclick=returnHome
}
if(!resumeSavedBattle())render();
