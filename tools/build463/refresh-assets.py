from pathlib import Path
from zipfile import ZipFile
import json,re
root=Path(__file__).resolve().parents[2]
base=ZipFile(root.parent/'source/ABYSS_Build462_integrated.zip');before={n:base.read(n) for n in base.namelist() if not n.endswith('/')}
version='3.1.142-build463'
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.141"','APP_VERSION="3.1.142"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline462','offline463'))
(root/'world-raid-offline463-sw.js').write_text((root/'world-raid-offline462-sw.js').read_text().replace('build462','build463'))
changed=[str(p.relative_to(root)) for prefix in ['src','online-server'] for p in (root/prefix).rglob('*') if p.is_file() and (str(p.relative_to(root)) not in before or before[str(p.relative_to(root))]!=p.read_bytes())]
p=root/'index.html';html=p.read_text();m=re.search(r'(<script type="importmap">)([\s\S]*?)(</script>)',html);imp=json.loads(m.group(2));paths=['./'+f for f in changed if f.startswith('src/') and f.endswith('.js')]
for file in paths:
 target=file+'?v='+version
 for key in list(imp['imports']):
  if key.split('?')[0]==file or imp['imports'][key].split('?')[0]==file:imp['imports'][key]=target
 imp['imports'][file]=target;imp['imports'][target]=target
html=html[:m.start(2)]+'\n'+json.dumps(imp,ensure_ascii=False,indent=2)+'\n'+html[m.end(2):]
html=html.replace('const ASSET_VERSION = "3.1.141"','const ASSET_VERSION = "3.1.142"').replace('const ASSET_BUILD = "build462"','const ASSET_BUILD = "build463"').replace('world-raid-offline462-sw.js','world-raid-offline463-sw.js')
# Existing import aliases keep old module URLs pointing at the new version.
html=html.replace('href="./src/Styles/build463-sugoroku.css?v=3.1.142"','href="./src/Styles/build463-sugoroku.css?v='+version+'"')
p.write_text(html)
assets=set(json.loads((root/'world-raid-offline462-assets.json').read_text()));assets.update(paths);assets.add('./src/Styles/build463-sugoroku.css');assets.update('./'+str(p.relative_to(root)) for p in (root/'assets/sugoroku463').glob('*'))
(root/'world-raid-offline463-assets.json').write_text(json.dumps(sorted(assets),ensure_ascii=False,indent=2)+'\n')
(root/'docs/build463').mkdir(parents=True,exist_ok=True)
(root/'docs/build463/changed-runtime.json').write_text(json.dumps(changed,indent=2)+'\n')
print('updated',len(changed),'runtime files;',len(assets),'offline paths')
