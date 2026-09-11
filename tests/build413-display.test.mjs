import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('src/core/MagicCircleSystem.js');
const markup=vm.runInNewContext(source.slice(source.indexOf('function circleMarkup('),source.indexOf('export function magicCircleMarkup('))+';circleMarkup');
test('one-frame chapter-two and raid circles receive stable-frame treatment; three-frame animation remains',()=>{
 for(const asset of ['ch2_blight394.svg','raid-zero-sovereign.png']){const html=markup({id:'test',frames:[asset],level:5,tone:'gold'});assert.match(html,/magic-circle-static413/);assert.equal((html.match(/<img /g)||[]).length,1);assert.match(html,new RegExp(asset.replace('.','\\.')))}
 const html=markup({id:'slot',frames:['1.png','2.png','3.png'],level:27,tone:'violet',effect:'slot'});assert.doesNotMatch(html,/magic-circle-static413/);assert.equal((html.match(/<img /g)||[]).length,3);assert.match(html,/magic-circle-high/);
});
const layoutSource=read('src/ui/BattleBossLayout.js').replace(/^import.*;\s*$/gm,'').replace(/^export /gm,'');
const geomSource=read('src/ui/BattleCircleLayout405.js').replace(/^import.*;\s*$/gm,'').replace(/^export /gm,'');
const context=vm.createContext({endgameSpriteBounds399:()=>null,chapterTwoFrameBounds383:()=>({left:.25,top:.2,right:.75,bottom:.95})});vm.runInContext(layoutSource,context);vm.runInContext(geomSource,context);
for(const viewport of [320,390,430,768,1280])test(`visible art and circle fit at ${viewport}px, including narrow/tall artwork`,()=>{
 for(const width of [25,55,110])for(const height of [35,75,180]){
 const slotWidth=viewport/4-10,headroom=90,normalSize=Math.max(54,Math.min(88,viewport*.16));
 const scale=context.chapterTwoArtScale382({width,height,slotWidth,headroom,normalSize});
 assert.ok(width*scale<=slotWidth-8+.001);assert.ok(height*scale<=headroom+.001);assert.ok(height*scale<=normalSize+.001);
 if(width===25&&height===35)assert.ok(scale>1,'small allies enlarge');
 const g=context.battleCircleGeometry405({image:{left:10,top:20,width:width*scale,height:height*scale},bounds:{left:0,right:1,top:0,bottom:1},sprite:{left:0,top:0,width:80,height:80,layoutWidth:80,layoutHeight:80},slotWidth});
 assert.equal(g.left,10+width*scale/2);assert.equal(g.top,20+height*scale/2);assert.ok(g.width>=Math.min(160,Math.max(width*scale,height*scale)));
 }
});
test('real fitting positions ally visible feet above HP and labels above art; repeat fitting is stable',()=>{
 const styles={scale:'1',translate:'none'},labelStyles={};const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
 const art={style:{setProperty(k,v){styles[k]=v}},querySelector:()=>image};
 const image={dataset:{monsterAtlas:'ch2'},getBoundingClientRect(){const scale=Number(styles.scale);return rect(100-20*scale,120-30*scale,40*scale,60*scale)}};
 const label={getBoundingClientRect:()=>rect(50,50,90,18),style:{setProperty(k,v){labelStyles[k]=v}}};
 const card={getBoundingClientRect:()=>rect(50,170,100,60)};
 const unit={querySelector:q=>q.includes('sprite>')?art:q==='.side-unit-card'?card:label,prepend(){},classList:{remove(){},contains:()=>false},closest:q=>q==='.side-party'?{}:null,getBoundingClientRect:()=>rect(50,40,100,200),dataset:{}};
 const root={classList:{contains:()=>false},querySelectorAll:q=>{assert.match(q,/side-party/);return[unit]}};
 const arena={getBoundingClientRect:()=>rect(0,0,390,600)};context.innerWidth=390;
 context.layoutChapterTwoEnemies382(root,arena);const before=JSON.stringify({styles,labelStyles});
 const [dx,dy]=styles.translate.split(' ').map(parseFloat),ir=image.getBoundingClientRect();assert.ok(Math.abs(ir.top+ir.height*.95+dy-165)<.001);assert.ok(Math.abs(ir.left+ir.width*.5+dx-100)<.001);
 assert.ok(parseFloat(labelStyles['--chapter-name-y'])>=0);context.layoutChapterTwoEnemies382(root,arena);assert.equal(JSON.stringify({styles,labelStyles}),before);
});
test('latest cache targets and CSS ordering preserve Build412 logic',()=>{
 const html=read('index.html'),m=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 for(const p of ['core/config','core/MagicCircleSystem','ui/BattleBossLayout'])assert.equal(m[`./src/${p}.js`],`./src/${p}.js?v=${p==='core/config'?'3.1.95-build416':'3.1.93-build413'}`);
 assert.ok(html.indexOf('build413-character-circles.css')>html.indexOf('build405-battle-circles.css'));
 assert.match(read('src/main.js'),/Opening a picker is not an action/);
 assert.match(read('src/core/config.js'),/SAVE_SCHEMA_VERSION=84/);
});
