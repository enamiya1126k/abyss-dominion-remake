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

const TILE=48,COLS=31,ROWS=31,app=document.getElementById("app"),save=new SaveService();
let screen="home",selected=null,equipmentTarget=null,game=null,battle=null,snapshot=null,activeEnemy=null;

class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66;if(p.x<l)this.x+=(p.x-l)/this.z*.12;if(p.x>r)this.x+=(p.x-r)/this.z*.12;if(p.y<t)this.y+=(p.y-t)/this.z*.12;if(p.y>b)this.y+=(p.y-b)/this.z*.12}clamp(w){const edge=30,mw=w.cols*TILE*this.z,mh=w.rows*TILE*this.z,ml=this.c.width/2-this.x*this.z,mt=this.c.height/2-this.y*this.z,minX=edge-(ml+mw),maxX=this.c.width-edge-ml,minY=edge-(mt+mh),maxY=this.c.height-edge-mt;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-ml:Math.max(minX,Math.min(maxX,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-mt:Math.max(minY,Math.min(maxY,this.oy))}}
function maze(){const tiles=Array.from({length:ROWS},()=>Array(COLS).fill(1));function carve(x,y){tiles[y][x]=0;for(const[dx,dy]of[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>Math.random()-.5)){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<COLS-1&&ny<ROWS-1&&tiles[ny][nx]){tiles[y+dy/2][x+dx/2]=0;carve(nx,ny)}}}carve(1,1);for(let i=0;i<44;i++){const x=1+Math.floor(Math.random()*(COLS-2)),y=1+Math.floor(Math.random()*(ROWS-2));if(tiles[y][x]&&((!tiles[y][x-1]&&!tiles[y][x+1])||(!tiles[y-1][x]&&!tiles[y+1][x])))tiles[y][x]=0}const cells=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!tiles[y][x])cells.push({x,y});const exit=cells.reduce((a,c)=>c.x+c.y>a.x+a.y?c:a,cells[0]);const pick=()=>structuredClone(cells.filter(c=>c.x+c.y>8&&!(c.x===exit.x&&c.y===exit.y))[Math.floor(Math.random()*(cells.length-30))+20]);const shop=save.state.player.currentFloor>=save.state.player.nextShopFloor?{...pick(),active:true}:null;return{cols:COLS,rows:ROWS,tiles,start:{x:1,y:1},exit:{...exit},shop,chests:[{...pick(),open:false},{...pick(),open:false}]}}
function path(w,s,g){const walk=(x,y)=>x>=0&&y>=0&&x<w.cols&&y<w.rows&&!w.tiles[y][x],key=p=>p.x+","+p.y;if(!walk(g.x,g.y))return[];const q=[{x:s.x,y:s.y}],seen=new Set([key(s)]),prev=new Map();while(q.length){const c=q.shift();if(c.x===g.x&&c.y===g.y)break;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n={x:c.x+dx,y:c.y+dy};if(!walk(n.x,n.y)||seen.has(key(n)))continue;seen.add(key(n));prev.set(key(n),c);q.push(n)}}if(!seen.has(key(g)))return[];const out=[];let c=g;while(c.x!==s.x||c.y!==s.y){out.push(c);c=prev.get(key(c))}return out.reverse()}

function render(){if(screen==="home"){app.innerHTML=HomeScreen(save.state);bindHome()}else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state);bindList()}else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m);bindDetail(m)}else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}else if(screen==="equipment"){equipmentTarget??=save.state.party[0];app.innerHTML=EquipmentScreen(save.state,equipmentTarget);bindEquipment()}else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}}
function go(s){screen=s;render()}
function bindHome(){document.getElementById("openMonsters").onclick=()=>go("monsters");document.getElementById("openSettings").onclick=()=>go("settings");document.getElementById("openExplore").onclick=()=>{save.state.player.inRun=true;save.save();go("explore")};document.getElementById("openEquipment").onclick=()=>go("equipment");detailButtons()}
function bindList(){document.getElementById("backHome").onclick=()=>go("home");const input=document.getElementById("monsterSearch");input.oninput=()=>document.querySelectorAll(".monster-card").forEach(c=>{const m=save.state.monsters.find(x=>x.id===c.querySelector("[data-monster-id]").dataset.monsterId),q=input.value.trim();c.style.display=m.nickname.includes(q)||SPECIES[m.speciesId].name.includes(q)?"grid":"none"});detailButtons()}
function detailButtons(){document.querySelectorAll("[data-monster-id]").forEach(b=>b.onclick=()=>{selected=b.dataset.monsterId;go("detail")})}
function bindDetail(m){document.getElementById("backMonsters").onclick=()=>go("monsters");document.getElementById("toggleFavorite").onclick=()=>{m.favorite=!m.favorite;save.save();render()};document.getElementById("saveNickname").onclick=()=>{const v=document.getElementById("nicknameInput").value.trim();if(v)m.nickname=v.slice(0,12);save.save();render()};document.querySelectorAll("[data-color-id]").forEach(b=>b.onclick=()=>{m.colorId=b.dataset.colorId;save.save();render()})}
function bindSettings(){document.getElementById("backHome").onclick=()=>go("home");document.getElementById("toggleAuto").onclick=()=>{save.state.settings.autoBattle=!save.state.settings.autoBattle;save.save();render()};document.getElementById("toggleMinimap").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();render()};document.getElementById("resetSave").onclick=()=>{if(confirm("初期化する？")){save.reset();snapshot=null;go("home")}}}


function bindEquipment(){
 document.getElementById("backEquipmentHome").onclick=()=>go("home");
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
function bindExplore(){const canvas=document.getElementById("gameCanvas"),r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=r.width*d;canvas.height=r.height*d;const mini=document.getElementById("miniMap");mini.width=132*d;mini.height=132*d;game=snapshot??{world:maze(),player:null,enemies:[],camera:null,paused:false,running:true,input:{pts:new Map(),last:null,pinch:null,drag:false,tap:0}};game.player??=new Entity(1,1);if(!game.enemies.length)for(let i=0;i<5;i++)spawn();game.camera=new Camera(canvas);if(snapshot?.cameraData)Object.assign(game.camera,snapshot.cameraData);else game.camera.reset(TILE,TILE);game.camera.clamp(game.world);game.ctx=canvas.getContext("2d");game.running=true;game.paused=false;bindInput(canvas);game.last=performance.now();requestAnimationFrame(loop);
 document.getElementById("miniMapToggle").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();document.getElementById("miniMapToggle").textContent=save.state.settings.minimapVisible?"MAP ON":"MAP OFF"};document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world)};document.getElementById("pauseParty").onclick=()=>pauseModal("編成",save.state.party.map(id=>{const m=save.state.monsters.find(x=>x.id===id);return`<div class="panel"><b>${displayName(m)}</b> Lv.${m.level}</div>`}).join(""));document.getElementById("pauseMonsters").onclick=()=>pauseModal("手持ち",save.state.monsters.map(m=>`<div class="panel"><b>${displayName(m)}</b> / ${SPECIES[m.speciesId].name}</div>`).join(""));document.getElementById("pauseItems").onclick=()=>pauseModal("持ち物",`<div class="panel">回復薬 ${save.state.inventory.potions}</div><div class="panel">捕獲結晶 ${save.state.inventory.captureCrystals}</div>`);document.getElementById("returnHome").onclick=()=>{if(confirm("帰還する？")){stopGame();snapshot=null;save.state.player.inRun=false;save.save();go("home")}}}
function spawn(){const cells=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!game.world.tiles[y][x]&&x+y>8)cells.push({x,y});const p=cells[Math.floor(Math.random()*cells.length)],ids=Object.keys(SPECIES),e=new Entity(p.x,p.y);e.speciesId=ids[Math.floor(Math.random()*ids.length)];e.level=Math.max(1,save.state.player.currentFloor+Math.floor(Math.random()*4)-1);e.repath=0;e.patrol=0;game.enemies.push(e)}
function loop(now){if(!game?.running)return;const dt=Math.min(.05,(now-game.last)/1000||0);game.last=now;if(!game.paused)update(dt);draw();requestAnimationFrame(loop)}
function update(dt){if(game.player.move(dt,5)){for(const c of game.world.chests)if(!c.open&&c.x===game.player.x&&c.y===game.player.y){c.open=true;save.state.records.chests++;if(Math.random()<.42){const item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]);save.state.equipment.push(item);save.save();pauseModal("装備獲得",`[${item.rarity}] ${item.name}<br>${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}`)}else{const gold=60+Math.floor(Math.random()*80);save.state.player.gold+=gold;save.save();pauseModal("宝箱",`${gold}Gを獲得`)}}if(game.world.shop&&game.player.x===game.world.shop.x&&game.player.y===game.world.shop.y){stopGame();save.state.player.nextShopFloor=save.state.player.currentFloor+3+Math.floor(Math.random()*5);save.save();screen="shop";render();return}if(game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){stopGame();snapshot=null;save.state.player.currentFloor++;save.state.player.maxFloor=Math.max(save.state.player.maxFloor,save.state.player.currentFloor);if(save.state.player.currentFloor%10===0)save.state.player.checkpoint=save.state.player.currentFloor;save.save();go("explore");return}}for(const e of game.enemies){e.repath-=dt;e.patrol-=dt;const dist=Math.abs(e.x-game.player.x)+Math.abs(e.y-game.player.y);if(dist<=5&&e.repath<=0){e.setPath(path(game.world,e,game.player).slice(0,8));e.repath=.55}else if(dist>5&&e.patrol<=0&&!e.path.length){const n=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:e.x+dx,y:e.y+dy})).filter(p=>game.world.tiles[p.y]?.[p.x]===0);if(n.length)e.setPath([n[Math.floor(Math.random()*n.length)]]);e.patrol=1+Math.random()*2}if(e.move(dt,dist<=5?2.7:1.5)&&e.x===game.player.x&&e.y===game.player.y){activeEnemy=e;snapshot={world:game.world,player:game.player,enemies:game.enemies,cameraData:{x:game.camera.x,y:game.camera.y,z:game.camera.z,ox:game.camera.ox,oy:game.camera.oy,manual:game.camera.manual}};stopGame();startBattle(e);return}}game.camera.follow(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world)}
function draw(){const c=game.ctx;c.fillStyle="#120c18";c.fillRect(0,0,game.canvas?.width||document.getElementById("gameCanvas").width,document.getElementById("gameCanvas").height);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const p=game.camera.world(x*TILE,y*TILE),s=TILE*game.camera.z;c.fillStyle=game.world.tiles[y][x]?"#2c2036":"#6a4a7f";c.fillRect(p.x,p.y,s+1,s+1)}emoji(game.world.exit,"🪜");if(game.world.shop)emoji(game.world.shop,"🚪");game.world.chests.forEach(x=>!x.open&&emoji(x,"🎁"));game.enemies.forEach(e=>circle(e.rx,e.ry,SPECIES[e.speciesId].baseStats.atk>12?"#df6262":"#a58f59",SPECIES[e.speciesId].name));circle(game.player.rx,game.player.ry,"#69e17c","");drawMini()}
function emoji(o,t){const p=game.camera.world(o.x*TILE,o.y*TILE);game.ctx.font=`${28*game.camera.z}px sans-serif`;game.ctx.textAlign="center";game.ctx.fillText(t,p.x+TILE*game.camera.z/2,p.y+TILE*game.camera.z/2)}function circle(x,y,color,label){const p=game.camera.world(x*TILE,y*TILE),cx=p.x+TILE*game.camera.z/2,cy=p.y+TILE*game.camera.z/2;game.ctx.fillStyle=color;game.ctx.beginPath();game.ctx.arc(cx,cy,15*game.camera.z,0,Math.PI*2);game.ctx.fill();if(label){game.ctx.fillStyle="#fff";game.ctx.font=`${9*game.camera.z}px sans-serif`;game.ctx.textAlign="center";game.ctx.fillText(label,cx,cy-18*game.camera.z)}}function drawMini(){const m=document.getElementById("miniMap");if(!save.state.settings.minimapVisible){m.style.opacity=0;return}m.style.opacity=1;const c=m.getContext("2d"),cell=Math.min(m.width/COLS,m.height/ROWS);c.fillStyle="#130c18";c.fillRect(0,0,m.width,m.height);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){c.fillStyle=game.world.tiles[y][x]?"#33243d":"#b178d0";c.fillRect(x*cell,y*cell,cell,cell)}c.fillStyle="#ff5d66";c.fillRect(game.world.exit.x*cell,game.world.exit.y*cell,cell,cell);c.fillStyle="#ef6c72";game.enemies.forEach(e=>c.fillRect(e.x*cell,e.y*cell,cell,cell));c.fillStyle="#5dff82";c.fillRect(game.player.x*cell,game.player.y*cell,cell,cell)}
function bindInput(c){game.canvas=c;const i=game.input;i.pts.clear();i.last=null;i.pinch=null;i.drag=false;const finish=e=>{i.pts.delete(e.pointerId);if(!i.pts.size){i.last=null;i.pinch=null;i.drag=false}else if(i.pts.size===1){const p=[...i.pts.values()][0];i.last={x:p.x,y:p.y};i.pinch=null;i.drag=true}};c.onpointerdown=e=>{if(game.paused)return;c.setPointerCapture?.(e.pointerId);i.pts.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});const p=[...i.pts.values()];if(p.length===1){i.last={x:e.clientX,y:e.clientY};i.drag=false}else if(p.length===2){i.drag=true;i.pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}};c.onpointermove=e=>{const p=i.pts.get(e.pointerId);if(!p||game.paused)return;p.x=e.clientX;p.y=e.clientY;const a=[...i.pts.values()];if(a.length===1){const o=a[0];if(!i.last){i.last={x:o.x,y:o.y};return}const dx=o.x-i.last.x,dy=o.y-i.last.y;if(Math.hypot(o.x-o.sx,o.y-o.sy)>7)i.drag=true;if(i.drag){game.camera.pan(dx*(c.width/c.clientWidth),dy*(c.height/c.clientHeight));game.camera.clamp(game.world)}i.last={x:o.x,y:o.y};i.pinch=null}else if(a.length===2){i.drag=true;const dis=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(i.pinch){game.camera.z=Math.max(.45,Math.min(1.55,game.camera.z*Math.max(.92,Math.min(1.08,dis/i.pinch))));game.camera.clamp(game.world)}i.pinch=dis;i.last=null}};c.onpointerup=e=>{const single=i.pts.size===1,drag=i.drag;finish(e);if(!single||drag||game.paused)return;const now=performance.now();if(now-i.tap<280){game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world);i.tap=0}else{const r=c.getBoundingClientRect(),w=game.camera.screen((e.clientX-r.left)*(c.width/r.width),(e.clientY-r.top)*(c.height/r.height)),g={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)};game.player.setPath(path(game.world,game.player,g));i.tap=now}};c.onpointercancel=c.onlostpointercapture=finish}
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
 battle={enemy,party,actorIndex:0,turn:1,busy:false,auto:save.state.settings.autoBattle,guard:null,skillMenu:false};
 renderBattle();if(battle.auto)setTimeout(()=>command("attack"),450/battleSpeed())
}
function actor(){const a=battle.party.filter(m=>m.currentHp>0);if(!a.length)return null;battle.actorIndex%=a.length;return a[battle.actorIndex]}
function renderBattle(){
 document.querySelector(".battle-screen")?.remove();
 app.insertAdjacentHTML("beforeend",BattleScreen(battle,save.state.inventory,save.state.settings));
 document.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>command(b.dataset.command));
 document.querySelectorAll("[data-skill-id]").forEach(b=>b.onclick=()=>command("skill",b.dataset.skillId));
 const closeSkill=document.getElementById("closeSkillMenu");if(closeSkill)closeSkill.onclick=()=>{battle.skillMenu=false;renderBattle()};
 document.getElementById("battleSpeed").onclick=()=>{const s=battleSpeed();save.state.settings.battleSpeed=s===1?2:s===2?4:1;save.save();renderBattle()};
 document.getElementById("toggleBattleAuto").onclick=()=>{battle.auto=!battle.auto;save.state.settings.autoBattle=battle.auto;save.save();renderBattle();if(battle.auto&&!battle.busy)command("attack")};
 document.getElementById("escapeBattle").onclick=()=>{if(Math.random()<.65){document.querySelector(".battle-screen").remove();activeEnemy=null;screen="explore";render()}else{alert("逃走失敗！");enemyTurn()}};
}
async function command(type,skillId=null){
 if(battle.busy)return;const a=actor();if(!a)return lose();battle.busy=true;
 const s=calculatedStats(a),e=battle.enemy;
 if(type==="attack"){
  await animateAttack(a.id);
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
  const skill=skillById(skillId);
  if(!learnedSkills(a).some(x=>x.id===skillId)||!canUseSkill(a,skill)){battle.busy=false;return alert("MPが足りない")}
  a.currentMp-=skill.mp;battle.skillMenu=false;
  if(skill.type==="selfHeal"){
   const h=Math.max(1,Math.floor(s.hp*skill.heal));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal");
  }else if(skill.type==="allHeal"){
   const healed=[];battle.party.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp,h=Math.max(1,Math.floor(max*skill.heal)),before=m.currentHp;m.currentHp=Math.min(max,m.currentHp+h);healed.push(m.currentHp-before)});
   await floatText(`全体 +${Math.max(...healed)}`,"party","heal");
  }else{
   await animateAttack(a.id,true);const hits=skill.hits??1;let total=0,anyCrit=false;
   for(let i=0;i<hits&&e.hp>0;i++){const critical=Math.random()<Math.min(.45,.1+(skill.critBonus??0)+(s.spd??0)*.004),raw=skillDamage(s,e,skill,critical),d=Math.max(1,Math.floor(raw*enemyDamageMultiplier(e)));e.hp=Math.max(0,e.hp-d);total+=d;anyCrit||=critical;await animateHit("enemy",critical);await floatText(`${critical?"CRITICAL ":""}-${d}`,"enemy",critical?"critical":"skill")}
   if(skill.type==="drain"){const h=Math.max(1,Math.floor(total*skill.drain));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal")}
  }
 }
 if(type==="guard"){battle.guard=a.id;await floatText("GUARD",a.id,"guard")}
 if(type==="item"){
  if(save.state.inventory.potions<=0){battle.busy=false;return alert("回復薬がない")}
  save.state.inventory.potions--;const h=Math.floor(s.hp*.5);a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal");
 }
 if(type==="capture"){
  if(save.state.inventory.captureCrystals<=0){battle.busy=false;return alert("捕獲結晶がない")}
  save.state.inventory.captureCrystals--;
  const chance=Math.max(.08,Math.min(.88,.2+(1-e.hp/e.maxHp)*.55+(Math.max(...battle.party.map(m=>m.level+m.stars*2+m.plus))-e.level)*.012));
  await floatText(`捕獲 ${Math.round(chance*100)}%`,"enemy","capture");await wait(500);
  if(Math.random()<chance){const m=createMonster(e.speciesId,{level:e.level});save.state.monsters.push(m);save.state.records.captures++;save.save();await animateDefeat("enemy",true);return win(true,m)}
 }
 save.save();renderBattle();await wait(340);
 if(e.hp<=0){await animateDefeat("enemy");return win(false,null)}
 await enemyTurn();
}
async function enemyTurn(){
 const a=actor();if(!a)return lose();
 const e=battle.enemy,action=chooseEnemyAction(e);

 if(action===ENEMY_ACTIONS.guard){
  await floatText("GUARD","enemy","guard");
 }else if(action===ENEMY_ACTIONS.charge){
  await floatText("CHARGE","enemy","charge");
 }else if(action===ENEMY_ACTIONS.heal){
  const h=enemyHealAmount(e);e.hp=Math.min(e.maxHp,e.hp+h);
  await floatText(`+${h}`,"enemy","heal");
 }else if(action===ENEMY_ACTIONS.enrage){
  e.atk=Math.floor(e.atk*1.18);e.def=Math.floor(e.def*1.08);
  await floatText("ENRAGE","enemy","enrage");
  await animateHit("enemy",true);
 }else{
  const s=calculatedStats(a);
  await animateAttack("enemy",action===ENEMY_ACTIONS.power);
  if(action!==ENEMY_ACTIONS.power&&Math.random()<.05){
   await floatText("MISS",a.id,"miss");
  }else{
   const guard=battle.guard===a.id,critical=Math.random()<(e.enraged?.13:.08);
   const multiplier=enemyAttackMultiplier(e,action);
   let d=Math.max(1,Math.floor((e.atk-s.def*.45)*multiplier*(guard?.45:1)));
   if(critical)d=Math.floor(d*1.55);
   a.currentHp=Math.max(0,a.currentHp-d);
   await animateHit(a.id,critical);
   await floatText(`${action===ENEMY_ACTIONS.power?"強撃 ":""}${critical?"CRITICAL ":""}-${d}`,a.id,critical?"critical":"enemy");
   if(a.currentHp<=0)await animateDefeat(a.id);
  }
 }

 battle.guard=null;save.save();renderBattle();await wait(420);
 if(!battle.party.some(m=>m.currentHp>0))return lose();
 battle.actorIndex++;battle.turn++;battle.busy=false;renderBattle();
 if(battle.auto){await wait(260);command("attack")}
}
function win(caught,m){
 const gold=20+battle.enemy.level*6;save.state.player.gold+=gold;save.state.records.kills++;
 battle.party.forEach(x=>{x.exp+=18+battle.enemy.level*7;const need=40+x.level*25;if(x.exp>=need){x.exp-=need;x.level++;x.currentHp=calculatedStats(x).hp;x.currentMp=Math.min(maxMp(x),x.currentMp+2)}});
 let drop=null;if(Math.random()<.28){drop=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]);save.state.equipment.push(drop)}
 save.save();snapshot.enemies=snapshot.enemies.filter(x=>x!==activeEnemy);activeEnemy=null;document.querySelector(".battle-screen")?.remove();
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"勝利！",caught?`${m.nickname}を仲間にした！<br>${gold}G獲得${drop?`<br>装備：[${drop.rarity}] ${drop.name}`:""}`:`${battle.enemy.name}を撃破！<br>${gold}G獲得${drop?`<br>装備：[${drop.rarity}] ${drop.name}`:""}`,"続ける"));
 document.getElementById("closeGameModal").onclick=()=>{document.querySelector(".game-modal").remove();screen="explore";render()}
}
function lose(){
 const lost=Math.floor(save.state.player.gold*.25);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;
 battle.party.forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m)});save.save();snapshot=null;document.querySelector(".battle-screen")?.remove();alert(`全滅！ ${lost}G失った`);go("home")
}
render();
