import{SPECIES}from"../../data/species.js?v=2.10.0";
import{displayName,calculatedStats}from"../../models/Monster.js?v=2.10.0";
import{monsterCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=2.10.0";
import{magicCircleById}from"../../core/MagicCircleSystem.js?v=2.10.0-build147";
import{learnedSkills,maxMp,effectiveSkillMpCost}from"../../battle/SkillSystem.js?v=2.10.0";
import{monsterVisual}from"../MonsterVisual.js?v=2.10.0";
import{resourceHud,bottomNav,pixelIcon}from"../components/GameChrome.js?v=2.10.0";

const ONLINE_STORAGE_KEYS=Object.freeze({
 friendId:"abyss-dominion-online-friend-id",
 clientKey:"abyss-dominion-online-client-key",
 resumeToken:"abyss-dominion-online-resume-token",
 serverUrl:"abyss-dominion-online-server-url",
 displayName:"abyss-dominion-online-display-name",
 monsterId:"abyss-dominion-online-monster-id"
});

const EQUIPMENT_SLOTS=Object.freeze([
 ["weaponRight","右手"],["weaponLeft","左手"],["accessoryNeck","首"],
 ["accessoryFinger","指"],["armorBody","胴"],["armorSupport","補助"]
]);

function randomToken(length=8){
 const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",bytes=new Uint8Array(length);
 globalThis.crypto?.getRandomValues?.(bytes);
 return Array.from(bytes,(value,index)=>alphabet[(value||Math.floor(Math.random()*256)+index)%alphabet.length]).join("");
}
function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function safeStorageGet(key,fallback=""){try{return localStorage.getItem(key)??fallback}catch{return fallback}}
function safeStorageSet(key,value){try{localStorage.setItem(key,String(value))}catch{}}
function inviteParameters(){
 try{const params=new URLSearchParams(location.search);return{server:params.get("partyServer")??"",room:(params.get("partyRoom")??"").toUpperCase()}}catch{return{server:"",room:""}}
}
function createIdentity(){
 let friendId=safeStorageGet(ONLINE_STORAGE_KEYS.friendId),clientKey=safeStorageGet(ONLINE_STORAGE_KEYS.clientKey);
 if(!/^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(friendId)){friendId=`AD-${randomToken(4)}-${randomToken(4)}`;safeStorageSet(ONLINE_STORAGE_KEYS.friendId,friendId)}
 if(clientKey.length<24){clientKey=`${randomToken(16)}${randomToken(16)}`;safeStorageSet(ONLINE_STORAGE_KEYS.clientKey,clientKey)}
 return{friendId,clientKey};
}
function selectedPartyMonster(state){
 const party=(state.party??[]).map(id=>state.monsters?.find(monster=>monster.id===id)).filter(Boolean);
 const savedId=safeStorageGet(ONLINE_STORAGE_KEYS.monsterId),monster=party.find(entry=>entry.id===savedId)??party[0]??state.monsters?.[0]??null;
 if(monster)safeStorageSet(ONLINE_STORAGE_KEYS.monsterId,monster.id);
 return{party,monster};
}
function equipmentProfile(state,monster){
 const items=new Map((state.equipment??[]).map(item=>[item.id,item]));
 return EQUIPMENT_SLOTS.map(([slot,label])=>{
  const item=items.get(monster?.equipment?.[slot]);
  return item?{slot,label,name:item.name??"装備",rarity:item.rarity??item.displayRarity??"N",level:Math.max(1,Number(item.level)||1),plus:Math.max(0,Number(item.plus)||0)}:{slot,label,name:"なし",rarity:"",level:0,plus:0};
 });
}
function onlineSkillKind(skill){
 const type=String(skill?.type??"");if(type==="revive")return"revive";if(type==="allHeal")return"allHeal";if(type==="selfHeal"||type==="heal")return"heal";if(type==="mpHeal")return"mpHeal";if(["stance","buff"].includes(type))return"guard";return"attack";
}
function onlineSkillProfile(monster){
 return learnedSkills(monster).slice(0,4).map(skill=>({id:skill.id,name:skill.name??"スキル",description:skill.description??"特殊効果を発動",kind:onlineSkillKind(skill),mp:effectiveSkillMpCost(monster,skill),power:Math.max(.1,Number(skill.power)||1),heal:Math.max(0,Number(skill.heal)||Number(skill.revive)||0),mpHeal:Math.max(0,Number(skill.mpHeal)||0),hits:Math.max(1,Number(skill.hits)||1),allEnemies:Boolean(skill.allEnemies||String(skill.target??"").includes("敵全体")),allAllies:Boolean(skill.allies||String(skill.target??"").includes("味方全体")||skill.type==="allHeal"),damageClass:skill.damageClass==="magic"?"magic":"physical",element:skill.element??"neutral"}));
}
export function buildOnlinePartyProfile(state,{monsterId=null,displayName:onlineName=""}={}){
 const party=(state.party??[]).map(id=>state.monsters?.find(monster=>monster.id===id)).filter(Boolean),monster=party.find(entry=>entry.id===monsterId)??selectedPartyMonster(state).monster;
 if(!monster)return{displayName:onlineName||"冒険者",monsterId:null,speciesId:"slime",visualSpeciesId:null,endgameBossId:null,monsterName:"未編成",fallbackEmoji:"？",level:1,stars:1,plus:0,power:0,maxFloor:Math.max(1,Number(state.player?.maxFloor)||1),attribute:"neutral",circleId:"none",circleName:"魔法陣なし",circleLevel:0,equipment:[],battleStats:{hp:100,mp:10,atk:10,matk:10,def:5,mdef:5,spd:10,crit:5,evasion:3},skills:[],captureStock:Math.max(0,Number(state.inventory?.captureCrystals)||0)};
 const species=SPECIES[monster.speciesId]??{},circle=magicCircleById(monster.magicCircleId),stats=calculatedStats(monster),mp=maxMp(monster);
 return{
  displayName:String(onlineName||displayName(monster)||"冒険者").trim().slice(0,16),monsterId:monster.id,speciesId:monster.speciesId,
  visualSpeciesId:monster.visualSpeciesId??null,endgameBossId:monster.endgameBossId??null,monsterName:displayName(monster),fallbackEmoji:species.emoji??"魔",
  level:Math.max(1,Number(monster.level)||1),stars:Math.max(1,Number(monster.stars)||1),plus:Math.max(0,Number(monster.plus)||0),
  power:monsterCombatPower(monster),maxFloor:Math.max(1,Number(state.player?.maxFloor)||1),attribute:monster.attribute??species.element??"neutral",circleId:circle.id,circleName:circle.name,circleLevel:circle.id==="none"?0:Math.max(1,Number(state.magicCircles?.owned?.[circle.id])||1),
  equipment:equipmentProfile(state,monster),battleStats:{hp:Math.max(1,stats.hp),mp:Math.max(0,mp),atk:Math.max(1,stats.atk),matk:Math.max(1,stats.matk??stats.atk),def:Math.max(0,stats.def),mdef:Math.max(0,stats.mdef??stats.def),spd:Math.max(1,stats.spd),crit:Math.max(0,stats.crit),evasion:Math.max(0,stats.evasion)},skills:onlineSkillProfile(monster),captureStock:Math.max(0,Number(state.inventory?.captureCrystals)||0)
 };
}

function characterChoice(monster,selected){
 const species=SPECIES[monster.speciesId]??{};
 return`<button type="button" class="online-character-choice ${monster.id===selected?"selected":""}" data-online-character="${escapeHtml(monster.id)}" aria-pressed="${monster.id===selected}">
  ${monsterVisual(monster,species.emoji??"魔",{className:"online-choice-monster"})}<span><b>${escapeHtml(displayName(monster))}</b><small>Lv.${Number(monster.level||1).toLocaleString()}・戦力 ${formatCombatPower(monsterCombatPower(monster))}</small></span>
 </button>`;
}
function emptyMember(index){return`<div class="online-member-empty"><i>${index+1}</i><span>参加待ち</span></div>`}

export function onlineMagicCircleArt(profile,{className=""}={}){
 const circle=magicCircleById(profile?.circleId),source=circle?.asset??"./assets/magic-circles/plain.png";
 return`<span class="online-circle-art ${className}" data-circle="${circle?.id??"none"}" aria-hidden="true"><img src="${source}" alt=""><i></i></span>`;
}

export function onlineAvatarVisual(profile,{className=""}={}){
 return`<span class="online-avatar-stack ${className}">${onlineMagicCircleArt(profile)}${monsterVisual(profile,profile?.fallbackEmoji??"魔",{className:"online-avatar-monster"})}</span>`;
}
export function onlineEnemyVisual(enemy,{className=""}={}){return monsterVisual({speciesId:enemy?.speciesId??"slime",level:enemy?.level??1},enemy?.emoji??"魔",{frame:Number(enemy?.hp)<=0?"down":"idle",className:`online-enemy-monster ${className}`})}

export function OnlinePartyScreen(state){
 const identity=createIdentity(),invite=inviteParameters(),{party,monster}=selectedPartyMonster(state),storedName=safeStorageGet(ONLINE_STORAGE_KEYS.displayName),defaultName=storedName||(monster?displayName(monster):"冒険者"),server=invite.server||safeStorageGet(ONLINE_STORAGE_KEYS.serverUrl);
 return`<section class="screen online-party-screen v2-screen" data-online-party-root>
  ${resourceHud(state,{backId:"backOnlineParty",title:"パーティ",eyebrow:"ABYSS DOMINION / ONLINE PLAZA"})}
  <div class="party-mode-tabs" role="tablist" aria-label="パーティ機能">
   <button type="button" data-party-tab="formation" role="tab">${pixelIcon("formation")}<span><b>部隊編成</b><small>いつもの4体編成</small></span></button>
   <button type="button" class="active" role="tab" aria-selected="true">${pixelIcon("party")}<span><b>オンライン広場</b><small>友達と同じ部屋で遊ぶ</small></span></button>
  </div>

  <main class="online-party-page">
   <section class="online-connect-panel" data-online-connect-panel>
    <div class="online-connect-heading"><span class="online-signal-orb" aria-hidden="true"><i></i></span><div><small>HOME PC CO-OP SERVER</small><h2>友達と同じ世界へ</h2><p>広場・共闘探索・共闘バトルを追加する独立機能です。通常ゲームとセーブは今まで通り遊べます。</p></div></div>
    <div class="online-identity-card"><div><small>あなたのフレンドID</small><strong data-online-friend-id>${identity.friendId}</strong></div><button type="button" data-copy-friend-id>コピー</button></div>
    <label class="online-field"><span>表示名</span><input type="text" data-online-display-name maxlength="16" value="${escapeHtml(defaultName)}" autocomplete="nickname"></label>
    <label class="online-field"><span>サーバーURL</span><input type="url" inputmode="url" data-online-server-url value="${escapeHtml(server)}" placeholder="https://xxxxx.trycloudflare.com" autocapitalize="none" autocomplete="url"></label>
    <div class="online-character-picker"><small>広場に出すキャラクター</small><div>${party.length?party.map(entry=>characterChoice(entry,monster?.id)).join(""):'<p class="online-no-party">先に1体以上を部隊編成してください。</p>'}</div></div>
    <div class="online-connect-actions"><button type="button" class="online-primary-button" data-online-connect ${monster?"":"disabled"}><span class="online-button-glint"></span>サーバーへ接続</button><button type="button" data-online-disconnect hidden>切断</button></div>
    <div class="online-connection-status is-offline" data-online-status><i></i><span>オフライン</span><small>通常ゲームへの影響なし</small></div>
   </section>

   <section class="online-room-gate" data-online-room-gate hidden>
    <div class="online-room-create"><small>新しい部屋を作る</small><button type="button" class="online-primary-button" data-online-create-room>部屋を作成</button></div>
    <div class="online-room-divider"><span>OR</span></div>
    <form data-online-join-form><label><span>ルームIDで参加</span><input type="text" data-online-room-code maxlength="6" value="${invite.room}" placeholder="AB12CD" autocapitalize="characters" autocomplete="off"></label><button type="submit">参加する</button></form>
    <small class="online-room-note">最大4人・ルームIDは部屋を作った人に表示されます。</small>
   </section>

   <section class="online-plaza-shell online-coop-shell" data-online-plaza-shell hidden>
    <header class="online-room-header"><div><small>PARTY ROOM</small><strong data-online-room-id>------</strong><button type="button" data-copy-room-id>コピー</button></div><span data-online-member-count>1 / 4</span><button type="button" data-copy-invite>招待リンク</button><button type="button" class="danger" data-online-leave-room>退出</button></header>
    <div class="online-plaza-view" data-online-plaza-view>
     <div class="online-plaza" data-online-plaza tabindex="0" aria-label="オンライン広場。画面タップまたは方向キーで移動">
      <div class="online-plaza-sky" aria-hidden="true"></div><div class="online-plaza-river" aria-hidden="true"></div><div class="online-plaza-ground" aria-hidden="true"></div>
      <div class="online-plaza-landmarks" aria-hidden="true"><i class="plaza-castle"></i><i class="plaza-lamp one"></i><i class="plaza-lamp two"></i><i class="plaza-banner"></i></div>
      <div class="online-player-layer" data-online-player-layer></div>
      <div class="online-tap-hint" data-online-tap-hint>地面をタップ／WASDで移動</div>
     </div>
     <div class="online-mobile-controls" aria-label="広場の移動操作"><button data-online-move="up" aria-label="上">▲</button><button data-online-move="left" aria-label="左">◀</button><button data-online-move="down" aria-label="下">▼</button><button data-online-move="right" aria-label="右">▶</button></div>
     <section class="online-coop-lobby" data-online-coop-lobby>
      <header><span class="online-coop-crest" aria-hidden="true">⚔</span><div><small>CO-OP READY ROOM</small><h3>共闘準備室</h3><p>1人1体を操作して、探索と戦闘を4人で共有します。</p></div><em data-online-leader-label>リーダー選択</em></header>
      <div class="online-floor-selector"><button type="button" data-online-floor-down aria-label="10階下げる">−10</button><label><small>挑戦階層</small><input type="number" min="1" max="10000" inputmode="numeric" data-online-floor value="1"><b>F</b></label><button type="button" data-online-floor-up aria-label="10階上げる">＋10</button></div>
      <div class="online-ready-grid" data-online-ready-grid></div>
      <div class="online-ready-actions"><button type="button" data-online-ready><i></i><span><small>READY CHECK</small><b>準備完了にする</b></span></button><button type="button" class="online-start-expedition" data-online-start-expedition disabled><span class="online-button-glint"></span><small>LEADER COMMAND</small><b>共闘探索へ出発</b></button></div>
      <p class="online-coop-rule">全員が準備完了すると出発できます。探索物・敵・戦闘結果は全員で同期され、報酬と捕獲判定は個別です。</p>
     </section>
     <div class="online-social-bar"><div class="online-preset-chat"><button type="button" data-online-chat="hello">よろしく！</button><button type="button" data-online-chat="ready">準備OK！</button><button type="button" data-online-chat="follow">ついてきて！</button><button type="button" data-online-chat="thanks">ありがとう！</button></div><div class="online-stamps"><button type="button" data-online-emote="wave" data-keep-emoji aria-label="手を振る">👋</button><button type="button" data-online-emote="cheer" data-keep-emoji aria-label="喜ぶ">✨</button><button type="button" data-online-emote="heart" data-keep-emoji aria-label="ハート">❤</button><button type="button" data-online-emote="surprise" data-keep-emoji aria-label="驚く">!!</button></div></div>
    </div>
    <section class="online-expedition-shell" data-online-expedition-shell hidden>
     <header class="online-expedition-header"><div><small>SHARED EXPEDITION</small><h3><span data-online-expedition-floor>1</span>F 共闘探索</h3></div><span data-online-expedition-theme>黒鉄遺跡</span><em><b data-online-discoveries>0</b>/<span data-online-discovery-total>6</span> 発見</em></header>
     <div class="online-dungeon-viewport" data-online-dungeon-viewport tabindex="0" aria-label="共闘ダンジョン。通路をタップまたは方向キーで移動">
      <div class="online-dungeon-board" data-online-dungeon-board><div class="online-dungeon-grid" data-online-dungeon-grid></div><div class="online-dungeon-object-layer" data-online-dungeon-objects></div><div class="online-dungeon-player-layer" data-online-dungeon-players></div></div>
      <div class="online-expedition-event" data-online-expedition-event hidden><small>PARTY DISCOVERY</small><b></b><span></span></div>
      <div class="online-dungeon-legend"><span><i class="chest"></i>宝箱</span><span><i class="bone"></i>遺骨</span><span><i class="shrine"></i>祭壇</span><span><i class="encounter"></i>魔物</span><span><i class="exit"></i>出口</span></div>
     </div>
     <section class="online-coop-battle" data-online-coop-battle hidden>
      <header class="online-battle-header"><div><small>SERVER SYNCHRONIZED BATTLE</small><h3>共闘バトル</h3></div><strong>ROUND <b data-online-battle-round>1</b></strong><div class="online-battle-speed" data-online-battle-speed><button data-online-battle-speed-value="0.5">×0.5</button><button data-online-battle-speed-value="1">×1</button><button data-online-battle-speed-value="2">×2</button></div></header>
      <div class="online-battle-banner" data-online-battle-banner hidden><small>CO-OP RESONANCE</small><b></b><span></span></div>
      <div class="online-battle-enemies" data-online-battle-enemies></div>
      <div class="online-battle-party" data-online-battle-party></div>
      <div class="online-battle-command" data-online-battle-command>
       <div class="online-battle-decision"><span>行動決定まで</span><strong data-online-battle-countdown>15.0</strong><small data-online-battle-waiting>仲間の入力を待っています</small></div>
       <div class="online-battle-actions"><button data-online-battle-action="attack"><b>⚔</b><span>たたかう</span></button><button data-online-battle-action="guard"><b>🛡</b><span>ガード</span></button><button data-online-battle-action="skill"><b>📖</b><span>スキル</span></button><button data-online-battle-action="item"><b>🧪</b><span>応急薬</span></button><button data-online-battle-action="capture"><b>🔮</b><span>捕獲</span></button></div>
       <div class="online-battle-skills" data-online-battle-skills hidden></div>
       <p class="online-battle-target-note" data-online-battle-target-note>攻撃する敵を選択してください。</p>
      </div>
      <div class="online-battle-feed" data-online-battle-feed><span>敵と遭遇！全員の行動を同期しています。</span></div>
     </section>
     <div class="online-dungeon-command"><div class="online-dungeon-pad" aria-label="ダンジョンの移動操作"><button data-online-dungeon-move="up" aria-label="上">▲</button><button data-online-dungeon-move="left" aria-label="左">◀</button><button data-online-dungeon-move="down" aria-label="下">▼</button><button data-online-dungeon-move="right" aria-label="右">▶</button></div><div><button type="button" data-online-request-return>帰還を提案</button><button type="button" class="online-complete-expedition" data-online-complete-expedition hidden>踏破を確定</button><nav class="online-dungeon-social" aria-label="共闘リアクション"><button type="button" data-online-chat="follow">ついてきて！</button><button type="button" data-online-chat="thanks">ありがとう！</button><button type="button" data-online-emote="cheer" data-keep-emoji aria-label="喜ぶ">✨</button><button type="button" data-online-emote="heart" data-keep-emoji aria-label="ハート">❤</button></nav><small data-online-return-status>リーダー帰還／過半数投票</small></div></div>
     <div class="online-expedition-feed" data-online-expedition-feed><span>仲間と同じマップへ入りました。</span></div>
    </section>
    <aside class="online-member-strip" data-online-member-strip>${Array.from({length:4},(_,index)=>emptyMember(index)).join("")}</aside>
   </section>
  </main>

  <aside class="online-profile-drawer" data-online-profile-drawer aria-hidden="true"><button type="button" data-online-profile-close aria-label="閉じる">×</button><div data-online-profile-content></div></aside>
  ${bottomNav("party")}
 </section>`;
}

export{ONLINE_STORAGE_KEYS};
