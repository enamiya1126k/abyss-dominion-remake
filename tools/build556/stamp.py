from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline555';new='3.1.235-build556'
p=root/'index.html';s=p.read_text();m=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);d=json.loads(m.group(1));mapping=d['imports']
changed={'./'+str(p.relative_to(root)) for p in (root/'src').rglob('*.js') if not (base/p.relative_to(root)).exists() or p.read_bytes()!=(base/p.relative_to(root)).read_bytes()}
changed.update('./'+str(p.relative_to(root)) for p in (root/'src/cart').glob('*.js'))
changed.update({'./src/core/config.js','./src/worldRaid/WorldRaidOfflineCache430.js'})
for k,v in list(mapping.items()):
 if v.split('?')[0] in changed:mapping[k]=v.split('?')[0]+'?v='+new
for name in changed:mapping[name]=name+'?v='+new;mapping[name+'?v='+new]=name+'?v='+new
s=s[:m.start(1)]+'\n'+json.dumps(d,ensure_ascii=False,indent=2)+'\n'+s[m.end(1):]
s=s.replace('world-raid-offline555-sw.js','world-raid-offline556-sw.js').replace('const ASSET_VERSION = "3.1.234"','const ASSET_VERSION = "3.1.235"').replace('const ASSET_BUILD = "build555"','const ASSET_BUILD = "build556"')
if 'href="./src/Styles/build556-cart-courses.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./src/Styles/build556-cart-courses.css?v='+new+'">\n</head>')
p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.234"','APP_VERSION="3.1.235"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline555','offline556'))
(root/'world-raid-offline556-sw.js').write_text((root/'world-raid-offline555-sw.js').read_text().replace('build555','build556'))
assets=json.loads((root/'world-raid-offline555-assets.json').read_text());assets=[s.split('?')[0]+'?v='+new if s.split('?')[0] in changed else s for s in assets]
for p in [*(root/'src/cart').glob('*.js'),root/'src/Styles/build556-cart-courses.css',*(root/'assets/cart556').glob('*.png')]:
 name='./'+str(p.relative_to(root));url=name+('?v='+new if p.suffix in {'.js','.css'} else '')
 if not any(v.split('?')[0]==name for v in assets):assets.append(url)
(root/'world-raid-offline556-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
