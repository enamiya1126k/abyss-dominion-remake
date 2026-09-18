from pathlib import Path
from zipfile import ZipFile
import json,re
root=Path(__file__).resolve().parents[2]
base=ZipFile(root.parent/'baseline467/ABYSS_Build467_integrated.zip');before={n:base.read(n) for n in base.namelist() if not n.endswith('/')}
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.146"','APP_VERSION="3.1.147"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline467','offline468'))
(root/'world-raid-offline468-sw.js').write_text((root/'world-raid-offline467-sw.js').read_text().replace('build467','build468'))
changed=[str(p.relative_to(root)) for p in (root/'src').rglob('*') if p.is_file() and (str(p.relative_to(root)) not in before or before[str(p.relative_to(root))]!=p.read_bytes())]
p=root/'index.html';html=p.read_text();m=re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)',html);imp=json.loads(m.group(2));paths=['./'+f for f in changed if f.endswith('.js')]
for file in paths:
 target=file+'?v=3.1.147-build468'
 for key in list(imp['imports']):
  if key.split('?')[0]==file or imp['imports'][key].split('?')[0]==file:imp['imports'][key]=target
 imp['imports'][file]=target;imp['imports'][target]=target
html=html[:m.start(2)]+'\n'+json.dumps(imp,ensure_ascii=False,indent=2)+'\n'+html[m.end(2):]
html=html.replace('const ASSET_VERSION = "3.1.146"','const ASSET_VERSION = "3.1.147"').replace('const ASSET_BUILD = "build467"','const ASSET_BUILD = "build468"').replace('world-raid-offline467-sw.js','world-raid-offline468-sw.js');p.write_text(html)
assets=set(json.loads((root/'world-raid-offline467-assets.json').read_text()));assets.update(paths);assets.add('./src/Styles/build468-sugoroku.css');assets.update('./'+str(p.relative_to(root)) for p in (root/'assets/sugoroku468').rglob('*') if p.is_file())
(root/'world-raid-offline468-assets.json').write_text(json.dumps(sorted(assets),ensure_ascii=False,indent=2)+'\n')
print('Updated',len(changed),'runtime files;',len(assets),'offline paths')
