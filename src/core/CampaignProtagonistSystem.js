export const LIONEL_AVATAR_VERSION=1;
export const LIONEL_AVATAR_IDENTITY="lionel-avatar";
export const LIONEL_AVATAR_NAME="リオネル";

const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));

export function isLionelAvatar(monster){
 return Boolean(monster&&(monster.storyIdentity===LIONEL_AVATAR_IDENTITY||monster.storyCharacterId==="lionel"||monster.lionelAvatar===true));
}

export function applyLionelAvatarIdentity(monster,{rename=false}={}){
 if(!plainRecord(monster))return null;
 const currentName=String(monster.nickname??"").trim();
 monster.storyIdentity=LIONEL_AVATAR_IDENTITY;
 monster.storyCharacterId="lionel";
 monster.lionelAvatar=true;
 monster.storyProtected=true;
 monster.releaseProtected=true;
 monster.synthesisProtected=true;
 monster.title="預言者の仮身";
 monster.locked=true;
 if(rename||!currentName||currentName==="ぷるん")monster.nickname=LIONEL_AVATAR_NAME;
 monster.tags=[...new Set([...(Array.isArray(monster.tags)?monster.tags:[]),"story-protagonist","lionel-avatar","old-world-survivor"])];
 return monster;
}

function recordedAvatar(state){
 const id=state?.campaign100?.lionelAvatar?.monsterId??state?.campaign100?.lionelAvatarMonsterId;
 return id?(state.monsters??[]).find(monster=>monster?.id===id)??null:null;
}

function defaultStarterCandidate(state){
 return(state.monsters??[]).filter(monster=>monster?.speciesId==="slime"&&String(monster.nickname??"").trim()==="ぷるん").sort((left,right)=>(Date.parse(left?.obtainedAt??0)||0)-(Date.parse(right?.obtainedAt??0)||0))[0]??null;
}

export function normalizeLionelAvatarState(state,{createAvatar=null}={}){
 if(!plainRecord(state))return{monster:null,created:false,migrated:false};
 state.monsters=Array.isArray(state.monsters)?state.monsters:[];
 state.campaign100=plainRecord(state.campaign100)?state.campaign100:{};
 let monster=recordedAvatar(state)??state.monsters.find(isLionelAvatar)??defaultStarterCandidate(state),created=false;
 if(!monster&&typeof createAvatar==="function"){
  monster=createAvatar();
  if(monster){state.monsters.push(monster);created=true}
 }
 if(!monster)return{monster:null,created:false,migrated:false};
 const migrated=!isLionelAvatar(monster),rename=created||String(monster.nickname??"").trim()==="ぷるん";
 applyLionelAvatarIdentity(monster,{rename});
 state.campaign100.lionelAvatar={version:LIONEL_AVATAR_VERSION,monsterId:monster.id,storyCharacterId:"lionel",form:"slime",protected:true};
 state.campaign100.lionelAvatarMonsterId=monster.id;
 return{monster,created,migrated};
}

export function lionelAvatarProtectionReason(monster){
 return isLionelAvatar(monster)?"リオネルは物語の中心人物のため、逃す・合成素材にすることはできません。":"";
}
