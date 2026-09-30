"""Refresh tetra modules and the current offline cache."""
from pathlib import Path
import json
import re
root = Path(__file__).resolve().parents[2]
version = '3.1.249-build570'
paths = ['src/core/config.js','src/tetra/Rules539.js','src/tetra/View539.js','src/party/PartyView462.js','src/race/RaceClient451.js','src/worldRaid/WorldRaidOfflineCache430.js']
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
html = html.replace('const ASSET_VERSION = "3.1.248"', 'const ASSET_VERSION = "3.1.249"')
html = html.replace('const ASSET_BUILD = "build569"', 'const ASSET_BUILD = "build570"')
html = html.replace('world-raid-offline569-sw.js', 'world-raid-offline570-sw.js')
p.write_text(html)
p = root / 'src/core/config.js'
p.write_text(p.read_text().replace('APP_VERSION="3.1.248"', 'APP_VERSION="3.1.249"'))
p = root / 'src/worldRaid/WorldRaidOfflineCache430.js'
p.write_text(p.read_text().replace('world-raid-offline569', 'world-raid-offline570'))
(root / 'world-raid-offline570-sw.js').write_text((root / 'world-raid-offline569-sw.js').read_text().replace('build569', 'build570'))
assets = json.loads((root / 'world-raid-offline569-assets.json').read_text())
bases = {'./' + path for path in paths}
assets = [a for a in assets if a.split('?')[0] not in bases]
assets.extend('./' + path + '?v=' + version for path in paths)
(root / 'world-raid-offline570-assets.json').write_text(json.dumps(sorted(set(assets)), ensure_ascii=False, indent=2) + '\n')
