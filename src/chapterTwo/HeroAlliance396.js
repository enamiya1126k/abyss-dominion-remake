import {chapterTwoUnlocked,CHAPTER_TWO_HERO_IDS396} from './ChapterTwoSystem.js?v=3.1.82-build402';
import {SPECIES} from '../data/species.js';

// Presentation reads the existing recruitment receipt; it never grants a reward.
export function heroAlliancePresentation396(state){
 const chapter=state?.chapterTwo376,receipt=chapter?.alliance380;
 if(!chapterTwoUnlocked(state)||!chapter?.introComplete||!receipt||typeof receipt!=='object'||Array.isArray(receipt)||receipt.presentationAcknowledged396===true)return null;
 return {
  retrospective:receipt.presentationVersion396!==1,
  members:CHAPTER_TWO_HERO_IDS396.map(speciesId=>({speciesId,name:SPECIES[speciesId].name,owned:(state.monsters??[]).some(m=>m.speciesId===speciesId)}))
 };
}

export function acknowledgeHeroAlliance396(state){
 if(!heroAlliancePresentation396(state))return{ok:false};
 state.chapterTwo376.alliance380.presentationAcknowledged396=true;
 return{ok:true};
}
