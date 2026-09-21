import{assignColors499,color499,validColor499}from'./PartyColors499.js';
// Presentation metadata only: no random calls, timing, scoring or card data.
export function gameColors501(players=[],members=[],aiColors={}){
 const rows=players.map((p,i)=>({playerId:p.playerId,seat:p.seat??i,ai:!!p.ai,color499:validColor499(p.color499)?p.color499:members.find(m=>m.playerId===p.playerId)?.color499}));
 const fixedAI={...aiColors};for(const p of rows)if(p.ai&&validColor499(p.color499))fixedAI[p.seat]=p.color499;
 assignColors499(rows,fixedAI);return rows;
}
export function freezeColors501(players,members=[],aiColors={}){const rows=gameColors501(players,members,aiColors);players.forEach((p,i)=>{p.color499=rows[i].color499})}
export function ticketColor501(room,player){const i=room.members.findIndex(m=>m.playerId===player.playerId);return color499(i>=0?room.members[i].color499:player.color499,i>=0?i:player.seat??0)}
