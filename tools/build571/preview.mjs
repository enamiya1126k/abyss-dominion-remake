import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd(),styles=[507,508,509,510,511,512].map(n=>`<link rel="stylesheet" href="/src/Styles/build${n}-luck.css">`).join('')+'<link rel="stylesheet" href="/src/Styles/build528-party.css"><link rel="stylesheet" href="/src/Styles/build571-luck.css">';
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles}<style>@font-face{font-family:QAJP;src:url(/qa-font.ttf)}*{box-sizing:border-box}body{margin:0;background:#0c2924;color:#f5e8ad;font-family:QAJP,system-ui,sans-serif}button,input{font:inherit}#root{max-width:720px;margin:auto}.sg-monster{display:inline-grid;place-items:center;font-size:24px}.sg-monster img{width:100%;height:100%;object-fit:contain}</style><main id="root"></main><script type="module">
import {game,gear,resolve as resolveRound} from '/tools/build562/fixture.mjs';
import {publicLuck511} from '/src/luck/Rules511.js';
import {luckView511,luckAfter511,luckBefore511,luckClick511,paintLuck511} from '/src/luck/View511.js';
window.fakeNow=120000;Date.now=()=>fakeNow;
window.c={root:document.querySelector('#root'),state:{},transport:{selfId:'p0'},ready:()=>true,roster:()=>[],sgSpeciesName463:x=>x,sgMonster463:id=>'<span class="sg-monster"><img alt="" src="/assets/monsters/'+({slime:'001_slime',goblin:'007_goblin',wolf:'025_wolf',skeleton:'006_skeleton'}[id]??'001_slime')+'/idle1.png"></span>',lkUI511:{sound:false,artReady:false},raw:()=>true};
c.render=()=>{luckBefore511(c);c.root.innerHTML=luckView511(c);luckAfter511(c);paintLuck511(c,fakeNow)};
c.root.onclick=e=>{const b=e.target.closest('button');if(b)luckClick511(c,b)};
window.load=(mode='hand')=>{
 c.lkUI511.pending=null;c.lkUI511.gearSeat=null;fakeNow=120000;const g=game({round:4,rounds:16,items:['sprint','pioneer','hunter','salvage'],distance:[2500,3000,2000,500]});
 g.phase=mode==='impact'?'broadcast':mode;g.phaseAt=fakeNow;g.deadline=fakeNow+35000;
 g.players[0].loadout=['solar','coil','hunter','doubling','mile','combo','shield'].flatMap(id=>gear(id,1,1));
 Object.assign(g.players[0],{wards:2,coils:2,suns:3,strikes:1,attackHits:2,lastAdvance:321});
 g.players[1].loadout=gear('shield',1,1);g.players[2].loadout=gear('spring',1,1);g.players[3].loadout=gear('mirror',1,1);
 g.plan511[3].seats[0].boxes[0]=['hunter','resonance','sprint','vault'];g.items511[0]=null;
 if(mode!=='hand'){g.items511[0]=2;if(mode==='impact')g.plan511[3].seats[1].boxes[0][0]='shell';if(mode==='dice'){g.plan511[3].seats[0].boxes[0][2]='triple';g.players[0].loadout=gear('focus',3);}g.event=resolveRound(g);}
 window.rawGame=g;c.state.luck=publicLuck511(g,'p0');c.state.party={hostId:'p0',members:g.members.map(m=>({...m,ready:true,connected:true}))};c.render();
};
window.at=ms=>{fakeNow=120000+ms;c.lkUI511.lastPaint=null;paintLuck511(c,fakeNow)};
window.lobby=flag=>{const g=rawGame;g.phase='lobby';g.members.forEach(m=>m.owned=[m.choice]);c.state.luck=publicLuck511(g,'p0');if(!flag)delete c.state.luck.itemRules571;c.render()};
load();window.ready=true;
</script></html>`;
export const createServer=()=>http.createServer(async(req,res)=>{try{
 const p=new URL(req.url,'http://local').pathname;
 if(p==='/'){res.setHeader('Content-Type','text/html');res.end(html);return}
 if(p==='/qa-font.ttf'){res.setHeader('Content-Type','font/ttf');res.end(await readFile('/tmp/NotoSansJP.ttf'));return}
 if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
 // This isolated screen fixture excludes the unrelated party lounge and character catalogue.
 if(p==='/src/party/PartyView462.js'){res.setHeader('Content-Type','text/javascript');res.end('export const partySeats462=()=>"";');return}
 const file=resolve(root,p.slice(1));
 if(!file.startsWith(resolve(root,'..')+'/'))throw Error('Invalid path');
 const bytes=await readFile(file);res.setHeader('Content-Type',{'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'}[extname(file)]??'text/plain');res.end(bytes);
 }catch(e){res.writeHead(404);res.end(String(e))}});
