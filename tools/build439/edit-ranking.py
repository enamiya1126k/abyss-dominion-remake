from pathlib import Path
root=Path(__file__).resolve().parents[2]
def edit(name,pairs):
 p=root/name;s=p.read_text()
 for a,b in pairs:assert a in s,(name,a[:80]);s=s.replace(a,b)
 p.write_text(s)
edit('online-server/src/WorldRaidCoordinator428.js',[("import {randomBytes}","import {raidPortrait439} from '../../src/worldRaid/WorldRaidPortrait439.js';\nimport {randomBytes}"),('s.current.contribution[playerId].attempts++;','s.current.contribution[playerId].attempts++;s.current.contribution[playerId].portrait439=raidPortrait439(profile);')])
edit('online-server/src/WorldRaidCoordinator430.js',[("import ","import ")] )
p=root/'online-server/src/WorldRaidCoordinator430.js';s=p.read_text();s="import {raidPortrait439} from '../../src/worldRaid/WorldRaidPortrait439.js';\n"+s
s=s.replace('name:profile.displayName};','name:profile.displayName,portrait439:raidPortrait439(profile)};')
s=s.replace('c.contribution[t.playerId].attempts++;','c.contribution[t.playerId].attempts++;if(t.portrait439)c.contribution[t.playerId].portrait439=t.portrait439;')
p.write_text(s)
# Attach portraits to public ranking responses without changing ranking or rewards.
edit('online-server/src/WorldRaidCoordinator429.js',[("import {randomBytes}","import {raidPortrait439} from '../../src/worldRaid/WorldRaidPortrait439.js';\nimport {randomBytes}"),('rows:rows.slice(page*pageSize,(page+1)*pageSize),mine,','rows:rows.slice(page*pageSize,(page+1)*pageSize).map(row=>({...row,portrait439:c.contribution[row.playerId]?.portrait439??raidPortrait439(this.sessions.get(row.playerId)?.profile)})),mine,')])
p=root/'src/worldRaid/WorldRaidRankingView429.js';s=p.read_text();s="import {monsterVisual} from '../ui/MonsterVisual.js';\n"+s
start=s.index(' const rows=data.rows.map(');end=s.index('\n return ',start)
s=s[:start]+''' const rows=data.rows.map(row=>{
  const rank=Math.max(1,Math.floor(Number(row.rank)||1)),self=row.playerId===playerId,portrait=row.portrait439;
  return `<article class="power-ranking-row raid-ranking-row439 podium-${Math.min(rank,4)} ${self?'is-self':''}" aria-label="${rank}位 ${esc(row.name)} 累計ダメージ ${n(row.damage)}"><span class="power-ranking-position">${rank<=3?rank:`#${rank}`}</span><span class="power-ranking-avatar">${portrait?monsterVisual(portrait,'',{className:'power-ranking-monster-visual'}):'<span class="raid-portrait-placeholder439" aria-label="部隊の紋章"></span>'}</span><span class="power-ranking-identity"><small>${self?'YOU・':''}${esc(portrait?.name??'レイド参加者')}</small><b title="${esc(row.name)}">${esc(row.name)}</b><em>${row.lastHit?'最後の一撃':`挑戦 ${n(row.attempts)}回`}</em>${self?'<small>あなた</small>':''}</span><strong><small>累計ダメージ</small>${n(row.damage)}</strong><i aria-hidden="true"></i></article>`;
 }).join('');''' +s[end:]
a='<div class="world-ranking-table429"><table><thead><tr><th>順位</th><th>プレイヤー</th><th>累計ダメージ</th></tr></thead><tbody>${rows||\'<tr><td colspan="3">まだボスへのダメージは記録されていません。</td></tr>\'}</tbody></table></div>'
b='<div class="world-ranking-table429 raid-ranking-list439" aria-label="ダメージランキング">${rows||\'<p>まだボスへのダメージは記録されていません。</p>\'}</div>'
assert a in s;s=s.replace(a,b);p.write_text(s)
print('Raid ranking reuses power ranking cards; actual public portraits online/offline')
