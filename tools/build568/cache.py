"""Refresh changed hockey modules without duplicating older import aliases."""
from pathlib import Path
import json
import re
root = Path(__file__).resolve().parents[2]
version = '3.1.247-build568'
paths = ['src/core/config.js', 'src/ricochet550/Control568.js', 'src/ricochet550/Hockey564.js',
         'src/ricochet550/Board564.js', 'src/ricochet550/Teams564.js', 'src/ricochet550/View550.js',
         'src/ricochet550/Rules550.js', 'src/party/PartyView462.js', 'src/race/RaceClient451.js', 'src/worldRaid/WorldRaidOfflineCache430.js']
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
html = html.replace('const ASSET_VERSION = "3.1.246"', 'const ASSET_VERSION = "3.1.247"')
html = html.replace('const ASSET_BUILD = "build567"', 'const ASSET_BUILD = "build568"')
html = html.replace('world-raid-offline567-sw.js', 'world-raid-offline568-sw.js')
p.write_text(html)
p = root / 'src/core/config.js'
p.write_text(p.read_text().replace('APP_VERSION="3.1.246"', 'APP_VERSION="3.1.247"'))
p = root / 'src/worldRaid/WorldRaidOfflineCache430.js'
p.write_text(p.read_text().replace('world-raid-offline567', 'world-raid-offline568'))
(root / 'world-raid-offline568-sw.js').write_text((root / 'world-raid-offline567-sw.js').read_text().replace('build567', 'build568'))
assets = json.loads((root / 'world-raid-offline567-assets.json').read_text())
bases = {'./' + path for path in paths}
assets = [a for a in assets if a.split('?')[0] not in bases]
assets.extend('./' + path + '?v=' + version for path in paths)
(root / 'world-raid-offline568-assets.json').write_text(json.dumps(sorted(set(assets)), ensure_ascii=False, indent=2) + '\n')
