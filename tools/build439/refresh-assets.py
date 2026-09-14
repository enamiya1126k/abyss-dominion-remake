from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
changed=['src/main.js','src/core/config.js','src/core/ExchangeCosts439.js','src/core/SummonLimits439.js','src/core/CaptureTraining439.js','src/core/FloorBossChallengeSystem.js','src/core/EndgameSystem.js','src/chapterTwo/ChapterTwoGacha397.js','src/ui/RoleGuide436.js','src/ui/screens/MonsterDetailScreen.js','src/worldRaid/WorldRaidRankingView429.js','src/worldRaid/WorldRaidPortrait439.js','src/worldRaid/WorldRaidOfflineCache430.js']
p=root/'index.html';s=p.read_text();match=re.search(r'(<script type="importmap">\s*)(.*?)(\s*</script>)',s,re.S);data=json.loads(match[2]);imports=data['imports']
for name in changed:
 key='./'+name;new=key+'?v=3.1.118-build439'
 for old in list(imports):
  if old.split('?')[0]==key:imports[old]=new
 imports[key]=new;imports[new]=new
 for file in (root/'src').rglob('*.js'):
  if 'runtime430' in file.parts:continue
  for rel in re.findall(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]',file.read_text()):
   base,_,query=rel.partition('?')
   if base.startswith('.') and (file.parent/base).resolve()==root/name and query:imports[key+'?'+query]=new
s=s[:match.start(2)]+json.dumps(data,ensure_ascii=False,indent=2)+s[match.end(2):]
css='<link rel="stylesheet" href="./src/Styles/build439-growth.css?v=3.1.118-build439">'
if css not in s:s=s.replace('<script type="importmap">',css+'\n<script type="importmap">')
s=s.replace('const ASSET_VERSION = "3.1.117"','const ASSET_VERSION = "3.1.118"').replace('const ASSET_BUILD = "build438"','const ASSET_BUILD = "build439"').replace('world-raid-offline438-sw.js','world-raid-offline439-sw.js').replace('WorldRaidOfflineCache430.js?v=3.1.117-build438','WorldRaidOfflineCache430.js?v=3.1.118-build439');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.117"','APP_VERSION="3.1.118"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline438','offline439'))
(root/'world-raid-offline439-sw.js').write_text((root/'world-raid-offline438-sw.js').read_text().replace('build438','build439'))
assets=set(json.loads((root/'world-raid-offline438-assets.json').read_text()));assets.update('./'+x for x in changed);assets.add('./src/Styles/build439-growth.css');assets.add('./assets/ui/build439/growth-medallion.png');(root/'world-raid-offline439-assets.json').write_text(json.dumps(sorted(assets),indent=2)+'\n')
(root/'docs/build439/changed-runtime.json').write_text(json.dumps(changed,indent=2))
