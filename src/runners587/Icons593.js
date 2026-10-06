const paths={left:'M17 4 7 12l10 8V4Z',right:'m7 4 10 8-10 8V4Z',jump:'m12 3-8 8h5v10h6V11h5L12 3Z',attack:'M14 2c0 6-8 5-8 12a6 6 0 0 0 12 0c0-4-2-6-4-8 1 5-3 6-3 3 0-2 3-4 3-7Z',heart:'M12 21 3 12C-3 4 7-2 12 5 17-2 27 4 21 12Z'};
export const icon593=(kind,cls='')=>`<svg class="ru-icon593 ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[kind]??paths.attack}" fill="currentColor"/></svg>`;
export function hearts593(lives){return '<span class="ru-hearts593" aria-label="残り'+lives+'ハート">'+[0,1,2].map(i=>icon593('heart',i<lives?'':'is-empty')).join('')+'</span>';}
