// Scope restoration to the same tower lobby. Starting/replaying a game must not
// inherit another screen's scroll, and no interval keeps fighting user scrolling.
export function rememberLobby519(c){const u=c.towerUI517,g=c.state?.tower;if(!u)return;if(u.scrollRaf519!=null){cancelAnimationFrame(u.scrollRaf519);u.scrollRaf519=null}
 const lobby=c.root?.querySelector('.tw-lobby517');if(!lobby||g?.phase!=='lobby'||u.gameId!==g.id){u.lobbyScroll519=null;return}
 const containers=[];for(let n=c.root;n;n=n.parentElement)if(n===c.root||n.scrollTop||n.scrollHeight>n.clientHeight)containers.push({node:n,top:n.scrollTop??0,left:n.scrollLeft??0});
 u.lobbyScroll519={id:g.id,root:c.root,containers,windowX:globalThis.scrollX??0,windowY:globalThis.scrollY??0,roster:c.root.querySelector('.tw-roster517')?.scrollTop??0};
}
export function restoreLobby519(c){const u=c.towerUI517,s=u?.lobbyScroll519,g=c.state?.tower,lobby=c.root?.querySelector('.tw-lobby517');if(!s||s.id!==g?.id||g.phase!=='lobby'||c.root!==s.root||!lobby)return;
 const apply=()=>{if(c.root!==s.root||c.state?.tower?.id!==s.id||c.state.tower.phase!=='lobby'||c.root.querySelector('.tw-lobby517')!==lobby)return;const roster=c.root.querySelector('.tw-roster517');if(roster)roster.scrollTop=s.roster;for(const x of s.containers){x.node.scrollTop=x.top;x.node.scrollLeft=x.left}if(globalThis.scrollY!==s.windowY||globalThis.scrollX!==s.windowX)globalThis.scrollTo?.(s.windowX,s.windowY)};
 apply();u.scrollRaf519=requestAnimationFrame(()=>{u.scrollRaf519=null;apply()});
}
export function disposeLobby519(c){const u=c.towerUI517;if(!u)return;if(u.scrollRaf519!=null)cancelAnimationFrame(u.scrollRaf519);u.scrollRaf519=null;u.lobbyScroll519=null}
