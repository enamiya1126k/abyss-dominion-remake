// Original user photos are copied byte-for-byte. Cropping is display-only CSS.
export const PHOTO_GROUPS468={yori:7,enami:7,rion:9,hide:20};
export const photoUrl468=(group,index)=>`./assets/sugoroku468/photos/${group}-${String(index).padStart(2,'0')}.${group==='hide'&&index===18?'png':'jpeg'}`;
export const SERIES_ART468={heroes:{name:'天空の盟約',group:'hide',index:10},dark:{name:'闇を持つひで',group:'hide',index:1}};
const pieceStyle468=(set,part)=>{const scale=set==='dark'?1.4:1,x=set==='dark'?.2:0,y=set==='dark'?.4:0;return `width:${200*scale}%;height:${200*scale}%;left:${-200*x-(part%2)*100}%;top:${-200*y-Math.floor(part/2)*100}%`};
const specialPhotos={'rob-special':['hide',19],sleep:['yori',3],principal:['yori',1],fist:['yori',6],dove:['yori',7],forest:['yori',4],mental:['enami',5],guard:['enami',3],cerberus:['rion',3],hide:['hide',2],destroyer:['hide',1],experiment:['hide',6],thunder:['hide',15],'hide-date':['hide',16],phoenix:['hide',17],reflect:['hide',18],cup:['hide',11],chance:['rion',9],fremens:['enami',2],poison:['hide',20],nothing:['hide',13]};
export function photoFor468(c){
 if(c.set)return null;
 if(specialPhotos[c.id])return photoUrl468(...specialPhotos[c.id]);
 const match=/^(yori|enami|rion|hide)-(\d+)$/.exec(c.id);
 if(match)return photoUrl468(match[1],Number(match[2])%PHOTO_GROUPS468[match[1]]+1);
 const group=c.attrs?.[0];if(!PHOTO_GROUPS468[group])return null;
 const index=c.id.startsWith('relic-')?PHOTO_GROUPS468[group]:c.id.startsWith('gift-')?2:c.id.startsWith('affliction-')?3:4;
 return photoUrl468(group,index);
}
export function photoCardArt468(c,fallback){
 if(c.set){const s=SERIES_ART468[c.set];return `<span class="sg-art sg-photo468 sg-piece468" data-part="${c.part}" aria-hidden="true"><img src="${photoUrl468(s.group,s.index)}" alt="" draggable="false" style="${pieceStyle468(c.set,c.part)}"></span>`}
 const url=photoFor468(c);return url?`<span class="sg-art sg-photo468" aria-hidden="true"><img src="${url}" alt="" draggable="false" loading="lazy"></span>`:fallback(c.art);
}
export function puzzle468(set,owned=[0,1,2,3],className=''){
 const s=SERIES_ART468[set],url=photoUrl468(s.group,s.index);
 return `<span class="sg-puzzle468 ${owned.length===4?'is-complete':''} ${className}" role="img" aria-label="${s.name}、${owned.length}/4種類の絵柄">${[0,1,2,3].map(i=>`<span class="sg-puzzle-cell468 ${owned.includes(i)?'is-owned':'is-missing'}" style="--px:${i%2?1:-1};--py:${i<2?-1:1}">${owned.includes(i)?`<img src="${url}" alt="" draggable="false" style="${pieceStyle468(set,i)}">`:`<i>${['左上','右上','左下','右下'][i]}</i>`}</span>`).join('')}</span>`;
}
export const PHOTO_TITLES468={
 'yori-0':'門出の追い風','yori-1':'着火するより','yori-2':'休息からの再出発','yori-3':'リゾートの余裕','yori-4':'潜水準備、完了！','yori-5':'小石の上の攻防','yori-6':'海を見下ろす男',
 'enami-0':'夕暮れの守り手','enami-1':'お祝いの追い風','enami-2':'正装の一歩','enami-3':'船上の共鳴','enami-4':'霧の向こうへ','enami-5':'ダブルピース','enami-6':'麺の前では平等',
 'rion-0':'湯上がりの疾走','rion-1':'光る一杯','rion-2':'虎の間の一歩','rion-3':'旅先の自撮り','rion-4':'波打ち際の加速','rion-5':'広場を駆ける','rion-6':'石積みの達人','rion-7':'切り札を読む','rion-8':'額縁の主役',
 'hide-0':'抜刀するひで','hide-1':'花束の祝福','hide-2':'菜の花の一歩','hide-3':'敬礼の合図','hide-4':'河原の秘密基地','hide-5':'石塔の魔術師','hide-6':'修行のはじまり','hide-7':'小石の洗礼','hide-8':'石に埋もれた秘宝','hide-9':'天空からの引力','hide-10':'河原の宴','hide-11':'帰り道の一手','hide-12':'旅人の護り','hide-13':'鉄板の錬金術','hide-14':'茂みからの帰還','hide-15':'夕焼けの共鳴'
};
