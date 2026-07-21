export const TEN_GOD_FIRST_CONTACT_FLOOR=1600;

const CHOICES={
 defiance:{id:"defiance",label:"問い返す",description:"お前は何者だ。こちらから神を問い質す。",reward:"魔晶石 ×10"},
 submission:{id:"submission",label:"力を示す",description:"言葉ではなく、ここまで育てた仲間の意志を示す。",reward:"パーティー完全回復"},
 silence:{id:"silence",label:"沈黙する",description:"視線を逸らさず、神の次の言葉を待つ。",reward:"深淵の鍵 ×2"}
};

export function normalizeTenGodContact(state){
 state.tenGodContact??={};
 state.tenGodContact.firstContactPlayed=Boolean(state.tenGodContact.firstContactPlayed);
 state.tenGodContact.choice=state.tenGodContact.choice??null;
 state.tenGodContact.contactedAtFloor=Number(state.tenGodContact.contactedAtFloor??0);
 state.tenGodContact.contactCount=Math.max(0,Number(state.tenGodContact.contactCount??0));
 return state.tenGodContact;
}

export function shouldPlayTenGodFirstContact(state,floor=state.player?.currentFloor){
 const contact=normalizeTenGodContact(state);
 return Number(floor)>=TEN_GOD_FIRST_CONTACT_FLOOR&&!contact.firstContactPlayed;
}

export function tenGodContactChoices(){return Object.values(CHOICES)}

export function resolveTenGodFirstContact(state,choiceId,{recoverParty}={}){
 const contact=normalizeTenGodContact(state),choice=CHOICES[choiceId]??CHOICES.silence;
 if(contact.firstContactPlayed)return{ok:false,message:"最初の接触はすでに記録されている。"};
 contact.firstContactPlayed=true;
 contact.choice=choice.id;
 contact.contactedAtFloor=Number(state.player?.currentFloor??TEN_GOD_FIRST_CONTACT_FLOOR);
 contact.contactCount++;
 state.flags??={};
 state.flags.tenGodObserved=true;
 if(choice.id==="defiance"){state.player.crystals=(state.player.crystals??0)+10}
 if(choice.id==="submission"){recoverParty?.()}
 if(choice.id==="silence"){state.inventory.abyssKeys=(state.inventory.abyssKeys??0)+2}
 const messages={
  defiance:"『名を求めるか。ならば、さらに深くまで来い。』魔晶石を10個得た。",
  submission:"『その群れは、お前の意志か。』神の視線が離れ、パーティーは完全回復した。",
  silence:"『沈黙もまた答えだ。』足元に深淵の鍵が2個残されていた。"
 };
 return{ok:true,choice,message:messages[choice.id]};
}
