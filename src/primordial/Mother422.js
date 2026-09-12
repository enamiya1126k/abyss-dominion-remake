export const MOTHER_ID422='ch2_ionea';
const skill=(key,name,mp,cooldown,power,extra={})=>({id:`ch2_ionea__${key}`,key,name,mp,cooldown,power,type:'attack',element:'light',damageClass:'magic',target:'敵単体',tag:'原初の聖胎',unlock:{type:'level',value:1},chapterTwoSet392:true,...extra});
const skills=[
 skill('thread','創世の金糸',24,1,1.25,{description:'光属性の魔法攻撃。回避15%低下（2ターン）。',effects:[{kind:'evasionDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('stars','十灯の帰路',36,2,.85,{description:'敵全体へ光属性の魔法攻撃。攻撃12%低下（2ターン）。',allEnemies:true,target:'敵全体',effects:[{kind:'atkDown',value:.12,turns:2,enemy:true}],ai383:'fallback'}),
 skill('cut','閉界の裁断',30,2,1.45,{description:'闇属性の魔法攻撃。敵の強化を1つ解除。',element:'dark',dispelEnemyBuff:true,ai383:'dispel'}),
 skill('cradle','揺籠の祈り',32,4,0,{description:'生存味方全体のHP12%回復。',type:'allHeal',heal:.12,target:'味方全体',ai383:'heal'}),
 skill('veil','母なる薄衣',30,3,0,{description:'自身に最大HP12%の障壁、被ダメージ15%軽減（2ターン）。',type:'stance',target:'自分',selfShieldRate:.12,effects:[{kind:'guard',value:.15,turns:2}],ai383:'stance'})
];
export const MOTHER_SPECIES422={id:MOTHER_ID422,key:'ionea',name:'原母イオネア',rarity:'神話',element:'light',race:'spirit',role:'magic',tacticRole383:'striker',emoji:'✦',chapterTwoOnly:true,chapterTwoSet392:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:0,maxMp:420,growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp:240,atk:35,matk:65,def:38,mdef:45,spd:30,crit:8,evasion:8,accuracy:112},rankNames:Array(4).fill('原母イオネア'),skills,authoredSkills:skills,acquisition:['原初の聖胎・最終決戦（契約不可）'],habitat383:'原初の聖胎',lore383:'十神へ力を分け与えた原母。子らを失う恐れから世界を閉じた。命を操る権利と、命を守る責任を同じものだと信じていた。',counter383:'光と闇の魔法、回復と障壁を使う。強化解除・回復阻害・魔法防御を組み合わせよう。'};
export const MOTHER_ROOM422='assets/ui/primordial/sanctum422.png';
// Unedited transparent atlas: equal cells; native atlas renderer handles every pose.
const boxes=[[450,0,824,416],[852,0,1248,416],[865,825,1238,1234],[70,418,416,822],[465,418,826,822],[835,418,1254,822],[78,837,419,1234],[477,907,823,1234],[865,825,1238,1234]];
export const MOTHER_ATLAS422={url:'assets/ui/primordial/ionea422.png',width:1254,height:1254,extent:416,frames:Object.fromEntries(['idle1','idle2','idle3','walk1','walk2','attack','damage','down','victory'].map((key,i)=>{const [l,t,r,b]=boxes[i];return[key,{box:boxes[i],clip:`${l},${t} ${r},${t} ${r},${b} ${l},${b}`}]}))};
export const MOTHER_ENEMY422={speciesId:MOTHER_ID422,level:4200,boss:true,uncapturable:true,nameOverride:'原母イオネア',combatRarity:'神話',fixedTrialScaling:true,enemyFloor:100,enemyLoadoutVersion:5,enemyGear:[],enemyMagicCircle:null};
export function tuneMother422(enemy){Object.assign(enemy,{name:'原母イオネア',maxHp:700000,hp:700000,atk:16000,matk:22000,def:5000,mdef:5500,spd:8000,maxMp:420,currentMp:420,accuracy:112,evasion:8,crit:8,hiddenDamageTaken:1,hiddenStatusResist:0,hiddenProfile:{active:false},divineBarrier:0,bossStatusResist:.15,bossHealRate:0,bossPowerMultiplier:1,chapterTwoTactics382:{area:4,role:'striker',actions:skills.map(s=>s.id),hint:MOTHER_SPECIES422.counter383}});return enemy;}
