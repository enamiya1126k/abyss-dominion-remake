import {MOTHER_STORY_ENTRIES423,motherStoryRead423,motherStoryScene423} from '../primordial/Story422.js';
import {createCampaignStoryArchiveModel} from './CampaignStoryArchiveSystem.js?v=3.1.82-build402';
import {CAMPAIGN_STORY_CHARACTERS} from './CampaignStorySystem.js?v=3.1.42-build362';
import {chapterTwoStoryScene} from '../chapterTwo/ChapterTwoStory.js?v=3.1.58-build378';
import {CHAPTER_TWO_STORIES401,chapterTwoStarted401,chapterTwoStoryRead401} from '../chapterTwo/ChapterTwoProgress401.js?v=3.1.82-build402';

export function createChapterTwoArchive401(state){
 if(!chapterTwoStarted401(state))return null;
 const entries=CHAPTER_TWO_STORIES401.map((s,index)=>{
  const available=chapterTwoStoryRead401(state,s.kind);
  if(s.kind==='ending')s={...s,title:'理の中枢・帰還報告',subtitle:'第4節の結末・最終戦への序幕'};
  // Copy dialogue and cast so a viewer cannot edit shared story definitions.
  const scene=available?JSON.parse(JSON.stringify(chapterTwoStoryScene(s.kind,CAMPAIGN_STORY_CHARACTERS))):null;
  if(scene){scene.title=s.title;scene.replayTitle401='第二章・回想';}
  return {id:`chapter-two-${s.kind}`,type:'scene',title:s.title,subtitle:s.subtitle,sortKey:index,available,scenes:scene?[scene]:[]};
 });
 for(const entry of MOTHER_STORY_ENTRIES423){const available=motherStoryRead423(state,entry.kind);if(entry.kind==='defeat'&&!available)continue;const scene=available?motherStoryScene423(entry.kind,CAMPAIGN_STORY_CHARACTERS):null;entries.push({id:`chapter-two-mother-${entry.kind}`,type:'scene',title:entry.title,subtitle:entry.subtitle,sortKey:entries.length,available,scenes:scene?[JSON.parse(JSON.stringify(scene))]:[]});}
 return {id:'chapterTwo',label:'第二章',eyebrow:'CHAPTER II',entries,total:entries.length,read:entries.filter(e=>e.available).length};
}
export function createStoryArchiveModel401(state){
 const first=createCampaignStoryArchiveModel(state),second=createChapterTwoArchive401(state);
 if(!second)return first;
 return {...first,categories:[...first.categories,second],total:first.total+second.total,read:first.read+second.read};
}
