import {SPECIES} from '../data/species.js';
import {endgameCharacter} from '../data/endgameCharacters.js';

const squad=(keys,circles,hint,roles=null)=>({keys:keys.split('/'),circles:circles.split('/'),hint,roles});
// Existing encounter IDs, level/reward budgets and saved clear flags remain the same.
export const CHAPTER_TWO_SQUADS397=Object.freeze({
 west:squad('balk/kororu/pipia','aegis/opening_rite/last_life','棘盾が胞子役を守り、灯りが回復する。毒を治し、コロルから倒そう。'),
 east:squad('grant/lilica/lumea','aegis/weak_critical/last_life','封印盾と夜露の回復が書刃を支える。浄化と強化解除を用意し、回復役を先に狙おう。'),
 heart:squad('ryune/rose/mirea/kororu','aegis/weak_critical/last_life/opening_rite','鏡刃の双子を薬灯が支える。毒を治し、双子の片方を先に倒して連撃を止めよう。'),
 vault0:squad('nevia/elmina/rithia/grant','opening_rite/weak_critical/last_life/aegis','白藤の双子が毒から追撃する。根灯の回復を止め、毒を解除してから双子を崩そう。'),
 a1_west:squad('mirea/viola/shelza/balk','last_life/opening_rite/weak_critical/aegis','薬毒の姉妹と玻璃蠍が毒を重ねる。毒の浄化と回復阻害で長期戦を断とう。'),
 a1_east:squad('kagura/sayo/miretta/grant','weak_critical/last_life/inheritance/aegis','狐巫女の炎を修繕役と盾が支える。火傷を治し、回復役から連携を崩そう。'),
 a1_heart:squad('abyss_gluttony/nevia/elmina/tillea','aegis/opening_rite/weak_critical/last_life','暴食が吸命で粘り、白藤の双子が毒から追撃する。回復阻害と毒の浄化を用意し、双子を分断しよう。'),
 vault1:squad('abyss_wrath/kagura/sayo/grant','crimson_threshold/weak_critical/last_life/aegis','憤怒の反撃を盾が支え、狐火の姉妹が追う。火傷を治し、反撃の構え中は護衛から狙おう。'),
 a2_west:squad('abyss_sloth/morina/elmize/tillea','opening_rite/deep_silence/weak_critical/last_life','怠惰が速度を奪い、夢刈りの双子が睡眠を追撃する。睡眠対策と速度低下の浄化が鍵。'),
 a2_east:squad('abyss_greed/meliora/elyselle/grant','death_drain/weak_critical/last_life/aegis','強欲と双鍵が加護を剥がす。強化を重ねすぎず、双鍵の片方を止めよう。'),
 a2_heart:squad('abyss_pride/noctelle/auriane/velg','opening_rite/crimson_threshold/last_life/aegis','傲慢の号令で薔薇の双子が加速する。号令を解除し、瀕死の双子を残さず一人ずつ倒そう。'),
 vault2:squad('abyss_lust/shion/suiren/velg','last_life/opening_rite/inheritance/aegis','色欲の分命回復と双符の浄化が長期戦を支える。回復阻害を使い、符の片方を集中して崩そう。'),
 a3_west:squad('ten_life/iselle/virelle/ione','last_life/opening_rite/weak_critical/aegis','生命が氷晶の双子を守る。凍結を治し、蘇生封印を使って回復の循環を断とう。'),
 a3_east:squad('ten_time/calista/solenne/rithia','opening_rite/weak_critical/aegis/last_life','時間の加速で双雷の連携が先手を取る。速度強化を解除し、感電を早めに治そう。'),
 a3_heart:squad('ten_divinity/aure/noelle/rostia','opening_rite/weak_critical/last_life/aegis','神格の全軍強化を双翼と黒盾が受ける。強化解除と回復阻害を用意して、片翼から崩そう。'),
 vault3:squad('ten_fate/dracia/rucie/clarisse','opening_rite/aegis/weak_critical/last_life','運命の必中会心が双竜の突破を支える。回避だけに頼らず、軽減と浄化を用意しよう。'),
 a4_west:squad('ten_dominion/eirene/iridelle/grant','opening_rite/deep_silence/last_life/aegis','支配と双刻が速度・命中を奪う。弱体を治し、双刻の片方を先に止めよう。'),
 a4_east:squad('ten_creation/lunaria/solaria/noctia','aegis/opening_rite/last_life/death_drain','創造の防壁と日月の魔力回復が粘る。強化解除と回復阻害で、防壁の張り直しを崩そう。'),
 a4_heart:squad('ten_end/sephira/astrelle/ione','crimson_threshold/opening_rite/last_life/aegis','終焉の炎上と双星の詠唱が長期戦ほど危険になる。火傷を治し、星門の共鳴前に双星を分断しよう。'),
 vault4:squad('ten_chaos/nemesia/everia/clarisse','opening_rite/weak_critical/last_life/aegis','混沌が加護を反転し、双冠が瀕死を狙う。弱体を治してHP35%以上を保ち、双冠を一人ずつ倒そう。'),
 roam1_1_elite393:squad('abyss_gluttony/nevia/elmina/tillea','aegis/opening_rite/weak_critical/last_life','暴食が前線を維持し、白藤の毒鎖が獲物を追う。毒の浄化と回復阻害を用意しよう。'),
 roam2_1_elite393:squad('abyss_lust/shion/suiren/velg','last_life/opening_rite/inheritance/aegis','色欲が双符の姉妹を回復する。回復阻害を重ね、姉妹の片方を集中して倒そう。'),
 roam2_4_elite393:squad('abyss_greed/meliora/elyselle/senela','death_drain/weak_critical/last_life/opening_rite','強欲と双鍵が強化を奪い、吸魔役が魔力を削る。強化頼みを避け、吸魔役か双鍵を先に止めよう。'),
 roam3_1_elite393:squad('ten_creation/dracia/rucie/noctia','last_life/aegis/weak_critical/opening_rite','創造の防壁を双竜が受け、霜鐘が妨害する。防壁を解除し、槍の妹を集中して止めよう。'),
 roam3_4_elite393:squad('ten_life/iselle/virelle/aure','last_life/opening_rite/weak_critical/aegis','生命が氷晶の双子を再生する。凍結の浄化と蘇生封印を用意し、双子を分断しよう。'),
 roam4_1_elite393:squad('ten_time/celes/lumina/iridelle','opening_rite/aegis/crimson_threshold/last_life','時間の加速で星律の双子が連携する。速度低下を治し、加速を解除して行動順を取り戻そう。'),
 roam4_4_elite393:squad('ten_fate/sephira/astrelle/solaria','opening_rite/aegis/last_life/inheritance','運命の会心が双星の共鳴を後押しする。必中への回避頼みを避け、3回目の星門までに片方を止めよう。')
});
const commanderRoles={abyss_gluttony:'guardian',abyss_wrath:'striker',abyss_sloth:'disruptor',abyss_greed:'disruptor',abyss_lust:'support',abyss_pride:'leader',ten_life:'support',ten_time:'disruptor',ten_divinity:'leader',ten_fate:'leader',ten_dominion:'disruptor',ten_creation:'support',ten_end:'striker',ten_chaos:'disruptor'};
export function installChapterTwoRoster397(encounters){
 for(const [id,plan]of Object.entries(CHAPTER_TWO_SQUADS397)){
  const old=encounters[id];if(!old)throw new Error(`Missing encounter ${id}`);
  const authorities=plan.keys.map(k=>endgameCharacter(k)?.id??null),species=plan.keys.map((k,i)=>authorities[i]?endgameCharacter(k).speciesId:`ch2_${k}`);
  if(species.some(id=>!SPECIES[id]))throw new Error(`Invalid roster ${id}`);
  encounters[id]={...old,species,authorities,roles:plan.keys.map((k,i)=>commanderRoles[k]??SPECIES[species[i]].tacticRole383),circles:[...plan.circles],hint:plan.hint,roster397:true,memberNames397:species.map((id,i)=>authorities[i]?endgameCharacter(authorities[i]).name:SPECIES[id].name),chapterTwoNative383:true};
 }
}
