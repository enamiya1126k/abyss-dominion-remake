// Local-only QA: production modules and exact native functions; no main startup,
// sockets, accounts or production data. Battle progression is covered in Node.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
import {run} from '../build430/native-harness.mjs';
import {MOTHER_ENEMY422,tuneMother422} from '../../src/primordial/Mother422.js';
import {createEnemyBattleState} from '../../src/battle/EnemyAI.js';import {SPECIES} from '../../src/data/species.js';
import {prepareMother426,createMotherChild426,MOTHER_SUMMON_POOL426} from '../../src/primordial/Cycle426.js';
const root=process.cwd(),boss=tuneMother422(createEnemyBattleState(SPECIES.ch2_ionea,{...MOTHER_ENEMY422,id:'mother433'},1));
const f=await run(['ten_life','ten_time','abyss_wrath','abyss_gluttony'],[],{inspect:true,level:4000,enemyUnits:[boss],battleOptions:{specialBattleType:'mother422',specialBattle:true,specialTitle:'第二章・原母イオネア',specialSubtitle:'原初の聖胎',battleTheme:'boss'}});
prepareMother426(f.b);const children=['slime','ten_life','ch2_ryune'].map(id=>{let first=true;return createMotherChild426(f.b,f.b.enemies[0],()=>{if(first){first=false;return(MOTHER_SUMMON_POOL426.indexOf(id)+.5)/MOTHER_SUMMON_POOL426.length;}return .5;});});
const source=fs.readFileSync('src/main.js','utf8'),map=JSON.parse(fs.readFileSync('tools/build430/native-source-map.json','utf8'));
const imports=map.imports.map((e,i)=>`import * as import${i} from '${e.source.replace('./','/src/')}';\nconst {${e.specifiers.map(s=>`${s.imported}:${s.local}`).join(',')}}=import${i};`).join('\n');
const functions=map.functions.map(e=>source.slice(e.start,e.end)).join('\n'),constants=map.constants.map(s=>'const '+s+';').join('\n');
const classes=source.split('\n').filter(line=>/^class (Entity|Camera)\b/.test(line)).join('\n');
const script=imports+'\n'+classes+'\n'+functions+'\n'+constants+`\n
const fixture=await(await fetch('/fixture-data')).json(),TILE=88,app=document.querySelector('#app'),save={state:fixture.state,save:()=>true},audio={setScene(){},sfx(){}};
let game=null,battle=null,snapshot=null,activeEnemy=null,screen='campaignFinalFloor',campaignStoryPresenting=false,battleBiomePanelTimer=null,formationOrigin,navigationOrigin;
const explorationSpriteCache=new Map();let starts=[],stories=[];
render=()=>renderCampaignFinalFloor();go=route=>{screen=route;render();};
showCampaignStoryReplaySequence=scenes=>stories.push(scenes.map(s=>s.id));
showToast=text=>window.lastToast434=text;
document.addEventListener('click',e=>{if(e.target.matches('[data-modal-dismiss]')){const m=e.target.closest('.game-modal');if(m._onDismiss)m._onDismiss();else m.remove();}});
startSpecialBattle=(entries,options)=>{starts.push({entries,options});game=null;const enemies=entries.map(makeBattleEnemy);battle={...structuredClone(fixture.battle),enemies,enemy:enemies[0],targetEnemyId:enemies[0].id,party:save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)),battleId:options.battleId,specialBattle:true,specialBattleType:options.type,specialTitle:options.title,specialSubtitle:options.subtitle,specialReturnScreen:options.returnScreen,priorVitals:options.priorVitals,turnQueue:[],queueIndex:0,auto:false};buildTurnQueue(battle);app.innerHTML=BattleScreen(battle,{},save.state.settings);mountBattleBossLayout(app.querySelector('.battle-screen'));};
window.qa434={field(position={x:10,y:15}){stopGame();battle=null;save.state.player.inRun=false;save.state.campaign100.finalCompleted=true;const r=royalState(save.state);Object.assign(r,{phase:'cleared',position,attempt:null});renderCampaignFinalFloor();},get game(){return game;},get state(){return save.state;},get starts(){return starts;},get stories(){return stories;},get battle(){return battle;},hero:openRoyalHero434,throne:openRoyalThrone360,finish:finishRoyalSolo434,point(index,name=false){const p={x:7+index*2,y:9},q=game.camera.world((p.x+.5)*TILE,name?(p.y+1)*TILE:(p.y+.9)*TILE-28*2.65),c=game.canvas,r=c.getBoundingClientRect();return{x:r.left+q.x*r.width/c.width,y:r.top+(q.y+(name?15:0))*r.height/c.height};}};
window.qa434.field();window.ready434=true;

`;
const index=fs.readFileSync('index.html','utf8'),head=index.slice(0,index.indexOf('</head>')+7),tailStyles=[...index.slice(index.indexOf('</head>')).matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(m=>m[0]).join('\n'),importMap=index.match(/<script type="importmap">[\s\S]*?<\/script>/)[0],types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name==='/fixture-data'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({battle:f.b,state:f.context.save.state,children}));}
 if(name==='/'){res.setHeader('Content-Type','text/html');return res.end(head+'<body>'+tailStyles+importMap+'<main id="app"></main><script type="module" src="/fixture.js"></script></body>');}
 if(name==='/fixture.js'){res.setHeader('Content-Type','text/javascript');return res.end(script);}
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('missing');}res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');fs.createReadStream(file).pipe(res);
}).listen(8434,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:8434'));
