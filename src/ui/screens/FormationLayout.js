// Keep the layout with the screen module: an old HTML shell cannot omit this CSS.
// Card content grows in document flow; optional relic details cannot consume action rows.
export const FORMATION_LAYOUT_CSS = `
.formation-screen.v2-screen[data-formation-layout="350"] .formation-page {
  min-width:0!important; max-width:100%!important;
  box-sizing:border-box!important; display:block!important; min-height:0!important;
  flex:1 1 0!important; margin:0 auto!important;
  padding-bottom:calc(var(--v2-nav-height,68px) + env(safe-area-inset-bottom,0px) + 20px)!important;
  scroll-padding-bottom:calc(var(--v2-nav-height,68px) + 20px);
  overflow-x:hidden!important; overflow-y:auto!important;
  -webkit-overflow-scrolling:touch;
}
.formation-screen[data-formation-layout="350"] .formation-grid {
  display:grid!important; grid-template-columns:repeat(4,minmax(0,1fr))!important;
  align-items:start!important; width:100%!important; min-width:0!important;
  height:auto!important; min-height:0!important; gap:4px!important; margin-top:10px!important;
}
.formation-screen.v2-screen[data-formation-layout="350"] .formation-member {
  box-sizing:border-box!important; display:flex!important; flex-direction:column!important;
  align-self:start!important;
  width:100%!important; min-width:0!important; max-width:100%!important;
  height:auto!important; min-height:0!important; max-height:none!important; padding:4px 3px!important;
  gap:6px!important; overflow:visible!important;
}
.formation-screen[data-formation-layout="350"] .formation-member>* {
  box-sizing:border-box!important; min-width:0!important; max-width:100%!important; flex:0 0 auto!important;
}
.formation-screen[data-formation-layout="350"] .formation-member-drag {
  display:grid!important; grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:10px 44px 14px 22px 8px!important; gap:2px!important;
  min-height:106px!important; height:106px!important; overflow:hidden!important;
}
.formation-screen[data-formation-layout="350"] .formation-slot-label {
  margin:0!important; line-height:10px!important; font-size:7px!important;
}
.formation-screen[data-formation-layout="350"] .formation-member-icon {
  display:grid!important; place-items:center!important; min-height:0!important;
  width:100%!important; height:44px!important; margin:0!important;
}
.formation-screen[data-formation-layout="350"] .formation-member-icon .formation-monster-visual {
  width:44px!important; height:44px!important;
}
.formation-screen[data-formation-layout="350"] .formation-member-name,
.formation-screen[data-formation-layout="350"] .formation-member-meta,
.formation-screen[data-formation-layout="350"] .formation-member-meta>span,
.formation-screen[data-formation-layout="350"] .formation-total-exp {
  display:block!important; width:100%!important; min-width:0!important;
  max-width:100%!important; margin:0!important; padding:0!important;
  white-space:nowrap!important; overflow:hidden!important; text-overflow:ellipsis!important;
}
.formation-screen[data-formation-layout="350"] .formation-member-name {
  line-height:14px!important; font-size:clamp(8px,2.3vw,12px)!important;
}
.formation-screen[data-formation-layout="350"] .formation-member-meta {
  min-height:22px!important; height:22px!important; line-height:11px!important;
  font-size:clamp(6px,1.7vw,9px)!important;
}
.formation-screen[data-formation-layout="350"] .formation-member-meta>span {height:11px!important}
.formation-screen[data-formation-layout="350"] .formation-total-exp {
  line-height:8px!important; font-size:clamp(5px,1.4vw,8px)!important;
}
.formation-screen[data-formation-layout="350"] .formation-power {
  display:grid!important; align-content:center!important; margin:0!important;
  height:30px!important; padding:2px!important; gap:1px!important;
}
.formation-screen[data-formation-layout="350"] .formation-power small {line-height:8px!important}
.formation-screen[data-formation-layout="350"] .formation-power strong {line-height:14px!important}
.formation-screen.v2-screen[data-formation-layout="350"] .formation-loadout {
  display:block!important; height:130px!important; min-height:130px!important;
  max-height:none!important; padding:5px 3px!important; margin:0!important;
  overflow:visible!important;
}
.formation-screen[data-formation-layout="350"] .formation-loadout-title {
  display:block!important; height:16px!important; margin:0 0 0!important; padding:0!important;
  text-align:left!important; font-size:clamp(7px,1.9vw,10px)!important; line-height:16px!important;
}
.formation-screen[data-formation-layout="350"] .formation-loadout .formation-gear-grid {
  display:grid!important; grid-template-columns:repeat(2,minmax(0,1fr))!important;
  grid-template-rows:repeat(3,32px)!important; gap:3px!important;
  width:100%!important; min-width:0!important; height:102px!important;
  min-height:102px!important; max-height:none!important; padding:0!important; overflow:visible!important;
}
.formation-screen[data-formation-layout="350"] .formation-gear-grid>.formation-gear-slot {
  box-sizing:border-box!important; display:grid!important; align-content:center!important;
  width:100%!important; min-width:0!important; max-width:100%!important;
  height:32px!important; min-height:32px!important; padding:2px!important; gap:3px!important;
}
.formation-screen[data-formation-layout="350"] .formation-gear-slot small,
.formation-screen[data-formation-layout="350"] .formation-gear-slot b {
  display:block!important; min-width:0!important; max-width:100%!important;
  white-space:nowrap!important; overflow:hidden!important; text-overflow:ellipsis!important;
  line-height:1.15!important; font-size:clamp(5.5px,1.55vw,9px)!important;
}
.formation-screen[data-formation-layout="350"] .formation-gear-slot em,
.formation-screen[data-formation-layout="350"] .formation-gear-slot .equipment-socket-summary {display:none!important}
.formation-screen.v2-screen[data-formation-layout="350"] .formation-circle-section {
  display:flex!important; align-self:stretch!important; align-items:center!important;
  height:44px!important; min-height:44px!important; margin:0!important; padding:0!important;
}
.formation-screen[data-formation-layout="350"] .formation-circle-section h3 {display:none!important}
.formation-screen[data-formation-layout="350"] .formation-actions.compact {
  display:grid!important; grid-template-columns:repeat(2,minmax(0,1fr))!important;
  grid-template-rows:repeat(2,minmax(44px,auto))!important; height:auto!important;
  margin:0!important; gap:4px!important;
}
.formation-screen[data-formation-layout="350"] .formation-actions.compact button {
  width:100%!important; min-width:0!important; min-height:44px!important; height:auto!important;
  padding:2px 0!important; font-size:clamp(7px,1.8vw,10px)!important; white-space:normal!important; overflow-wrap:anywhere!important; touch-action:manipulation;
}
.formation-screen[data-formation-layout="350"] .formation-remove-action {grid-column:1/-1!important}
.formation-screen[data-formation-layout="350"] .formation-readonly-note {
  align-self:end!important; font-size:clamp(6px,1.6vw,9px)!important;
  line-height:1.5!important; white-space:normal!important; overflow-wrap:anywhere!important;
}
.formation-screen.v2-screen[data-formation-layout="350"] .formation-empty {
  display:flex!important; flex-direction:column!important; justify-content:center!important;
  align-items:center!important; min-height:404px!important;
}
#app .formation-screen[data-formation-layout="350"] .formation-member > .relic394-loadout {
  display:block!important; flex:0 0 auto!important; align-self:stretch!important;
  box-sizing:border-box!important; width:100%!important; min-width:0!important;
  height:auto!important; min-height:0!important; max-height:none!important;
  margin:2px 0 0!important; padding:6px!important; overflow:visible!important;
}
#app .formation-screen[data-formation-layout="350"] .relic394-loadout > summary {
  display:list-item!important; position:static!important; inset:auto!important;
  box-sizing:border-box!important; width:auto!important; height:auto!important;
  min-height:44px!important; max-height:none!important; margin:0!important; padding:4px 0!important;
  transform:none!important; white-space:normal!important; overflow-wrap:anywhere!important;
  font-size:11px!important; line-height:1.55!important; touch-action:manipulation;
}
#app .formation-screen[data-formation-layout="350"] .relic394-loadout :is(p,small,li,span,b) {
  min-width:0!important; white-space:normal!important; overflow-wrap:anywhere!important;
}
`;

