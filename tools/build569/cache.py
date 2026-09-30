"""Refresh bomb relay modules and the current offline cache."""
from pathlib import Path
import json
import re
root = Path(__file__).resolve().parents[2]
version = '3.1.248-build569'
paths = ['src/core/config.js','src/bomb/Relay563.js','src/bomb/Relay569.js','src/bomb/View542.js','src/bomb/View569.js','src/bomb/Rules542.js','src/party/PartyView462.js','src/race/RaceClient451.js','src/worldRaid/WorldRaidOfflineCache430.js']
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
html = html.replace('const ASSET_VERSION = "3.1.247"', 'const ASSET_VERSION = "3.1.248"')
html = html.replace('const ASSET_BUILD = "build568"', 'const ASSET_BUILD = "build569"')
html = html.replace('world-raid-offline568-sw.js', 'world-raid-offline569-sw.js')
p.write_text(html)
p = root / 'src/core/config.js'
p.write_text(p.read_text().replace('APP_VERSION="3.1.247"', 'APP_VERSION="3.1.248"'))
p = root / 'src/worldRaid/WorldRaidOfflineCache430.js'
p.write_text(p.read_text().replace('world-raid-offline568', 'world-raid-offline569'))
(root / 'world-raid-offline569-sw.js').write_text((root / 'world-raid-offline568-sw.js').read_text().replace('build568', 'build569'))
assets = json.loads((root / 'world-raid-offline568-assets.json').read_text())
bases = {'./' + path for path in paths}
assets = [a for a in assets if a.split('?')[0] not in bases]
assets.extend('./' + path + '?v=' + version for path in paths)
(root / 'world-raid-offline569-assets.json').write_text(json.dumps(sorted(set(assets)), ensure_ascii=False, indent=2) + '\n')

css='./src/Styles/build569-bomb.css?v='+version
html=(root/'index.html').read_text()
if css not in html:
 html=html.replace('</head>', '<link rel="stylesheet" href="'+css+'">\n</head>')
 (root/'index.html').write_text(html)
assets=json.loads((root/'world-raid-offline569-assets.json').read_text())
assets.append(css)
(root/'world-raid-offline569-assets.json').write_text(json.dumps(sorted(set(assets)),ensure_ascii=False,indent=2)+'\n')
