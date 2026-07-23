import{SPECIES}from"../../data/species.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{PERSONALITIES}from"../../data/personalities.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{MONSTER_COLORS}from"../../data/colors.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{displayName,rankName,colorValue,calculatedStats,unlockedSkills,TRAITS,limitBreakGrowth,affectionBonuses}from"../../models/Monster.js?v=0.9.15-alpha.95-abyss-skill-effects";

function monsterRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function rarityNameClass(rarity){return ({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase()}

function cloneMonster(monster,changes={}){return{...monster,ivs:{...(monster.ivs??{})},equipment:{...(monster.equipment??{})},_equipmentStats:{...(monster._equipmentStats??{})},_seriesCounts:{...(monster._seriesCounts??{})},...changes}}
function breakdown(monster,key){
  const stripped={_equipmentStats:{},_seriesCounts:{},_synergy:{},_abyssSkillEffects:{},traitId:"steady"};
  const base=calculatedStats(cloneMonster(monster,{...stripped,plus:0,stars:1,affection:0,bond:0}))[key]??0;
  const withLimit=calculatedStats(cloneMonster(monster,{...stripped,stars:1,affection:0,bond:0}))[key]??0;
  const withTalent=calculatedStats(cloneMonster(monster,{...stripped,affection:0,bond:0}))[key]??0;
  const withAffection=calculatedStats(cloneMonster(monster,{...stripped}))[key]??0;
  const final=calculatedStats(monster)[key]??0;
  return{base,limit:withLimit-base,talent:withTalent-withLimit,affection:withAffection-withTalent,other:final-withAffection,final};
}
function historyDate(value){if(!value)return"未記録";const d=new Date(value);return Number.isNaN(d.getTime())?"未記録":d.toLocaleDateString("ja-JP")}
function nextAffection(aff){if(aff>=1000)return null;return Math.min(1000,Math.ceil((aff+1)/100)*100)}
export function MonsterDetailScreen(monster,state){
  const rarityClass=rarityNameClass(monsterRarity(monster)),species=SPECIES[monster.speciesId],personality=PERSONALITIES[monster.personalityId],stats=calculatedStats(monster),skills=unlockedSkills(monster),trait=TRAITS[monster.traitId]??TRAITS.steady;
  const need=Math.floor(65*Math.pow(1.12,monster.level-1)),remaining=Math.max(0,need-monster.exp),aff=monster.affection??monster.bond??0,next=nextAffection(aff),growth=limitBreakGrowth(monster.speciesId),materials=state.monsters.filter(x=>x.id!==monster.id&&x.speciesId===monster.speciesId&&!state.party.includes(x.id)&&!x.favorite&&!x.locked).length,h=monster.history??{};
  const lines=["hp","atk","def","spd"].map(key=>[key.toUpperCase(),breakdown(monster,key)]);
  const ordered=[...state.party.map(id=>state.monsters.find(m=>m.id===id)).filter(Boolean),...state.monsters.filter(m=>!state.party.includes(m.id))];
  const index=Math.max(0,ordered.findIndex(m=>m.id===monster.id)),previous=ordered[(index-1+ordered.length)%ordered.length],nextMonster=ordered[(index+1)%ordered.length];
  return`<section class="screen monster-growth-screen"><header class="topbar"><button id="backMonsters">←</button><h2>モンスター育成</h2><button id="toggleFavorite">${monster.favorite?"★":"☆"}</button></header><div class="page"><div class="monster-switcher"><button data-switch-monster="${previous?.id??monster.id}" aria-label="前の魔物">‹</button><div><small>${state.party.includes(monster.id)?"出撃メンバー":"控え魔物"} ${index+1}/${ordered.length}</small><b class="monster-rarity-name rarity-name-${rarityClass}">${displayName(monster)}</b></div><button data-switch-monster="${nextMonster?.id??monster.id}" aria-label="次の魔物">›</button></div>
    <div class="panel detail-hero growth-hero"><div class="detail-orb" style="background:${colorValue(monster)}"><span>${species.emoji??"👹"}</span></div><div><div class="eyebrow">${rankName(monster)} / ${species.race}族</div><h1 class="monster-rarity-name rarity-name-${rarityClass}">${displayName(monster)}</h1><div class="growth-identifiers"><b>⭐${monster.stars??1}</b><b>+${monster.plus??0}</b><b class="affection">❤️${aff}</b>${aff>=1000?"<em>親友</em>":""}</div><div class="subline">Lv.${monster.level} / ${species.role} / ${species.element}属性</div></div></div>

    <div class="panel next-goal-panel" id="growthLevelSection"><div class="eyebrow">NEXT GROWTH</div><h2>次に強くなる方法</h2><div class="next-goal-list"><div class="${materials>=2?"ready":""}"><span>➕</span><b>同名素材 ${materials}/2</b><small>${materials>=2?`+${(monster.plus??0)+1}へ限界突破可能`:`あと${2-materials}体で限界突破`}</small></div><div class="${aff>=1000?"complete":""}"><span>❤️</span><b>${aff>=1000?"親友達成":"次のなつきボーナス"}</b><small>${aff>=1000?"全段階のボーナスを解放済み":`あと${next-aff}で ${next}/1000`}</small></div><div><span>📈</span><b>次のレベルまで</b><small>経験値あと ${remaining.toLocaleString()}</small></div></div></div>

    <div class="panel growth-action-panel"><div class="growth-hub-grid"><button data-growth-jump="level">📈<b>レベル</b><small>経験値・成長</small></button><button id="openMonsterEquipment">⚔️<b>装備</b><small>装備を変更</small></button><button data-growth-jump="affection">❤️<b>なつき</b><small>${aff}/1000</small></button><button data-growth-jump="history">📖<b>履歴</b><small>冒険の記録</small></button></div><button id="limitBreakButton" class="limit-break-main" ${materials<2?"disabled":""}><span>✨ LIMIT BREAK</span><b>+${(monster.plus??0)+1}へ限界突破</b><small>同名モンスター2体を使用（素材 ${materials}/2）</small></button><div class="limit-growth-line">Lv.1基礎値：HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}</div></div>

    <div class="panel"><div class="spread"><h2>ステータス</h2><small class="muted">最終値の構成</small></div><div class="stat-grid growth-stat-grid">${lines.map(([name,x])=>`<div class="stat-card"><span>${name}</span><b>${x.final}</b><small>基礎 ${x.base}</small><small>限突 ${x.limit>=0?"+":""}${x.limit} / 才能 ${x.talent>=0?"+":""}${x.talent}</small><small>なつき ${x.affection>=0?"+":""}${x.affection} / 装備等 ${x.other>=0?"+":""}${x.other}</small></div>`).join("")}<div class="stat-card"><span>会心率</span><b>${stats.crit}%</b></div><div class="stat-card"><span>回避率</span><b>${stats.evasion}%</b></div></div><p class="muted stat-note">「装備等」には装備・固有特性・共鳴・シリーズ効果・深淵スキルを含みます。</p></div>

    <div class="panel affection-panel" id="growthAffectionSection"><div class="spread"><h2>❤️ なつき度</h2><b>${aff}/1000</b></div><div class="affection-meter"><i style="width:${Math.min(100,aff/10)}%"></i></div><div class="affection-milestones">${[100,200,300,400,500,600,700,800,900,1000].map(v=>`<span class="${aff>=v?"unlocked":""}">${v}</span>`).join("")}</div><p class="muted">現在の補正：${Object.entries(affectionBonuses(aff)).map(([k,v])=>`${k.toUpperCase()} +${Math.round(v*100)}%`).join(" / ")}</p></div>

    <div class="panel history-panel" id="growthHistorySection"><div class="spread"><h2>📖 このモンスターの歴史</h2><small class="muted">能力には影響しません</small></div><div class="history-grid"><div><span>初獲得</span><b>${historyDate(monster.obtainedAt??monster.capturedAt)}</b></div><div><span>獲得場所</span><b>${monster.obtainedFloor??1}F・${monster.obtainedMethod==="summon"?"召喚":"捕獲"}</b></div><div><span>冒険回数</span><b>${h.adventures??0}</b></div><div><span>戦闘 / 勝利</span><b>${h.battles??0} / ${h.victories??0}</b></div><div><span>撃破数</span><b>${h.kills??0}</b></div><div><span>ボス撃破</span><b>${h.bossDefeats??0}</b></div><div><span>最高到達</span><b>${h.highestFloor??monster.obtainedFloor??1}F</b></div><div><span>MVP</span><b>${h.mvp??0}</b></div><div><span>最大ダメージ</span><b>${h.maxDamage??0}</b></div><div><span>最終出撃</span><b>${historyDate(h.lastDeployedAt)}</b></div></div></div>

    <details class="panel detail-fold"><summary>個体設定・詳細情報</summary><div class="fold-content"><h3>名前</h3><div class="edit-row"><input id="nicknameInput" maxlength="12" value="${displayName(monster)}"><button id="saveNickname">変更</button></div><h3>個体カラー</h3><div class="color-row">${MONSTER_COLORS.map(color=>`<button class="color-dot ${monster.colorId===color.id?"selected":""}" style="background:${color.value}" data-color-id="${color.id}" aria-label="${color.name}"></button>`).join("")}</div><p><b>固有特性：${trait.name}</b><br><small class="muted">${trait.description}</small></p><p><b>性格：${personality.name}</b><br><small class="muted">${personality.description}</small></p><h3>個体値</h3>${Object.entries(monster.ivs).map(([key,value])=>`<div class="iv-row"><span>${key.toUpperCase()}</span><div class="iv-bar"><i style="width:${value}%"></i></div><b>${value}</b></div>`).join("")}</div></details>

    <div class="panel"><h2>スキル</h2><div class="skill-list">${skills.map(skill=>`<div class="skill-card ${skill.unlocked?"":"locked"}"><b>${skill.unlocked?"○":"🔒"} ${skill.name}</b><small>${skill.description}</small><small>${skill.unlock.type==="level"?`Lv.${skill.unlock.value}で解禁`:`Rank ${skill.unlock.value}で解禁`}</small></div>`).join("")}</div></div>
    <div class="panel danger-zone"><h2>モンスター整理</h2><button id="releaseMonster" class="danger">このモンスターを解放</button><small class="muted">出撃中・お気に入り・ロック中は解放できません。</small></div>
  </div></section>`;
}
