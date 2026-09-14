window.qa441={
 home(){qa440.home();},
 lobby(){qa435.lobby(0);const rows=['えなみの冒険部隊','プレイヤー名：より','絶対に勝ちたいひで'].map((name,i)=>({rank:i+1,name,playerId:i?'p'+i:'AD-QA435',damage:[14550631,8240982,3219653][i],attempts:3,portrait439:{speciesId:['myth_enami','myth_yori','myth_hide'][i]}}));document.querySelector('.raid-lobby-ranking441').innerHTML=rows.map(r=>worldRaidRankingCard441(r,{playerId:'AD-QA435'})).join('');},
 circles(){qa440.reset();const m=save.state.monsters.find(m=>save.state.party.includes(m.id));save.state.player.gold=56171790;for(const c of MAGIC_CIRCLES.filter(c=>c.asset.includes('build441'))){qaCircle438(save.state,c.id,{level:5});}qaEquipCircle438(save.state,m,'ch2_chain394');openMagicCircleWorkshop(m.id);document.querySelector('[data-circle-row405="ch2_chain394"]').scrollIntoView({block:'start'});},
 battle(){qa435.raid(false,false);},
 effect(element='fire',magic=true,critical=true){const target=document.querySelector('.battle-arena .enemy-card,.battle-arena [id^="enemy-"]');return playBattleEffect441(target,{element,magic,critical,ultimate:magic,circle:'./assets/magic-circles/build441/ch2_hex398.webp'});},
 get state(){return save.state;}
};window.ready441=true;
