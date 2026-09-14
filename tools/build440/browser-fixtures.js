let storyArchiveModel=null;
window.qa440={
 reset(){qa439.reset();screen='home';},
 skills(){this.reset();const m=createMonster('clockwork',{endgameBossId:'ten_time',endgameFaction:'tenGod',level:4000,allowEndgameLevel:true});save.state.monsters.push(m);skillTarget=m.id;screen='skills';render=()=>{app.innerHTML=SkillScreen(save.state,skillTarget);bindSkills();};render();},
 home(){this.reset();app.innerHTML=HomeScreen(save.state,{serverStatus:homeServerStatus});},
 attributes(){this.reset();openAttributeHelp();},
 settings(){this.reset();save.state.campaign100.finalCompleted=true;app.innerHTML=SettingsScreen(save.state,{playerName:'ゲームマスターお試しプレイ用'});},
 altar(){this.reset();save.state.gacha.firstTenUsed=true;openGacha();},
 contract(){this.reset();openPermanentSignatureGacha();},
 experience(){this.reset();openWeekdayGachaPicker('experience');},
 memory(kind='hub'){this.reset();save.state.campaign100.finalCompleted=true;save.state.chapterTwo376={unlocked:true,started:true,introComplete:true,areaClears378:{4:1}};save.state.recentBattleMemory={recordedFloor:100,entries:['zombie','harpy','lizardman','slime'].filter(id=>SPECIES[id]).map(speciesId=>({speciesId,level:1000,equipped:true}))};if(kind==='battle')openBattleMemory();else openMemoryArchiveHub();},
 archive(category='prologue'){this.reset();save.state.campaign100.finalCompleted=true;save.state.chapterTwo376={unlocked:true,started:true,introComplete:true,areaClears378:{0:1,1:1,2:1,3:1,4:1}};storyArchiveModel=createStoryArchiveModel401(save.state);storyArchiveModel.categories.forEach(c=>{c.entries.forEach(e=>e.available=true);c.read=c.entries.length;});storyArchiveCategory=category;render=()=>{app.innerHTML=StoryArchiveScreen(storyArchiveModel,{category:storyArchiveCategory});bindStoryArchive();};render();}
};window.ready440=true;
