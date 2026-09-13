from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
changed=['src/main.js','src/core/config.js','src/ui/RoleGuide436.js','src/ui/SkillGuide436.js','src/ui/screens/FormationScreen.js','src/ui/ChapterTwoGacha397.js','src/worldRaid/WorldRaidOfflineCache430.js']
p=root/'index.html';s=p.read_text();match=re.search(r'(<script type="importmap">\s*)(.*?)(\s*</script>)',s,re.S);data=json.loads(match[2]);imports=data['imports']
for name in changed:
 key='./'+name;new=key+'?v=3.1.115-build436'
 for old in list(imports):
  if old.split('?')[0]==key:imports[old]=new
 imports[key]=new;imports[new]=new
 # Relative imports are normalized against their importing file by the browser.
 for file in (root/'src').rglob('*.js'):
  for rel in re.findall(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]',file.read_text()):
   base,_,query=rel.partition('?')
   if not base.startswith('.'):continue
   resolved=(file.parent/base).resolve()
   if resolved==root/name and query:imports[key+'?'+query]=new
s=s[:match.start(2)]+json.dumps(data,ensure_ascii=False,indent=2)+s[match.end(2):]
css='<link rel="stylesheet" href="./src/Styles/build436-guides.css?v=3.1.115-build436">'
if css not in s:s=s.replace('<script type="importmap">',css+'\n<script type="importmap">')
s=s.replace('const ASSET_VERSION = "3.1.114"','const ASSET_VERSION = "3.1.115"').replace('const ASSET_BUILD = "build435"','const ASSET_BUILD = "build436"').replace('world-raid-offline435-sw.js','world-raid-offline436-sw.js').replace('WorldRaidOfflineCache430.js?v=3.1.114-build435','WorldRaidOfflineCache430.js?v=3.1.115-build436');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.114"','APP_VERSION="3.1.115"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline435','offline436'))
(root/'world-raid-offline436-sw.js').write_text((root/'world-raid-offline435-sw.js').read_text().replace('build435','build436'))
assets=set(json.loads((root/'world-raid-offline435-assets.json').read_text()));assets.update('./'+x for x in changed);assets.add('./src/Styles/build436-guides.css');assets.update('./'+str(x.relative_to(root)) for x in (root/'assets/ui/build436').glob('*.webp'));(root/'world-raid-offline436-assets.json').write_text(json.dumps(sorted(assets),indent=2)+'\n')
