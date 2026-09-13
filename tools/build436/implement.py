from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'src/main.js';s=p.read_text()
imports="""import {ROLE_GUIDE436,roleRoster436,roleCandidates436,roleGuideShell436,roleResult436,roleDetail436} from './ui/RoleGuide436.js';
import {escapeGuide436,motherSkillSummary436,skillReadingMs436,holdSkillBanner436} from './ui/SkillGuide436.js';
"""
s=imports+s
at='function bindFormation(){'
guide="""function openRoleGuide436(){
 const roster=roleRoster436(save.state);let role='healDown',page=0,candidates=[];
 app.insertAdjacentHTML('beforeend',Modal('役割から仲間を探す',roleGuideShell436(),'編成へ戻る'));
 const modal=topModal();modal.classList.add('role-guide-modal436');
 const select=modal.querySelector('[data-role-select436]'),query=modal.querySelector('[data-role-query436]'),learned=modal.querySelector('[data-role-learned436]'),results=modal.querySelector('[data-role-results436]'),pages=modal.querySelector('[data-role-pages436]');
 const redraw=()=>{
  role=select.value;candidates=roleCandidates436(roster,role,{query:query.value,learnedOnly:learned.checked});page=Math.min(page,Math.max(0,Math.ceil(candidates.length/8)-1));
  modal.querySelector('[data-role-hint436]').textContent=ROLE_GUIDE436.find(r=>r.id===role).hint;
  modal.querySelector('[data-role-count436]').textContent=`候補 ${candidates.length}体・設定中 → 習得済み → 未習得の順`;
  results.innerHTML=candidates.length?candidates.slice(page*8,page*8+8).map(r=>roleResult436(r,role)).join(''):'<p class="role-empty436">条件に合う所持キャラがいません。別の役割を選ぶか、名前・習得済みの絞り込みを外してみよう。</p>';
  const count=Math.ceil(candidates.length/8);pages.innerHTML=count>1?`<button type="button" data-role-page436="-1" ${page===0?'disabled':''}>前へ</button><span>${page+1} / ${count}</span><button type="button" data-role-page436="1" ${page===count-1?'disabled':''}>次へ</button>`:'';
 };
 select.onchange=query.oninput=learned.onchange=()=>{page=0;redraw();};
 pages.onclick=e=>{const button=e.target.closest('[data-role-page436]');if(!button||button.disabled)return;page+=Number(button.dataset.rolePage436);redraw();results.scrollIntoView({block:'start'});};
 results.onclick=e=>{
  const button=e.target.closest('[data-role-detail436]'),entry=button&&candidates.find(r=>r.monster.id===button.dataset.roleDetail436);if(!entry)return;
  const canNavigate=formationOrigin!=='explore'&&!save.state.player.inRun;
  app.insertAdjacentHTML('beforeend',Modal(escapeGuide436(entry.name),roleDetail436(entry,role)+(canNavigate?'<button type="button" data-role-open-character436>キャラ詳細へ</button>':''),'候補へ戻る'));
  const detail=topModal();detail.classList.add('role-guide-modal436');detail.querySelector('[data-modal-primary]').onclick=()=>detail.remove();
  detail.querySelector('[data-role-open-character436]')?.addEventListener('click',()=>{detail.remove();modal.remove();detailNavigationOrigin='formation';selected=entry.monster.id;go('detail');});
 };
 modal.querySelector('[data-modal-primary]').onclick=()=>modal.remove();redraw();
}
"""
assert at in s;s=s.replace(at,guide+at+"\n document.querySelector('[data-role-guide436]')?.addEventListener('click',openRoleGuide436);",1)
s=s.replace('async function battleBanner(title,subtitle="",type="normal",duration=700,source=null){','async function battleBanner(title,subtitle="",type="normal",duration=700,source=null,detail436=""){')
needle=' const kind=String(type),minimum='
block=""" if(detail436){
  const owner=battle;el.classList.add('readable-skill436');const description=document.createElement('p');description.className='skill-description436';description.textContent=detail436;el.querySelector('.battle-banner-copy').appendChild(description);
  await holdSkillBanner436(el,{getArena:()=>document.querySelector('.battle-arena'),isCurrent:()=>battle===owner&&!owner?.resultSettled,duration:skillReadingMs436(detail436,battleSpeed())});return;
 }
"""
assert needle in s;s=s.replace(needle,block+needle,1)
old='e.faction==="tenGod"?"boss":"skill",720,e);battleFlash'
new='e.faction==="tenGod"?"boss":"skill",720,e,battle?.specialBattleType===\'mother422\'?motherSkillSummary436(info):\'\');battleFlash'
assert old in s;s=s.replace(old,new,1)
# Existing counts, costs, guarantees and click handlers stay intact.
for attr in ['data-gacha-count','data-weekday-count','data-permanent-signature-count']:
 old=f'{attr}="${{count}}"><b>${{count}}連</b>'
 new=f'{attr}="${{count}}" class="summon-pull436"><img class="summon-button-art436" src="./assets/ui/build436/summon-button.webp" alt="" aria-hidden="true"><b><em>${{count}}</em>回召喚</b>'
 assert old in s,attr;s=s.replace(old,new)
p.write_text(s)
p=root/'src/ui/screens/FormationScreen.js';s=p.read_text();old='${preparationHelp415(party)}';assert old in s
s=s.replace(old,'<div class="role-guide-entry436"><button type="button" data-role-guide436>役割から仲間を探す</button></div>'+old);p.write_text(s)
p=root/'src/ui/ChapterTwoGacha397.js';s=p.read_text()
s=s.replace('<figcaption>${esc(SPECIES[id].name)}</figcaption>','<figcaption><small>【${esc(member.group)}】</small><b>${esc(chapterTwoPairMember406(id).short)}</b></figcaption>')
for count in [1,10]:
 old=f'<b>{count}回召喚</b>'
 new=f'<img class="summon-button-art436" src="./assets/ui/build436/summon-button.webp" alt="" aria-hidden="true"><b><em>{count}</em>回召喚</b>'
 assert old in s;s=s.replace(old,new)
p.write_text(s)
