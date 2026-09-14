from pathlib import Path
root=Path(__file__).resolve().parents[2];p=root/'src/main.js';s=p.read_text()
s=s.replace(' item.level=summonLevel439(save.state,"equipment");\n if(deep)', ' if(deep)',1)
a=s.index('function openGachaCountPicker(');b=s.index('function performGachaBatch(',a)
s=s[:a]+'''function openGachaCountPicker(mode,campaignId="standard"){
 const campaigns=currentGachaCampaigns(),campaign=campaigns.find(entry=>entry.id===campaignId)??campaigns[0],label=mode==="monster"?"モンスター召喚":mode==="equipment"?"装備召喚":campaign.title;
 const counts=[1,10,20,30,50,100],maximum=maxSummons439(save.state,mode,n=>gachaCost(n,campaignId),MONSTER_STORAGE_CAP);
 app.insertAdjacentHTML("beforeend",Modal(label,`<div class="gacha-count-picker">
  <div class="gacha-count-copy"><small>${campaign.badge}</small><h3>${campaign.title}</h3><p>${campaign.copy}</p></div>
  ${mode==="gold"?"":paidGachaPityMarkup()}
  <div class="gacha-count-grid">${counts.map(count=>`<button type="button" data-gacha-count="${count}" class="summon-pull436" ${count>maximum?'disabled':''}><img class="summon-button-art436" src="./assets/ui/build436/summon-button.webp" alt="" aria-hidden="true"><b><em>${count}</em>回召喚</b><small>${pixelIcon("crystal")} ${gachaCost(count,campaignId)}</small></button>`).join("")}</div>
  <label class="gacha-custom-count"><span>その他の回数（${maximum?`1〜${maximum}`:'現在0'}回）</span><input id="gachaCustomCount" type="number" inputmode="numeric" min="1" max="${maximum}" step="1" value="${Math.min(15,maximum)}" ${maximum?'':'disabled'}><button type="button" data-gacha-custom ${maximum?'':'disabled'}>この回数で召喚</button></label>
  <small data-gacha-custom-cost439 aria-live="polite"></small>
  <small>所持 ${pixelIcon("crystal")} ${save.state.player.crystals} / ${mode==='gold'?'':`10連ごとの最後の枠にレア保証を適用<br>排出Lv：${mode==='equipment'?`装備 1〜${summonLevelMax439(save.state,'equipment')}`:mode==='monster'?`魔物 1〜${summonLevelMax439(save.state)}`:`魔物 1〜${summonLevelMax439(save.state)}・装備 1〜${summonLevelMax439(save.state,'equipment')}`}`}</small>
 </div>`,"戻る"));
 const modal=topModal();modal.classList.add("gacha-count-modal");const input=modal.querySelector('#gachaCustomCount'),button=modal.querySelector('[data-gacha-custom]');
 const check=()=>{const max=maxSummons439(save.state,mode,n=>gachaCost(n,campaignId),MONSTER_STORAGE_CAP),count=validSummonCount439(input.value,max);input.max=max;button.disabled=count===null;modal.querySelector('[data-gacha-custom-cost439]').textContent=count===null?(max?`1〜${max}の整数を入力してください`:'魔晶石または所持枠が不足しています'):`必要 魔晶石 ${gachaCost(count,campaignId)}個`;};
 input.oninput=check;check();
 const run=count=>{if(!modal.isConnected)return;performGachaBatch(mode,count,{campaign:campaignId});if(modal.isConnected)check();};
 modal.querySelectorAll('[data-gacha-count]').forEach(button=>button.onclick=()=>run(button.dataset.gachaCount));button.onclick=()=>run(input.value);
 modal.querySelector('[data-modal-primary]').onclick=()=>modal.remove();
}
''' +s[b:]
s=s.replace('count=Math.max(1,Math.min(100,Number(count)||1));save.state.gacha??={};','''const freeCount={beginner:10,daily:1,tutorial:1}[campaign],maximum=freeCount??maxSummons439(save.state,mode,n=>gachaCost(n,campaign),MONSTER_STORAGE_CAP);
 count=validSummonCount439(count,maximum);if(count===null||freeCount&&count!==freeCount)return showToast(maximum?`現在は${maximum}回まで召喚できます。`:'魔晶石または所持枠が不足しています。');
 cost=gachaCost(count,campaign);save.state.gacha??={};''',1)
a=s.index(' save.state.player.crystals-=cost;if(campaign==="beginner")',s.index('function performGachaBatch'))
s=s[:a]+' const committed=chapterTwoCommit(()=>{\n'+s[a:]
b=s.index(' if(campaign==="beginner"){\n  const guide=',a)
s=s[:b]+''' return{ok:true,results};});if(!committed.ok)return;
 const results=committed.results;
''' +s[b:]
# Paginate result rendering, so 3000 owned monsters do not mean 3000 animated DOM sprites.
s=s.replace('container.hidden=false;container.innerHTML=results.map(row).join("");','''container.hidden=false;let resultPage=0;const draw=()=>{const start=resultPage*50;container.innerHTML=results.slice(start,start+50).map((r,i)=>row(r,start+i)).join('')+(results.length>50?`<nav class="summon-result-pages439"><button data-summon-page439="-1" ${resultPage===0?'disabled':''}>前へ</button><span>${resultPage+1} / ${Math.ceil(results.length/50)}</span><button data-summon-page439="1" ${(resultPage+1)*50>=results.length?'disabled':''}>次へ</button></nav>`:'');};container.onclick=e=>{const b=e.target.closest('[data-summon-page439]');if(!b||b.disabled)return;resultPage+=Number(b.dataset.summonPage439);draw();container.scrollIntoView({block:'start'});};draw();''',1)
s=s.replace('<em>${result.isNew?"新規":result.type==="equipment"?"重複":"獲得"}</em>', '<em>${result.isNew?"新規":result.type==="equipment"?"重複":"獲得"}${result.item?.level?`・Lv.${result.item.level}`:""}</em>')
p.write_text(s)
print('Dynamic cap, validated final pricing, atomic normal summons, paginated result list')
