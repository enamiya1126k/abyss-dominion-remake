"""Register the Build552 modules/assets without dropping historical import aliases."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
p=root/'index.html';s=p.read_text();match=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);data=json.loads(match.group(1));mapping=data['imports']
for key,value in list(mapping.items()):
 if '3.1.230-build551' in value:mapping[key]=value.replace('3.1.230-build551','3.1.231-build552')
for module in (root/'src/ricochet550').glob('*.js'):
 name='./'+str(module.relative_to(root));mapping[name]=name+'?v=3.1.231-build552'
for value in list(mapping.values()):
 if '3.1.231-build552' in value:mapping[value]=value
s=s[:match.start(1)]+'\n'+json.dumps(data,ensure_ascii=False,indent=2)+'\n'+s[match.end(1):]
s=s.replace('world-raid-offline551-sw.js','world-raid-offline552-sw.js').replace('const ASSET_VERSION = "3.1.230"','const ASSET_VERSION = "3.1.231"').replace('const ASSET_BUILD = "build551"','const ASSET_BUILD = "build552"')
if 'href="./src/Styles/build552-carnival.css' not in s:
 s=s.replace('</head>','<link rel="stylesheet" href="./src/Styles/build552-carnival.css?v=3.1.231-build552">\n</head>')
p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('3.1.230','3.1.231'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline551','offline552'))
(root/'world-raid-offline552-sw.js').write_text((root/'world-raid-offline551-sw.js').read_text().replace('build551','build552'))
assets=json.loads((root/'world-raid-offline551-assets.json').read_text())
assets=[s.replace('3.1.230-build551','3.1.231-build552') for s in assets]
for p in [*(root/'src/ricochet550').glob('*.js'),root/'src/Styles/build552-carnival.css',*(root/'assets/ricochet552').glob('*.png')]:
 name='./'+str(p.relative_to(root));url=name+('?v=3.1.231-build552' if p.suffix in {'.js','.css'} else '')
 if not any(v.split('?')[0]==name for v in assets):assets.append(url)
(root/'world-raid-offline552-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
