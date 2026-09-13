// Display only. The server continues to charge a daily slot when reserving it.
const day435=now=>new Date(now+9*3600000).toISOString().slice(0,10);
export function raidQuota435(state,tickets,now=Date.now()){
 const day=day435(now),fresh=state?.day===day;
 const today=tickets.filter(e=>(e.ticket.day??day435(e.ticket.issuedAt))===day).length;
 return {fresh,today,older:tickets.length-today,remaining:Math.min(3,today+(fresh?Math.max(0,Number(state.remaining)||0):0))};
}
