// Chapter II trophies are awarded by their own elite squad, never by generic rolls.
const relic=(area,room,key,name,slot,stats,effects,hint,iconIndex,subslot=null,weaponType=null,fixedEffects={})=>Object.freeze({id:`ch2_${key}394`,area,room,encounter:`roam${area}_${room}_elite393`,name,slot,stats:Object.freeze(stats),effects:Object.freeze(effects),hint,iconIndex,subslot,weaponType,fixedEffects:Object.freeze(fixedEffects)});
export const CHAPTER_TWO_RELICS394=Object.freeze([
 relic(0,1,'mirror','双鏡の誓剣','weapon',{atk:28,spd:7,crit:6},{pair:.18},'リュネ＆ロゼなど、連携追撃を持つペアの攻撃役へ。',17,null,'sword'),
 relic(0,3,'thread','紅糸の追刃','weapon',{atk:26,spd:12,crit:5},{chain:.16},'連撃で同じ敵を狙うニゼル＆シャルネに。',16,null,'sword'),
 relic(0,4,'garden','封樹の薬花飾り','accessory',{hp:44,matk:10,heal:9},{poison:.22},'毒を仕込むミレア＆ヴィオラと組み合わせよう。',5,'accessoryNeck',null,{healPower:12}),
 relic(1,1,'wisteria','白藤の鎖杖','weapon',{matk:30,mp:22,spd:5},{poison:.26},'ネヴィア＆エルミナの毒が残る間に魔法で追撃。',23,null,'staff'),
 relic(1,3,'dream','夢縫いの魔典','weapon',{matk:32,mp:24,crit:5},{sleep:.32},'モリナが眠らせ、エルミゼが刈り取る編成に。',25,null,'book'),
 relic(1,4,'stage','焔月の舞踏環','accessory',{mp:24,spd:14,crit:7},{burn:.26},'カグラ＆サヨの狐火で火傷を維持して攻めよう。',3,'accessoryFinger'),
 relic(2,1,'talisman','忘却の双符','accessory',{hp:48,matk:15,mp:18},{ailment:.18},'シオン＆スイレンなど、状態異常を使う部隊の攻撃役に。',9,'accessoryNeck'),
 relic(2,3,'rose','宵暁の聖衣','armor',{hp:88,def:25,mdef:28},{guard:.12,counter:.20},'ガードや反撃スキルを持つ仲間を守る。反撃の発動能力は別途必要。',8,'armorBody'),
 relic(2,4,'key','双鍵の封剣','weapon',{atk:29,matk:23,crit:8},{buff:.24},'敵の強化が残る間に攻める剣。解除後は特効が消えるため攻撃順も大切。',29,null,'sword'),
 relic(3,1,'dragon','天鎖断ちの竜槍','weapon',{atk:34,spd:10,crit:8},{buff:.20,pair:.12},'双竜の連携を伸ばす。強化解除後もペア特効は有効。',27,null,'spear'),
 relic(3,3,'oath','黒雷の護誓盾','armor',{hp:68,def:32,mdef:24},{guard:.12,counter:.30},'ロスティア＆アルテアの護誓反撃へ。盾自体は反撃を発動しない。',3,'armorSupport'),
 relic(3,4,'frost','氷晶の聖歌杖','weapon',{matk:34,mp:24,heal:9},{freeze:.32},'イゼル＆ヴィレルの凍結から大技へつなぐ。',24,null,'staff'),
 relic(4,1,'clock','終演の星律時計','accessory',{mp:28,spd:18,crit:10},{chain:.12,pair:.12},'星律の連撃・ペア追撃を同じ相手に重ねよう。',10,'accessoryFinger'),
 relic(4,3,'crown','黒白終冠の裁剣','weapon',{atk:38,matk:20,crit:10},{execute:.28},'ネメシア＆エヴェリアなど、HP35%以下の敵を仕留める役に。',19,null,'sword'),
 relic(4,4,'star','日月の星門飾り','accessory',{hp:52,mp:32,matk:20},{pair:.20},'セフィラ＆アストレルの詠唱を支え、合体魔法を強化。',11,'accessoryNeck',null,{mpCostReduction:12})
]);
export const RELIC_EFFECT_LABELS394=Object.freeze({pair:'ペア連携の与ダメージ',chain:'同一ラウンド・同じ敵への2撃目以降の与ダメージ',poison:'毒状態の敵への直接与ダメージ',sleep:'睡眠中の敵への直接与ダメージ',burn:'火傷中の敵への直接与ダメージ',freeze:'凍結中の敵への直接与ダメージ',ailment:'状態異常中の敵への直接与ダメージ',buff:'強化中の敵への直接与ダメージ',execute:'HP35%以下の敵への直接与ダメージ',counter:'既存の反撃の与ダメージ',guard:'ガード中に自身が受ける敵の直接攻撃を軽減'});
export const RELIC_EFFECT_CAPS394=Object.freeze({pair:.60,chain:.50,poison:.70,sleep:.80,burn:.70,freeze:.80,ailment:.40,buff:.60,execute:.70,counter:.80,guard:.30});
export const relicById394=id=>CHAPTER_TWO_RELICS394.find(r=>r.id===id)??null;
export const relicForEncounter394=id=>CHAPTER_TWO_RELICS394.find(r=>r.encounter===id)??null;
export const relicGrowth394=plus=>1+.25*Math.max(0,Math.min(30,Number(plus)||0))/30;
export const relicPercent394=n=>`${(n*100).toFixed(1).replace(/\.0$/,'')}%`;
export function relicEffectText394(def,plus=0){return Object.entries(def.effects).map(([k,v])=>`${RELIC_EFFECT_LABELS394[k]} ${k==='guard'?'−':'+'}${relicPercent394(v*relicGrowth394(plus))}`).join(' ／ ');}
export function relicItemText394(item){const d=relicById394(item?.chapterTwoRelic394);return d?`${relicEffectText394(d,item.plus)}${d.fixedEffects.healPower?' ／ HP回復量 +12%':''}${d.fixedEffects.mpCostReduction?' ／ MP消費 −12%':''}。条件付き効果は＋30まで成長。同じ品の固有效果は1個分（条件付き効果は最も高い＋値）。`:item?.fixedEffectText??'';}
const circle=(area,key,name,glyph,tone,effects,summary)=>Object.freeze({id:`ch2_${key}394`,area,name,glyph,tone,effect:'chapterTwoRelic394',baseUpgrade:260000000,summary,effects:Object.freeze(effects),asset:`./assets/magic-circles/ch2_${key}394.svg`,frames:Object.freeze([`./assets/magic-circles/ch2_${key}394.svg`])});
export const CHAPTER_TWO_CIRCLES394=Object.freeze([
 circle(0,'chain','鏡糸連環陣','連','rose',{chain:[.12,.24]},'同一ラウンドで、同じ敵への2撃目以降の直接与ダメージが増加。命中してHPを削った攻撃を数える。'),
 circle(1,'dream','夢喰封花陣','夢','violet',{sleep:[.25,.50]},'睡眠中の敵への直接与ダメージが増加。睡眠が解けると特効も終了。'),
 circle(2,'pair','双誓共鳴陣','誓','gold',{pair:[.15,.35]},'指定ペアが生存し連携可能な間、装着者が行うペア追撃・合体魔法の与ダメージが増加。'),
 circle(3,'guard','天鎖護誓陣','護','blue',{guard:[.10,.20],counter:[.20,.40]},'ガード中の敵からの直接攻撃を軽減し、既存の反撃の与ダメージを強化。反撃自体は追加しない。'),
 circle(4,'crown','終冠星律陣','冠','gold',{execute:[.20,.40]},'残りHP35%以下の敵への直接与ダメージが増加。各命中の直前のHPで判定。')
]);
export const isChapterTwoCircle394=id=>CHAPTER_TWO_CIRCLES394.some(c=>c.id===id);
export function chapterTwoCircleEffects394(id,level=1){const c=CHAPTER_TWO_CIRCLES394.find(c=>c.id===id);if(!c)return{};const p=(Math.max(1,Math.min(99,Number(level)||1))-1)/98;return Object.fromEntries(Object.entries(c.effects).map(([k,[a,b]])=>[k,Number((a+(b-a)*p).toFixed(4))]));}
