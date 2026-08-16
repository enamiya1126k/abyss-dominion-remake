const DAY_NAMES=Object.freeze(["日","月","火","水","木","金","土"]);

function jstParts(date=new Date()){
 try{
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Tokyo",weekday:"short",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  const day={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[map.weekday];
  return{day:Number.isInteger(day)?day:0,key:`${map.year}-${map.month}-${map.day}`};
 }catch(_error){
  const shifted=new Date(date.getTime()+9*60*60*1000);
  return{day:shifted.getUTCDay(),key:shifted.toISOString().slice(0,10)};
 }
}

export function weekdayGachaSchedule(date=new Date()){
 const {day,key}=jstParts(date),name=DAY_NAMES[day];
 if(day===0)return{day,key,dayName:name,kind:"sunday",title:"深淵・十神 同時開催",copy:"深淵召喚と十神召喚をそれぞれ選べる日曜限定祭壇。",factions:["abyss","tenGod"]};
 if([1,3,5].includes(day))return{day,key,dayName:name,kind:"experience",title:"経験値パック召喚",copy:"育成用の経験値パックを獲得。月・水・金に開催。",factions:[]};
 return{day,key,dayName:name,kind:"signature",title:"専用装備召喚",copy:"所持しているLR以上の仲間の専用6部位を狙う。火・木・土に開催。",factions:[]};
}

export function weekdayGachaCost(kind,count=1){
 const amount=Math.max(1,Math.min(100,Math.floor(Number(count)||1))),single={experience:3,signature:18,abyss:150,tenGod:300}[kind]??5;
 return Math.ceil(single*amount*(amount>=10?.9:1));
}

export const WEEKDAY_GACHA_CALENDAR=Object.freeze([
 {days:"月・水・金",label:"経験値パック召喚"},
 {days:"火・木・土",label:"専用装備召喚"},
 {days:"日",label:"深淵召喚・十神召喚"}
]);
