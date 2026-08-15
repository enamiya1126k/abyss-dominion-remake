import{canonicalAttribute}from"../../data/attributes.js?v=2.10.0-build150";

const ATTRIBUTE_ORDER=Object.freeze([
 "neutral","fire","water","ice",
 "lightning","earth","wind","light",
 "dark"
]);

export function attributeVisual(attributeId,{className="",label=""}={}){
 const id=canonicalAttribute(attributeId,`visual:${attributeId??"neutral"}`),index=Math.max(0,ATTRIBUTE_ORDER.indexOf(id)),column=index%4,row=Math.floor(index/4),x=column/3*100,y=row/2*100;
 return`<span class="attribute-pixel-art ${className}" data-attribute="${id??"neutral"}" role="img" aria-label="${label||id||"無属性"}" style="--attribute-x:${x}%;--attribute-y:${y}%"></span>`;
}
