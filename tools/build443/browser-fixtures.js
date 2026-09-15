window.qa443={
 circles(id='raid_vajra_beast'){
  qa440.reset();const m=save.state.monsters.find(m=>save.state.party.includes(m.id));save.state.player.gold=9999999999;
  for(const c of MAGIC_CIRCLES.filter(c=>c.id!=='none')){save.state.magicCircles.unlocked[c.id]=true;qaCircle438(save.state,c.id,{level:99});}
  qaEquipCircle438(save.state,m,id);openMagicCircleWorkshop(m.id);document.querySelector(`[data-circle-row405="${id}"]`).scrollIntoView({block:'center'});
 },
 async attack(){qa440.reset();const m={id:'smoke443',speciesId:'slime',magicCircleId:'ch2_chain394',attribute:'water'};battle={party:[m],enemies:[]};app.innerHTML='<section class="battle-arena"><div id="ally-smoke443"></div></section>';await animateAttack(m.id,{element:'ice',damageClass:'magic'});return !document.getElementById('ally-smoke443').classList.contains('fx-skill-lunge');}
};window.ready443=true;
