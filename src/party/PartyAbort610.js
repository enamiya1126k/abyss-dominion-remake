import {resultGame490} from './PartyResults490.js';
export function mountAbort610(c){
 const g=resultGame490(c),p=c.state?.party;if(!p||!g||g===c.state?.room||['lobby','result'].includes(g.phase)||c.partyBrowse462)return;
 const head=c.root?.querySelector('header');if(!head||head.querySelector('[data-party-abort610]'))return;
 const b=document.createElement('button'),host=p.hostId===c.transport.selfId;b.dataset.partyAbort610=host?'stop':'leave';b.textContent=host?'中止':'退出';b.setAttribute('aria-label',host?'ゲームを中止する':'このゲームから退出する');b.style.cssText='flex:0 0 auto;min-width:42px;min-height:36px;padding:4px;font-size:11px;color:#ffe7c4;background:#442825;border:1px solid #aa8057;border-radius:7px;touch-action:manipulation';
 head.style.display='grid';head.style.gridTemplateColumns='38px minmax(0,1fr) auto 42px';head.style.gap='4px';head.append(b);
}
export function abortClick610(c,b){
 const kind=b.dataset.partyAbort610;if(!kind)return false;const g=resultGame490(c),p=c.state?.party;if(!p||!g||['lobby','result'].includes(g.phase))return true;
 if(!c.ready()){c.error='接続を確認してから押してください';c.render();return true;}
 const host=p.hostId===c.transport.selfId;
 if(!globalThis.confirm(host?'ゲームを中止して一覧へ戻る？ 同じメンバーで別のゲームを選べます。':'パーティーから退出する？ ほかの人のゲームは続きます。'))return true;
 const sent=c.raw(host?'partyAbort610':'partyLeave462',host?{partyId:p.id,gameId:g.id}:{});
 if(sent!==false){c.partyBrowse462=true;c.selectedGame462=null;c.render();}return true;
}
