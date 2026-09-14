from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'src/ui/RoleGuide436.js';s=p.read_text().replace("const availability=r=>r.equipped?2:r.learned?1:0;","const availability=r=>r.learned?1:0;")
s=s.replace("${entry.matches.length>1?`（${entry.matches.length}スキル）`:''}","${entry.matches.length>1?`（${entry.matches.length}スキル）`:''}")
s=s.replace('<button type="button" data-role-detail436=', '''${entry.matches.length>1?`<small class="role-other-skills439">${entry.matches.slice(1).map(x=>`${esc(x.skill.name)}〈${readiness(x)}〉`).join(' ／ ')}</small>`:''}${r.learned&&!r.equipped?'<small class="role-needs-setting439">使うにはスキル設定が必要です</small>':''}<button type="button" data-role-detail436=''')
s=s.replace('export function roleDetail436(entry,role){','export function roleDetail436(entry,role,{editable=false}={}){')
s=s.replace('</aside></section>`).join', '''</aside>${editable&&r.learned&&!r.equipped?`<button type="button" data-role-equip439="${esc(r.skill.id)}">このスキルを設定</button>`:''}</section>`).join''')
p.write_text(s)
p=root/'src/main.js';s=p.read_text();a=s.index('function openRoleGuide436(){');b=s.index('function bindFormation(){',a)
s=s[:a]+'''function openRoleGuide436(){
 let roster=roleRoster436(save.state),role='healDown',page=0,candidates=[];
 app.insertAdjacentHTML('beforeend',Modal('役割から仲間を探す',roleGuideShell436(),'編成へ戻る'));
 const modal=topModal();modal.classList.add('role-guide-modal436');
 const select=modal.querySelector('[data-role-select436]'),query=modal.querySelector('[data-role-query436]'),learned=modal.querySelector('[data-role-learned436]'),results=modal.querySelector('[data-role-results436]'),pages=modal.querySelector('[data-role-pages436]');
 const editable=()=>formationOrigin!=='explore'&&!save.state.player.inRun&&!save.state.activeBattle&&!battle;
 const redraw=()=>{
  roster=roleRoster436(save.state);role=select.value;candidates=roleCandidates436(roster,role,{query:query.value,learnedOnly:learned.checked});page=Math.min(page,Math.max(0,Math.ceil(candidates.length/8)-1));
  modal.querySelector('[data-role-hint436]').textContent=ROLE_GUIDE436.find(r=>r.id===role).hint;
  modal.querySelector('[data-role-count436]').textContent=`候補 ${candidates.length}体・習得済み（未設定を含む）→ 未習得の順`;
  results.innerHTML=candidates.length?candidates.slice(page*8,page*8+8).map(r=>roleResult436(r,role)).join(''):'<p class="role-empty436">条件に合う所持キャラがいません。別の役割を選ぶか、絞り込みを外してみよう。</p>';
  const count=Math.ceil(candidates.length/8);pages.innerHTML=count>1?`<button type="button" data-role-page436="-1" ${page===0?'disabled':''}>前へ</button><span>${page+1} / ${count}</span><button type="button" data-role-page436="1" ${page===count-1?'disabled':''}>次へ</button>`:'';
 };
 select.onchange=query.oninput=learned.onchange=()=>{page=0;redraw();};
 pages.onclick=e=>{const button=e.target.closest('[data-role-page436]');if(!button||button.disabled)return;page+=Number(button.dataset.rolePage436);redraw();results.scrollIntoView({block:'start'});};
 const showDetail=id=>{
  const entry=roleCandidates436(roleRoster436(save.state),role).find(r=>r.monster.id===id);if(!entry)return;
  app.insertAdjacentHTML('beforeend',Modal(escapeGuide436(entry.name),roleDetail436(entry,role,{editable:editable()})+(editable()?`<div class="role-actions439"><button type="button" data-role-party439 ${entry.inParty?'disabled':''}>${entry.inParty?'編成中':'編成に入れる'}</button><button type="button" data-role-open-character436>キャラ詳細へ</button></div>`:''),'候補へ戻る'));
  const detail=topModal();detail.classList.add('role-guide-modal436');const refresh=()=>{detail.remove();redraw();showDetail(id);};detail.querySelector('[data-modal-primary]').onclick=()=>{detail.remove();redraw();};
  detail.querySelectorAll('[data-role-equip439]').forEach(button=>button.onclick=()=>{
   if(!editable())return showToast('探索・戦闘を終えてから設定できます。');
   const skillId=button.dataset.roleEquip439,owner=save.state.monsters.find(m=>m.id===id);if(!owner)return;
   app.insertAdjacentHTML('beforeend',Modal('設定するSLOTを選択',`<div class="role-slot-choices439">${Array.from({length:4},(_,i)=>`<button type="button" data-role-slot439="${i}"><b>SLOT ${i+1}</b><span>${escapeGuide436(skillById(owner.equippedSkills?.[i])?.name??'空きスロット')}</span></button>`).join('')}</div><p>選んだ枠のスキルを置き換えます。</p>`,'戻る'));
   const picker=topModal();picker.querySelector('[data-modal-primary]').onclick=()=>picker.remove();picker.querySelectorAll('[data-role-slot439]').forEach(b=>b.onclick=()=>{
    if(!picker.isConnected||!editable())return;
    const result=chapterTwoCommit(()=>{const m=save.state.monsters.find(m=>m.id===id);return{ok:Boolean(m&&equipSkill(m,skillId,Number(b.dataset.roleSlot439)))};});
    if(!result.ok)return;picker.remove();refresh();showToast('スキルを設定しました');
   });
  });
  detail.querySelector('[data-role-party439]')?.addEventListener('click',()=>{
   if(!editable())return showToast('探索・戦闘を終えてから編成できます。');
   const add=outgoing=>{if(!editable()||!detail.isConnected)return;const result=chapterTwoCommit(()=>{
    if(!save.state.monsters.some(m=>m.id===id)||save.state.party.includes(id))return{ok:false};
    if(outgoing)return{ok:replacePartyMember(outgoing,id,false,{persist:false})};
    if(save.state.party.length>=4)return{ok:false};save.state.party.push(id);delete save.state.player.homePartySlots;return{ok:true};});
    if(result.ok){document.querySelector('[data-role-replace-picker439]')?.remove();refresh();showToast('編成に加えました');}};
   if(save.state.party.length<4)return add();
   app.insertAdjacentHTML('beforeend',Modal('交代する仲間を選択',`<div class="role-slot-choices439">${save.state.party.map((mid,i)=>{const m=save.state.monsters.find(m=>m.id===mid);return`<button type="button" data-role-replace439="${escapeGuide436(mid)}"><b>${i+1}</b><span>${escapeGuide436(m?displayName(m):'仲間')}</span></button>`;}).join('')}</div><p>外れる仲間の装備・魔法陣は所持品へ戻ります。</p>`,'戻る'));
   const picker=topModal();picker.dataset.roleReplacePicker439='1';picker.querySelector('[data-modal-primary]').onclick=()=>picker.remove();picker.querySelectorAll('[data-role-replace439]').forEach(b=>b.onclick=()=>{if(picker.isConnected)add(b.dataset.roleReplace439);});
  });
  detail.querySelector('[data-role-open-character436]')?.addEventListener('click',()=>{detail.remove();modal.remove();detailNavigationOrigin='formation';selected=id;go('detail');});
 };
 results.onclick=e=>{const button=e.target.closest('[data-role-detail436]');if(button)showDetail(button.dataset.roleDetail436);};
 modal.querySelector('[data-modal-primary]').onclick=()=>{modal.remove();render();};redraw();
}
''' +s[b:]
s=s.replace('function replacePartyMember(outgoingId,incomingId,inherit=false){','function replacePartyMember(outgoingId,incomingId,inherit=false,{persist=true}={}){')
a=s.index('function replacePartyMember(');b=s.index('\n}',a)
section=s[a:b];assert ' save.save();' in section;section=section.replace(' save.save();',' if(persist)save.save();');s=s[:a]+section+s[b:]
a=s.index('function bindDetail(m){');s=s[:a]+'''function openCaptureTraining439(monsterId,kind='affection'){
 const owner=save.state.monsters.find(m=>m.id===monsterId);if(!owner)return;
 const skills=allLearnedSkills(owner);app.insertAdjacentHTML('beforeend',Modal('捕獲結晶で育成',`<div class="capture-training439"><strong>${escapeGuide436(displayName(owner))}</strong><nav><button type="button" data-training-kind439="affection">なつき度</button><button type="button" data-training-kind439="skill">スキル経験値</button></nav><label data-training-skill-label439>育成するスキル<select data-training-skill439>${skills.map(s=>`<option value="${escapeGuide436(s.id)}">${escapeGuide436(s.name)}</option>`).join('')}</select></label><p data-training-status439></p><p data-training-cost439></p><small>捕獲結晶5個につき＋1。1回最大＋20、上限までの分だけ消費します。</small></div>`,'育成する'));
 const modal=topModal();modal.classList.add('capture-training-modal439');const choice=modal.querySelector('[data-training-skill439]'),primary=modal.querySelector('[data-modal-primary]');
 const draw=()=>{const current=save.state.monsters.find(m=>m.id===monsterId),offer=captureTrainingOffer439(save.state,monsterId,kind,choice.value);modal.querySelector('[data-training-skill-label439]').hidden=kind!=='skill';modal.querySelectorAll('[data-training-kind439]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.trainingKind439===kind)));
  modal.querySelector('[data-training-status439]').textContent=kind==='affection'?`なつき度 ${current?.affection??current?.bond??0}/1000${offer.amount?` → ${Math.min(1000,(Number(current?.affection??current?.bond)||0)+offer.amount)}/1000`:''}`:offer.progress?`熟練Lv.${offer.progress.level}・EXP ${offer.progress.exp}/${offer.progress.need} → EXP＋${offer.amount}`:offer.complete?'熟練度 MAX':offer.message;
  modal.querySelector('[data-training-cost439]').textContent=`所持 捕獲結晶 ${Math.floor(Number(save.state.inventory.captureCrystals)||0)}個${offer.cost?` ／ 消費 ${offer.cost}個`:''}${offer.message?`・${offer.message}`:''}`;primary.disabled=!offer.ok;primary.textContent=offer.ok?`結晶${offer.cost}個で${kind==='affection'?'なつき度':'スキルEXP'}＋${offer.amount}`:offer.complete?'育成上限':'育成できません';};
 modal.querySelectorAll('[data-training-kind439]').forEach(b=>b.onclick=()=>{kind=b.dataset.trainingKind439;draw();});choice.onchange=draw;
 primary.onclick=()=>{if(!modal.isConnected)return;const result=chapterTwoCommit(()=>trainWithCapture439(save.state,monsterId,kind,choice.value));if(!result.ok){if(result.message)showToast(result.message);draw();return;}showToast(`${kind==='affection'?'なつき度':'スキル経験値'}＋${result.amount}`);draw();};
 modal._onDismiss=()=>{modal.remove();render();};modal.querySelector('[data-modal-dismiss]').onclick=modal._onDismiss;draw();
}
''' +s[a:]
s=s.replace('function bindDetail(m){','function bindDetail(m){document.querySelector("[data-capture-training439]")?.addEventListener("click",()=>openCaptureTraining439(m.id));',1)
p.write_text(s)
p=root/'src/ui/screens/MonsterDetailScreen.js';s=p.read_text().replace('sourceLabel(method){','sourceLabel(method){').replace('capture:"探索・捕獲",summon:"召喚",','capture:"探索・捕獲",chapterTwoSummon:"第二章召喚",guerrillaGacha:"曜日限定召喚",floorBossContract:"階層ボス・欠片交換",summon:"召喚",')
s=s.replace('${aff}/1000${aff>=1000?"・親友":""}</b></div>', '${aff}/1000${aff>=1000?"・親友":""}<button type="button" data-capture-training439>結晶で育成</button></b></div>')
p.write_text(s)
print('Role settings/formation and compact crystal training entry connected')
