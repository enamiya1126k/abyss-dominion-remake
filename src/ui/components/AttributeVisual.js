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

/**
 * The formal matchup chart. Every node uses the existing attribute atlas;
 * callers never need to duplicate the ordering of the combat rules.
 */
export function attributeCycleVisual({className="",decorative=false}={}){
 const node=(id,nodeClass="")=>attributeVisual(id,{className:`home-attribute-node ${nodeClass}`.trim(),label:`${ATTRIBUTES[id]?.name??id}属性`});
 const hidden=decorative?' aria-hidden="true"':` role="img" aria-label="属性相性。水から火、火から氷、氷から風、風から土、土から雷、雷から水の順で有利。光と闇は互いに有利。無属性に相性なし"`;
 return`<span class="home-attribute-map attribute-cycle-visual ${className}"${hidden}>
   <span class="home-attribute-cycle">
    ${ATTRIBUTE_CYCLE.map((id,index)=>node(id,`node-${index+1}`)).join("")}
    ${ATTRIBUTE_CYCLE.map((_,index)=>`<i class="home-attribute-arrow arrow-${index+1}" aria-hidden="true">➜</i>`).join("")}
    ${node("neutral","node-neutral")}
   </span>
   <span class="home-attribute-pair">
    ${node("light","node-light")}<i aria-hidden="true">⇅</i>${node("dark","node-dark")}
   </span>
  </span>`;
}
