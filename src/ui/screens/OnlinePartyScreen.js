import{SPECIES}from"../../data/species.js?v=2.10.0-build160";
import{displayName,calculatedStats}from"../../models/Monster.js?v=2.10.0-build160";
import{monsterCombatPower,partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=2.10.0-build160";
import{magicCircleById,equippedMagicCircle}from"../../core/MagicCircleSystem.js?v=2.10.0-build160";
import{learnedSkills,maxMp,effectiveSkillMpCost}from"../../battle/SkillSystem.js?v=2.10.0-build160";
import{monsterVisual}from"../MonsterVisual.js?v=2.10.0-build160";
import{resourceHud,bottomNav,pixelIcon}from"../components/GameChrome.js?v=2.10.0-build160";
import{signatureWeaponForMonster,signatureWeaponOwnerId}from"../../core/SignatureWeaponSystem.js?v=2.10.0-build160";

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
  return item?{slot,label,name:item.name??"装備",rarity:item.rarity??item.displayRarity??"N",level:Math.max(1,Number(item.level)||1),plus:Math.max(0,Number(item.plus)||0),signatureOwnerId:signatureWeaponOwnerId(item)}:{slot,label,name:"なし",rarity:"",level:0,plus:0,signatureOwnerId:null};
 });
}
function onlineSkillKind(skill){
 const type=String(skill?.type??"");if(type==="revive")return"revive";if(type==="allHeal")return"allHeal";if(type==="selfHeal"||type==="heal")return"heal";if(type==="mpHeal")return"mpHeal";if(["stance","buff"].includes(type))return"buff";return"attack";
}
function onlineSkillProfile(monster){
 return learnedSkills(monster).slice(0,4).map(skill=>({id:skill.id,name:skill.name??"スキル",description:skill.description??"特殊効果を発動",kind:onlineSkillKind(skill),mp:effectiveSkillMpCost(monster,skill),power:Math.max(.1,Number(skill.power)||1),heal:Math.max(0,Number(skill.heal)||Number(skill.revive)||0),reviveMp:Math.max(0,Number(skill.reviveMp)||0),mpHeal:Math.max(0,Number(skill.mpHeal)||0),hits:Math.max(1,Number(skill.hits)||1),allEnemies:Boolean(skill.allEnemies||String(skill.target??"").includes("敵全体")),allAllies:Boolean(skill.allies||String(skill.target??"").includes("味方全体")||skill.type==="allHeal"),damageClass:skill.damageClass==="magic"?"magic":"physical",element:skill.element??monster.attribute??SPECIES[monster.speciesId]?.element??"neutral",partyShieldRate:Math.max(0,Number(skill.partyShieldRate)||0),effects:(skill.effects??[]).slice(0,6).map(effect=>({kind:String(effect.kind??""),value:Math.max(0,Number(effect.value)||0),turns:Math.max(1,Number(effect.turns)||1),allies:Boolean(effect.allies),enemy:Boolean(effect.enemy)})),status:skill.status?{id:String(skill.status.id??"status"),name:String(skill.status.name??"状態異常"),chance:Math.max(0,Math.min(1,Number(skill.status.chance)||0)),power:Math.max(0,Number(skill.status.power)||0),turns:Math.max(1,Number(skill.status.turns)||1)}:null}));
}
export function buildOnlinePartyProfile(state,{monsterId=null,displayName:onlineName=""}={}){
 const party=(state.party??[]).map(id=>state.monsters?.find(monster=>monster.id===id)).filter(Boolean),monster=party.find(entry=>entry.id===monsterId)??selectedPartyMonster(state).monster;
 if(!monster)return{displayName:onlineName||"冒険者",monsterId:null,speciesId:"slime",visualSpeciesId:null,endgameBossId:null,monsterName:"未編成",fallbackEmoji:"？",level:1,stars:1,plus:0,power:0,maxFloor:Math.max(1,Number(state.player?.maxFloor)||1),attribute:"neutral",circleId:"none",circleName:"魔法陣なし",circleLevel:0,circleEffect:"none",equipment:[],battleStats:{hp:100,mp:10,atk:10,matk:10,def:5,mdef:5,spd:10,crit:5,evasion:3},skills:[],captureStock:Math.max(0,Number(state.inventory?.captureCrystals)||0)};
 const species=SPECIES[monster.speciesId]??{},circle=equippedMagicCircle(monster,state),stats=calculatedStats(monster),mp=maxMp(monster),signature=signatureWeaponForMonster(state,monster);
 return{
  displayName:String(onlineName||displayName(monster)||"冒険者").trim().slice(0,16),monsterId:monster.id,speciesId:monster.speciesId,
  visualSpeciesId:monster.visualSpeciesId??null,endgameBossId:monster.endgameBossId??null,monsterName:displayName(monster),fallbackEmoji:species.emoji??"魔",
  level:Math.max(1,Number(monster.level)||1),stars:Math.max(1,Number(monster.stars)||1),plus:Math.max(0,Number(monster.plus)||0),
  power:monsterCombatPower(monster),maxFloor:Math.max(1,Number(state.player?.maxFloor)||1),attribute:monster.attribute??species.element??"neutral",circleId:circle.id,circleName:circle.name,circleLevel:circle.id==="none"?0:Math.max(1,Number(circle.level)||1),circleEffect:circle.effect??"none",
  equipment:equipmentProfile(state,monster),signatureResonance:signature?{id:signature.definition.id,name:signature.definition.name,ownerId:signature.ownerId,active:signature.active,description:signature.definition.description,...signature.definition}:null,battleStats:{hp:Math.max(1,stats.hp),mp:Math.max(0,mp),atk:Math.max(1,stats.atk),matk:Math.max(1,stats.matk??stats.atk),def:Math.max(0,stats.def),mdef:Math.max(0,stats.mdef??stats.def),spd:Math.max(1,stats.spd),crit:Math.max(0,stats.crit),evasion:Math.max(0,stats.evasion)},skills:onlineSkillProfile(monster),captureStock:Math.max(0,Number(state.inventory?.captureCrystals)||0)
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

export function onlineAvatarVisual(profile,{className="",frame="idle"}={}){
 return`<span class="online-avatar-stack ${className}">${onlineMagicCircleArt(profile)}${monsterVisual(profile,profile?.fallbackEmoji??"魔",{frame,className:"online-avatar-monster"})}</span>`;
}
export function onlineEnemyVisual(enemy,{className=""}={}){return monsterVisual({speciesId:enemy?.speciesId??"slime",level:enemy?.level??1},enemy?.emoji??"魔",{frame:Number(enemy?.hp)<=0?"down":"idle",className:`online-enemy-monster ${className}`})}

export function OnlinePartyScreen(state){
 const identity=createIdentity(),invite=inviteParameters(),{party,monster}=selectedPartyMonster(state),storedName=safeStorageGet(ONLINE_STORAGE_KEYS.displayName),defaultName=storedName||(monster?displayName(monster):"冒険者"),server=invite.server||safeStorageGet(ONLINE_STORAGE_KEYS.serverUrl),combatPower=partyCombatPower(state);
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
    <header class="online-room-gate-title"><button type="button" data-online-gate-back aria-label="接続設定へ戻る">←</button><div><small>ONLINE PARTY ENTRANCE</small><h2>共鳴する部屋へ</h2><p>新しい部屋を作るか、仲間から届いた6文字のルームIDで参加してください。</p></div></header>
    <div class="online-room-gate-identity"><span><small>フレンドID</small><b>${identity.friendId}</b></span><button type="button" data-copy-friend-id>コピー</button></div>
    <div class="online-room-create"><small>新しい冒険を始める</small><button type="button" class="online-primary-button" data-online-create-room><b>部屋を作成</b><span>自分がリーダーになります</span></button></div>
    <div class="online-room-divider"><span>OR</span></div>
    <form data-online-join-form><label><span>ルームIDで参加</span><input type="text" data-online-room-code maxlength="6" value="${invite.room}" placeholder="AB12CD" autocapitalize="characters" autocomplete="off"></label><button type="submit"><b>参加する</b><span>仲間の部屋へ入る</span></button></form>
    <small class="online-room-note">最大4人・ルームIDは部屋を作った人に表示されます。</small>
   </section>

   <section class="online-plaza-shell online-coop-shell" data-online-plaza-shell hidden>
    <header class="online-room-header"><div class="online-room-code"><small>ROOM CODE</small><strong data-online-room-id>------</strong><button type="button" data-copy-room-id>コピー</button><button type="button" data-copy-invite>招待</button></div><div class="online-room-friend"><small>FRIEND ID</small><b data-online-room-friend-id>${identity.friendId}</b></div><nav aria-label="オンライン画面"><button type="button" class="active" data-online-room-view="plaza">広場</button><button type="button" data-online-room-view="lobby">出発準備</button><button type="button" data-online-room-view="raid">レイド</button><button type="button" data-online-room-view="resonance">共鳴迷宮</button><button type="button" data-online-room-view="trade">交換</button><button type="button" data-online-room-view="chat">会話<i data-online-chat-unread hidden></i></button></nav><span data-online-member-count>1 / 4</span><button type="button" class="danger" data-online-leave-room>退出</button></header>
    <div class="online-plaza-view" data-online-plaza-view>
     <div class="online-plaza" data-online-plaza tabindex="0" aria-label="オンライン広場。画面タップまたは方向キーで移動">
      <div class="online-plaza-sky" aria-hidden="true"></div><div class="online-plaza-river" aria-hidden="true"></div><div class="online-plaza-ground" aria-hidden="true"></div>
      <div class="online-plaza-landmarks" aria-hidden="true"><i class="plaza-castle"></i><i class="plaza-lamp one"></i><i class="plaza-lamp two"></i><i class="plaza-banner"></i></div>
      <div class="online-player-layer" data-online-player-layer></div>
      <div class="online-emote-wheel" data-online-emote-wheel hidden aria-label="スタンプを選択">${[["like","👍"],["heart","❤️"],["laugh","😂"],["cry","😭"],["clap","👏"],["alert","❗"],["question","❓"],["sparkle","✨"]].map(([id,emoji],index)=>`<button type="button" data-online-wheel-emote="${id}" style="--stamp-index:${index}" aria-label="${emoji}">${emoji}</button>`).join("")}</div>
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
    <section class="online-raid-view" data-online-raid-view hidden>
     <div class="online-raid-lobby" data-online-raid-lobby>
      <article class="online-raid-hero">
       <div class="online-raid-boss-art"><img src="./assets/online/raid-abyss-amalgam.png" alt="終焉融骸・アビス＝マルガ"><i></i></div>
       <div><small>WORLD RAID / CALAMITY CLASS</small><h2>終焉融骸<br>アビス＝マルガ</h2><p>十神すら捕食した、名も形も定まらぬ終焉の集合体。5ラウンドは挑戦者を観察し、6ラウンド目から破滅を解放する。</p><dl><div><dt>攻撃開始</dt><dd>ROUND 6</dd></div><div><dt>失敗報酬</dt><dd>なし</dd></div><div><dt>人数</dt><dd>1〜4人</dd></div></dl></div>
      </article>
      <div class="online-raid-rule"><b>貢献度ランキング</b><span>与ダメージ・回復・蘇生・防御・補助を集計。上位ほどGOLD／💎／EXP／融骸核片が増加します。</span></div>
      <section class="online-raid-progress" data-online-raid-progress><header><div><small>SERVER PERSISTENT HP</small><b>累積討伐進行</b></div><em data-online-raid-attempts>未挑戦</em></header><div class="online-raid-progress-bar"><i data-online-raid-progress-meter></i></div><p><strong data-online-raid-progress-hp>HPは初回挑戦時に確定</strong><span>敗北しても与えたダメージは残り、次回は残HPから再開します。</span></p><ol data-online-raid-milestones><li data-threshold="5">5%</li><li data-threshold="10">10%</li><li data-threshold="25">25%</li><li data-threshold="50">50%</li><li data-threshold="75">75%</li></ol></section>
      <div class="online-raid-ready-grid" data-online-raid-ready-grid></div>
      <div class="online-raid-ready-actions">
       <button type="button" class="online-raid-ready" data-online-raid-ready><i></i><span><small>READY CHECK</small><b>準備完了にする</b></span></button>
       <button type="button" class="online-raid-start" data-online-start-raid disabled><span class="online-button-glint"></span><small>LEADER COMMAND</small><b>終焉融骸へ挑戦</b></button>
      </div>
      <section class="online-raid-exchange"><header><div><small>RAID EXCHANGE</small><h3>融骸核片 交換所</h3></div><strong>所持 <span data-online-raid-materials>0</span></strong></header><div><button type="button" data-online-raid-exchange="character" data-cost="420"><img src="./assets/online/raid/juvenile-amalga.png" alt=""><span><b>融骸幼体アマルガ</b><small>限定仲間・420核片</small></span></button><button type="button" data-online-raid-exchange="equipment" data-cost="240"><img src="./assets/equipment/end-devouring-greatblade.png" alt=""><span><b>終焉喰らいの大刃</b><small>限定神話装備・240核片</small></span></button><button type="button" data-online-raid-exchange="circle" data-cost="100"><img src="./assets/magic-circles/death-mirror-raid.png" alt=""><span><b>死鏡の魔法陣・現物</b><small>術式未解禁でも所持可・100核片</small></span></button></div></section>
     </div>
     <section class="online-raid-battle battle-screen side-battle-v2 battle-theme-nether manual-mode normal-battle-layout" data-online-raid-battle data-floor-band="20" hidden>
      <div class="battle-header"><div class="round-label"><small>ラウンド</small><b data-online-raid-round>1</b></div><div class="battle-header-title"><b data-online-raid-name>終焉融骸・アビス＝マルガ</b><small>サーバー同期コマンド戦闘</small></div><button type="button" data-online-raid-speed-value="0.5">×0.5</button><button type="button" data-online-raid-speed-value="1">×1</button><button type="button" data-online-raid-speed-value="2">×2</button></div>
      <div class="turn-order" data-online-raid-turn-order aria-label="行動順"><span class="turn-order-title">行動順</span></div>
      <div class="battle-arena side-battle-arena multi-enemy" data-online-raid-stage>
       <div class="battle-stage-vignette" aria-hidden="true"></div>
       <div class="online-raid-telegraph"><small data-online-raid-telegraph-stage>観察段階 1/5</small><b data-online-raid-telegraph-title>凝視</b><span data-online-raid-telegraph-message>無数の眼が挑戦者を測っている…</span><i data-online-raid-danger style="--danger:20%"></i></div>
       <span class="formation-label party-label">味方　<span>後衛 ← → 前衛</span></span><span class="formation-label enemy-label"><span>前衛 ← → 後衛</span>　敵</span>
       <div class="battle-party side-party" data-online-raid-party></div><div class="battle-clash-line" aria-hidden="true"><span>対</span></div><div class="enemy-party side-enemies" data-online-raid-enemies></div>
       <div class="battle-fx-layer" data-online-raid-fx></div><div class="online-raid-impact" data-online-raid-impact hidden></div>
      </div>
      <div class="battle-command online-normal-raid-command"><div class="battle-command-head spread"><h2>自分の行動</h2><span class="muted" data-online-raid-waiting>仲間の入力を待っています</span></div><div class="online-battle-decision"><span>行動決定まで</span><strong data-online-raid-countdown>18.0</strong><small data-online-raid-target-note>味方をタップすると回復・補助対象を変更できます。</small></div><div class="command-grid"><button data-online-raid-action="attack"><i>${pixelIcon("crossed-swords")}</i><span>たたかう</span></button><button data-online-raid-action="guard"><i>${pixelIcon("equipment")}</i><span>ガード</span></button><button data-online-raid-action="skill"><i>${pixelIcon("skills")}</i><span>スキル</span></button><button data-online-raid-action="item"><i>${pixelIcon("growth")}</i><span>応急薬</span></button></div><div class="online-raid-skills skill-command-list" data-online-raid-skills hidden></div></div>
      <div class="battle-log online-raid-feed" data-online-raid-feed><div>終焉融骸がこちらを観察している…</div></div>
      <button type="button" class="online-phase-chat-button" data-online-open-chat>会話 <i data-online-phase-unread hidden></i></button>
      <section class="online-raid-result" data-online-raid-result hidden><small>CONTRIBUTION RANKING</small><h3></h3><div data-online-raid-ranking></div><button type="button" data-online-raid-result-close>準備室へ戻る</button></section>
     </section>
    </section>
    <section class="online-resonance-view" data-online-resonance-view hidden>
     <div class="online-resonance-lobby" data-online-resonance-lobby>
      <header class="online-resonance-hero"><span aria-hidden="true">◈</span><div><small>VOICE CO-OP / 5–8 MINUTES</small><h2>共鳴迷宮</h2><p>仲間ごとに違う手掛かりを声で伝え、同時スイッチ・門の防衛・救出・宝箱を突破する短時間協力コンテンツ。</p></div></header>
      <ol class="online-resonance-rules"><li><b>別々の手掛かり</b><span>画面に出た情報を仲間へ伝える</span></li><li><b>同時操作</b><span>二つの音板を別々の場所で起動</span></li><li><b>救出と防衛</b><span>閉じ込められた仲間を助ける</span></li><li><b>宝箱かミミック</b><span>最後は全員の選択で報酬が変化</span></li></ol>
      <div class="online-resonance-ready-grid" data-online-resonance-ready-grid></div>
      <div class="online-resonance-ready-actions"><button type="button" data-online-resonance-ready><i></i><span><small>READY CHECK</small><b>準備完了にする</b></span></button><button type="button" data-online-start-resonance disabled><small>LEADER COMMAND</small><b>共鳴迷宮を開く</b></button></div>
      <p class="online-coop-rule">2〜4人用。切断した仲間は一時的に追従AIへ切り替わり、再接続すると同じ位置・進行へ復帰します。</p>
     </div>
     <section class="online-resonance-game" data-online-resonance-game hidden>
      <header><div><small>RESONANCE LABYRINTH</small><h2 data-online-resonance-phase>同時音板</h2></div><dl><div><dt>残り</dt><dd data-online-resonance-time>7:00</dd></div><div><dt>協力スコア</dt><dd data-online-resonance-score>0</dd></div></dl></header>
      <aside class="online-resonance-clue"><small>あなただけの手掛かり</small><strong data-online-resonance-clue>仲間と手掛かりを共有しよう</strong></aside>
      <div class="online-resonance-event" data-online-resonance-event><b>共鳴迷宮 開門</b><span>二つの音板を同時に起動しよう。</span></div>
      <div class="online-resonance-board" data-online-resonance-board role="img" aria-label="共鳴迷宮マップ"></div>
      <div class="online-resonance-status"><div><span>開門同調</span><i><u data-online-resonance-defense></u></i><b data-online-resonance-defense-label>0%</b></div><div data-online-resonance-member-status></div></div>
      <div class="online-resonance-chests" data-online-resonance-chests hidden><button type="button" data-online-resonance-choice="gold">金の箱<small>GOLD重視</small></button><button type="button" data-online-resonance-choice="crystal">蒼の箱<small>💎重視</small></button><button type="button" data-online-resonance-choice="capture">紫の箱<small>捕獲結晶重視</small></button></div>
      <div class="online-resonance-mimic" data-online-resonance-mimic hidden><div><b>共鳴ミミック</b><span><i data-online-resonance-mimic-meter></i></span><em data-online-resonance-mimic-hp>HP 0 / 0</em></div><button type="button" data-online-resonance-attack>みんなで攻撃！</button></div>
      <div class="online-resonance-result" data-online-resonance-result hidden><small>CO-OP RESULT</small><h3>共鳴迷宮 踏破！</h3><strong data-online-resonance-result-score>0</strong><button type="button" data-online-resonance-return>準備室へ戻る</button></div>
      <div class="online-resonance-controls"><div class="online-mobile-controls"><button type="button" data-online-resonance-move="up" aria-label="上">▲</button><button type="button" data-online-resonance-move="left" aria-label="左">◀</button><button type="button" data-online-resonance-move="down" aria-label="下">▼</button><button type="button" data-online-resonance-move="right" aria-label="右">▶</button></div><button type="button" class="online-resonance-action" data-online-resonance-action>共鳴する</button><button type="button" class="online-phase-chat-button" data-online-open-chat>会話 <i data-online-phase-unread hidden></i></button></div>
     </section>
    </section>
    <section class="online-trade-view" data-online-trade-view hidden>
     <header class="online-trade-title"><div><small>SECURE EXCHANGE</small><h2>契約交換所</h2></div><p>仲間・装備・GOLD・💎・捕獲結晶を交換できます。双方の最終確認後、同時に確定します。</p></header>
     <div class="online-trade-invite" data-online-trade-invite><h3>交換する相手を選択</h3><div data-online-trade-members></div></div>
     <section class="online-trade-session" data-online-trade-session hidden>
      <header><div><small>TRADE ID</small><b data-online-trade-id>---</b></div><strong data-online-trade-state>招待確認中</strong><span data-online-trade-expiry></span></header>
      <div class="online-trade-offers"><article class="self"><small>あなたの提示品</small><div data-online-trade-self-offer><span>未選択</span></div></article><i>⇄</i><article><small>相手の提示品</small><div data-online-trade-partner-offer><span>待機中</span></div></article></div>
      <div class="online-trade-invite-actions" data-online-trade-invite-actions hidden><button type="button" data-online-trade-accept>交換を始める</button><button type="button" data-online-trade-decline>断る</button></div>
      <div class="online-trade-catalog" data-online-trade-catalog><label><span>提示する資産</span><select data-online-trade-select><option value="">選択してください</option></select></label><label class="online-trade-amount"><span>数量</span><input type="number" inputmode="numeric" min="1" value="1" data-online-trade-amount aria-label="交換数量" disabled></label><button type="button" data-online-trade-set>枠にセット</button></div>
      <div class="online-trade-warning" data-online-trade-warning>編成中の仲間、装備中・ロック中・お気に入り中の品は交換できません。魔法陣は交換対象外です。</div>
      <div class="online-trade-actions"><button type="button" data-online-trade-ready>セット完了</button><button type="button" class="confirm" data-online-trade-confirm disabled>内容を再確認して交換確定</button><button type="button" class="danger" data-online-trade-cancel>交換を中止</button></div>
     </section>
     <section class="online-trade-history"><h3>交換履歴</h3><div data-online-trade-history><p>交換履歴はまだありません。</p></div></section>
    </section>
    <section class="online-expedition-shell online-solo-explore explore-screen explore-screen-dungeon" data-online-expedition-shell hidden>
     <header class="online-solo-resource-hud resource-hud"><strong>探索・<span data-online-expedition-floor>1</span>階</strong><div><span>${pixelIcon("coin")}<b>${Math.max(0,Number(state.player?.gold)||0).toLocaleString()}</b></span><span>${pixelIcon("crystal")}<b>${Math.max(0,Number(state.player?.crystals)||0).toLocaleString()}</b></span><span>${pixelIcon("capture")}<b>${Math.max(0,Number(state.inventory?.captureCrystals)||0).toLocaleString()}</b></span><span>${pixelIcon("key")}<b>${Math.max(0,Number(state.inventory?.abyssKeys)||0).toLocaleString()}</b></span></div></header>
     <div class="online-solo-command-header explore-command-header"><div><small>PARTY COMBAT POWER</small><strong data-online-expedition-power>${formatCombatPower(combatPower)}</strong></div><section><span>${pixelIcon("dungeon")}</span><div><b data-online-expedition-theme>黒鉄遺跡</b><small>共同探索・<em data-online-discoveries>0</em>/<em data-online-discovery-total>6</em> 発見</small></div></section></div>
     <section class="online-expedition-party-hud explore-party-hud" data-online-expedition-party-panel><button type="button" class="online-expedition-party-toggle" data-online-expedition-party-toggle aria-expanded="false"><span>部隊状況を開く</span><b>⌄</b></button><div class="online-expedition-party-strip" data-online-expedition-party-hud></div></section>
     <div class="online-solo-stage explore-stage">
      <header class="online-expedition-header" data-online-expedition-header><div><small>SHARED EXPEDITION</small><h3><span data-online-expedition-floor-label>1</span>F 共闘探索</h3></div><span data-online-expedition-theme-label>黒鉄遺跡</span><em><b data-online-discoveries-label>0</b>/<span data-online-discovery-total-label>6</span> 発見</em></header>
      <button type="button" class="online-expedition-auto" data-online-expedition-auto>${pixelIcon("formation")}<b>自動探索</b></button><button type="button" class="online-expedition-minimap">${pixelIcon("event")}<b>ミニマップ</b></button>
      <div class="online-dungeon-viewport" data-online-dungeon-viewport tabindex="0" aria-label="共闘ダンジョン。通路をタップまたは方向キーで移動">
      <div class="online-dungeon-board" data-online-dungeon-board><div class="online-dungeon-grid" data-online-dungeon-grid></div><div class="online-dungeon-decoration-layer" data-online-dungeon-decorations></div><div class="online-dungeon-object-layer" data-online-dungeon-objects></div><div class="online-dungeon-player-layer" data-online-dungeon-players></div></div>
      <div class="online-dungeon-legend"><span><i class="chest"></i>宝箱</span><span><i class="bone"></i>遺骨</span><span><i class="shrine"></i>祭壇</span><span><i class="encounter"></i>魔物</span><span><i class="exit"></i>出口</span></div>
      </div>
      <div class="online-mobile-controls online-dungeon-mobile-controls" aria-label="探索の移動操作"><button data-online-dungeon-move="up" aria-label="上">▲</button><button data-online-dungeon-move="left" aria-label="左">◀</button><button data-online-dungeon-move="down" aria-label="下">▼</button><button data-online-dungeon-move="right" aria-label="右">▶</button></div>
      <button type="button" class="online-phase-chat-button" data-online-open-chat>会話 <i data-online-phase-unread hidden></i></button>
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
     <div class="online-expedition-event" data-online-expedition-event hidden><small>PARTY DISCOVERY</small><b></b><span></span></div>
     <div class="online-stair-status" data-online-stair-status hidden><small>NEXT FLOOR</small><b>階段集合 <span>0/1</span></b><em></em></div>
     <nav class="online-explore-nav explore-nav"><button type="button" data-online-expedition-nav="formation">${pixelIcon("formation")}<b>編成</b></button><button type="button" data-online-expedition-nav="equipment">${pixelIcon("equipment")}<b>装備</b></button><button type="button" data-online-expedition-nav="items">${pixelIcon("growth")}<b>持ち物</b></button><button type="button" data-online-expedition-nav="current">${pixelIcon("event")}<b>現在地</b></button><button type="button" class="danger" data-online-request-return>${pixelIcon("rest")}<b>帰還</b></button></nav><button type="button" class="online-complete-expedition" data-online-complete-expedition hidden>踏破を確定</button><small data-online-return-status>探索継続中・帰還はいつでも提案できます</small>
     <div class="online-expedition-feed" data-online-expedition-feed><span>仲間と同じマップへ入りました。</span></div>
    </section>
    <aside class="online-member-strip" data-online-member-strip>${Array.from({length:4},(_,index)=>emptyMember(index)).join("")}</aside>
    <section class="online-chat-dock" data-online-chat-dock hidden>
     <button type="button" class="online-chat-dock-toggle" data-online-chat-toggle aria-expanded="false"><span><small>PARTY CHAT</small><b>共鳴通信</b></span><em data-online-chat-dock-unread hidden>0</em><i aria-hidden="true">▲</i></button>
     <div class="online-chat-drawer" data-online-chat-drawer hidden>
      <div class="online-chat-history" data-online-chat-history role="log" aria-live="polite"><div class="online-chat-empty"><b>まだ会話はありません</b><span>仲間が入ると履歴が全員に同期されます。</span></div></div>
      <div class="online-chat-presets" aria-label="定型文"><button type="button" data-online-chat="hello">よろしく！</button><button type="button" data-online-chat="ready">準備OK！</button><button type="button" data-online-chat="follow">ついてきて！</button><button type="button" data-online-chat="thanks">ありがとう！</button><button type="button" data-online-emote="wave" data-keep-emoji>👋</button><button type="button" data-online-emote="cheer" data-keep-emoji>✨</button><button type="button" data-online-emote="heart" data-keep-emoji>❤</button></div>
     </div>
     <form class="online-chat-compose" data-online-chat-form><label><span>メッセージ</span><textarea rows="1" maxlength="80" enterkeyhint="send" data-online-chat-input placeholder="メッセージ（80文字まで）"></textarea><small><b data-online-chat-count>0</b>/80</small></label><button type="submit" data-online-chat-send>送信</button></form>
    </section>
   </section>
  </main>

  <aside class="online-profile-drawer" data-online-profile-drawer aria-hidden="true"><button type="button" data-online-profile-close aria-label="閉じる">×</button><div data-online-profile-content></div></aside>
  <div class="online-global-bottom-nav">${bottomNav("party")}</div>
 </section>`;
}

export{ONLINE_STORAGE_KEYS};
