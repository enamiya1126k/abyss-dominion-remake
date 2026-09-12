import {chapterPreparationReady415,appliedTrial419} from '../battle/TrialAdaptation415.js';
export function preparationHelp415(party=[]){
 const active=chapterPreparationReady415({party});
 return `<details class="preparation-help415"><summary>部隊の備え：${active?'編成条件を満たしています':'編成条件を確認'}</summary><p>攻撃役と支援・防御・妨害役を含む、通常キャラ3体以上で有効。特定の名前やペアの指定はありません。ペア連携とは別の補正です。</p><p>第一章・欠片試練は階層、4対4・回廊・王室は各試練に応じた固定補正で戦います。倍率は開戦時と戦闘中のキャラ詳細に表示します。</p><p>第二章と原初の聖胎では、味方だけの能力補正はありません。ペアの発動条件・倍率・回数は敵味方共通です。回復・障壁は各キャラの最大HPを基準に計算します。更新前に中断した戦闘は、終了まで旧補正を維持します。</p><p>魔法陣の障壁、強化解除、異常への対策を組み合わせましょう。第一章終盤・王室初回の検証目安はLv.3,000、決戦の記憶はLv.3,000〜10,000。最大顕現も通常キャラはLv.10,000以内です。</p><p>基礎能力・レア度・MPは変わりません。深淵・十神にはこの補正を付けず、オンラインでは無効です。フィオラのHP100も維持します。</p></details><style>.preparation-help415{border:1px solid #8e774a;background:#100d14;padding:10px 12px;margin:8px 0;color:#d9cba9;overflow-wrap:anywhere}.preparation-help415 summary{cursor:pointer;min-height:36px;display:flex;align-items:center;font-weight:700}.preparation-help415 summary::before{content:'▸';margin-right:.5em}.preparation-help415[open] summary::before{content:'▾'}.preparation-help415 p{font-size:12px;line-height:1.6;margin:8px 0}</style>`;
}

export function unitPreparationHelp419(b,unit,stats){
 const entry=appliedTrial419(b,unit);if(!entry)return '';
 const n=value=>Number(value).toLocaleString('ja-JP',{maximumFractionDigits:2}),r=entry.rates;
 const hp=unit.speciesId==='ch2_fiora'?'HP100固定の能力を優先し、最大HPは100のままです。':`戦闘開始時の補正前HP ${n(entry.naturalHp)} ／ HP×${n(r.hp)}。現在の最大HP ${n(stats.hp)}。`;
 return `<section class="battle-preparation419"><h4>部隊の備え（ペア連携とは別）</h4><p>${hp}</p><p>攻撃・魔力×${n(r.atk)} ／ 防御・魔防×${n(r.def)} ／ 速度×${n(r.spd)}。MPは変わりません。この戦闘中のみ有効です。</p><p>特定のペアを揃えなくても編成条件で発動します。最大HP割合の回復・障壁は、補正後の最大HPを基準に計算します。</p></section>`;
}
