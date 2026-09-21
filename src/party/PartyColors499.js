// Only these four identifiers cross the network. Never accept CSS from a client.
export const PARTY_COLORS499=Object.freeze([
 Object.freeze({id:'blue',name:'ブルー',hex:'#78cfff',tint:'#258bd9'}),
 Object.freeze({id:'green',name:'グリーン',hex:'#91e3b0',tint:'#269e59'}),
 Object.freeze({id:'pink',name:'ピンク',hex:'#f5a1cb',tint:'#d64b95'}),
 Object.freeze({id:'orange',name:'オレンジ',hex:'#ffb376',tint:'#e87827'})
]);
export const validColor499=id=>typeof id==='string'&&PARTY_COLORS499.some(c=>c.id===id);
export function color499(id,seat=0){return PARTY_COLORS499.find(c=>c.id===id)??PARTY_COLORS499[(Number.isInteger(seat)?Math.max(0,seat):0)%4]}
export const playerColor499=p=>color499(p?.color499,p?.seat??0);
export function assignColors499(players){
 const used=new Set();
 for(const p of players.filter(p=>!p.ai)){p.color499=color499(p.color499,p.seat).id;used.add(p.color499)}
 for(const p of players.filter(p=>p.ai)){p.color499=(PARTY_COLORS499.find(c=>!used.has(c.id))??color499(null,p.seat)).id;used.add(p.color499)}
}
export function seatColors499(players=[]){return Array.from({length:4},(_,seat)=>color499(players.find(p=>p.seat===seat)?.color499,seat).hex)}
