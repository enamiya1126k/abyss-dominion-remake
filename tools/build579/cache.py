from pathlib import Path
import json, re

root = Path(__file__).resolve().parents[2]
version = '3.1.258-build579'
paths = ['src/core/config.js', 'src/luck/View511.js', 'src/worldRaid/WorldRaidOfflineCache430.js']
p = root / 'index.html'
html = p.read_text()
m = re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)', html)
data = json.loads(m[2])
for path in paths:
    base = './' + path
    target = base + '?v=' + version
    for key in list(data['imports']):
        if key.split('?')[0] == base:
            data['imports'][key] = target
    data['imports'][base] = target
    data['imports'][target] = target
html = html[:m.start(2)] + '\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n' + html[m.end(2):]
html = html.replace('const ASSET_VERSION = "3.1.257"', 'const ASSET_VERSION = "3.1.258"')
html = html.replace('const ASSET_BUILD = "build578"', 'const ASSET_BUILD = "build579"')
html = html.replace('world-raid-offline578-sw.js', 'world-raid-offline579-sw.js')
link = '<link rel="stylesheet" href="./src/Styles/build579-luck-art.css?v=' + version + '">'
if link not in html:
    anchor = '<link rel="stylesheet" href="./src/Styles/build571-luck.css?v=3.1.257-build578">'
    assert html.count(anchor) == 1
    html = html.replace(anchor, anchor + '\n' + link)
p.write_text(html)
p = root / 'src/core/config.js'
p.write_text(p.read_text().replace('APP_VERSION="3.1.257"', 'APP_VERSION="3.1.258"'))
p = root / 'src/worldRaid/WorldRaidOfflineCache430.js'
p.write_text(p.read_text().replace('world-raid-offline578', 'world-raid-offline579'))
p = root / 'src/luck/View511.js'
p.write_text(p.read_text().replace('./assets/luck571/items.webp', './assets/luck579/items-571.webp').replace('./assets/luck577/items.webp', './assets/luck579/items-575.webp'))
(root / 'world-raid-offline579-sw.js').write_text((root / 'world-raid-offline578-sw.js').read_text().replace('build578', 'build579'))
assets = json.loads((root / 'world-raid-offline578-assets.json').read_text())
bases = {'./' + path for path in paths}
assets = [a for a in assets if a.split('?')[0] not in bases and a not in ['./assets/luck571/items.webp', './assets/luck577/items.webp']]
assets += [path + '?v=' + version for path in bases]
assets += ['./src/Styles/build579-luck-art.css?v=' + version, './assets/luck579/items-571.webp', './assets/luck579/items-575.webp']
(root / 'world-raid-offline579-assets.json').write_text(json.dumps(sorted(set(assets)), ensure_ascii=False, indent=2) + '\n')
