import {pixelIcon,itemIcon} from './components/GameChrome.js';
import {mergeChestSupplies427} from '../core/ChestSupplies427.js';

export const PARTY_MAINTENANCE427='現在運営による調整中です。ご迷惑をおかけいたします。';
export function coopRaidEntrance427(){
 return `<div class="coop-raid-entrance427"><div class="coop-raid-emblem427">${pixelIcon('crossed-swords')}</div><h3>共闘レイド</h3><p>サーバーのみんなで、一体の巨敵に挑む。</p><strong class="coop-raid-state427">開催準備中</strong><p>現在、共闘レイドの開催準備を進めています。公開までお待ちください。</p></div>`;
}
export function chestSuppliesMarkup427(rows=[]){
 const items=mergeChestSupplies427(rows);if(!items.length)return '';
 return `<section class="chest-supplies427" aria-label="獲得した消耗品"><h4>消耗品を獲得</h4><ul>${items.map(item=>`<li>${itemIcon(item.id)}<span>${item.name}</span><b>×${item.quantity}</b></li>`).join('')}</ul></section>`;
}
