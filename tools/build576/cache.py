from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
version='3.1.255-build576'
paths=['src/core/config.js','src/luck/View511.js','src/luck/Items575.js','src/worldRaid/WorldRaidOfflineCache430.js']
p=root/'index.html';html=p.read_text();m=re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)',html);data=json.loads(m[2]);imports=data['imports']
for path in paths:
 base='./'+path;target=base+'?v='+version
 for key in list(imports):
  if key.split('?')[0]==base:imports[key]=target
 imports[base]=target;imports[target]=target
html=html[:m.start(2)]+'\n'+json.dumps(data,ensure_ascii=False,indent=2)+'\n'+html[m.end(2):]
html=html.replace('const ASSET_VERSION = "3.1.254"','const ASSET_VERSION = "3.1.255"').replace('const ASSET_BUILD = "build575"','const ASSET_BUILD = "build576"').replace('world-raid-offline575-sw.js','world-raid-offline576-sw.js').replace('build571-luck.css?v=3.1.254-build575','build571-luck.css?v='+version)
p.write_text(html)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.254"','APP_VERSION="3.1.255"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('world-raid-offline575','world-raid-offline576'))
(root/'world-raid-offline576-sw.js').write_text((root/'world-raid-offline575-sw.js').read_text().replace('build575','build576'))
assets=json.loads((root/'world-raid-offline575-assets.json').read_text());bases={'./'+p for p in paths}|{'./src/Styles/build571-luck.css'}
assets=[a for a in assets if a.split('?')[0] not in bases]+[p+'?v='+version for p in bases]
(root/'world-raid-offline576-assets.json').write_text(json.dumps(sorted(set(assets)),ensure_ascii=False,indent=2)+'\n')
