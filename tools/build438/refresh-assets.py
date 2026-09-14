from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
changed=['src/online/OnlineViews.js','src/ui/screens/BattleScreen.js','src/online/OnlinePartyClient.js','src/ui/screens/EquipmentScreen.js','src/worldRaid/WorldRaidClient430.js','src/worldRaid/WorldRaidOfflineClient430.js','src/worldRaid/WorldRaidSpeed438.js','src/main.js', 'src/core/config.js', 'src/ui/Contribution437.js', 'src/ui/BattleBossLayout.js', 'src/worldRaid/WorldRaidVitals437.js', 'src/worldRaid/WorldRaidLimit437.js', 'src/worldRaid/WorldRaidRules432.js', 'src/worldRaid/WorldRaidReplay430.js', 'src/worldRaid/WorldRaidView428.js', 'src/worldRaid/WorldRaidView432.js', 'src/worldRaid/WorldRaidClient432.js', 'src/worldRaid/WorldRaidOfflineCache430.js', 'src/worldRaid/WorldRaidOfflineView430.js']
p=root/'index.html';s=p.read_text();match=re.search(r'(<script type="importmap">\s*)(.*?)(\s*</script>)',s,re.S);data=json.loads(match[2]);imports=data['imports']
for name in changed:
 key='./'+name;new=key+'?v=3.1.117-build438'
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
css='<link rel="stylesheet" href="./src/Styles/build438-polish.css?v=3.1.117-build438">'
if css not in s:s=s.replace('<script type="importmap">',css+'\n<script type="importmap">')
s=s.replace('const ASSET_VERSION = "3.1.116"','const ASSET_VERSION = "3.1.117"').replace('const ASSET_BUILD = "build437"','const ASSET_BUILD = "build438"').replace('world-raid-offline437-sw.js','world-raid-offline438-sw.js').replace('WorldRaidOfflineCache430.js?v=3.1.116-build437','WorldRaidOfflineCache430.js?v=3.1.117-build438');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.116"','APP_VERSION="3.1.117"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline437','offline438'))
(root/'world-raid-offline438-sw.js').write_text((root/'world-raid-offline437-sw.js').read_text().replace('build437','build438'))
assets=set(json.loads((root/'world-raid-offline437-assets.json').read_text()));assets.update('./'+x for x in changed);assets.add('./src/Styles/build438-polish.css');assets.update('./'+str(x.relative_to(root)) for x in (root/'assets/ui/build438').glob('*.webp'));(root/'world-raid-offline438-assets.json').write_text(json.dumps(sorted(assets),indent=2)+'\n')
