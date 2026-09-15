from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2];baseline=root.parent/'repo443'
def frozen(p):return any(part in ['runtime430','runtime443'] for part in p.parts)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.122"','APP_VERSION="3.1.123"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline443','offline444'))
changed=sorted(p.relative_to(root).as_posix() for base in ['src','online-server/src'] for p in(root/base).rglob('*.js') if not frozen(p) and (not(baseline/p.relative_to(root)).exists() or p.read_bytes()!=(baseline/p.relative_to(root)).read_bytes()))
p=root/'index.html';s=p.read_text();match=re.search(r'(<script type="importmap">\s*)(.*?)(\s*</script>)',s,re.S);data=json.loads(match[2]);imports=data['imports']
for name in changed:
 key='./'+name;new=key+'?v=3.1.123-build444'
 for old in list(imports):
  if old.split('?')[0]==key:imports[old]=new
 imports[key]=new;imports[new]=new
 for folder in ['src','online-server/src']:
  for file in(root/folder).rglob('*.js'):
   if frozen(file):continue
   for rel in re.findall(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]',file.read_text()):
    base,_,query=rel.partition('?')
    if base.startswith('.') and(file.parent/base).resolve()==root/name and query:imports[key+'?'+query]=new
s=s[:match.start(2)]+json.dumps(data,ensure_ascii=False,indent=2)+s[match.end(2):]
s=s.replace('const ASSET_VERSION = "3.1.122"','const ASSET_VERSION = "3.1.123"').replace('const ASSET_BUILD = "build443"','const ASSET_BUILD = "build444"').replace('world-raid-offline443-sw.js','world-raid-offline444-sw.js').replace('WorldRaidOfflineCache430.js?v=3.1.122-build443','WorldRaidOfflineCache430.js?v=3.1.123-build444');p.write_text(s)
(root/'world-raid-offline444-sw.js').write_text((root/'world-raid-offline443-sw.js').read_text().replace('build443','build444'))
assets=set(json.loads((root/'world-raid-offline443-assets.json').read_text()));assets.update('./'+x for x in changed);assets.add('./src/Styles/build444-circle-motion.css');(root/'world-raid-offline444-assets.json').write_text(json.dumps(sorted(assets),indent=2)+'\n')
(root/'docs/build444/changed-runtime.json').write_text(json.dumps(changed,indent=2)+'\n');print('changed runtime',len(changed),'cached',len(assets))
