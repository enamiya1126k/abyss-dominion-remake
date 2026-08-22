export const CONTEXT_GUIDE_VERSION=1;

export const CONTEXT_GUIDE_STEPS=Object.freeze([
 {id:"home_dungeon",group:"出発",label:"ホームからダンジョンを開く"},
 {id:"dungeon_departure",group:"出発",label:"出発階を決めて探索を始める"},
 {id:"explore_move",group:"探索",label:"床をタップして歩く"},
 {id:"explore_pickup",group:"探索",label:"近くの魔晶石を拾う"},
 {id:"battle_attack",group:"戦闘",label:"通常攻撃を使う"},
 {id:"battle_skill_open",group:"戦闘",label:"スキル一覧を開く"},
 {id:"battle_skill_use",group:"戦闘",label:"スキルを実際に使う"},
 {id:"battle_capture",group:"戦闘",label:"捕獲結晶で魔物を捕獲する"},
 {id:"battle_item_open",group:"戦闘",label:"回復アイテムを開く"},
 {id:"battle_heal_item",group:"戦闘",label:"HPが減った仲間を回復する"},
 {id:"attribute_check",group:"属性",label:"敵味方の属性マークを見る"},
 {id:"attribute_skill",group:"属性",label:"属性を見てスキルを選ぶ"},
 {id:"first_return",group:"帰還",label:"最初の探索から帰還する"},
 {id:"starter_gacha_open",group:"召喚",label:"スタートダッシュ召喚を開く"},
 {id:"starter_gacha_pull",group:"召喚",label:"無料10連を引く"},
 {id:"party_open",group:"編成",label:"部隊編成を開く"},
 {id:"party_slot",group:"編成",label:"空いている出撃枠を選ぶ"},
 {id:"party_add",group:"編成",label:"新しい仲間を部隊へ入れる"},
 {id:"bed_recover",group:"回復",label:"初敗北後に寝台で回復する"},
 {id:"equipment_open",group:"育成",label:"装備管理を開く"},
 {id:"equipment_equip",group:"育成",label:"装備を1つ身につける"},
 {id:"equipment_enhance",group:"育成",label:"装備育成を試す"},
 {id:"skills_open",group:"育成",label:"スキル設定を開く"},
 {id:"skills_set",group:"育成",label:"スキル枠を設定する"},
 {id:"abyss_tree_open",group:"育成",label:"深淵ツリーを開く"},
 {id:"abyss_tree_learn",group:"育成",label:"深淵ツリーを1つ習得する"},
 {id:"floor10_prepare",group:"10階",label:"10階ボス前の準備を確認する"},
 {id:"floor10_defeat",group:"10階",label:"10階の支配者を倒す"}
]);

export const CONTEXT_GUIDE_STEP_IDS=Object.freeze(CONTEXT_GUIDE_STEPS.map(step=>step.id));

function cleanObject(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{}}
function cleanInteger(value,fallback=0){const number=Number(value);return Number.isFinite(number)?Math.max(0,Math.floor(number)):fallback}

export function createContextualGuideState(monsterCount=1){
 return{
  version:CONTEXT_GUIDE_VERSION,
  disabled:false,
  completed:{},
  pending:{},
  counters:{normalBattles:0,returns:0,defeats:0},
  newestMonsterId:null,
  initialMonsterCount:Math.max(1,cleanInteger(monsterCount,1)),
  snoozedId:null,
  snoozedUntil:0,
  updatedAt:null
 };
}

export function normalizeContextualGuide(value,{monsterCount=1,legacyAdvanced=false}={}){
 const missing=!value||typeof value!=="object"||Array.isArray(value),source=cleanObject(value),state=createContextualGuideState(monsterCount);
 state.version=CONTEXT_GUIDE_VERSION;
 state.disabled=Boolean(source.disabled||(missing&&legacyAdvanced));
 state.completed=cleanObject(source.completed);
 for(const key of Object.keys(state.completed))state.completed[key]=Boolean(state.completed[key]);
 state.pending=cleanObject(source.pending);
 state.counters={...state.counters,...cleanObject(source.counters)};
 for(const key of Object.keys(state.counters))state.counters[key]=cleanInteger(state.counters[key]);
 state.newestMonsterId=typeof source.newestMonsterId==="string"?source.newestMonsterId:null;
 state.initialMonsterCount=Math.max(1,cleanInteger(source.initialMonsterCount,monsterCount));
 state.snoozedId=typeof source.snoozedId==="string"?source.snoozedId:null;
 state.snoozedUntil=cleanInteger(source.snoozedUntil);
 state.updatedAt=typeof source.updatedAt==="string"?source.updatedAt:null;
 return state;
}

export function guideStepDone(state,id){return Boolean(state?.completed?.[id])}

export function completeGuideStep(state,id){
 if(!state||!CONTEXT_GUIDE_STEP_IDS.includes(id)||guideStepDone(state,id))return false;
 state.completed[id]=true;
 if(state.snoozedId===id){state.snoozedId=null;state.snoozedUntil=0}
 state.updatedAt=new Date().toISOString();
 return true;
}

export function setGuidePending(state,key,value=true){
 if(!state)return;
 state.pending??={};
 if(value===false||value==null)delete state.pending[key];else state.pending[key]=value;
 state.updatedAt=new Date().toISOString();
}

export function guidePending(state,key){return state?.pending?.[key]}

export function bumpGuideCounter(state,key,amount=1){
 if(!state)return 0;
 state.counters??={};
 state.counters[key]=cleanInteger(state.counters[key])+Math.max(0,cleanInteger(amount,1));
 state.updatedAt=new Date().toISOString();
 return state.counters[key];
}

export function snoozeGuideStep(state,id,durationMs=60000){
 if(!state)return;
 state.snoozedId=id;
 state.snoozedUntil=Date.now()+Math.max(5000,cleanInteger(durationMs,60000));
 state.updatedAt=new Date().toISOString();
}

export function guideStepSnoozed(state,id,now=Date.now()){
 return state?.snoozedId===id&&Number(state.snoozedUntil)>now;
}

export function resetContextualGuide(state,monsterCount=1){
 const fresh=createContextualGuideState(monsterCount);
 Object.keys(state??{}).forEach(key=>delete state[key]);
 Object.assign(state,fresh);
 return state;
}

export function contextualGuideProgress(state){
 const completed=CONTEXT_GUIDE_STEPS.filter(step=>guideStepDone(state,step.id)).length;
 return{completed,total:CONTEXT_GUIDE_STEPS.length,rate:Math.round(completed/CONTEXT_GUIDE_STEPS.length*100)};
}
