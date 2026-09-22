// Generated once on the server at game creation. A blind round never reads answer.
export function quizPlans519(deck,players,randomInt){
 const nextBlind=players.map(()=>1+randomInt(3));
 return deck.map((q,round)=>players.map((p,seat)=>{
  if(!p.ai)return[];
  const blind=round===nextBlind[seat];let final;
  if(blind){final=randomInt(2)===0;nextBlind[seat]=round+2+randomInt(3)}
  else final=randomInt(100)<[0,91,82,70][q.difficulty]?q.answer:!q.answer;
  const hesitate=randomInt(100)<32;
  return[{ms:1800+randomInt(4001),side:(hesitate?!final:final)?'o':'x',blind519:blind},...(hesitate?[{ms:7200+randomInt(2101),side:final?'o':'x',blind519:blind}]:[])];
 }));
}
