import test from 'node:test';import assert from 'node:assert/strict';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
import {mountBattleScreen} from '../src/ui/BattleScreenMount.js';
class Element{
 constructor(cls='',children=[]){this.cls=cls;this.childNodes=[];this.attrs={class:cls};this.scrollLeft=0;children.forEach(c=>this.append(c))}
 get firstChild(){return this.childNodes[0]??null}
 get nextSibling(){return this.parent?.childNodes[this.parent.childNodes.indexOf(this)+1]??null}
 get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}))}
 removeAttribute(n){delete this.attrs[n]}setAttribute(n,v){this.attrs[n]=v}
 append(c){c.remove();this.childNodes.push(c);c.parent=this}
 insertBefore(c,b){c.remove();this.childNodes.splice(b?this.childNodes.indexOf(b):this.childNodes.length,0,c);c.parent=this}
 remove(){if(this.parent){this.parent.childNodes.splice(this.parent.childNodes.indexOf(this),1);this.parent=null;this.removals=(this.removals||0)+1}}
 querySelector(s){return this.childNodes.find(c=>c.cls===s.slice(1))??null}
}
test('battle updates retain the connected strip and its horizontal position',()=>{
 const strip=new Element('turn-order');strip.innerHTML='round1';strip.scrollLeft=215;
 const old=new Element('battle-screen',[new Element('battle-header'),strip,new Element('battle-arena')]);
 const nextStrip=new Element('turn-order');nextStrip.innerHTML='round2';
 const next=new Element('battle-screen',[new Element('battle-header'),nextStrip,new Element('battle-arena')]);next.attrs['data-speed']='4';
 const app=new Element('app',[old]);app.ownerDocument={createElement:()=>({content:{firstElementChild:next}})};
 mountBattleScreen(app,'fixture');
 assert.equal(app.querySelector('.battle-screen'),old);assert.equal(old.querySelector('.turn-order'),strip);
 assert.equal(strip.removals,undefined);assert.equal(strip.scrollLeft,215);assert.equal(strip.innerHTML,'round2');assert.equal(old.attrs['data-speed'],'4');
 assert.deepEqual(old.childNodes.map(c=>c.cls),['battle-header','turn-order','battle-arena']);
});
test('all eight turn entries are rendered and named boss uses a compact label',()=>{
 const battle={party:[],enemies:[{id:'boss',name:'⚔️ 深淵I 暴食',faction:'abyss',boss:true,hp:100,maxHp:100,level:103,statuses:[]}],turnQueue:Array.from({length:8},(_,i)=>({id:String(i),name:`参加者${i+1}`,spd:10,type:'enemy'})),queueIndex:0,turn:1,auto:true};
 const html=BattleScreen(battle,{},{});
 assert.equal((html.match(/class="turn-chip /g)||[]).length,8);
 assert.match(html,/左右にスワイプ/);assert.match(html,/compact-boss-name375/);assert.match(html,/>深淵I 暴食<\/b>/);
 assert.doesNotMatch(html,/class="boss-badge">深淵/);
});
