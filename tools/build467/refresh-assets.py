from pathlib import Path
from zipfile import ZipFile
import json,re
root=Path(__file__).resolve().parents[2]
base=ZipFile(root.parent/'deliverables/ABYSS_Build466_integrated.zip');before={n:base.read(n) for n in base.namelist() if not n.endswith('/')}
version='3.1.146-build467'
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.145"','APP_VERSION="3.1.146"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline466','offline467'))
(root/'world-raid-offline467-sw.js').write_text((root/'world-raid-offline466-sw.js').read_text().replace('build466','build467'))
changed=[str(p.relative_to(root)) for prefix in ['src','online-server'] for p in (root/prefix).rglob('*') if p.is_file() and (str(p.relative_to(root)) not in before or before[str(p.relative_to(root))]!=p.read_bytes())]
p=root/'index.html';html=p.read_text();m=re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)',html);imp=json.loads(m.group(2));paths=['./'+f for f in changed if f.startswith('src/') and f.endswith('.js')]
for file in paths:
 target=file+'?v='+version
 for key in list(imp['imports']):
  if key.split('?')[0]==file or imp['imports'][key].split('?')[0]==file:imp['imports'][key]=target
 imp['imports'][file]=target;imp['imports'][target]=target
html=html[:m.start(2)]+'\n'+json.dumps(imp,ensure_ascii=False,indent=2)+'\n'+html[m.end(2):]
html=html.replace('const ASSET_VERSION = "3.1.145"','const ASSET_VERSION = "3.1.146"').replace('const ASSET_BUILD = "build466"','const ASSET_BUILD = "build467"').replace('world-raid-offline466-sw.js','world-raid-offline467-sw.js')
p.write_text(html)
assets=set(json.loads((root/'world-raid-offline466-assets.json').read_text()));assets.update(paths);assets.add('./src/Styles/build467-sugoroku.css');assets.update('./'+str(p.relative_to(root)) for p in (root/'assets/sugoroku467').glob('*.png'))
(root/'world-raid-offline467-assets.json').write_text(json.dumps(sorted(assets),ensure_ascii=False,indent=2)+'\n')
(root/'docs/build467/changed-runtime.json').write_text(json.dumps(changed,indent=2)+'\n')
print('Updated',len(changed),'runtime files;',len(assets),'offline paths')
