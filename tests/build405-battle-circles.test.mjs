import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
import {battleCircleGeometry405} from '../src/ui/BattleCircleLayout405.js';
import {bindMagicCircleWorkshop405,commitCircleAction405} from '../src/ui/MagicCircleWorkshop405.js';
import {claimCircleResearch398} from '../src/chapterTwo/MagicCircleResearch398.js';
import {SaveService} from '../src/services/SaveService.js';
import * as Circle from '../src/core/MagicCircleSystem.js';
import {SPECIES} from '../src/data/species.js';
import {createMonster} from '../src/models/Monster.js';
import {chapterTwoEnemyEntries} from '../src/chapterTwo/ChapterTwoSystem.js';
import {RESONANCE_PAIRS385} from '../src/battle/TwinResonance385.js';
import {mountBattleScreen} from '../src/ui/BattleScreenMount.js';

function fixture(){
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 const save=new SaveService();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;save.state.player.gold=1e10;save.migrate(save.state);
 Circle.unlockMagicCircleFromTree(save.state,'gold_power');Circle.unlockMagicCircleFromTree(save.state,'random_arsenal');
 Circle.equipMagicCircle(save.state,save.state.monsters[0],'gold_power');
 return save;
}
function battleFixture(){
 const party=[createMonster('ch2_ryune'),createMonster('ch2_rose')];for(const m of party){m.currentHp=100;m.currentMp=100;}
 const enemies=chapterTwoEnemyEntries('heart').map((e,i)=>({...e,id:`enemy${i}`,name:SPECIES[e.speciesId].name,hp:10000,maxHp:10000}));
 return {party,enemies,species:SPECIES,specialBattle:true,specialBattleType:'chapterTwo',turn:1,turnQueue:[],enemyMagicCircleArt:Object.fromEntries(enemies.map(e=>[e.id,Circle.enemyMagicCircleMarkup(e.enemyMagicCircle)]))};
}
test('enemy equipment stays in battle data but never appears in its rendered card',()=>{
 const b=battleFixture(),before=JSON.stringify(b.enemies),html=BattleScreen(b,{},{});
 assert.ok(b.enemies.some(e=>e.enemyGear.length===6));
 assert.doesNotMatch(html,/chapter-two-loadout382|装備6枠|enemyEquipmentLevel|enemyGear/);
 assert.match(html,/enemy-battle-magic-circle/);assert.match(html,/HP 10,000\/10,000/);
 assert.equal(JSON.stringify(b.enemies),before);
});
test('a Chapter II boss has one BOSS role badge and the actual rarity alongside it',()=>{
 const b=battleFixture();b.party=[];
 for(const rarity of ['N','R','SR','SSR','UR','LR','神話']){
  const e={...b.enemies[0],combatRarity:rarity,boss:true};b.enemies=[e];
  const html=BattleScreen(b,{},{});
  assert.equal((html.match(/>BOSS<\/span>/g)??[]).length,1);
  assert.match(html,new RegExp(`combat-rank-badge[^>]*>${rarity}</span>`));
  assert.match(html,/boss-enemy/);assert.match(html,/combat-rank-unit rank-boss/);
 }
 delete b.enemies[0].combatRarity;
 assert.ok(BattleScreen(b,{},{}).includes(`>${SPECIES[b.enemies[0].speciesId].rarity}</span>`));
});
test('ordinary, floor and endgame boss targeting, faction and art classes remain intact',()=>{
 const b=battleFixture();b.party=[];b.specialBattleType='floorBoss';
 b.enemies=[{...b.enemies[0],floorBossCatalogId:'floor_boss_010'}];
 assert.match(BattleScreen(b,{},{}),/階層BOSS/);assert.doesNotMatch(BattleScreen(b,{},{}),/combat-rank-badge[^>]*>BOSS/);
 b.specialBattleType='chapterTwo';b.enemies=[{...b.enemies[0],floorBossCatalogId:null,endgameBossId:'ten_time',faction:'tenGod'}];
 const html=BattleScreen(b,{},{});assert.match(html,/party-floor-boss endgame-boss-art/);assert.match(html,/combat-rank-badge rank-ten-god">十神/);
 assert.match(html,/data-enemy-target="enemy0"/);
});
test('both pair statuses share one strip and retain quota, rest and unavailable-member messages',()=>{
 const b=battleFixture(),pair=RESONANCE_PAIRS385.find(p=>p.id==='mirrors');
 b.enemies=pair.members.map((id,i)=>({id:`e${i}`,speciesId:id,name:SPECIES[id].name,hp:100,maxHp:100}));
 let html=BattleScreen(b,{},{});
 assert.equal((html.match(/class="battle-resonance405"/g)??[]).length,1);assert.equal((html.match(/data-twin-pair="mirrors"/g)??[]).length,2);
 assert.equal((html.match(/残り2\/2/g)??[]).length,2);
 b.twinResonance385={used:{'ally:mirrors:ch2_ryune':1,'ally:mirrors:ch2_rose':1}};
 assert.match(BattleScreen(b,{},{}),/残り0\/2/);
 b.enemies[0].hp=0;assert.match(BattleScreen(b,{},{}),/戦闘不能・行動不能・隔離などで休止/);
 b.party=[];b.enemies=[];assert.doesNotMatch(BattleScreen(b,{},{}),/class="battle-resonance405"/);
 b.onlineMode='team';b.enemies=pair.members.map((id,i)=>({id:`e${i}`,speciesId:id,name:id,hp:100,maxHp:100}));
 assert.doesNotMatch(BattleScreen(b,{},{}),/class="battle-resonance405"/);
});

test('circle centers on visible pixels including asymmetric mirrored enemy canvases',()=>{
 const args={image:{left:100,top:80,width:200,height:200},bounds:{left:.1,right:.6,top:.2,bottom:.9},sprite:{left:70,top:65,width:100,height:100},slotWidth:90};
 const ally=battleCircleGeometry405(args),enemy=battleCircleGeometry405({...args,mirrored:true});
 assert.equal(ally.left,100);assert.equal(enemy.left,160);assert.equal(ally.top,125);assert.equal(enemy.top,125);
 assert.ok(Math.abs(ally.width-115.2)<1e-9);assert.equal(enemy.width,ally.width);
});
test('circle follows fitted art and converts viewport scale back to sprite coordinates',()=>{
 const result=battleCircleGeometry405({image:{left:120,top:230,width:80,height:120},bounds:{left:0,right:1,top:0,bottom:1},sprite:{left:100,top:200,width:100,height:100,layoutWidth:50,layoutHeight:50},slotWidth:200});
 assert.equal(result.left,30);assert.equal(result.top,45);assert.ok(Math.abs(result.width-69.6)<1e-9);
 const tiny=battleCircleGeometry405({image:{left:0,top:0,width:1,height:1},bounds:{left:0,right:1,top:0,bottom:1},sprite:{left:0,top:0,width:1,height:1},slotWidth:40});
 assert.equal(tiny.width,32);assert.ok(Object.values(tiny).every(Number.isFinite));
});

// An intentionally small adapter checks event/identity/scroll behavior, without
// invoking a browser or claiming to validate rendered mobile layout.
function workshopHarness(save){
 const ids=['gold_power','random_arsenal'],sim={copyShift:0,shift:0},feedback={textContent:''},footer={};let modal,listener;
 const list={scrollTop:700,querySelectorAll:()=>modal.rows};
 function snapshot(){
  return {gold:save.state.player.gold,current:Circle.equippedMagicCircle(save.state.monsters[0],save.state),rows:ids.map(id=>({id,level:Circle.magicCircleLevel(save.state,id),price:Circle.magicCirclePrice(save.state,id)}))};
 }
 function fragment(data,live=false){
  const header=new Map();
  const simple=(text='')=>({textContent:text,innerHTML:text,className:'workshop-circle',getAttribute:()=>'',setAttribute(){}});
  header.set('.workshop-circle',simple(String(data.current.level)));
  header.set('.magic-circle-workshop > header h3',simple(`${data.current.name} Lv.${data.current.level}`));
  header.set('.magic-circle-workshop > header p',simple(data.current.levelEffect.summary));
  header.set('.magic-circle-workshop > header strong',simple(String(data.gold)));
  const rows=data.rows.map(record=>{
   let content=`${record.level}:${record.price}`;
   const copy={get innerHTML(){return content},set innerHTML(v){content=v;if(live){sim.shift+=sim.copyShift;sim.copyShift=0;}}};
   const buttons=new Map();
   for(const attr of ['data-circle-buy','data-circle-equip']){
    const buy=attr==='data-circle-buy',key=buy?'circleBuy':'circleEquip';
    const button={dataset:{[key]:record.id},disabled:buy?(record.level>=99||data.gold<record.price):data.current.id===record.id,textContent:buy?'GOLD強化':'装着',isConnected:true,hasAttribute:name=>name===attr,closest(){return this},getBoundingClientRect:()=>({top:120+sim.shift-(list.scrollTop-700)})};
    buttons.set(`[${attr}]`,button);
   }
   return {dataset:{circleRow405:record.id},className:'magic-circle-row',querySelector:selector=>selector==='.circle-copy405'?copy:buttons.get(selector)};
  });
  return {rows,header,querySelector:selector=>header.get(selector)??null,querySelectorAll:()=>rows};
 }
 const initial=fragment(snapshot(),true);
 modal={...initial,isConnected:true,contains:button=>modal.rows.some(row=>['data-circle-buy','data-circle-equip'].some(a=>row.querySelector(`[${a}]`)===button)),
  querySelector:selector=>selector==='.magic-circle-list'?list:selector==='.circle-feedback405'?feedback:selector==='[data-modal-primary]'?footer:initial.header.get(selector)??null,
  addEventListener:(type,fn)=>{listener=fn},ownerDocument:{createElement:()=>({set innerHTML(markup){this.content=fragment(JSON.parse(markup));}})}};
 const failures=[];let closed=0;
 bindMagicCircleWorkshop405(modal,{save,monsterId:save.state.monsters[0].id,renderBody:()=>JSON.stringify(snapshot()),onClose:()=>closed++,onFailure:m=>failures.push(m)});
 return {modal,list,sim,feedback,failures,button:(id='gold_power',action='buy')=>modal.rows.find(r=>r.dataset.circleRow405===id).querySelector(`[data-circle-${action}]`),tap:button=>listener({target:button}),get closed(){return closed},footer};
}
test('ten taps reuse the same button and scrollport, charge each new price once, and survive reload',()=>{
 const save=fixture(),h=workshopHarness(save),button=h.button(),start=save.state.player.gold,instance=save.state.monsters[0].magicCircleInstanceId;
 let spent=0;
 for(let i=1;i<=10;i++){spent+=Circle.magicCirclePrice(save.state,'gold_power');h.tap(button);assert.equal(Circle.magicCircleLevel(save.state,'gold_power'),i+1);assert.equal(h.button(),button);assert.equal(h.list.scrollTop,700);}
 assert.equal(save.state.player.gold,start-spent);assert.equal(h.closed,0);assert.equal(h.failures.length,0);
 assert.equal(save.state.monsters[0].magicCircleInstanceId,instance);
 const loaded=new SaveService();assert.equal(Circle.magicCircleLevel(loaded.state,'gold_power'),11);assert.equal(loaded.state.player.gold,start-spent);
});
test('copy reflow compensates the clicked button offset without moving focus or rebuilding it',()=>{
 const h=workshopHarness(fixture()),button=h.button();h.sim.copyShift=23;
 const y=button.getBoundingClientRect().top;h.tap(button);
 assert.equal(h.list.scrollTop,723);assert.equal(button.getBoundingClientRect().top,y);assert.equal(h.button(),button);
});
test('last affordable upgrade disables all unaffordable purchases; extra taps spend nothing',()=>{
 const save=fixture();save.state.player.gold=Circle.magicCirclePrice(save.state,'gold_power');const h=workshopHarness(save),button=h.button();
 h.tap(button);assert.equal(save.state.player.gold,0);assert.equal(button.disabled,true);assert.equal(h.button('random_arsenal').disabled,true);
 const after=JSON.stringify(save.state);for(let i=0;i<3;i++)h.tap(button);assert.equal(JSON.stringify(save.state),after);
});
test('level 99 disables the existing button and never charges a level 100 purchase',()=>{
 const save=fixture();save.state.magicCircles.instances.find(i=>i.circleId==='gold_power').level=98;const h=workshopHarness(save),button=h.button();
 h.tap(button);assert.equal(Circle.magicCircleLevel(save.state,'gold_power'),99);assert.equal(button.disabled,true);
 const gold=save.state.player.gold;h.tap(button);assert.equal(save.state.player.gold,gold);
});
test('false or thrown saves roll back level and GOLD; a retry on the same button works',()=>{
 for(const failure of [()=>false,()=>{throw new Error('disk full') }]){
  const save=fixture(),persist=save.save.bind(save),h=workshopHarness(save),button=h.button(),start=save.state.player.gold;
  save.save=failure;h.tap(button);assert.equal(Circle.magicCircleLevel(save.state,'gold_power'),1);assert.equal(save.state.player.gold,start);assert.equal(h.failures.length,1);assert.equal(h.button(),button);
  save.save=persist;h.tap(button);assert.equal(Circle.magicCircleLevel(save.state,'gold_power'),2);assert.ok(save.state.player.gold<start);assert.equal(h.list.scrollTop,700);
 }
});
test('reentrant clicks during persistence commit only one upgrade',()=>{
 const save=fixture(),h=workshopHarness(save),button=h.button(),persist=save.save.bind(save);let count=0;
 save.save=()=>{count++;h.tap(button);return persist()};h.tap(button);
 assert.equal(count,1);assert.equal(Circle.magicCircleLevel(save.state,'gold_power'),2);
});
test('upgrading a circle worn by another ally does not transfer its ownership',()=>{
 const save=fixture(),other=createMonster('slime');save.state.monsters.push(other);save.state.party.push(other.id);Circle.equipMagicCircle(save.state,other,'random_arsenal');
 const h=workshopHarness(save),instance=other.magicCircleInstanceId;h.tap(h.button('random_arsenal'));
 assert.equal(save.state.monsters.find(m=>m.id===other.id).magicCircleInstanceId,instance);assert.equal(Circle.magicCircleLevel(save.state,'random_arsenal'),2);
 const result=commitCircleAction405(save,s=>Circle.equipMagicCircle(s,s.monsters[0],'random_arsenal'));assert.equal(result.ok,false);
});
test('workshop close and X use the same refresh callback',()=>{
 const h=workshopHarness(fixture());h.footer.onclick();assert.equal(h.closed,1);h.modal._onDismiss();assert.equal(h.closed,2);
});

test('Build405 stylesheet is loaded after the shared and equipment styles and save schema is unchanged',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../src/Styles/build405-battle-circles.css',import.meta.url),'utf8');
 assert.ok(html.indexOf('build405-battle-circles.css')>html.indexOf('build404-equipment.css'));
 assert.match(html,/main\.js\?v=3\.1\.85-build405/);assert.match(css,/grid-template-rows: auto auto auto 28px minmax\(0,1fr\) auto/);
 const config=fs.readFileSync(new URL('../src/core/config.js',import.meta.url),'utf8');assert.match(config,/SAVE_SCHEMA_VERSION\s*=\s*84/);
});


test('research rollback and retry grant exactly three instances once without spending GOLD',()=>{
 const save=fixture(),persist=save.save.bind(save),gold=save.state.player.gold,count=save.state.magicCircles.instances.length;
 save.save=()=>false;assert.equal(commitCircleAction405(save,claimCircleResearch398).ok,false);assert.equal(save.state.magicCircles.instances.length,count);
 save.save=persist;assert.equal(commitCircleAction405(save,claimCircleResearch398).ok,true);assert.equal(save.state.magicCircles.instances.length,count+3);
 assert.equal(commitCircleAction405(save,claimCircleResearch398).ok,false);assert.equal(save.state.magicCircles.instances.length,count+3);assert.equal(save.state.player.gold,gold);
});

class TreeNode {
 constructor(kind,children=[]){this.kind=kind;this.childNodes=[];this.attributes=[{name:'class',value:kind}];this.scrollLeft=0;this.removals=0;this.innerHTML=kind;children.forEach(c=>this.append(c));}
 get firstChild(){return this.childNodes[0]??null}
 get nextSibling(){const children=this.parent?.childNodes??[];return children[children.indexOf(this)+1]??null}
 removeAttribute(name){this.attributes=this.attributes.filter(a=>a.name!==name)}
 setAttribute(name,value){this.removeAttribute(name);this.attributes.push({name,value})}
 querySelector(selector){for(const child of this.childNodes){if(child.kind===selector.slice(1))return child;const nested=child.querySelector(selector);if(nested)return nested;}return null;}
 append(node){this.insertBefore(node,null)}
 insertBefore(node,cursor){node.remove();const index=cursor?this.childNodes.indexOf(cursor):this.childNodes.length;this.childNodes.splice(index,0,node);node.parent=this;}
 remove(){if(!this.parent)return;this.parent.childNodes.splice(this.parent.childNodes.indexOf(this),1);this.parent=null;this.removals++;}
}
function battleTree(resonance=true){return new TreeNode('battle-screen',['battle-header','turn-order',...(resonance?['battle-resonance405']:[]),'battle-arena','battle-command'].map(x=>new TreeNode(x)));}
test('battle updates retain both connected swipe surfaces and remove a vanished resonance row',()=>{
 const old=battleTree(),app=new TreeNode('app',[old]);let next;
 app.ownerDocument={createElement:()=>({set innerHTML(value){this.content={firstElementChild:next}}})};
 const order=old.querySelector('.turn-order'),resonance=old.querySelector('.battle-resonance405');order.scrollLeft=123;resonance.scrollLeft=210;
 for(let i=0;i<3;i++){
  next=battleTree();next.querySelector('.turn-order').innerHTML=`turn${i}`;next.querySelector('.battle-resonance405').innerHTML=`quota${i}`;
  assert.equal(mountBattleScreen(app,'markup'),old);assert.equal(old.querySelector('.turn-order'),order);assert.equal(old.querySelector('.battle-resonance405'),resonance);
  assert.equal(order.scrollLeft,123);assert.equal(resonance.scrollLeft,210);assert.equal(order.removals,0);assert.equal(resonance.removals,0);
  assert.equal(order.innerHTML,`turn${i}`);assert.equal(resonance.innerHTML,`quota${i}`);
  assert.deepEqual(old.childNodes.map(n=>n.kind),['battle-header','turn-order','battle-resonance405','battle-arena','battle-command']);
 }
 next=battleTree(false);mountBattleScreen(app,'markup');assert.equal(old.querySelector('.battle-resonance405'),null);assert.equal(order.scrollLeft,123);
 next=battleTree();mountBattleScreen(app,'markup');assert.equal(old.querySelector('.battle-resonance405').scrollLeft,0);assert.equal(old.childNodes.length,5);
});
