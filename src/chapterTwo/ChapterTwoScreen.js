import {chapterTwoState,chapterTwoObjective,ROOMS} from './ChapterTwoSystem.js?v=3.1.57-build377';
import {chapterTwoTheme} from './ChapterTwoMap.js?v=3.1.57-build377';
import {ExploreScreen} from '../ui/screens/ExploreScreen.js?v=3.1.57-build377';
import {pixelIcon} from '../ui/components/GameChrome.js';
import {buildSectionMiniMapModel,fitMiniMapTransform,projectMiniMapPoint} from '../core/DungeonMiniMapSystem.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function ChapterTwoScreen(state){
 const p=chapterTwoState(state),r=p?.run;if(!r)return '';
 const room=ROOMS[r.room],objective=chapterTwoObjective(r),theme=chapterTwoTheme(r.room);
 return ExploreScreen(state,{chapterTwo:true,className:'chapter-two-explore',floor:100,title:'第二章・境界の森',run:r,scenery:theme,currentAttribute:'nature',
 commandInfoHtml:`<button type="button" class="explore-biome-card chapter-two-objective" data-ch2-help><div><small>現在の目的</small><b>${objective.title}</b><small>${room.name}・発見 ${r.visited.length}/6区画</small><i><em style="width:${r.completed?100:objective.seals*40}%"></em></i></div></button>`,
 stageInfoHtml:`<span class="explore-scenery-badge chapter-two-location"><span><small>境界の森</small><b>${room.name}</b></span></span>`,
 autoToggleHtml:`<button type="button" id="exploreAutoToggle" class="explore-auto-toggle ${r.auto377?'active':''}" aria-pressed="${!!r.auto377}">${pixelIcon('formation')}<span><b>自動</b><small>${r.auto377?'ON':'OFF'}</small></span></button>`,
 stageToolsHtml:`<button type="button" id="miniMapToggle" class="minimap-toggle">${pixelIcon('event')}<b>マップ</b></button>`,
 miniMapHtml:'<canvas id="miniMap" role="button" tabindex="0" aria-label="マップを拡大して目的地を確認"></canvas>'});
}
export function chapterTwoDestinations(state){
 const p=chapterTwoState(state);if(!p)return '';
 return `<div class="chapter-two-destinations"><small>第一章・踏破済み</small><button type="button" data-ch2-old-floors>${pixelIcon('dungeon')}<span><b>1〜100階層</b><small>踏破したダンジョンを探索</small></span><em>›</em></button><button type="button" data-ch2-royal>${pixelIcon('crossed-swords')}<span><b>魔王城王室</b><small>勇者一行との記憶再戦</small></span><em>›</em></button><h3>〜 第二章 〜</h3><button type="button" class="chapter-two-forest-destination" data-ch2-enter>${pixelIcon('map')}<span><b>境界の森</b><small>${p.run?.completed?'解放済み・再探索できます':p.run?'探索を再開する':p.introComplete?'東西の封印を解き、侵食の根源へ':'序章から物語を始める'}</small></span><em>›</em></button>${p.run?'<button type="button" data-ch2-new>境界の森を最初から再探索</button>':''}<div class="chapter-two-replays"><button type="button" data-ch2-story="intro">序章を読み返す</button>${p.clears?'<button type="button" data-ch2-story="epilogue">森の結末を読む</button>':''}</div></div>`;
}
export function chapterTwoHelp(run){
 const objective=chapterTwoObjective(run);
 return `<div class="chapter-two-help"><h3>${objective.title}</h3><p>${objective.detail}</p><ol><li>森を探索し、東西の封印樹を探す。</li><li>それぞれの守護者を倒して、封印を2つ解放する。</li><li>東の封印樹から北へ進み、最深部のボスを倒す。</li></ol><p>地面をタップで移動。通路の入口へ歩くと隣の区画へ進みます。ドラッグで視点移動、2本指で拡大できます。</p><p>宝箱はGOLD、泉は部隊の全回復。戦闘では経験値とGOLD、初回踏破では追加報酬を獲得できます。</p><p>帰還しても封印・宝箱・討伐状況は残ります。自動をONにすると封印とボスを順番に目指します。</p></div>`;
}
export function chapterTwoMapMarkup(world,run){
 const model=buildSectionMiniMapModel(world),transform=fitMiniMapTransform(model,360,320,12),point=p=>projectMiniMapPoint(transform,p),objective=chapterTwoObjective(run);
 const edges=model.edges.map(e=>{const a=point(e.from),b=point(e.to),locked=[e.a,e.b].includes('forest-5')&&objective.seals<2;return `<path d="M${a.x},${a.y} L${b.x},${b.y}" stroke="${locked?'#a55869':'#c6ac76'}" stroke-width="2" ${e.discovered?'':'stroke-dasharray="4 4"'}/>`}).join('');
 const sections=model.sections.map(s=>{const center=point(s.center),current=s.id===model.currentSectionId;return `<g><path d="${s.cells.map(c=>{const p=point(c);return `M${p.x},${p.y}h${transform.scale}v${transform.scale}h-${transform.scale}z`}).join(' ')}" fill="${s.mode==='frontier'?'#302a37':current?'#587652':'#524739'}"/><text x="${center.x}" y="${center.y}" text-anchor="middle" fill="#fff0bb" font-size="12">${s.mode==='frontier'?'?':s.index+1}</text></g>`}).join('');
 const colors={boss:'#ff7d8f',chest:'#efca70',spring:'#8be3ee'};
 const markers=model.markers.map(m=>{const p=point(m);return `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${colors[m.kind]??'#eee'}"/>`}).join('');
 const player=point(run.position);
 return `<div class="chapter-two-map-dialog"><h3>${objective.title}</h3><svg viewBox="0 0 360 320" role="img" aria-label="境界の森の接続マップ。緑の丸が現在地">${edges}${sections}${markers}<circle cx="${player.x}" cy="${player.y}" r="4" fill="#7cffaf" stroke="#fff"/></svg><p>緑：現在地 ／ 赤：敵・守護者 ／ 金：宝箱 ／ 水色：泉<br>？：隣接する未探索区画 ／ 点線：未探索への道</p><div class="chapter-two-map-places">${model.sections.map(s=>{const n=s.index,known=s.mode!=='frontier';return `<button type="button" data-ch2-map-room="${n}"><b>${known?`${n+1} ${esc(ROOMS[n].name)}`:'？ 未探索の区画'}</b><small>${known?(run.defeated.includes(ROOMS[n].encounter)?'討伐済み':ROOMS[n].hint):'入口まで進んで確かめよう'}</small></button>`}).join('')}</div><small>区画を選ぶと、そこへ向かう通路を案内します。</small></div>`;
}
