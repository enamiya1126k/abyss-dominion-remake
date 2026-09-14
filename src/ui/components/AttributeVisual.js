import{ATTRIBUTE_CYCLE,ATTRIBUTES,canonicalAttribute}from"../../data/attributes.js?v=3.0.9-build309";

const ATTRIBUTE_ATLAS_ORDER=Object.freeze([
 "neutral","fire","water","ice",
 "lightning","earth","wind","light",
 "dark"
]);

export function attributeVisual(attributeId,{className="",label=""}={}){
 const id=canonicalAttribute(attributeId,`visual:${attributeId??"neutral"}`),index=Math.max(0,ATTRIBUTE_ATLAS_ORDER.indexOf(id)),column=index%4,row=Math.floor(index/4),x=column/3*100,y=row/2*100;
 return`<span class="attribute-pixel-art ${className}" data-attribute="${id??"neutral"}" role="img" aria-label="${label||id||"無属性"}" style="--attribute-x:${x}%;--attribute-y:${y}%"></span>`;
}

/** Native atlas marks with source-coloured arrows; combat order is data-driven. */
export function attributeCycleVisual({className="",decorative=false}={}){
 const colors={fire:'#ed533b',ice:'#74dbf1',wind:'#7bc74c',earth:'#c49855',lightning:'#f5d548',water:'#4aabeb',light:'#ffe79b',dark:'#b772e5'};
 const points=ATTRIBUTE_CYCLE.map((id,i)=>{const a=(-90+i*60)*Math.PI/180;return{id,x:140+90*Math.cos(a),y:120+90*Math.sin(a)}});
 const arrow=(a,b,color,offset=0)=>{
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,nx=-uy,ny=ux;
  const sx=a.x+ux*29+nx*offset,sy=a.y+uy*29+ny*offset,ex=b.x-ux*29+nx*offset,ey=b.y-uy*29+ny*offset,bx=ex-ux*13,by=ey-uy*13;
  return `<path d="M ${sx+nx*5} ${sy+ny*5} L ${bx+nx*5} ${by+ny*5} L ${bx+nx*11} ${by+ny*11} L ${ex} ${ey} L ${bx-nx*11} ${by-ny*11} L ${bx-nx*5} ${by-ny*5} L ${sx-nx*5} ${sy-ny*5} Z" fill="${color}" stroke="#111019" stroke-width="2" stroke-linejoin="round"/>`;
 };
 const light={id:'light',x:94,y:274},dark={id:'dark',x:186,y:274};
 const arrows=points.map((p,i)=>arrow(p,points[(i+1)%points.length],colors[p.id])).join('')+arrow(light,dark,colors.light,-7)+arrow(dark,light,colors.dark,-7);
 const nodes=[...points,light,dark,{id:'neutral',x:140,y:120}].map(p=>`<span class="attribute-node440 ${p.id==='neutral'?'attribute-neutral440':''}" style="--x440:${p.x/280*100}%;--y440:${p.y/316*100}%">${attributeVisual(p.id,{label:`${ATTRIBUTES[p.id]?.name??p.id}属性`})}</span>`).join('');
 const label=`属性相性。${[...ATTRIBUTE_CYCLE,ATTRIBUTE_CYCLE[0]].map(id=>ATTRIBUTES[id]?.name??id).join('から')}の順で攻撃有利。光と闇は互いに有利。無属性に相性なし`;
 return `<span class="home-attribute-map attribute-cycle-visual attribute-orbit440 ${className}" ${decorative?'aria-hidden="true"':`role="img" aria-label="${label}"`}><svg class="attribute-arrows440" viewBox="0 0 280 316" aria-hidden="true">${arrows}</svg>${nodes}</span>`;
}
