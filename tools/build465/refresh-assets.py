from pathlib import Path
from zipfile import ZipFile
import json,re
root=Path(__file__).resolve().parents[2]
base=ZipFile(root.parent/'deliverables/ABYSS_Build464_integrated.zip');before={n:base.read(n) for n in base.namelist() if not n.endswith('/')}
version='3.1.144-build465'
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.143"','APP_VERSION="3.1.144"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline464','offline465'))
(root/'world-raid-offline465-sw.js').write_text((root/'world-raid-offline464-sw.js').read_text().replace('build464','build465'))
changed=[str(p.relative_to(root)) for prefix in ['src','online-server'] for p in (root/prefix).rglob('*') if p.is_file() and (str(p.relative_to(root)) not in before or before[str(p.relative_to(root))]!=p.read_bytes())]
p=root/'index.html';html=p.read_text();m=re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)',html);imp=json.loads(m.group(2));paths=['./'+f for f in changed if f.startswith('src/') and f.endswith('.js')]
for file in paths:
 target=file+'?v='+version
 for key in list(imp['imports']):
  if key.split('?')[0]==file or imp['imports'][key].split('?')[0]==file:imp['imports'][key]=target
 imp['imports'][file]=target;imp['imports'][target]=target
html=html[:m.start(2)]+'\n'+json.dumps(imp,ensure_ascii=False,indent=2)+'\n'+html[m.end(2):]
html=html.replace('const ASSET_VERSION = "3.1.143"','const ASSET_VERSION = "3.1.144"').replace('const ASSET_BUILD = "build464"','const ASSET_BUILD = "build465"').replace('world-raid-offline464-sw.js','world-raid-offline465-sw.js')
p.write_text(html)
assets=set(json.loads((root/'world-raid-offline464-assets.json').read_text()));assets.update(paths);assets.add('./src/Styles/build465-sugoroku.css');assets.add('./assets/sugoroku465/adventure.png')
(root/'world-raid-offline465-assets.json').write_text(json.dumps(sorted(assets),ensure_ascii=False,indent=2)+'\n')
(root/'docs/build465/changed-runtime.json').write_text(json.dumps(changed,indent=2)+'\n')
print('Updated',len(changed),'runtime files;',len(assets),'offline paths')
