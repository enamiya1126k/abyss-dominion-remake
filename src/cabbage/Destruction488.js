// boardDamage is the existing server-persisted count of all forbidden strikes.
// Derive the scene from that one counter so reconnects and local prediction agree.
export function destruction488(total = 0) {
  const hits = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const board = Math.min(7, hits), tableHits = Math.max(0, hits - 7);
  const table = Math.min(7, tableHits);
  const collapse = Math.min(1, Math.max(0, tableHits - 7) / 12);
  const sink = Math.min(1, Math.max(0, tableHits - 4) / 15);
  return {
    hits, board, tableHits, table, collapse, sink,
    boardVisible: tableHits === 0,
    tableOpacity: 1 - collapse,
    phase: collapse === 1 ? 'floor' : tableHits ? 'table' : 'board',
    label: collapse === 1 ? '台所、全壊。床で続行！' : tableHits ? `テーブル破壊 ${tableHits}打` : hits ? `まな板の傷 ${hits}打` : 'まな板、無傷',
  };
}

export const atlasPosition488 = frame => `${frame % 4 * 100 / 3}% ${Math.floor(frame / 4) * 100}%`;

export function tableStyle488(d) {
  return {
    backgroundPosition: atlasPosition488(d.table),
    // Remaining debris sinks and shrinks naturally; never slice a rectangle off a sprite.
    opacity: d.tableOpacity,
    transform: `translateY(${d.collapse * 16}%) scale(${1 - d.collapse * .35}) rotate(${d.tableHits > 7 ? ((d.tableHits % 3) - 1) * d.collapse : 0}deg)`,
  };
}

export function damageMessage488(total, charged) {
  const d = destruction488(total);
  const text = d.phase === 'floor' ? '台所、全壊！' : d.tableHits >= 7 ? 'テーブル崩落！' : d.tableHits >= 5 ? 'テーブルに穴が！' : d.tableHits ? 'テーブルまで割れた！' : d.board >= 7 ? 'まな板、全壊！' : 'まな板にヒビ！';
  return text + (charged ? ' −80' : '');
}

export function damageRecord488(total) {
  const d = destruction488(total);
  return d.tableHits ? `まな板全壊 · ${d.phase === 'floor' ? 'テーブルも全壊' : 'テーブルへの誤打 ' + d.tableHits + '回'}` : d.hits ? `同じまな板に${d.hits}打の傷` : 'まな板、生還';
}

export function paintDestruction488(stage, total) {
  const d = destruction488(total);
  stage.dataset.destruction = d.phase;
  stage.style.setProperty('--floor-drop488', `${d.sink * 10}%`);
  const board = stage.querySelector('[data-cb-board]');
  if (board) {
    board.style.backgroundPosition = atlasPosition488(d.board);
    board.style.clipPath = 'none';
    board.style.opacity = d.boardVisible ? 1 : 0;
    board.dataset.damage = d.hits;
    board.setAttribute('aria-label', d.boardVisible ? `まな板の破損 ${d.board}打` : 'まな板は全壊');
  }
  const table = stage.querySelector('[data-cb-table]');
  if (table) {
    Object.assign(table.style, tableStyle488(d));
    table.dataset.damage = d.tableHits;
    table.setAttribute('aria-label', d.phase === 'floor' ? 'テーブルは全壊' : `テーブルの破損 ${d.tableHits}打`);
  }
  return d;
}
