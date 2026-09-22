const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const resultGame490=c=>c.state?.tower??c.state?.quiz??c.state?.luck??c.state?.gorilla??c.state?.canal??c.state?.cabbage??c.state?.sugoroku??c.state?.room;
export function resultActions490(c){
 const g=resultGame490(c),host=(c.state?.party?.hostId??g?.hostId)===c.transport.selfId,pending=c.resultPending490;
 return `<nav class="party-result-actions490" aria-label="ゲーム終了後の操作" aria-busy="${!!pending}"><button data-party-result490="again" ${!host||pending?'disabled':''}>もう一度</button><button data-party-result490="list" ${pending?'disabled':''}>ミニゲーム一覧へ戻る</button>${!host?'<p>再戦は部屋主が開始できます。</p>':''}<p role="status">${pending?(pending.kind==='again'?'次のゲームを準備中…':'結果を閉じています…'):''}</p>${c.error||c.rewardError?`<p role="alert">${esc(c.error||c.rewardError)}</p>`:''}</nav>`;
}
export function resultClick490(c,b){
 const g=resultGame490(c),d=b.dataset;
 let kind=d.partyResult490;
 // Existing header/back controls on result screens must close the result too.
 if(!kind&&g?.phase==='result'){
  if(['browse','lounge'].includes(d.partyAction462)||d.sgAction==='browse'||['back','leave'].includes(d.raceAction))kind='list';
  if([d.cbAction,d.cnAction,d.sgAction,d.raceAction].includes('again'))kind='again';
 }
 if(!kind)return false;
 if(!g||g.phase!=='result'){c.error='ゲームの状態が変わりました。最新の画面を確認してください。';c.refresh?.();c.render();return true}
 if(c.resultPending490)return true;
 const p=c.state?.party,host=(p?.hostId??g.hostId)===c.transport.selfId;
 if(kind==='list'&&p&&!host){c.dismissedResult490=g.id;c.partyBrowse462=true;c.expanded460=false;c.error='';c.render();return true}
 if(kind==='again'&&!host){c.error='再戦は部屋主が開始できます。';c.render();return true}
 if(!c.ready()){c.error='接続を確認してから、もう一度押してください。';c.refresh?.();c.render();return true}
 if(p&&c.state.partyResultActions490!==1){c.error='結果画面の更新にはサーバーのBuild490更新・再起動が必要です。';c.render();return true}
 c.error='';c.resultPending490={kind,gameId:g.id,partyId:p?.id??null,at:Date.now()};
 const sent=p?c.raw('partyResult490',{partyId:p.id,gameId:g.id,kind}):c.raw(kind==='again'?'again':'leave');
 if(sent===false){c.resultPending490=null;c.error='送信できませんでした。接続を確認してもう一度押してください。'}
 c.render();return true;
}
export function resultReceive490(c){
 const g=resultGame490(c),pending=c.resultPending490;
 if(pending&&(g?.id!==pending.gameId||g.phase!=='result')){
  c.resultPending490=null;c.error='';c.expanded460=false;
  // A new game opened by another host must remain visible, even after "list".
  c.partyBrowse462=pending.kind==='list'&&!g;
 }
 if(c.dismissedResult490&&c.dismissedResult490!==g?.id)c.dismissedResult490=null;
}
export function resultError490(c,m){
 if(c.resultPending490&&['partyResult490','again','leave'].includes(m.op))c.resultPending490=null;
}
export function resultPoll490(c){
 if(c.resultPending490&&Date.now()-c.resultPending490.at>8000){c.resultPending490=null;c.error='応答を確認できませんでした。接続を確認して、もう一度押してください。';c.refresh?.()}
}
