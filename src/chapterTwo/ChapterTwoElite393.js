// Optional completed-area patrols. Tiers are fixed and never scale from the player's roster.
export const CHAPTER_TWO_ELITE_TIERS393=Object.freeze([
 null,
 {name:'精鋭',level:1.15,hp:1.35,power:1.15,defense:1.1,speed:1.05,reward:1.5,plus:12,circleLevel:20},
 {name:'覇者',level:1.35,hp:1.75,power:1.35,defense:1.2,speed:1.1,reward:2,plus:18,circleLevel:35},
 {name:'極冠',level:1.6,hp:2.25,power:1.6,defense:1.35,speed:1.15,reward:2.5,plus:24,circleLevel:50}
]);
export const chapterTwoEliteTier393=run=>Number.isInteger(run?.eliteTier393)&&run.eliteTier393>=1&&run.eliteTier393<=3?run.eliteTier393:0;
const squad=(area,room,name,keys,circles,policy,hint)=>({area,room,name,species:keys.split('/').map(k=>'ch2_'+k),circles:circles.split('/'),policy,hint,id:`roam${area}_${room}_elite393`,base:`roam${area}_${room}`});
export const CHAPTER_TWO_ELITE_SQUADS393=Object.freeze([
 squad(0,1,'鏡刃の護衛隊','ryune/rose/rithia/grant','weak_critical/crimson_threshold/last_life/aegis','pair','鏡の双子が連撃し、灯りと盾が護る。回復役を止め、双子の片方へ攻撃を集めよう。'),
 squad(0,3,'紅糸の追跡隊','nizelle/charne/tillea/balk','opening_rite/weak_critical/last_life/aegis','wounded','出血を刻んで双剣が追う。出血の浄化と物理軽減を用意し、負傷した仲間を早めに回復しよう。'),
 squad(0,4,'薬毒の封樹庭園','mirea/viola/kororu/lilica','last_life/opening_rite/inheritance/aegis','support','毒花と回復役が長期戦を支える。毒耐性・浄化・回復阻害を組み合わせ、支援役から崩そう。'),
 squad(1,1,'白藤の毒鎖結社','nevia/elmina/shelza/nerik','opening_rite/crimson_threshold/aegis/death_drain','support','毒と鎖の追撃を侵食獣が援護。吸魔役を倒す際は残りMPに注意し、毒を治して特効を外そう。'),
 squad(1,3,'縫い留められた夢境','morina/elmize/rikka/rinne','opening_rite/crimson_threshold/aegis/last_life','support','睡眠を仕込む双子を、綴命のペアが支える。睡眠対策と蘇生封印を用意して一組ずつ止めよう。'),
 squad(1,4,'焔月と硝子の舞台','kagura/sayo/seria/carmia','opening_rite/last_life/aegis/weak_critical','pair','狐火の追撃と硝子の弱体が重なる。火傷と能力低下を浄化し、支援役の行動を止めよう。'),
 squad(2,1,'双符の忘却葬列','shion/suiren/noctia/velg','opening_rite/last_life/death_drain/aegis','support','双符の全体追撃を霜鐘と鎖翼が支える。魔力を使い切らず、符の姉妹を優先して分断しよう。'),
 squad(2,3,'宵暁の薔薇聖堂','ferne/clarisse/noctelle/auriane','aegis/last_life/crimson_threshold/opening_rite','wounded','浄化の鐘と瀕死で強まる薔薇の連撃。全員を少しずつ削らず、一人ずつ倒して回復の循環を断とう。'),
 squad(2,4,'双鍵の加護狩り','meliora/elyselle/mimelia/senela','opening_rite/last_life/aegis/death_drain','buff','双鍵と擬態姫が強化を狙い、魔力も削る。強化の重ね掛けだけに頼らず、物理・魔法の攻撃役を分けよう。'),
 squad(3,1,'天鎖を断つ双竜騎団','dracia/rucie/lyriet/rosette','aegis/crimson_threshold/opening_rite/last_life','buff','双竜が強化を剥がし、双剣の護陣が障壁を張る。防御低下を治し、竜の姉妹を先に止めよう。'),
 squad(3,3,'黒盾と双雷の聖衛','rostia/althea/calista/solenne','aegis/blood_acceleration/opening_rite/last_life','pair','黒盾への攻撃は護誓反撃を招く。雷の姉妹を狙い、感電の浄化と反撃を受けるHPを確保しよう。'),
 squad(3,4,'氷晶の天穹聖歌','iselle/virelle/aure/noelle','opening_rite/weak_critical/aegis/last_life','support','凍結粉砕を天使の回復と障壁が支える。凍結耐性と浄化を優先し、回復役を残したまま長引かせない。'),
 squad(4,1,'星律の終演機構','celes/lumina/eirene/iridelle','aegis/crimson_threshold/opening_rite/last_life','pair','二組の終奏が速度・防御低下から連なる。弱体を治し、同じ組の二人目が動く前に一人を止めよう。'),
 squad(4,3,'黒白の四冠裁定','nemesia/everia/aeriel/vespera','opening_rite/last_life/aegis/crimson_threshold','wounded','二組の双冠が決着を狙う。HP35%以下は終剣の危険域。早い回復と一組への集中攻撃で対処しよう。'),
 squad(4,4,'日月を巡る星門','sephira/astrelle/lunaria/solaria','aegis/last_life/opening_rite/inheritance','support','日月が魔力を戻し、双星がラウンドをまたいで詠唱する。3回目の星門共鳴までに双星の一人を止めよう。')
]);
export function installChapterTwoElite393(encounters){
 for(const s of CHAPTER_TWO_ELITE_SQUADS393){const e=encounters[s.base];if(!e)continue;encounters[s.id]={...e,...s,name:`精鋭・${s.name}`,authorities:undefined,roles:undefined,roamingAlternates391:undefined,roamingBase391:s.base,chapterTwoNative383:true,elite393:true};}
}
export function chapterTwoEliteUnlockedTier393(progress,area){
 const raw=progress?.eliteClears393?.[area],best=Number.isFinite(Number(raw))?Math.max(0,Math.min(3,Math.floor(Number(raw)))):0;
 return Number(progress?.areaClears378?.[area])>0?Math.min(3,best+1):0;
}
export function tuneChapterTwoElite393(enemy,encounter,run){
 if(!encounter.elite393)return;const tier=chapterTwoEliteTier393(run)||1,t=CHAPTER_TWO_ELITE_TIERS393[tier];
 for(const [key,factor] of Object.entries({maxHp:t.hp,atk:t.power,matk:t.power,def:t.defense,mdef:t.defense,spd:t.speed}))enemy[key]=Math.max(1,Math.round(enemy[key]*factor));
 enemy.hp=enemy.maxHp;enemy.eliteTier393=tier;enemy.elitePolicy393=encounter.policy;
}
