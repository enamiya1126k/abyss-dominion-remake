const paths={
 spring:'M7 4h18M7 28h18M10 5l12 4-12 5 12 5-12 5 12 3',
 crown:'M4 10l7 5 5-9 5 9 7-5-3 16H7zM8 29h16',
 star:'M16 3l4 9 10 1-8 7 3 10-9-5-9 5 3-10-8-7 10-1z',
 cell:'M13 3h6v3h-6zM8 7h16v22H8zM18 10l-7 9h6l-3 7 8-11h-6z',
 link:'M12 20l-2 2a5 5 0 01-7-7l7-7a5 5 0 017 0M20 12l2-2a5 5 0 017 7l-7 7a5 5 0 01-7 0M11 21l10-10',
 dice:'M5 5h22v22H5zM10 10h1v1h-1zM21 10h1v1h-1zM16 16h1v1h-1zM10 21h1v1h-1zM21 21h1v1h-1z',
 magnet:'M7 5v13a9 9 0 0018 0V5h-6v13a3 3 0 01-6 0V5zM7 11h6M19 11h6',
 chest:'M4 14h24v14H4zM4 14V9q12-10 24 0v5M12 14h8v7h-8zM9 6v8M23 6v8',
 rocket:'M13 22L9 18Q12 7 24 4q-1 13-11 18zM9 18H4l5-8 4-1M13 22v6l8-7-1-5M9 23l-5 5M17 11a2 2 0 104 0 2 2 0 00-4 0',
 bank:'M3 12l13-8 13 8zM7 15v10M13 15v10M19 15v10M25 15v10M3 28h26',
 shield:'M16 3l11 4v9q-1 9-11 14Q6 25 5 16V7zM16 8v17M10 14h12',
 spark:'M18 2L5 19h10l-1 11 13-18H17z',
 wheel:'M16 3a13 13 0 110 26 13 13 0 010-26M16 8v16M8 16h16M10 10l12 12M22 10L10 22',
 engine:'M5 12h22v13H5zM10 8h12v4M3 15h2M27 15h3v7h-3M10 28v-3M22 28v-3M12 16h8v5h-8z',
 comet:'M18 11a7 7 0 110 14 7 7 0 010-14M11 21L3 5l14 6M14 14L9 6'
};
export function icon550(name){return `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]??paths.star}"/></svg>`}
