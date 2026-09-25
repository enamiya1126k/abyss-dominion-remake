import test from 'node:test';
import assert from 'node:assert/strict';
import {mainFixture550} from '../tools/build557/main-fixture.mjs';
const {RaceCoordinator451}=await mainFixture550();
test('main coordinator advertises cart v7, opens a random-course match and forwards authorized shots',()=>{
 let now=0;const session={playerId:'p0',clientKey:'fixture-key',connected:true,profile:{displayName:'あなた'}},sent=[],c=new RaceCoordinator451({sessions:new Map([['p0',session]]),now:()=>now,send:(id,m)=>sent.push(m)}),raw=(op,p={})=>c.handle(session,{op,rulesVersion:8,cartVersion543:7,ricochetVersion550:6,roster:[{id:'m',speciesId:'slime'}],slotOne476:'m',...p});
 raw('partyCreate462',{game:'cart'});let v=c.view(session);assert.equal(v.cartVersion543,7);assert.equal(v.cart.game,'cart');assert.equal(v.room,null);
 raw('partyReady462',{ready:true});raw('cart543',{gameId:v.cart.id,kind:'start'});v=c.view(session);assert.equal(v.cart.phase,'countdown');assert(v.cart.courseId556);assert(!('courseDeck556' in v.cart));assert(!('seed' in v.cart));assert(c.active('p0'));
 for(let i=0;i<140;i++){now+=25;c.advanceCart543()}v=c.view(session);assert.equal(v.cart.phase,'play');
 raw('cartInput543',{gameId:v.cart.id,round:1,seq:1,action:'shoot',angle:.22,power:.5});now+=25;c.advanceCart543();v=c.view(session);assert(v.cart.players[0].launched);assert.equal(v.cart.players[0].power,.5);assert.equal(v.cart.players[0].lastSeq,1);now+=50;c.advanceCart543();assert(sent.some(m=>m.type==='cartFrame543'));assert.equal(sent.filter(m=>m.type==='raceError451').length,0);assert(c.healthy());
});
