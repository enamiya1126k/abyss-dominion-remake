"""Refresh luck modules and the current offline cache."""
from pathlib import Path
import json
import re
root = Path(__file__).resolve().parents[2]
version = '3.1.250-build571'
paths = ['src/core/config.js','src/luck/Rules511.js','src/luck/Items511.js','src/luck/Items571.js','src/luck/Buffs571.js','src/luck/Presentation571.js','src/luck/Presentation511.js','src/luck/Equipment562.js','src/luck/Descriptions562.js','src/luck/View511.js','src/party/PartyView462.js','src/race/RaceClient451.js','src/worldRaid/WorldRaidOfflineCache430.js']
p = root / 'index.html'
html = p.read_text()
m = re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)', html)
data = json.loads(m[2])
imports = data['imports']
for path in paths:
    base = './' + path
    target = base + '?v=' + version
    for key in list(imports):
        if key.split('?')[0] == base:
            imports[key] = target
    imports[base] = target
    imports[target] = target
html = html[:m.start(2)] + '\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n' + html[m.end(2):]
html = html.replace('const ASSET_VERSION = "3.1.249"', 'const ASSET_VERSION = "3.1.250"')
html = html.replace('const ASSET_BUILD = "build570"', 'const ASSET_BUILD = "build571"')
html = html.replace('world-raid-offline570-sw.js', 'world-raid-offline571-sw.js')
html = html.replace('<link rel="stylesheet" href="./src/Styles/build512-luck.css?v=3.1.191-build512">', '<link rel="stylesheet" href="./src/Styles/build512-luck.css?v=3.1.191-build512">\n<link rel="stylesheet" href="./src/Styles/build571-luck.css?v=3.1.250-build571">')
p.write_text(html)
p = root / 'src/core/config.js'
p.write_text(p.read_text().replace('APP_VERSION="3.1.249"', 'APP_VERSION="3.1.250"'))
p = root / 'src/worldRaid/WorldRaidOfflineCache430.js'
p.write_text(p.read_text().replace('world-raid-offline570', 'world-raid-offline571'))
(root / 'world-raid-offline571-sw.js').write_text((root / 'world-raid-offline570-sw.js').read_text().replace('build570', 'build571'))
assets = json.loads((root / 'world-raid-offline570-assets.json').read_text())
bases = {'./' + path for path in paths}
assets = [a for a in assets if a.split('?')[0] not in bases]
assets.extend('./' + path + '?v=' + version for path in paths)
assets.extend(['./src/Styles/build571-luck.css?v=3.1.250-build571','./assets/luck571/items.webp','./assets/luck571/barrier.webp'])
(root / 'world-raid-offline571-assets.json').write_text(json.dumps(sorted(set(assets)), ensure_ascii=False, indent=2) + '\n')
