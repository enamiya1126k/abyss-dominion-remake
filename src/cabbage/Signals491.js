// Signal copy is live text. Generated artwork contains no baked-in numerals.
export function cue491(signal,game,at){
 const count=Math.max(1,Math.min(3,Math.ceil((game.startAt-at)/1000)));
 const legacy=game.scoringVersion491!==1;
 const kind=signal.kind==='cut'&&at<game.startAt+650?'go':signal.kind;
 const labels={countdown:['包丁を構えて',String(count),'3つの合図で、開店！'],go:['ABYSS KITCHEN','開店！','左 → 右 → 左 → 右'],cut:['CHOP! CHOP!','切れ！','左 → 右 → 左 → 右'],warning:['まもなく停止','止まる準備！','赤い合図が出たら、手を離そう'],stop:['HANDS OFF!','切るな！',legacy?'手を止めて、台所を守れ':'1タップ −80pt · マイナスまで減点！'],finish:['おつかれさま！','そこまで！','みんなの千切りを集計中'],waiting:['通信確認中','合図を確認中','もう少し待ってね']};
 return{kind,count,label:labels[kind]??labels.waiting,key:kind+':'+(kind==='countdown'?count:'')};
}
export function signalMarkup491(){return '<div class="cb-signal cb-signal491" data-cb-signal role="status" aria-live="polite" aria-atomic="true"><i class="cb-cue-art491" data-cb-cue-art aria-hidden="true"></i><small data-cb-signal-en></small><strong data-cb-signal-main></strong><span data-cb-signal-note></span><div class="cb-count-dots491" aria-hidden="true"><i></i><i></i><i></i></div></div>'}
const BOXES=[[18,123,873,390],[901,123,1754,390],[15,508,875,776],[896,508,1763,776]];
export function cueArt491(kind){
 if(kind==='countdown')return{backgroundImage:"url('./assets/cabbage491/countdown-crest.png')",backgroundSize:'contain',backgroundPosition:'center'};
 const idx=kind==='warning'?1:kind==='stop'?2:kind==='finish'||kind==='waiting'?3:0;
 const [x,y,r,b]=BOXES[idx],w=r-x,h=b-y;
 return{backgroundImage:"url('./assets/cabbage491/signal-plaques.png')",backgroundSize:`${1774/w*100}% ${887/h*100}%`,backgroundPosition:`${x/(1774-w)*100}% ${y/(887-h)*100}%`};
}
export function paintCue491(root,stage,cue,reduced=false){
 for(const [i,name]of ['en','main','note'].entries()){const el=root.querySelector(`[data-cb-signal-${name}]`);if(el)el.textContent=cue.label[i]}
 stage.dataset.signal=cue.kind;stage.dataset.count=String(cue.count);
 const art=root.querySelector('[data-cb-cue-art]');if(art)Object.assign(art.style,cueArt491(cue.kind));
 const number=root.querySelector('[data-cb-signal-main]');
 number?.getAnimations?.().forEach(a=>a.cancel());
 if(!reduced&&number?.animate)number.animate([{opacity:.4,transform:'scale(.86)'},{opacity:1,transform:'scale(1)'}],{duration:cue.kind==='countdown'?260:190,easing:'cubic-bezier(.2,.8,.2,1)'});
}
export const scoreText491=score=>(score<0?'−':'')+Math.abs(score).toLocaleString('ja-JP');
export function scoreMarkup491(score){const digits=scoreText491(score).length;return `<span class="cb-score-value491${score<0?' is-negative491':''}${digits>=8?' is-long491':digits>=6?' is-medium491':''}">${scoreText491(score)}</span><em>pt</em>`}
