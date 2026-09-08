// Retain the original movement regressions against the shared Chapter Two field.
import test from 'node:test';import assert from 'node:assert/strict';
import {fieldFixture} from './helpers/chapterTwoField.mjs';
import {moveChapterTwoRoom} from '../src/chapterTwo/ChapterTwoSystem.js';
test('tap reaches a doorway; a new-room spawn is not overwritten on disposal',()=>{
 const f=fieldFixture();try{const d=f.g.chapterTwoObjects.find(o=>o.type==='door');f.tap(d.x,d.y);f.tick(500);assert.equal(f.contacts[0].id,'east');moveChapterTwoRoom(f.s,'east');const position={...f.run.position};f.g.disposeChapterTwo();assert.deepEqual(f.run.position,position);assert.equal(f.listeners.size,0);assert.equal(f.canvas.onpointerdown,null)}finally{f.cleanup()}
});
test('map directions walk the party; entering a room never triggers a battle without movement',()=>{
 const f=fieldFixture(1);try{f.tick(50);assert.equal(f.contacts.length,0);f.g.chapterTwoDoor('south');f.tick(5);assert.equal(f.contacts.length,0);f.g.chapterTwoDoor('north');f.tick(500);assert.ok(f.contacts.length===1);assert.ok(['enemy','door'].includes(f.contacts[0].type))}finally{f.cleanup()}
});
test('tapping a visible enemy reaches a single encounter and disposes cleanly',()=>{
 const f=fieldFixture(3);try{const e=f.g.chapterTwoObjects.find(o=>o.type==='enemy');f.tap(e.x,e.y);f.tick(250);assert.equal(f.contacts.length,1);assert.equal(f.contacts[0].id,'west');f.tick(50);assert.equal(f.contacts.length,1)}finally{f.cleanup()}
});
