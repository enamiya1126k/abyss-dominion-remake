export const MOTHER_ID422='ch2_ionea';
const skill=(key,name,mp,cooldown,power,extra={})=>({id:`ch2_ionea__${key}`,key,name,mp,cooldown,power,type:'attack',element:'light',damageClass:'magic',target:'敵単体',tag:'原初の聖胎',unlock:{type:'level',value:1},chapterTwoSet392:true,...extra});
const skills=[
 skill('thread','創世の金糸',24,2,.85,{description:'敵全体へ光属性の魔法攻撃。回復量45%低下（2ターン）。次の十灯の帰路に備えよう。',allEnemies:true,target:'敵全体',effects:[{kind:'healDown',value:.45,turns:2,enemy:true}],ai383:'setup'}),
 skill('stars','十灯の帰路',36,2,1.15,{description:'敵全体へ光属性の魔法攻撃。回復量低下中の相手には威力1.3倍。',allEnemies:true,target:'敵全体',bonusVsEffect:{kind:'healDown',multiplier:1.3},ai383:'strike'}),
 skill('cut','閉界の裁断',30,2,1.25,{description:'闇属性の魔法攻撃。敵の強化を1つ解除。',element:'dark',dispelEnemyBuff:true,ai383:'dispel'}),
 skill('cradle','揺籠の祈り',32,5,0,{description:'生存味方全体のHP6%回復。状態異常・弱体を解除。',type:'allHeal',heal:.06,cleanse:true,target:'味方全体',ai383:'heal'}),
 skill('veil','母なる薄衣',30,2,0,{description:'自身に最大HP8%の障壁、被ダメージ20%軽減（2ターン）。状態異常・弱体を解除。',type:'stance',target:'自分',selfShieldRate:.08,cleanse:true,effects:[{kind:'guard',value:.2,turns:2}],ai383:'stance'})
];
export const MOTHER_SPECIES422={id:MOTHER_ID422,key:'ionea',name:'原母イオネア',rarity:'神話',element:'light',race:'spirit',role:'magic',tacticRole383:'striker',emoji:'✦',chapterTwoOnly:true,chapterTwoSet392:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:0,maxMp:420,growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp:240,atk:35,matk:65,def:38,mdef:45,spd:30,crit:8,evasion:8,accuracy:112},rankNames:Array(4).fill('原母イオネア'),skills,authoredSkills:skills,acquisition:['原初の聖胎・最終決戦（契約不可）'],habitat383:'原初の聖胎',lore383:'十神へ力を分け与えた原母。子らを失う恐れから世界を閉じた。命を操る権利と、命を守る責任を同じものだと信じていた。',counter383:'金糸→十灯の全体攻撃→回復・障壁の3手で巡る。回復量低下を解除すると十灯の追い打ちを防げる。防御・魔法防御で耐え、薄衣の後は強化解除と回復阻害で攻めよう。'};
export const MOTHER_ROOM422='assets/ui/primordial/sanctum422.png';
// Unedited transparent atlas: equal cells; native atlas renderer handles every pose.
const boxes=[[450,0,824,416],[852,0,1248,416],[865,825,1238,1234],[70,418,416,822],[465,418,826,822],[835,418,1254,822],[78,837,419,1234],[477,907,823,1234],[865,825,1238,1234]];
export const MOTHER_ATLAS422={url:'assets/ui/primordial/ionea422.png',width:1254,height:1254,extent:416,frames:Object.fromEntries(['idle1','idle2','idle3','walk1','walk2','attack','damage','down','victory'].map((key,i)=>{const [l,t,r,b]=boxes[i];return[key,{box:boxes[i],clip:`${l},${t} ${r},${t} ${r},${b} ${l},${b}`}]}))};
export const MOTHER_ENEMY422={speciesId:MOTHER_ID422,level:5000,boss:true,uncapturable:true,nameOverride:'原母イオネア',combatRarity:'神話',fixedTrialScaling:true,enemyFloor:100,enemyLoadoutVersion:5,enemyGear:[],enemyMagicCircle:null};
export function tuneMother422(enemy){Object.assign(enemy,{name:'原母イオネア',maxHp:1400000,hp:1400000,atk:22000,matk:22000,def:6500,mdef:7000,spd:8000,maxMp:720,currentMp:720,motherRevision423:423,accuracy:112,evasion:8,crit:8,hiddenDamageTaken:1,hiddenStatusResist:0,hiddenProfile:{active:false},divineBarrier:0,bossStatusResist:.15,bossHealRate:0,bossPowerMultiplier:1,chapterTwoTactics382:{area:4,role:'striker',actions:skills.map(s=>s.id),hint:MOTHER_SPECIES422.counter383}});return enemy;}

// Fixed three-turn cadence; no party-level scaling, extra turns or pair exceptions.
export function motherBeat423(turn){return ((Math.max(1,Number(turn)||1)-1)%3);}
export function motherIntent423(turn){return ['創世の金糸：全体攻撃・回復量低下 → 次は十灯','十灯の帰路：全体攻撃・回復量低下を解除・先行できるならガード','回復・障壁の手番：立て直しと強化解除の機会'][motherBeat423(turn)];}
export function chooseMotherAction423(enemy,{battle={},opponents=[]}={}){
 if(enemy?.speciesId!==MOTHER_ID422||enemy.motherRevision423!==423)return null;
 enemy.specialCooldown=Math.max(0,(Number(enemy.specialCooldown)||0)-1);if(enemy.specialCooldown>0){enemy.intent='再唱封印のため通常攻撃';return 'attack';}
 const turn=Math.max(1,Number(battle.turn)||1),beat=motherBeat423(turn),cooldowns=enemy.chapterTwoCooldowns383??(enemy.chapterTwoCooldowns383={}),ready=key=>{const s=skills.find(s=>s.key===key);return s&&(cooldowns[s.id]??0)<=turn&&(enemy.currentMp??0)>=s.mp?s:null;};
 let chosen=beat===0?ready('thread'):beat===1?ready('stars'):enemy.hp/enemy.maxHp<.5?ready('cradle')??ready('veil'):ready('veil');
 if(!chosen)chosen=ready('cut')??ready('thread');
 if(!chosen){enemy.intent='魔力・再使用待ち：通常攻撃';return 'attack';}
 cooldowns[chosen.id]=turn+chosen.cooldown+1;enemy.chapterTwoFocus382=null;enemy.intent=chosen.name;return chosen.id;
}
