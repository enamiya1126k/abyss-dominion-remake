// Entrances traced against the existing 1600 x 3200 painted map. Shared rules/art metadata.
export const LANDMARKS469={
 '8':{x:935,y:205,name:'月影の神殿',kind:'gate',icon:'✧',tone:'gold',text:'必ず停止。覚醒能力がなければ獲得、あれば安全に1枚。さらに未所持の絵柄を1種獲得。',effects:[{type:'shrine469'},{type:'piece'}]},
 '31':{x:1390,y:948,name:'蒼晶の書庫',kind:'gate',icon:'✧',tone:'gold',text:'必ず停止。覚醒能力がなければ獲得、あれば安全に1枚。さらに未所持の絵柄を1種獲得。',effects:[{type:'shrine469'},{type:'piece'}]},
 '38':{x:402,y:970,name:'水晶の礼拝堂',kind:'cleanse',icon:'✺',tone:'green',text:'呪いをすべて解除して、安全に1枚引く。',effects:[{type:'cleanse'},{type:'draw',n:1,mode:'safe'}]},
 '43':{x:166,y:1430,name:'熔岩の酒場',kind:'trade',icon:'⇄',tone:'purple',text:'手札を1枚選んで捨て、安全に2枚引く。',effects:[{type:'discard',n:1,select:true,cost:true},{type:'draw',n:2,mode:'safe'}]},
 '49':{x:1270,y:1515,name:'灰燼の城門',kind:'special',icon:'✧',tone:'gold',text:'覚醒能力を1つ獲得する。すでにあれば残す1つを選ぶ。',effects:[{type:'special'}]},
 '63':{x:324,y:2150,name:'星冠の神殿',kind:'gate',icon:'✧',tone:'gold',text:'必ず停止。覚醒能力がなければ獲得、あれば安全に1枚。さらに未所持の絵柄を1種獲得。',effects:[{type:'shrine469'},{type:'piece'}]}
};
export function landmarkRules469(n){const m=LANDMARKS469[n.id];if(m){const{x,y,...rule}=m;Object.assign(n,rule,{landmark469:true});}return n;}
