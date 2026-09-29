import { TEAM564, allocateTeams564 } from './Hockey564.js';
import { esc563 as esc, color563 as color, avatar563 as avatar, header563 } from '../party/Arcade563.js';
import { resultActions490 } from '../party/PartyResults490.js';

export function teamPicker564(c, g) {
  const map = allocateTeams564(g.members), id = c.transport.selfId;
  return `<section class="hk-picker564"><h2>チームを選ぼう</h2><div>${TEAM564.map(t => {
    const people = g.members.filter(p => !p.departed && map.get(p.playerId) === t.id);
    const mine = map.get(id) === t.id;
    return `<button data-rc-team="${t.id}" aria-pressed="${mine}" style="--team:${t.color}" ${people.length >= 2 && !mine ? 'disabled' : ''}>
      <b>${t.mark} ${t.name}</b><small>${t.id === 0 ? '↑ 上のゴールを狙う' : '↓ 下のゴールを狙う'}</small>
      ${people.map(p => `<span style="--player:${color(p)}">${avatar(c,p)}${esc(p.playerId === id ? 'あなた' : p.name)}</span>`).join('')}
      ${Array.from({length:2-people.length},()=>'<span class="hk-ai564">空席はAI</span>').join('')}
    </button>`;
  }).join('')}</div><p class="arc-note563">各チーム２人。チーム変更後は、全員もう一度「準備OK」を押してね。</p></section>`;
}

export function teamScoreboard564(c, g) {
  const myTeam = g.players.find(p => p.playerId === c.transport.selfId)?.team564 ?? 0;
  return `<div class="hk-scores564" aria-label="チーム得点">${[myTeam,1-myTeam].map(id => {
    const t = g.teams564[id];
    return `<article style="--team:${t.color}"><header><b>${t.mark} ${id === myTeam ? '味方' : '相手'}</b><small>${t.name}</small><strong data-hk-score="${id}">${t.score}</strong></header>
      <div>${g.players.filter(p => p.team564 === id).map(p => `<span style="--player:${color(p)}">${avatar(c,p)}<b>${esc(p.playerId === c.transport.selfId ? 'あなた' : p.name)}</b></span>`).join('')}</div></article>`;
  }).join('')}</div>`;
}

export function hockeyResult564(c, g, u, options) {
  const me = g.players.find(p => p.playerId === c.transport.selfId);
  const won = g.winnerIds.includes(c.transport.selfId);
  const title = g.draw564 ? '引き分け！' : won ? 'ふたりで、つかんだ勝利！' : '次は、ふたりで取り返そう！';
  return `<section class="arc563 arc-result563 hk-result564">${header563(c,u,'rc',options.title,options.sub)}
    <div class="hk-finale564"><small>${g.draw564 ? 'DRAW' : won ? 'VICTORY' : 'MATCH FINISHED'}</small><h1>${title}</h1>
      <div class="hk-finalscore564">${g.teams564.map(t=>`<span style="--team:${t.color}"><small>${t.mark} ${t.name}</small><strong>${t.score}</strong></span>`).join('<b>:</b>')}</div>
      <p>${g.draw564 ? '両チーム、同点で決着。' : `${TEAM564[g.teamResults564[0].id].name}チームの勝利！`}</p></div>
    <div class="arc-body563">${resultActions490(c)}${g.teamResults564.map(t=>`<section class="hk-resultteam564" style="--team:${t.color}"><h2>${t.mark} ${t.name} ${t.id===me?.team564?'・あなたのチーム':''}</h2>${g.players.filter(p=>p.team564===t.id).map(p=>`<article style="--player:${color(p)}">${avatar(c,p)}<div><b>${esc(p.name)}</b><small>${p.goals}ゴール · ${p.assists564}アシスト</small></div></article>`).join('')}</section>`).join('')}
    <p class="arc-note563">チームの合計得点で勝敗が決まります。同点は引き分けです。</p></div></section>`;
}
