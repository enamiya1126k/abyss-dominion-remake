import {chapterTwoRooms,ENCOUNTERS,chapterTwoWorld,chapterTwoObjective} from './ChapterTwoSystem.js?v=3.1.61-build381';
import {portalTowardSection} from '../core/DungeonSectionSystem.js?v=3.1.60-build380';
export function mountChapterTwoField(g,{canvas,Entity,Camera,findPath,drawScene,bindInput,updateTrail,TILE,run,onSave,onContact,onAutoChange=()=>{},blocked=()=>false}){
 const ROOMS=chapterTwoRooms(run),room=ROOMS[run.room];g.chapterTwo=true;g.world=chapterTwoWorld(run);
 if(g.world.sectionByCell[`${run.position.x},${run.position.y}`]!==g.world.currentSectionId)run.position={...g.world.sections[run.room].center};
 g.player=new Entity(run.position.x,run.position.y);g.canvas=canvas;g.ctx=canvas.getContext('2d');g.camera=new Camera(canvas);g.running=true;g.paused=false;g.partyTrail=[];
 let frame=0,disposed=false,last=performance.now(),lastPaint=0,lastSave=0,armed=false,contactLock=null;
 const objects=g.world.sectionPortals.filter(p=>p.sectionId===g.world.currentSectionId).map(p=>({...p,id:p.direction,type:'door',label:ROOMS[Number(p.targetSectionId.split('-').at(-1))].name}));
 for(const e of g.world.bosses)if(e.active&&e.sectionId===g.world.currentSectionId)objects.push({...e,type:'enemy',label:ENCOUNTERS[e.id].name});
 for(const c of g.world.chests)if(!c.open&&c.sectionId===g.world.currentSectionId)objects.push({...c,id:c.id,vaultIndex:c.vaultIndex,type:'chest',label:c.vaultIndex===9?'地域限定武器・大宝箱':c.vaultIndex!=null?'宝物庫の宝箱':'宝箱'});
 if(g.world.hotSpring.sectionId===g.world.currentSectionId)objects.push({...g.world.hotSpring,id:'spring',type:'spring',label:'回復の泉'});
 for(const k of g.world.campaignKeys??[])if(!k.collected&&k.sectionId===g.world.currentSectionId)objects.push({...k,type:'key',label:'落ちた鍵'});
 g.chapterTwoObjects=objects;
 function fit(){const rect=canvas.getBoundingClientRect(),ratio=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));g.camera.z=Math.max(.55,Math.min(1.25,canvas.width/(TILE*13)));g.camera.clamp(g.world);const mini=document.getElementById('miniMap');if(mini){const r=mini.getBoundingClientRect();mini.width=Math.max(1,Math.round((r.width||170)*ratio));mini.height=Math.max(1,Math.round((r.height||170)*ratio));}}
 g.camera.reset(g.player.x*TILE,g.player.y*TILE);fit();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;observer?.observe(canvas);
 const busy=()=>blocked()||g.paused;
 function walk(goal,{manual=false}={}){if(busy())return;if(manual&&run.auto377){run.auto377=false;onAutoChange(false)}const route=findPath(g.world,g.player,goal);g.player.setPath(route);armed=route.length>0||Math.hypot(g.player.x-goal.x,g.player.y-goal.y)<1.2;g.camera.manual=false;}
 g.chapterTwoTap=goal=>walk(goal,{manual:true});bindInput(canvas);
 const key=e=>{if(busy()||e.target?.matches('input,textarea,button')||document.querySelector('.game-modal'))return;const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(!d)return;e.preventDefault();if(!g.player.path.length)walk({x:g.player.x+d[0],y:g.player.y+d[1]},{manual:true})};document.addEventListener('keydown',key);
 function persist(){if(run.room===room.id)run.position={x:g.player.x,y:g.player.y};if(!g.discardChapterTwoSave)onSave?.()}
 function targetRoom(n){if(n===run.room)return objects.find(o=>o.type==='key')??objects.find(o=>o.type==='enemy'&&!ENCOUNTERS[o.id].vault)??objects.find(o=>o.type==='chest');const portal=portalTowardSection(g.world,g.world.currentSectionId,`forest-${n}`);return portal?objects.find(o=>o.type==='door'&&o.id===portal.direction):null;}
 function autoStep(){if(!run.auto377||g.player.path.length||busy())return;
 const key=objects.find(o=>o.type==='key');if(key){walk(key);return}
 if(run.completed){const local=objects.find(o=>o.type==='enemy'&&!ENCOUNTERS[o.id].vault)??objects.find(o=>o.type==='chest');if(local){walk(local);return}const next=[1,3,4].find(n=>!(run.roaming380??[]).includes(`roam${run.area??0}_${n}`));if(next!=null){const t=targetRoom(next);if(t)walk(t);return}if(!run.chest){const t=targetRoom(2);if(t)walk(t);return}if(run.room!==0){const t=targetRoom(0);if(t)walk(t)}return}
 const target=objects.find(o=>o.type==='enemy'&&!ENCOUNTERS[o.id].vault)??targetRoom(chapterTwoObjective(run).targetRoom);if(target)walk(target);
 }

 function tick(now){if(disposed||!g.running||!canvas.isConnected)return;const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!busy()){autoStep();const moved=g.player.move(dt,5);if(g.player.path.length||moved){updateTrail();g.camera.follow(g.player.rx*TILE,g.player.ry*TILE,dt);g.camera.clamp(g.world)}
   if(moved&&now-lastSave>1000){persist();lastSave=now}
   if(contactLock&&Math.hypot(g.player.rx-contactLock.x,g.player.ry-contactLock.y)>1.2)contactLock=null;
   if(armed){const object=objects.find(o=>o!==contactLock&&Math.hypot(g.player.rx-o.x,g.player.ry-o.y)<.8);if(object){armed=false;contactLock=object;g.player.path=[];persist();onContact(object)}}
  }
  if(!disposed&&now-lastPaint>=1000/30){drawScene();lastPaint=now}if(!disposed)frame=requestAnimationFrame(tick);
 }
 g.centerChapterTwo=()=>{g.camera.reset(g.player.rx*TILE,g.player.ry*TILE);fit()};
 g.chapterTwoDoor=direction=>{const object=objects.find(o=>o.type==='door'&&o.id===direction);if(object)walk(object,{manual:true})};
 g.chapterTwoNavigate=n=>{const object=targetRoom(n);if(object){g.chapterTwoTarget=object;walk(object,{manual:true});return object.label}return null};
 g.chapterTwoToggleAuto=()=>{run.auto377=!run.auto377;g.player.path=[];onAutoChange(run.auto377);persist()};
 g.saveChapterTwo=persist;
 g.disposeChapterTwo=()=>{if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer?.disconnect();g.movableControlsResizeObserver?.disconnect();document.removeEventListener('keydown',key);canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=null;persist()};
 frame=requestAnimationFrame(tick);return g;
}
