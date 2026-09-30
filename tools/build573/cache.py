from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
version='3.1.252-build573'
paths=['src/core/config.js','src/luck/Scenery512.js','src/worldRaid/WorldRaidOfflineCache430.js']
p=root/'index.html';html=p.read_text();m=re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)',html);data=json.loads(m[2]);imports=data['imports']
for path in paths:
 base='./'+path;target=base+'?v='+version
 for key in list(imports):
  if key.split('?')[0]==base:imports[key]=target
 imports[base]=target;imports[target]=target
html=html[:m.start(2)]+'\n'+json.dumps(data,ensure_ascii=False,indent=2)+'\n'+html[m.end(2):]
html=html.replace('const ASSET_VERSION = "3.1.251"','const ASSET_VERSION = "3.1.252"').replace('const ASSET_BUILD = "build572"','const ASSET_BUILD = "build573"').replace('world-raid-offline572-sw.js','world-raid-offline573-sw.js').replace('build512-luck.css?v=3.1.251-build572','build512-luck.css?v='+version)
p.write_text(html)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.251"','APP_VERSION="3.1.252"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('world-raid-offline572','world-raid-offline573'))
(root/'world-raid-offline573-sw.js').write_text((root/'world-raid-offline572-sw.js').read_text().replace('build572','build573'))
assets=json.loads((root/'world-raid-offline572-assets.json').read_text());bases={'./'+p for p in paths}|{'./src/Styles/build512-luck.css'}
assets=[a for a in assets if a.split('?')[0] not in bases]+[p+'?v='+version for p in bases]+['./assets/luck573/'+p+'.webp' for p in ['moon','venus','sun','graveyard','rebirth']]
(root/'world-raid-offline573-assets.json').write_text(json.dumps(sorted(set(assets)),ensure_ascii=False,indent=2)+'\n')
