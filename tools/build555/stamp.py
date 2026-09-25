"""Register Build555 without dropping historical import-map aliases."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
old='3.1.233-build554';new='3.1.234-build555'
p=root/'index.html';s=p.read_text();match=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);data=json.loads(match.group(1));mapping=data['imports']
for key,value in list(mapping.items()):
 if old in value:mapping[key]=value.replace(old,new)
for module in (root/'src/ricochet550').glob('*.js'):
 name='./'+str(module.relative_to(root));mapping[name]=name+'?v='+new
for value in list(mapping.values()):
 if new in value:mapping[value]=value
s=s[:match.start(1)]+'\n'+json.dumps(data,ensure_ascii=False,indent=2)+'\n'+s[match.end(1):]
s=s.replace('world-raid-offline554-sw.js','world-raid-offline555-sw.js').replace('const ASSET_VERSION = "3.1.233"','const ASSET_VERSION = "3.1.234"').replace('const ASSET_BUILD = "build554"','const ASSET_BUILD = "build555"')
if 'href="./src/Styles/build555-impact.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./src/Styles/build555-impact.css?v='+new+'">\n</head>')
p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.233"','APP_VERSION="3.1.234"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline554','offline555'))
(root/'world-raid-offline555-sw.js').write_text((root/'world-raid-offline554-sw.js').read_text().replace('build554','build555'))
assets=json.loads((root/'world-raid-offline554-assets.json').read_text())
assets=[s.replace(old,new) for s in assets]
for p in [*(root/'src/ricochet550').glob('*.js'),root/'src/Styles/build555-impact.css',*(root/'assets/ricochet555').glob('*.png')]:
 name='./'+str(p.relative_to(root));url=name+('?v='+new if p.suffix in {'.js','.css'} else '')
 if not any(v.split('?')[0]==name for v in assets):assets.append(url)
(root/'world-raid-offline555-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
