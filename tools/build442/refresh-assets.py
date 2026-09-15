from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
baseline=root.parent/'repo441'
changed=[p.relative_to(root).as_posix() for base in ['src','online-server/src'] for p in (root/base).rglob('*.js') if 'runtime430' not in p.parts and (not (baseline/p.relative_to(root)).exists() or p.read_bytes()!=(baseline/p.relative_to(root)).read_bytes())]
changed=list(set(changed+['src/core/config.js','src/worldRaid/WorldRaidOfflineCache430.js']))
p=root/'index.html';s=p.read_text();match=re.search(r'(<script type="importmap">\s*)(.*?)(\s*</script>)',s,re.S);data=json.loads(match[2]);imports=data['imports']
for name in changed:
 key='./'+name;new=key+'?v=3.1.121-build442'
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
css='<link rel="stylesheet" href="./src/Styles/build441.css?v=3.1.120-build441">'
if css not in s:s=s.replace('<script type="importmap">',css+'\n<script type="importmap">')
s=s.replace('const ASSET_VERSION = "3.1.120"','const ASSET_VERSION = "3.1.121"').replace('const ASSET_BUILD = "build441"','const ASSET_BUILD = "build442"').replace('world-raid-offline441-sw.js','world-raid-offline442-sw.js').replace('WorldRaidOfflineCache430.js?v=3.1.120-build441','WorldRaidOfflineCache430.js?v=3.1.121-build442');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.120"','APP_VERSION="3.1.121"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline441','offline442'))
(root/'world-raid-offline442-sw.js').write_text((root/'world-raid-offline441-sw.js').read_text().replace('build441','build442'))
assets=set(json.loads((root/'world-raid-offline441-assets.json').read_text()));assets.update('./'+x for x in changed);(root/'world-raid-offline442-assets.json').write_text(json.dumps(sorted(assets),indent=2)+'\n')
(root/'docs/build442').mkdir(exist_ok=True)
(root/'docs/build442/changed-runtime.json').write_text(json.dumps(changed,indent=2))
