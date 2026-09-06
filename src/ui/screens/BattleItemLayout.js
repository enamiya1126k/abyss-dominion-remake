export const BATTLE_ITEM_LAYOUT=`
.battle-screen.side-battle-v2 .battle-command.has-item-menu{
 position:fixed!important;inset:auto 10px max(10px,env(safe-area-inset-bottom))!important;
 width:auto!important;height:auto!important;max-height:60vh!important;max-height:60dvh!important;
 display:flex!important;flex-direction:column!important;gap:6px!important;overflow:hidden!important;
 box-sizing:border-box!important;padding:12px!important;z-index:90!important;background:#08090d!important;
 border:8px solid #a68a48!important;border-radius:0!important;
 border-image:var(--alpha115-frame-active,url("assets/ui/v2/ornate-frame-active.png")) 44 / 8px stretch!important;
 box-shadow:0 -8px 30px #000b!important;
}
.battle-screen.side-battle-v2 .has-item-menu>.battle-command-head,
.battle-screen.side-battle-v2 .has-item-menu>.target-help,
.battle-screen.side-battle-v2 .has-item-menu>.battle-item-toolbar{flex:0 0 auto!important;min-width:0}
.battle-screen.side-battle-v2 .battle-item-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#efd99e}
.battle-screen.side-battle-v2 .battle-item-toolbar>button{
 position:relative!important;flex:0 0 auto!important;min-width:86px!important;min-height:44px!important;
 padding:8px 16px!important;border:1px solid #bd9b50!important;border-radius:2px!important;
 background:linear-gradient(#302919,#14120e)!important;color:#fff1c7!important;
 touch-action:manipulation;pointer-events:auto!important;font-weight:700;
}
.battle-screen.side-battle-v2 .battle-command.has-item-menu>.battle-item-list{
 flex:1 1 auto!important;min-height:0!important;height:auto!important;max-height:none!important;
 overflow-y:auto!important;overflow-x:hidden!important;display:grid!important;gap:8px!important;
 padding:4px 2px 10px!important;background:#08090d!important;overscroll-behavior:contain;
 -webkit-overflow-scrolling:touch;touch-action:pan-y;
}
.battle-screen.side-battle-v2 .battle-command.has-item-menu .battle-item-list>button{
 display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;
 width:100%!important;min-height:68px!important;height:auto!important;padding:12px 14px!important;
 border:5px solid #8b743e!important;border-radius:0!important;
 border-image:var(--alpha115-frame,url("assets/ui/v2/ornate-frame.png")) 44 / 5px stretch!important;
 background:linear-gradient(110deg,#1b1912,#08090d 70%)!important;color:#f5e7bf!important;
 box-shadow:inset 0 0 14px #0008!important;text-align:left!important;
}
.battle-screen.side-battle-v2 .has-item-menu .battle-item-list>button>span{min-width:0;display:grid;gap:5px}
.battle-screen.side-battle-v2 .has-item-menu .battle-item-list>button small{color:#bdb6a2!important;white-space:normal!important;line-height:1.5}
.battle-screen.side-battle-v2 .has-item-menu .battle-item-list>button>strong{flex-shrink:0;color:#eed18a!important}
.battle-screen.side-battle-v2 .has-item-menu button:focus-visible{outline:2px solid #ffe395!important;outline-offset:-3px}
`;
