import{SaveService}from"./services/SaveService.js";
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
import{RARITY_ORDER,equipmentStatLabel}from"./data/equipment.js";
import{EquipmentScreen}from"./ui/screens/EquipmentScreen.js";
import{ShopScreen}from"./ui/screens/ShopScreen.js";
import{maxMp,learnedSkills,skillById,canUseSkill,skillDamage}from"./battle/SkillSystem.js";
import{ENEMY_ACTIONS,createEnemyBattleState,chooseEnemyAction,enemyDamageMultiplier,enemyHealAmount,enemyAttackMultiplier}from"./battle/EnemyAI.js";
import{createBattleRulesState,cooldownRemaining,setSkillCooldown,tickCooldowns,addBattleLog,applyEnemyStatus,processEnemyStatuses}from"./battle/BattleRules.js";
import{buildTurnQueue,currentTurnEntry,currentAlly,advanceQueue,queueFinished,skipInvalidEntries}from"./battle/TurnSystem.js";

const TILE=48,COLS=31,ROWS=31,app=document.getElementById("app"),save=new SaveService();
let screen="home",selected=null,equipmentTarget=null,game=null,battle=null,snapshot=null,activeEnemy=null,navigationOrigin="home";

class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66;if(p.x<l)this.x+=(p.x-l)/this.z*.12;if(p.x>r)this.x+=(p.x-r)/this.z*.12;if(p.y<t)this.y+=(p.y-t)/this.z*.12;if(p.y>b)this.y+=(p.y-b)/this.z*.12}clamp(w){const edge=30,mw=w.cols*TILE*this.z,mh=w.rows*TILE*this.z,ml=this.c.width/2-this.x*this.z,mt=this.c.height/2-this.y*this.z,minX=edge-(ml+mw),maxX=this.c.width-edge-ml,minY=edge-(mt+mh),maxY=this.c.height-edge-mt;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-ml:Math.max(minX,Math.min(maxX,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-mt:Math.max(minY,Math.min(maxY,this.oy))}}
function maze(){const tiles=Array.from({length:ROWS},()=>Array(COLS).fill(1));function carve(x,y){tiles[y][x]=0;for(const[dx,dy]of[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>Math.random()-.5)){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<COLS-1&&ny<ROWS-1&&tiles[ny][nx]){tiles[y+dy/2][x+dx/2]=0;carve(nx,ny)}}}carve(1,1);for(let i=0;i<44;i++){const x=1+Math.floor(Math.random()*(COLS-2)),y=1+Math.floor(Math.random()*(ROWS-2));if(tiles[y][x]&&((!tiles[y][x-1]&&!tiles[y][x+1])||(!tiles[y-1][x]&&!tiles[y+1][x])))tiles[y][x]=0}const cells=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!tiles[y][x])cells.push({x,y});const exit=cells.reduce((a,c)=>c.x+c.y>a.x+a.y?c:a,cells[0]);const pick=()=>structuredClone(cells.filter(c=>c.x+c.y>8&&!(c.x===exit.x&&c.y===exit.y))[Math.floor(Math.random()*(cells.length-30))+20]);const shop=save.state.player.currentFloor>=save.state.player.nextShopFloor?{...pick(),active:true}:null;return{cols:COLS,rows:ROWS,tiles,start:{x:1,y:1},exit:{...exit},shop,chests:[{...pick(),open:false},{...pick(),open:false}]}}
function path(w,s,g){const walk=(x,y)=>x>=0&&y>=0&&x<w.cols&&y<w.rows&&!w.tiles[y][x],key=p=>p.x+","+p.y;if(!walk(g.x,g.y))return[];const q=[{x:s.x,y:s.y}],seen=new Set([key(s)]),prev=new Map();while(q.length){const c=q.shift();if(c.x===g.x&&c.y===g.y)break;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n={x:c.x+dx,y:c.y+dy};if(!walk(n.x,n.y)||seen.has(key(n)))continue;seen.add(key(n));prev.set(key(n),c);q.push(n)}}if(!seen.has(key(g)))return[];const out=[];let c=g;while(c.x!==s.x||c.y!==s.y){out.push(c);c=prev.get(key(c))}return out.reverse()}

function render(){if(screen==="home"){app.innerHTML=HomeScreen(save.state);bindHome()}else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state);bindList()}else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m);bindDetail(m)}else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}else if(screen==="equipment"){equipmentTarget??=save.state.party[0];app.innerHTML=EquipmentScreen(save.state,equipmentTarget);bindEquipment()}else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}}
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
 document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equipItem(b.dataset.equip,b.dataset.target));
 document.querySelectorAll("[data-unequip]").forEach(b=>b.onclick=()=>unequipItem(b.dataset.unequip));
 document.querySelectorAll("[data-favorite-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.favoriteEquipment);i.favorite=!i.favorite;save.save();render()});
 document.querySelectorAll("[data-lock-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.lockEquipment);i.locked=!i.locked;save.save();render()});
 document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>sellItem(b.dataset.sell));
}
function equipItem(itemId,monsterId){
 const item=save.state.equipment.find(i=>i.id===itemId),monster=save.state.monsters.find(m=>m.id===monsterId);
 if(!item||!monster)return;
 if(item.equippedBy){
  const old=save.state.monsters.find(m=>m.id===item.equippedBy);
  if(old)old.equipment[item.slot]=null;
 }
 const prior=monster.equipment[item.slot];
 if(prior){const p=save.state.equipment.find(i=>i.id===prior);if(p)p.equippedBy=null}
 monster.equipment[item.slot]=item.id;item.equippedBy=monster.id;save.save();render();
}
function unequipItem(itemId){
 const item=save.state.equipment.find(i=>i.id===itemId);if(!item?.equippedBy)return;
 const monster=save.state.monsters.find(m=>m.id===item.equippedBy);
 if(monster)monster.equipment[item.slot]=null;
 item.equippedBy=null;save.save();render();
}
function sellItem(itemId){
 const item=save.state.equipment.find(i=>i.id===itemId);
 if(!item||item.equippedBy||item.locked)return alert(item?.locked?"ロック中は売却できない":"装備中は売却できない");
 const price={N:15,R:45,SR:110,SSR:260,LR:650}[item.rarity]+item.plus*25;
 if(!confirm(`${item.name}を${price}Gで売却する？`))return;
 save.state.equipment=save.state.equipment.filter(i=>i.id!==itemId);save.state.player.gold+=price;save.save();render();
}
function bindShop(){
 document.getElementById("leaveShop").onclick=()=>go("explore");
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
 if(type==="gear"){const item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]);save.state.equipment.push(item);title=`[${item.rarity}] ${item.name}`;body=Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}
 save.save();render();purchaseResult(title,body);
}
function purchaseResult(title,body){
 app.insertAdjacentHTML("beforeend",Modal(title,`<div class="reward-icon">✨</div><p>${body}</p>`));
 document.getElementById("closeGameModal").onclick=()=>document.querySelector(".game-modal").remove();
}
function createInputState(){return{pts:new Map(),last:null,pinch:null,drag:false,tap:0}}
function seeded(seed){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296}}
function floorSeed(floor){const seeds=save.state.player.floorSeeds;seeds[floor]??=Math.floor(Math.random()*2147483647);save.save();return seeds[floor]}
function floorConfig(floor,rng){if(floor<=3)return{cols:11,rows:11,shape:"初層"};const tier=Math.min(7,Math.floor((floor-1)/5)),base=13+tier*2,types=floor<8?["square","vertical","horizontal"]:["square","vertical","horizontal","cave","y"] ,shape=types[Math.floor(rng()*types.length)];let cols=base,rows=base;if(shape==="vertical"){cols=Math.max(11,base-4);rows=Math.min(29,base+6)}if(shape==="horizontal"){cols=Math.min(29,base+6);rows=Math.max(11,base-4)}return{cols:cols|1,rows:rows|1,shape}}
function maze(){const floor=save.state.player.currentFloor,rng=seeded(floorSeed(floor)),cfg=floorConfig(floor,rng),{cols,rows,shape}=cfg,tiles=Array.from({length:rows},()=>Array(cols).fill(1)),cx=Math.floor(cols/2);const allowed=(x,y)=>{if(x<=0||y<=0||x>=cols-1||y>=rows-1)return false;if(shape!=="y")return true;const split=Math.floor(rows*.48);if(y>=split)return Math.abs(x-cx)<=2;const left=Math.round(cx-(split-y)*.55),right=Math.round(cx+(split-y)*.55);return Math.abs(x-left)<=2||Math.abs(x-right)<=2||Math.abs(x-cx)<=1};let startCell=shape==="y"?{x:cx%2?cx:cx-1,y:rows-2-(rows%2?0:1)}:{x:1,y:1};if(!allowed(startCell.x,startCell.y))startCell={x:1,y:1};function carve(x,y){tiles[y][x]=0;for(const[dx,dy]of[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>rng()-.5)){const nx=x+dx,ny=y+dy;if(allowed(nx,ny)&&tiles[ny][nx]){tiles[y+dy/2][x+dx/2]=0;carve(nx,ny)}}}carve(startCell.x,startCell.y);if(shape==="cave")for(let i=0;i<Math.floor(cols*rows/18);i++){const x=1+Math.floor(rng()*(cols-2)),y=1+Math.floor(rng()*(rows-2));if(!tiles[y][x])for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)if(allowed(x+xx,y+yy))tiles[y+yy][x+xx]=0}const cells=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(!tiles[y][x])cells.push({x,y});const exit=cells.reduce((a,c)=>Math.abs(c.x-startCell.x)+Math.abs(c.y-startCell.y)>Math.abs(a.x-startCell.x)+Math.abs(a.y-startCell.y)?c:a,cells[0]);const candidates=cells.filter(c=>Math.abs(c.x-startCell.x)+Math.abs(c.y-startCell.y)>4&&!(c.x===exit.x&&c.y===exit.y));const pick=()=>({...candidates[Math.floor(rng()*candidates.length)]});const count=Math.min(8,3+Math.floor(floor/4)),opened=save.state.player.openedChests[floor]??[];const chests=[];for(let i=0;i<count;i++){const roll=rng(),kind=roll>.9?"radiant":roll>.62?"cabinet":roll>.28?"box":"apple",emoji={apple:"🪎",box:"📦",cabinet:"🗃️",radiant:"✨📦"}[kind];let p=pick();while(chests.some(c=>c.x===p.x&&c.y===p.y))p=pick();chests.push({...p,id:`${floor}-${i}`,kind,emoji,open:opened.includes(`${floor}-${i}`)})}const shop=floor>=save.state.player.nextShopFloor?{...pick(),active:true}:null;return{cols,rows,shape,tiles,start:startCell,exit:{...exit},shop,chests,steps:0,nextEncounter:8+Math.floor(rng()*18)}}
function currentSnapshot(){return{world:game.world,player:game.player,cameraData:{x:game.camera.x,y:game.camera.y,z:game.camera.z,ox:game.camera.ox,oy:game.camera.oy,manual:game.camera.manual}}}
function bindExplore(){const canvas=document.getElementById("gameCanvas"),r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=r.width*d;canvas.height=r.height*d;const mini=document.getElementById("miniMap");mini.width=132*d;mini.height=132*d;game=snapshot??{world:maze(),player:null,camera:null,paused:false,running:true,input:createInputState()};game.input=createInputState();game.player??=new Entity(game.world.start.x,game.world.start.y);game.camera=new Camera(canvas);if(snapshot?.cameraData)Object.assign(game.camera,snapshot.cameraData);else game.camera.reset(game.player.x*TILE,game.player.y*TILE);game.camera.clamp(game.world);game.ctx=canvas.getContext("2d");game.running=true;game.paused=false;bindInput(canvas);game.last=performance.now();requestAnimationFrame(loop);document.getElementById("miniMapToggle").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();document.getElementById("miniMapToggle").textContent=save.state.settings.minimapVisible?"MAP ON":"MAP OFF"};document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world)};document.getElementById("pauseParty").onclick=openPartyEditor;document.getElementById("fieldEquipment").onclick=()=>{snapshot=currentSnapshot();stopGame();navigationOrigin="explore";go("equipment")};document.getElementById("pauseItems").onclick=()=>pauseModal("持ち物",`<div class="panel">回復薬 ${save.state.inventory.potions}</div><div class="panel">捕獲結晶 ${save.state.inventory.captureCrystals}</div><div class="panel">装備 ${save.state.equipment.length}</div>`);document.getElementById("returnHome").onclick=()=>{if(confirm(`${save.state.player.currentFloor}階から帰還する？\n次回は到達済みの階を選んで再開できます。`)){stopGame();snapshot=null;save.state.player.inRun=false;save.save();go("home")}}}
function openPartyEditor(){game.paused=true;const body=`<p class="muted">その場で自由に編成できます。捕獲直後の仲間もすぐ使用可能。</p><div class="party-editor">${save.state.monsters.map(m=>`<button data-party-toggle="${m.id}" class="${save.state.party.includes(m.id)?"selected":""}"><span>${SPECIES[m.speciesId].emoji}</span><b>${displayName(m)}</b><small>Lv.${m.level}</small></button>`).join("")}</div>`;app.insertAdjacentHTML("beforeend",Modal("フィールド編成",body,"閉じる"));document.querySelectorAll("[data-party-toggle]").forEach(b=>b.onclick=()=>{const id=b.dataset.partyToggle,has=save.state.party.includes(id);if(has&&save.state.party.length<=1)return alert("最低1体必要");if(!has&&save.state.party.length>=4)return alert("編成は4体まで");save.state.party=has?save.state.party.filter(x=>x!==id):[...save.state.party,id];save.save();b.classList.toggle("selected",!has)});document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();snapshot=currentSnapshot();stopGame();render()}}
function randomEnemy(){const ids=Object.keys(SPECIES),floor=save.state.player.currentFloor,boss=floor%10===0&&!save.state.player.bossRewards[floor];const speciesId=boss?(floor%20===0?"dragon":ids[Math.floor(Math.random()*ids.length)]):ids[Math.floor(Math.random()*ids.length)];return{speciesId,level:Math.max(1,floor+Math.floor(Math.random()*3)-1),boss}}
function loop(now){if(!game?.running)return;const dt=Math.min(.05,(now-game.last)/1000||0);game.last=now;if(!game.paused)update(dt);draw();requestAnimationFrame(loop)}
function update(dt){if(game.player.move(dt,6)){game.world.steps++;for(const c of game.world.chests)if(!c.open&&c.x===game.player.x&&c.y===game.player.y){openChest(c);return}if(game.world.shop&&game.player.x===game.world.shop.x&&game.player.y===game.world.shop.y){stopGame();snapshot=currentSnapshot();save.state.player.nextShopFloor=save.state.player.currentFloor+3+Math.floor(Math.random()*5);save.save();screen="shop";render();return}if(game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){if(save.state.player.currentFloor%10===0&&!save.state.player.bossRewards[save.state.player.currentFloor]){game.player.path=[];pauseModal("封印された深穴","この階のボスを倒し、運命の報酬を選ぶまで先へ進めない。");return}stopGame();snapshot=null;save.state.player.currentFloor++;save.state.player.maxFloor=Math.max(save.state.player.maxFloor,save.state.player.currentFloor);save.save();go("explore");return}if(game.world.steps>=game.world.nextEncounter){game.world.steps=0;game.world.nextEncounter=8+Math.floor(Math.random()*24);activeEnemy=randomEnemy();snapshot=currentSnapshot();stopGame();startBattle(activeEnemy);return}}game.camera.follow(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world);const hint=document.getElementById("encounterHint");if(hint){const left=game.world.nextEncounter-game.world.steps;hint.textContent=left<=3?"……気配が近い":left<=7?"何かが潜んでいる":"";hint.className=`encounter-hint ${left<=3?"danger":left<=7?"warn":""}`}}
function openChest(c){c.open=true;const floor=save.state.player.currentFloor;save.state.player.openedChests[floor]??=[];save.state.player.openedChests[floor].push(c.id);save.state.records.chests++;let title="宝箱",body="";if(c.kind==="apple"){save.state.inventory.potions++;title="🪎 深淵の果実";body="回復薬を1個獲得"}else if(c.kind==="box"){if(Math.random()<.5){const gold=80+floor*12;save.state.player.gold+=gold;body=`${gold}Gを獲得`}else{const item=createEquipment("weapon");save.state.equipment.push(item);body=`[${item.rarity}] ${item.name}を獲得`}}else{const rarity=c.kind==="radiant"?(Math.random()<.35?"LR":"SSR"):(Math.random()<.35?"SSR":"SR"),item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],{rarity});save.state.equipment.push(item);title=c.kind==="radiant"?"✨ 輝く宝箱":"🗃️ 古い収納箱";body=`[${item.rarity}] ${item.name}<br>${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}`}save.save();pauseModal(title,body)}
function draw(){const c=game.ctx,w=game.world;c.fillStyle="#120c18";c.fillRect(0,0,game.canvas.width,game.canvas.height);for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){const p=game.camera.world(x*TILE,y*TILE),s=TILE*game.camera.z;c.fillStyle=w.tiles[y][x]?"#21182a":"#6a4a7f";c.fillRect(p.x,p.y,s+1,s+1)}emoji(w.exit,"🕳️");if(w.shop)emoji(w.shop,"🚪");w.chests.forEach(x=>!x.open&&emoji(x,x.emoji,x.kind==="radiant"));emoji({x:game.player.rx,y:game.player.ry},"👑");drawMini()}
function emoji(o,t,glow=false){const p=game.camera.world(o.x*TILE,o.y*TILE),pulse=glow?1+Math.sin(performance.now()/170)*.12:1;game.ctx.save();if(glow){game.ctx.shadowColor="#ffe36f";game.ctx.shadowBlur=18}game.ctx.font=`${28*game.camera.z*pulse}px sans-serif`;game.ctx.textAlign="center";game.ctx.fillText(t,p.x+TILE*game.camera.z/2,p.y+TILE*game.camera.z/2);game.ctx.restore()}
function drawMini(){const m=document.getElementById("miniMap"),w=game.world;if(!save.state.settings.minimapVisible){m.style.opacity=0;return}m.style.opacity=1;const c=m.getContext("2d"),cell=Math.min(m.width/w.cols,m.height/w.rows),ox=(m.width-w.cols*cell)/2,oy=(m.height-w.rows*cell)/2;c.fillStyle="#130c18";c.fillRect(0,0,m.width,m.height);for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){c.fillStyle=w.tiles[y][x]?"#24192d":"#b178d0";c.fillRect(ox+x*cell,oy+y*cell,cell,cell)}c.fillStyle="#ff5d66";c.fillRect(ox+w.exit.x*cell,oy+w.exit.y*cell,cell,cell);c.fillStyle="#5dff82";c.fillRect(ox+game.player.x*cell,oy+game.player.y*cell,cell,cell)}
function path(w,s,g){const walk=(x,y)=>x>=0&&y>=0&&x<w.cols&&y<w.rows&&!w.tiles[y][x],key=p=>p.x+","+p.y;if(!walk(g.x,g.y))return[];const q=[{x:s.x,y:s.y}],seen=new Set([key(s)]),prev=new Map();while(q.length){const c=q.shift();if(c.x===g.x&&c.y===g.y)break;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n={x:c.x+dx,y:c.y+dy};if(!walk(n.x,n.y)||seen.has(key(n)))continue;seen.add(key(n));prev.set(key(n),c);q.push(n)}}if(!seen.has(key(g)))return[];const out=[];let c=g;while(c.x!==s.x||c.y!==s.y){out.push(c);c=prev.get(key(c))}return out.reverse()}
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
 const enemy=createEnemyBattleState(sp,e,save.state.player.currentFloor);
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
function win(caught,m){const gold=20+battle.enemy.level*6;save.state.player.gold+=gold;save.state.records.kills++;const progress=battle.party.map(x=>{const before={level:x.level,exp:x.exp,need:expNeed(x)};const gain=18+battle.enemy.level*7;x.exp+=gain;let levels=0;while(x.exp>=expNeed(x)){x.exp-=expNeed(x);x.level++;levels++;x.currentHp=calculatedStats(x).hp;x.currentMp=Math.min(maxMp(x),x.currentMp+2)}return{x,before,gain,levels,need:expNeed(x)}});let drop=null;if(Math.random()<.28){drop=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]);save.state.equipment.push(drop)}save.save();activeEnemy=null;document.querySelector(".battle-screen")?.remove();const result=`<div class="victory-title">VICTORY</div><div class="reward-summary"><b>+${gold}G</b>${drop?`<b>[${drop.rarity}] ${drop.name}</b>`:""}${caught?`<b>${m.nickname}を捕獲！</b>`:""}</div><div class="exp-results">${progress.map(p=>`<div><span>${SPECIES[p.x.speciesId].emoji}</span><section><b>${displayName(p.x)} Lv.${p.x.level}${p.levels?` <em>LEVEL UP!</em>`:""}</b><small>EXP +${p.gain}</small><i><u style="width:${Math.min(100,p.x.exp/p.need*100)}%"></u></i><small>${p.x.exp}/${p.need}</small></section></div>`).join("")}</div>`;if(battle.enemy.boss&&!save.state.player.bossRewards[save.state.player.currentFloor])return showBossRewards(result);app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"戦闘結果",result,"探索へ"));document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();screen="explore";render()}}
function showBossRewards(result){const floor=save.state.player.currentFloor,species=battle.enemy.speciesId,sp=SPECIES[species],weapon=createEquipment("weapon",{rarity:"LR"});weapon.name=`${sp.name}の王装`;const options=[{id:"weapon",icon:"⚔️",title:weapon.name,desc:`限定LR武器 / ${Object.entries(weapon.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" ")}`},{id:"boss",icon:sp.emoji,title:`${sp.name}を仲間にする`,desc:`Lv.${battle.enemy.level}のボス個体`},{id:"crystal",icon:"💎",title:`魔晶石 ×${80+floor*4}`,desc:"育成・ガチャ用の大量資源"},{id:"supply",icon:"🗃️",title:"深淵遠征セット",desc:`捕獲結晶×${5+Math.floor(floor/10)} / 回復薬×5`}];app.insertAdjacentHTML("beforeend",`<div class="game-modal"><div class="game-modal-card boss-reward"><div>${result}</div><h2>運命の4択</h2><p class="muted">中身を見て、ひとつだけ選択。選び直しはできません。</p><div class="boss-reward-grid">${options.map(o=>`<button data-boss-reward="${o.id}"><span>${o.icon}</span><b>${o.title}</b><small>${o.desc}</small></button>`).join("")}</div></div></div>`);document.querySelectorAll("[data-boss-reward]").forEach(b=>b.onclick=()=>{if(!confirm(`${b.querySelector("b").textContent}を選ぶ？\nこの階の他の報酬は入手できません。`))return;const id=b.dataset.bossReward;if(id==="weapon")save.state.equipment.push(weapon);if(id==="boss")save.state.monsters.push(createMonster(species,{level:battle.enemy.level,stars:3,nickname:`覇 ${sp.name}`}));if(id==="crystal")save.state.player.crystals+=80+floor*4;if(id==="supply"){save.state.inventory.captureCrystals+=5+Math.floor(floor/10);save.state.inventory.potions+=5}save.state.player.bossRewards[floor]=id;save.save();document.querySelector(".game-modal").remove();screen="explore";render()})}

function lose(){
 const lost=Math.floor(save.state.player.gold*.25);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;
 battle.party.forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m)});save.save();snapshot=null;document.querySelector(".battle-screen")?.remove();alert(`全滅！ ${lost}G失った`);go("home")
}
render();
