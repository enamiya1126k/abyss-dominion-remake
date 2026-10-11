// Execute the production party click handler. Unused presentation imports are
// stubbed to keep this test independent of browser assets and wallet storage.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {makeRunners587} from '../../src/runners587/Rules587.js';
const source=fs.readFileSync(new URL('../../src/party/PartyView462.js',import.meta.url),'utf8');
const context=vm.createContext({URL});
const module=new vm.SourceTextModule(source,{context});
const names=['emptyColorAttrs500','color499','resultActions490','memberAttrs485','partyFloor476','prepareEntry474','PARTY_GAMES462'];
await module.link(()=>new vm.SyntheticModule(names,function(){for(const n of names)this.setExport(n,n==='PARTY_GAMES462'?[]:()=>{throw new Error('unexpected presentation call: '+n);});},{context}));await module.evaluate();
const click=module.namespace.partyClick462,compatible=makeRunners587({members:[]}).rules587;
function client(version=compatible,party=true){const sent=[],c={state:{runnersVersion587:version,party:party?{code:'TEST',hostId:'p',members:[{playerId:'p',ready:false}]}:null},transport:{selfId:'p'},error:'',partyBrowse462:true,rendered:0,scrolls:0,ready:()=>true,render(){this.rendered++;},raw(op,data){sent.push({op,data:JSON.parse(JSON.stringify(data??{}))});},root:{querySelector:()=>({scrollIntoView:()=>c.scrolls++})}};return {c,sent};}
const button={dataset:{partyGame462:'runners'}};
test('the current rules version opens runners from an existing party',()=>{const {c,sent}=client();assert.equal(click(c,button),true);assert.equal(c.error,'');assert.equal(c.partyBrowse462,false);assert.deepEqual(sent,[{op:'partyGame462',data:{game:'runners'}}]);});
test('the same current version can select runners before creating a party',()=>{const {c,sent}=client(compatible,false);click(c,button);assert.equal(c.error,'');assert.equal(c.selectedGame462,'runners');assert.equal(c.scrolls,1);assert.equal(sent.length,0);});
for(const old of [undefined,0,20,21,22,23,25])test('an incompatible server '+old+' is still blocked',()=>{const {c,sent}=client();c.state.runnersVersion587=old;click(c,button);assert(c.error.length>0);assert.equal(c.rendered,1);assert.equal(sent.length,0);});
test('a successful retry after a refreshed server clears the old error',()=>{const {c,sent}=client(20);click(c,button);assert(c.error);c.state.runnersVersion587=compatible;click(c,button);assert.equal(c.error,'');assert.equal(sent.length,1);});
test('a disconnected client cannot send game-selection requests',()=>{const {c,sent}=client();c.ready=()=>false;click(c,button);assert(c.error.includes('接続'));assert.equal(sent.length,0);});
test('other game checks are unaffected',()=>{const {c,sent}=client();c.state.lavaVersion598=2;c.state.arcadeVersion580=1;click(c,{dataset:{partyGame462:'lava'}});assert.equal(c.error,'');assert.deepEqual(sent,[{op:'partyGame462',data:{game:'lava'}}]);});
test('ready remains available after a valid selection',()=>{const {c,sent}=client();click(c,button);click(c,{dataset:{partyAction462:'ready'}});assert.equal(c.error,'');assert.deepEqual(sent,[{op:'partyGame462',data:{game:'runners'}},{op:'partyReady462',data:{ready:true}}]);});
