from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
changed=['src/main.js','src/core/config.js','src/ui/components/AttributeVisual.js','src/worldRaid/WorldRaidBalance440.js','online-server/src/WorldRaidStore428.js','src/worldRaid/WorldRaidOfflineCache430.js']
p=root/'index.html';s=p.read_text();match=re.search(r'(<script type="importmap">\s*)(.*?)(\s*</script>)',s,re.S);data=json.loads(match[2]);imports=data['imports']
for name in changed:
 key='./'+name;new=key+'?v=3.1.119-build440'
 for old in list(imports):
  if old.split('?')[0]==key:imports[old]=new
 imports[key]=new;imports[new]=new
 for folder in ['src','online-server/src']:
  for file in (root/folder).rglob('*.js'):
   if 'runtime430' in file.parts:continue
   for rel in re.findall(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]',file.read_text()):
    base,_,query=rel.partition('?')
    if base.startswith('.') and (file.parent/base).resolve()==root/name and query:imports[key+'?'+query]=new
s=s[:match.start(2)]+json.dumps(data,ensure_ascii=False,indent=2)+s[match.end(2):]
css='<link rel="stylesheet" href="./src/Styles/build440-visual.css?v=3.1.119-build440">'
if css not in s:s=s.replace('<script type="importmap">',css+'\n<script type="importmap">')
s=s.replace('const ASSET_VERSION = "3.1.118"','const ASSET_VERSION = "3.1.119"').replace('const ASSET_BUILD = "build439"','const ASSET_BUILD = "build440"').replace('world-raid-offline439-sw.js','world-raid-offline440-sw.js').replace('WorldRaidOfflineCache430.js?v=3.1.118-build439','WorldRaidOfflineCache430.js?v=3.1.119-build440');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.118"','APP_VERSION="3.1.119"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline439','offline440'))
(root/'world-raid-offline440-sw.js').write_text((root/'world-raid-offline439-sw.js').read_text().replace('build439','build440'))
assets=set(json.loads((root/'world-raid-offline439-assets.json').read_text()));assets.update('./'+x for x in changed);assets.add('./src/Styles/build440-visual.css');assets.update('./assets/ui/build440/'+x.name for x in (root/'assets/ui/build440').glob('*.webp'));(root/'world-raid-offline440-assets.json').write_text(json.dumps(sorted(assets),indent=2)+'\n')
(root/'docs/build440').mkdir(exist_ok=True)
(root/'docs/build440/changed-runtime.json').write_text(json.dumps(changed,indent=2))
