export function dangerTile477(n){
 const own=(n.effects??[]).filter(e=>!e.target||e.target==='self');
 if(own.some(e=>e.harmful||e.type==='move'&&e.n<0||e.type==='crystal477'&&['half','lose'].includes(e.mode)))return 'danger';
 if(own.some(e=>['discard','discardAttr','loseSpecial','skip'].includes(e.type)))return 'cost';
 return '';
}
export function dangerSvg477(level,r){if(!level)return '';
 return `<path class="sg-thorns477" d="M${-r-5} 3 l-8 -10 12 3 -3 -13 12 8 M${r+5} 3 l8 -10 -12 3 3 -13 -12 8 M-9 13 l-3 8 12 -4 12 4 -3 -8"/><path class="sg-cracks477" d="M-15 -9 l6 5 -4 4 7 5 M16 -8 l-7 6 4 4 -7 5"/><g class="sg-danger-mark477" transform="translate(0,-21)"><path d="M0 -7 8 6 H-8Z"/><text y="3">!</text></g>`;
}
