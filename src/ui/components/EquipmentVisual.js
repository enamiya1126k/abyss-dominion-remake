import{equipmentIconMeta}from"../../data/equipment.js?v=2.6.0";

const EQUIPMENT_ART_ROOT="../../assets/ui/equipment";

function safeToken(value){return String(value??"").replace(/[^a-zA-Z0-9_-]/g,"")}

/**
 * 装備名に対応するピクセルアトラスの1セルを描画する。
 * URL は app.css のカスタムプロパティとして使われるため、CSS からの相対パス。
 */
export function equipmentVisual(item,{className="",label=""}={}){
 if(item?.visualAsset){
  const source=String(item.visualAsset).replace(/["'<>]/g,"");
  return`<span class="equipment-pixel-art equipment-direct-art ${className}" role="img" aria-label="${label||item?.name||"装備"}"><img src="${source}" alt="" draggable="false"></span>`;
 }
 const meta=equipmentIconMeta(item),columns=Math.max(1,meta.columns),rows=Math.max(1,meta.rows),column=Math.min(columns-1,Math.max(0,meta.column)),row=Math.min(rows-1,Math.max(0,meta.row)),x=columns===1?0:column/(columns-1)*100,y=rows===1?0:row/(rows-1)*100,slot=safeToken(meta.slot)||"weapon",atlas=safeToken(meta.atlas)||slot;
 return`<span class="equipment-pixel-art slot-${slot} ${className}" role="img" aria-label="${label||item?.name||"装備"}" style="--equipment-atlas:url('${EQUIPMENT_ART_ROOT}/${atlas}-atlas.png');--equipment-atlas-width:${columns*100}%;--equipment-atlas-height:${rows*100}%;--equipment-x:${x}%;--equipment-y:${y}%"></span>`;
}
