import{SaveService}from"./services/SaveService.js?v=0.3.0-alpha.1";
import{SPECIES}from"./data/species.js";
import{HomeScreen}from"./ui/screens/HomeScreen.js";
import{MonsterListScreen}from"./ui/screens/MonsterListScreen.js";
import{MonsterDetailScreen}from"./ui/screens/MonsterDetailScreen.js";
import{SettingsScreen}from"./ui/screens/SettingsScreen.js";
import{ExploreScreen}from"./ui/screens/ExploreScreen.js";
import{BattleScreen}from"./ui/screens/BattleScreen.js";
import{Modal}from"./ui/components/Modal.js";
import{createMonster,displayName,calculatedStats}from"./models/Monster.js";
import{createEquipment,equipmentPower}from"./models/Equipment.js";
import{receiveEquipment,takeFromStorage,equipmentSellPrice,slotLabel}from"./services/EquipmentStorage.js?v=0.3.0-alpha.1";
import{RARITY_ORDER,equipmentStatLabel}from"./data/equipment.js";
import{EquipmentScreen}from"./ui/screens/EquipmentScreen.js?v=0.3.0-alpha.1";
import{ShopScreen}from"./ui/screens/ShopScreen.js";
import{maxMp,learnedSkills,skillById,canUseSkill,skillDamage}from"./battle/SkillSystem.js";
import{ENEMY_ACTIONS,createEnemyBattleState,chooseEnemyAction,enemyDamageMultiplier,enemyHealAmount,enemyAttackMultiplier}from"./battle/EnemyAI.js";
import{createBattleRulesState,cooldownRemaining,setSkillCooldown,tickCooldowns,addBattleLog,applyEnemyStatus,processEnemyStatuses}from"./battle/BattleRules.js";
import{buildTurnQueue,currentTurnEntry,currentAlly,advanceQueue,queueFinished,skipInvalidEntries}from"./battle/TurnSystem.js";

const TILE=48,COLS=31,ROWS=31,app=document.getElementById("app"),save=new SaveService();
let screen="home",selected=null,equipmentTarget=null,game=null,battle=null,snapshot=null,activeEnemy=null,navigationOrigin="home";

class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66;if(p.x<l)this.x+=(p.x-l)/this.z*.12;if(p.x>r)this.x+=(p.x-r)/this.z*.12;if(p.y<t)this.y+=(p.y-t)/this.z*.12;if(p.y>b)this.y+=(p.y-b)/this.z*.12}clamp(w){const edge=30,mw=w.cols*TILE*this.z,mh=w.rows*TILE*this.z,ml=this.c.width/2-this.x*this.z,mt=this.c.height/2-this.y*this.z,minX=edge-(ml+mw),maxX=this.c.width-edge-ml,minY=edge-(mt+mh),maxY=this.c.height-edge-mt;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-ml:Math.max(minX,Math.min(maxX,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-mt:Math.max(minY,Math.min(maxY,this.oy))}}
function normalizeEquipmentState(){
 save.state.equipment??=[];
 save.state.reserveEquipment??=[];
 save.state.bossEquipmentVault??=[];
 save.state.settings??={};
 save.state.settings.equipmentSort??="rarity";
 save.state.settings.equipmentSlot??="weapon";
 save.state.settings.equipmentStorage??="inventory";
}
function render(){normalizeEquipmentState();if(screen==="home"){app.innerHTML=HomeScreen(save.state);bindHome()}else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state);bindList()}else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m);bindDetail(m)}else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}else if(screen==="equipment"){equipmentTarget??=save.state.party[0];app.innerHTML=EquipmentScreen(save.state,equipmentTarget,{home:navigationOrigin==="home"});bindEquipment()}else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}}
function go(s){screen=s;render()}
function bindHome(){document.getElementById("openMonsters").onclick=()=>go("monsters");document.getElementById("openSettings").onclick=()=>go("settings");document.getElementById("openExplore").onclick=()=>{const max=save.state.player.maxFloor;app.insertAdjacentHTML("beforeend",Modal("探索開始",`<p>再開する階層を選択</p><input id="floorSelect" type="number" min="1" max="${max}" value="${max}"><p class="muted">1〜${max}階。宝箱は一度開けたものは復活しません。</p>`,"出発"));document.getElementById("closeGameModal").onclick=()=>{const f=Math.max(1,Math.min(max,Number(document.getElementById("floorSelect").value)||max));save.state.player.currentFloor=f;save.state.player.inRun=true;save.save();snapshot=null;document.querySelector(".game-modal").remove();go("explore")}};document.getElementById("openEquipment").onclick=()=>go("equipment");detailButtons()}
function bindList(){document.getElementById("backHome").onclick=()=>go("home");const input=document.getElementById("monsterSearch");input.oninput=()=>document.querySelectorAll(".monster-card").forEach(c=>{const m=save.state.monsters.find(x=>x.id===c.querySelector("[data-monster-id]").dataset.monsterId),q=input.value.trim();c.style.display=m.nickname.includes(q)||SPECIES[m.speciesId].name.includes(q)?"grid":"none"});detailButtons()}
function detailButtons(){document.querySelectorAll("[data-monster-id]").forEach(b=>b.onclick=()=>{selected=b.dataset.monsterId;go("detail")})}
function bindDetail(m){document.getElementById("backMonsters").onclick=()=>go("monsters");document.getElementById("toggleFavorite").onclick=()=>{m.favorite=!m.favorite;save.save();render()};document.getElementById("saveNickname").onclick=()=>{const v=document.getElementById("nicknameInput").value.trim();if(v)m.nickname=v.slice(0,12);save.save();render()};document.querySelectorAll("[data-color-id]").forEach(b=>b.onclick=()=>{m.colorId=b.dataset.colorId;save.save();render()})}
function bindSettings(){document.getElementById("backHome").onclick=()=>go("home");document.getElementById("toggleAuto").onclick=()=>{save.state.settings.autoBattle=!save.state.settings.autoBattle;save.save();render()};document.getElementById("toggleMinimap").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();render()};document.getElementById("resetSave").onclick=()=>{if(confirm("初期化する？")){save.reset();snapshot=null;go("home")}}}


function bindEquipment(){
 document.getElementById("backEquipmentHome").onclick=()=>{const target=navigationOrigin;navigationOrigin="home";go(target)};
 document.getElementById("equipmentTarget").onchange=e=>{equipmentTarget=e.target.value;render()};
 document.getElementById("equipmentSort").onchange=e=>{save.state.settings.equipmentSort=e.target.value;save.save();render()};
 document.querySelectorAll("[data-equipment-slot]").forEach(b=>b.onclick=()=>{save.state.settings.equipmentSlot=b.dataset.equipmentSlot;save.save();render()});
 document.querySelectorAll("[data-equipment-storage]").forEach(b=>b.onclick=()=>{if(b.disabled)return;save.state.settings.equipmentStorage=b.dataset.equipmentStorage;save.save();render()});
 document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equipItem(b.dataset.equip,b.dataset.target));document.getElementById("autoEquipOne")?.addEventListener("click",()=>{autoEquipMonster(equipmentTarget);save.save();render()});document.getElementById("autoEquipParty")?.addEventListener("click",()=>{save.state.party.forEach(autoEquipMonster);save.save();render()});
 document.querySelectorAll("[data-unequip]").forEach(b=>b.onclick=()=>unequipItem(b.dataset.unequip));
 document.querySelectorAll("[data-favorite-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.favoriteEquipment);if(!i)return;i.favorite=!i.favorite;save.save();render()});
 document.querySelectorAll("[data-lock-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.lockEquipment);if(!i)return;i.locked=!i.locked;save.save();render()});
 document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>sellItem(b.dataset.sell));
 document.querySelectorAll("[data-take-equipment]").forEach(b=>b.onclick=()=>{const result=takeFromStorage(save.state,b.dataset.takeEquipment,b.dataset.storage);if(!result.ok)return alert(result.message);save.save();render()});
}
function equipItem(itemId,monsterId){
 const item=save.state.equipment.find(i=>i.id===itemId),monster=save.state.monsters.find(m=>m.id===monsterId);
 if(!item||!monster)return;
 if(!save.state.party.includes(monsterId))return alert("控えモンスターには装備できません。");
 if(item.equippedBy){
  const old=save.state.monsters.find(m=>m.id===item.equippedBy);
  if(old)old.equipment[item.slot]=null;
 }
 const prior=monster.equipment[item.slot];
 if(prior){const p=save.state.equipment.find(i=>i.id===prior);if(p)p.equippedBy=null}
 monster.equipment[item.slot]=item.id;item.equippedBy=monster.id;save.save();render();
}
function autoEquipMonster(monsterId){const monster=save.state.monsters.find(m=>m.id===monsterId);if(!monster||!save.state.party.includes(monsterId))return;for(const slot of["weapon","armor","accessory"]){const current=save.state.equipment.find(i=>i.id===monster.equipment?.[slot]),candidates=save.state.equipment.filter(i=>i.slot===slot&&(!i.equippedBy||i.equippedBy===monsterId)),best=candidates.sort((a,b)=>equipmentPower(b)-equipmentPower(a))[0];if(!best)continue;if(current&&current.id!==best.id)current.equippedBy=null;monster.equipment[slot]=best.id;best.equippedBy=monsterId}}
function unequipItem(itemId){
 const item=save.state.equipment.find(i=>i.id===itemId);if(!item?.equippedBy)return;
 const monster=save.state.monsters.find(m=>m.id===item.equippedBy);
 if(monster)monster.equipment[item.slot]=null;
 item.equippedBy=null;save.save();render();
}
function sellItem(itemId){
 const item=save.state.equipment.find(i=>i.id===itemId);
 if(!item||item.equippedBy||item.locked)return alert(item?.locked?"ロック中は売却できない":"装備中は売却できない");
 const price=equipmentSellPrice(item);
 if(!confirm(`${item.name}を${price}Gで売却する？`))return;
 save.state.equipment=save.state.equipment.filter(i=>i.id!==itemId);save.state.player.gold+=price;save.save();render();
}
function bindShop(){
 document.getElementById("leaveShop").onclick=()=>{save.save();go("explore")};
 document.querySelectorAll("[data-shop]").forEach(b=>b.onclick=()=>buyShop(b.dataset.shop));
}
function buyShop(type){
 const costs={bed:100,potion:50,capture:80,gear:180},cost=costs[type];
 if(save.state.player.gold<cost)return purchaseResult("購入失敗","GOLDが足りない。");
 save.state.player.gold-=cost;save.state.records.purchases++;
 let title="",body="";
 if(type==="bed"){
  const before=save.state.party.reduce((n,id)=>{const m=save.state.monsters.find(x=>x.id===id);return n+(m.currentHp??calculatedStats(m).hp)},0);
  save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id);m.currentHp=calculatedStats(m).hp});
  const after=save.state.party.reduce((n,id)=>n+calculatedStats(save.state.monsters.find(x=>x.id===id)).hp,0);
  title="全回復！";body=`パーティーHP ${before} → ${after}`;
 }
 if(type==="potion"){const before=save.state.inventory.potions;save.state.inventory.potions++;title="回復薬を購入";body=`所持数 ${before} → ${save.state.inventory.potions}`}
 if(type==="capture"){const before=save.state.inventory.captureCrystals;save.state.inventory.captureCrystals++;title="捕獲結晶を購入";body=`所持数 ${before} → ${save.state.inventory.captureCrystals}`}
 if(type==="gear"){const item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]),receipt=equipmentReceipt(item);title=`[${item.rarity}] ${item.name}`;body=`${slotLabel(item.slot)} / ${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}<br>${receipt.message}`}
 save.save();render();purchaseResult(title,body);
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
 document.getElementById("closeGameModal").onclick=()=>document.querySelector(".game-modal").remove();
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
 const floor=save.state.player.currentFloor,rng=seeded(floorSeed(floor)),cfg=floorConfig(floor,rng),{cols,rows,shape}=cfg;
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
 for(let i=0;i<count;i++){const roll=rng(),kind=treasureRoom?(roll>.55?"radiant":"cabinet"):roll>.96?"radiant":roll>.78?"cabinet":roll>.25?"box":"apple",emoji={apple:"🪎",box:"📦",cabinet:"🗃️",radiant:"✨📦"}[kind],p=pick();chests.push({...p,id:`${floor}-${i}`,kind,emoji,open:opened.includes(`${floor}-${i}`)})}
 const shopChance=floor%10===0?.35:.09,shop=rng()<shopChance?{...pick(),active:true}:null;if(shop)save.state.player.nextShopFloor=floor+3+Math.floor(rng()*8);
 const boss=floor%10===0&&!save.state.player.bossRewards[floor]?{...pick(),active:true}:null;
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
 document.getElementById("miniMapToggle").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();document.getElementById("miniMapToggle").textContent=save.state.settings.minimapVisible?"MAP ON":"MAP OFF"};
 document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world)};
 document.getElementById("pauseParty").onclick=openPartyEditor;
 document.getElementById("fieldEquipment").onclick=()=>{snapshot=currentSnapshot();stopGame();navigationOrigin="explore";go("equipment")};
 document.getElementById("pauseItems").onclick=openFieldItems;
 document.getElementById("returnHome").onclick=()=>{if(confirm(`${save.state.player.currentFloor}階から帰還する？\n次回は到達済みの階を選んで再開できます。`)){stopGame();snapshot=null;save.state.player.inRun=false;save.save();go("home")}}
}
function itemCount(type){return save.state.inventory[type]??0}
function openFieldItems(){
 game.paused=true;
 const items=[
  ["potions","❤️","単体回復","HP100回復"],["partyPotions","💚","全体回復","全員HP50回復"],
  ["statusCures","🩹","状態異常回復・単体","単体の状態異常を解除"],["partyStatusCures","💨","状態異常回復・全体","全員の状態異常を解除"],
  ["fullHeals","✨","全回復＋異常回復・単体","単体を完全回復"],["partyFullHeals","🌟","全回復＋異常回復・全体","全員を完全回復"]
 ];
 const targets=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);
 const body=`<div class="field-item-target"><b>対象</b><select id="fieldItemTarget">${targets.map(m=>`<option value="${m.id}">${displayName(m)} HP ${m.currentHp??calculatedStats(m).hp}/${calculatedStats(m).hp}</option>`).join("")}</select></div><div class="field-item-grid">${items.map(([id,icon,name,desc])=>`<button data-field-item="${id}" ${itemCount(id)<=0?"disabled":""}><span>${icon}</span><b>${name}</b><small>${desc}</small><em>×${itemCount(id)}</em></button>`).join("")}</div>`;
 app.insertAdjacentHTML("beforeend",Modal("持ち物",body,"閉じる"));
 document.querySelectorAll("[data-field-item]").forEach(b=>b.onclick=()=>useFieldItem(b.dataset.fieldItem,document.getElementById("fieldItemTarget").value));
 document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();game.paused=false}
}
function clearAilments(m){m.statuses=[];m.status=null;m.ailments=[]}
function useFieldItem(type,targetId){
 if(itemCount(type)<=0)return;
 const target=save.state.monsters.find(m=>m.id===targetId),party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);
 const single=["potions","statusCures","fullHeals"].includes(type);if(single&&!target)return;
 const list=single?[target]:party;
 if(type==="potions")target.currentHp=Math.min(calculatedStats(target).hp,(target.currentHp??calculatedStats(target).hp)+100);
 if(type==="partyPotions")list.forEach(m=>m.currentHp=Math.min(calculatedStats(m).hp,(m.currentHp??calculatedStats(m).hp)+50));
 if(type==="statusCures"||type==="partyStatusCures")list.forEach(clearAilments);
 if(type==="fullHeals"||type==="partyFullHeals")list.forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});
 save.state.inventory[type]--;save.save();document.querySelector(".game-modal").remove();snapshot=currentSnapshot();stopGame();render();
}
function openPartyEditor(){game.paused=true;const body=`<p class="muted">その場で自由に編成できます。捕獲直後の仲間もすぐ使用可能。</p><div class="party-editor">${save.state.monsters.map(m=>`<button data-party-toggle="${m.id}" class="${save.state.party.includes(m.id)?"selected":""}"><span>${SPECIES[m.speciesId].emoji}</span><b>${displayName(m)}</b><small>Lv.${m.level}</small></button>`).join("")}</div>`;app.insertAdjacentHTML("beforeend",Modal("フィールド編成",body,"閉じる"));document.querySelectorAll("[data-party-toggle]").forEach(b=>b.onclick=()=>{const id=b.dataset.partyToggle,has=save.state.party.includes(id);if(has&&save.state.party.length<=1)return alert("最低1体必要");if(!has&&save.state.party.length>=4)return alert("編成は4体まで");if(has){const mon=save.state.monsters.find(m=>m.id===id);if(mon)Object.values(mon.equipment??{}).forEach(itemId=>{const item=save.state.equipment.find(i=>i.id===itemId);if(item)item.equippedBy=null});if(mon)mon.equipment={weapon:null,armor:null,accessory:null};save.state.party=save.state.party.filter(x=>x!==id)}else save.state.party=[...save.state.party,id];save.save();b.classList.toggle("selected",!has)});document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();snapshot=currentSnapshot();stopGame();render()}}
function enemyLevelForFloor(floor){const band=Math.floor((floor-1)/10),base=band*10+1,jumps=[0,0,1,2,3,5,7,9],variance=jumps[Math.floor(Math.random()*jumps.length)]-(Math.random()<.28?Math.floor(Math.random()*4):0),milestone=floor%50===1&&floor>1?8:floor%25===1&&floor>1?4:0;return Math.max(1,base+Math.floor((floor-1)%10*.58)+variance+milestone)}
function randomEnemy(){const ids=Object.keys(SPECIES),floor=save.state.player.currentFloor,speciesId=ids[Math.floor(Math.random()*ids.length)],equipped=Math.random()<.11,gear=equipped?createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]):null;return{speciesId,level:enemyLevelForFloor(floor),boss:false,equipped,gear}}
function floorBossEnemy(){const floor=save.state.player.currentFloor,ids=Object.keys(SPECIES),speciesId=floor%20===0?"dragon":ids[Math.floor(seeded(floorSeed(floor)+991)()*ids.length)];return{speciesId,level:Math.max(10,Math.round(floor*.82)+Math.floor(Math.random()*5)),boss:true}}
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
 activeEnemy=enemyOverride??randomEnemy();
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
   game.player.path=[];game.paused=true;app.insertAdjacentHTML("beforeend",Modal("階層の支配者","<p>……ワシの前まで来たか。</p><p><b>覚悟はできているな。</b></p>","戦う"));document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();game.paused=false;beginEncounter(floorBossEnemy())};return
  }
  if(game.world.shop&&game.player.x===game.world.shop.x&&game.player.y===game.world.shop.y){
   stopGame();
   snapshot=currentSnapshot();
   save.state.player.nextShopFloor=save.state.player.currentFloor+3+Math.floor(Math.random()*5);
   save.save();screen="shop";render();return
  }
  if(game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){
   if(save.state.player.currentFloor%10===0&&!save.state.player.bossRewards[save.state.player.currentFloor]){
    game.player.path=[];game.paused=true;app.insertAdjacentHTML("beforeend",Modal("無視するのか……","<p>ワシを無視するのか……</p><p><b>愚か者。</b></p>","強制戦闘"));document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();game.paused=false;beginEncounter(floorBossEnemy())};return
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
function openChest(c){c.open=true;const floor=save.state.player.currentFloor;save.state.player.openedChests[floor]??=[];save.state.player.openedChests[floor].push(c.id);save.state.records.chests++;let title="宝箱",body="";if(c.kind==="apple"){save.state.inventory.potions++;title="🪎 深淵の果実";body="回復薬を1個獲得"}else if(c.kind==="box"){if(Math.random()<.5){const gold=80+floor*12;save.state.player.gold+=gold;body=`${gold}Gを獲得`}else{const item=createEquipment("weapon"),receipt=equipmentReceipt(item);body=equipmentReceiptText(receipt)}}else{const rarity=c.kind==="radiant"?(Math.random()<.35?"LR":"SSR"):(Math.random()<.35?"SSR":"SR"),item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],{rarity}),receipt=equipmentReceipt(item);title=c.kind==="radiant"?"✨ 輝く宝箱":"🗃️ 古い収納箱";body=`${equipmentReceiptText(receipt)}<br>${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}`}save.save();pauseModal(title,body)}
function draw(){const c=game.ctx,w=game.world;c.fillStyle="#120c18";c.fillRect(0,0,game.canvas.width,game.canvas.height);for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){const p=game.camera.world(x*TILE,y*TILE),s=TILE*game.camera.z;c.fillStyle=w.tiles[y][x]?"#21182a":"#6a4a7f";c.fillRect(p.x,p.y,s+1,s+1)}emoji(w.exit,"🕳️");if(w.shop)emoji(w.shop,"🚪");if(w.boss)emoji(w.boss,"👹",true);w.chests.forEach(x=>!x.open&&emoji(x,x.emoji,x.kind==="radiant"));emoji({x:game.player.rx,y:game.player.ry},"👑");drawMini()}
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
function bindInput(c){game.canvas=c;if(!game.input||!(game.input.pts instanceof Map))game.input=createInputState();const i=game.input;i.pts.clear();i.last=null;i.pinch=null;i.drag=false;const finish=e=>{i.pts.delete(e.pointerId);if(!i.pts.size){i.last=null;i.pinch=null;i.drag=false}};c.onpointerdown=e=>{if(game.paused)return;c.setPointerCapture?.(e.pointerId);i.pts.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});i.last={x:e.clientX,y:e.clientY};i.drag=false};c.onpointermove=e=>{const p=i.pts.get(e.pointerId);if(!p||game.paused)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(Math.hypot(p.x-p.sx,p.y-p.sy)>7)i.drag=true;if(i.drag){game.camera.pan(dx*(c.width/c.clientWidth),dy*(c.height/c.clientHeight));game.camera.clamp(game.world)}};c.onpointerup=e=>{const p=i.pts.get(e.pointerId),drag=i.drag;finish(e);if(!p||drag||game.paused)return;const r=c.getBoundingClientRect(),w=game.camera.screen((e.clientX-r.left)*(c.width/r.width),(e.clientY-r.top)*(c.height/r.height)),g={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)};game.player.setPath(path(game.world,game.player,g))};c.onpointercancel=c.onlostpointercapture=finish}
function stopGame(){if(!game)return;game.running=false;const c=game.canvas;if(c)c.onpointerdown=c.onpointermove=c.onpointerup=c.onpointercancel=c.onlostpointercapture=null}
function pauseModal(title,body){game.paused=true;app.insertAdjacentHTML("beforeend",Modal(title,body));document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();game.paused=false}}


function battleSpeed(){return save.state.settings.battleSpeed??1}
function wait(ms){return new Promise(r=>setTimeout(r,Math.max(55,ms/battleSpeed())))}
function battleTarget(target){
 if(target==="enemy")return document.getElementById("enemyActor");
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
function startBattle(e){
 const sp=SPECIES[e.speciesId],party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);
 party.forEach(m=>{const hp=calculatedStats(m).hp,mp=maxMp(m);if(m.currentHp==null)m.currentHp=hp;if(m.currentMp==null)m.currentMp=mp;m.currentHp=Math.min(m.currentHp,hp);m.currentMp=Math.min(m.currentMp,mp)});
 const enemy=createEnemyBattleState(sp,e,save.state.player.currentFloor);if(e.equipped&&e.gear){enemy.gear=e.gear;enemy.name=`⚔️ ${enemy.name}`;enemy.atk+=e.gear.stats.atk??0;enemy.def+=e.gear.stats.def??0;enemy.spd+=e.gear.stats.spd??0;enemy.maxHp+=e.gear.stats.hp??0;enemy.hp=enemy.maxHp}
 battle={enemy,party,species:SPECIES,turn:1,busy:false,auto:save.state.settings.autoBattle,guards:{},skillMenu:false,...createBattleRulesState(party)};
 buildTurnQueue(battle);
 addBattleLog(battle,`行動順：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 renderBattle();
 setTimeout(()=>continueBattleFlow(),360/battleSpeed());
}
function actor(){return currentAlly(battle)}
function renderBattle(){
 document.querySelector(".battle-screen")?.remove();
 app.insertAdjacentHTML("beforeend",BattleScreen(battle,save.state.inventory,save.state.settings));
 document.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>command(b.dataset.command));
 document.querySelectorAll("[data-skill-id]").forEach(b=>b.onclick=()=>command("skill",b.dataset.skillId));
 document.querySelectorAll("[data-battle-detail]").forEach(b=>b.onclick=()=>showBattleMonsterDetail(b.dataset.battleDetail));
 const closeSkill=document.getElementById("closeSkillMenu");if(closeSkill)closeSkill.onclick=()=>{battle.skillMenu=false;renderBattle()};
 document.getElementById("battleSpeed").onclick=()=>{const s=battleSpeed();save.state.settings.battleSpeed=s===1?2:s===2?4:1;save.save();renderBattle()};
 document.getElementById("toggleBattleAuto").onclick=()=>{battle.auto=!battle.auto;save.state.settings.autoBattle=battle.auto;save.save();renderBattle();if(battle.auto&&!battle.busy)continueBattleFlow()};
 document.getElementById("escapeBattle").onclick=async()=>{
  if(battle.busy||currentTurnEntry(battle)?.type!=="ally")return;
  battle.busy=true;
  if(Math.random()<.65){document.querySelector(".battle-screen").remove();activeEnemy=null;screen="explore";render()}
  else{addBattleLog(battle,"逃走に失敗した");await floatText("逃走失敗","party","miss");battle.busy=false;await finishCurrentAction()}
 };
}
function showBattleMonsterDetail(id){
 const m=battle.party.find(x=>x.id===id);if(!m)return;const st=calculatedStats(m),need=expNeed(m),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");
 app.insertAdjacentHTML("beforeend",Modal(`${SPECIES[m.speciesId].emoji} ${displayName(m)}`,`<div class="battle-detail"><p><b>Lv.${m.level} ★${m.stars} +${m.plus}</b></p><p>HP ${m.currentHp}/${st.hp}<br>MP ${m.currentMp}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}</p><p>EXP ${m.exp}/${need}</p><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/need*100)}%"></i></div><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,"閉じる"));document.getElementById("closeGameModal").onclick=()=>document.querySelector(".game-modal").remove()
}
async function command(type,skillId=null){
 if(battle.busy)return;
 const entry=currentTurnEntry(battle),a=actor();
 if(entry?.type!=="ally"||!a)return;
 battle.busy=true;
 const s=calculatedStats(a),e=battle.enemy;

 if(type==="attack"){
  addBattleLog(battle,`${displayName(a)}：たたかう`);await animateAttack(a.id);
  if(Math.random()<.06)await floatText("MISS","enemy","miss");
  else{
   const critical=Math.random()<Math.min(.35,.08+(s.spd??0)*.005);
   const base=Math.max(1,Math.floor(s.atk*(.9+Math.random()*.2)-e.def*.4));
   const raw=critical?Math.floor(base*1.7):base,d=Math.max(1,Math.floor(raw*enemyDamageMultiplier(e)));e.hp=Math.max(0,e.hp-d);
   await animateHit("enemy",critical);await floatText(`${critical?"CRITICAL ":""}-${d}`,"enemy",critical?"critical":"damage");
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
    e.hp=Math.max(0,e.hp-d);total+=d;await animateHit("enemy",critical);await floatText(`${critical?"CRITICAL ":""}-${d}`,"enemy",critical?"critical":"skill")
   }
   if(skill.type==="drain"){const h=Math.max(1,Math.floor(total*skill.drain));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal")}
   if(skill.status&&e.hp>0&&Math.random()<skill.status.chance){applyEnemyStatus(battle,skill.status);addBattleLog(battle,`${e.name}は${skill.status.name}状態になった`);await floatText(skill.status.name,"enemy",skill.status.id)}
  }
 }

 if(type==="guard"){
  battle.guards[a.id]=true;addBattleLog(battle,`${displayName(a)}：ガード`);await floatText("GUARD",a.id,"guard")
 }

 if(type==="item"){
  if(save.state.inventory.potions<=0){battle.busy=false;return alert("回復薬がない")}
  save.state.inventory.potions--;addBattleLog(battle,`${displayName(a)}：回復薬`);const h=Math.floor(s.hp*.5);a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal");
 }

 if(type==="capture"){
  if(e.boss){battle.busy=false;return alert("階層ボスは捕獲結晶では捕まえられない。撃破後の契約報酬でのみ仲間にできます。")}
  if(save.state.inventory.captureCrystals<=0){battle.busy=false;return alert("捕獲結晶がない")}
  save.state.inventory.captureCrystals--;addBattleLog(battle,"捕獲を試みた");
  const chance=Math.max(.08,Math.min(.88,.2+(1-e.hp/e.maxHp)*.55+(Math.max(...battle.party.map(m=>m.level+m.stars*2+m.plus))-e.level)*.012));
  await floatText(`捕獲 ${Math.round(chance*100)}%`,"enemy","capture");await wait(500);
  if(Math.random()<chance){const m=createMonster(e.speciesId,{level:e.level});save.state.monsters.push(m);save.state.records.captures++;save.save();await animateDefeat("enemy",true);return win(true,m)}
 }

 save.save();renderBattle();await wait(260/battleSpeed());
 if(e.hp<=0){await animateDefeat("enemy");return win(false,null)}
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
 const e=battle.enemy,action=chooseEnemyAction(e);addBattleLog(battle,`${e.name}：${e.intent}`);

 if(action===ENEMY_ACTIONS.guard){
  await floatText("GUARD","enemy","guard");
 }else if(action===ENEMY_ACTIONS.charge){
  await floatText("CHARGE","enemy","charge");
 }else if(action===ENEMY_ACTIONS.heal){
  const h=enemyHealAmount(e);e.hp=Math.min(e.maxHp,e.hp+h);await floatText(`+${h}`,"enemy","heal");
 }else if(action===ENEMY_ACTIONS.enrage){
  e.atk=Math.floor(e.atk*1.18);e.def=Math.floor(e.def*1.08);await floatText("ENRAGE","enemy","enrage");await animateHit("enemy",true);
 }else{
  const s=calculatedStats(target);await animateAttack("enemy",action===ENEMY_ACTIONS.power);
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

 save.save();renderBattle();await wait(300/battleSpeed());
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
 for(const result of statusResults){addBattleLog(battle,`${battle.enemy.name}に${result.name} ${result.damage}ダメージ`);renderBattle();await floatText(`-${result.damage}`,"enemy",result.id)}
 tickCooldowns(battle);
 battle.guards={};
 if(battle.enemy.hp<=0){await animateDefeat("enemy");return win(false,null)}
 if(!battle.party.some(m=>m.currentHp>0))return lose();
 battle.turn++;
 buildTurnQueue(battle);
 addBattleLog(battle,`ROUND ${battle.turn}：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 battle.busy=false;save.save();renderBattle();
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
function expNeed(m){return 40+m.level*25}
function win(caught,m){
 const gold=20+battle.enemy.level*6;
 save.state.player.gold+=gold;
 save.state.records.kills++;

 const baseGain=18+battle.enemy.level*7;
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
 if(battle.enemy.gear&&Math.random()<.18){drop={...battle.enemy.gear,id:crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,equippedBy:null,createdAt:new Date().toISOString()};dropReceipt=equipmentReceipt(drop)}else if(Math.random()<.12){drop=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]);dropReceipt=equipmentReceipt(drop)}

 save.save();
 activeEnemy=null;
 document.querySelector(".battle-screen")?.remove();

 const result=`<div class="victory-title">VICTORY</div><div class="reward-summary"><b>+${gold}G</b><small>総EXP ${totalExp} / 生存 ${survivors.length}体で分配</small>${drop?`<b>[${drop.rarity}] ${drop.name}（${slotLabel(drop.slot)}）</b><small>${dropReceipt.message}</small>`:""}${caught?`<b>${m.nickname}を捕獲！</b>`:""}</div><div class="exp-results compact">${progress.map(p=>{const hpMax=p.afterStats.hp,mpMax=maxMp(p.x),remaining=Math.max(0,p.need-p.x.exp),diff=k=>p.afterStats[k]-(p.before.stats[k]??0);return`<div class="${p.alive?"":"exp-defeated"} ${p.levels?"level-up-card":""}"><span>${SPECIES[p.x.speciesId].emoji}</span><section><b>${displayName(p.x)} ${p.levels?`Lv.${p.before.level} → Lv.${p.x.level} <em>LEVEL UP!</em>`:`Lv.${p.x.level}`}</b><div class="result-vitals"><small>HP ${p.x.currentHp}/${hpMax}</small><small>MP ${p.x.currentMp}/${mpMax}</small><small>${p.alive?`次まであと${remaining}EXP`:"戦闘不能：EXP 0"}</small></div><i class="result-exp"><u style="width:${Math.min(100,p.x.exp/p.need*100)}%"></u></i>${p.levels?`<div class="level-gains"><span>HP ${p.before.stats.hp} → ${p.afterStats.hp} <strong>+${diff("hp")}</strong></span><span>ATK ${p.before.stats.atk} → ${p.afterStats.atk} <strong>+${diff("atk")}</strong></span><span>DEF ${p.before.stats.def} → ${p.afterStats.def} <strong>+${diff("def")}</strong></span><span>SPD ${p.before.stats.spd} → ${p.afterStats.spd} <strong>+${diff("spd")}</strong></span></div>`:""}</section></div>`}).join("")}</div>`;

 if(battle.enemy.boss&&!save.state.player.bossRewards[save.state.player.currentFloor])return showBossRewards(result);
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"戦闘結果",result,"探索へ"));
 document.getElementById("closeGameModal").onclick=()=>{
  document.querySelector(".game-modal").remove();
  screen="explore";
  render();
 };
}
function showBossRewards(result){const floor=save.state.player.currentFloor,species=battle.enemy.speciesId,sp=SPECIES[species],weapon=createEquipment("weapon",{rarity:"LR"});weapon.name=`${sp.name}の王装`;const options=[{id:"weapon",icon:"⚔️",title:weapon.name,desc:`限定LR武器 / ${Object.entries(weapon.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" ")}`},{id:"boss",icon:sp.emoji,title:`${sp.name}を仲間にする`,desc:`Lv.${battle.enemy.level}のボス個体`},{id:"crystal",icon:"💎",title:`魔晶石 ×${80+floor*4}`,desc:"育成・ガチャ用の大量資源"},{id:"supply",icon:"🗃️",title:"深淵遠征セット",desc:`捕獲結晶×${5+Math.floor(floor/10)} / 回復薬×5`}];app.insertAdjacentHTML("beforeend",`<div class="game-modal"><div class="game-modal-card boss-reward"><div>${result}</div><h2>運命の4択</h2><p class="muted">中身を見て、ひとつだけ選択。選び直しはできません。</p><div class="boss-reward-grid">${options.map(o=>`<button data-boss-reward="${o.id}"><span>${o.icon}</span><b>${o.title}</b><small>${o.desc}</small></button>`).join("")}</div></div></div>`);document.querySelectorAll("[data-boss-reward]").forEach(b=>b.onclick=()=>{if(!confirm(`${b.querySelector("b").textContent}を選ぶ？\nこの階の他の報酬は入手できません。`))return;const id=b.dataset.bossReward;if(id==="weapon")receiveEquipment(save.state,weapon,{bossReward:true});if(id==="boss")save.state.monsters.push(createMonster(species,{level:battle.enemy.level,stars:3,nickname:`覇 ${sp.name}`}));if(id==="crystal")save.state.player.crystals+=80+floor*4;if(id==="supply"){save.state.inventory.captureCrystals+=5+Math.floor(floor/10);save.state.inventory.potions+=5}save.state.player.bossRewards[floor]=id;save.save();document.querySelector(".game-modal").remove();screen="explore";render()})}

function lose(){
 const lost=Math.floor(save.state.player.gold*.25);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;
 battle.party.forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m)});save.save();snapshot=null;document.querySelector(".battle-screen")?.remove();alert(`全滅！ ${lost}G失った`);go("home")
}
render();
