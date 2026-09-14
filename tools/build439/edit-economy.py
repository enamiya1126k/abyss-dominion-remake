from pathlib import Path
root=Path(__file__).resolve().parents[2]
def edit(name,changes):
 p=root/name;s=p.read_text()
 for old,new in changes:
  assert old in s,(name,old[:160]);s=s.replace(old,new)
 p.write_text(s)
edit('src/core/FloorBossChallengeSystem.js',[
 ('export const FLOOR_BOSS_CONTRACT_COST=50;',"import {exchangeKeys439} from './ExchangeCosts439.js';\nexport const FLOOR_BOSS_CONTRACT_COST=50;"),
 ('return{boss,unlocked:',"return{...exchangeKeys439(state,'floor'),boss,unlocked:"),
 ('challenge.fragments[bossId]=status.fragments-cost;',"if(!status.keysEnough)return{ok:false,message:`深淵の鍵が不足しています（${status.availableKeys}/${status.keyCost}）`};\n state.inventory.abyssKeys=status.availableKeys-status.keyCost;challenge.fragments[bossId]=status.fragments-cost;"),
 ('return{ok:true,boss:status.boss,reward,piece,cost,','return{ok:true,boss:status.boss,reward,piece,cost,keyCost:status.keyCost,')])
edit('src/core/EndgameSystem.js',[
 ('export function endgameContractStatus',"import {exchangeKeys439} from './ExchangeCosts439.js';\n\nexport function endgameContractStatus"),
 ('canContract=eligible&&!contracted&&availableFragments>=required;', 'keys=exchangeKeys439(state,boss?.faction),canContract=eligible&&!contracted&&availableFragments>=required&&keys.keysEnough;'),
 ('return{bossId:canonicalId,boss,eligible,contracted,canContract,','return{...keys,bossId:canonicalId,boss,eligible,contracted,canContract,'),
 ('`欠片が不足（${availableFragments}/${required}）`:null','`欠片が不足（${availableFragments}/${required}）`:!keys.keysEnough?`深淵の鍵が不足（${keys.availableKeys}/${keys.keyCost}）`:null'),
 ('e.fragments[bossId]=before-status.required;','state.inventory.abyssKeys=status.availableKeys-status.keyCost;e.fragments[bossId]=before-status.required;'),
 ('success:true,spent:status.required','success:true,spent:status.required,keyCost:status.keyCost'),
 ('crafted=e.craftCounts[bossId]??0;return{bossId,count,crafted,required:fragmentRequirement(crafted),canCraft:count>=fragmentRequirement(crafted)}','crafted=e.craftCounts[bossId]??0,keys=exchangeKeys439(state,ENDGAME_BOSSES[bossId]?.faction);return{...keys,bossId,count,crafted,required:fragmentRequirement(crafted),canCraft:count>=fragmentRequirement(crafted)&&keys.keysEnough}'),
 ('message:`欠片が不足しています（${status.count}/${status.required}）`','message:status.count<status.required?`欠片が不足しています（${status.count}/${status.required}）`:`深淵の鍵が不足しています（${status.availableKeys}/${status.keyCost}）`'),
 ('e.fragments[canonicalId]-=status.required;','state.inventory.abyssKeys=status.availableKeys-status.keyCost;e.fragments[canonicalId]-=status.required;'),
 ('ok:true,item,spent:status.required,boss,gearIndex','ok:true,item,spent:status.required,keyCost:status.keyCost,boss,gearIndex')])
edit('src/main.js',[
 ("import {ROLE_GUIDE436", "import {summonLevel439,summonLevelMax439,maxSummons439,validSummonCount439} from './core/SummonLimits439.js';\nimport {captureTrainingOffer439,trainWithCapture439} from './core/CaptureTraining439.js';\nimport {ROLE_GUIDE436"),
 ('nickname:SPECIES[speciesId].name,obtainedMethod:deep?', 'nickname:SPECIES[speciesId].name,level:summonLevel439(save.state),obtainedMethod:deep?'),
 ('nickname:boss.name,title:boss.title,rank:4,attribute:', 'nickname:boss.name,title:boss.title,level:summonLevel439(save.state),rank:4,attribute:'),
 ('if(deep){item.summonTier=', 'item.level=summonLevel439(save.state,"equipment");\n if(deep){item.summonTier='),
 ('receiveEquipment(save.state,item);save.state.codex.equipment[item.name]', 'item.level=summonLevel439(save.state,"equipment");receiveEquipment(save.state,item);save.state.codex.equipment[item.name]'),
 ('renderCombatPowerRecordModal(modal,"own");modal._onDismiss=close;', 'renderCombatPowerRecordModal(modal,"ranking");requestPowerRankings({force:Boolean(powerRankingUi.state)});modal._onDismiss=close;'),
 ('${claimed||status.fragments<cost?"disabled":""}', '${claimed||status.fragments<cost||!status.keysEnough?"disabled":""}'),
 ('${claimed?"契約済み":`欠片 ${cost}個`}', '${claimed?"契約済み":`欠片 ${cost}個 ＋ 深淵の鍵 ${status.keyCost}個`}'),
 ('<small>討伐 ${status.victories}回・初勝利10個／再勝利2～5個</small>', '<small>深淵の鍵 所持 ${status.availableKeys}個・討伐 ${status.victories}回</small>'),
 ('<b>${cost}個</b> 消費します。</p><small>所持 ${status.fragments}個 → ${Math.max(0,status.fragments-cost)}個</small>', '<b>${cost}個</b> と深淵の鍵 <b>${status.keyCost}個</b> を消費します。</p><small>欠片 ${status.fragments} → ${Math.max(0,status.fragments-cost)} ／ 鍵 ${status.availableKeys} → ${Math.max(0,status.availableKeys-status.keyCost)}</small>'),
 ('${contract.contracted?"人物契約済み":contract.canContract?`人物を呼び出す　−${contract.required}`:`人物契約 ${count}/${contract.required}`}', '${contract.contracted?"人物契約済み":`人物契約　欠片 ${contract.required} ＋ 鍵 ${contract.keyCost}`}'),
 ('${gear.canCraft?`専用装備を顕現　−${gear.required}`:`神装 ${count}/${gear.required}`}', '${`神装顕現　欠片 ${gear.required} ＋ 鍵 ${gear.keyCost}`}'),
 ('人物との契約、または6部位の専用装備顕現を選択できます。', '人物契約・専用装備顕現には、欠片と深淵の鍵が必要です。鍵 所持 ${Math.floor(Number(save.state.inventory.abyssKeys)||0)}個。'),
 ('欠片${result.spent}個を代償に、', '欠片${result.spent}個と深淵の鍵${result.keyCost}個を代償に、'),
 ('<b>欠片 ${result.spent}個を消費</b>', '<b>欠片 ${result.spent}個 ＋ 深淵の鍵 ${result.keyCost}個を消費</b>')])
# Each exchange commits all resource costs, inventory grants and save together.
p=root/'src/main.js';s=p.read_text()
start=s.index(' const result=attemptEndgameContract',s.index('function contractEndgameCharacter'))
end=s.index('closeTopModal();audio.sfx',start)
s=s[:start]+''' const level=Math.max(999,Math.min(ENDGAME_MAX_LEVEL,save.state.player.maxFloor||999));
 const result=chapterTwoCommit(()=>{const result=attemptEndgameContract(save.state,bossId,save.state.player.maxFloor);if(!result.success)return{...result,ok:false,message:result.reason};
 const monster=createContractedEndgameMonster(result.boss,bossId,level,save.state.player.maxFloor);
 save.state.monsters.push(monster);save.state.codex.encounters[monster.speciesId]=(save.state.codex.encounters[monster.speciesId]??0)+1;save.state.codex.captures[monster.speciesId]=(save.state.codex.captures[monster.speciesId]??0)+1;return{...result,ok:true};});
 if(!result.ok)return showToast(result.message??'契約を保存できませんでした。');''' +s[end:]
start=s.index(' const result=craftEndgameEquipment',s.index('function craftEndgameGear'))
end=s.index('closeTopModal();',start)
s=s[:start]+''' const result=chapterTwoCommit(()=>{const result=craftEndgameEquipment(save.state,bossId);if(!result.ok)return result;const received=receiveEquipment(save.state,result.item,{bossReward:true});if(received?.ok===false)return received;return{...result,received};});if(!result.ok)return showToast(result.message??'交換を保存できませんでした。');
 const received=result.received;''' +s[end:]
start=s.index('const result=spendFloorBossFragments',s.index('function confirmFloorBossExchange'))
end=s.index('modal.remove();showToast',start)
s=s[:start]+'''if(!modal.isConnected)return;const result=chapterTwoCommit(()=>{const result=spendFloorBossFragments(save.state,bossId,reward);if(!result.ok)return result;
 if(reward==="monster"){const obtained=createContractedFloorBoss(result.boss);save.state.monsters.push(obtained);save.state.codex.encounters[obtained.speciesId]=(save.state.codex.encounters[obtained.speciesId]??0)+1;save.state.codex.captures[obtained.speciesId]=(save.state.codex.captures[obtained.speciesId]??0)+1;}
 else{const obtained=dedicatedFloorBossEquipment(result.boss.floor,{floorBossCatalogId:result.boss.id},reward);if(!obtained)throw Error('equipment-design-missing');const received=receiveEquipment(save.state,obtained,{bossReward:true});if(received?.ok===false)return received;}return result;});if(!result.ok)return showToast(result.message??'交換を保存できませんでした。');''' +s[end:]
p.write_text(s)
edit('src/chapterTwo/ChapterTwoGacha397.js',[("export const CHAPTER_TWO_GACHA_RATES397", "import {summonLevel439} from '../core/SummonLimits439.js';\nexport const CHAPTER_TWO_GACHA_RATES397"),("nickname:species.name,obtainedMethod:'chapterTwoSummmon'",'') ] if False else [("export const CHAPTER_TWO_GACHA_RATES397", "import {summonLevel439} from '../core/SummonLimits439.js';\nexport const CHAPTER_TWO_GACHA_RATES397"),("nickname:species.name,obtainedMethod:'chapterTwoSummon'", "nickname:species.name,level:summonLevel439(state,'monster',random),obtainedMethod:'chapterTwoSummon'")])
print('Updated exchange costs, atomic grants, summon levels, ranking entry')
