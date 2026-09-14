import fs from'node:fs';import{createRequire}from'node:module';const sharp=createRequire(import.meta.url)('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const frames=['home','lobby','circles'],labels=['ホームの配置','レイドランキング','新しい魔法陣'];const width=1243,height=780,layers=[];
for(let i=0;i<3;i++){const label=Buffer.from(`<svg width="393" height="36"><text x="196" y="26" text-anchor="middle" font-family="Noto Sans CJK JP,sans-serif" font-size="18" fill="#f6deac">${labels[i]}</text></svg>`);layers.push({input:label,left:16+i*409,top:7});layers.push({input:`docs/build441/${frames[i]}-393.png`,left:16+i*409,top:48});}
await sharp({create:{width,height,channels:4,background:'#0b090f'}}).composite(layers).png().toFile('../deliverables/ABYSS_Build441_preview.png');
