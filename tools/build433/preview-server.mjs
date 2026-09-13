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
let game=null,battle=null,snapshot=null,activeEnemy=null,screen='primordial422',campaignStoryPresenting=false,battleBiomePanelTimer=null,formationOrigin,navigationOrigin;
const explorationSpriteCache=new Map();
let starts=0,stories=[];
render=()=>renderPrimordial422();
startSpecialBattle=()=>{starts++;window.qa433.battle(0);};
showMotherStory422=kind=>{stories.push(kind);};
wait=ms=>new Promise(r=>setTimeout(r,ms));
function showBattle(count){stopGame();game=null;battle=structuredClone(fixture.battle);battle.enemies.push(...structuredClone(fixture.children.slice(0,count)));battle.enemies[0]._floorBossHpShield=57276;battle.enemies[0]._floorBossHpShieldMax425=96000;battle.turnQueue=[];battle.queueIndex=0;battle.busy=false;battle.auto=false;battle.guideReady=true;buildTurnQueue(battle);app.innerHTML=BattleScreen(battle,{},save.state.settings);mountBattleBossLayout(app.querySelector('.battle-screen'));}
window.qa433={battle:showBattle,field(cleared=true,position={x:10,y:19}){battle=null;save.state.player.inRun=false;save.state.chapterTwo376={areaClears378:{4:1}};save.state.primordial422={phase:cleared?'cleared':'ready',cleared,position,introRead:true,endingRead:cleared,completionSeen424:cleared,wins:cleared?1:0,serial:0,dialogues:{}};renderPrimordial422();},get starts(){return starts;},get stories(){return stories;},altar:openMotherAltar422,get game(){return game;},get state(){return save.state;},get activeBattle(){return battle;},async spin(round=3){battle.turn=round;const law=motherLaw424(round);await playMotherDial425({getRoot:()=>app.querySelector('.battle-screen'),law,speed:1});await battleBanner(law.name,law.godName+'より発動','skill',1100,battle.enemies[0]);},bodyPoint(){const room=save.state.primordial422,p={x:room.cleared?7:10,y:room.cleared?9:12},g=motherFieldHitBounds433({camera:game.camera,TILE,actor:{position:p},nameBounds:{left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity},padding:0}),c=game.canvas,r=c.getBoundingClientRect();return{x:r.left+(g.left+g.right)/2*r.width/c.width,y:r.top+(g.top+g.bottom)/2*r.height/c.height};},namePoint(){const room=save.state.primordial422,p=game.camera.world(((room.cleared?7:10)+.5)*TILE,((room.cleared?9:12)+1)*TILE),c=game.canvas,r=c.getBoundingClientRect();return{x:r.left+p.x*r.width/c.width,y:r.top+(p.y+15)*r.height/c.height};}};
window.qa433.battle(0);window.ready433=true;
`;
const index=fs.readFileSync('index.html','utf8'),head=index.slice(0,index.indexOf('</head>')+7),tailStyles=[...index.slice(index.indexOf('</head>')).matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(m=>m[0]).join('\n'),importMap=index.match(/<script type="importmap">[\s\S]*?<\/script>/)[0],types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name==='/fixture-data'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({battle:f.b,state:f.context.save.state,children}));}
 if(name==='/'){res.setHeader('Content-Type','text/html');return res.end(head+'<body>'+tailStyles+importMap+'<main id="app"></main><script type="module" src="/fixture.js"></script></body>');}
 if(name==='/fixture.js'){res.setHeader('Content-Type','text/javascript');return res.end(script);}
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('missing');}res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');fs.createReadStream(file).pipe(res);
}).listen(8433,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:8433'));
