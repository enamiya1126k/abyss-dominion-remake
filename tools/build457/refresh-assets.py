from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
import zipfile
with zipfile.ZipFile(root.parent/'deliverables/ABYSS_Build456_integrated.zip') as z: baseline={n:z.read(n) for n in z.namelist()}
version='3.1.136';build='build457'
frozen=lambda p:any(x in ['runtime430','runtime443'] for x in p.parts)
for folder in ['src','online-server/src']:
 for f in (root.parent/'base424'/folder).rglob('*.js'):baseline.setdefault(f.relative_to(root.parent/'base424').as_posix(),f.read_bytes())
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.135"','APP_VERSION="3.1.136"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline456','offline457'))
changed=sorted(p.relative_to(root).as_posix() for folder in ['src','online-server/src'] for p in(root/folder).rglob('*.js') if not frozen(p) and (p.relative_to(root).as_posix() not in baseline or p.read_bytes()!=baseline[p.relative_to(root).as_posix()]))
p=root/'index.html';s=p.read_text();match=re.search(r'(<script type="importmap">\s*)(.*?)(\s*</script>)',s,re.S);data=json.loads(match[2]);imports=data['imports']
for name in changed:
 key='./'+name;new=key+'?v='+version+'-'+build
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
s=s.replace('const ASSET_VERSION = "3.1.135"','const ASSET_VERSION = "3.1.136"').replace('const ASSET_BUILD = "build456"','const ASSET_BUILD = "build457"').replace('world-raid-offline456-sw.js','world-raid-offline457-sw.js').replace('WorldRaidOfflineCache430.js?v=3.1.135-build456','WorldRaidOfflineCache430.js?v=3.1.136-build457');p.write_text(s)
(root/'world-raid-offline457-sw.js').write_text((root/'world-raid-offline456-sw.js').read_text().replace('build456','build457'))
assets=set(json.loads((root/'world-raid-offline456-assets.json').read_text()));assets.update('./'+name for name in changed);assets.update(['./src/Styles/build457-race-cockpit.css']);(root/'world-raid-offline457-assets.json').write_text(json.dumps(sorted(assets),indent=2)+'\n')
(root/'docs/build457/changed-runtime.json').write_text(json.dumps(changed,indent=2)+'\n');print({'changed':len(changed),'assets':len(assets)})
