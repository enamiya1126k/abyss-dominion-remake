from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline556';new='3.1.236-build557'
p=root/'index.html';s=p.read_text();m=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);d=json.loads(m.group(1));mapping=d['imports']
changed={'./'+str(p.relative_to(root)) for p in (root/'src').rglob('*.js') if not (base/p.relative_to(root)).exists() or p.read_bytes()!=(base/p.relative_to(root)).read_bytes()}
changed.update('./'+str(p.relative_to(root)) for p in (root/'src/cart').glob('*.js'))
changed.update({'./src/core/config.js','./src/worldRaid/WorldRaidOfflineCache430.js'})
for k,v in list(mapping.items()):
 if v.split('?')[0] in changed:mapping[k]=v.split('?')[0]+'?v='+new
for name in changed:mapping[name]=name+'?v='+new;mapping[name+'?v='+new]=name+'?v='+new
s=s[:m.start(1)]+'\n'+json.dumps(d,ensure_ascii=False,indent=2)+'\n'+s[m.end(1):]
s=s.replace('world-raid-offline556-sw.js','world-raid-offline557-sw.js').replace('const ASSET_VERSION = "3.1.235"','const ASSET_VERSION = "3.1.236"').replace('const ASSET_BUILD = "build556"','const ASSET_BUILD = "build557"')
if 'href="./src/Styles/build557-cart-parking.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./src/Styles/build557-cart-parking.css?v='+new+'">\n</head>')
p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.235"','APP_VERSION="3.1.236"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline556','offline557'))
(root/'world-raid-offline557-sw.js').write_text((root/'world-raid-offline556-sw.js').read_text().replace('build556','build557'))
assets=json.loads((root/'world-raid-offline556-assets.json').read_text());assets=[s.split('?')[0]+'?v='+new if s.split('?')[0] in changed else s for s in assets]
for p in [*(root/'src/cart').glob('*.js'),root/'src/Styles/build557-cart-parking.css',*(root/'assets/cart557').glob('*.png')]:
 name='./'+str(p.relative_to(root));url=name+('?v='+new if p.suffix in {'.js','.css'} else '')
 if not any(v.split('?')[0]==name for v in assets):assets.append(url)
(root/'world-raid-offline557-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
