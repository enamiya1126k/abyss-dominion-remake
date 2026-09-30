"""Set one canonical target for each changed module and refresh the offline list."""
from pathlib import Path
import json
import re
root=Path(__file__).resolve().parents[2]
version='3.1.246-build567'
paths=['src/core/config.js','src/cabbage/Rules484.js','src/cabbage/Signals491.js','src/cabbage/View484.js','src/cabbage/Swipe567.js','src/cabbage/Scene567.js','src/cabbage/Debris567.js','src/party/PartyGames462.js','src/party/PartyView462.js','src/race/RaceClient451.js','src/worldRaid/WorldRaidOfflineCache430.js']
p=root/'index.html';html=p.read_text();m=re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)',html);data=json.loads(m[2]);imports=data['imports']
for path in paths:
 base='./'+path;target=base+'?v='+version
 for key in list(imports):
  if key.split('?')[0]==base:imports[key]=target
 imports[base]=target;imports[target]=target
html=html[:m.start(2)]+'\n'+json.dumps(data,ensure_ascii=False,indent=2)+'\n'+html[m.end(2):]
html=html.replace('const ASSET_VERSION = "3.1.245"','const ASSET_VERSION = "3.1.246"').replace('const ASSET_BUILD = "build566"','const ASSET_BUILD = "build567"').replace('world-raid-offline566-sw.js','world-raid-offline567-sw.js')
css='./src/Styles/build567-cabbage-swipe.css?v='+version
if css not in html:html=html.replace('<link rel="stylesheet" href="./src/Styles/build566-crane.css?v=3.1.245-build566">','<link rel="stylesheet" href="./src/Styles/build566-crane.css?v=3.1.245-build566">\n<link rel="stylesheet" href="'+css+'">')
p.write_text(html)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.245"','APP_VERSION="3.1.246"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('world-raid-offline566','world-raid-offline567'))
(root/'world-raid-offline567-sw.js').write_text((root/'world-raid-offline566-sw.js').read_text().replace('build566','build567'))
assets=json.loads((root/'world-raid-offline566-assets.json').read_text());bases={'./'+path for path in paths}
assets=[a for a in assets if a.split('?')[0] not in bases]
assets.extend('./'+path+'?v='+version for path in paths);assets.append(css)
(root/'world-raid-offline567-assets.json').write_text(json.dumps(sorted(set(assets)),ensure_ascii=False,indent=2)+'\n')
