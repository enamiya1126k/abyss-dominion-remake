export const STATUS_EFFECTS = Object.freeze({
  poison:{id:'poison',name:'毒',kind:'damageOverTime'},
  burn:{id:'burn',name:'炎上',kind:'damageOverTime'},
  freeze:{id:'freeze',name:'凍結',kind:'control'},
  shock:{id:'shock',name:'感電',kind:'control'},
  sleep:{id:'sleep',name:'睡眠',kind:'control'},
  atkUp:{id:'atkUp',name:'ATK上昇',kind:'buff'},
  defUp:{id:'defUp',name:'DEF上昇',kind:'buff'},
  spdUp:{id:'spdUp',name:'SPD上昇',kind:'buff'},
  barrier:{id:'barrier',name:'バリア',kind:'buff'},
  atkDown:{id:'atkDown',name:'ATK低下',kind:'debuff'},
  defDown:{id:'defDown',name:'DEF低下',kind:'debuff'},
  spdDown:{id:'spdDown',name:'SPD低下',kind:'debuff'}
});
